import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
            organization: true,
            isVerified: true,
          },
        },
        roster: {
          include: {
            athlete: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                jerseyNumber: true,
                primaryPosition: true,
                heightCm: true,
                schoolOrClub: true,
                province: true,
                avatarUrl: true,
                seasonStats: true,
              },
            },
          },
          orderBy: { jerseyNumber: "asc" },
        },
        homeMatches: {
          include: {
            tournament: { select: { id: true, name: true } },
            awayTeam: { select: { id: true, name: true, shortName: true, logoUrl: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        awayMatches: {
          include: {
            tournament: { select: { id: true, name: true } },
            homeTeam: { select: { id: true, name: true, shortName: true, logoUrl: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        tournamentRegistrations: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
                category: true,
                status: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
        tournamentStandings: true,
      },
    });

    if (team) {
      // Calculate overall W-L
      let wins = 0;
      let losses = 0;

      const recentMatches = [
        ...team.homeMatches.map((m) => ({
          ...m,
          isHome: true,
          opponent: m.awayTeam,
          isWin: m.status === "COMPLETED" && m.homeScore > m.awayScore,
        })),
        ...team.awayMatches.map((m) => ({
          ...m,
          isHome: false,
          opponent: m.homeTeam,
          isWin: m.status === "COMPLETED" && m.awayScore > m.homeScore,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      recentMatches.forEach((m) => {
        if (m.status === "COMPLETED") {
          if (m.isWin) wins++;
          else losses++;
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          ...team,
          record: { wins, losses, total: wins + losses },
          recentMatches,
        },
        source: "PRISMA_SQLITE_PERSISTENT",
      });
    }

    // Fallback seed team
    const { mockTeams } = await import("@/lib/db/seed-data");
    const fallbackTeam = mockTeams.find((t: any) => t.id === teamId);
    if (fallbackTeam) {
      return NextResponse.json({
        success: true,
        data: {
          ...fallbackTeam,
          record: { wins: 4, losses: 1, total: 5 },
          recentMatches: [],
        },
        source: "FALLBACK_MOCK",
      });
    }

    return NextResponse.json(
      { success: false, error: `ไม่พบข้อมูลทีม '${teamId}' ในระบบ (Team Not Found)` },
      { status: 404 }
    );
  } catch (error) {
    console.error(`[PUBLIC TEAM DETAIL API] Error for ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถดึงข้อมูลโปรไฟล์ทีมได้" },
      { status: 500 }
    );
  }
}
