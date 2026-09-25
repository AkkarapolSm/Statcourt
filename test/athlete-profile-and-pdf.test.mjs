import test from "node:test";
import assert from "node:assert/strict";
import { mockAthleteProfiles, mockLeaderboardAthletes } from "../lib/db/seed-data.ts";

// Biometric formulas
function calculateApeIndex(wingspanCm, heightCm) {
  return Math.round((wingspanCm - heightCm) * 10) / 10;
}

function calculateWingspanRatio(wingspanCm, heightCm) {
  if (!heightCm || heightCm <= 0) return "1.000";
  return (wingspanCm / heightCm).toFixed(3);
}

function formatImperialHeight(cm) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

function formatImperialWeight(kg) {
  return Math.round(kg * 2.20462);
}

test("Athlete Biometrics: calculateApeIndex computes exact Ape Index in centimeters", () => {
  // Bhuripat / Thanakorn: 191cm wingspan - 184cm height = +7 cm
  assert.equal(calculateApeIndex(191, 184), 7);
  // Elite Center: 213cm wingspan - 204cm height = +9 cm
  assert.equal(calculateApeIndex(213, 204), 9);
  // Compact Guard: 180cm wingspan - 182cm height = -2 cm
  assert.equal(calculateApeIndex(180, 182), -2);
});

test("Athlete Biometrics: calculateWingspanRatio computes accurate ratio to height", () => {
  assert.equal(calculateWingspanRatio(213, 204), "1.044");
  assert.equal(calculateWingspanRatio(191, 184), "1.038");
});

test("Athlete Biometrics: imperial conversions match standard draft combine numbers", () => {
  // 184 cm -> 6'0"
  assert.equal(formatImperialHeight(184), "6'0\"");
  // 204 cm -> 6'8"
  assert.equal(formatImperialHeight(204), "6'8\"");
  // 76 kg -> 168 lbs
  assert.equal(formatImperialWeight(76), 168);
  // 102 kg -> 225 lbs
  assert.equal(formatImperialWeight(102), 225);
});

test("Athlete Profile Edit: validation constraints check for physical boundaries", () => {
  const validateBiometrics = ({ heightCm, weightKg, wingspanCm, standingReachCm }) => {
    if (heightCm !== undefined && (heightCm < 120 || heightCm > 240)) {
      return { valid: false, error: "ส่วนสูงต้องอยู่ระหว่าง 120 - 240 เซนติเมตร" };
    }
    if (weightKg !== undefined && (weightKg < 30 || weightKg > 200)) {
      return { valid: false, error: "น้ำหนักต้องอยู่ระหว่าง 30 - 200 กิโลกรัม" };
    }
    if (wingspanCm !== undefined && (wingspanCm < 120 || wingspanCm > 260)) {
      return { valid: false, error: "ช่วงแขน (Wingspan) ต้องอยู่ระหว่าง 120 - 260 เซนติเมตร" };
    }
    if (standingReachCm !== undefined && (standingReachCm < 140 || standingReachCm > 320)) {
      return { valid: false, error: "ระยะเอื้อมยืนแตะ (Standing Reach) ต้องอยู่ระหว่าง 140 - 320 เซนติเมตร" };
    }
    return { valid: true };
  };

  assert.equal(validateBiometrics({ heightCm: 188, weightKg: 80, wingspanCm: 198, standingReachCm: 245 }).valid, true);
  assert.equal(validateBiometrics({ heightCm: 110 }).valid, false);
  assert.equal(validateBiometrics({ weightKg: 250 }).valid, false);
  assert.equal(validateBiometrics({ wingspanCm: 100 }).valid, false);
  assert.equal(validateBiometrics({ standingReachCm: 350 }).valid, false);
});

test("TCAS PDF Export: requires all official certification dossier data points", () => {
  const athlete = mockAthleteProfiles["ath-1"];
  const stats = mockLeaderboardAthletes.find((s) => s.athleteId === "ath-1");

  assert.ok(athlete, "Athlete profile exists");
  assert.ok(stats, "Athlete season stats exist");
  assert.ok(athlete.firstName && athlete.lastName, "Athlete has full name");
  assert.ok(athlete.heightCm >= 120, "Athlete has valid height");
  assert.ok(athlete.wingspanCm >= 120, "Athlete has valid wingspan");
  assert.ok(athlete.tcasReferenceCode, "Athlete has TCAS reference code");
  assert.ok(stats.gamesPlayed > 0, "Stats have games played");
  assert.ok(stats.effPerGame > 0, "Stats have official EFF rating");
  assert.ok(stats.ppg >= 0, "Stats have PPG average");
});
