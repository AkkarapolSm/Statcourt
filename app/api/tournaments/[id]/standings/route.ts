import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

interface TeamStandingRow {
  teamId: string;
  teamName: string;
  teamShortName?: string;
  teamLogo?: string | null;
  institution?: string;
  groupName: string;
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  points: number; // FIBA: 2 per win, 1 per loss
  streak: string;
  headToHead: Record<string, { won: number; diff: number }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = params.id;
    const { searchParams } = new URL(request.url);
    const includePending = searchParams.get("includePending") === "true";

    // Official standings require FINAL verified results; include pending only if requested
    const matchFilter = includePending
      ? { status: "COMPLETED" }
      : { resultStatus: "FINAL" };

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        matches: {
          where: matchFilter,
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
        standings: {
          include: {
            team: true,
          },
        },
        registrations: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลทัวร์นาเมนต์นี้" },
        { status: 404 }
      );
    }

    // If explicit saved standings exist in DB, return them
    if (tournament.standings && tournament.standings.length > 0) {
      const sorted = [...tournament.standings].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.pointDiff - a.pointDiff;
      });
      return NextResponse.json({
        success: true,
        data: sorted,
        isOfficial: !includePending,
        source: "PRISMA_PERSISTENT_STANDINGS",
      });
    }

    // Dynamic calculation from tournament matches using FIBA tie-break rules
    const teamMap = new Map<string, TeamStandingRow>();

    // 1. Initialize registered teams or teams in matches
    const allTeams = new Set<string>();
    tournament.registrations.forEach((r) => {
      allTeams.add(r.teamId);
      teamMap.set(r.teamId, {
        teamId: r.teamId,
        teamName: r.team.name,
        teamShortName: r.team.shortName || undefined,
        teamLogo: r.team.logoUrl,
        institution: r.team.institution,
        groupName: "สาย A",
        played: 0,
        won: 0,
        lost: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
        points: 0,
        streak: "-",
        headToHead: {},
      });
    });

    tournament.matches.forEach((m) => {
      [m.homeTeam, m.awayTeam].forEach((team) => {
        if (!teamMap.has(team.id)) {
          teamMap.set(team.id, {
            teamId: team.id,
            teamName: team.name,
            teamShortName: team.shortName || undefined,
            teamLogo: team.logoUrl,
            institution: team.institution,
            groupName: "สาย A",
            played: 0,
            won: 0,
            lost: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            pointDiff: 0,
            points: 0,
            streak: "-",
            headToHead: {},
          });
        }
      });
    });

    // 2. Accumulate match scores
    tournament.matches.forEach((m) => {
      const home = teamMap.get(m.homeTeamId);
      const away = teamMap.get(m.awayTeamId);
      if (!home || !away) return;

      home.played += 1;
      away.played += 1;
      home.pointsFor += m.homeScore;
      home.pointsAgainst += m.awayScore;
      away.pointsFor += m.awayScore;
      away.pointsAgainst += m.homeScore;

      const homeDiff = m.homeScore - m.awayScore;
      if (!home.headToHead[m.awayTeamId]) home.headToHead[m.awayTeamId] = { won: 0, diff: 0 };
      if (!away.headToHead[m.homeTeamId]) away.headToHead[m.homeTeamId] = { won: 0, diff: 0 };

      home.headToHead[m.awayTeamId].diff += homeDiff;
      away.headToHead[m.homeTeamId].diff -= homeDiff;

      if (m.homeScore > m.awayScore) {
        home.won += 1;
        home.points += 2; // FIBA: 2 pts for win
        home.headToHead[m.awayTeamId].won += 1;
        away.lost += 1;
        away.points += 1; // FIBA: 1 pt for completed match loss
      } else {
        away.won += 1;
        away.points += 2;
        away.headToHead[m.homeTeamId].won += 1;
        home.lost += 1;
        home.points += 1;
      }
    });

    // 3. Compute pointDiff & streaks
    const standingsList: TeamStandingRow[] = Array.from(teamMap.values()).map((t) => {
      t.pointDiff = t.pointsFor - t.pointsAgainst;
      t.streak = t.won > 0 ? `W${t.won}` : t.lost > 0 ? `L${t.lost}` : "-";
      return t;
    });

    // 4. Sort with FIBA tie-break (Points -> Head-to-Head -> Point Diff -> Points For)
    standingsList.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;

      // Head-to-head tie break
      const aH2H = a.headToHead[b.teamId];
      const bH2H = b.headToHead[a.teamId];
      if (aH2H && bH2H && aH2H.won !== bH2H.won) {
        return bH2H.won - aH2H.won;
      }
      if (aH2H && bH2H && aH2H.diff !== bH2H.diff) {
        return bH2H.diff - aH2H.diff;
      }

      // Point difference overall
      if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
      return b.pointsFor - a.pointsFor;
    });

    // Assign ranks
    const rankedStandings = standingsList.map((row, index) => ({
      ...row,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      count: rankedStandings.length,
      data: rankedStandings,
      isOfficial: !includePending,
      tieBreakMethod: "FIBA_OFFICIAL_POINTS_AND_H2H",
    });
  } catch (error) {
    console.error("[TOURNAMENT STANDINGS API] Error:", error);
    return NextResponse.json(
      { success: false, error: "ไม่สามารถประมวลผลตารางคะแนนได้" },
      { status: 500 }
    );
  }
}
