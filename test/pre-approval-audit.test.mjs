import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/db/prisma.ts";

const BASE_URL = "http://localhost:3000";

describe("Feature 3.1: Pre-Approval Match Integrity Audit (หน้าตรวจความครบถ้วนก่อนรับรองผล)", () => {
  let adminCookie = "";
  let athleteCookie = "";
  const matchId = "match-bcc-ds-01";

  it("1. Establish sessions for Admin and Athlete", async () => {
    // 1.1 Admin Session
    const adminRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ADMIN", tier: "PRO" }),
    });
    assert.equal(adminRes.status, 200);
    adminCookie = adminRes.headers.get("set-cookie") || "";
    assert.ok(adminCookie.includes("statcourt_session="));

    // 1.2 Athlete Session
    const athleteRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ATHLETE", tier: "FREE" }),
    });
    assert.equal(athleteRes.status, 200);
    athleteCookie = athleteRes.headers.get("set-cookie") || "";
    assert.ok(athleteCookie.includes("statcourt_session="));
  });

  it("2. RBAC Security: Reject non-privileged access to pre-approval audit", async () => {
    const res = await fetch(`${BASE_URL}/api/matches/${matchId}/pre-approval-audit`, {
      headers: { Cookie: athleteCookie },
    });
    // Should be forbidden for non-admin/non-official
    assert.equal(res.status, 403);
  });

  it("3. Pillar 1-5 Checks: Admin can retrieve comprehensive 5-pillar audit report", async () => {
    const res = await fetch(`${BASE_URL}/api/matches/${matchId}/pre-approval-audit`, {
      headers: { Cookie: adminCookie },
    });
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.audit);
    assert.ok(data.match);

    // Verify Audit Pillars Structure
    const { audit } = data;
    assert.ok(["READY", "WARNINGS_DETECTED", "BLOCKED"].includes(audit.overallStatus));
    assert.equal(typeof audit.canApprove, "boolean");
    assert.ok(Array.isArray(audit.checks));
    assert.ok(audit.checks.length >= 5);

    // Check specific pillars
    const pillarIds = audit.checks.map((c) => c.id);
    assert.ok(pillarIds.includes("SCORE_LEDGER_MATCH"), "Must include Score Ledger Match check");
    assert.ok(pillarIds.includes("ROSTER_VERIFICATION"), "Must include Roster Verification check");
    assert.ok(pillarIds.includes("FIBA_FOUL_LIMIT"), "Must include FIBA Foul Limit check");
    assert.ok(pillarIds.includes("PERIOD_COMPLETION"), "Must include Period Completion check");
    assert.ok(pillarIds.includes("OFFICIAL_CHAIN_VERIFICATION"), "Must include Official Chain check");

    // Check Score Summary
    assert.equal(typeof audit.scoreSummary.matchHomeScore, "number");
    assert.equal(typeof audit.scoreSummary.matchAwayScore, "number");
    assert.equal(typeof audit.scoreSummary.ledgerHomeScore, "number");
    assert.equal(typeof audit.scoreSummary.ledgerAwayScore, "number");
  });

  it("4. Blocking Protection: Detect ledger score tampering and block certification", async () => {
    // Save original score
    const originalMatch = await prisma.match.findUniqueOrThrow({
      where: { id: matchId },
      select: { homeScore: true, awayScore: true },
    });

    try {
      // Simulate score tampering (e.g. scoreboard tampered to 999 while ledger sum is unchanged)
      await prisma.match.update({
        where: { id: matchId },
        data: { homeScore: 999 },
      });

      const res = await fetch(`${BASE_URL}/api/matches/${matchId}/pre-approval-audit`, {
        headers: { Cookie: adminCookie },
      });
      assert.equal(res.status, 200);
      const data = await res.json();

      assert.equal(data.audit.overallStatus, "BLOCKED");
      assert.equal(data.audit.canApprove, false);

      const ledgerCheck = data.audit.checks.find((c) => c.id === "SCORE_LEDGER_MATCH");
      assert.ok(ledgerCheck);
      assert.equal(ledgerCheck.status, "FAIL");
      assert.ok(ledgerCheck.detailsTh.includes("ส่วนต่าง") || ledgerCheck.titleTh.includes("ไม่ตรงกับ"));
    } finally {
      // Revert to original score
      await prisma.match.update({
        where: { id: matchId },
        data: { homeScore: originalMatch.homeScore, awayScore: originalMatch.awayScore },
      });
    }
  });

  it("5. Admin Access Endpoint: Verifies pendingMatches is returned in /api/admin/access", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/access`, {
      headers: { Cookie: adminCookie },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.pendingMatches), "Must return pendingMatches array");
    assert.ok(Array.isArray(data.pendingUsers));
    assert.ok(Array.isArray(data.pendingMemberships));
    assert.ok(Array.isArray(data.officials));
  });
});
