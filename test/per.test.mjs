import test from "node:test";
import assert from "node:assert/strict";
import { calculatePER, calculatePercentage, calculatePerGame, calculateRadarMetrics } from "../lib/analytics/per.ts";

test("calculatePER accurately calculates standardized PER according to specification formula", () => {
  // PTS: 24, REB: 8, AST: 6, STL: 3, BLK: 2
  // Missed FG: 6, Missed FT: 2, TO: 3, Fouls: 2
  // Games: 1
  // Positive: 24 + 8 + 6 + 3 + 2 = 43
  // Negative: 6 + 2 + 3 + 2 = 13
  // PER = (43 - 13) / 1 = 30.00
  const totals = {
    gamesPlayed: 1,
    points: 24,
    rebounds: 8,
    assists: 6,
    steals: 3,
    blocks: 2,
    missedFg: 6,
    missedFt: 2,
    turnovers: 3,
    fouls: 2,
  };

  const per = calculatePER(totals);
  assert.equal(per, 30.0);
});

test("calculatePER handles multiple games played correctly", () => {
  const totals = {
    gamesPlayed: 5,
    points: 100,
    rebounds: 40,
    assists: 25,
    steals: 10,
    blocks: 5,
    missedFg: 30,
    missedFt: 10,
    turnovers: 15,
    fouls: 10,
  };
  // Positive: 100 + 40 + 25 + 10 + 5 = 180
  // Negative: 30 + 10 + 15 + 10 = 65
  // (180 - 65) / 5 = 115 / 5 = 23.00
  const per = calculatePER(totals);
  assert.equal(per, 23.0);
});

test("calculatePER returns 0 for zero games played without division by zero error", () => {
  const totals = {
    gamesPlayed: 0,
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    missedFg: 0,
    missedFt: 0,
    turnovers: 0,
    fouls: 0,
  };
  const per = calculatePER(totals);
  assert.equal(per, 0.0);
});

test("calculatePercentage calculates field goal percentage correctly", () => {
  assert.equal(calculatePercentage(8, 2), 80.0);
  assert.equal(calculatePercentage(0, 0), 0.0);
  assert.equal(calculatePercentage(7, 7), 50.0);
});

test("calculatePerGame computes per game averages", () => {
  assert.equal(calculatePerGame(120, 6), 20.0);
  assert.equal(calculatePerGame(25, 4), 6.3);
});
