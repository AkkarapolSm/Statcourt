import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { detectScheduleConflicts } from "@/lib/tournaments/bracketEngine";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = params.id;
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: {
          where: { status: "APPROVED" },
          include: {
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
                institution: true,
                logoUrl: true,
              },
            },
          },
        },
        standings: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true,
              },
            },
          },
          orderBy: [{ groupName: "asc" }, { points: "desc" }, { pointDiff: "desc" }],
        },
        matches: {
          include: {
            homeTeam: { select: { id: true, name: true, shortName: true } },
            awayTeam: { select: { id: true, name: true, shortName: true } },
          },
          orderBy: { scheduledAt: "asc" },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลทัวร์นาเมนต์นี้" },
        { status: 404 }
      );
    }

    // 1. Group Standings by groupName
    const groupsMap: Record<string, typeof tournament.standings> = {};
    tournament.standings.forEach((st) => {
      const g = st.groupName || "Group A";
      if (!groupsMap[g]) groupsMap[g] = [];
      groupsMap[g].push(st);
    });

    // 2. Classify Matches: Group Matches vs Knockout Matches
    const groupMatches = tournament.matches.filter((m) =>
      m.round?.includes("แบ่งกลุ่ม") || m.round?.includes("Group")
    );

    const knockoutMatches = tournament.matches.filter(
      (m) => !m.round?.includes("แบ่งกลุ่ม") && !m.round?.includes("Group")
    );

    // Group Knockout matches by round name
    const knockoutRoundsMap: Record<string, typeof knockoutMatches> = {};
    knockoutMatches.forEach((m) => {
      const r = m.round || "Knockout Round";
      if (!knockoutRoundsMap[r]) knockoutRoundsMap[r] = [];
      knockoutRoundsMap[r].push(m);
    });

    // 3. Detect any court or team rest conflicts
    const conflicts = detectScheduleConflicts(
      tournament.matches.map((m) => ({
        id: m.id,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        homeTeamName: m.homeTeam.name,
        awayTeamName: m.awayTeam.name,
        scheduledAt: m.scheduledAt,
        venue: m.venue,
        courtName: m.courtName,
      }))
    );

    // 4. Calculate Roster Lock Status
    const approvedRegistrations = tournament.registrations;
    const lockedCount = approvedRegistrations.filter((r) => r.isRosterLocked).length;
    const isAllRostersLocked = approvedRegistrations.length > 0 && lockedCount === approvedRegistrations.length;

    return NextResponse.json(
      {
        success: true,
        tournament: {
          id: tournament.id,
          name: tournament.name,
          category: tournament.category,
          status: tournament.status,
          venue: tournament.venue,
          startDate: tournament.startDate,
          endDate: tournament.endDate,
        },
        summary: {
          approvedTeamsCount: approvedRegistrations.length,
          lockedRostersCount: lockedCount,
          isAllRostersLocked,
          totalMatches: tournament.matches.length,
          conflictsCount: conflicts.length,
        },
        teams: approvedRegistrations.map((r) => ({
          teamId: r.team.id,
          teamName: r.team.name,
          institution: r.team.institution,
          isRosterLocked: r.isRosterLocked,
        })),
        groups: groupsMap,
        groupMatches,
        knockoutRounds: knockoutRoundsMap,
        conflicts,
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Tournament Brackets API] GET error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการโหลดสายการแข่งขัน" },
      { status: 500 }
    );
  }
}
