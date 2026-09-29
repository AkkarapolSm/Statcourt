import { prisma } from "@/lib/db/prisma";
import { calculatePER, calculatePercentage, calculatePerGame } from "@/lib/analytics/per";

/**
 * Synchronizes and updates TournamentStandings based on all verified FINAL matches.
 */
export async function syncTournamentStandings(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      registrations: {
        include: { team: true },
      },
      matches: {
        where: { resultStatus: "FINAL" },
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
    },
  });

  if (!tournament) return;

  interface TeamRecord {
    teamId: string;
    played: number;
    won: number;
    lost: number;
    pointsFor: number;
    pointsAgainst: number;
    pointDiff: number;
    points: number; // 2 for win, 1 for loss
    headToHead: Record<string, { won: number; diff: number }>;
  }

  const teamMap = new Map<string, TeamRecord>();

  // 1. Initialize all registered teams
  for (const reg of tournament.registrations) {
    teamMap.set(reg.teamId, {
      teamId: reg.teamId,
      played: 0,
      won: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
      points: 0,
      headToHead: {},
    });
  }

  // Ensure teams in matches exist in map
  for (const m of tournament.matches) {
    if (!teamMap.has(m.homeTeamId)) {
      teamMap.set(m.homeTeamId, {
        teamId: m.homeTeamId,
        played: 0,
        won: 0,
        lost: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
        points: 0,
        headToHead: {},
      });
    }
    if (!teamMap.has(m.awayTeamId)) {
      teamMap.set(m.awayTeamId, {
        teamId: m.awayTeamId,
        played: 0,
        won: 0,
        lost: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
        points: 0,
        headToHead: {},
      });
    }

    const home = teamMap.get(m.homeTeamId)!;
    const away = teamMap.get(m.awayTeamId)!;

    home.played += 1;
    away.played += 1;
    home.pointsFor += m.homeScore;
    home.pointsAgainst += m.awayScore;
    away.pointsFor += m.awayScore;
    away.pointsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.won += 1;
      home.points += 2;
      away.lost += 1;
      away.points += 1;
    } else if (m.awayScore > m.homeScore) {
      away.won += 1;
      away.points += 2;
      home.lost += 1;
      home.points += 1;
    } else {
      // Tie (rare in basketball, 1 pt each)
      home.points += 1;
      away.points += 1;
    }

    home.pointDiff = home.pointsFor - home.pointsAgainst;
    away.pointDiff = away.pointsFor - away.pointsAgainst;

    if (!home.headToHead[m.awayTeamId]) home.headToHead[m.awayTeamId] = { won: 0, diff: 0 };
    if (!away.headToHead[m.homeTeamId]) away.headToHead[m.homeTeamId] = { won: 0, diff: 0 };

    if (m.homeScore > m.awayScore) {
      home.headToHead[m.awayTeamId].won += 1;
      home.headToHead[m.awayTeamId].diff += (m.homeScore - m.awayScore);
      away.headToHead[m.homeTeamId].diff -= (m.homeScore - m.awayScore);
    } else if (m.awayScore > m.homeScore) {
      away.headToHead[m.homeTeamId].won += 1;
      away.headToHead[m.homeTeamId].diff += (m.awayScore - m.homeScore);
      home.headToHead[m.awayTeamId].diff -= (m.awayScore - m.homeScore);
    }
  }

  // 2. Sort according to FIBA Official Tournament Rules
  const sorted = Array.from(teamMap.values()).sort((a, b) => {
    // 1. Classification Points
    if (b.points !== a.points) return b.points - a.points;

    // 2. Head-to-Head
    const h2hA = a.headToHead[b.teamId];
    const h2hB = b.headToHead[a.teamId];
    if (h2hA && h2hB) {
      if (h2hA.won !== h2hB.won) return h2hB.won - h2hA.won;
      if (h2hA.diff !== h2hB.diff) return h2hB.diff - h2hA.diff;
    }

    // 3. Overall Goal Difference
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;

    // 4. Points For
    return b.pointsFor - a.pointsFor;
  });

  // 3. Upsert into database
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    await prisma.tournamentStanding.upsert({
      where: {
        tournamentId_teamId: {
          tournamentId,
          teamId: item.teamId,
        },
      },
      update: {
        rank: i + 1,
        played: item.played,
        won: item.won,
        lost: item.lost,
        pointsFor: item.pointsFor,
        pointsAgainst: item.pointsAgainst,
        pointDiff: item.pointDiff,
        points: item.points,
      },
      create: {
        tournamentId,
        teamId: item.teamId,
        groupName: "A",
        rank: i + 1,
        played: item.played,
        won: item.won,
        lost: item.lost,
        pointsFor: item.pointsFor,
        pointsAgainst: item.pointsAgainst,
        pointDiff: item.pointDiff,
        points: item.points,
      },
    });
  }
}

/**
 * Recalculates AthleteSeasonStats for all athletes involved in a match
 * across all verified FINAL matches in the season.
 */
