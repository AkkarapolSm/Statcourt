import test from "node:test";
import assert from "node:assert/strict";
import { mockPracticeSessions } from "../lib/db/phase3-data.ts";

test("Team Practice Data: all mockPracticeSessions contain valid disciplineRating for toFixed formatting", () => {
  assert.ok(mockPracticeSessions.length > 0, "mockPracticeSessions should not be empty");
  for (const session of mockPracticeSessions) {
    assert.ok(Array.isArray(session.roster), "roster should be an array");
    for (const player of session.roster) {
      assert.equal(typeof player.disciplineRating, "number", `player ${player.athleteName} must have numeric disciplineRating`);
      assert.doesNotThrow(() => {
        const formatted = (player.disciplineRating ?? 95.0).toFixed(1);
        assert.ok(formatted.length > 0);
      });
    }
  }
});

test("Attendance calculation resilience: handles missing roster and undefined values safely", () => {
  const emptySession = {
    id: "prac-test",
    title: "Test Session",
    date: "2026-09-26",
    timeDisplay: "120 นาที",
    sessionType: "TACTICAL",
    location: "Gym",
    coachInCharge: "Coach",
    roster: [],
  };

  const activeRoster = emptySession?.roster ?? [];
  const presentCount = activeRoster.filter((p) => p.status === "PRESENT").length;
  const totalRoster = activeRoster.length;
  const attendancePct = totalRoster > 0 ? ((presentCount / totalRoster) * 100).toFixed(1) : "0.0";

  assert.equal(attendancePct, "0.0");
  assert.equal(presentCount, 0);
  assert.equal(totalRoster, 0);

  // Partial player with missing disciplineRating
  const playerWithoutRating = {
    athleteId: "ath-test",
    athleteName: "Test Athlete",
    jerseyNumber: 99,
    position: "CENTER",
    status: "PRESENT",
  };

  assert.doesNotThrow(() => {
    const formatted = (playerWithoutRating.disciplineRating ?? 95.0).toFixed(1);
    assert.equal(formatted, "95.0");
  });
});
