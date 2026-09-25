export interface RawPlayerTotals {
  gamesPlayed: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  missedFg: number;
  missedFt: number;
  turnovers: number;
  fouls: number;
}

/**
 * Calculates the standardized Player Efficiency Rating (PER) for grassroots basketball.
 * Formula:
 * PER = [PTS + REB + AST + STL + BLK - (Missed FG + Missed FT + TO + Fouls)] / Games Played
 *
 * @param totals Aggregated box score totals for the athlete.
 * @returns PER rounded to 2 decimal places, or 0.00 if gamesPlayed <= 0.
 */
export function calculatePER(totals: RawPlayerTotals): number {
  if (!totals || totals.gamesPlayed <= 0) {
    return 0.0;
  }

  const positiveContributions =
    totals.points + totals.rebounds + totals.assists + totals.steals + totals.blocks;

  const negativeDeductions =
    totals.missedFg + totals.missedFt + totals.turnovers + totals.fouls;

  const rawPer = (positiveContributions - negativeDeductions) / totals.gamesPlayed;

  return Math.round(rawPer * 100) / 100;
}

/**
 * Calculates shooting percentage.
 * @param made Field goals / free throws made
 * @param missed Field goals / free throws missed
 * @returns Percentage rounded to 1 decimal place (e.g. 52.4)
 */
export function calculatePercentage(made: number, missed: number): number {
  const attempts = made + missed;
  if (attempts <= 0) return 0.0;
  return Math.round((made / attempts) * 1000) / 10;
}

/**
 * Computes per-game averages.
 */
export function calculatePerGame(stat: number, gamesPlayed: number): number {
  if (gamesPlayed <= 0) return 0.0;
  return Math.round((stat / gamesPlayed) * 10) / 10;
}

/**
 * Derives normalized 0-100 radar metric ratings from season averages.
 */
export function calculateRadarMetrics(stats: {
  ppg: number;
  apg: number;
  rpg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  per: number;
}) {
  // Scoring: weighted by PPG and FG%
  const scoring = Math.min(100, Math.round((stats.ppg / 28) * 60 + (stats.fgPct / 65) * 40));
  
  // Playmaking: weighted by APG and low turnover factor
  const playmaking = Math.min(100, Math.round((stats.apg / 9) * 85 + (stats.per > 15 ? 15 : 5)));
  
  // Defense: weighted by SPG, BPG, and defensive rebounds
  const defense = Math.min(100, Math.round((stats.spg / 3.0) * 45 + (stats.bpg / 2.0) * 35 + 20));
  
  // Athleticism: overall activity rate and rebounding impact
  const athleticism = Math.min(100, Math.round((stats.rpg / 12) * 50 + (stats.per / 25) * 50));

  return {
    scoringRating: Math.max(35, scoring),
    playmakingRating: Math.max(30, playmaking),
    defenseRating: Math.max(35, defense),
    athleticismRating: Math.max(40, athleticism),
  };
}
