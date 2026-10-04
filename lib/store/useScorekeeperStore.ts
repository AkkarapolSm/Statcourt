import { create } from "zustand";
import { EventType, Match, MatchEvent, Team, RosterPlayer } from "@/lib/types";
import { mockMatch, mockTeams } from "@/lib/db/seed-data";
import {
  enqueueScorekeeperEvent,
  dequeueScorekeeperEvent,
  getPendingOfflineCount,
  getPendingOfflineEvents,
  updateQueuedEventRetry,
  exportOfflineEventsJson,
  isQueueApproachingCapacity,
  markEventsSynced,
} from "@/lib/offline/db";

export interface ReversibleEvent {
  event: MatchEvent;
  registeredAtMs: number;
}

interface ScorekeeperState {
  match: Match;
  loadMatch: (matchId: string) => Promise<boolean>;
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
  isQueueWarning: boolean;

  // Actions
  toggleClock: () => void;
  resetClock: (seconds?: number) => void;
  setQuarter: (quarter: number) => void;
  selectPlayer: (teamId: string, athleteId: string) => void;
  recordAction: (actionType: EventType) => Promise<boolean>;
  reverseAction: (eventId: string) => Promise<boolean>;
  setOnlineStatus: (online: boolean) => void;
  substitutePlayer: (teamId: string, outId: string, inId: string) => void;
  syncPendingOfflineEvents: () => Promise<void>;
  exportOfflineLedger: () => Promise<string>;
}

