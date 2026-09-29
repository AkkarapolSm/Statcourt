import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireOfficial, requireRole } from "@/lib/auth/serverAuth";
import { requestOriginAllowed } from "@/lib/auth/session";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    select: { id: true, status: true, resultStatus: true, homeScore: true, awayScore: true },
  });
  if (!match) return NextResponse.json({ error: "ไม่พบการแข่งขัน" }, { status: 404 });
  const auth = await requireRole(_request, ["ADMIN"]);
  const history = auth.authorized ? await prisma.matchResultApproval.findMany({
    where: { matchId: params.id }, orderBy: { createdAt: "desc" },
    select: { action: true, reason: true, homeScore: true, awayScore: true, createdAt: true,
      approver: { select: { displayName: true, email: true } } },
  }) : undefined;
  return NextResponse.json({ match, ...(history ? { history } : {}) });
  } catch (error) {
    console.error("Result status failed", error);
    return NextResponse.json({ error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : "โหลดผลแข่งขันไม่สำเร็จ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!requestOriginAllowed(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  let body: { action?: string; reason?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "JSON ไม่ถูกต้อง" }, { status: 400 }); }
  const action = body.action;
  if (!action || !["SUBMIT", "APPROVE", "REOPEN"].includes(action)) {
    return NextResponse.json({ error: "คำสั่งไม่ถูกต้อง" }, { status: 400 });
  }
  const auth = action === "SUBMIT"
    ? await requireOfficial(request, params.id)
    : await requireRole(request, ["ADMIN"]);
  if (!auth.authorized || !auth.userId) return auth.response;
  if (action === "REOPEN" && (!body.reason || body.reason.trim().length < 10)) {
    return NextResponse.json({ error: "กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษร" }, { status: 400 });
  }
  const from = action === "SUBMIT" ? "DRAFT" : action === "APPROVE" ? "PENDING_APPROVAL" : "FINAL";
  const to = action === "SUBMIT" ? "PENDING_APPROVAL" : action === "APPROVE" ? "FINAL" : "DRAFT";
  try {
    const match = await prisma.$transaction(async (tx) => {
      const changed = await tx.match.updateMany({
        where: { id: params.id, resultStatus: from },
        data: { resultStatus: to, ...(action === "SUBMIT" ? { status: "COMPLETED" } : action === "REOPEN" ? { status: "DISPUTED" } : {}) },
      });
      if (changed.count !== 1) return null;
      const updated = await tx.match.findUniqueOrThrow({ where: { id: params.id } });
      await tx.matchResultApproval.create({ data: {
        matchId: updated.id, approverId: auth.userId!, action,
        reason: body.reason?.trim() || null,
        homeScore: updated.homeScore, awayScore: updated.awayScore,
      } });
      await tx.auditLog.create({ data: {
        userId: auth.userId!, action: `RESULT_${action}`,
        targetEntity: "Match", targetId: updated.id,
        metadataJson: JSON.stringify({ from, to, homeScore: updated.homeScore, awayScore: updated.awayScore, reason: body.reason || null }),
      } });
      return updated;
    });
    if (!match) return NextResponse.json({ error: "สถานะผลแข่งขันไม่อนุญาตให้ทำรายการนี้" }, { status: 409 });

    // Automatically recalculate athlete season statistics and standings
    if (action === "APPROVE" || action === "REOPEN") {
      try {
        const { reconcileMatchWorkflow } = await import("@/lib/stats/matchStatsSync");
        await reconcileMatchWorkflow(params.id, action);
      } catch (syncErr) {
        console.error("Match stats & standings sync error:", syncErr);
      }

      // Dispatch in-app notifications to coaches, staff, and assigned officials
      try {
        const { notifyMatchResultCertified } = await import("@/lib/notifications/notificationService");
        const fullMatch = await prisma.match.findUnique({
          where: { id: params.id },
          include: {
            tournament: { select: { name: true } },
            homeTeam: { select: { name: true } },
            awayTeam: { select: { name: true } },
          },
        });
        if (fullMatch) {
          void notifyMatchResultCertified(fullMatch.id, {
            tournamentName: fullMatch.tournament?.name,
            homeTeamName: fullMatch.homeTeam?.name || "ทีมเหย้า",
            awayTeamName: fullMatch.awayTeam?.name || "ทีมเยือน",
            homeScore: fullMatch.homeScore,
            awayScore: fullMatch.awayScore,
            isApproved: action === "APPROVE",
            reason: body.reason,
          });
        }
      } catch (notifErr) {
        console.error("Match result notification error:", notifErr);
      }
    }

    return NextResponse.json({ success: true, match: {
      id: match.id, resultStatus: match.resultStatus,
      homeScore: match.homeScore, awayScore: match.awayScore,
    } });
  } catch (error) {
    console.error("Result approval failed", error);
    return NextResponse.json({ error: "บันทึกการรับรองผลไม่สำเร็จ" }, { status: 500 });
  }
}
