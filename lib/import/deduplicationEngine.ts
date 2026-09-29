/**
 * Feature 3.4: Data Import & Deduplication Engine (เครื่องมือนำเข้าข้อมูลและตรวจข้อมูลซ้ำ)
 * Parses CSV rosters, validates schema, and identifies exact and fuzzy duplicates
 * across athlete profiles and user records.
 */

export interface RawImportRow {
  rowNumber: number;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  primaryPosition?: string;
  secondaryPosition?: string;
  heightCm?: number | string;
  weightKg?: number | string;
  jerseyNumber?: number | string;
  schoolOrClub?: string;
  province?: string;
  email?: string;
  phoneNumber?: string;
  nationalId?: string;
}

export interface ParsedAthleteData {
  firstName: string;
  lastName: string;
  birthDate: string; // ISO date string (YYYY-MM-DD)
  primaryPosition: "POINT_GUARD" | "SHOOTING_GUARD" | "SMALL_FORWARD" | "POWER_FORWARD" | "CENTER";
  secondaryPosition: string | null;
  heightCm: number;
  weightKg: number | null;
  jerseyNumber: number | null;
  schoolOrClub: string;
  province: string;
  email: string | null;
  phoneNumber: string | null;
  nationalId: string | null;
}

export interface DeduplicationMatch {
  id: string;
  userId: string;
  fullName: string;
  birthDate: string;
  primaryPosition: string;
  heightCm: number;
  schoolOrClub: string;
  province: string;
  userEmail?: string | null;
  userPhone?: string | null;
  nationalId?: string | null;
}

export interface StagedAthleteItem {
  rowNumber: number;
  data: ParsedAthleteData;
  status: "NEW" | "EXACT_MATCH" | "POTENTIAL_DUPLICATE" | "INVALID";
  matchConfidence: number; // 0 - 100
  matchReason?: string;
  existingAthlete?: DeduplicationMatch;
  validationErrors: string[];
  suggestedAction: "CREATE_NEW" | "LINK_EXISTING" | "SKIP";
}

export interface ExistingAthleteRecord {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  birthDate: Date | string;
  primaryPosition: string;
  heightCm: number;
  schoolOrClub: string;
  province: string;
  tcasReferenceCode?: string | null;
  user?: {
    email: string;
    phoneNumber?: string | null;
  } | null;
}

// =========================================================================
// 1. String Similarity & Normalization
// =========================================================================

export function normalizeThaiText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[,\-_.]/g, "");
}

/**
 * Calculates Levenshtein Distance similarity ratio (0.0 to 1.0)
 */
export function calculateStringSimilarity(a: string, b: string): number {
  const s1 = normalizeThaiText(a);
  const s2 = normalizeThaiText(b);
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[s1.length][s2.length];
  const maxLen = Math.max(s1.length, s2.length);
  return Math.max(0, 1 - distance / maxLen);
}

// =========================================================================
// 2. Field Normalization & Parsing
// =========================================================================

export function parseStandardPosition(raw?: string): ParsedAthleteData["primaryPosition"] {
  if (!raw) return "SMALL_FORWARD";
  const val = raw.trim().toUpperCase();

  if (val.includes("POINT") || val.includes("PG") || val.includes("การ์ดจ่าย") || val.includes("พอยต์การ์ด")) {
    return "POINT_GUARD";
  }
  if (val.includes("SHOOT") || val.includes("SG") || val.includes("การ์ดยิง") || val.includes("ชูตติ้งการ์ด")) {
    return "SHOOTING_GUARD";
  }
  if (val.includes("POWER") || val.includes("PF") || val.includes("เพาเวอร์") || val.includes("พาวเวอร์")) {
    return "POWER_FORWARD";
  }
  if (val.includes("CENTER") || val.includes(" C") || val === "C" || val.includes("เซ็นเตอร์")) {
    return "CENTER";
  }
  return "SMALL_FORWARD";
}

/**
 * Parses diverse date inputs (YYYY-MM-DD, DD/MM/YYYY, Buddhist Era years > 2400)
 */
export function parseDateOfBirth(raw?: string): { isoDate: string; isValid: boolean } {
  if (!raw || !raw.trim()) {
    return { isoDate: "", isValid: false };
  }

  const cleaned = raw.trim().replace(/[/.-]/g, "/");
  const parts = cleaned.split("/");

  let year = 0;
  let month = 0;
  let day = 0;

  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else {
      // DD/MM/YYYY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }
  } else {
    // Try standard JS date parse
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      return {
        isoDate: parsed.toISOString().split("T")[0],
        isValid: true,
      };
    }
    return { isoDate: "", isValid: false };
  }

  // Handle Thai Buddhist Era (พ.ศ. -> ค.ศ.)
  if (year > 2400) {
    year -= 543;
  }

  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    year < 1950 ||
    year > 2030 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return { isoDate: "", isValid: false };
  }

  const mm = month.toString().padStart(2, "0");
  const dd = day.toString().padStart(2, "0");
  return {
    isoDate: `${year}-${mm}-${dd}`,
    isValid: true,
  };
}