export const useScorekeeperStore = create<ScorekeeperState>((set, get) => ({
  match: JSON.parse(JSON.stringify(mockMatch)),
  loadMatch: async (matchId) => {
    try {
      const response = await fetch(`/api/matches/${encodeURIComponent(matchId)}`, { cache: "no-store" });
      if (!response.ok) return false;
      const payload = await response.json();
      if (!payload.success || !payload.data) return false;
      const data = payload.data;
      const activeEvents = Array.isArray(data.events)
        ? data.events.filter((event: { reversedAt?: string | null }) => !event.reversedAt)
        : [];

      const normalizeRoster = (rawTeam: any, teamId: string): RosterPlayer[] => {
        const fallbackTeam = mockTeams.find((t) => t.id === teamId || t.name === rawTeam?.name);
        const fallbackRoster = fallbackTeam ? fallbackTeam.roster : [];

        let players: RosterPlayer[] = [];

        if (Array.isArray(rawTeam?.roster)) {
          players = rawTeam.roster.map((member: any, index: number) => {
            const athleteId = member.athleteId || member.id;
            const events = activeEvents.filter((event: { athleteId: string }) => event.athleteId === athleteId);
            const firstName = member.athlete?.firstName || member.firstName || `Player`;
            const lastName = member.athlete?.lastName || member.lastName || `${member.jerseyNumber ?? index + 1}`;
            const position = member.athlete?.primaryPosition || member.position || "POINT_GUARD";
            const heightCm = member.athlete?.heightCm || member.heightCm || 185;
            const points = events.reduce((sum: number, event: { points: number }) => sum + (event.points || 0), 0) + (member.points || 0);
            const fouls = events.filter((event: { eventType: string }) => ["PERSONAL_FOUL", "TECHNICAL_FOUL"].includes(event.eventType)).length + (member.fouls || 0);
            return {
              athleteId,
              jerseyNumber: member.jerseyNumber ?? index + 1,
              firstName,
              lastName,
              position,
              heightCm,
              points,
              fouls,
              isOnCourt: member.isOnCourt !== undefined ? member.isOnCourt : index < 5,
            };
          });
        }

        // Ensure 12 players from fallback or generated
        if (players.length < 12) {
          const existingIds = new Set(players.map((p) => p.athleteId));
          const existingNumbers = new Set(players.map((p) => p.jerseyNumber));

          for (const fb of fallbackRoster) {
            if (players.length >= 12) break;
            if (!existingIds.has(fb.athleteId) && !existingNumbers.has(fb.jerseyNumber)) {
              players.push({
                ...fb,
                isOnCourt: false,
              });
              existingIds.add(fb.athleteId);
              existingNumbers.add(fb.jerseyNumber);
            }
          }

          const defaultPositions: RosterPlayer["position"][] = ["POINT_GUARD", "SHOOTING_GUARD", "SMALL_FORWARD", "POWER_FORWARD", "CENTER"];
          const thaiNames = [
            { f: "Kittipong", l: "Sanit" },
            { f: "Nattakit", l: "Prasert" },
            { f: "Chanon", l: "Kongpan" },
            { f: "Teerasak", l: "Klinhom" },
            { f: "Panupong", l: "Wichaidit" },
            { f: "Anucha", l: "Charoen" },
            { f: "Sorawit", l: "Petchkham" },
          ];
          let nameIdx = 0;
          let numCandidate = 1;
          while (players.length < 12) {
            while (existingNumbers.has(numCandidate)) numCandidate++;
            const name = thaiNames[nameIdx % thaiNames.length];
            const newPlayer: RosterPlayer = {
              athleteId: `ath-bench-${teamId}-${numCandidate}`,
              jerseyNumber: numCandidate,
              firstName: name.f,
              lastName: name.l,
              position: defaultPositions[players.length % defaultPositions.length],
              heightCm: 185 + (players.length % 15),
              points: 0,
              fouls: 0,
              isOnCourt: false,
            };
            players.push(newPlayer);
            existingNumbers.add(numCandidate);
            nameIdx++;
          }
        }

        if (players.length > 12) {
          const onCourt = players.filter((p) => p.isOnCourt);
          const bench = players.filter((p) => !p.isOnCourt);
          players = [...onCourt.slice(0, 5), ...bench.slice(0, 7)];
          while (players.length < 12 && bench[players.length - 5]) {
            players.push(bench[players.length - 5]);
          }
        }

        const onCourtCount = players.filter((p) => p.isOnCourt).length;
        if (onCourtCount !== 5) {
          players = players.map((p, idx) => ({
            ...p,
            isOnCourt: idx < 5,
          }));
        }

        return players;
      };

      const toTeam = (team: typeof data.homeTeam, teamId: string): Team => ({
        id: team?.id || teamId,
        name: team?.name || "ทีมแข่งขัน",
        shortName: team?.shortName || team?.name || "TEAM",
        institution: team?.institution || "",
        logoUrl: team?.logoUrl || "",
        primaryColor: team?.primaryColor || "#1E3A8A",
        roster: normalizeRoster(team, team?.id || teamId),
      });

      const match: Match = {
        id: data.id,
        tournamentId: data.tournamentId,
        tournamentName: data.tournament?.name || data.tournamentName || "TOA Youth Basketball League Thailand 2026",
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        homeTeam: toTeam(data.homeTeam, data.homeTeamId),
        awayTeam: toTeam(data.awayTeam, data.awayTeamId),
        homeScore: data.homeScore ?? 0,
        awayScore: data.awayScore ?? 0,
        currentQuarter: data.currentQuarter ?? 1,
        gameClockSec: data.gameClockSec ?? 600,
        status: data.status || "SCHEDULED",
        rawVideoUrl: data.rawVideoUrl,
        scoresheetPhotoUrl: data.scoresheetPhotoUrl,
        events: activeEvents,
        createdAt: data.createdAt,
      };

      const firstPlayer = match.homeTeam.roster.find((p) => p.isOnCourt) || match.homeTeam.roster[0];
      const pendingSyncCount = await getPendingOfflineCount();
      set({
        match,
        pendingSyncCount,
        selectedPlayer: firstPlayer ? {
          teamId: match.homeTeamId,
          athleteId: firstPlayer.athleteId,
          jerseyNumber: firstPlayer.jerseyNumber,
          name: `${firstPlayer.firstName} ${firstPlayer.lastName}`,
        } : null,
        reversalRail: [],
        isClockRunning: false,
      });
      return true;
    } catch (err) {
      console.error("[useScorekeeperStore.loadMatch ERROR]:", err);
      if (matchId === "match-bcc-ds-01" || matchId === mockMatch.id) {
        set({
          match: JSON.parse(JSON.stringify(mockMatch)),
          selectedPlayer: {
            teamId: mockMatch.homeTeamId,
            athleteId: mockMatch.homeTeam.roster[0].athleteId,
            jerseyNumber: mockMatch.homeTeam.roster[0].jerseyNumber,
            name: `${mockMatch.homeTeam.roster[0].firstName} ${mockMatch.homeTeam.roster[0].lastName}`,
          },
          reversalRail: [],
          isClockRunning: false,
        });
        return true;
      }
      return false;
    }
  },
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
  isQueueWarning: false,

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
      fetch(`/api/matches/${match.id}/live`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    if (!selectedPlayer) return false;

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
        const res = await fetch(`/api/matches/${match.id}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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

        if (res.status === 401 || res.status === 403 || res.status === 409) {
          await dequeueScorekeeperEvent(newEvent.id);
          set({ pendingSyncCount: await getPendingOfflineCount() });
          return false;
        }
        if (res.ok) {
          // If server successfully saved event, remove from offline queue
          await dequeueScorekeeperEvent(newEvent.id);
        }

        if (res.ok) {
          fetch(`/api/matches/${match.id}/live`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "RECORD_EVENT", eventId: newEvent.id }),
          }).catch((err) => console.warn("Live broadcast event sync warning:", err));
        }
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
    return true;
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
      const result = await fetch(`/api/matches/${match.id}/events?eventId=${encodeURIComponent(eventId)}`, {
        method: "DELETE",
      });
      if (!result.ok) return false;
      fetch(`/api/matches/${match.id}/live`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REVERSE_EVENT", eventId }),
      }).catch((err) => console.warn("Live broadcast reverse sync warning:", err));
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

  exportOfflineLedger: async () => {
    const { match } = get();
    return await exportOfflineEventsJson(match.id);
  },

  syncPendingOfflineEvents: async () => {
    const { match } = get();
    if (typeof window === "undefined" || !navigator.onLine) return;

    try {
      const pendingEvents = await getPendingOfflineEvents();
      if (pendingEvents.length === 0) {
        set({ pendingSyncCount: 0, isQueueWarning: false });
        return;
      }

      // Try bulk import first if multiple events exist
      if (pendingEvents.length >= 2) {
        try {
          const res = await fetch(`/api/matches/${match.id}/events/import`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              events: pendingEvents.map((p) => ({
                ...p.event,
                clientEventId: p.id,
              })),
            }),
          });
          if (res.ok) {
            await markEventsSynced(pendingEvents.map((p) => p.id));
            const count = await getPendingOfflineCount();
            set({ pendingSyncCount: count, isQueueWarning: false });
            return;
          }
        } catch {
          // Fall through to individual sync
        }
      }

      for (const item of pendingEvents) {
        const ev = item.event;
        try {
          const res = await fetch(`/api/matches/${ev.matchId || match.id}/events`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
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
      const isWarning = await isQueueApproachingCapacity();
      set({ pendingSyncCount: count, isQueueWarning: isWarning });
    } catch (err) {
      console.error("Failed to sync offline scorekeeper queue:", err);
    }
  },

  substitutePlayer: (teamId: string, outId: string, inId: string) => {
    const { match, selectedPlayer } = get();
    const isHome = teamId === match.homeTeamId;
    const team = isHome ? { ...match.homeTeam } : { ...match.awayTeam };

    let inPlayerObj: RosterPlayer | undefined;

    team.roster = team.roster.map((p) => {
      if (p.athleteId === outId) return { ...p, isOnCourt: false };
      if (p.athleteId === inId) {
        inPlayerObj = { ...p, isOnCourt: true };
        return inPlayerObj;
      }
      return p;
    });

    const nextSelected =
      selectedPlayer && selectedPlayer.athleteId === outId && inPlayerObj
        ? {
            teamId,
            athleteId: inPlayerObj.athleteId,
            jerseyNumber: inPlayerObj.jerseyNumber,
            name: `${inPlayerObj.firstName} ${inPlayerObj.lastName}`,
          }
        : selectedPlayer;

    set({
      match: {
        ...match,
        homeTeam: isHome ? team : match.homeTeam,
        awayTeam: !isHome ? team : match.awayTeam,
      },
      selectedPlayer: nextSelected,
    });

    if (typeof window !== "undefined") {
      fetch(`/api/matches/${match.id}/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBSTITUTION",
          teamId,
          outAthleteId: outId,
          inAthleteId: inId,
        }),
      }).catch(() => {});
    }
  },
}));
