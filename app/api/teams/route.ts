import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const institution = searchParams.get("institution") || "";

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
      return NextResponse.json({
        success: true,
        count: teams.length,
        data: teams,
        source: "PRISMA_SQLITE_PERSISTENT",
      });
    }

    // Fallback seed teams
    const { mockTeams } = await import("@/lib/db/seed-data");
    const fallbackList = Object.values(mockTeams);

    return NextResponse.json({
      success: true,
      count: fallbackList.length,
      data: fallbackList,
      source: "FALLBACK_MOCK",
    });
  } catch (error) {
    console.error("[PUBLIC TEAMS API] Error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูลทำเนียบทีมได้" },
      { status: 500 }
    );
  }
}
