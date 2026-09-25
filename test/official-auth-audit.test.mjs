import test from "node:test";
import assert from "node:assert/strict";
import {
  authenticateOfficialCredentials,
  signOfficialToken,
  verifyOfficialToken,
  generateAuditSignature,
  verifyAuditSignature,
  CERTIFIED_OFFICIALS_REGISTRY,
} from "../lib/auth/officialToken.ts";

test("BSAT Registry contains certified technical table officials and commissioners", () => {
  assert.ok(CERTIFIED_OFFICIALS_REGISTRY.length >= 3, "Registry must contain registered officials");

  const somchai = CERTIFIED_OFFICIALS_REGISTRY.find(
    (o) => o.licenseNumber === "BSAT-TABLE-2026-088"
  );
  assert.ok(somchai, "Somchai must be registered");
  assert.match(somchai.name, /Somchai Srivichai/);
  assert.equal(somchai.role, "OFFICIAL");

  const commissioner = CERTIFIED_OFFICIALS_REGISTRY.find(
    (o) => o.licenseNumber === "BSAT-COMMISSIONER-001"
  );
  assert.ok(commissioner, "Commissioner must be registered");
  assert.equal(commissioner.role, "COMMISSIONER");
});

test("authenticateOfficialCredentials verifies valid credentials and rejects invalid ones", () => {
  // Test valid scorekeeper
  const official1 = authenticateOfficialCredentials("BSAT-TABLE-2026-088", "7788");
  assert.ok(official1, "Credentials with valid PIN 7788 should succeed");
  assert.equal(official1.licenseNumber, "BSAT-TABLE-2026-088");
  assert.match(official1.name, /Somchai Srivichai/);

  // Test valid scorekeeper Kanchana
  const official2 = authenticateOfficialCredentials("BSAT-TABLE-2026-042", "5566");
  assert.ok(official2, "Credentials with valid PIN 5566 should succeed");
  assert.match(official2.name, /Kanchana/);

  // Test valid commissioner
  const commissioner = authenticateOfficialCredentials("BSAT-COMMISSIONER-001", "9900");
  assert.ok(commissioner, "Credentials with valid PIN 9900 should succeed");
  assert.equal(commissioner.role, "COMMISSIONER");

  // Test wrong PIN
  const invalidPin = authenticateOfficialCredentials("BSAT-TABLE-2026-088", "0000");
  assert.equal(invalidPin, null, "Incorrect PIN must be rejected");

  // Test backdoor PIN rejection (proves elimination of 1234 bypass)
  const backdoorPin = authenticateOfficialCredentials("BSAT-TABLE-2026-088", "1234");
  assert.equal(backdoorPin, null, "Backdoor PIN 1234 must be strictly rejected");

  const arbitraryLicense = authenticateOfficialCredentials("BSAT-FAKE-1234", "1234");
  assert.equal(arbitraryLicense, null, "Arbitrary license with demo PIN 1234 must be rejected");

  // Test non-existent license with invalid PIN
  const invalidLicense = authenticateOfficialCredentials("BSAT-FAKE-9999", "9999");
  assert.equal(invalidLicense, null, "Non-existent license with invalid PIN must be rejected");
});

test("signOfficialToken creates verifiable cryptographically-signed session token", () => {
  const official = CERTIFIED_OFFICIALS_REGISTRY[0];
  const token = signOfficialToken(official, "match-bcc-ds-01", 8);

  assert.ok(typeof token === "string" && token.length > 20, "Token must be a non-empty string");
  assert.equal(token.split(".").length, 3, "Token must be header.payload.signature format");

  // Verify token
  const verified = verifyOfficialToken(token);
  assert.ok(verified, "Token verification should succeed");
  assert.equal(verified.licenseNumber, official.licenseNumber);
  assert.equal(verified.name, official.name);
  assert.equal(verified.role, "OFFICIAL");
  assert.equal(verified.matchId, "match-bcc-ds-01");
  assert.ok(verified.expiresAt > Date.now(), "Token must have future expiry");
});

test("verifyOfficialToken detects and rejects tampered or expired tokens", () => {
  const official = CERTIFIED_OFFICIALS_REGISTRY[0];
  const token = signOfficialToken(official, "match-bcc-ds-01", 1);
  const [header, b64Payload, signature] = token.split(".");

  // 1. Tamper with payload (escalate role to COMMISSIONER)
  const decoded = JSON.parse(Buffer.from(b64Payload, "base64url").toString("utf-8"));
  decoded.role = "COMMISSIONER";
  const tamperedPayloadB64 = Buffer.from(JSON.stringify(decoded)).toString("base64url");
  const tamperedToken = `${header}.${tamperedPayloadB64}.${signature}`;

  assert.equal(
    verifyOfficialToken(tamperedToken),
    null,
    "Tampered token payload must fail verification"
  );

  // 2. Tamper with signature
  const fakeSignature = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const badSigToken = `${header}.${b64Payload}.${fakeSignature}`;
  assert.equal(
    verifyOfficialToken(badSigToken),
    null,
    "Altered signature must fail verification"
  );

  // 3. Expired token (created with negative duration)
  const expiredToken = signOfficialToken(official, "match-bcc-ds-01", -1);
  assert.equal(
    verifyOfficialToken(expiredToken),
    null,
    "Expired token must fail verification"
  );
});

