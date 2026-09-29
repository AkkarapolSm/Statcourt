import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";
import { requestOriginAllowed } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ["ADMIN"]);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.toUpperCase() || "ALL";
    const tournamentId = searchParams.get("tournamentId") || "";
    const q = searchParams.get("q")?.trim().toLowerCase() || "";

    const whereClause: Record<string, unknown> = {};
    if (status !== "ALL") {
      whereClause.status = status;
    }
    if (tournamentId) {
      whereClause.tournamentId = tournamentId;
    }

    const [allRegistrations, totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.tournamentRegistration.findMany({
        where: whereClause,
        include: {
          tournament: {
            select: {
              id: true,
              name: true,
              category: true,
              status: true,
              startDate: true,
              endDate: true,
              maxTeams: true,
              registeredTeams: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
              shortName: true,
              institution: true,
              logoUrl: true,
              coach: {
                select: {
                  fullName: true,
                  organization: true,
                  phoneNumber: true,
                },
              },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      }),
      prisma.tournamentRegistration.count(tournamentId ? { where: { tournamentId } } : undefined),
      prisma.tournamentRegistration.count({ where: { status: "PENDING", ...(tournamentId ? { tournamentId } : {}) } }),
      prisma.tournamentRegistration.count({ where: { status: "APPROVED", ...(tournamentId ? { tournamentId } : {}) } }),
      prisma.tournamentRegistration.count({ where: { status: "REJECTED", ...(tournamentId ? { tournamentId } : {}) } }),
    ]);

    const filtered = q
      ? allRegistrations.filter(
          (reg) =>
            reg.team.name.toLowerCase().includes(q) ||
            reg.team.institution.toLowerCase().includes(q) ||
            reg.tournament.name.toLowerCase().includes(q) ||
            (reg.team.coach?.fullName && reg.team.coach.fullName.toLowerCase().includes(q))
        )
      : allRegistrations;

    return NextResponse.json(
      {
        registrations: filtered,
        stats: {
          total: totalCount,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("[ADMIN REGISTRATIONS API] GET failed:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลการสมัครทัวร์นาเมนต์ได้" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const auth = await requireRole(request, ["ADMIN"]);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { registrationId, status, reviewerNotes, isRosterLocked } = body;

    if (!registrationId || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง (ต้องระบุ registrationId และ status: APPROVED / REJECTED / PENDING)" },
        { status: 400 }
      );
    }

    const registration = await prisma.tournamentRegistration.findUnique({
      where: { id: registrationId },
      include: {
        tournament: true,
        team: true,
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการสมัครนี้" }, { status: 404 });
    }

    const previousStatus = registration.status;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update registration
      const reg = await tx.tournamentRegistration.update({
        where: { id: registrationId },
        data: {
          status,
          reviewedAt: new Date(),
          reviewerNotes: reviewerNotes ?? registration.reviewerNotes,
          isRosterLocked: typeof isRosterLocked === "boolean" ? isRosterLocked : registration.isRosterLocked,
        },
        include: {
          tournament: { select: { id: true, name: true } },
          team: { select: { id: true, name: true } },
        },
      });

      // 2. Recalculate registered teams count for tournament
      const approvedCount = await tx.tournamentRegistration.count({
        where: { tournamentId: registration.tournamentId, status: "APPROVED" },
      });

      await tx.tournament.update({
        where: { id: registration.tournamentId },
        data: { registeredTeams: approvedCount },
      });

      // 3. Log to AuditLog
      await tx.auditLog.create({
        data: {
          userId: auth.userId!,
          action: status === "APPROVED" ? "APPROVE_TOURNAMENT_REGISTRATION" : "REJECT_TOURNAMENT_REGISTRATION",
          targetEntity: "TournamentRegistration",
          targetId: registrationId,
          metadataJson: JSON.stringify({
            previousStatus,
            newStatus: status,
            tournamentId: registration.tournamentId,
            tournamentName: registration.tournament.name,
            teamId: registration.teamId,
            teamName: registration.team.name,
            reviewerNotes: reviewerNotes || null,
            isRosterLocked: typeof isRosterLocked === "boolean" ? isRosterLocked : registration.isRosterLocked,
          }),
        },
      });

      return reg;
    });

    // Dispatch in-app notification to team coaches and managers
    if (status === "APPROVED" || status === "REJECTED") {
      try {
        const { notifyRegistrationStatus } = await import("@/lib/notifications/notificationService");
        void notifyRegistrationStatus(registrationId, {
          tournamentName: registration.tournament.name,
          teamName: registration.team.name,
          teamId: registration.teamId,
          status,
          reviewerNotes,
        });
      } catch (notifErr) {
        console.error("Registration notification error:", notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      message:
        status === "APPROVED"
          ? `อนุมัติทีม '${registration.team.name}' เข้าร่วม '${registration.tournament.name}' เรียบร้อยแล้ว`
          : `ปฏิเสธการสมัครของทีม '${registration.team.name}' เรียบร้อยแล้ว`,
      registration: updated,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "รูปแบบ JSON ไม่ถูกต้อง" }, { status: 400 });
    }
    console.error("[ADMIN REGISTRATIONS API] PATCH failed:", error);
    return NextResponse.json({ error: "ไม่สามารถอัปเดตสถานะการสมัครได้" }, { status: 500 });
  }
}
