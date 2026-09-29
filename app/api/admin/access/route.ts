import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";
import { requestOriginAllowed } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  const [pendingUsers, pendingMemberships, officials, pendingMatches] = await Promise.all([
    prisma.user.findMany({ where: { accountStatus: "PENDING" }, select: {
      id: true, email: true, displayName: true, role: true, createdAt: true,
      coachProfile: { select: { organization: true } },
      officialProfile: { select: { licenseNumber: true, licensingBody: true } },
    }, orderBy: { createdAt: "asc" } }),
    prisma.teamMembership.findMany({ where: { status: "PENDING" }, include: {
      user: { select: { id: true, email: true, displayName: true } },
      team: { select: { id: true, name: true } },
    } }),
    prisma.user.findMany({
      where: { role: "OFFICIAL", accountStatus: "ACTIVE", officialProfile: { is: { approvalStatus: "APPROVED" } } },
      select: { id: true, displayName: true, email: true, officialProfile: { select: { licenseNumber: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.match.findMany({
      where: { resultStatus: "PENDING_APPROVAL" },
      include: {
        tournament: { select: { id: true, name: true, category: true } },
        homeTeam: { select: { id: true, name: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, shortName: true } },
      },
      orderBy: { scheduledAt: "desc" },
    }),
  ]);
  return NextResponse.json({ pendingUsers, pendingMemberships, officials, pendingMatches }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: NextRequest) {
  if (!requestOriginAllowed(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const auth = await requireRole(request, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const body = await request.json();
    if (body.action === "APPROVE_USER" && typeof body.userId === "string") {
      const user = await prisma.user.findUnique({ where: { id: body.userId } });
      if (!user || !["COACH", "OFFICIAL"].includes(user.role) || user.accountStatus !== "PENDING") {
        return NextResponse.json({ error: "ไม่พบคำขอที่รออนุมัติ" }, { status: 404 });
      }
      await prisma.$transaction(async (tx) => {
        await tx.user.update({ where: { id: user.id }, data: { accountStatus: "ACTIVE" } });
        if (user.role === "COACH") await tx.coachProfile.update({ where: { userId: user.id }, data: { isVerified: true } });
        if (user.role === "OFFICIAL") await tx.officialProfile.update({ where: { userId: user.id }, data: { approvalStatus: "APPROVED" } });
        await tx.auditLog.create({ data: { userId: auth.userId!, action: "APPROVE_USER", targetEntity: "User", targetId: user.id } });
      });
      return NextResponse.json({ success: true });
    }
    if (body.action === "APPROVE_TEAM" && typeof body.userId === "string" && typeof body.teamId === "string") {
      const membership = await prisma.teamMembership.findUnique({ where: { userId_teamId: { userId: body.userId, teamId: body.teamId } } });
      if (!membership || membership.status !== "PENDING") return NextResponse.json({ error: "ไม่พบคำขอทีม" }, { status: 404 });
      await prisma.$transaction([
        prisma.teamMembership.update({ where: { id: membership.id }, data: { status: "ACTIVE" } }),
        prisma.auditLog.create({ data: { userId: auth.userId!, action: "APPROVE_TEAM", targetEntity: "TeamMembership", targetId: membership.id } }),
      ]);
      return NextResponse.json({ success: true });
    }
    if (body.action === "ASSIGN_MATCH" && typeof body.userId === "string" && typeof body.matchId === "string") {
      const official = await prisma.user.findUnique({ where: { id: body.userId }, include: { officialProfile: true } });
      const match = await prisma.match.findUnique({
        where: { id: body.matchId },
        include: {
          tournament: { select: { name: true } },
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
        },
      });
      if (!official || official.role !== "OFFICIAL" || official.accountStatus !== "ACTIVE" || official.officialProfile?.approvalStatus !== "APPROVED" || !match) {
        return NextResponse.json({ error: "เจ้าหน้าที่หรือแมตช์ไม่ถูกต้อง" }, { status: 400 });
      }
      const assignment = await prisma.matchOfficialAssignment.upsert({
        where: { userId_matchId: { userId: official.id, matchId: match.id } },
        create: { userId: official.id, matchId: match.id, status: "ACTIVE" },
        update: { status: "ACTIVE" },
      });
      await prisma.auditLog.create({ data: { userId: auth.userId!, action: "ASSIGN_MATCH", targetEntity: "MatchOfficialAssignment", targetId: assignment.id } });

      // Dispatch in-app notification to the assigned official
      const { notifyOfficialAssigned } = await import("@/lib/notifications/notificationService");
      void notifyOfficialAssigned(match.id, official.id, {
        tournamentName: match.tournament?.name,
        homeTeamName: match.homeTeam?.name || "ทีมเหย้า",
        awayTeamName: match.awayTeam?.name || "ทีมเยือน",
        scheduledAt: match.scheduledAt,
        venue: match.venue,
      });

      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "คำสั่งไม่ถูกต้อง" }, { status: 400 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "JSON ไม่ถูกต้อง" }, { status: 400 });
    console.error("Access management failed", error);
    return NextResponse.json({ error: "จัดการสิทธิ์ไม่สำเร็จ" }, { status: 500 });
  }
}
