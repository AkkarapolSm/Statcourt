if (typeof window !== "undefined") {
  throw new Error("Server-only matchCommandHandler cannot be imported on the client side.");
}

import { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../db/prisma.ts";
import {
  updateLiveState,
  broadcastMatchDelta,
  type LivePlayEvent,
} from "./liveMatchBroker.ts";

export const ALLOWED_EVENT_POINTS: Record<string, number> = {
  TWO_POINT_MADE: 2,
  THREE_POINT_MADE: 3,
  FREE_THROW_MADE: 1,
  TWO_POINT_MISSED: 0,
  THREE_POINT_MISSED: 0,
  FREE_THROW_MISSED: 0,
  OFFENSIVE_REBOUND: 0,
  DEFENSIVE_REBOUND: 0,
  ASSIST: 0,
  STEAL: 0,
  BLOCK: 0,
  TURNOVER: 0,
  PERSONAL_FOUL: 0,
  TECHNICAL_FOUL: 0,
};

export interface RecordEventCommandInput {
  matchId: string;
  clientEventId: string;
  officialId: string;
  userId: string;
  teamId: string;
  athleteId: string;
  eventType: string;
  points: number;
  quarter: number;
  gameClockDisplay: string;
  videoElapsedSec?: number | null;
}

export interface ReverseEventCommandInput {
  matchId: string;
  eventId: string;
  officialId: string;
  userId: string;
}

export interface CommandResult<T> {
  success: boolean;
  data?: T;
  isDuplicate?: boolean;
  error?: string;
  statusCode: number;
}

const eventInclude = {
  athlete: { select: { id: true, firstName: true, lastName: true, jerseyNumber: true } },
  official: { select: { id: true, fullName: true, licenseNumber: true } },
} as const;

/**
 * Authoritative Single Command Handler for recording match events.
 * Enforces transactional database commit BEFORE publishing to live broker.
 * Implements atomic score increments, strict idempotency, and audit logging.
 */
export async function recordMatchEventCommand(
  input: RecordEventCommandInput
): Promise<CommandResult<any>> {
  const {
    matchId,
    clientEventId,
    officialId,
    userId,
    teamId,
    athleteId,
    eventType,
    points,
    quarter,
    gameClockDisplay,
    videoElapsedSec,
  } = input;

  // 1. Schema Validation
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(clientEventId)) {
    return { success: false, error: "รหัส clientEventId ไม่ถูกต้องตามเกณฑ์ความปลอดภัย", statusCode: 400 };
  }
  if (!(eventType in ALLOWED_EVENT_POINTS)) {
    return { success: false, error: `ประเภทเหตุการณ์ '${eventType}' ไม่ถูกต้องตามมาตรฐานกติกา`, statusCode: 400 };
  }
  if (points !== ALLOWED_EVENT_POINTS[eventType]) {
    return { success: false, error: `คะแนน ${points} ไม่ตรงกับประเภทเหตุการณ์ ${eventType}`, statusCode: 400 };
  }
  if (!Number.isInteger(quarter) || quarter < 1 || quarter > 10) {
    return { success: false, error: "ควอเตอร์ต้องเป็นตัวเลขจำนวนเต็มระหว่าง 1 ถึง 10", statusCode: 400 };
  }
  if (!/^\d{1,2}:[0-5]\d$/.test(gameClockDisplay)) {
    return { success: false, error: "รูปแบบเวลาแข่งขันต้องเป็น mm:ss", statusCode: 400 };
  }

  // 2. Strict Idempotency Check
  const existing = await prisma.matchEvent.findUnique({
    where: { id: clientEventId },
    include: eventInclude,
  });

  if (existing) {
    if (
      existing.matchId !== matchId ||
      existing.eventType !== eventType ||
      existing.teamId !== teamId ||
      existing.athleteId !== athleteId
    ) {
      return {
        success: false,
        error: "รหัสเหตุการณ์ clientEventId ถูกใช้งานแล้วกับข้อมูลที่แตกต่างกัน (Idempotency Key Conflict)",
        statusCode: 409,
      };
    }
    // Return existing event idempotently without duplicate scoring
    return { success: true, data: existing, isDuplicate: true, statusCode: 200 };
  }

  // 3. Match and Roster Verification
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      homeTeamId: true,
      awayTeamId: true,
      homeScore: true,
      awayScore: true,
      resultStatus: true,
    },
  });

  if (!match) {
    return { success: false, error: "ไม่พบการแข่งขันในระบบ", statusCode: 404 };
  }
  if (match.resultStatus !== "DRAFT") {
    return { success: false, error: "ผลการแข่งขันถูกล็อกแล้ว ไม่สามารถแก้ไขได้", statusCode: 409 };
  }
  if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
    return { success: false, error: "ทีมไม่อยู่ในการแข่งขันแมตช์นี้", statusCode: 400 };
  }

  const roster = await prisma.rosterMember.findUnique({
    where: { teamId_athleteId: { teamId, athleteId } },
    select: { id: true },
  });
  if (!roster) {
    return { success: false, error: "นักกีฬาไม่อยู่ในรายชื่อนักกีฬาของทีม (Roster)", statusCode: 400 };
  }

  // 4. Transactional Atomic Commit
  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Optimistic concurrency lock: confirm match is still DRAFT
      const lockGuard = await tx.match.updateMany({
        where: { id: matchId, resultStatus: "DRAFT" },
        data: { resultStatus: "DRAFT" },
      });
      if (lockGuard.count !== 1) return null;

      // Create durable match event
      const createdEvent = await tx.matchEvent.create({
        data: {
          id: clientEventId,
          matchId,
          officialId,
          athleteId,
          teamId,
          eventType,
          points,
          quarter,
          gameClockDisplay,
          videoElapsedSec: videoElapsedSec == null ? null : Number(videoElapsedSec),
          isVerified: true,
        },
        include: eventInclude,
      });

      // Atomic score increment in database
      let updatedMatchScore: { homeScore: number; awayScore: number } | null = null;
      if (points > 0) {
        const isHome = teamId === match.homeTeamId;
        const updated = await tx.match.update({
          where: { id: matchId },
          data: {
            homeScore: isHome ? { increment: points } : undefined,
            awayScore: !isHome ? { increment: points } : undefined,
          },
          select: { homeScore: true, awayScore: true },
        });
        updatedMatchScore = updated;
      } else {
        const currentMatch = await tx.match.findUnique({
          where: { id: matchId },
          select: { homeScore: true, awayScore: true },
        });
        updatedMatchScore = currentMatch
          ? { homeScore: currentMatch.homeScore, awayScore: currentMatch.awayScore }
          : { homeScore: match.homeScore, awayScore: match.awayScore };
      }

      // Record immutable audit trail
      await tx.auditLog.create({
        data: {
          userId,
          action: "RECORD_EVENT",
          targetEntity: "MatchEvent",
          targetId: createdEvent.id,
          metadataJson: JSON.stringify({ matchId, teamId, eventType, points, clientEventId }),
        },
      });

      return { event: createdEvent, scores: updatedMatchScore };
    });

    if (!transactionResult) {
      return { success: false, error: "ผลการแข่งขันถูกล็อกแล้วในระหว่างการประมวลผล", statusCode: 409 };
    }

    const { event, scores } = transactionResult;

    // 5. Post-Commit Live Broker Delta Broadcast (Commit-Before-Publish Pattern)
    const play: LivePlayEvent = {
      id: event.id,
      quarterClock: event.gameClockDisplay,
      videoTimeSec: event.videoElapsedSec || 0,
      playerName: event.athlete ? `${event.athlete.firstName} ${event.athlete.lastName}` : "Player",
      jerseyNumber: event.athlete?.jerseyNumber || 0,
      team: event.teamId === match.homeTeamId ? "HOME" : "AWAY",
      eventType: event.eventType,
      points: event.points,
      title: event.eventType.replace(/_/g, " "),
      description: "",
      createdAt: event.createdAt.toISOString(),
    };

    // Update broker state and dispatch delta event
    await updateLiveState(matchId, (prev) => ({
      homeTeam: { ...prev.homeTeam, score: scores.homeScore },
      awayTeam: { ...prev.awayTeam, score: scores.awayScore },
      lastEvent: play,
      recentEvents: [play, ...prev.recentEvents.filter((item) => item.id !== play.id)].slice(0, 30),
    }));

    broadcastMatchDelta(matchId, {
      type: "SCORE_EVENT",
      eventId: event.id,
      teamId: event.teamId,
      points: event.points,
      homeScore: scores.homeScore,
      awayScore: scores.awayScore,
      play,
    });

    return { success: true, data: event, statusCode: 201 };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "เหตุการณ์นี้ถูกบันทึกไปแล้ว กรุณาโหลดข้อมูลใหม่", statusCode: 409 };
    }
    console.error("[MATCH COMMAND HANDLER] Record event error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกเหตุการณ์ (Database Transaction Error)", statusCode: 500 };
  }
}

