import { describe, it } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3000";

describe("P0 Security Enforcement: OWASP Authorization, PII Protection & Credential Isolation", () => {
  let adminCookie = "";
  let coachCookie = "";
  let athleteCookie = "";
  let officialCookie = "";

  it("0. Pre-requisite: Establish cryptographically sealed sessions for all roles via session broker", async () => {
    // 1. ADMIN Session
    const adminRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ADMIN", tier: "PRO" }),
    });
    assert.equal(adminRes.status, 200);
    adminCookie = adminRes.headers.get("set-cookie") || "";
    assert.ok(adminCookie.includes("statcourt_session="), "Admin session cookie must be set");

    // 2. COACH Session (Assigned to Team BCC)
    const coachRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "COACH", tier: "PRO" }),
    });
    assert.equal(coachRes.status, 200);
    coachCookie = coachRes.headers.get("set-cookie") || "";
    assert.ok(coachCookie.includes("statcourt_session="), "Coach session cookie must be set");

    // 3. ATHLETE Session
    const athleteRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ATHLETE", tier: "FREE" }),
    });
    assert.equal(athleteRes.status, 200);
    athleteCookie = athleteRes.headers.get("set-cookie") || "";
    assert.ok(athleteCookie.includes("statcourt_session="), "Athlete session cookie must be set");

    // 4. OFFICIAL Session
    const officialRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "OFFICIAL", tier: "FREE" }),
    });
    assert.equal(officialRes.status, 200);
    officialCookie = officialRes.headers.get("set-cookie") || "";
    assert.ok(officialCookie.includes("statcourt_session="), "Official session cookie must be set");
  });

  // =========================================================================
  // Item 1: Unsigned Role / Header Injection Prevention (P0.1)
  // =========================================================================
  describe("P0.1: Client Role/Tier Forgery Rejected", () => {
    it("Rejects requests with forged 'x-user-role: ADMIN' without valid session (401)", async () => {
      const res = await fetch(`${BASE_URL}/api/admin/overview`, {
        headers: {
          "x-user-role": "ADMIN",
          "x-user-tier": "PRO",
        },
      });
      assert.equal(res.status, 401, "Unsigned role header must never bypass authentication");
    });

    it("Rejects requests with forged 'role=ADMIN' cookie without cryptographically signed session (401)", async () => {
      const res = await fetch(`${BASE_URL}/api/admin/overview`, {
        headers: {
          Cookie: "role=ADMIN; user_role=ADMIN; statcourt_role=ADMIN",
        },
      });
      assert.equal(res.status, 401, "Unsigned client cookie must never grant access");
    });
  });

  // =========================================================================
  // Item 2: Role Authorization Mismatch Prevention (P0.2)
  // =========================================================================
  describe("P0.2: Role Boundaries Strict Enforcement", () => {
    it("Denies OFFICIAL user attempting to access ADMIN-only overview endpoint (403)", async () => {
      const res = await fetch(`${BASE_URL}/api/admin/overview`, {
        headers: { Cookie: officialCookie },
      });
      assert.equal(res.status, 403, "Official token must not be permitted on ADMIN policy");
    });

    it("Denies OFFICIAL user attempting to access ADMIN-only officials approval endpoint (403)", async () => {
      const res = await fetch(`${BASE_URL}/api/admin/officials`, {
        headers: { Cookie: officialCookie },
      });
      assert.equal(res.status, 403, "Official token must not be permitted on ADMIN officials approval");
    });

    it("Denies ATHLETE user attempting to access ADMIN-only audit logs endpoint (403)", async () => {
      const res = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
        headers: { Cookie: athleteCookie },
      });
      assert.equal(res.status, 403, "Athlete must not access admin audit logs");
    });
  });

  // =========================================================================
  // Item 3: Resource-Level Policy Enforcement (P0.3)
  // =========================================================================
  describe("P0.3: Resource-Level Ownership Policies", () => {
    it("Denies coach from modifying tactical playbook of a team they do not manage (403)", async () => {
      // Coach is for Team BCC, attempting to edit Team DS (Debsirin) playbook
      const res = await fetch(`${BASE_URL}/api/team/playbook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: coachCookie,
        },
        body: JSON.stringify({
          teamId: "team-ds",
          title: "Intruder Tactical Play",
          playJson: "{}",
        }),
      });
      assert.equal(res.status, 403, "Coach must not write to another team's playbook");
    });

    it("Denies coach from accessing another team's practice attendance logs (403)", async () => {
      const res = await fetch(`${BASE_URL}/api/team/practice?teamId=team-ds`, {
        headers: { Cookie: coachCookie },
      });
      assert.equal(res.status, 403, "Coach must not read practice logs of another team");
    });

    it("Denies athlete from modifying private biometrics of another athlete profile (403)", async () => {
      // Authenticated athlete attempting to PATCH another athlete
      const res = await fetch(`${BASE_URL}/api/athletes/ath-02`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: athleteCookie,
        },
        body: JSON.stringify({
          heightCm: 195,
        }),
      });
      assert.equal(res.status, 403, "Athlete must not modify another athlete's profile");
    });
  });

  // =========================================================================
  // Item 4: Private Data Protection & Cache-Control (P0.4)
  // =========================================================================
  describe("P0.4: Private Data Protection & No-Store Caching", () => {
    it("Denies unauthenticated guest access to athlete academic records (403/401)", async () => {
      const res = await fetch(`${BASE_URL}/api/athletes/ath-01/academic`);
      assert.ok(res.status === 401 || res.status === 403, "Guest must not read academic records");
    });

    it("Denies unauthenticated guest access to digital player pass (403)", async () => {
      const res = await fetch(`${BASE_URL}/api/athletes/ath-01/pass`);
      assert.equal(res.status, 403, "Guest must not read full digital pass credentials");
    });

    it("Denies unauthenticated guest access to team injury logs (401)", async () => {
      const res = await fetch(`${BASE_URL}/api/team/injuries?teamId=team-bcc`);
      assert.equal(res.status, 401, "Guest must not read medical injury logs");
    });

    it("Verifies 'Cache-Control: private, no-store' is set on private endpoints", async () => {
      // 1. Session Me
      const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Cookie: adminCookie },
      });
      assert.equal(meRes.status, 200);
      const meCache = meRes.headers.get("cache-control") || "";
      assert.ok(meCache.includes("private"), "Cache-Control must contain private");
      assert.ok(meCache.includes("no-store"), "Cache-Control must contain no-store");

      // 2. PDPA Export
      const exportRes = await fetch(`${BASE_URL}/api/me/privacy/export`, {
        headers: { Cookie: adminCookie },
      });
      assert.equal(exportRes.status, 200);
      const exportCache = exportRes.headers.get("cache-control") || "";
      assert.ok(exportCache.includes("private") && exportCache.includes("no-store"));

      // 3. Playbook
      const playbookRes = await fetch(`${BASE_URL}/api/team/playbook?teamId=team-bcc`, {
        headers: { Cookie: adminCookie },
      });
      assert.equal(playbookRes.status, 200);
      const playbookCache = playbookRes.headers.get("cache-control") || "";
      assert.ok(playbookCache.includes("private") && playbookCache.includes("no-store"));
    });
  });

  // =========================================================================
  // Item 5: Official Profile PII & Credential Isolation (P0.5)
  // =========================================================================
  describe("P0.5: Official Profile Credential Isolation", () => {
    it("Public match events GET only selects public identity and never exposes pinHash or credentials", async () => {
      const res = await fetch(`${BASE_URL}/api/matches/match-bcc-ds-01/events`);
      assert.ok(res.status === 200 || res.status === 404);
      if (res.status === 200) {
        const data = await res.json();
        const events = data.data || [];
        for (const ev of events) {
          if (ev.official) {
            assert.equal(ev.official.pinHash, undefined, "pinHash must never be exposed on official events");
            assert.equal(ev.official.passwordHash, undefined, "passwordHash must never be exposed");
          }
        }
      }
    });

    it("Public match detail GET never exposes pinHash or credentials on official records", async () => {
      const res = await fetch(`${BASE_URL}/api/matches/match-bcc-ds-01`);
      assert.equal(res.status, 200);
      const data = await res.json();
      const match = data.data || data;
      if (match.events) {
        for (const ev of match.events) {
          if (ev.official) {
            assert.equal(ev.official.pinHash, undefined, "pinHash must never be exposed on match detail");
          }
        }
      }
    });
  });

  // =========================================================================
  // Item 6: Secure Password Hashing & Production Credential Security (P0.6)
  // =========================================================================
  describe("P0.6: Salted Key Derivation (scrypt)", () => {
    it("Login with wrong password fails with 401 Unauthorized", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@statcourt.th",
          password: "completely-wrong-password-9999",
        }),
      });
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.ok(body.error);
    });
  });

  // =========================================================================
  // Item 7: Match Official Assignment Enforcement (P0.7)
  // =========================================================================
  describe("P0.7: Match Official Assignment Enforced", () => {
    it("Official verification without matchId is rejected (400)", async () => {
      const res = await fetch(`${BASE_URL}/api/official/verify`, {
        headers: { Cookie: officialCookie },
      });
      assert.equal(res.status, 400, "Official verify without matchId must be rejected with 400");
    });

    it("Official cannot write event to a match without an active assignment (403)", async () => {
      const res = await fetch(`${BASE_URL}/api/matches/unassigned-match-id-999/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: officialCookie,
        },
        body: JSON.stringify({
          clientEventId: "evt_unassigned_test_01",
          eventType: "TWO_POINT_MADE",
          teamId: "team-bcc",
          athleteId: "ath-01",
          quarter: 1,
          points: 2,
          gameClockDisplay: "09:30",
        }),
      });
      assert.equal(res.status, 403, "Official without active match assignment must be rejected with 403");
    });
  });
});
