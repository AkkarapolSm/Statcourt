import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sanitizeStatsForTier } from "@/lib/permissions";
import { getServerSubscriptionTier } from "@/lib/auth/entitlements";
import { SubscriptionTier, AthleteSeasonStats } from "@/lib/types";

export const dynamic = "force-dynamic";

// Short-lived in-memory cache for top public leaderboard queries (30s TTL)
interface LeaderboardCacheEntry {
  data: any;
  cachedAt: number;
}
const leaderboardCache = new Map<string, LeaderboardCacheEntry>();
const CACHE_TTL_MS = 30 * 1000;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season") || searchParams.get("seasonId");
    const position = searchParams.get("position");
    const ageCategory = searchParams.get("ageCategory");
    const province = searchParams.get("province");
    const search = searchParams.get("search")?.toLowerCase();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(100, Math.max(1, Number(limitParam))) : 100;
    const skip = (page - 1) * limit;

    // Server-enforced subscription entitlement (client tier param or header ignored)
    const userTier: SubscriptionTier = await getServerSubscriptionTier(request);

    // Cache key for common queries
    const cacheKey = `${userTier}:${season || "ALL"}:${position || "ALL"}:${ageCategory || "ALL"}:${province || "ALL"}:${search || ""}:${page}:${limit}`;
    const now = Date.now();
    const cached = leaderboardCache.get(cacheKey);
    if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
      return NextResponse.json(
        {
          ...cached.data,
          cached: true,
        },
        {
          headers: {
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
            "X-Cache": "HIT",
          },
        }
      );
    }

    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now - 180 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);

    // Build database WHERE clause (push filtering into SQLite / PostgreSQL engine)
    const dbWhere: any = {};
    if (season && season !== "ALL") {
      dbWhere.season = season;
    }
    if (ageCategory && ageCategory !== "ALL") {
      dbWhere.ageCategory = ageCategory;
    }
    if (position && position !== "ALL") {
      dbWhere.athlete = { ...(dbWhere.athlete || {}), primaryPosition: position };
    }
    if (province && province !== "ALL") {
      dbWhere.athlete = { ...(dbWhere.athlete || {}), province };
    }
    if (search) {
      dbWhere.OR = [
        { athlete: { firstName: { contains: search } } },
        { athlete: { lastName: { contains: search } } },
        { athlete: { schoolOrClub: { contains: search } } },
      ];
    }

    // Exclude athletes who have explicitly opted out or revoked SCOUTING_DATABASE consent
    dbWhere.athlete = {
      ...(dbWhere.athlete || {}),
      user: {
        privacyConsents: {
          none: {
            consentType: "SCOUTING_DATABASE",
            isAccepted: false,
          },
        },
      },
    };

    // Execute paginated queries directly against database
    const [totalCount, stats] = await Promise.all([
      prisma.athleteSeasonStats.count({ where: dbWhere }),
      prisma.athleteSeasonStats.findMany({
        where: dbWhere,
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
        take: limit,
        skip,
      }),
    ]);

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
    } else if (totalCount === 0 && Object.keys(dbWhere).length === 0) {
      // Seed fallback if DB has 0 athletes recorded
      const { mockLeaderboardAthletes } = await import("@/lib/db/seed-data");
      formattedAthletes = [...mockLeaderboardAthletes].slice(skip, skip + limit);
    }

    // Sanitize stats based on server subscription tier
    const sanitizedData = formattedAthletes.map((a) => sanitizeStatsForTier(a, userTier));

    const responsePayload = {
      success: true,
      tier: userTier,
      count: sanitizedData.length,
      totalCount: totalCount > 0 ? totalCount : sanitizedData.length,
      pagination: {
        page,
        limit,
        totalPages: Math.max(1, Math.ceil((totalCount > 0 ? totalCount : sanitizedData.length) / limit)),
      },
      data: sanitizedData,
      source: stats.length > 0 ? "PRISMA_SQLITE_PERSISTENT" : "FALLBACK_MOCK",
    };

    // Cache top queries
    leaderboardCache.set(cacheKey, {
      data: responsePayload,
      cachedAt: now,
    });

    return NextResponse.json(responsePayload, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Cache": "MISS",
      },
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
