import test from "node:test";
import assert from "node:assert/strict";
import {
  signOfficialToken,
  authenticateOfficialCredentials,
  CERTIFIED_OFFICIALS_REGISTRY,
} from "../lib/auth/officialToken.ts";
import {
  requireOfficial,
  requireRole,
} from "../lib/auth/serverAuth.ts";

// Helper to create mock NextRequest-like objects in plain JS
function createMockRequest({ headers = {}, cookies = {} } = {}) {
  return {
    headers: {
      get: (name) => headers[name.toLowerCase()] || null,
    },
    cookies: {
      get: (name) => (cookies[name] ? { value: cookies[name] } : undefined),
    },
  };
}

test("Server Auth: requireOfficial strictly rejects unauthenticated requests", () => {
  const req = createMockRequest();
  const result = requireOfficial(req);

  assert.equal(result.authorized, false, "Unauthenticated request must be rejected");
  assert.ok(result.response, "Response must be returned for rejected request");
  assert.equal(result.response?.status, 401, "Status code must be 401 Unauthorized");
});

test("Server Auth: requireOfficial rejects invalid and tampered tokens", () => {
  const req = createMockRequest({
    headers: { "x-official-token": "invalid.jwt.token" },
  });
  const result = requireOfficial(req);

  assert.equal(result.authorized, false, "Invalid token must be rejected");
  assert.equal(result.response?.status, 401, "Invalid token must return 401");
});

test("Server Auth: requireOfficial authorizes valid signed tokens from header and cookie", () => {
  const official = CERTIFIED_OFFICIALS_REGISTRY[0];
  const token = signOfficialToken(official, "match-bcc-ds-01", 8);

  // 1. Via x-official-token header
  const reqHeader = createMockRequest({
    headers: { "x-official-token": token },
  });
  const resHeader = requireOfficial(reqHeader, "match-bcc-ds-01");
  assert.equal(resHeader.authorized, true, "Header token must authorize");
  assert.equal(resHeader.official?.licenseNumber, official.licenseNumber);

  // 2. Via Authorization: Bearer <token>
  const reqBearer = createMockRequest({
    headers: { authorization: `Bearer ${token}` },
  });
  const resBearer = requireOfficial(reqBearer, "match-bcc-ds-01");
  assert.equal(resBearer.authorized, true, "Bearer token must authorize");

  // 3. Via statcourt_official_token cookie
  const reqCookie = createMockRequest({
    cookies: { statcourt_official_token: token },
  });
  const resCookie = requireOfficial(reqCookie, "match-bcc-ds-01");
  assert.equal(resCookie.authorized, true, "Cookie token must authorize");
});

test("Server Auth: requireOfficial rejects token assigned to a different matchId", () => {
  const official = CERTIFIED_OFFICIALS_REGISTRY[0];
  const token = signOfficialToken(official, "match-bcc-ds-01", 8);

  const req = createMockRequest({
    headers: { "x-official-token": token },
  });
  const result = requireOfficial(req, "match-different-tournament");
  assert.equal(result.authorized, false, "Token for different match must be rejected");
  assert.equal(result.response?.status, 403, "Status code must be 403 Forbidden");
});

test("Server Auth: requireRole enforces permission matrix", () => {
  // Test role header
  const coachReq = createMockRequest({
    headers: { "x-user-role": "COACH" },
  });
  const coachAllowed = requireRole(coachReq, ["COACH", "ADMIN"]);
  assert.equal(coachAllowed.authorized, true, "Coach role should be allowed");

  const fanReq = createMockRequest({
    headers: { "x-user-role": "FAN" },
  });
  const fanDenied = requireRole(fanReq, ["COACH", "ADMIN"]);
  assert.equal(fanDenied.authorized, false, "Fan role should be denied for coach actions");
  assert.equal(fanDenied.response?.status, 403, "Denied role must return 403 Forbidden");
});
