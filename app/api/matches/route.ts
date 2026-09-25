import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");

    const matches = await prisma.match.findMany({
      where: tournamentId ? { tournamentId } : undefined,
      include: {
        tournament: true,
        homeTeam: true,
        awayTeam: true,
        _count: {
          select: { events: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (matches.length > 0) {
      return NextResponse.json({
        success: true,
        count: matches.length,
        data: matches,
        source: "PRISMA_SQLITE_PERSISTENT",
      });
    }

    // Check seed data
    const { mockMatches } = await import("@/lib/db/seed-data");
    let fallbackList = [...mockMatches];
    if (tournamentId) {
      fallbackList = fallbackList.filter((m) => m.tournamentId === tournamentId);
    }

    return NextResponse.json({
      success: true,
      count: fallbackList.length,
      data: fallbackList,
      source: "FALLBACK_MOCK",
    });
  } catch (error) {
    console.error("[API MATCHES] Database query error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ฐานข้อมูลขัดข้อง ไม่สามารถดึงรายการแมตช์ได้ (Database Unavailable)",
      },
      { status: 503 }
    );
  }
}
