import test from "node:test";
import assert from "node:assert/strict";
import {
  mockAthleteProfiles,
  mockLeaderboardAthletes,
  mockMatches,
  mockTournaments,
} from "../lib/db/seed-data.ts";

test("mockAthleteProfiles contains all 11 registered athletes with valid biometrics", () => {
  const athleteIds = [
    "ath-1", "ath-2", "ath-3", "ath-4", "ath-5",
    "ath-6", "ath-7", "ath-8", "ath-9", "ath-10", "ath-11"
  ];

  for (const id of athleteIds) {
    const athlete = mockAthleteProfiles[id];
    assert.ok(athlete, `Athlete ${id} must exist in mockAthleteProfiles`);
    assert.equal(athlete.id, id);
    assert.ok(athlete.firstName.length > 0, `${id} firstName must not be empty`);
    assert.ok(athlete.lastName.length > 0, `${id} lastName must not be empty`);
    assert.ok(athlete.heightCm >= 170 && athlete.heightCm <= 220, `${id} heightCm must be realistic`);
    assert.ok(athlete.schoolOrClub.length > 0, `${id} schoolOrClub must not be empty`);
    assert.ok(
      ["POINT_GUARD", "SHOOTING_GUARD", "SMALL_FORWARD", "POWER_FORWARD", "CENTER"].includes(athlete.primaryPosition),
      `${id} primaryPosition must be a valid FIBA basketball position`
    );
  }
});

test("mockLeaderboardAthletes has accurate calculated stats", () => {
  assert.ok(mockLeaderboardAthletes.length >= 10, "Leaderboard must have at least 10 athletes");

  for (const athlete of mockLeaderboardAthletes) {
    assert.ok(athlete.athleteId, "athleteId must be defined");
    assert.ok(athlete.gamesPlayed > 0, "gamesPlayed must be greater than 0");
    assert.ok(athlete.eff >= 0, "eff must be non-negative");

    // effPerGame check with small floating point tolerance
    const expectedEffPerGame = Number((athlete.eff / athlete.gamesPlayed).toFixed(1));
    assert.ok(
      Math.abs(athlete.effPerGame - expectedEffPerGame) <= 0.1,
      `effPerGame for ${athlete.athleteId} (${athlete.effPerGame}) should match eff/gp (${expectedEffPerGame})`
    );
  }
});

test("mockMatches has valid tournament and team references", () => {
  assert.ok(mockMatches.length > 0, "mockMatches must not be empty");

  const tournamentIds = new Set(mockTournaments.map((t) => t.id));

  for (const match of mockMatches) {
    assert.ok(match.id, "match must have an id");
    assert.ok(match.homeTeamId, "match must have homeTeamId");
    assert.ok(match.awayTeamId, "match must have awayTeamId");
    assert.notEqual(match.homeTeamId, match.awayTeamId, "home and away teams must be different");
    assert.ok(tournamentIds.has(match.tournamentId), `match ${match.id} tournamentId must be valid`);
  }
});