/**
 * Authoritative Single Command Handler for reversing match events (Undo).
 * Retains original event record for auditing, marks reversedAt timestamp,
 * and atomically decrements score in the database before broadcasting delta.
 */
export async function reverseMatchEventCommand(
  input: ReverseEventCommandInput
): Promise<CommandResult<{ reversedEventId: string }>> {
  const { matchId, eventId, userId } = input;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.matchEvent.findUnique({ where: { id: eventId } });
      const match = await tx.match.findUnique({ where: { id: matchId } });

      if (!event || event.matchId !== matchId || !match) return "NOT_FOUND";
      if (match.resultStatus !== "DRAFT" || event.reversedAt) return "LOCKED";

      // Mark reversed without deleting
      const reversed = await tx.matchEvent.updateMany({
        where: { id: event.id, reversedAt: null },
        data: { reversedAt: new Date(), reversedById: userId, isVerified: false },
      });
      if (reversed.count !== 1) return "LOCKED";

      // Atomic score decrement
      let newScores = { homeScore: match.homeScore, awayScore: match.awayScore };
      if (event.points > 0) {
        const isHome = event.teamId === match.homeTeamId;
        const updated = await tx.match.update({
          where: { id: matchId },
          data: {
            homeScore: isHome ? { decrement: event.points } : undefined,
            awayScore: !isHome ? { decrement: event.points } : undefined,
          },
          select: { homeScore: true, awayScore: true },
        });
        newScores = updated;
      }

      // Record audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: "REVERSE_EVENT",
          targetEntity: "MatchEvent",
          targetId: event.id,
          metadataJson: JSON.stringify({ matchId, eventType: event.eventType, points: event.points }),
        },
      });

      return { event, newScores };
    });

    if (result === "NOT_FOUND") {
      return { success: false, error: "ไม่พบเหตุการณ์ที่ต้องการย้อนกลับ", statusCode: 404 };
    }
    if (result === "LOCKED") {
      return { success: false, error: "เหตุการณ์ถูกย้อนกลับแล้ว หรือผลการแข่งขันถูกล็อก", statusCode: 409 };
    }

    const { event, newScores } = result;

    // Post-Commit Broker Update & Delta Broadcast
    await updateLiveState(matchId, (prev) => {
      const recentEvents = prev.recentEvents.filter((item) => item.id !== eventId);
      return {
        homeTeam: { ...prev.homeTeam, score: newScores.homeScore },
        awayTeam: { ...prev.awayTeam, score: newScores.awayScore },
        recentEvents,
        lastEvent: recentEvents[0],
      };
    });

    broadcastMatchDelta(matchId, {
      type: "REVERSE_EVENT",
      eventId,
      homeScore: newScores.homeScore,
      awayScore: newScores.awayScore,
    });

    return { success: true, data: { reversedEventId: eventId }, statusCode: 200 };
  } catch (error) {
    console.error("[MATCH COMMAND HANDLER] Reverse event error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการย้อนกลับเหตุการณ์", statusCode: 500 };
  }
}

