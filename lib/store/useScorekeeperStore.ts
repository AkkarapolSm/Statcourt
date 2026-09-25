import { create } from "zustand";
import { EventType, Match, MatchEvent, Team, RosterPlayer } from "@/lib/types";
import { mockMatch } from "@/lib/db/seed-data";
import {
  enqueueScorekeeperEvent,
  dequeueScorekeeperEvent,
  getPendingOfflineCount,
  getPendingOfflineEvents,
  updateQueuedEventRetry,
} from "@/lib/offline/db";

export interface ReversibleEvent {
  event: MatchEvent;
  registeredAtMs: number;
}

interface ScorekeeperState {
  match: Match;
  isClockRunning: boolean;
  selectedPlayer: {
    teamId: string;
    athleteId: string;
    jerseyNumber: number;
    name: string;
  } | null;
  reversalRail: ReversibleEvent[];
  isOnline: boolean;
  pendingSyncCount: number;

  // Actions
  toggleClock: () => void;
  resetClock: (seconds?: number) => void;
  setQuarter: (quarter: number) => void;
  selectPlayer: (teamId: string, athleteId: string) => void;
  recordAction: (actionType: EventType) => Promise<void>;
  reverseAction: (eventId: string) => Promise<boolean>;
  setOnlineStatus: (online: boolean) => void;
  substitutePlayer: (teamId: string, outId: string, inId: string) => void;
  syncPendingOfflineEvents: () => Promise<void>;
}

function getOfficialToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("statcourt_official_token");
}

