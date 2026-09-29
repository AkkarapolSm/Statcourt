import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

interface CachedMetrics {
  data: any;
  cachedAt: number;
}

const globalMetrics = globalThis as unknown as {
  __statcourt_db_metrics__?: CachedMetrics | null;
};

const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL for high-cost count queries

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  // 1. Lightweight Readiness Probe (K8s / LB / CDN Health Check)
  if (mode === "readiness" || mode === "ping" || mode === "health") {
    try {
      await prisma.$queryRawUnsafe("SELECT 1");
      return NextResponse.json(
        {
          status: "ready",
          isLive: true,
          engine: "SQLite / Multi-Provider Ready",
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
          },
        }
      );
    } catch (error) {
      console.error("[DATABASE READINESS FAILED]:", error);
      return NextResponse.json(
        { status: "unhealthy", isLive: false, error: "Database probe failed" },
        { status: 503 }
      );
    }
  }

  // 2. High-cost Public Statistics with 60-second In-Memory TTL Cache
  const now = Date.now();
  const cachedMetrics = globalMetrics.__statcourt_db_metrics__;
  if (cachedMetrics && now - cachedMetrics.cachedAt < CACHE_TTL_MS) {
    return NextResponse.json(
      {
        ...cachedMetrics.data,
        cached: true,
        ttlRemainingMs: Math.max(0, CACHE_TTL_MS - (now - cachedMetrics.cachedAt)),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "X-Cache": "HIT",
        },
      }
    );
  }

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

    const payload = {
      status: "connected",
      engine: "SQLite (Local Persistent) / PostgreSQL Ready",
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
    };

    globalMetrics.__statcourt_db_metrics__ = {
      data: payload,
      cachedAt: now,
    };

    return NextResponse.json(
      {
        ...payload,
        cached: false,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "X-Cache": "MISS",
        },
      }
    );
  } catch (error) {
    console.error("[DATABASE STATUS ERROR]", error);
    return NextResponse.json(
      {
        status: "disconnected",
        isLive: false,
        error: "Database metrics temporarily unavailable",
      },
      { status: 503 }
    );
  }
}
