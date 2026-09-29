import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/db/prisma.ts";
import {
  calculateStringSimilarity,
  parseDateOfBirth,
  parseStandardPosition,
  parseCsvContent,
  processAthleteImports,
  generateSampleCsvTemplate,
} from "../lib/import/deduplicationEngine.ts";

const BASE_URL = "http://localhost:3000";

describe("Feature 3.4: เครื่องมือนำเข้าข้อมูลและตรวจข้อมูลซ้ำ (Data Import & Deduplication Tool)", () => {
  let adminCookie = "";
  let coachCookie = "";

  // =========================================================================
  // 1. Pure Algorithm & Deduplication Unit Tests
  // =========================================================================
  describe("1. Deduplication & Parsing Engine Unit Tests", () => {
    it("1.1 calculateStringSimilarity computes accurate similarity scores", () => {
      // Identical strings
      assert.equal(calculateStringSimilarity("ณัฐภัทร วิจิตรจันทร์", "ณัฐภัทร วิจิตรจันทร์"), 1.0);
      assert.equal(calculateStringSimilarity("John Doe", "john doe"), 1.0);

      // Minor typo in Thai name (similarity should be > 0.85)
      const typoSimilarity = calculateStringSimilarity("ณัฐภัทร วิจิตรจันทร์", "ณัฐพัทร วิจิตรจันทร์");
      assert.ok(typoSimilarity >= 0.85, `Expected >= 0.85, got ${typoSimilarity}`);

      // Completely different names
      const diffSimilarity = calculateStringSimilarity("สมชาย เข็มกลัด", "วิชัย ใจดี");
      assert.ok(diffSimilarity < 0.5, `Expected < 0.5, got ${diffSimilarity}`);
    });

    it("1.2 parseDateOfBirth handles ISO, DD/MM/YYYY, and Thai Buddhist Era years", () => {
      // ISO YYYY-MM-DD
      const d1 = parseDateOfBirth("2008-04-12");
      assert.equal(d1.isValid, true);
      assert.equal(d1.isoDate, "2008-04-12");

      // DD/MM/YYYY
      const d2 = parseDateOfBirth("25/09/2007");
      assert.equal(d2.isValid, true);
      assert.equal(d2.isoDate, "2007-09-25");

      // Thai Buddhist Era: 2551 -> 2551 - 543 = 2008
      const d3 = parseDateOfBirth("14/05/2551");
      assert.equal(d3.isValid, true);
      assert.equal(d3.isoDate, "2008-05-14");

      // Invalid dates
      const d4 = parseDateOfBirth("99/99/9999");
      assert.equal(d4.isValid, false);
      const d5 = parseDateOfBirth("not-a-date");
      assert.equal(d5.isValid, false);
    });

    it("1.3 parseStandardPosition normalizes English and Thai basketball positions", () => {
      assert.equal(parseStandardPosition("PG"), "POINT_GUARD");
      assert.equal(parseStandardPosition("การ์ดจ่าย"), "POINT_GUARD");
      assert.equal(parseStandardPosition("SG"), "SHOOTING_GUARD");
      assert.equal(parseStandardPosition("ชูตติ้งการ์ด"), "SHOOTING_GUARD");
      assert.equal(parseStandardPosition("SF"), "SMALL_FORWARD");
      assert.equal(parseStandardPosition("PF"), "POWER_FORWARD");
      assert.equal(parseStandardPosition("C"), "CENTER");
      assert.equal(parseStandardPosition("เซ็นเตอร์"), "CENTER");
      assert.equal(parseStandardPosition(""), "SMALL_FORWARD"); // default fallback
    });

    it("1.4 parseCsvContent parses both English and Thai headers with various delimiters", () => {
      // Comma delimited English headers
      const csvEn = `firstName,lastName,birthDate,position,heightCm\nNattapat,Wichit,2008-04-12,PG,183`;
      const rowsEn = parseCsvContent(csvEn);
      assert.equal(rowsEn.length, 1);
      assert.equal(rowsEn[0].firstName, "Nattapat");
      assert.equal(rowsEn[0].lastName, "Wichit");
      assert.equal(rowsEn[0].birthDate, "2008-04-12");
      assert.equal(rowsEn[0].primaryPosition, "PG");
      assert.equal(rowsEn[0].heightCm, "183");

      // Semicolon delimited Thai headers
      const csvTh = `ชื่อ;นามสกุล;วันเกิด;ตำแหน่ง;ส่วนสูง;สโมสร\nธนดล;สิริปัญญา;2007-09-25;เซ็นเตอร์;198;เทพศิรินทร์`;
      const rowsTh = parseCsvContent(csvTh);
      assert.equal(rowsTh.length, 1);
      assert.equal(rowsTh[0].firstName, "ธนดล");
      assert.equal(rowsTh[0].lastName, "สิริปัญญา");
      assert.equal(rowsTh[0].schoolOrClub, "เทพศิรินทร์");
    });

    it("1.5 processAthleteImports resolves NEW, EXACT_MATCH, POTENTIAL_DUPLICATE, and INVALID", () => {
      const mockExisting = [
        {
          id: "ath-exist-01",
          userId: "usr-01",
          firstName: "กิตติพงษ์",
          lastName: "วงศ์สุวรรณ",
          birthDate: new Date("2008-03-15"),
          primaryPosition: "POINT_GUARD",
          heightCm: 182,
          schoolOrClub: "กรุงเทพคริสเตียนวิทยาลัย",
          province: "กรุงเทพมหานคร",
          tcasReferenceCode: "1100507778899",
          user: { email: "kittipong.w@example.com", phoneNumber: "0812345678" },
        },
      ];

      const rawRows = [
        // 1. Exact match on National ID / TCAS
        {
          rowNumber: 1,
          firstName: "กิตติพงษ์",
          lastName: "วงศ์สุวรรณ",
          birthDate: "2008-03-15",
          heightCm: 182,
          nationalId: "1100507778899",
        },
        // 2. Potential Duplicate: similar name + same school
        {
          rowNumber: 2,
          firstName: "กิตติพงศ์", // slight typo: ษ์ vs ศ์
          lastName: "วงศ์สุวรรณ",
          birthDate: "2008-03-15",
          heightCm: 182,
          schoolOrClub: "กรุงเทพคริสเตียนวิทยาลัย",
        },
        // 3. Completely New Athlete
        {
          rowNumber: 3,
          firstName: "อนิรุทธ์",
          lastName: "แซ่ลิ้ม",
          birthDate: "2009-07-20",
          heightCm: 190,
          schoolOrClub: "สวนกุหลาบวิทยาลัย",
        },
        // 4. Invalid Athlete (missing last name and invalid height)
        {
          rowNumber: 4,
          firstName: "สมชาย",
          lastName: "", // missing
          birthDate: "invalid-date",
          heightCm: 50, // invalid
        },
      ];

      const staged = processAthleteImports(rawRows, mockExisting);
      assert.equal(staged.length, 4);

      // Row 1: EXACT_MATCH
      assert.equal(staged[0].status, "EXACT_MATCH");
      assert.equal(staged[0].existingAthlete?.id, "ath-exist-01");
      assert.equal(staged[0].suggestedAction, "LINK_EXISTING");

      // Row 2: POTENTIAL_DUPLICATE
      assert.equal(staged[1].status, "POTENTIAL_DUPLICATE");
      assert.equal(staged[1].existingAthlete?.id, "ath-exist-01");
      assert.ok(staged[1].matchConfidence >= 70);

      // Row 3: NEW
      assert.equal(staged[2].status, "NEW");
      assert.equal(staged[2].suggestedAction, "CREATE_NEW");

      // Row 4: INVALID
      assert.equal(staged[3].status, "INVALID");
      assert.ok(staged[3].validationErrors.length >= 2);
    });

    it("1.6 processAthleteImports detects intra-file duplicate rows", () => {
      const duplicateRows = [
        {
          rowNumber: 1,
          firstName: "สมศักดิ์",
          lastName: "มีชัย",
          birthDate: "2008-01-01",
          heightCm: 180,
        },
        {
          rowNumber: 2,
          firstName: "สมศักดิ์",
          lastName: "มีชัย",
          birthDate: "2008-01-01", // duplicate of row 1 in same file
          heightCm: 180,
        },
      ];

      const staged = processAthleteImports(duplicateRows, []);
      assert.equal(staged.length, 2);
      assert.equal(staged[0].status, "NEW");
      assert.equal(staged[1].status, "INVALID");
      assert.ok(staged[1].matchReason?.includes("พบข้อมูลซ้ำกับแถวที่ 1"));
    });
  });

  // =========================================================================
  // 2. HTTP API Endpoints Integration Tests
  // =========================================================================
  describe("2. HTTP API Integration Tests", () => {
    it("2.1 Admin logs in via dev-switch", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/dev-switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ADMIN", tier: "PRO" }),
      });
      assert.equal(res.status, 200);
      adminCookie = res.headers.get("set-cookie") || "";
      assert.ok(adminCookie.includes("statcourt_session="));
    });

    it("2.2 GET /api/athletes/import/template returns downloadable CSV with UTF-8 BOM", async () => {
      const res = await fetch(`${BASE_URL}/api/athletes/import/template`);
      assert.equal(res.status, 200);
      assert.ok(res.headers.get("content-type")?.includes("text/csv"));
      assert.ok(res.headers.get("content-disposition")?.includes("statcourt_roster_template.csv"));

      const buffer = await res.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // Validates UTF-8 BOM [0xEF, 0xBB, 0xBF]
      assert.equal(bytes[0], 0xef);
      assert.equal(bytes[1], 0xbb);
      assert.equal(bytes[2], 0xbf);

      const text = new TextDecoder("utf-8").decode(buffer);
      assert.ok(text.includes("firstName,lastName,birthDate"));
    });

    it("2.3 POST /api/athletes/import/parse parses CSV payload and produces staging preview", async () => {
      const sampleCsv = `firstName,lastName,birthDate,position,heightCm,weightKg,jerseyNumber,schoolOrClub,province\nปิยะพงษ์,ทองดี,2008-06-10,POINT_GUARD,185,75,10,โรงเรียนสาธิต,กรุงเทพมหานคร\nวีรเดช,คงทน,2007-11-22,CENTER,200,92,15,โรงเรียนนานาชาติ,เชียงใหม่\nคนไม่มี,นามสกุล,invalid-date,SF,100,50,0,ไม่ระบุ,ไม่ระบุ`;

      const res = await fetch(`${BASE_URL}/api/athletes/import/parse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify({
          csvContent: sampleCsv,
          teamId: "team-bcc",
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.summary.totalRows, 3);
      assert.equal(json.summary.invalidCount, 1);
      assert.ok(json.summary.newCount >= 1 || json.summary.exactMatchCount >= 1);
      assert.ok(Array.isArray(json.items));
      assert.equal(json.items.length, 3);
    });

    it("2.4 POST /api/athletes/import/commit saves new athletes and links existing athletes atomically", async () => {
      const uniqueTimestamp = Date.now();
      const uniqueFirstName = `TestImport_${uniqueTimestamp}`;
      const uniqueLastName = `Roster_${uniqueTimestamp}`;

      const itemsToCommit = [
        // Item 1: Create New Athlete
        {
          data: {
            firstName: uniqueFirstName,
            lastName: uniqueLastName,
            birthDate: "2008-08-18",
            primaryPosition: "POINT_GUARD",
            secondaryPosition: null,
            heightCm: 185,
            weightKg: 76,
            jerseyNumber: 88,
            schoolOrClub: "StatCourt Academy",
            province: "กรุงเทพมหานคร",
            email: `test_ath_${uniqueTimestamp}@example.com`,
            phoneNumber: "0891112233",
            nationalId: `ID_${uniqueTimestamp}`,
          },
          action: "CREATE_NEW",
        },
        // Item 2: Skip invalid
        {
          data: {
            firstName: "SkipMe",
            lastName: "SkipLastName",
            birthDate: "2008-01-01",
            primaryPosition: "CENTER",
            secondaryPosition: null,
            heightCm: 190,
            weightKg: null,
            jerseyNumber: null,
            schoolOrClub: "",
            province: "",
            email: null,
            phoneNumber: null,
            nationalId: null,
          },
          action: "SKIP",
        },
      ];

      const commitRes = await fetch(`${BASE_URL}/api/athletes/import/commit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: adminCookie,
        },
        body: JSON.stringify({
          items: itemsToCommit,
          teamId: "team-bcc",
        }),
      });

      assert.equal(commitRes.status, 200);
      const commitJson = await commitRes.json();
      assert.equal(commitJson.success, true);
      assert.equal(commitJson.createdCount, 1);
      assert.equal(commitJson.skippedCount, 1);

      // Verify in DB that athlete profile and user were created
      const createdAthlete = await prisma.athleteProfile.findFirst({
        where: { firstName: uniqueFirstName, lastName: uniqueLastName },
        include: { user: true, teamRosters: true },
      });

      assert.ok(createdAthlete, "Created athlete profile should exist in DB");
      assert.equal(createdAthlete.heightCm, 185);
      assert.equal(createdAthlete.user.role, "ATHLETE");
      assert.ok(
        createdAthlete.teamRosters.some((r) => r.teamId === "team-bcc"),
        "Athlete should be added to team-bcc roster"
      );

      // Verify an AuditLog was recorded
      const auditLog = await prisma.auditLog.findFirst({
        where: { action: "ROSTER_IMPORT_COMMITTED" },
        orderBy: { createdAt: "desc" },
      });
      assert.ok(auditLog, "Audit log should be recorded for import commit");
    });
  });
});