export function cleanPhoneNumber(raw?: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 9 && digits.length <= 11) {
    return digits;
  }
  return null;
}

// =========================================================================
// 3. CSV Parsing with Header Mapping
// =========================================================================

export function parseCsvContent(csvText: string): RawImportRow[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter: comma, semicolon, or tab
  const headerLine = lines[0];
  let delimiter = ",";
  if (headerLine.includes(";") && !headerLine.includes(",")) delimiter = ";";
  else if (headerLine.includes("\t")) delimiter = "\t";

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/['"_\s]/g, ""));

  const rows: RawImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.every((v) => v.length === 0)) continue;

    const row: RawImportRow = { rowNumber: i };

    headers.forEach((h, colIdx) => {
      const val = values[colIdx] || "";
      if (h.includes("firstname") || h === "name" || h === "ชื่อ" || h === "ชื่อจริง") {
        row.firstName = val;
      } else if (h.includes("lastname") || h.includes("surname") || h === "นามสกุล") {
        row.lastName = val;
      } else if (h.includes("birth") || h.includes("dob") || h.includes("วันเกิด") || h.includes("วันเดือนปีเกิด")) {
        row.birthDate = val;
      } else if (h.includes("position") || h.includes("pos") || h === "ตำแหน่ง") {
        row.primaryPosition = val;
      } else if (h.includes("height") || h === "ส่วนสูง") {
        row.heightCm = val;
      } else if (h.includes("weight") || h === "น้ำหนัก") {
        row.weightKg = val;
      } else if (h.includes("jersey") || h.includes("number") || h === "เบอร์" || h === "เบอร์เสื้อ" || h === "หมายเลข") {
        row.jerseyNumber = val;
      } else if (h.includes("school") || h.includes("club") || h.includes("team") || h.includes("institution") || h === "โรงเรียน" || h === "สโมสร" || h === "สังกัด") {
        row.schoolOrClub = val;
      } else if (h.includes("province") || h === "จังหวัด") {
        row.province = val;
      } else if (h.includes("email") || h === "อีเมล") {
        row.email = val;
      } else if (h.includes("phone") || h.includes("tel") || h === "เบอร์โทร" || h === "โทรศัพท์") {
        row.phoneNumber = val;
      } else if (h.includes("nationalid") || h.includes("idcard") || h.includes("passport") || h === "เลขบัตรประชาชน" || h === "เลขบัตร") {
        row.nationalId = val;
      }
    });

    rows.push(row);
  }

  return rows;
}

// =========================================================================
// 4. Deduplication & Entity Resolution Engine
// =========================================================================

