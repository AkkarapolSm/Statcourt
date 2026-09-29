import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/db/prisma.ts";
import {
  generateRoundRobinFixtures,
  generateKnockoutFixtures,
  generateCourtSchedule,
  detectScheduleConflicts,
} from "../lib/tournaments/bracketEngine.ts";

const BASE_URL = "http://localhost:3000";

describe("Feature 3.3: ระบบจัดสายและตาราง (Tournament Brackets & Automatic Scheduling Engine)", () => {
  let adminCookie = "";
  const testTournamentId = "tourn-national-youth-2025";

  // =========================================================================
  // 1. Pure Algorithm & Bracket Engine Unit Tests
  // =========================================================================
  describe("1. Bracket Engine Algorithm Tests", () => {
    const teams = [
      { id: "team-1", name: "Team 1" },
      { id: "team-2", name: "Team 2" },
      { id: "team-3", name: "Team 3" },
      { id: "team-4", name: "Team 4" },
    ];

    it("1.1 Round Robin: 4 teams generate exactly 6 matches (Berger System)", () => {
      const fixtures = generateRoundRobinFixtures(teams, "Group A");
      // N * (N - 1) / 2 = 4 * 3 / 2 = 6 matches
      assert.equal(fixtures.length, 6);
      
      // Each team should play 3 matches
      for (const t of teams) {
        const teamMatches = fixtures.filter(
          (m) => m.homeTeamId === t.id || m.awayTeamId === t.id
        );
        assert.equal(teamMatches.length, 3);
      }

      // Check group naming
      assert.ok(fixtures.every((f) => f.groupName === "Group A"));
    });

    it("1.2 Round Robin: 6 teams partitioned into 2 groups of 3 teams generate 3 matches per group", () => {
      const sixTeams = [
        ...teams,
        { id: "team-5", name: "Team 5" },
        { id: "team-6", name: "Team 6" },
      ];
      // 2 groups of 3 teams: 3 * 2 / 2 = 3 matches each group => 6 matches total
      const groupA = generateRoundRobinFixtures(sixTeams.slice(0, 3), "Group A");
      const groupB = generateRoundRobinFixtures(sixTeams.slice(3, 6), "Group B");
      assert.equal(groupA.length, 3);
      assert.equal(groupB.length, 3);
      const totalFixtures = [...groupA, ...groupB];
      assert.equal(totalFixtures.length, 6);
    });

    it("1.3 Knockout: 4 teams generate 2 Semi-Finals opening fixtures", () => {
      const fixtures = generateKnockoutFixtures(teams);
      // Round of 4 opening fixtures: 2 Semi-Finals
      assert.equal(fixtures.length, 2);

      const semiFinals = fixtures.filter((f) => f.round.includes("รอบรองชนะเลิศ"));
      assert.equal(semiFinals.length, 2);
    });

    it("1.4 Knockout: 8 teams generate 4 Quarter-Finals opening fixtures", () => {
      const eightTeams = [
        ...teams,
        { id: "team-5", name: "Team 5" },
        { id: "team-6", name: "Team 6" },
        { id: "team-7", name: "Team 7" },
        { id: "team-8", name: "Team 8" },
      ];
      const fixtures = generateKnockoutFixtures(eightTeams);
      // Round of 8 opening fixtures: 4 Quarter-Finals
      assert.equal(fixtures.length, 4);

      const qf = fixtures.filter((f) => f.round.includes("รอบก่อนรองชนะเลิศ"));
      assert.equal(qf.length, 4);
    });

    it("1.5 Court Scheduling: maps fixtures into daily slots respecting rest buffer", () => {
      const fixtures = generateRoundRobinFixtures(teams, "Group A");
      const scheduled = generateCourtSchedule(fixtures, {
        startDate: "2026-11-01",
        dailyStartTime: "09:00",
        matchDurationMins: 90,
        minRestMins: 120,
        venue: "อาคารนิมิบุตร",
        courts: ["คอร์ท 1", "คอร์ท 2"],
      });

      assert.equal(scheduled.length, 6);
      assert.ok(scheduled.every((m) => m.scheduledAt instanceof Date));
      assert.ok(scheduled.every((m) => m.courtName === "คอร์ท 1" || m.courtName === "คอร์ท 2"));

      // Verify no conflicts on generated schedule
      const conflicts = detectScheduleConflicts(scheduled, 90, 120);
      assert.equal(conflicts.length, 0);
    });

    it("1.6 Conflict Detection: detects COURT_OVERLAP (<90 min on same court)", () => {
      const overlappingMatches = [
        {
          id: "m-1",
          courtName: "คอร์ท A",
          scheduledAt: new Date("2026-11-01T09:00:00Z"),
          homeTeamId: "team-1",
          awayTeamId: "team-2",
        },
        {
          id: "m-2",
          courtName: "คอร์ท A",
          scheduledAt: new Date("2026-11-01T09:45:00Z"), // Only 45 min gap (< 90 min)
          homeTeamId: "team-3",
          awayTeamId: "team-4",
        },
      ];

      const conflicts = detectScheduleConflicts(overlappingMatches, 90, 120);
      assert.equal(conflicts.length, 1);
      assert.equal(conflicts[0].type, "COURT_OVERLAP");
      assert.equal(conflicts[0].courtName, "คอร์ท A");
    });

    it("1.7 Conflict Detection: detects TEAM_REST_CONFLICT (<120 min rest for same team)", () => {
      const restConflictMatches = [
        {
          id: "m-1",
          courtName: "คอร์ท 1",
          scheduledAt: new Date("2026-11-01T09:00:00Z"), // Ends at 10:30
          homeTeamId: "team-1",
          awayTeamId: "team-2",
        },
        {
          id: "m-2",
          courtName: "คอร์ท 2",
          scheduledAt: new Date("2026-11-01T11:00:00Z"), // Starts at 11:00 (only 30m rest after 10:30)
          homeTeamId: "team-1", // Team 1 plays again too soon!
          awayTeamId: "team-3",
        },
      ];

      const conflicts = detectScheduleConflicts(restConflictMatches, 90, 120);
      assert.equal(conflicts.length, 1);
      assert.equal(conflicts[0].type, "TEAM_REST_CONFLICT");
      assert.ok(conflicts[0].teamsInvolved.includes("team-1"));
    });
  });

  // =========================================================================
  // 2. HTTP API Endpoints Tests
  // =========================================================================
  describe("2. Brackets & Scheduling HTTP API Tests", () => {
    it("2.1 Admin logs in via dev-switch", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ADMIN", tier: "PRO" }),
      });
      assert.equal(res.status, 200);
      adminCookie = res.headers.get("set-cookie") || "";
      assert.ok(adminCookie.includes("statcourt_session="));
    });

    it("2.2 GET /api/tournaments/[id]/brackets returns valid bracket state", async () => {
      const res = await fetch(`${BASE_URL}/api/tournaments/${testTournamentId}/brackets`, {
        headers: { Cookie: adminCookie },
      });
      assert.equal(res.status, 200);
      const json = await res.json();

      assert.equal(json.success, true);
      assert.ok(json.tournament);
      assert.equal(json.tournament.id, testTournamentId);
      assert.ok(json.summary);
      assert.ok(typeof json.summary.approvedTeamsCount === "number");
      assert.ok(typeof json.summary.lockedRostersCount === "number");
      assert.ok(typeof json.summary.totalMatches === "number");
      assert.ok(Array.isArray(json.teams));
      assert.ok(typeof json.groups === "object");
      assert.ok(typeof json.knockoutRounds === "object");
      assert.ok(Array.isArray(json.conflicts));
    });

    it("2.3 POST /api/tournaments/[id]/roster-lock toggles roster lock state", async () => {
      // 1. Lock all rosters
      const lockRes = await fetch(`${BASE_URL}/api/tournaments/${testTournamentId}/roster-lock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify({ lock: true }),
      });
      assert.equal(lockRes.status, 200);
      const lockJson = await lockRes.json();
      assert.equal(lockJson.success, true);
      assert.equal(lockJson.isRosterLocked, true);

      // Verify in DB
      const registrations = await prisma.tournamentRegistration.findMany({
        where: { tournamentId: testTournamentId, status: "APPROVED" },
      });
      if (registrations.length > 0) {
        assert.ok(registrations.every((r) => r.isRosterLocked === true));
      }

      // 2. Unlock all rosters
      const unlockRes = await fetch(`${BASE_URL}/api/tournaments/${testTournamentId}/roster-lock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify({ lock: false }),
      });
      assert.equal(unlockRes.status, 200);
      const unlockJson = await unlockRes.json();
      assert.equal(unlockJson.success, true);
      assert.equal(unlockJson.isRosterLocked, false);
    });

    it("2.4 POST /api/tournaments/[id]/brackets/generate creates group fixtures and court assignments", async () => {
      // Ensure we have approved registrations for testTournamentId
      const existingTeams = await prisma.team.findMany({ take: 4 });
      assert.ok(existingTeams.length >= 2, "Need at least 2 teams in database");

      for (const t of existingTeams) {
        await prisma.tournamentRegistration.upsert({
          where: {
            tournamentId_teamId: { tournamentId: testTournamentId, teamId: t.id },
          },
          create: {
            tournamentId: testTournamentId,
            teamId: t.id,
            status: "APPROVED",
            rosterJson: "[]",
            isRosterLocked: false,
          },
          update: {
            status: "APPROVED",
          },
        });
      }

      const genRes = await fetch(`${BASE_URL}/api/tournaments/${testTournamentId}/brackets/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify({
          format: "GROUP_STAGE",
          groupCount: 2,
          startDate: "2026-11-01",
          dailyStartTime: "09:00",
          matchDurationMins: 90,
          minRestMins: 120,
          courts: ["คอร์ท 1", "คอร์ท 2"],
          lockRosters: true,
          clearExistingMatches: true, // Clean existing draft matches to ensure a fresh, conflict-free schedule
        }),
      });

      assert.equal(genRes.status, 200);
      const genJson = await genRes.json();
      assert.equal(genJson.success, true);
      assert.ok(genJson.matchesCount >= 1 || genJson.generatedCount >= 1);
      assert.ok(genJson.message.includes("สร้างสายการแข่งขันและจัดตารางสำเร็จ"));

      // Verify tournament brackets API returns the new fixtures and 0 conflicts
      const bracketsRes = await fetch(`${BASE_URL}/api/tournaments/${testTournamentId}/brackets`, {
        headers: { Cookie: adminCookie },
      });
      assert.equal(bracketsRes.status, 200);
      const bracketsJson = await bracketsRes.json();
      assert.ok(bracketsJson.summary.totalMatches >= (genJson.matchesCount || 1));
      assert.equal(bracketsJson.conflicts.length, 0); // Scheduling engine produces 0 conflicts
    });
  });
});
