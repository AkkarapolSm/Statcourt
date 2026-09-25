import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateActivityFromParticipations,
  getFallbackActivityMetrics,
} from "../lib/analytics/athlete-activity.ts";

test("calculateActivityFromParticipations computes 1M, 6M, 1Y, and ALL with unique tournaments", () => {
  const refDate = new Date("2026-09-22T00:00:00Z");

  const sampleParticipations = [
    // 10 days ago (Within 1M, 6M, 1Y, ALL) - Tournament A
    {
      minutesPlayed: 32,
      match: {
        id: "m-1",
        tournamentId: "tourn-A",
        createdAt: new Date("2026-09-12T00:00:00Z"),
      },
    },
    // 20 days ago (Within 1M, 6M, 1Y, ALL) - Tournament A (duplicate tournament)
    {
      minutesPlayed: 28,
      match: {
        id: "m-2",
        tournamentId: "tourn-A",
        createdAt: new Date("2026-09-02T00:00:00Z"),
      },
    },
    // 60 days ago (~2 months: within 6M, 1Y, ALL) - Tournament B
    {
      minutesPlayed: 30,
      match: {
        id: "m-3",
        tournamentId: "tourn-B",
        createdAt: new Date("2026-07-24T00:00:00Z"),
      },
    },
    // 120 days ago (~4 months: within 6M, 1Y, ALL) - Tournament C
    {
      minutesPlayed: 26,
      match: {
        id: "m-4",
        tournamentId: "tourn-C",
        createdAt: new Date("2026-05-25T00:00:00Z"),
      },
    },
    // 240 days ago (~8 months: within 1Y, ALL) - Tournament D
    {
      minutesPlayed: 34,
      match: {
        id: "m-5",
        tournamentId: "tourn-D",
        createdAt: new Date("2026-01-25T00:00:00Z"),
      },
    },
    // 400 days ago (> 1 year: ALL only) - Tournament E
    {
      minutesPlayed: 20,
      match: {
        id: "m-6",
        tournamentId: "tourn-E",
        createdAt: new Date("2025-08-18T00:00:00Z"),
      },
    },
  ];

  const metrics = calculateActivityFromParticipations(sampleParticipations, refDate);

  // 1 Month: m-1, m-2 -> 2 matches, 1 unique tournament (tourn-A), avg minutes = (32+28)/2 = 30
  assert.equal(metrics.last1Month.matchCount, 2);
  assert.equal(metrics.last1Month.tournamentCount, 1);
  assert.equal(metrics.last1Month.avgMinutesPerGame, 30.0);

  // 6 Months: m-1, m-2, m-3, m-4 -> 4 matches, 3 unique tournaments (A, B, C), avg minutes = (32+28+30+26)/4 = 29
  assert.equal(metrics.last6Months.matchCount, 4);
  assert.equal(metrics.last6Months.tournamentCount, 3);
  assert.equal(metrics.last6Months.avgMinutesPerGame, 29.0);

  // 1 Year: m-1, m-2, m-3, m-4, m-5 -> 5 matches, 4 unique tournaments (A, B, C, D)
  assert.equal(metrics.last1Year.matchCount, 5);
  assert.equal(metrics.last1Year.tournamentCount, 4);
  assert.equal(metrics.last1Year.avgMinutesPerGame, 30.0);

  // All Time: all 6 matches, 5 unique tournaments (A, B, C, D, E)
  assert.equal(metrics.allTime.matchCount, 6);
  assert.equal(metrics.allTime.tournamentCount, 5);
  assert.equal(metrics.allTime.avgMinutesPerGame, 28.3);
});

test("calculateActivityFromParticipations handles empty array gracefully without division by zero", () => {
  const metrics = calculateActivityFromParticipations([]);

  assert.equal(metrics.last1Month.matchCount, 0);
  assert.equal(metrics.last1Month.tournamentCount, 0);
  assert.equal(metrics.last1Month.avgMinutesPerGame, 0);

  assert.equal(metrics.allTime.matchCount, 0);
  assert.equal(metrics.allTime.tournamentCount, 0);
  assert.equal(metrics.allTime.avgMinutesPerGame, 0);
});

test("getFallbackActivityMetrics provides structured valid data", () => {
  const fallback = getFallbackActivityMetrics("ath-1");

  assert.ok(fallback.last1Month.matchCount > 0);
  assert.ok(fallback.last6Months.matchCount >= fallback.last1Month.matchCount);
  assert.ok(fallback.last1Year.matchCount >= fallback.last6Months.matchCount);
  assert.ok(fallback.allTime.matchCount >= fallback.last1Year.matchCount);
});
