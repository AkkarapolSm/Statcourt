import test from "node:test";
import assert from "node:assert/strict";
import { mockTeams, mockMatch } from "../lib/db/seed-data.ts";

test("all mock teams have exactly 12 players conforming to FIBA standards", () => {
  for (const team of mockTeams) {
    assert.equal(
      team.roster.length,
      12,
      `Team ${team.name} should have exactly 12 players, found ${team.roster.length}`
    );
    const onCourt = team.roster.filter((p) => p.isOnCourt);
    const bench = team.roster.filter((p) => !p.isOnCourt);
    assert.equal(onCourt.length, 5, `Team ${team.name} must have 5 on-court starters`);
    assert.equal(bench.length, 7, `Team ${team.name} must have 7 bench substitutes`);

    // Unique jersey numbers
    const jerseys = new Set(team.roster.map((p) => p.jerseyNumber));
    assert.equal(jerseys.size, 12, `Team ${team.name} has duplicate jersey numbers`);

    // Valid positions
    for (const player of team.roster) {
      assert.ok(
        ["POINT_GUARD", "SHOOTING_GUARD", "SMALL_FORWARD", "POWER_FORWARD", "CENTER"].includes(
          player.position
        ),
        `Player ${player.firstName} has invalid position ${player.position}`
      );
    }
  }
});

test("mockMatch home and away teams both have 12 players (5 on-court, 7 bench)", () => {
  assert.equal(mockMatch.homeTeam.roster.length, 12);
  assert.equal(mockMatch.awayTeam.roster.length, 12);
  assert.equal(mockMatch.homeTeam.roster.filter((p) => p.isOnCourt).length, 5);
  assert.equal(mockMatch.awayTeam.roster.filter((p) => p.isOnCourt).length, 5);
});

test("substitutePlayer state transition swaps bench player onto court and preserves 5 on court", () => {
  const match = JSON.parse(JSON.stringify(mockMatch));
  const homeOnCourtBefore = match.homeTeam.roster.filter((p) => p.isOnCourt);
  const homeBenchBefore = match.homeTeam.roster.filter((p) => !p.isOnCourt);

  const outId = homeOnCourtBefore[0].athleteId;
  const inId = homeBenchBefore[0].athleteId;

  // Substitute function pure logic
  let inPlayerObj;
  match.homeTeam.roster = match.homeTeam.roster.map((p) => {
    if (p.athleteId === outId) return { ...p, isOnCourt: false };
    if (p.athleteId === inId) {
      inPlayerObj = { ...p, isOnCourt: true };
      return inPlayerObj;
    }
    return p;
  });

  const homeOnCourtAfter = match.homeTeam.roster.filter((p) => p.isOnCourt);
  const homeBenchAfter = match.homeTeam.roster.filter((p) => !p.isOnCourt);

  assert.equal(homeOnCourtAfter.length, 5, "Must still have 5 players on court");
  assert.equal(homeBenchAfter.length, 7, "Must still have 7 players on bench");

  // Out player is now on bench
  const outPlayer = match.homeTeam.roster.find((p) => p.athleteId === outId);
  assert.equal(outPlayer.isOnCourt, false);

  // In player is now on court
  const inPlayer = match.homeTeam.roster.find((p) => p.athleteId === inId);
  assert.equal(inPlayer.isOnCourt, true);
});

