import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ["ADMIN"]);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const action = searchParams.get("action")?.trim() || "";
    const targetEntity = searchParams.get("targetEntity")?.trim() || "";
    const q = searchParams.get("q")?.trim().toLowerCase() || "";

    const whereClause: Record<string, unknown> = {};
    if (action && action !== "ALL") {
      whereClause.action = action;
    }
    if (targetEntity && targetEntity !== "ALL") {
      whereClause.targetEntity = targetEntity;
    }

    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.auditLog.count({ where: whereClause }),
    ]);

    const filteredLogs = q
      ? logs.filter(
          (log) =>
            log.action.toLowerCase().includes(q) ||
            log.targetEntity.toLowerCase().includes(q) ||
            log.targetId.toLowerCase().includes(q) ||
            log.metadataJson.toLowerCase().includes(q) ||
            (log.user.displayName && log.user.displayName.toLowerCase().includes(q)) ||
            (log.user.email && log.user.email.toLowerCase().includes(q))
        )
      : logs;

    return NextResponse.json(
      {
        logs: filteredLogs,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("[ADMIN AUDIT LOGS API] GET failed:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงบันทึกการตรวจสอบระบบได้" }, { status: 500 });
  }
}