export function processAthleteImports(
  rawRows: RawImportRow[],
  existingAthletes: ExistingAthleteRecord[]
): StagedAthleteItem[] {
  const stagedItems: StagedAthleteItem[] = [];
  const seenInFileMap = new Map<string, number>(); // key -> rowNumber for detecting intra-file duplicates

  for (const raw of rawRows) {
    const errors: string[] = [];

    // 1. Basic Field Validation
    const firstName = raw.firstName?.trim() || "";
    const lastName = raw.lastName?.trim() || "";

    if (!firstName) errors.push("กรุณาระบุชื่อจริง (First Name is required)");
    if (!lastName) errors.push("กรุณาระบุนามสกุล (Last Name is required)");

    const dobResult = parseDateOfBirth(raw.birthDate);
    if (!dobResult.isValid) {
      errors.push("รูปแบบวันเกิดไม่ถูกต้อง (Invalid birth date, use YYYY-MM-DD or DD/MM/YYYY)");
    }

    const heightNum = Number(raw.heightCm);
    if (isNaN(heightNum) || heightNum < 120 || heightNum > 240) {
      errors.push("ส่วนสูงไม่สมเหตุสมผล ต้องอยู่ระหว่าง 120-240 ซม. (Height must be 120-240 cm)");
    }

    const weightNum = raw.weightKg ? Number(raw.weightKg) : null;
    const jerseyNum = raw.jerseyNumber ? parseInt(String(raw.jerseyNumber), 10) : null;
    const cleanPhone = cleanPhoneNumber(raw.phoneNumber);
    const cleanEmail = raw.email?.trim().toLowerCase() || null;
    const schoolOrClub = raw.schoolOrClub?.trim() || "ชมรมบาสเกตบอลทั่วไป";
    const province = raw.province?.trim() || "กรุงเทพมหานคร";
    const primaryPosition = parseStandardPosition(raw.primaryPosition);
    const nationalId = raw.nationalId?.trim() || null;

    const athleteData: ParsedAthleteData = {
      firstName,
      lastName,
      birthDate: dobResult.isoDate,
      primaryPosition,
      secondaryPosition: null,
      heightCm: isNaN(heightNum) ? 175 : heightNum,
      weightKg: weightNum && !isNaN(weightNum) ? weightNum : null,
      jerseyNumber: jerseyNum && !isNaN(jerseyNum) ? jerseyNum : null,
      schoolOrClub,
      province,
      email: cleanEmail,
      phoneNumber: cleanPhone,
      nationalId,
    };

    if (errors.length > 0) {
      stagedItems.push({
        rowNumber: raw.rowNumber,
        data: athleteData,
        status: "INVALID",
        matchConfidence: 0,
        validationErrors: errors,
        suggestedAction: "SKIP",
      });
      continue;
    }

    // 2. Intra-file duplicate check
    const intraFileKey = `${normalizeThaiText(firstName)}_${normalizeThaiText(lastName)}_${dobResult.isoDate}`;
    if (seenInFileMap.has(intraFileKey)) {
      const priorRow = seenInFileMap.get(intraFileKey)!;
      stagedItems.push({
        rowNumber: raw.rowNumber,
        data: athleteData,
        status: "INVALID",
        matchConfidence: 100,
        matchReason: `พบข้อมูลซ้ำกับแถวที่ ${priorRow} ในไฟล์เดียวกัน`,
        validationErrors: [`ข้อมูลนักกีฬาซ้ำซ้อนกับแถวที่ ${priorRow}`],
        suggestedAction: "SKIP",
      });
      continue;
    }
    seenInFileMap.set(intraFileKey, raw.rowNumber);

    // 3. Database Deduplication Resolution
    let bestMatch: ExistingAthleteRecord | null = null;
    let matchType: "EXACT_MATCH" | "POTENTIAL_DUPLICATE" | null = null;
    let highestConfidence = 0;
    let matchReason = "";

    const fullNameToMatch = `${firstName} ${lastName}`;

    for (const exist of existingAthletes) {
      const existFullName = `${exist.firstName} ${exist.lastName}`;
      const existDobIso =
        exist.birthDate instanceof Date
          ? exist.birthDate.toISOString().split("T")[0]
          : String(exist.birthDate).split("T")[0];

      // Criteria A: Exact Match via TCAS / National ID
      if (nationalId && exist.tcasReferenceCode && nationalId === exist.tcasReferenceCode) {
        bestMatch = exist;
        matchType = "EXACT_MATCH";
        highestConfidence = 100;
        matchReason = `ตรงกับรหัสประจำตัว/TCAS ในระบบ (${nationalId})`;
        break;
      }

      // Criteria B: Exact Match via Email
      if (cleanEmail && exist.user?.email && cleanEmail === exist.user.email.toLowerCase()) {
        bestMatch = exist;
        matchType = "EXACT_MATCH";
        highestConfidence = 100;
        matchReason = `อีเมลตรงกับบัญชีในระบบ (${cleanEmail})`;
        break;
      }

      // Criteria C: Exact Match via Phone
      if (cleanPhone && exist.user?.phoneNumber && cleanPhone === cleanPhoneNumber(exist.user.phoneNumber)) {
        bestMatch = exist;
        matchType = "EXACT_MATCH";
        highestConfidence = 98;
        matchReason = `เบอร์โทรศัพท์ตรงกับบัญชีในระบบ (${cleanPhone})`;
        break;
      }

      // Criteria D: Exact Match on Full Name + Date of Birth
      const isNameExact =
        normalizeThaiText(exist.firstName) === normalizeThaiText(firstName) &&
        normalizeThaiText(exist.lastName) === normalizeThaiText(lastName);

      if (isNameExact && existDobIso === dobResult.isoDate) {
        bestMatch = exist;
        matchType = "EXACT_MATCH";
        highestConfidence = 99;
        matchReason = `ชื่อ นามสกุล และวันเกิดตรงกับโปรไฟล์เดิมทุกประการ`;
        break;
      }

      // Criteria E: Potential Duplicate - Same Name but different/missing DOB or same DOB with high name similarity
      const nameSimilarity = calculateStringSimilarity(fullNameToMatch, existFullName);

      if (isNameExact && existDobIso !== dobResult.isoDate) {
        if (highestConfidence < 85) {
          bestMatch = exist;
          matchType = "POTENTIAL_DUPLICATE";
          highestConfidence = 85;
          matchReason = `ชื่อและนามสกุลตรงกัน แต่วันเกิดไม่ตรง (ในระบบ: ${existDobIso}, ในไฟล์: ${dobResult.isoDate})`;
        }
      } else if (nameSimilarity >= 0.85) {
        // High fuzzy name match
        const isSameBirthYear = existDobIso.split("-")[0] === dobResult.isoDate.split("-")[0];
        const isSameSchool =
          normalizeThaiText(exist.schoolOrClub).length > 0 &&
          calculateStringSimilarity(exist.schoolOrClub, schoolOrClub) >= 0.7;

        let confidence = Math.round(nameSimilarity * 80);
        if (isSameBirthYear) confidence += 10;
        if (isSameSchool) confidence += 10;
        confidence = Math.min(95, confidence);

        if (confidence > highestConfidence && confidence >= 70) {
          bestMatch = exist;
          matchType = "POTENTIAL_DUPLICATE";
          highestConfidence = confidence;
          matchReason = `ชื่อใกล้เคียงกัน (${Math.round(nameSimilarity * 100)}%)${
            isSameSchool ? " และสังกัดตรงกัน" : ""
          }`;
        }
      }
    }

    if (bestMatch && matchType) {
      const existingAthleteMatch: DeduplicationMatch = {
        id: bestMatch.id,
        userId: bestMatch.userId,
        fullName: `${bestMatch.firstName} ${bestMatch.lastName}`,
        birthDate:
          bestMatch.birthDate instanceof Date
            ? bestMatch.birthDate.toISOString().split("T")[0]
            : String(bestMatch.birthDate).split("T")[0],
        primaryPosition: bestMatch.primaryPosition,
        heightCm: bestMatch.heightCm,
        schoolOrClub: bestMatch.schoolOrClub,
        province: bestMatch.province,
        userEmail: bestMatch.user?.email,
        userPhone: bestMatch.user?.phoneNumber,
        nationalId: bestMatch.tcasReferenceCode,
      };

      stagedItems.push({
        rowNumber: raw.rowNumber,
        data: athleteData,
        status: matchType,
        matchConfidence: highestConfidence,
        matchReason,
        existingAthlete: existingAthleteMatch,
        validationErrors: [],
        suggestedAction: matchType === "EXACT_MATCH" ? "LINK_EXISTING" : "LINK_EXISTING",
      });
    } else {
      // Safe new athlete
      stagedItems.push({
        rowNumber: raw.rowNumber,
        data: athleteData,
        status: "NEW",
        matchConfidence: 0,
        matchReason: "ไม่พบข้อมูลซ้ำซ้อนในระบบ เป็นนักกีฬาใหม่ที่ปลอดภัยในการบันทึก",
        validationErrors: [],
        suggestedAction: "CREATE_NEW",
      });
    }
  }

  return stagedItems;
}

