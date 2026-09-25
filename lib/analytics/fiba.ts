/**
 * FIBA Official Basketball Rules & FIBA LiveStats Standard Analytics Engine
 *
 * Implements standardized FIBA Efficiency (EFF), Advanced Shooting Metrics (eFG%, TS%),
 * Assist-to-Turnover ratio, and FIBA 40-Minute per-minute scaling.
 */

export interface PlayerGameStats {
  pts: number;
  fgm: number;
  fga: number;
  threepm: number;
  threepa: number;
  ftm: number;
  fta: number;
  oreb: number;
  dreb: number;
  ast: number;
  stl: number;
  blk: number;
  to: number;
  pf: number;
  minutes: number;
}

/**
 * Standard FIBA Efficiency (EFF) Formula
 * Formula: (PTS + REB + AST + STL + BLK) - [(FGA - FGM) + (FTA - FTM) + TO]
 * Positive Impact: PTS + (OREB + DREB) + AST + STL + BLK
 * Negative Impact: Missed FG + Missed FT + TO
 */
export function calculateFibaEff(stats: PlayerGameStats): number {
  const positive = stats.pts + (stats.oreb + stats.dreb) + stats.ast + stats.stl + stats.blk;
  const missedFg = stats.fga - stats.fgm;
  const missedFt = stats.fta - stats.ftm;
  const negative = missedFg + missedFt + stats.to;

  return positive - negative;
}

/**
 * FIBA Effective Field Goal Percentage (eFG%)
 * Formula: ((FGM + 0.5 * 3PM) / FGA) * 100
 */
export function calculateEffectiveFg(stats: { fgm: number; threepm: number; fga: number }): number {
  if (stats.fga === 0) return 0;
  return Number((((stats.fgm + 0.5 * stats.threepm) / stats.fga) * 100).toFixed(1));
}

/**
 * True Shooting Percentage (TS%)
 * Formula: (PTS / (2 * (FGA + 0.44 * FTA))) * 100
 */
export function calculateTrueShooting(stats: { pts: number; fga: number; fta: number }): number {
  const attempts = 2 * (stats.fga + 0.44 * stats.fta);
  if (attempts === 0) return 0;
  return Number(((stats.pts / attempts) * 100).toFixed(1));
}

/**
 * Assist to Turnover Ratio
 * Formula: AST / TO
 */
export function calculateAstToRatio(stats: { ast: number; to: number }): number {
  if (stats.to === 0) return stats.ast;
  return Number((stats.ast / stats.to).toFixed(2));
}

/**
 * FIBA Per 40 Minutes Normalized Average
 * FIBA regulation consists of 4 x 10-minute quarters (40 minutes total).
 */
export function calculatePer40Minutes(stat: number, minutes: number): number {
  if (minutes === 0) return 0;
  return Number(((stat / minutes) * 40).toFixed(1));
}

/**
 * Calculate FIBA Season Totals & Averages for an athlete
 */
export function calculateFibaSeasonMetrics(raw: {
  gamesPlayed: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fgMade: number;
  fgMissed: number;
  ftMade: number;
  ftMissed: number;
  fg3Made: number;
  fg3Missed: number;
}) {
  const gp = Math.max(1, raw.gamesPlayed);
  const fga = raw.fgMade + raw.fgMissed;
  const fta = raw.ftMade + raw.ftMissed;

  const positive = raw.points + raw.rebounds + raw.assists + raw.steals + raw.blocks;
  const negative = raw.fgMissed + raw.ftMissed + raw.turnovers;
  const effTotal = positive - negative;
  const effPerGame = Number((effTotal / gp).toFixed(1));

  const efgPct = calculateEffectiveFg({
    fgm: raw.fgMade,
    threepm: raw.fg3Made,
    fga,
  });

  const tsPct = calculateTrueShooting({
    pts: raw.points,
    fga,
    fta,
  });

  const astToRatio = calculateAstToRatio({
    ast: raw.assists,
    to: raw.turnovers,
  });

  const ppg = Number((raw.points / gp).toFixed(1));
  const rpg = Number((raw.rebounds / gp).toFixed(1));
  const apg = Number((raw.assists / gp).toFixed(1));
  const spg = Number((raw.steals / gp).toFixed(1));
  const bpg = Number((raw.blocks / gp).toFixed(1));
  const fgPct = fga > 0 ? Number(((raw.fgMade / fga) * 100).toFixed(1)) : 0;
  const ftPct = fta > 0 ? Number(((raw.ftMade / fta) * 100).toFixed(1)) : 0;

  return {
    eff: effTotal,
    effTotal,
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
  };
}

