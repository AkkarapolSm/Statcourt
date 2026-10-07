import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const institution = searchParams.get("institution") || "";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 60)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortName: { contains: search } },
        { institution: { contains: search } },
      ];
    }
    if (institution) {
      where.institution = { contains: institution };
    }

    const teams = await prisma.team.findMany({
      where,
      take: limit,
      skip,
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
            organization: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            roster: true,
            homeMatches: true,
            awayMatches: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    if (teams.length > 0) {
      return NextResponse.json(
        {
          success: true,
          count: teams.length,
          page,
          limit,
          data: teams,
          source: "PRISMA_SQLITE_PERSISTENT",
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
          },
        }
      );
    }

    // Fallback seed teams
    const { mockTeams } = await import("@/lib/db/seed-data");
    let fallbackList = Object.values(mockTeams);
    if (search) {
      const q = search.toLowerCase();
      fallbackList = fallbackList.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.shortName && t.shortName.toLowerCase().includes(q)) ||
          t.institution.toLowerCase().includes(q)
      );
    }
    if (institution) {
      fallbackList = fallbackList.filter((t) => t.institution.includes(institution));
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
    console.error("[PUBLIC TEAMS API] Error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูลทำเนียบทีมได้" },
      { status: 500 }
    );
  }
}
