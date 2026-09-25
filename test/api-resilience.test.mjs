import test from "node:test";
import assert from "node:assert/strict";
import { getFallbackActivityMetrics } from "../lib/analytics/athlete-activity.ts";
import { mockAthleteProfiles, mockLeaderboardAthletes } from "../lib/db/seed-data.ts";

test("getFallbackActivityMetrics returns valid 4-tier timeframe summaries", () => {
  const athleteIds = ["ath-1", "ath-2", "ath-4", "ath-5"];

  for (const id of athleteIds) {
    const metrics = getFallbackActivityMetrics(id);
    assert.ok(metrics.last1Month, "last1Month must be defined");
    assert.ok(metrics.last6Months, "last6Months must be defined");
    assert.ok(metrics.last1Year, "last1Year must be defined");
    assert.ok(metrics.allTime, "allTime must be defined");

    assert.equal(metrics.last1Month.timeframe, "1M");
    assert.equal(metrics.last6Months.timeframe, "6M");
    assert.equal(metrics.last1Year.timeframe, "1Y");
    assert.equal(metrics.allTime.timeframe, "ALL");

    assert.ok(metrics.allTime.matchCount >= metrics.last1Year.matchCount);
    assert.ok(metrics.last1Year.matchCount >= metrics.last6Months.matchCount);
    assert.ok(metrics.last6Months.matchCount >= metrics.last1Month.matchCount);

    assert.ok(metrics.allTime.avgMinutesPerGame > 0);
  }
});

test("mockAthleteProfiles match with mockLeaderboardAthletes", () => {
  for (const stats of mockLeaderboardAthletes) {
    const profile = mockAthleteProfiles[stats.athleteId];
    assert.ok(
      profile,
      `Leaderboard athlete ${stats.athleteId} (${stats.firstName} ${stats.lastName}) must have a profile`
    );
    assert.equal(profile.firstName, stats.firstName);
    assert.equal(profile.lastName, stats.lastName);
  }
});
