import crypto from "crypto";

export interface OfficialTokenPayload {
  officialId: string;
  licenseNumber: string;
  name: string;
  organization: string;
  certificationLevel: string;
  role: "OFFICIAL" | "COMMISSIONER" | "ADMIN";
  matchId?: string;
  issuedAt: number; // Unix timestamp ms
  expiresAt: number; // Unix timestamp ms
}

// Secret key for HMAC signing (loaded from environment)
const TOKEN_SECRET =
  process.env.OFFICIAL_SESSION_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("FATAL: OFFICIAL_SESSION_SECRET must be set in production");
      })()
    : "statcourt-th-bsat-fiba-official-token-secret-2026");

/**
 * Standard cryptographic PIN hasher for table officials (SHA-256)
 */
export function hashOfficialPin(pin: string): string {
  return crypto.createHash("sha256").update(pin.trim()).digest("hex");
}

/**
 * Pre-registered certified officials directory according to BSAT & FIBA 2026 guidelines
 */
export interface CertifiedOfficialRecord {
  officialId: string;
  licenseNumber: string;
  pinHash: string;
  name: string;
  organization: string;
  certificationLevel: string;
  role: "OFFICIAL" | "COMMISSIONER" | "ADMIN";
  isActive: boolean;
}

export const CERTIFIED_OFFICIALS_REGISTRY: CertifiedOfficialRecord[] = [
  {
    officialId: "off-somchai",
    licenseNumber: "BSAT-TABLE-2026-088",
    pinHash: hashOfficialPin("7788"),
    name: "นายสมชาย ศรีวิชัย (Somchai Srivichai)",
    organization: "สมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT)",
    certificationLevel: "FIBA Level 2 Certified Table Official",
    role: "OFFICIAL",
    isActive: true,
  },
  {
    officialId: "off-kanchana",
    licenseNumber: "BSAT-TABLE-2026-042",
    pinHash: hashOfficialPin("5566"),
    name: "นางสาวกาญจนา บุญมี (Kanchana Boonmee)",
    organization: "ศูนย์พัฒนาผู้ตัดสินบาสเกตบอลภาคกลาง (BSAT Youth)",
    certificationLevel: "FIBA Level 1 Certified Table Official",
    role: "OFFICIAL",
    isActive: true,
  },
  {
    officialId: "off-worawut",
    licenseNumber: "BSAT-COMMISSIONER-001",
    pinHash: hashOfficialPin("9900"),
    name: "ดร.วรวุฒิ ศรีสวัสดิ์ (Dr. Worawut Srisawat)",
    organization: "FIBA Asia & BSAT Technical Commission",
    certificationLevel: "Senior FIBA International Match Commissioner",
    role: "COMMISSIONER",
    isActive: true,
  },
];

/**
 * Finds and verifies official credentials strictly against hashed registry credentials
 * Backdoors (such as 1234 bypass or unverified fallback) are completely eliminated.
 */
export function authenticateOfficialCredentials(
  licenseNumber: string,
  pin: string
): CertifiedOfficialRecord | null {
  if (!licenseNumber || !pin) return null;

  const cleanLicense = licenseNumber.trim().toUpperCase();
  const cleanPin = pin.trim();
  const inputHash = hashOfficialPin(cleanPin);

  const matched = CERTIFIED_OFFICIALS_REGISTRY.find(
    (o) =>
      o.licenseNumber.toUpperCase() === cleanLicense &&
      o.pinHash === inputHash &&
      o.isActive
  );

  return matched || null;
}

/**
 * Signs a tamper-proof session token for certified table officials (HMAC-SHA256)
 */
export function signOfficialToken(
  official: CertifiedOfficialRecord,
  matchId?: string,
  durationHours: number = 8
): string {
  const now = Date.now();
  const payload: OfficialTokenPayload = {
    officialId: official.officialId,
    licenseNumber: official.licenseNumber,
    name: official.name,
    organization: official.organization,
    certificationLevel: official.certificationLevel,
    role: official.role,
    matchId,
    issuedAt: now,
    expiresAt: now + durationHours * 3600 * 1000,
  };

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "STATCOURT_OFFICIAL_JWT" })).toString("base64url");
  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(`${header}.${payloadEncoded}`)
    .digest("base64url");

  return `${header}.${payloadEncoded}.${signature}`;
}

/**
 * Validates and decodes an official table session token
 */
export function verifyOfficialToken(token: string): OfficialTokenPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, payloadEncoded, signature] = parts;

  // Verify HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(`${header}.${payloadEncoded}`)
    .digest("base64url");

  if (signature !== expectedSignature) {
    return null; // Tampered token
  }

  try {
    const payloadJson = Buffer.from(payloadEncoded, "base64url").toString("utf-8");
    const payload: OfficialTokenPayload = JSON.parse(payloadJson);

    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return null; // Expired session
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Generates an immutable, cryptographic hash signature for an audit trail event
 * Creates a tamper-evident blockchain-style hash linked to previous record signature
 */
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
    data.matchId,
    data.operatorLicense,
    data.actionType,
    data.quarter.toString(),
    data.gameClockDisplay,
    data.detailsJson,
    data.timestamp,
    data.previousSignature || "GENESIS_MATCH_DISPUTE_CHAIN_2026",
  ].join("|");

  return crypto.createHmac("sha256", TOKEN_SECRET).update(content).digest("hex");
}

/**
 * Validates the digital signature of an audit record
 */
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
    matchId: record.matchId,
    operatorLicense: record.operatorLicense,
    actionType: record.actionType,
    quarter: record.quarter,
    gameClockDisplay: record.gameClockDisplay,
    detailsJson: record.detailsJson,
    timestamp: record.timestamp,
    previousSignature,
  });

  return record.digitalSignature === expected;
}
