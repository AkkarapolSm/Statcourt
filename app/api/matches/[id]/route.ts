import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        homeTeam: {
          include: {
            roster: {
              include: {
                athlete: { select: { id: true, firstName: true, lastName: true, jerseyNumber: true, primaryPosition: true, avatarUrl: true } },
              },
            },
          },
        },
        awayTeam: {
          include: {
            roster: {
              include: {
                athlete: { select: { id: true, firstName: true, lastName: true, jerseyNumber: true, primaryPosition: true, avatarUrl: true } },
              },
            },
          },
        },
        events: {
          include: {
            athlete: { select: { id: true, firstName: true, lastName: true, jerseyNumber: true } },
            official: { select: { id: true, fullName: true, licenseNumber: true } },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (match) {
      return NextResponse.json({
        success: true,
        data: match,
        source: "PRISMA_SQLITE_PERSISTENT",
      });
    }

    // Check seed data for specific matchId
    const { mockMatches } = await import("@/lib/db/seed-data");
    const fallbackMatch = mockMatches.find((m) => m.id === matchId);
    if (fallbackMatch) {
      return NextResponse.json({
        success: true,
        data: fallbackMatch,
        source: "FALLBACK_MOCK",
      });
    }

    return NextResponse.json(
      { success: false, error: `ไม่พบข้อมูลการแข่งขันรหัส '${matchId}' (Match Not Found)` },
      { status: 404 }
    );
  } catch (error) {
    console.error(`[API MATCH DETAIL] Database error for ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "ฐานข้อมูลขัดข้อง ไม่สามารถดึงข้อมูลการแข่งขันได้ (Database Unavailable)",
      },
      { status: 503 }
    );
  }
}