/**
 * Authoritative Score Reconciliation Engine.
 * Recalculates total points directly from the durable event ledger (excluding reversed events).
 * Corrects any database or in-memory score drift atomically.
 */
export async function reconcileMatchScore(matchId: string): Promise<{
  matchId: string;
  homeScore: number;
  awayScore: number;
  reconciled: boolean;
  eventCount: number;
}> {
  const result = await prisma.$transaction(async (tx) => {
    const match = await tx.match.findUnique({
      where: { id: matchId },
      select: { id: true, homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true },
    });

    if (!match) throw new Error(`Match ${matchId} not found`);

    const activeEvents = await tx.matchEvent.findMany({
      where: { matchId, reversedAt: null },
      select: { teamId: true, points: true },
    });

    let ledgerHomeScore = 0;
    let ledgerAwayScore = 0;

    for (const ev of activeEvents) {
      if (ev.teamId === match.homeTeamId) {
        ledgerHomeScore += ev.points;
      } else if (ev.teamId === match.awayTeamId) {
        ledgerAwayScore += ev.points;
      }
    }

    const needsReconciliation =
      match.homeScore !== ledgerHomeScore || match.awayScore !== ledgerAwayScore;

    if (needsReconciliation) {
      await tx.match.update({
        where: { id: matchId },
        data: { homeScore: ledgerHomeScore, awayScore: ledgerAwayScore },
      });
    }

    return {
      matchId,
      homeScore: ledgerHomeScore,
      awayScore: ledgerAwayScore,
      reconciled: needsReconciliation,
      eventCount: activeEvents.length,
    };
  });

  if (result.reconciled) {
    await updateLiveState(matchId, (prev) => ({
      homeTeam: { ...prev.homeTeam, score: result.homeScore },
      awayTeam: { ...prev.awayTeam, score: result.awayScore },
    }));

    broadcastMatchDelta(matchId, {
      type: "RECONCILE_SCORE",
      homeScore: result.homeScore,
      awayScore: result.awayScore,
    });
  }

  return result;
}
