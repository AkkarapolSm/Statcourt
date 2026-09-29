import test from "node:test";
import assert from "node:assert/strict";
import { generateAuditSignature, verifyAuditSignature } from "../lib/auth/officialToken.ts";

process.env.OFFICIAL_SESSION_SECRET = "test-only-audit-secret-with-at-least-32-characters";

test("audit record signature detects changed score and maintains a chain", () => {
  const event = {
    matchId: "match-1", operatorLicense: "official-1", actionType: "SCORE_ADJUST",
    quarter: 2, gameClockDisplay: "03:21", detailsJson: JSON.stringify({ homeScore: 20 }),
    timestamp: "2026-09-27T00:00:00.000Z",
  };
  const signature = generateAuditSignature(event);
  assert.equal(signature.length, 64);
  assert.equal(verifyAuditSignature({ ...event, digitalSignature: signature }), true);
  assert.equal(verifyAuditSignature({ ...event, detailsJson: JSON.stringify({ homeScore: 21 }), digitalSignature: signature }), false);

  const linked = { ...event, actionType: "RESULT_APPROVE", previousSignature: signature };
  const linkedSignature = generateAuditSignature(linked);
  assert.equal(verifyAuditSignature({ ...linked, digitalSignature: linkedSignature }, signature), true);
  assert.equal(verifyAuditSignature({ ...linked, digitalSignature: linkedSignature }), false);
});
