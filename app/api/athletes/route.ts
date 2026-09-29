import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    const athletes = await prisma.athleteProfile.findMany({
      where: teamId
        ? {
            teamRosters: {
              some: {
                teamId,
              },
            },
          }
        : undefined,
      include: {
        seasonStats: true,
        teamRosters: {
          include: {
            team: true,
          },
        },
      },
      orderBy: {
        firstName: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      count: athletes.length,
      data: athletes.map(({ birthDate, tcasReferenceCode, userId, ...publicProfile }) => publicProfile),
      source: "PRISMA_SQLITE_PERSISTENT",
    });
  } catch (error) {
    console.warn("[API ATHLETES] Database query failed, using mock data fallback:", error);
    try {
      const { mockAthleteProfiles } = await import("@/lib/db/seed-data");
      const { searchParams } = new URL(request.url);
      const teamId = searchParams.get("teamId");

      let fallbackList = Object.values(mockAthleteProfiles);
      if (teamId) {
        const { mockTeams } = await import("@/lib/db/seed-data");
        const team = mockTeams.find((t) => t.id === teamId);
        const rosterIds = new Set(team?.roster?.map((r) => r.athleteId) || []);
        fallbackList = fallbackList.filter((a) => rosterIds.has(a.id));
      }

      return NextResponse.json({
        success: true,
        count: fallbackList.length,
        data: fallbackList.map(({ birthDate, tcasReferenceCode, userId, ...publicProfile }) => publicProfile),
        source: "FALLBACK_MOCK",
      });
    } catch (fallbackError) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch athletes",
        },
        { status: 500 }
      );
    }
  }
}
