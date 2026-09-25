import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      athletesCount,
      teamsCount,
      tournamentsCount,
      matchesCount,
      eventsCount,
      usersCount,
      marketplaceCount,
    ] = await Promise.all([
      prisma.athleteProfile.count(),
      prisma.team.count(),
      prisma.tournament.count(),
      prisma.match.count(),
      prisma.matchEvent.count(),
      prisma.user.count(),
      prisma.marketplaceItem.count(),
    ]);

    return NextResponse.json({
      status: "connected",
      engine: "SQLite (Local Persistent)",
      isLive: true,
      timestamp: new Date().toISOString(),
      counts: {
        athletes: athletesCount,
        teams: teamsCount,
        tournaments: tournamentsCount,
        matches: matchesCount,
        events: eventsCount,
        users: usersCount,
        marketplace: marketplaceCount,
      },
      fibaStandard: {
        rankingMetric: "EFF_PER_GAME",
        sourceOfTruth: "Official Table Verified Events",
        version: "FIBA LiveStats 2026",
      },
    });
  } catch (error) {
    console.error("[DATABASE STATUS ERROR]", error);
    return NextResponse.json(
      {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 }
    );
  }
}
