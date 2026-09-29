import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserSession } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserSession(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบก่อนจัดการตารางการแข่งขัน" },
        { status: 401 }
      );
    }

    // Role check: Only ADMIN, or OFFICIAL assigned to this match, or tournament organizer
    const isAuthorized = user.role === "ADMIN" || user.role === "OFFICIAL";
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "คุณไม่มีสิทธิ์ในการแก้ไขตารางเวลาการแข่งขัน" },
        { status: 403 }
      );
    }

    const matchId = params.id;
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลแมตช์นี้ในระบบ" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      scheduledAt,
      venue,
      courtName,
      round,
      status,
      postponedReason,
      ignoreConflicts,
    } = body;

    const conflicts: string[] = [];

    // Conflict detection if scheduledAt is provided
    if (scheduledAt) {
      const targetTime = new Date(scheduledAt);
      if (isNaN(targetTime.getTime())) {
        return NextResponse.json(
          { success: false, error: "รูปแบบวันเวลาที่ระบุไม่ถูกต้อง (Invalid Date format)" },
          { status: 400 }
        );
      }

      // 2 hours window for team match conflict
      const teamWindowStart = new Date(targetTime.getTime() - 2 * 60 * 60 * 1000);
      const teamWindowEnd = new Date(targetTime.getTime() + 2 * 60 * 60 * 1000);

      const teamMatches = await prisma.match.findMany({
        where: {
          id: { not: matchId },
          scheduledAt: {
            gte: teamWindowStart,
            lte: teamWindowEnd,
          },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
          OR: [
            { homeTeamId: match.homeTeamId },
            { awayTeamId: match.homeTeamId },
            { homeTeamId: match.awayTeamId },
            { awayTeamId: match.awayTeamId },
          ],
        },
        include: {
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
        },
      });

      if (teamMatches.length > 0) {
        teamMatches.forEach((m) => {
          conflicts.push(
            `ทีมมีคิวแข่งขันชนกัน: ${m.homeTeam.name} vs ${m.awayTeam.name} (${new Date(m.scheduledAt!).toLocaleTimeString("th-TH")})`
          );
        });
      }

      // 90 minutes window for same court conflict
      if (courtName && venue) {
        const courtWindowStart = new Date(targetTime.getTime() - 90 * 60 * 1000);
        const courtWindowEnd = new Date(targetTime.getTime() + 90 * 60 * 1000);

        const courtMatches = await prisma.match.findMany({
          where: {
            id: { not: matchId },
            venue,
            courtName,
            scheduledAt: {
              gte: courtWindowStart,
              lte: courtWindowEnd,
            },
            status: { notIn: ["COMPLETED", "CANCELLED"] },
          },
        });

        if (courtMatches.length > 0) {
          conflicts.push(
            `สนาม ${courtName} ณ ${venue} มีแมตช์อื่นใช้งานอยู่ในช่วงเวลาที่ใกล้เคียงกัน`
          );
        }
      }
    }

    if (conflicts.length > 0 && !ignoreConflicts) {
      return NextResponse.json({
        success: false,
        hasConflicts: true,
        conflicts,
        error: "พบตารางการแข่งขันชนกัน (Scheduling Conflict Detected)",
      }, { status: 409 });
    }

    const updateData: any = {};
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (venue !== undefined) updateData.venue = venue;
    if (courtName !== undefined) updateData.courtName = courtName;
    if (round !== undefined) updateData.round = round;
    if (status !== undefined) updateData.status = status;
    if (postponedReason !== undefined) updateData.postponedReason = postponedReason;

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
      include: {
        homeTeam: true,
        awayTeam: true,
        tournament: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: status === "POSTPONED" ? "MATCH_POSTPONED" : "MATCH_RESCHEDULED",
        targetEntity: "Match",
        targetId: matchId,
        metadataJson: JSON.stringify({
          scheduledAt,
          venue,
          courtName,
          status,
          postponedReason,
        }),
      },
    });

    // Dispatch in-app notification to affected teams & officials
    if (scheduledAt || venue || status === "POSTPONED") {
      const { notifyMatchScheduleChanged } = await import("@/lib/notifications/notificationService");
      void notifyMatchScheduleChanged(matchId, {
        tournamentName: updatedMatch.tournament?.name,
        homeTeamName: updatedMatch.homeTeam?.name || "ทีมเหย้า",
        awayTeamName: updatedMatch.awayTeam?.name || "ทีมเยือน",
        newScheduledAt: updatedMatch.scheduledAt || new Date(),
        venue: updatedMatch.venue,
        courtName: updatedMatch.courtName,
      });
    }

    return NextResponse.json({
      success: true,
      message: status === "POSTPONED" ? "บันทึกการเลื่อนการแข่งขันเรียบร้อยแล้ว" : "ปรับปรุงตารางการแข่งขันเรียบร้อยแล้ว",
      data: updatedMatch,
    });
  } catch (error) {
    console.error("[MATCH SCHEDULE API] Error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถบันทึกตารางการแข่งขันได้" },
      { status: 500 }
    );
  }
}
