import { NextRequest, NextResponse } from "next/server";
import {
  getLiveState,
  updateLiveState,
  addLiveChatMessage,
  LivePlayEvent,
} from "@/lib/live/liveMatchBroker";
import { prisma } from "@/lib/db/prisma";
import { requireOfficial } from "@/lib/auth/serverAuth";
import { requestOriginAllowed, getSessionUser } from "@/lib/auth/session";
import {
  recordMatchEventCommand,
  reverseMatchEventCommand,
  reconcileMatchScore,
} from "@/lib/live/matchCommandHandler";

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
        error: "เกิดข้อผิดพลาดในการดึงข้อมูลสด (Failed to fetch live match state)",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requestOriginAllowed(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "JSON ไม่ถูกต้อง (Malformed JSON)" }, { status: 400 });
  }

  try {
    const matchId = params.id;
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    // Protect all state modifications with official table authorization
    let officialAuth: any = null;
    if (action !== "SEND_CHAT") {
      officialAuth = await requireOfficial(request, matchId);
      if (!officialAuth.authorized || !officialAuth.official || !officialAuth.userId) {
        return officialAuth.response!;
      }
      const match = await prisma.match.findUnique({ where: { id: matchId }, select: { resultStatus: true } });
      if (!match || match.resultStatus !== "DRAFT") {
        return NextResponse.json({ error: "ผลแข่งขันถูกล็อกหรือไม่พบแมตช์" }, { status: 409 });
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
        const eventId = String(body.eventId || body.clientEventId || "");
        if (body.eventType && body.athleteId && body.teamId) {
          // Direct execution through unified command handler
          const cmdResult = await recordMatchEventCommand({
            matchId,
            clientEventId: eventId,
            officialId: officialAuth.official!.officialId,
            userId: officialAuth.userId!,
            teamId: String(body.teamId),
            athleteId: String(body.athleteId),
            eventType: String(body.eventType),
            points: Number(body.points || 0),
            quarter: Number(body.quarter || 1),
            gameClockDisplay: String(body.gameClockDisplay || "10:00"),
            videoElapsedSec: body.videoElapsedSec == null ? null : Number(body.videoElapsedSec),
          });
          if (!cmdResult.success) {
            return NextResponse.json({ success: false, error: cmdResult.error }, { status: cmdResult.statusCode });
          }
          updatedState = await getLiveState(matchId);
          break;
        }

        // Linking existing event
        const event = await prisma.matchEvent.findUnique({
          where: { id: eventId },
          include: { athlete: { select: { firstName: true, lastName: true, jerseyNumber: true } } },
        });
        if (!event || event.matchId !== matchId || event.reversedAt) {
          return NextResponse.json({ error: "บันทึกเหตุการณ์ก่อนส่งผลสด" }, { status: 409 });
        }
        const savedMatch = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
        const play: LivePlayEvent = {
          id: event.id,
          quarterClock: event.gameClockDisplay,
          videoTimeSec: event.videoElapsedSec || 0,
          playerName: event.athlete ? `${event.athlete.firstName} ${event.athlete.lastName}` : "Player",
          jerseyNumber: event.athlete?.jerseyNumber || 0,
          team: event.teamId === savedMatch.homeTeamId ? "HOME" : "AWAY",
          eventType: event.eventType,
          points: event.points,
          title: event.eventType.replace(/_/g, " "),
          description: "",
          createdAt: event.createdAt.toISOString(),
        };
        updatedState = await updateLiveState(matchId, (prev) => ({
          homeTeam: { ...prev.homeTeam, score: savedMatch.homeScore },
          awayTeam: { ...prev.awayTeam, score: savedMatch.awayScore },
          lastEvent: play,
          recentEvents: [play, ...prev.recentEvents.filter((item) => item.id !== play.id)].slice(0, 30),
        }));
        break;
      }

      case "REVERSE_EVENT": {
        const eventId = String(body.eventId || "");
        const revResult = await reverseMatchEventCommand({
          matchId,
          eventId,
          officialId: officialAuth.official!.officialId,
          userId: officialAuth.userId!,
        });
        if (!revResult.success) {
          return NextResponse.json({ success: false, error: revResult.error }, { status: revResult.statusCode });
        }
        updatedState = await getLiveState(matchId);
        break;
      }

      case "RECONCILE_SCORE": {
        const reconResult = await reconcileMatchScore(matchId);
        updatedState = await getLiveState(matchId);
        return NextResponse.json({
          success: true,
          data: reconResult,
          message: "Scores reconciled against database ledger",
        });
      }
      // 6. Real-time Live Chat
      case "SEND_CHAT": {
        const { sender, badge, badgeType, text } = body;
        const rawText = typeof text === "string" ? text.trim() : "";
        if (!rawText || rawText.length === 0) {
          return NextResponse.json(
            { success: false, error: "ข้อความไม่สามารถว่างเปล่าได้ (Chat message cannot be empty)" },
            { status: 400 }
          );
        }
        if (rawText.length > 150) {
          return NextResponse.json(
            { success: false, error: "ข้อความแชทยาวเกินไป (สูงสุด 150 ตัวอักษร)" },
            { status: 400 }
          );
        }

        const sessionUser = await getSessionUser(request);
        const privilegedBadges = ["OFFICIAL", "STAFF", "REFEREE", "ADMIN", "COMMISSIONER"];
        const requestedBadge = String(badge || badgeType || "FAN").toUpperCase();

        let verifiedBadge = "FAN";
        let verifiedBadgeType = badgeType || "FAN";
        let verifiedSender = sender ? String(sender).slice(0, 40) : "ผู้ชมทั่วไป (Fan)";

        if (sessionUser) {
          if (sessionUser.role === "ADMIN") {
            verifiedBadge = requestedBadge === "OFFICIAL" ? "OFFICIAL" : "ADMIN";
            verifiedBadgeType = "ADMIN";
            verifiedSender = sessionUser.displayName || sessionUser.email || "Admin";
          } else if (sessionUser.role === "OFFICIAL") {
            verifiedBadge = "OFFICIAL";
            verifiedBadgeType = "OFFICIAL";
            verifiedSender = sessionUser.displayName || "Official";
          } else if (sessionUser.role === "COACH") {
            verifiedBadge = "COACH";
            verifiedBadgeType = "COACH";
            verifiedSender = sessionUser.displayName || "Coach";
          } else {
            verifiedBadge = privilegedBadges.includes(requestedBadge) ? "FAN" : requestedBadge.slice(0, 16);
            verifiedSender = sessionUser.displayName || sender || "Member";
          }
        } else {
          // Unauthenticated guest: never allow spoofed official/referee/admin badges
          verifiedBadge = "FAN";
          if (/official|referee|admin|staff|ผู้ดูแลระบบ|กรรมการ/i.test(verifiedSender)) {
            verifiedSender = "ผู้ชมทั่วไป (Fan)";
          }
        }

        const newMsg = await addLiveChatMessage(matchId, {
          sender: verifiedSender,
          badge: verifiedBadge,
          badgeType: verifiedBadgeType,
          text: rawText,
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
        error: "เกิดข้อผิดพลาดในการประมวลผลคำขอ (Internal Server Error)",
      },
      { status: 500 }
    );
  }
}
