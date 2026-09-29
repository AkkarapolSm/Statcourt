import { describe, it } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3000";

describe("P1 Security & System Robustness: Server Entitlement, Chat Policy & Headers", () => {
  let adminCookie = "";
  let coachCookie = "";
  let officialCookie = "";
  let athleteCookie = "";

  it("0. Pre-requisite: Establish authenticated sessions for testing entitlement boundaries", async () => {
    // 1. Establish ADMIN (Holds PRO tier automatically)
    const adminRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ADMIN", tier: "PRO" }),
    });
    assert.equal(adminRes.status, 200);
    adminCookie = adminRes.headers.get("set-cookie") || "";
    assert.ok(adminCookie.includes("statcourt_session="));

    // 2. Establish COACH (Holds PRO tier automatically)
    const coachRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "COACH", tier: "PRO" }),
    });
    assert.equal(coachRes.status, 200);
    coachCookie = coachRes.headers.get("set-cookie") || "";
    assert.ok(coachCookie.includes("statcourt_session="));

    // 3. Establish OFFICIAL (Table Official)
    const officialRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "OFFICIAL", tier: "FREE" }),
    });
    assert.equal(officialRes.status, 200);
    officialCookie = officialRes.headers.get("set-cookie") || "";
    assert.ok(officialCookie.includes("statcourt_session="));

    // 4. Establish ATHLETE with FREE tier
    const athleteRes = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "ATHLETE", tier: "FREE" }),
    });
    assert.equal(athleteRes.status, 200);
    athleteCookie = athleteRes.headers.get("set-cookie") || "";
    assert.ok(athleteCookie.includes("statcourt_session="));
  });

  // =========================================================================
  // Item 1: Server-Enforced Subscription Entitlements
  // =========================================================================
  describe("P1.1: Server-Enforced Subscription Entitlement (Leaderboard & Athletes)", () => {
    it("Leaderboard ignores client '?tier=PRO' and 'x-user-tier: PRO' without session", async () => {
      const res = await fetch(`${BASE_URL}/api/leaderboard?tier=PRO`, {
        headers: {
          "x-user-tier": "PRO",
          "x-subscription-tier": "PRO",
        },
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.tier, "FREE", "Leaderboard must ignore client-controlled tier parameter and headers");

      // Verify that advanced metrics are sanitized/nullified for FREE tier
      assert.ok(json.data.length > 0, "Leaderboard must return athletes");
      const first = json.data[0];
      assert.equal(first.isProGated, true, "isProGated must be true for FREE tier");
      assert.equal(first.trueShootingPct, null, "trueShootingPct must be nullified for FREE tier");
      assert.equal(first.effectiveFgPct, null, "effectiveFgPct must be nullified for FREE tier");
      assert.equal(first.astToRatio, null, "astToRatio must be nullified for FREE tier");
      assert.equal(first.shotChartData, null, "shotChartData must be nullified for FREE tier");
    });

    it("Leaderboard unlocks full analytics for authenticated PRO coach session", async () => {
      const res = await fetch(`${BASE_URL}/api/leaderboard`, {
        headers: {
          cookie: coachCookie,
        },
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.tier, "PRO", "Leaderboard must recognize server-verified PRO session for coach");

      const first = json.data[0];
      assert.equal(first.isProGated, false, "isProGated must be false for PRO session");
      assert.notEqual(first.trueShootingPct, null, "trueShootingPct must be unlocked for PRO session");
      assert.notEqual(first.effectiveFgPct, null, "effectiveFgPct must be unlocked for PRO session");
      assert.notEqual(first.shotChartData, null, "shotChartData must be unlocked for PRO session");
    });

    it("Athlete detail sanitizes advanced stats for unauthenticated caller with spoofed tier", async () => {
      const res = await fetch(`${BASE_URL}/api/athletes/ath-1?tier=PRO`, {
        headers: {
          "x-user-tier": "PRO",
        },
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.tier, "FREE", "Athlete profile must enforce server tier FREE for public caller");
      assert.equal(json.data.isProGated, true, "isProGated must be true for public caller");

      const stats = json.data.seasonStats;
      assert.ok(Array.isArray(stats) && stats.length > 0);
      for (const stat of stats) {
        assert.equal(stat.isProGated, true);
        assert.equal(stat.tsPct, null, "tsPct must be nullified for non-PRO callers");
        assert.equal(stat.efgPct, null, "efgPct must be nullified for non-PRO callers");
        assert.equal(stat.astToRatio, null, "astToRatio must be nullified for non-PRO callers");
        assert.equal(stat.per, null, "per must be nullified for non-PRO callers");
      }
    });

    it("Athlete detail delivers full advanced metrics to authenticated coach session", async () => {
      const res = await fetch(`${BASE_URL}/api/athletes/ath-1`, {
        headers: {
          cookie: coachCookie,
        },
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.tier, "PRO", "Athlete profile must acknowledge server-verified PRO session");
      assert.equal(json.data.isProGated, false);

      const stats = json.data.seasonStats;
      assert.ok(Array.isArray(stats) && stats.length > 0);
      const hasSomeAdvancedStat = stats.some((s) => s.tsPct !== null || s.efgPct !== null);
      assert.ok(hasSomeAdvancedStat, "Coach should receive non-null advanced metrics");
    });
  });

  // =========================================================================
  // Item 2: Live Chat Policy & Anti-Spoofing Defense
  // =========================================================================
  describe("P1.2: Live Match Chat Policy & Anti-Spoofing (SEND_CHAT)", () => {
    it("Rejects empty or whitespace-only chat message with 400", async () => {
      const res = await fetch(`${BASE_URL}/api/matches/match-bcc-ds-01/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEND_CHAT", text: "    " }),
      });
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.ok(json.error.includes("ไม่สามารถว่างเปล่า") || json.error.includes("empty"));
    });

    it("Rejects chat message exceeding 150 characters with 400", async () => {
      const longText = "A".repeat(151);
      const res = await fetch(`${BASE_URL}/api/matches/match-bcc-ds-01/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEND_CHAT", text: longText }),
      });
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.ok(json.error.includes("ยาวเกินไป") || json.error.includes("150"));
    });

    it("Rejects malformed JSON on live endpoint with 400 instead of 500", async () => {
      const res = await fetch(`${BASE_URL}/api/matches/match-bcc-ds-01/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ malformed json",
      });
      assert.equal(res.status, 400, "Malformed JSON must return 400 Bad Request, not 500 Internal Server Error");
    });

    it("Prevents unauthenticated guest from self-assigning 'OFFICIAL' or 'ADMIN' badge", async () => {
      const res = await fetch(`${BASE_URL}/api/matches/match-bcc-ds-01/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SEND_CHAT",
          sender: "Fake Official Staff",
          badge: "OFFICIAL",
          badgeType: "OFFICIAL",
          text: "คำเตือนอย่างเป็นทางการจากกรรมการโต๊ะกลาง",
        }),
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.badge, "FAN", "Unauthenticated guest badge must be overridden to 'FAN'");
      assert.notEqual(json.data.sender, "Fake Official Staff", "Sender name spoofing official titles must be neutralized");
    });

    it("Allows genuine authenticated OFFICIAL session to transmit verified official badge", async () => {
      const res = await fetch(`${BASE_URL}/api/matches/match-bcc-ds-01/live`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: officialCookie,
        },
        body: JSON.stringify({
          action: "SEND_CHAT",
          text: "กรรมการโต๊ะเทคนิคบันทึกเวลานอกทีมเยือน",
        }),
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.badge, "OFFICIAL", "Official session must carry server-verified 'OFFICIAL' badge");
    });
  });

  // =========================================================================
  // Item 3: Security Headers, CSP & CSRF
  // =========================================================================
  describe("P1.3: Security Headers & CSP Enforcement", () => {
    it("Emits Content-Security-Policy (CSP) and defense-in-depth headers", async () => {
      const res = await fetch(`${BASE_URL}/api/leaderboard`);
      assert.equal(res.status, 200);

      const csp = res.headers.get("content-security-policy");
      assert.ok(csp, "Response must include Content-Security-Policy header");
      assert.ok(csp.includes("default-src 'self'"), "CSP must specify default-src 'self'");

      const xfo = res.headers.get("x-frame-options");
      assert.equal(xfo, "SAMEORIGIN", "Response must enforce X-Frame-Options: SAMEORIGIN");

      const xcto = res.headers.get("x-content-type-options");
      assert.equal(xcto, "nosniff", "Response must enforce X-Content-Type-Options: nosniff");

      const refPolicy = res.headers.get("referrer-policy");
      assert.ok(refPolicy, "Response must include Referrer-Policy");

      assert.equal(res.headers.get("x-powered-by"), null, "x-powered-by header must be stripped");
    });

    it("Blocks cross-site state mutating requests via CSRF defense (sec-fetch-site: cross-site)", async () => {
      const res = await fetch(`${BASE_URL}/api/matches/match-bcc-ds-01/live`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "sec-fetch-site": "cross-site",
          cookie: officialCookie,
        },
        body: JSON.stringify({ action: "SEND_CHAT", text: "Cross site attempt" }),
      });
      assert.equal(res.status, 403, "Cross-site mutating requests must be rejected with 403 Forbidden");
    });
  });

  // =========================================================================
  // Item 4: Multi-Tiered Rate Limiter
  // =========================================================================
  describe("P1.4: Multi-Tiered Rate Limiter Monitoring", () => {
    it("Returns rate limiting response headers on monitored endpoints", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { cookie: adminCookie },
      });
      assert.equal(res.status, 200);
      // Rate limiter headers may be on POST /api/auth/ or middleware mapped routes
      const postRes = await fetch(`${BASE_URL}/api/matches/match-bcc-ds-01/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEND_CHAT", text: "Rate limit header check" }),
      });
      assert.equal(postRes.status, 200);
      const limitHeader = postRes.headers.get("x-ratelimit-limit");
      const remainingHeader = postRes.headers.get("x-ratelimit-remaining");
      assert.ok(limitHeader, "Response must include X-RateLimit-Limit header");
      assert.ok(remainingHeader, "Response must include X-RateLimit-Remaining header");
    });
  });
});