export const useScorekeeperStore = create<ScorekeeperState>((set, get) => ({
  match: JSON.parse(JSON.stringify(mockMatch)),
  isClockRunning: false,
  selectedPlayer: {
    teamId: mockMatch.homeTeamId,
    athleteId: mockMatch.homeTeam.roster[0].athleteId,
    jerseyNumber: mockMatch.homeTeam.roster[0].jerseyNumber,
    name: `${mockMatch.homeTeam.roster[0].firstName} ${mockMatch.homeTeam.roster[0].lastName}`,
  },
  reversalRail: mockMatch.events.slice(-5).reverse().map((ev) => ({
    event: ev,
    registeredAtMs: Date.now() - 15000,
  })),
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  pendingSyncCount: 0,

  toggleClock: () => set((state) => ({ isClockRunning: !state.isClockRunning })),

  resetClock: (seconds = 600) =>
    set((state) => ({
      isClockRunning: false,
      match: {
        ...state.match,
        gameClockSec: seconds,
      },
    })),

  setQuarter: (quarter: number) => {
    const { match } = get();
    set((state) => ({
      match: {
        ...state.match,
        currentQuarter: quarter,
        gameClockSec: 600,
      },
      isClockRunning: false,
    }));

    if (typeof window !== "undefined") {
      const token = getOfficialToken();
      fetch(`/api/matches/${match.id}/live`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-official-token": token } : {}),
        },
        body: JSON.stringify({
          action: "SET_QUARTER",
          quarter,
          gameClockSec: 600,
        }),
      }).catch((err) => console.warn("Live broadcast quarter sync warning:", err));
    }
  },

  selectPlayer: (teamId: string, athleteId: string) => {
    const { match } = get();
    const team = teamId === match.homeTeamId ? match.homeTeam : match.awayTeam;
    const player = team.roster.find((p) => p.athleteId === athleteId);
    if (!player) return;

    set({
      selectedPlayer: {
        teamId,
        athleteId,
        jerseyNumber: player.jerseyNumber,
        name: `${player.firstName} ${player.lastName}`,
      },
    });
  },

  recordAction: async (actionType: EventType) => {
    const { match, selectedPlayer, reversalRail } = get();
    if (!selectedPlayer) return;

    let points = 0;
    if (actionType === "TWO_POINT_MADE") points = 2;
    if (actionType === "THREE_POINT_MADE") points = 3;
    if (actionType === "FREE_THROW_MADE") points = 1;

    const mins = Math.floor(match.gameClockSec / 60);
    const secs = match.gameClockSec % 60;
    const clockDisplay = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

    const newEvent: MatchEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      matchId: match.id,
      officialId: "off-01",
      athleteId: selectedPlayer.athleteId,
      teamId: selectedPlayer.teamId,
      eventType: actionType,
      points,
      quarter: match.currentQuarter,
      gameClockDisplay: clockDisplay,
      videoElapsedSec: 600 - match.gameClockSec,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    const isFoul =
      actionType === "PERSONAL_FOUL" || actionType === "TECHNICAL_FOUL";
    const isHome = selectedPlayer.teamId === match.homeTeamId;
    const targetTeam = isHome ? { ...match.homeTeam } : { ...match.awayTeam };

    const updatedRoster = targetTeam.roster.map((player) => {
      if (player.athleteId === selectedPlayer.athleteId) {
        return {
          ...player,
          points: player.points + points,
          fouls: isFoul ? player.fouls + 1 : player.fouls,
        };
      }
      return player;
    });
    targetTeam.roster = updatedRoster;

    const updatedMatch: Match = {
      ...match,
      homeScore: isHome ? match.homeScore + points : match.homeScore,
      awayScore: !isHome ? match.awayScore + points : match.awayScore,
      homeTeam: isHome ? targetTeam : match.homeTeam,
      awayTeam: !isHome ? targetTeam : match.awayTeam,
      events: [...match.events, newEvent],
    };

    // Enqueue to IndexedDB for offline resilience first
    await enqueueScorekeeperEvent(newEvent);

    // If online, immediately sync to backend SQLite via API
    if (get().isOnline && typeof window !== "undefined") {
      try {
        const token = getOfficialToken();
        const res = await fetch(`/api/matches/${match.id}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "x-official-token": token } : {}),
          },
          body: JSON.stringify({
            clientEventId: newEvent.id,
            idempotencyKey: newEvent.id,
            officialId: newEvent.officialId,
            athleteId: newEvent.athleteId,
            teamId: newEvent.teamId,
            eventType: newEvent.eventType,
            points: newEvent.points,
            quarter: newEvent.quarter,
            gameClockDisplay: newEvent.gameClockDisplay,
            videoElapsedSec: newEvent.videoElapsedSec,
          }),
        });

        if (res.ok) {
          // If server successfully saved event, remove from offline queue
          await dequeueScorekeeperEvent(newEvent.id);
        }

        // Live broadcast sync to SSE clients
        fetch(`/api/matches/${match.id}/live`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "x-official-token": token } : {}),
          },
          body: JSON.stringify({
            action: "RECORD_EVENT",
            athleteId: selectedPlayer.athleteId,
            athleteName: selectedPlayer.name,
            jerseyNumber: selectedPlayer.jerseyNumber,
            teamId: selectedPlayer.teamId,
            eventType: actionType,
            points,
            quarter: match.currentQuarter,
            quarterClock: clockDisplay,
          }),
        }).catch((err) => console.warn("Live broadcast event sync warning:", err));
      } catch (err) {
        console.warn("Direct API event sync failed, preserved in offline queue:", err);
      }
    }

    const pendingCount = await getPendingOfflineCount();

    const newReversalEntry: ReversibleEvent = {
      event: newEvent,
      registeredAtMs: Date.now(),
    };

    set({
      match: updatedMatch,
      reversalRail: [newReversalEntry, ...reversalRail.slice(0, 4)],
      pendingSyncCount: pendingCount,
    });
  },

  reverseAction: async (eventId: string) => {
    const { match, reversalRail } = get();
    const entryIndex = reversalRail.findIndex((r) => r.event.id === eventId);
    if (entryIndex === -1) return false;

    const entry = reversalRail[entryIndex];
    // 60-second window check
    const elapsedMs = Date.now() - entry.registeredAtMs;
    if (elapsedMs > 60000) {
      return false;
    }

    const event = entry.event;
    const isHome = event.teamId === match.homeTeamId;
    const targetTeam = isHome ? { ...match.homeTeam } : { ...match.awayTeam };
    const isFoul =
      event.eventType === "PERSONAL_FOUL" ||
      event.eventType === "TECHNICAL_FOUL";

    const rolledBackRoster = targetTeam.roster.map((player) => {
      if (player.athleteId === event.athleteId) {
        return {
          ...player,
          points: Math.max(0, player.points - event.points),
          fouls: isFoul ? Math.max(0, player.fouls - 1) : player.fouls,
        };
      }
      return player;
    });
    targetTeam.roster = rolledBackRoster;

    const updatedMatch: Match = {
      ...match,
      homeScore: isHome
        ? Math.max(0, match.homeScore - event.points)
        : match.homeScore,
      awayScore: !isHome
        ? Math.max(0, match.awayScore - event.points)
        : match.awayScore,
      homeTeam: isHome ? targetTeam : match.homeTeam,
      awayTeam: !isHome ? targetTeam : match.awayTeam,
      events: match.events.filter((e) => e.id !== eventId),
    };

    if (typeof window !== "undefined") {
      const token = getOfficialToken();
      // 1. Sync live broker state
      fetch(`/api/matches/${match.id}/live`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-official-token": token } : {}),
        },
        body: JSON.stringify({
          action: "REVERSE_EVENT",
          eventId,
          points: event.points,
          teamId: event.teamId,
          athleteId: event.athleteId,
          isFoul,
        }),
      }).catch((err) => console.warn("Live broadcast reverse sync warning:", err));

      // 2. Delete event from persistent DB
      fetch(`/api/matches/${match.id}/events?eventId=${eventId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "x-official-token": token } : {}),
        },
      }).catch((err) => console.warn("DB reverse event sync warning:", err));
    }

    await dequeueScorekeeperEvent(eventId);
    const pendingCount = await getPendingOfflineCount();

    set({
      match: updatedMatch,
      reversalRail: reversalRail.filter((r) => r.event.id !== eventId),
      pendingSyncCount: pendingCount,
    });

    return true;
  },

  setOnlineStatus: (online: boolean) => {
    set({ isOnline: online });
    if (online) {
      get().syncPendingOfflineEvents();
    }
  },

  syncPendingOfflineEvents: async () => {
    const { match } = get();
    if (typeof window === "undefined" || !navigator.onLine) return;

    try {
      const pendingEvents = await getPendingOfflineEvents();
      if (pendingEvents.length === 0) return;

      const token = getOfficialToken();

      for (const item of pendingEvents) {
        const ev = item.event;
        try {
          const res = await fetch(`/api/matches/${ev.matchId || match.id}/events`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { "x-official-token": token } : {}),
            },
            body: JSON.stringify({
              clientEventId: item.id,
              idempotencyKey: item.id,
              officialId: ev.officialId,
              athleteId: ev.athleteId,
              teamId: ev.teamId,
              eventType: ev.eventType,
              points: ev.points,
              quarter: ev.quarter,
              gameClockDisplay: ev.gameClockDisplay,
              videoElapsedSec: ev.videoElapsedSec,
            }),
          });

          if (res.ok) {
            await dequeueScorekeeperEvent(item.id);
          } else {
            const errText = await res.text();
            await updateQueuedEventRetry(item.id, `Status ${res.status}: ${errText}`);
          }
        } catch (itemErr) {
          await updateQueuedEventRetry(
            item.id,
            itemErr instanceof Error ? itemErr.message : "Network error"
          );
        }
      }

      const count = await getPendingOfflineCount();
      set({ pendingSyncCount: count });
    } catch (err) {
      console.error("Failed to sync offline scorekeeper queue:", err);
    }
  },

  substitutePlayer: (teamId: string, outId: string, inId: string) => {
    const { match } = get();
    const isHome = teamId === match.homeTeamId;
    const team = isHome ? { ...match.homeTeam } : { ...match.awayTeam };

    team.roster = team.roster.map((p) => {
      if (p.athleteId === outId) return { ...p, isOnCourt: false };
      if (p.athleteId === inId) return { ...p, isOnCourt: true };
      return p;
    });

    set({
      match: {
        ...match,
        homeTeam: isHome ? team : match.homeTeam,
        awayTeam: !isHome ? team : match.awayTeam,
      },
    });
  },
}));