/**
 * Generates sample CSV template string with UTF-8 BOM
 */
export function generateSampleCsvTemplate(): string {
  const headers = [
    "firstName",
    "lastName",
    "birthDate",
    "position",
    "heightCm",
    "weightKg",
    "jerseyNumber",
    "schoolOrClub",
    "province",
    "email",
    "phoneNumber",
    "nationalId",
  ];

  const sampleRows = [
    [
      "ณัฐภัทร",
      "วิจิตรจันทร์",
      "2008-04-12",
      "POINT_GUARD",
      "183",
      "74",
      "7",
      "กรุงเทพคริสเตียนวิทยาลัย",
      "กรุงเทพมหานคร",
      "nattapat.v@example.com",
      "0812345678",
      "1100501234567",
    ],
    [
      "ธนดล",
      "สิริปัญญา",
      "2007-09-25",
      "CENTER",
      "198",
      "88",
      "15",
      "เทพศิรินทร์",
      "กรุงเทพมหานคร",
      "thanadol.s@example.com",
      "0898765432",
      "1100509876543",
    ],
    [
      "กิตติพงษ์",
      "วงศ์สุวรรณ",
      "2009-01-18",
      "SMALL_FORWARD",
      "189",
      "78",
      "23",
      "อัสสัมชัญ",
      "กรุงเทพมหานคร",
      "kittipong.w@example.com",
      "0855554321",
      "1100507778899",
    ],
  ];

  const csvBody = [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\n");
  // Prepend UTF-8 BOM so Microsoft Excel opens Thai characters accurately without garbling
  return "\uFEFF" + csvBody;
}
