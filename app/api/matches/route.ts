import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get("tournamentId");
    const status = searchParams.get("status");
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 60)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tournamentId && tournamentId !== "ALL") {
      where.tournamentId = tournamentId;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }

    const matches = await prisma.match.findMany({
      where,
      take: limit,
      skip,
      include: {
        tournament: {
          select: { id: true, name: true, category: true, region: true },
        },
        homeTeam: {
          select: { id: true, name: true, shortName: true, logoUrl: true, primaryColor: true },
        },
        awayTeam: {
          select: { id: true, name: true, shortName: true, logoUrl: true, primaryColor: true },
        },
        _count: {
          select: { events: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (matches.length > 0) {
      return NextResponse.json(
        {
          success: true,
          count: matches.length,
          page,
          limit,
          data: matches,
          source: "PRISMA_SQLITE_PERSISTENT",
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
          },
        }
      );
    }

    // Check seed data fallback
    const { mockMatches } = await import("@/lib/db/seed-data");
    let fallbackList = [...mockMatches];
    if (tournamentId && tournamentId !== "ALL") {
      fallbackList = fallbackList.filter((m) => m.tournamentId === tournamentId);
    }
    if (status && status !== "ALL") {
      fallbackList = fallbackList.filter((m) => m.status === status);
    }

    return NextResponse.json(
      {
        success: true,
        count: fallbackList.length,
        data: fallbackList.slice(skip, skip + limit),
        source: "FALLBACK_MOCK",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
        },
      }
    );
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
