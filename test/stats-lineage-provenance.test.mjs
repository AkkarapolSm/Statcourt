import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { prisma } from "../lib/db/prisma.ts";
import { getAthleteStatsLineage } from "../lib/stats/statsLineageService.ts";

const BASE_URL = "http://localhost:3000";

describe("Feature 3.6: ประวัติและที่มาของสถิติ (Stats Lineage & Provenance Tracker)", () => {
  let targetAthleteId = "ath-1";
  let testMatchId = `match-lineage-test-${Date.now()}`;
  let adminUserId = "";

  it("1. Setup test athlete, match, and certification records in DB", async () => {
    // 1.1 Find an existing athlete or seed test athlete
    const existingAthlete = await prisma.athleteProfile.findFirst({
      include: { teamRosters: true },
    });
    assert.ok(existingAthlete, "Expected at least one athlete profile in DB");
    targetAthleteId = existingAthlete.id;

    // 1.2 Find an admin user to act as certified approver
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN", accountStatus: "ACTIVE" },
    });
    assert.ok(adminUser, "Expected at least one active ADMIN user");
    adminUserId = adminUser.id;

    // 1.3 Find or create official profile
    const officialUser = await prisma.user.findFirst({
      where: { role: "OFFICIAL", accountStatus: "ACTIVE" },
      include: { officialProfile: true },
    });
    assert.ok(officialUser, "Expected at least one OFFICIAL user");
    const officialProfileId = officialUser.officialProfile?.id;
    assert.ok(officialProfileId, "Expected official profile ID");

    // 1.4 Find a tournament and two teams
    const tournament = await prisma.tournament.findFirstOrThrow();
    const teams = await prisma.team.findMany({ take: 2 });
    assert.equal(teams.length, 2, "Expected at least 2 teams");

    // 1.5 Create a dedicated completed match with certified approval
    await prisma.match.create({
      data: {
        id: testMatchId,
        tournamentId: tournament.id,
        homeTeamId: teams[0].id,
        awayTeamId: teams[1].id,
        homeScore: 92,
        awayScore: 88,
        status: "COMPLETED",
        resultStatus: "FINAL",
        scheduledAt: new Date("2026-09-20T17:00:00Z"),
        venue: "อาคารกีฬานิมิบุตร",
        courtName: "คอร์ท 1",
        events: {
          create: [
            {
              officialId: officialProfileId,
              athleteId: targetAthleteId,
              eventType: "THREE_POINT_MADE",
              points: 3,
              quarter: 1,
              gameClockDisplay: "08:45",
              isVerified: true,
            },
            {
              officialId: officialProfileId,
              athleteId: targetAthleteId,
              eventType: "TWO_POINT_MADE",
              points: 2,
              quarter: 2,
              gameClockDisplay: "05:12",
              isVerified: true,
            },
            {
              officialId: officialProfileId,
              athleteId: targetAthleteId,
              eventType: "ASSIST",
              points: 0,
              quarter: 3,
              gameClockDisplay: "03:30",
              isVerified: true,
            },
            {
              officialId: officialProfileId,
              athleteId: targetAthleteId,
              eventType: "REBOUND",
              points: 0,
              quarter: 4,
              gameClockDisplay: "01:15",
              isVerified: true,
            },
          ],
        },
        participants: {
          create: {
            athleteId: targetAthleteId,
            isStarter: true,
            minutesPlayed: 32,
          },
        },
        resultApprovals: {
          create: [
            {
              approverId: adminUserId,
              action: "APPROVE",
              reason: "รับรองผลการแข่งขันอย่างเป็นทางการตามมาตรฐานสมาคมบาสเกตบอล",
              homeScore: 92,
              awayScore: 88,
            },
          ],
        },
        officialAssignments: {
          create: {
            userId: officialUser.id,
            status: "ACTIVE",
          },
        },
      },
    });
  });

  // =========================================================================
  // 1. Service Layer Tests
  // =========================================================================
  it("2. Service Layer: getAthleteStatsLineage returns verified breakdown and authority details", async () => {
    const lineage = await getAthleteStatsLineage(targetAthleteId, { season: "2026" });
    assert.ok(lineage, "Expected lineage result for valid athlete");

    // 2.1 Athlete Metadata
    assert.equal(lineage.athlete.id, targetAthleteId);
    assert.ok(lineage.athlete.fullName);

    // 2.2 Summary Integrity Metrics
    assert.ok(lineage.summary.totalGames >= 1);
    assert.ok(lineage.summary.certifiedGames >= 1);
    assert.ok(lineage.summary.trustScorePct >= 0 && lineage.summary.trustScorePct <= 100);
    assert.ok(lineage.summary.verificationSealHash.length === 64, "Expected SHA-256 64-character hash");

    // 2.3 Match Provenance Record for our test match
    const testMatchRecord = lineage.matches.find((m) => m.matchId === testMatchId);
    assert.ok(testMatchRecord, "Expected test match in matches array");

    // Verify boxscore
    assert.equal(testMatchRecord.boxscore.points, 5); // 3 + 2
    assert.equal(testMatchRecord.boxscore.fg3Made, 1);
    assert.equal(testMatchRecord.boxscore.fg2Made, 1);
    assert.equal(testMatchRecord.boxscore.assists, 1);
    assert.equal(testMatchRecord.boxscore.rebounds, 1);
    assert.equal(testMatchRecord.boxscore.minutesPlayed, 32);
    assert.equal(testMatchRecord.boxscore.isStarter, true);

    // Verify certification
    assert.equal(testMatchRecord.certification.isCertified, true);
    assert.equal(testMatchRecord.certification.statusBadge, "CERTIFIED_OFFICIAL");
    assert.ok(testMatchRecord.certification.certifiedBy);
    assert.equal(testMatchRecord.certification.certifiedBy.role, "ADMIN");
    assert.ok(testMatchRecord.certification.certifiedAt);

    // Verify table officials
    assert.ok(Array.isArray(testMatchRecord.certification.tableOfficials));
    assert.ok(testMatchRecord.certification.tableOfficials.length >= 1);

    // Verify events ledger
    assert.equal(testMatchRecord.eventsLedger.length, 4);
  });

  // =========================================================================
  // 2. Dispute and Reopen History Tracking
  // =========================================================================
  it("3. Dispute & Reopen History: accurately tracks dispute audit logs and reopen reasons", async () => {
    // Record a reopen action on the test match
    await prisma.matchResultApproval.create({
      data: {
        matchId: testMatchId,
        approverId: adminUserId,
        action: "REOPEN",
        reason: "เกิดข้อทักท้วงฟาวล์ทางเทคนิคในควอเตอร์ 4 ขอตรวจสอบบันทึกภาพวิดีโอ",
        homeScore: 92,
        awayScore: 88,
      },
    });

    // Record a dispute audit log
    await prisma.matchDisputeAuditLog.create({
      data: {
        matchId: testMatchId,
        operatorLicense: "BSAT-TABLE-TEST-001",
        operatorName: "สมชาย ผู้ตัดสินโต๊ะเทคนิค",
        actionType: "DISPUTE_CHALLENGE",
        quarter: 4,
        gameClockDisplay: "01:15",
        detailsJson: JSON.stringify({ challengedCall: "TECHNICAL_FOUL", result: "MAINTAINED" }),
        digitalSignature: createHash("sha256").update("test-signature").digest("hex"),
      },
    });

    // Re-fetch lineage
    const lineage = await getAthleteStatsLineage(targetAthleteId, { season: "2026" });
    assert.ok(lineage);

    const testMatchRecord = lineage.matches.find((m) => m.matchId === testMatchId);
    assert.ok(testMatchRecord);

    // Verify reopen history is captured
    assert.equal(testMatchRecord.reopenHistory.length, 1);
    assert.equal(testMatchRecord.reopenHistory[0].action, "REOPEN");
    assert.ok(testMatchRecord.reopenHistory[0].reason?.includes("ข้อทักท้วงฟาวล์"));

    // Verify dispute audit log is captured
    assert.equal(testMatchRecord.disputeAuditLogs.length, 1);
    assert.equal(testMatchRecord.disputeAuditLogs[0].actionType, "DISPUTE_CHALLENGE");
    assert.equal(testMatchRecord.disputeAuditLogs[0].operatorLicense, "BSAT-TABLE-TEST-001");

    // Verify timeline includes both certification and dispute
    const disputeTimeline = lineage.timeline.find((t) => t.type === "REOPEN_DISPUTE");
    assert.ok(disputeTimeline, "Expected REOPEN_DISPUTE in timeline");
  });

  // =========================================================================
  // 3. Reversed Events Exclusion
  // =========================================================================
  it("4. Reversed Events: excludes reversed events from points total and marks reversedEventsCount", async () => {
    // Add an event that was later reversed
    const officialUser = await prisma.user.findFirstOrThrow({
      where: { role: "OFFICIAL" },
      include: { officialProfile: true },
    });

    await prisma.matchEvent.create({
      data: {
        matchId: testMatchId,
        officialId: officialUser.officialProfile?.id || "off-default",
        athleteId: targetAthleteId,
        eventType: "THREE_POINT_MADE",
        points: 3,
        quarter: 1,
        gameClockDisplay: "07:00",
        isVerified: false,
        reversedAt: new Date(),
        reversedById: adminUserId,
      },
    });

    const lineage = await getAthleteStatsLineage(targetAthleteId, { season: "2026" });
    assert.ok(lineage);

    const testMatchRecord = lineage.matches.find((m) => m.matchId === testMatchId);
    assert.ok(testMatchRecord);

    // Reversed 3-pointer must NOT be added to points (should remain 5 PTS)
    assert.equal(testMatchRecord.boxscore.points, 5);
    // reversedEventsCount must be 1
    assert.equal(testMatchRecord.reversedEventsCount, 1);
  });

  // =========================================================================
  // 4. HTTP API Endpoint Tests
  // =========================================================================
  it("5. HTTP API: GET /api/athletes/[id]/stats-lineage returns 200 with full structure", async () => {
    const res = await fetch(`${BASE_URL}/api/athletes/${targetAthleteId}/stats-lineage?season=2026`);
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.athlete.id, targetAthleteId);
    assert.ok(json.summary);
    assert.ok(json.summary.verificationSealHash);
    assert.ok(Array.isArray(json.matches));
    assert.ok(Array.isArray(json.timeline));

    // Verify test match present in API response
    const apiMatch = json.matches.find((m) => m.matchId === testMatchId);
    assert.ok(apiMatch);
    assert.equal(apiMatch.certification.isCertified, true);
  });

  it("6. HTTP API: GET /api/athletes/invalid-id/stats-lineage returns 404", async () => {
    const res = await fetch(`${BASE_URL}/api/athletes/non-existent-athlete-id-9999/stats-lineage`);
    assert.equal(res.status, 404);

    const json = await res.json();
    assert.equal(json.success, false);
    assert.ok(json.error);
  });

  // Clean up test records
  it("7. Cleanup: remove test match and associated records", async () => {
    await prisma.matchEvent.deleteMany({ where: { matchId: testMatchId } });
    await prisma.matchParticipant.deleteMany({ where: { matchId: testMatchId } });
    await prisma.matchResultApproval.deleteMany({ where: { matchId: testMatchId } });
    await prisma.matchDisputeAuditLog.deleteMany({ where: { matchId: testMatchId } });
    await prisma.matchOfficialAssignment.deleteMany({ where: { matchId: testMatchId } });
    await prisma.match.deleteMany({ where: { id: testMatchId } });
  });
});
