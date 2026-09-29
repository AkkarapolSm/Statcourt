if (typeof window !== "undefined") {
  throw new Error("Server-only officialToken module cannot be imported on the client side.");
}

import crypto from "node:crypto";

function auditSecret(): string {
  const secret = process.env.OFFICIAL_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("OFFICIAL_SESSION_SECRET must contain at least 32 characters");
  }
  return secret;
}

export function generateAuditSignature(data: {
  matchId: string;
  operatorLicense: string;
  actionType: string;
  quarter: number;
  gameClockDisplay: string;
  detailsJson: string;
  timestamp: string;
  previousSignature?: string;
}): string {
  const content = [
    data.matchId, data.operatorLicense, data.actionType, data.quarter.toString(),
    data.gameClockDisplay, data.detailsJson, data.timestamp,
    data.previousSignature || "GENESIS_MATCH_DISPUTE_CHAIN_2026",
  ].join("|");
  return crypto.createHmac("sha256", auditSecret()).update(content).digest("hex");
}

export function verifyAuditSignature(
  record: {
    matchId: string;
    operatorLicense: string;
    actionType: string;
    quarter: number;
    gameClockDisplay: string;
    detailsJson: string;
    timestamp: string;
    digitalSignature: string;
  },
  previousSignature?: string
): boolean {
  const expected = generateAuditSignature({
    matchId: record.matchId, operatorLicense: record.operatorLicense,
    actionType: record.actionType, quarter: record.quarter,
    gameClockDisplay: record.gameClockDisplay, detailsJson: record.detailsJson,
    timestamp: record.timestamp, previousSignature,
  });
  const actual = Buffer.from(record.digitalSignature, "hex");
  const signature = Buffer.from(expected, "hex");
  return actual.length === signature.length && crypto.timingSafeEqual(actual, signature);
}
