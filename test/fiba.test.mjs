import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateFibaEff,
  calculateEffectiveFg,
  calculateTrueShooting,
  calculateAstToRatio,
  calculatePer40Minutes,
  calculateFibaSeasonMetrics,
} from "../lib/analytics/fiba.ts";

test("calculateFibaEff accurately calculates standardized FIBA EFF formula", () => {
  // Test case: 24 PTS, 8 FGM / 14 FGA, 3 3PM / 6 3PA, 5 FTM / 6 FTA, 3 OREB, 5 DREB (8 REB), 6 AST, 2 STL, 1 BLK, 3 TO, 2 PF, 32 MIN
  const stats = {
    pts: 24,
    fgm: 8,
    fga: 14, // missed 6
    threepm: 3,
    threepa: 6,
    ftm: 5,
    fta: 6, // missed 1
    oreb: 3,
    dreb: 5, // total reb = 8
    ast: 6,
    stl: 2,
    blk: 1,
    to: 3,
    pf: 2,
    minutes: 32,
  };

  // Positive: 24 + 8 + 6 + 2 + 1 = 41
  // Negative: (14 - 8) + (6 - 5) + 3 = 6 + 1 + 3 = 10
  // EFF = 41 - 10 = 31
  const eff = calculateFibaEff(stats);
  assert.equal(eff, 31);
});

test("calculateEffectiveFg computes eFG% correctly with 3-point bonus", () => {
  // 8 FGM with 3 3PM on 14 FGA: (8 + 0.5 * 3) / 14 * 100 = 9.5 / 14 * 100 = 67.857... -> 67.9%
  const efg = calculateEffectiveFg({ fgm: 8, threepm: 3, fga: 14 });
  assert.equal(efg, 67.9);

  // 0 attempts handles safely
  assert.equal(calculateEffectiveFg({ fgm: 0, threepm: 0, fga: 0 }), 0);
});

test("calculateTrueShooting computes TS% including free throws", () => {
  // 24 PTS on 14 FGA and 6 FTA: 24 / (2 * (14 + 0.44 * 6)) * 100 = 24 / (2 * 16.64) * 100 = 24 / 33.28 * 100 = 72.115... -> 72.1%
  const ts = calculateTrueShooting({ pts: 24, fga: 14, fta: 6 });
  assert.equal(ts, 72.1);

  // 0 attempts handles safely
  assert.equal(calculateTrueShooting({ pts: 0, fga: 0, fta: 0 }), 0);
});

test("calculateAstToRatio computes AST/TO ratio accurately", () => {
  assert.equal(calculateAstToRatio({ ast: 6, to: 3 }), 2.0);
  assert.equal(calculateAstToRatio({ ast: 7, to: 2 }), 3.5);
  // Zero turnovers returns ast without division error
  assert.equal(calculateAstToRatio({ ast: 5, to: 0 }), 5);
});

test("calculatePer40Minutes scales stats to FIBA standard 40-minute regulation", () => {
  // 24 points in 32 minutes -> (24 / 32) * 40 = 30.0 points per 40 min
  assert.equal(calculatePer40Minutes(24, 32), 30.0);
  // 0 minutes handles safely
  assert.equal(calculatePer40Minutes(10, 0), 0);
});

test("calculateFibaSeasonMetrics accurately calculates season EFF and EFF/G", () => {
  const athleteRaw = {
    gamesPlayed: 10,
    points: 214,
    rebounds: 58,
    assists: 76,
    steals: 28,
    blocks: 6,
    turnovers: 24,
    fgMade: 78,
    fgMissed: 70,
    ftMade: 36,
    ftMissed: 8,
    fg3Made: 22,
    fg3Missed: 35,
  };

  const metrics = calculateFibaSeasonMetrics(athleteRaw);
  // Positive: 214 + 58 + 76 + 28 + 6 = 382
  // Negative: 70 + 8 + 24 = 102
  // effTotal = 382 - 102 = 280
  // effPerGame = 280 / 10 = 28.0
  assert.equal(metrics.effTotal, 280);
  assert.equal(metrics.effPerGame, 28.0);
  assert.equal(metrics.efgPct, 60.1);
  assert.equal(metrics.tsPct, 63.9);
  assert.equal(metrics.astToRatio, 3.17);
});
