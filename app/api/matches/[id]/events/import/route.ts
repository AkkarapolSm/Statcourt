import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOfficial } from "@/lib/auth/serverAuth";
import { requestOriginAllowed } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const eventPoints: Record<string, number> = {
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const auth = await requireOfficial(request, params.id);
  if (!auth.authorized || !auth.official || !auth.userId) {
    return auth.response;
  }

  const matchId = params.id;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      homeTeamId: true,
      awayTeamId: true,
      resultStatus: true,
      homeScore: true,
      awayScore: true,
    },
  });

  if (!match) {
    return NextResponse.json({ error: "ไม่พบการแข่งขัน" }, { status: 404 });
  }

  if (match.resultStatus !== "DRAFT") {
    return NextResponse.json(
      { error: "ผลการแข่งขันถูกล็อกแล้ว ไม่สามารถซิงค์เหตุการณ์ย้อนหลังได้" },
      { status: 409 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON ไม่ถูกต้อง" }, { status: 400 });
  }

  const events: any[] = Array.isArray(body.events) ? body.events : [];
  if (events.length === 0) {
    return NextResponse.json(
      { success: false, error: "ไม่พบรายการเหตุการณ์ที่ต้องการนำเข้า (Empty events array)" },
      { status: 400 }
    );
  }

  let importedCount = 0;
  let duplicateCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  try {
    const result = await prisma.$transaction(async (tx) => {
      let currentHomePoints = 0;
      let currentAwayPoints = 0;

      for (const ev of events) {
        const eventKey = String(ev.clientEventId || ev.id || "").trim();
        const eventType = String(ev.eventType || "").trim();
        const teamId = String(ev.teamId || "").trim();
        const athleteId = String(ev.athleteId || "").trim();
        const quarter = Number(ev.quarter);
        const clock = String(ev.gameClockDisplay || "10:00").trim();
        const points = eventPoints[eventType] ?? 0;

        if (!eventKey || !(eventType in eventPoints)) {
          failedCount++;
          errors.push(`เหตุการณ์ ${eventKey || "unknown"}: ชนิดเหตุการณ์ไม่ถูกต้อง`);
          continue;
        }

        // Check if event already exists
        const existing = await tx.matchEvent.findUnique({
          where: { id: eventKey },
          select: { id: true },
        });

        if (existing) {
          duplicateCount++;
          continue;
        }

        // Validate team
        if (teamId && teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
          failedCount++;
          errors.push(`เหตุการณ์ ${eventKey}: ทีมไม่อยู่ในการแข่งขัน`);
          continue;
        }

        await tx.matchEvent.create({
          data: {
            id: eventKey,
            matchId,
            officialId: auth.official!.officialId,
            athleteId: athleteId || null,
            teamId: teamId || null,
            eventType,
            points,
            quarter: quarter || 1,
            gameClockDisplay: clock,
            isVerified: true,
          },
        });

        if (points > 0) {
          if (teamId === match.homeTeamId) currentHomePoints += points;
          else if (teamId === match.awayTeamId) currentAwayPoints += points;
        }

        importedCount++;
      }

      // Update match total scores if new points were imported
      if (currentHomePoints > 0 || currentAwayPoints > 0) {
        await tx.match.update({
          where: { id: matchId },
          data: {
            homeScore: { increment: currentHomePoints },
            awayScore: { increment: currentAwayPoints },
          },
        });
      }

      // Create audit log for offline reconciliation
      await tx.auditLog.create({
        data: {
          userId: auth.userId!,
          action: "OFFLINE_EVENTS_RECONCILED",
          targetEntity: "Match",
          targetId: matchId,
          metadataJson: JSON.stringify({
            importedCount,
            duplicateCount,
            failedCount,
            addedHomePoints: currentHomePoints,
            addedAwayPoints: currentAwayPoints,
          }),
        },
      });

      return {
        importedCount,
        duplicateCount,
        failedCount,
        addedHomePoints: currentHomePoints,
        addedAwayPoints: currentAwayPoints,
      };
    });

    const updatedMatch = await prisma.match.findUnique({
      where: { id: matchId },
      select: { homeScore: true, awayScore: true },
    });

    return NextResponse.json({
      success: true,
      message: `กระทบยอดเหตุการณ์ออฟไลน์สำเร็จ: นำเข้าใหม่ ${result.importedCount} รายการ, ข้ามรายการซ้ำ ${result.duplicateCount} รายการ`,
      data: {
        ...result,
        errors,
        currentHomeScore: updatedMatch?.homeScore ?? match.homeScore,
        currentAwayScore: updatedMatch?.awayScore ?? match.awayScore,
      },
    });
  } catch (error) {
    console.error("[OFFLINE EVENT IMPORT API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการประมวลผลการกระทบยอดข้อมูลออฟไลน์" },
      { status: 500 }
    );
  }
}
