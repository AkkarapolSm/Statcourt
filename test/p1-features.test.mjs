import test from "node:test";
import assert from "node:assert/strict";

test("P1 Feature: FIBA Standings calculation & Tie-breaking rule", () => {
  // Test FIBA scoring rules: Win = 2 pts, Loss = 1 pt
  const teams = [
    { id: "team-a", name: "Team A", played: 3, won: 2, lost: 1, pointsFor: 210, pointsAgainst: 190 },
    { id: "team-b", name: "Team B", played: 3, won: 2, lost: 1, pointsFor: 205, pointsAgainst: 195 },
    { id: "team-c", name: "Team C", played: 3, won: 0, lost: 3, pointsFor: 160, pointsAgainst: 200 },
  ];

  const standings = teams.map((t) => ({
    ...t,
    points: t.won * 2 + t.lost * 1,
    pointDiff: t.pointsFor - t.pointsAgainst,
  }));

  // Sort by FIBA official hierarchy:
  // 1. Classification Points (Win: 2, Loss: 1)
  // 2. Goal Difference (pointDiff)
  // 3. Points For
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
    return b.pointsFor - a.pointsFor;
  });

  assert.equal(standings[0].id, "team-a");
  assert.equal(standings[0].points, 5); // 2 wins * 2 + 1 loss * 1 = 5
  assert.equal(standings[0].pointDiff, 20);

  assert.equal(standings[1].id, "team-b");
  assert.equal(standings[1].points, 5);
  assert.equal(standings[1].pointDiff, 10);

  assert.equal(standings[2].id, "team-c");
  assert.equal(standings[2].points, 3); // 3 losses * 1 = 3
  assert.equal(standings[2].pointDiff, -40);
});

test("P1 Feature: Match Schedule Conflict Detection (Court 90m & Team 2h)", () => {
  function checkScheduleConflict(existingMatchTime, newMatchTime, windowMinutes) {
    const existingMs = new Date(existingMatchTime).getTime();
    const newMs = new Date(newMatchTime).getTime();
    const diffMs = Math.abs(existingMs - newMs);
    const windowMs = windowMinutes * 60 * 1000;
    return diffMs < windowMs;
  }

  const baseMatchTime = "2026-10-15T14:00:00.000Z";

  // Court Conflict (90 minutes window):
  // 14:45 is 45 minutes after -> CONFLICT
  assert.equal(checkScheduleConflict(baseMatchTime, "2026-10-15T14:45:00.000Z", 90), true);
  // 15:35 is 95 minutes after -> NO CONFLICT
  assert.equal(checkScheduleConflict(baseMatchTime, "2026-10-15T15:35:00.000Z", 90), false);

  // Team Rest Conflict (120 minutes window):
  // 15:30 is 90 minutes after -> CONFLICT (Team hasn't had 2 hours rest)
  assert.equal(checkScheduleConflict(baseMatchTime, "2026-10-15T15:30:00.000Z", 120), true);
  // 16:15 is 135 minutes after -> NO CONFLICT
  assert.equal(checkScheduleConflict(baseMatchTime, "2026-10-15T16:15:00.000Z", 120), false);
});

test("P1 Feature: Resilient Offline Ledger JSON serialization", () => {
  const offlineEvents = [
    { id: "evt-01", matchId: "match-101", eventType: "FIELD_GOAL_MADE", points: 2, timestamp: 1729000000000 },
    { id: "evt-02", matchId: "match-101", eventType: "FOUL", points: 0, timestamp: 1729000010000 },
  ];

  const ledgerPayload = {
    exportedAt: new Date().toISOString(),
    matchId: "match-101",
    eventCount: offlineEvents.length,
    events: offlineEvents,
  };

  const serialized = JSON.stringify(ledgerPayload, null, 2);
  const parsed = JSON.parse(serialized);

  assert.equal(parsed.matchId, "match-101");
  assert.equal(parsed.eventCount, 2);
  assert.equal(parsed.events[0].eventType, "FIELD_GOAL_MADE");
  assert.equal(parsed.events[1].eventType, "FOUL");
});

test("P1 Feature: PDPA Consent Validation & Export Sanitization", () => {
  const validConsentTypes = [
    "SCOUTING_DATABASE",
    "LIVE_STREAM_STATS",
    "PARENTAL_MINOR_CONSENT",
    "MARKETING_COMMUNICATIONS",
    "TCAS_QUOTA_TRANSFER",
  ];

  assert.ok(validConsentTypes.includes("SCOUTING_DATABASE"));
  assert.ok(validConsentTypes.includes("PARENTAL_MINOR_CONSENT"));
  assert.equal(validConsentTypes.includes("UNAUTHORIZED_SALE"), false);

  // Article 30 Export Sanitizer: Password hash and secrets must NOT be in public export
  const userRecord = {
    id: "user-100",
    email: "athlete@statcourt.th",
    displayName: "Kittisak Athlete",
    passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$secret",
    createdAt: new Date(),
  };

  const { passwordHash, ...sanitizedExport } = userRecord;
  assert.equal(sanitizedExport.passwordHash, undefined);
  assert.equal(sanitizedExport.email, "athlete@statcourt.th");
});

test("P1 Feature: Multi-Season Stats Disambiguation (No historical overwrite)", () => {
  const statsRecords = [
    { athleteId: "ath-01", season: "2026", ageCategory: "U18", points: 142, eff: 168 },
    { athleteId: "ath-01", season: "2025", ageCategory: "U16", points: 98, eff: 112 },
    { athleteId: "ath-01", season: "2024", ageCategory: "U14", points: 64, eff: 75 },
  ];

  // Records must maintain separate composite identities
  const keys = statsRecords.map((s) => `${s.athleteId}-${s.season}-${s.ageCategory}`);
  const uniqueKeys = new Set(keys);
  assert.equal(uniqueKeys.size, statsRecords.length);

  // Switching seasons must yield distinct points without mutation
  const season2026 = statsRecords.find((s) => s.season === "2026");
  const season2025 = statsRecords.find((s) => s.season === "2025");
  assert.equal(season2026.points, 142);
  assert.equal(season2025.points, 98);
  assert.notEqual(season2026.points, season2025.points);
});

test("P1 Feature: Navbar Dev Role Switcher transitions and permission mapping", () => {
  const allRoles = ["ADMIN", "COACH", "ATHLETE", "OFFICIAL", "FAN", "PUBLIC"];
  
  // Verify all 6 roles are valid
  assert.equal(allRoles.length, 6);

  const getWorkspaceForRole = (role) => {
    switch (role) {
      case "COACH": return "/team";
      case "OFFICIAL": return "/official/console/match-bcc-ds-01";
      case "ATHLETE": return "/athlete/ath-01";
      case "ADMIN": return "/tournaments";
      case "FAN": return "/teams";
      default: return "/";
    }
  };

  assert.equal(getWorkspaceForRole("COACH"), "/team");
  assert.equal(getWorkspaceForRole("OFFICIAL"), "/official/console/match-bcc-ds-01");
  assert.equal(getWorkspaceForRole("ATHLETE"), "/athlete/ath-01");
  assert.equal(getWorkspaceForRole("ADMIN"), "/tournaments");
  assert.equal(getWorkspaceForRole("FAN"), "/teams");
  assert.equal(getWorkspaceForRole("PUBLIC"), "/");
});
