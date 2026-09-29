import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ["ADMIN"]);
  if (!auth.authorized) return auth.response;

  try {
    const [
      totalUsers,
      athleteUsers,
      coachUsers,
      officialUsers,
      adminUsers,
      pendingUsers,
      pendingOfficials,
      pendingRegistrations,
      pendingMemberships,
      pendingMatchResults,
      totalTournaments,
      totalMatches,
      totalAudits,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ATHLETE" } }),
      prisma.user.count({ where: { role: "COACH" } }),
      prisma.user.count({ where: { role: "OFFICIAL" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { accountStatus: "PENDING" } }),
      prisma.officialProfile.count({ where: { approvalStatus: "PENDING" } }),
      prisma.tournamentRegistration.count({ where: { status: "PENDING" } }),
      prisma.teamMembership.count({ where: { status: "PENDING" } }),
      prisma.match.count({ where: { resultStatus: "PENDING_APPROVAL" } }),
      prisma.tournament.count(),
      prisma.match.count(),
      prisma.auditLog.count(),
    ]);

    return NextResponse.json(
      {
        users: {
          total: totalUsers,
          athlete: athleteUsers,
          coach: coachUsers,
          official: officialUsers,
          admin: adminUsers,
        },
        pending: {
          users: pendingUsers,
          officials: pendingOfficials,
          registrations: pendingRegistrations,
          memberships: pendingMemberships,
          matchResults: pendingMatchResults,
        },
        system: {
          tournaments: totalTournaments,
          matches: totalMatches,
          auditLogs: totalAudits,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("[ADMIN OVERVIEW API] GET failed:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลภาพรวมผู้ดูแลระบบได้" }, { status: 500 });
  }
}