export async function syncMatchAthleteStats(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      tournamentId: true,
      tournament: { select: { id: true, name: true } },
      events: {
        where: { athleteId: { not: null } },
        select: { athleteId: true },
      },
      participants: {
        select: { athleteId: true },
      },
    },
  });

  if (!match) return;

  const season = "2026";
  const athleteIds = new Set<string>();

  match.events.forEach((e) => {
    if (e.athleteId) athleteIds.add(e.athleteId);
  });
  match.participants.forEach((p) => {
    if (p.athleteId) athleteIds.add(p.athleteId);
  });

  for (const athleteId of Array.from(athleteIds)) {
    // 1. Find all active events for this athlete across FINAL matches
    const athleteEvents = await prisma.matchEvent.findMany({
      where: {
        athleteId,
        reversedAt: null,
        match: {
          resultStatus: "FINAL",
        },
      },
      select: {
        matchId: true,
        eventType: true,
        points: true,
      },
    });

    // 2. Count distinct FINAL matches played
    const distinctMatchIds = new Set(athleteEvents.map((e) => e.matchId));

    // Also include matches from MatchParticipant where resultStatus is FINAL
    const participations = await prisma.matchParticipant.findMany({
      where: {
        athleteId,
        match: {
          resultStatus: "FINAL",
        },
      },
      select: { matchId: true },
    });
    participations.forEach((p) => distinctMatchIds.add(p.matchId));

    const gamesPlayed = distinctMatchIds.size;

    let points = 0;
    let rebounds = 0;
    let assists = 0;
    let steals = 0;
    let blocks = 0;
    let turnovers = 0;
    let fouls = 0;
    let fgMade = 0;
    let fgMissed = 0;
    let ftMade = 0;
    let ftMissed = 0;
    let fg3Made = 0;
    let fg3Missed = 0;

    for (const ev of athleteEvents) {
      points += ev.points || 0;

      switch (ev.eventType) {
        case "TWO_POINT_MADE":
          fgMade += 1;
          break;
        case "TWO_POINT_MISSED":
          fgMissed += 1;
          break;
        case "THREE_POINT_MADE":
          fgMade += 1;
          fg3Made += 1;
          break;
        case "THREE_POINT_MISSED":
          fgMissed += 1;
          fg3Missed += 1;
          break;
        case "FREE_THROW_MADE":
          ftMade += 1;
          break;
        case "FREE_THROW_MISSED":
          ftMissed += 1;
          break;
        case "REBOUND":
        case "OFFENSIVE_REBOUND":
        case "DEFENSIVE_REBOUND":
          rebounds += 1;
          break;
        case "ASSIST":
          assists += 1;
          break;
        case "STEAL":
          steals += 1;
          break;
        case "BLOCK":
          blocks += 1;
          break;
        case "TURNOVER":
          turnovers += 1;
          break;
        case "FOUL":
        case "PERSONAL_FOUL":
        case "TECHNICAL_FOUL":
          fouls += 1;
          break;
      }
    }

    // Averages and rates
    const ppg = calculatePerGame(points, gamesPlayed);
    const rpg = calculatePerGame(rebounds, gamesPlayed);
    const apg = calculatePerGame(assists, gamesPlayed);
    const spg = calculatePerGame(steals, gamesPlayed);
    const bpg = calculatePerGame(blocks, gamesPlayed);
    const fgPct = calculatePercentage(fgMade, fgMissed);
    const ftPct = calculatePercentage(ftMade, ftMissed);

    const fgAttempts = fgMade + fgMissed;
    const ftAttempts = ftMade + ftMissed;
    const efgPct = fgAttempts > 0
      ? Math.round(((fgMade + 0.5 * fg3Made) / fgAttempts) * 1000) / 10
      : 0.0;

    const tsDenom = 2 * (fgAttempts + 0.44 * ftAttempts);
    const tsPct = tsDenom > 0
      ? Math.round((points / tsDenom) * 1000) / 10
      : 0.0;

    const astToRatio = turnovers > 0
      ? Math.round((assists / turnovers) * 100) / 100
      : assists > 0 ? assists : 0.0;

    // FIBA Efficiency
    const positiveContributions = points + rebounds + assists + steals + blocks;
    const negativeDeductions = fgMissed + ftMissed + turnovers;
    const eff = positiveContributions - negativeDeductions;
    const effPerGame = calculatePerGame(eff, gamesPlayed);

    const per = calculatePER({
      gamesPlayed,
      points,
      rebounds,
      assists,
      steals,
      blocks,
      missedFg: fgMissed,
      missedFt: ftMissed,
      turnovers,
      fouls,
    });

    const athleteProfile = await prisma.athleteProfile.findUnique({
      where: { id: athleteId },
      select: { id: true, primaryPosition: true },
    });

    if (!athleteProfile) continue;

    const ageCategory = "U18";

    await prisma.athleteSeasonStats.upsert({
      where: {
        athleteId_season_ageCategory: {
          athleteId,
          season,
          ageCategory,
        },
      },
      update: {
        gamesPlayed,
        points,
        rebounds,
        assists,
        steals,
        blocks,
        turnovers,
        fouls,
        fgMade,
        fgMissed,
        ftMade,
        ftMissed,
        fg3Made,
        fg3Missed,
        eff,
        effPerGame,
        efgPct,
        tsPct,
        astToRatio,
        ppg,
        rpg,
        apg,
        spg,
        bpg,
        fgPct,
        ftPct,
        per,
        tournamentId: match.tournamentId,
      },
      create: {
        athleteId,
        season,
        ageCategory,
        gamesPlayed,
        points,
        rebounds,
        assists,
        steals,
        blocks,
        turnovers,
        fouls,
        fgMade,
        fgMissed,
        ftMade,
        ftMissed,
        fg3Made,
        fg3Missed,
        eff,
        effPerGame,
        efgPct,
        tsPct,
        astToRatio,
        ppg,
        rpg,
        apg,
        spg,
        bpg,
        fgPct,
        ftPct,
        per,
        tournamentId: match.tournamentId,
      },
    });
  }
}

/**
 * Master workflow reconciliation: runs on match APPROVE and REOPEN.
 */
export async function reconcileMatchWorkflow(matchId: string, action: "APPROVE" | "REOPEN") {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { tournamentId: true },
  });

  // 1. Sync player season stats
  await syncMatchAthleteStats(matchId);

  // 2. Sync tournament standings if match belongs to a tournament
  if (match?.tournamentId) {
    await syncTournamentStandings(match.tournamentId);
  }
}
