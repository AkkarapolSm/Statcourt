import { describe, it } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3000";

describe("P2 Features: Recruitment, Unified Search, Back-Office Admin & Status Transparency", () => {
  let adminCookie = "";
  let athleteCookie = "";

  it("0. Pre-requisite: Authenticate Dev Switcher as ADMIN and ATHLETE", async () => {
    // Switch to ADMIN
    const adminRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ADMIN", tier: "PRO" }),
    });
    assert.equal(adminRes.status, 200);
    adminCookie = adminRes.headers.get("set-cookie") || "";
    assert.ok(adminCookie.length > 0, "Admin cookie should be received");

    // Switch to ATHLETE
    const athleteRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ATHLETE", tier: "FREE" }),
    });
    assert.equal(athleteRes.status, 200);
    athleteCookie = athleteRes.headers.get("set-cookie") || "";
    assert.ok(athleteCookie.length > 0, "Athlete cookie should be received");
  });

  // ==========================================
  // P2-1: Recruitment Workflow
  // ==========================================
  describe("P2-1: Recruitment Workflow Enforcement", () => {
    it("Validates opportunity status & checks active opportunities", async () => {
      const res = await fetch(`${BASE_URL}/api/opportunities`);
      assert.equal(res.status, 200);
      const data = await res.json();
      const oppList = data.data || data.opportunities;
      assert.ok(Array.isArray(oppList), "Should return list of opportunities");
      assert.ok(oppList.length > 0, "Should have seeded opportunities");
      
      const first = oppList[0];
      assert.ok(first.id, "Opportunity should have an ID");
      assert.ok(first.deadline, "Opportunity should have a deadline");
    });

    it("Rejects application with missing required fields (HTTP 400)", async () => {
      const oppsRes = await fetch(`${BASE_URL}/api/opportunities`);
      const oppsData = await oppsRes.json();
      const oppList = oppsData.data || oppsData.opportunities;
      const oppId = oppList[0]?.id;

      const res = await fetch(`${BASE_URL}/api/opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: oppId,
          // Missing applicantName, applicantPhone, applicantGpax, applicantPosition
        }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.ok(body.error, "Should return validation error");
    });
  });

  // ==========================================
  // P2-2: Unified Global Search
  // ==========================================
  describe("P2-2: Unified Global Search", () => {
    it("Searches across athletes, teams, tournaments, and matches", async () => {
      const res = await fetch(`${BASE_URL}/api/search?q=Bangkok&type=ALL`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.query, "Bangkok");
      assert.ok(data.results, "Results object should exist");
      assert.ok(Array.isArray(data.results.athletes), "Athletes array should exist");
      assert.ok(Array.isArray(data.results.teams), "Teams array should exist");
      assert.ok(Array.isArray(data.results.tournaments), "Tournaments array should exist");
      assert.ok(Array.isArray(data.results.matches), "Matches array should exist");
      assert.ok(typeof data.totalCount === "number", "Total count should be a number");
    });

    it("Applies privacy sanitization to athlete results (no hashed ID cards)", async () => {
      const res = await fetch(`${BASE_URL}/api/search?q=a&type=ATHLETES`);
      assert.equal(res.status, 200);
      const data = await res.json();
      for (const athlete of data.results.athletes) {
        assert.equal(athlete.idCardNumberHash, undefined, "Sensitive national ID hashes must never be exposed");
        assert.equal(athlete.user?.passwordHash, undefined, "Password hashes must never be exposed");
      }
    });
  });

  // ==========================================
  // P2-3: Back-Office Admin Operations
  // ==========================================
  describe("P2-3: Back-Office Admin Operations", () => {
    it("Gives HTTP 403 Forbidden to non-admin roles on admin endpoints", async () => {
      const res = await fetch(`${BASE_URL}/api/admin/overview`, {
        headers: { Cookie: athleteCookie },
      });
      assert.equal(res.status, 403);
    });

    it("Admin Overview returns system KPIs, user counts, and pending queues", async () => {
      const res = await fetch(`${BASE_URL}/api/admin/overview`, {
        headers: { Cookie: adminCookie },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.users.total >= 1, "Should have user count");
      assert.ok(typeof data.pending.officials === "number", "Pending officials counter should exist");
      assert.ok(typeof data.pending.registrations === "number", "Pending registrations counter should exist");
      assert.ok(typeof data.system.tournaments === "number", "System tournaments counter should exist");
    });

    it("Admin Officials API lists and filters officials", async () => {
      const res = await fetch(`${BASE_URL}/api/admin/officials?status=ALL`, {
        headers: { Cookie: adminCookie },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.officials), "Officials should be an array");
      assert.ok(data.stats, "Stats summary should exist");
      assert.ok(typeof data.stats.total === "number", "Total officials stat should exist");
    });

    it("Admin Officials PATCH approves official license & creates AuditLog", async () => {
      // Find an official
      const getRes = await fetch(`${BASE_URL}/api/admin/officials`, {
        headers: { Cookie: adminCookie },
      });
      const getData = await getRes.json();
      const official = getData.officials[0];
      assert.ok(official, "At least one official should exist");

      const testLicense = `BSAT-TEST-${Date.now()}`;
      const patchRes = await fetch(`${BASE_URL}/api/admin/officials`, {
        method: "PATCH",
        headers: {
          Cookie: adminCookie,
          "Content-Type": "application/json",
          Origin: BASE_URL,
        },
        body: JSON.stringify({
          officialId: official.id,
          approvalStatus: "APPROVED",
          licenseNumber: testLicense,
        }),
      });
      assert.equal(patchRes.status, 200);
      const patchData = await patchRes.json();
      assert.equal(patchData.success, true);
      assert.equal(patchData.official.approvalStatus, "APPROVED");
      assert.equal(patchData.official.licenseNumber, testLicense);

      // Verify AuditLog was recorded
      const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs?action=APPROVE_OFFICIAL`, {
        headers: { Cookie: adminCookie },
      });
      assert.equal(auditRes.status, 200);
      const auditData = await auditRes.json();
      assert.ok(auditData.logs.length >= 1, "Audit log should be recorded");
      assert.equal(auditData.logs[0].action, "APPROVE_OFFICIAL");
    });

    it("Admin Registrations API lists tournament registrations & moderates status", async () => {
      const getRes = await fetch(`${BASE_URL}/api/admin/registrations`, {
        headers: { Cookie: adminCookie },
      });
      assert.equal(getRes.status, 200);
      const getData = await getRes.json();
      assert.ok(Array.isArray(getData.registrations), "Registrations should be an array");
      assert.ok(getData.stats, "Stats should exist");

      if (getData.registrations.length > 0) {
        const target = getData.registrations[0];
        const patchRes = await fetch(`${BASE_URL}/api/admin/registrations`, {
          method: "PATCH",
          headers: {
            Cookie: adminCookie,
            "Content-Type": "application/json",
            Origin: BASE_URL,
          },
          body: JSON.stringify({
            registrationId: target.id,
            status: "APPROVED",
            isRosterLocked: true,
            reviewerNotes: "Verified via automated P2 test suite",
          }),
        });
        assert.equal(patchRes.status, 200);
        const patchData = await patchRes.json();
        assert.equal(patchData.success, true);
        assert.equal(patchData.registration.status, "APPROVED");
        assert.equal(patchData.registration.isRosterLocked, true);
      }
    });

    it("Admin Audit Logs API supports search, entity filtering and pagination", async () => {
      const res = await fetch(`${BASE_URL}/api/admin/audit-logs?limit=10&page=1`, {
        headers: { Cookie: adminCookie },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.logs), "Logs should be an array");
      assert.ok(data.pagination, "Pagination metadata should be returned");
      assert.equal(data.pagination.page, 1);
      assert.equal(data.pagination.limit, 10);
    });
  });

  // ==========================================
  // P2-4: Demo vs Live Status Transparency
  // ==========================================
  describe("P2-4: Demo vs Live Status Transparency", () => {
    it("Verifies client pages render demo simulation & live status tags", async () => {
      // Marketplace
      const mktRes = await fetch(`${BASE_URL}/marketplace`);
      assert.equal(mktRes.status, 200);
      const mktHtml = await mktRes.text();
      assert.ok(mktHtml.includes("DEMO SIMULATION"), "Marketplace should display DEMO SIMULATION banner");

      // Academy
      const acaRes = await fetch(`${BASE_URL}/academy`);
      assert.equal(acaRes.status, 200);
      const acaHtml = await acaRes.text();
      assert.ok(acaHtml.includes("LIVE") || acaHtml.includes("พร้อมใช้งาน"), "Academy should display LIVE status tag");
      assert.ok(acaHtml.includes("DEMO SIMULATION"), "Academy officials hiring should display DEMO SIMULATION tag");

      // Solutions
      const solRes = await fetch(`${BASE_URL}/solutions`);
      assert.equal(solRes.status, 200);
      const solHtml = await solRes.text();
      assert.ok(solHtml.includes("LIVE") || solHtml.includes("พร้อมใช้งาน"), "Solutions Community plan should display LIVE tag");
    });
  });
});