test("generateAuditSignature produces anti-tamper blockchain-style cryptographic signatures", () => {
  const prevSig = "GENESIS_MATCH_DISPUTE_CHAIN_2026";
  const auditEvent1 = {
    matchId: "match-bcc-ds-01",
    actionType: "POINT_3",
    quarter: 4,
    gameClockDisplay: "01:24",
    operatorLicense: "BSAT-TABLE-2026-088",
    detailsJson: JSON.stringify({ player: "Thanakorn Siriphan", jersey: 7, score: 78 }),
    timestamp: "2026-09-26T00:30:00.000Z",
    previousSignature: prevSig,
  };

  const sig1 = generateAuditSignature(auditEvent1);
  assert.ok(typeof sig1 === "string" && sig1.length === 64, "Signature must be 64-char SHA-256 hex string");

  const record1 = {
    ...auditEvent1,
    digitalSignature: sig1,
  };

  // Verify valid signature
  assert.ok(
    verifyAuditSignature(record1, prevSig),
    "Audit signature must verify successfully with untouched data"
  );

  // Tamper with action (change 3 points to 2 points)
  const tamperedEvent = {
    ...record1,
    actionType: "POINT_2",
  };
  assert.equal(
    verifyAuditSignature(tamperedEvent, prevSig),
    false,
    "Tampering with actionType must be detected by signature check"
  );

  // Tamper with clock
  const tamperedClockEvent = {
    ...record1,
    gameClockDisplay: "00:59",
  };
  assert.equal(
    verifyAuditSignature(tamperedClockEvent, prevSig),
    false,
    "Tampering with gameClockDisplay must be detected by signature check"
  );
});

test("Chained dispute audit trail preserves chronological integrity", () => {
  const genesisSig = "GENESIS_MATCH_DISPUTE_CHAIN_2026";

  // Block 1 (Genesis)
  const event1 = {
    matchId: "match-test-fiba",
    actionType: "TABLE_LOGIN",
    quarter: 1,
    gameClockDisplay: "10:00",
    operatorLicense: "BSAT-TABLE-2026-088",
    detailsJson: JSON.stringify({ station: "ARENA-TABLE-COURT-A" }),
    timestamp: "2026-09-26T01:00:00.000Z",
    previousSignature: genesisSig,
  };
  const sig1 = generateAuditSignature(event1);
  const record1 = { ...event1, digitalSignature: sig1 };

  // Block 2 (Linked to Block 1)
  const event2 = {
    matchId: "match-test-fiba",
    actionType: "FOUL",
    quarter: 1,
    gameClockDisplay: "08:45",
    operatorLicense: "BSAT-TABLE-2026-088",
    detailsJson: JSON.stringify({ player: "Thanakorn", foulType: "P1" }),
    timestamp: "2026-09-26T01:03:00.000Z",
    previousSignature: sig1,
  };
  const sig2 = generateAuditSignature(event2);
  const record2 = { ...event2, digitalSignature: sig2 };

  // Block 3 (Linked to Block 2)
  const event3 = {
    matchId: "match-test-fiba",
    actionType: "ACTION_REVERSED",
    quarter: 1,
    gameClockDisplay: "08:44",
    operatorLicense: "BSAT-TABLE-2026-088",
    detailsJson: JSON.stringify({ reason: "Scorekeeper correction" }),
    timestamp: "2026-09-26T01:03:30.000Z",
    previousSignature: sig2,
  };
  const sig3 = generateAuditSignature(event3);
  const record3 = { ...event3, digitalSignature: sig3 };

  // Verify complete valid chain
  assert.ok(verifyAuditSignature(record1, genesisSig), "Block 1 must verify");
  assert.ok(verifyAuditSignature(record2, sig1), "Block 2 must verify");
  assert.ok(verifyAuditSignature(record3, sig2), "Block 3 must verify");

  // If Block 1 is forged or altered retroactively:
  const alteredEvent1 = { ...event1, quarter: 2 };
  const alteredSig1 = generateAuditSignature(alteredEvent1);
  // Block 2's previousSignature still points to old sig1, so the chain linkage breaks!
  assert.notEqual(
    alteredSig1,
    event2.previousSignature,
    "Altering previous block breaks chain link to subsequent block"
  );
});
