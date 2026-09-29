import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";
import { requestOriginAllowed } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ success: false, error: "Invalid origin" }, { status: 403 });
  }

  const auth = await requireRole(request, ["ADMIN", "OFFICIAL"]);
  if (!auth.authorized) return auth.response;

  try {
    const tournamentId = params.id;
    const body = await request.json().catch(() => ({}));
    const rawLock = body.lock !== undefined ? body.lock : body.isLocked;
    const lock = rawLock !== undefined ? Boolean(rawLock) : true;
    const teamId = body.teamId;

    const whereClause: Record<string, unknown> = {
      tournamentId,
      status: "APPROVED",
    };

    if (teamId && typeof teamId === "string") {
      whereClause.teamId = teamId;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.tournamentRegistration.updateMany({
        where: whereClause,
        data: {
          isRosterLocked: Boolean(lock),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: auth.userId!,
          action: lock ? "LOCK_TOURNAMENT_ROSTERS" : "UNLOCK_TOURNAMENT_ROSTERS",
          targetEntity: "TournamentRegistration",
          targetId: tournamentId,
          metadataJson: JSON.stringify({
            lock: Boolean(lock),
            teamId: teamId || "ALL_TEAMS",
            affectedCount: updateResult.count,
          }),
        },
      });

      return updateResult;
    });

    return NextResponse.json({
      success: true,
      message: lock
        ? `ล็อกรายชื่อนักกีฬาเรียบร้อยแล้ว (${result.count} ทีม) ห้ามแก้ไขรายชื่อก่อนแข่งขัน`
        : `ปลดล็อกรายชื่อนักกีฬาเรียบร้อยแล้ว (${result.count} ทีม)`,
      affectedCount: result.count,
      isRosterLocked: Boolean(lock),
      isLocked: Boolean(lock),
    });
  } catch (error) {
    console.error("[Tournament Roster Lock API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการปรับสถานะการล็อกรายชื่อ" },
      { status: 500 }
    );
  }
}
