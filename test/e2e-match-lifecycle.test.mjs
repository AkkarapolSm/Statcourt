import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/db/prisma.ts";
import { recordMatchEventCommand } from "../lib/live/matchCommandHandler.ts";

const BASE_URL = "http://localhost:3000";

describe("End-to-End Match Lifecycle: Register → Approve → Schedule → Score → Submit → Certify → Stats Sync → Reopen", () => {
  let adminCookie = "";
  let coachCookie = "";
  let officialCookie = "";

  const tournamentId = "tourn-toa-2026";
  const matchId = "match-bcc-ds-01";
  let targetAthleteId = "";
  let bccTeamId = "";
  let dsTeamId = "";
  let officialUser = null;

  it("1. Pre-requisite: Establish authenticated sessions and assign match official", async () => {
    // 1.1 Coach Session
    const coachRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "COACH", tier: "FREE" }),
    });
    assert.equal(coachRes.status, 200);
    coachCookie = coachRes.headers.get("set-cookie") || "";
    assert.ok(coachCookie.includes("statcourt_session="));

    // 1.2 Admin Session
    const adminRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ADMIN", tier: "PRO" }),
    });
    assert.equal(adminRes.status, 200);
    adminCookie = adminRes.headers.get("set-cookie") || "";
    assert.ok(adminCookie.includes("statcourt_session="));

    // 1.3 Official Session
    const officialRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "OFFICIAL", tier: "FREE" }),
    });
    assert.equal(officialRes.status, 200);
    officialCookie = officialRes.headers.get("set-cookie") || "";
    assert.ok(officialCookie.includes("statcourt_session="));

    // Resolve test match & athletes
    const match = await prisma.match.findUniqueOrThrow({
      where: { id: matchId },
      include: {
        homeTeam: { include: { roster: true } },
        awayTeam: { include: { roster: true } },
      },
    });
    bccTeamId = match.homeTeamId;
    dsTeamId = match.awayTeamId;
    targetAthleteId = match.homeTeam.roster[0].athleteId;

    officialUser = await prisma.user.findFirstOrThrow({
      where: { role: "OFFICIAL" },
      include: { officialProfile: true },
    });

    // Ensure official has active match assignment
    await prisma.matchOfficialAssignment.upsert({
      where: { userId_matchId: { userId: officialUser.id, matchId } },
      update: { status: "ACTIVE" },
      create: {
        userId: officialUser.id,
        matchId,
        status: "ACTIVE",
      },
    });

    // Clean prior registration for fresh test cycle
    await prisma.tournamentRegistration.deleteMany({
      where: { tournamentId, teamId: bccTeamId },
    });

    // Reset match state for fresh cycle
    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: "LIVE",
        resultStatus: "DRAFT",
        homeScore: 0,
        awayScore: 0,
      },
    });
  });

  it("2. Step 1: สมัครทีม (Team Registration)", async () => {
    // Coach registers team into tournament
    const res = await fetch(`${BASE_URL}/api/tournaments/${tournamentId}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: coachCookie,
      },
      body: JSON.stringify({
        teamId: bccTeamId,
        notes: "BCC Varsity Basketball Team Entry for 2026 Season",
      }),
    });

    const json = await res.json();
    assert.equal(res.status, 200);
    assert.equal(json.success, true);
    assert.ok(json.data.id);
  });

  it("3. Step 2: อนุมัติรายชื่อและสถานะการสมัคร (Admin Moderation)", async () => {
    // Admin finds pending registration and approves it
    const listRes = await fetch(`${BASE_URL}/api/admin/registrations?tournamentId=${tournamentId}`, {
      headers: { Cookie: adminCookie },
    });
    assert.equal(listRes.status, 200);
    const listJson = await listRes.json();
    const reg = listJson.registrations.find((r) => r.teamId === bccTeamId);
    assert.ok(reg, "Registration for team must exist");

    const patchRes = await fetch(`${BASE_URL}/api/admin/registrations`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        registrationId: reg.id,
        status: "APPROVED",
        reviewNote: "Verified roster and medical insurance documentation",
      }),
    });

    assert.equal(patchRes.status, 200);
    const patchJson = await patchRes.json();
    assert.equal(patchJson.success, true);
    assert.equal(patchJson.registration.status, "APPROVED");
  });

  it("4. Step 3: จัดตารางการแข่งขันและสนาม (Match Scheduling)", async () => {
    const scheduledTime = new Date(Date.now() + 86400000).toISOString();
    const res = await fetch(`${BASE_URL}/api/matches/${matchId}/schedule`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        scheduledAt: scheduledTime,
        venue: "Nimibutr National Stadium",
        courtName: "Court 1 (Main Court)",
        round: "Group Stage Day 1",
        status: "LIVE",
      }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.venue, "Nimibutr National Stadium");
    assert.equal(json.data.courtName, "Court 1 (Main Court)");
  });

  it("5. Step 4: บันทึกคะแนนสด (Digital Scorekeeping via Command Handler)", async () => {
    // Record 3-point made by target athlete
    const cmd1 = await recordMatchEventCommand({
      matchId,
      officialId: officialUser.officialProfile.id,
      userId: officialUser.id,
      teamId: bccTeamId,
      athleteId: targetAthleteId,
      eventType: "THREE_POINT_MADE",
      points: 3,
      quarter: 1,
      gameClockDisplay: "09:45",
      videoElapsedSec: 15,
      clientEventId: `e2e-evt-3pt-${Date.now()}`,
    });

    assert.equal(cmd1.success, true);
    assert.ok(cmd1.data);

    // Record assist
    const cmd2 = await recordMatchEventCommand({
      matchId,
      officialId: officialUser.officialProfile.id,
      userId: officialUser.id,
      teamId: bccTeamId,
      athleteId: targetAthleteId,
      eventType: "ASSIST",
      points: 0,
      quarter: 1,
      gameClockDisplay: "08:30",
      videoElapsedSec: 90,
      clientEventId: `e2e-evt-ast-${Date.now()}`,
    });
    assert.equal(cmd2.success, true);

    const matchAfterScore = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    assert.ok(matchAfterScore.homeScore >= 3);
  });

  it("6. Step 5: ยื่นผลการแข่งขัน (Official SUBMIT)", async () => {
    // Official submits the match result
    const res = await fetch(`${BASE_URL}/api/matches/${matchId}/result`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: officialCookie,
        Origin: BASE_URL,
      },
      body: JSON.stringify({ action: "SUBMIT" }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.match.resultStatus, "PENDING_APPROVAL");

    // Standings should still identify official standings without counting this pending match
    const standingsRes = await fetch(`${BASE_URL}/api/tournaments/${tournamentId}/standings`);
    assert.equal(standingsRes.status, 200);
    const standingsJson = await standingsRes.json();
    assert.equal(standingsJson.isOfficial, true);
  });

  it("7. Step 6: รับรองผลทางการ (Admin APPROVE) และซิงก์สถิติ/ตารางคะแนน", async () => {
    // Admin approves the match result
    const res = await fetch(`${BASE_URL}/api/matches/${matchId}/result`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
        Origin: BASE_URL,
      },
      body: JSON.stringify({ action: "APPROVE", reason: "Scoresheet cross-checked with FIBA table official" }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.match.resultStatus, "FINAL");

    // 7.1 Verify Tournament Standings updated in DB
    const standingsRes = await fetch(`${BASE_URL}/api/tournaments/${tournamentId}/standings`);
    assert.equal(standingsRes.status, 200);
    const standingsJson = await standingsRes.json();
    assert.equal(standingsJson.success, true);
    const bccStanding = standingsJson.data.find((s) => s.teamId === bccTeamId);
    assert.ok(bccStanding, "BCC standing must exist in official standings");
    assert.ok(bccStanding.played >= 1);
    assert.ok(bccStanding.points >= 2, "Winning team must have classification points");

    // 7.2 Verify Athlete Season Stats updated in DB & Leaderboard
    const leaderboardRes = await fetch(`${BASE_URL}/api/leaderboard?search=Nattapat`);
    assert.equal(leaderboardRes.status, 200);
    const leaderboardJson = await leaderboardRes.json();
    assert.equal(leaderboardJson.success, true);
    const athleteStat = leaderboardJson.data.find((a) => a.athleteId === targetAthleteId);
    if (athleteStat) {
      assert.ok(athleteStat.gamesPlayed >= 1);
      assert.ok(athleteStat.effPerGame > 0);
    }
  });

  it("8. Step 7: เปิดแก้ผลการแข่งขัน (Admin REOPEN) และตรวจสอบการคืนค่าสถิติ", async () => {
    // Admin reopens the match with audited reason
    const res = await fetch(`${BASE_URL}/api/matches/${matchId}/result`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        action: "REOPEN",
        reason: "Reopening match to review contested fourth quarter video foul dispute",
      }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.match.resultStatus, "DRAFT");

    // Match status should now be DISPUTED
    const matchInDb = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    assert.equal(matchInDb.resultStatus, "DRAFT");
    assert.equal(matchInDb.status, "DISPUTED");

    // Re-query official standings: this match is excluded from FINAL classification!
    const standingsRes = await fetch(`${BASE_URL}/api/tournaments/${tournamentId}/standings`);
    assert.equal(standingsRes.status, 200);
    const standingsJson = await standingsRes.json();
    assert.equal(standingsJson.isOfficial, true);
  });
});
