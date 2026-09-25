import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sanitizeStatsForTier } from "@/lib/permissions";
import { SubscriptionTier, AthleteSeasonStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const ageCategory = searchParams.get("ageCategory");
    const province = searchParams.get("province");
    const search = searchParams.get("search")?.toLowerCase();

    // Read tier from header or query param
    const tierParam = searchParams.get("tier");
    const headerTier = request.headers.get("x-user-tier");
    const userTier: SubscriptionTier =
      tierParam === "PRO" || headerTier === "PRO" ? "PRO" : "FREE";

    const now = new Date().getTime();
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now - 180 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);

    // Query all athlete season stats joined with athlete profile and match participations
    const stats = await prisma.athleteSeasonStats.findMany({
      include: {
        athlete: {
          include: {
            matchParticipations: {
              select: {
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        effPerGame: "desc",
      },
    });

    let formattedAthletes: AthleteSeasonStats[] = [];

    if (stats.length > 0) {
      formattedAthletes = stats.map((item) => {
        const participations = item.athlete.matchParticipations || [];
        const matchesLast30d = participations.filter((p) => new Date(p.createdAt) >= oneMonthAgo).length;
        const matchesLast6m = participations.filter((p) => new Date(p.createdAt) >= sixMonthsAgo).length;
        const matchesLast1y = participations.filter((p) => new Date(p.createdAt) >= oneYearAgo).length;
        const matchesAllTime = participations.length;

        return {
          athleteId: item.athlete.id,
          firstName: item.athlete.firstName,
          lastName: item.athlete.lastName,
          jerseyNumber: item.athlete.jerseyNumber || 0,
          schoolOrClub: item.athlete.schoolOrClub,
          province: item.athlete.province,
          position: item.athlete.primaryPosition as any,
          ageCategory: item.ageCategory as any,
          avatarUrl: item.athlete.avatarUrl || undefined,
          heightCm: item.athlete.heightCm,
          weightKg: item.athlete.weightKg ?? undefined,
          gamesPlayed: item.gamesPlayed,
          points: item.points,
          rebounds: item.rebounds,
          assists: item.assists,
          steals: item.steals,
          blocks: item.blocks,
          turnovers: item.turnovers,
          fouls: item.fouls,
          fgMade: item.fgMade,
          fgMissed: item.fgMissed,
          ftMade: item.ftMade,
          ftMissed: item.ftMissed,
          fg3Made: item.fg3Made,
          fg3Missed: item.fg3Missed,
          eff: item.eff,
          effPerGame: item.effPerGame,
          efgPct: item.efgPct,
          tsPct: item.tsPct,
          astToRatio: item.astToRatio,
          per: item.per,
          ppg: item.ppg,
          rpg: item.rpg,
          apg: item.apg,
          spg: item.spg,
          bpg: item.bpg,
          fgPct: item.fgPct,
          ftPct: item.ftPct,
          scoringRating: item.scoringRating,
          playmakingRating: item.playmakingRating,
          defenseRating: item.defenseRating,
          athleticismRating: item.athleticismRating,
          matchesLast30d,
          matchesLast6m,
          matchesLast1y,
          matchesAllTime,
        };
      });
    } else {
      // Seed data if DB is empty
      const { mockLeaderboardAthletes } = await import("@/lib/db/seed-data");
      formattedAthletes = [...mockLeaderboardAthletes];
    }

    // Apply filtering
    if (position && position !== "ALL") {
      formattedAthletes = formattedAthletes.filter((a) => a.position === position);
    }
    if (ageCategory && ageCategory !== "ALL") {
      formattedAthletes = formattedAthletes.filter((a) => a.ageCategory === ageCategory);
    }
    if (province && province !== "ALL") {
      formattedAthletes = formattedAthletes.filter((a) => a.province === province);
    }
    if (search) {
      formattedAthletes = formattedAthletes.filter(
        (a) =>
          a.firstName.toLowerCase().includes(search) ||
          a.lastName.toLowerCase().includes(search) ||
          a.schoolOrClub.toLowerCase().includes(search) ||
          String(a.jerseyNumber).includes(search)
      );
    }

    // Sanitize stats based on caller subscription tier
    const sanitizedData = formattedAthletes.map((a) => sanitizeStatsForTier(a, userTier));

    return NextResponse.json({
      success: true,
      tier: userTier,
      count: sanitizedData.length,
      data: sanitizedData,
      source: stats.length > 0 ? "PRISMA_SQLITE_PERSISTENT" : "FALLBACK_MOCK",
    });
  } catch (error) {
    console.error("[API LEADERBOARD] Database query error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ฐานข้อมูลขัดข้อง ไม่สามารถดึงข้อมูลทำเนียบผู้นำได้ (Database Unavailable)",
      },
      { status: 503 }
    );
  }
}
