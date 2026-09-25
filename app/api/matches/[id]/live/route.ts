import { NextRequest, NextResponse } from "next/server";
import {
  getLiveState,
  updateLiveState,
  addLiveChatMessage,
  LivePlayEvent,
} from "@/lib/live/liveMatchBroker";
import { prisma } from "@/lib/db/prisma";
import { requireOfficial } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;
    const state = await getLiveState(matchId);

    return NextResponse.json({
      success: true,
      data: state,
      source: "LIVE_BROKER",
    });
  } catch (error) {
    console.error("[API LIVE GET ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch live match state",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    // Protect all state modifications with official table authorization
    if (action !== "SEND_CHAT") {
      const auth = requireOfficial(request, matchId);
      if (!auth.authorized) {
        return auth.response!;
      }
    }

    let updatedState;

    switch (action) {
      // 1. Clock synchronization from table console
      case "CLOCK_SYNC": {
        const { gameClockSec, isClockRunning } = body;
        updatedState = await updateLiveState(matchId, (prev) => ({
          gameClockSec: gameClockSec !== undefined ? Number(gameClockSec) : prev.gameClockSec,
          isClockRunning: isClockRunning !== undefined ? Boolean(isClockRunning) : prev.isClockRunning,
        }));
        break;
      }

      // 2. Shot clock update (24s / 14s / custom)
      case "SHOT_CLOCK": {
        const { shotClockSec } = body;
        updatedState = await updateLiveState(matchId, {
          shotClockSec: Number(shotClockSec),
        });
        break;
      }

      // 3. Quarter transition
      case "SET_QUARTER": {
        const { quarter, gameClockSec = 600 } = body;
        updatedState = await updateLiveState(matchId, {
          quarter: Number(quarter),
          gameClockSec: Number(gameClockSec),
          isClockRunning: false,
        });

        // Async persist to DB
        prisma.match.update({
          where: { id: matchId },
          data: { currentQuarter: Number(quarter), gameClockSec: Number(gameClockSec) },
        }).catch((err) => console.warn("[DB UPDATE QUARTER WARN]", err));
        break;
      }

      // 4. Official records an event (+1, +2, +3, Foul, Turnover, Steal, etc.)
      case "RECORD_EVENT": {
        const {
          athleteId,
          athleteName,
          jerseyNumber,
          teamId,
          eventType,
          points = 0,
          title,
          description,
          quarter,
          quarterClock,
        } = body;

        const pts = Number(points) || 0;
        const isFoul = eventType === "PERSONAL_FOUL" || eventType === "TECHNICAL_FOUL";

        const newEvent: LivePlayEvent = {
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          quarterClock: quarterClock || "Q4 05:00",
          videoTimeSec: 300,
          playerName: athleteName || "Player",
          jerseyNumber: Number(jerseyNumber) || 0,
          team: teamId === "team-bcc" || teamId === "BCC" ? "BCC" : "DS",
          eventType,
          points: pts,
          title: title || `${eventType.replace(/_/g, " ")} (${pts > 0 ? `+${pts}` : ""})`,
          description: description || `เพลย์โดย ${athleteName} (#${jerseyNumber})`,
          createdAt: new Date().toISOString(),
        };

        updatedState = await updateLiveState(matchId, (prev) => {
          const isHome = teamId === prev.homeTeam.id || teamId === "team-bcc" || teamId === "BCC";

          const newHomeScore = isHome ? prev.homeTeam.score + pts : prev.homeTeam.score;
          const newAwayScore = !isHome ? prev.awayTeam.score + pts : prev.awayTeam.score;

          const updatedPlayerStats = prev.playerStats.map((p) => {
            if (p.athleteId === athleteId || (p.number === Number(jerseyNumber) && p.teamId === teamId)) {
              return {
                ...p,
                pts: p.pts + pts,
                fouls: isFoul ? p.fouls + 1 : p.fouls,
              };
            }
            return p;
          });

          return {
            homeTeam: {
              ...prev.homeTeam,
              score: newHomeScore,
              fouls: isHome && isFoul ? prev.homeTeam.fouls + 1 : prev.homeTeam.fouls,
            },
            awayTeam: {
              ...prev.awayTeam,
              score: newAwayScore,
              fouls: !isHome && isFoul ? prev.awayTeam.fouls + 1 : prev.awayTeam.fouls,
            },
            lastEvent: newEvent,
            recentEvents: [newEvent, ...prev.recentEvents].slice(0, 30),
            playerStats: updatedPlayerStats,
          };
        });

        // Persist to DB asynchronously
        if (pts > 0) {
          const isHome = teamId === "team-bcc" || teamId === "BCC";
          prisma.match.update({
            where: { id: matchId },
            data: {
              homeScore: updatedState.homeTeam.score,
              awayScore: updatedState.awayTeam.score,
            },
          }).catch((err) => console.warn("[DB UPDATE SCORE WARN]", err));
        }
        break;
      }

      // 5. Reversal / Undo event
      case "REVERSE_EVENT": {
        const { eventId, points = 0, teamId, athleteId, isFoul } = body;
        const pts = Number(points) || 0;

        updatedState = await updateLiveState(matchId, (prev) => {
          const isHome = teamId === prev.homeTeam.id || teamId === "team-bcc" || teamId === "BCC";
          const newEvents = prev.recentEvents.filter((e) => e.id !== eventId);

          const updatedPlayerStats = prev.playerStats.map((p) => {
            if (p.athleteId === athleteId) {
              return {
                ...p,
                pts: Math.max(0, p.pts - pts),
                fouls: isFoul ? Math.max(0, p.fouls - 1) : p.fouls,
              };
            }
            return p;
          });

          return {
            homeTeam: {
              ...prev.homeTeam,
              score: isHome ? Math.max(0, prev.homeTeam.score - pts) : prev.homeTeam.score,
              fouls: isHome && isFoul ? Math.max(0, prev.homeTeam.fouls - 1) : prev.homeTeam.fouls,
            },
            awayTeam: {
              ...prev.awayTeam,
              score: !isHome ? Math.max(0, prev.awayTeam.score - pts) : prev.awayTeam.score,
              fouls: !isHome && isFoul ? Math.max(0, prev.awayTeam.fouls - 1) : prev.awayTeam.fouls,
            },
            recentEvents: newEvents,
            lastEvent: newEvents[0],
            playerStats: updatedPlayerStats,
          };
        });

        if (pts > 0) {
          prisma.match.update({
            where: { id: matchId },
            data: {
              homeScore: updatedState.homeTeam.score,
              awayScore: updatedState.awayTeam.score,
            },
          }).catch((err) => console.warn("[DB REVERSE SCORE WARN]", err));
        }
        break;
      }

      // 6. Real-time Live Chat
      case "SEND_CHAT": {
        const { sender, badge, badgeType, text } = body;
        if (!text) {
          return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 });
        }

        const newMsg = await addLiveChatMessage(matchId, {
          sender: sender || "Anonymous Fan",
          badge: badge || badgeType || "FAN",
          badgeType: badgeType || "BCC",
          text,
        });

        return NextResponse.json({
          success: true,
          data: newMsg,
          message: "Chat message broadcasted via SSE",
        });
      }

      // 7. Timeout called
      case "TIMEOUT": {
        const { teamId } = body;
        updatedState = await updateLiveState(matchId, (prev) => {
          const isHome = teamId === prev.homeTeam.id || teamId === "team-bcc" || teamId === "BCC";
          return {
            homeTeam: {
              ...prev.homeTeam,
              timeoutsRemaining: isHome
                ? Math.max(0, prev.homeTeam.timeoutsRemaining - 1)
                : prev.homeTeam.timeoutsRemaining,
            },
            awayTeam: {
              ...prev.awayTeam,
              timeoutsRemaining: !isHome
                ? Math.max(0, prev.awayTeam.timeoutsRemaining - 1)
                : prev.awayTeam.timeoutsRemaining,
            },
            isClockRunning: false,
          };
        });
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action '${action}'` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: updatedState,
      message: `Action ${action} processed and broadcasted via SSE`,
      source: "LIVE_BROKER",
    });
  } catch (error) {
    console.error("[API LIVE POST ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to broadcast live update",
      },
      { status: 500 }
    );
  }
}
