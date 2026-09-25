import test from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeStatsForTier,
  canAccessAdvancedMetrics,
  canAccessShotChart,
  canAccessFullLeaderboard,
  canExportTcasPdf,
  canAccessAdvancedScouting,
  getMaxMarketplaceItems,
  getMaxDailyVideoClips,
  calculateShotZones,
} from "../lib/permissions.ts";

const mockSampleStats = {
  athleteId: "ath-test-1",
  firstName: "Thanakorn",
  lastName: "Siriphan",
  jerseyNumber: 7,
  schoolOrClub: "Bangkok Christian College",
  province: "Bangkok",
  position: "POINT_GUARD",
  ageCategory: "U18",
  gamesPlayed: 10,
  points: 214,
  rebounds: 58,
  assists: 76,
  steals: 28,
  blocks: 6,
  turnovers: 24,
  fouls: 18,
  fgMade: 78,
  fgMissed: 70,
  ftMade: 36,
  ftMissed: 8,
  fg3Made: 22,
  fg3Missed: 35,
  eff: 280,
  effPerGame: 28.0,
  efgPct: 60.1,
  tsPct: 63.9,
  astToRatio: 3.17,
  per: 27.5,
  ppg: 21.4,
  rpg: 5.8,
  apg: 7.6,
  spg: 2.8,
  bpg: 0.6,
  fgPct: 52.7,
  ftPct: 81.8,
  scoringRating: 92,
  playmakingRating: 95,
  defenseRating: 84,
  athleticismRating: 86,
};

test("sanitizeStatsForTier strips advanced metrics for FREE tier", () => {
  const result = sanitizeStatsForTier(mockSampleStats, "FREE");

  // Free fields must be preserved
  assert.equal(result.points, 214);
  assert.equal(result.rebounds, 58);
  assert.equal(result.assists, 76);
  assert.equal(result.eff, 280);
  assert.equal(result.effPerGame, 28.0);

  // Pro-only fields must be nullified
  assert.equal(result.trueShootingPct, null);
  assert.equal(result.effectiveFgPct, null);
  assert.equal(result.astToRatio, null);
  assert.equal(result.shotChartData, null);
  assert.equal(result.shotZones, null);
  assert.equal(result.effTrendHistory, null);
  assert.equal(result.isProGated, true);
});

test("sanitizeStatsForTier returns full advanced metrics for PRO tier", () => {
  const result = sanitizeStatsForTier(mockSampleStats, "PRO");

  // All fields must be populated
  assert.equal(result.points, 214);
  assert.equal(result.trueShootingPct, 63.9);
  assert.equal(result.effectiveFgPct, 60.1);
  assert.equal(result.astToRatio, 3.17);
  assert.ok(Array.isArray(result.shotChartData));
  assert.ok(result.shotChartData.length > 0);
  assert.ok(Array.isArray(result.shotZones));
  assert.equal(result.shotZones.length, 5);
  assert.ok(Array.isArray(result.effTrendHistory));
  assert.equal(result.isProGated, false);
});

test("capabilities matrix enforces correct tier permissions", () => {
  assert.equal(canAccessAdvancedMetrics("FREE"), false);
  assert.equal(canAccessAdvancedMetrics("PRO"), true);

  assert.equal(canAccessShotChart("FREE"), false);
  assert.equal(canAccessShotChart("PRO"), true);

  assert.equal(canAccessFullLeaderboard("FREE"), false);
  assert.equal(canAccessFullLeaderboard("PRO"), true);

  assert.equal(canExportTcasPdf("FREE"), false);
  assert.equal(canExportTcasPdf("PRO"), true);

  assert.equal(canAccessAdvancedScouting("FREE"), false);
  assert.equal(canAccessAdvancedScouting("PRO"), true);

  assert.equal(getMaxMarketplaceItems("FREE"), 1);
  assert.equal(getMaxMarketplaceItems("PRO"), 999);

  assert.equal(getMaxDailyVideoClips("FREE"), 5);
  assert.equal(getMaxDailyVideoClips("PRO"), 999);
});

test("calculateShotZones groups 5 standard basketball zones accurately", () => {
  const mockShots = [
    { id: "1", x: 50, y: 12, made: true, zone: "PAINT_RESTRICTED", points: 2 },
    { id: "2", x: 50, y: 14, made: false, zone: "PAINT_RESTRICTED", points: 2 },
    { id: "3", x: 10, y: 15, made: true, zone: "CORNER_3_LEFT", points: 3 },
  ];

  const zones = calculateShotZones(mockShots);
  const paintZone = zones.find((z) => z.zone === "PAINT_RESTRICTED");
  assert.ok(paintZone);
  assert.equal(paintZone.attempted, 2);
  assert.equal(paintZone.made, 1);
  assert.equal(paintZone.percentage, 50);

  const leftCorner = zones.find((z) => z.zone === "CORNER_3_LEFT");
  assert.ok(leftCorner);
  assert.equal(leftCorner.attempted, 1);
  assert.equal(leftCorner.made, 1);
  assert.equal(leftCorner.percentage, 100);
});
