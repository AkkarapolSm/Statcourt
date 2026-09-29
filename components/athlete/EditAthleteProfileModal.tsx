"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Ruler,
  Weight,
  Maximize2,
  TrendingUp,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Activity,
  Award,
} from "lucide-react";
import { AthleteProfile, Position } from "@/lib/types";

interface EditAthleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: AthleteProfile;
  onProfileUpdated: (updated: AthleteProfile) => void;
}

const POSITIONS: { value: Position; labelTh: string; labelEn: string }[] = [
  { value: "POINT_GUARD", labelTh: "พอยต์การ์ด (PG)", labelEn: "Point Guard" },
  { value: "SHOOTING_GUARD", labelTh: "ชูตติ้งการ์ด (SG)", labelEn: "Shooting Guard" },
  { value: "SMALL_FORWARD", labelTh: "สมอลฟอร์เวิร์ด (SF)", labelEn: "Small Forward" },
  { value: "POWER_FORWARD", labelTh: "เพาเวอร์ฟอร์เวิร์ด (PF)", labelEn: "Power Forward" },
  { value: "CENTER", labelTh: "เซ็นเตอร์ (C)", labelEn: "Center" },
];

export default function EditAthleteProfileModal({
  isOpen,
  onClose,
  athlete,
  onProfileUpdated,
}: EditAthleteProfileModalProps) {
  // Form state initialized from athlete prop
  const [heightCm, setHeightCm] = useState<number>(athlete.heightCm || 185);
  const [weightKg, setWeightKg] = useState<number>(athlete.weightKg || 75);
  const [wingspanCm, setWingspanCm] = useState<number>(
    athlete.wingspanCm || Math.round((athlete.heightCm || 185) * 1.04)
  );
  const [standingReachCm, setStandingReachCm] = useState<number>(
    athlete.standingReachCm || Math.round((athlete.heightCm || 185) * 1.32)
  );
  const [primaryPosition, setPrimaryPosition] = useState<Position>(
    athlete.primaryPosition || "CENTER"
  );
  const [secondaryPosition, setSecondaryPosition] = useState<Position | "NONE">(
    athlete.secondaryPosition || "NONE"
  );
  const [jerseyNumber, setJerseyNumber] = useState<number>(athlete.jerseyNumber ?? 7);
  const [schoolOrClub, setSchoolOrClub] = useState<string>(athlete.schoolOrClub || "");
  const [province, setProvince] = useState<string>(athlete.province || "Bangkok");
  const [bio, setBio] = useState<string>(athlete.bio || "");

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sync state whenever athlete prop changes
  useEffect(() => {
    if (athlete) {
      setHeightCm(athlete.heightCm || 185);
      setWeightKg(athlete.weightKg || 75);
      setWingspanCm(athlete.wingspanCm || Math.round((athlete.heightCm || 185) * 1.04));
      setStandingReachCm(athlete.standingReachCm || Math.round((athlete.heightCm || 185) * 1.32));
      setPrimaryPosition(athlete.primaryPosition || "CENTER");
      setSecondaryPosition(athlete.secondaryPosition || "NONE");
      setJerseyNumber(athlete.jerseyNumber ?? 7);
      setSchoolOrClub(athlete.schoolOrClub || "");
      setProvince(athlete.province || "Bangkok");
      setBio(athlete.bio || "");
      setStatusMessage(null);
    }
  }, [athlete, isOpen]);

  if (!isOpen) return null;

  // Real-time Sports Science Biometric Calculations
  const apeIndex = Math.round((wingspanCm - heightCm) * 10) / 10;
  const wingspanRatio = heightCm > 0 ? (wingspanCm / heightCm).toFixed(3) : "1.000";

  // Imperial conversions
  const heightInches = heightCm / 2.54;
  const heightFeet = Math.floor(heightInches / 12);
  const heightRemInches = Math.round(heightInches % 12);
  const imperialHeight = `${heightFeet}'${heightRemInches}"`;

  const weightLbs = Math.round(weightKg * 2.20462);

  const reachInches = (standingReachCm / 2.54).toFixed(1);
  const reachFeet = Math.floor(standingReachCm / 2.54 / 12);
  const reachRemInches = Math.round((standingReachCm / 2.54) % 12);
  const imperialReach = `${reachFeet}'${reachRemInches}"`;

  // Ape Index Qualitative Evaluation
  let apeTierLabel = "สัดส่วนมาตรฐานทางกายภาพ (Standard Athletic Ratio)";
  let apeTierColor = "text-slate-300 bg-slate-900 border-slate-800";
  if (apeIndex >= 10) {
    apeTierLabel = "ระดับยอดเยี่ยม (Elite Wingspan) ความได้เปรียบสูงด้านการรีบาวด์และการป้องกัน";
    apeTierColor = "text-red-300 bg-red-950/80 border-red-800";
  } else if (apeIndex >= 5) {
    apeTierLabel = "ระดับช่วงแขนยาวได้เปรียบ (Positive Length) รองรับการเล่นทั้งวงในและวงนอก";
    apeTierColor = "text-slate-200 bg-slate-800 border-slate-700";
  } else if (apeIndex < 0) {
    apeTierLabel = "สัดส่วนกระทัดรัด (Compact Ratio) โดดเด่นด้านความคล่องตัวและการครอบครองบอล";
    apeTierColor = "text-slate-400 bg-slate-900/60 border-slate-800";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    // Sanity validations
    if (heightCm < 120 || heightCm > 240) {
      setStatusMessage({ type: "error", text: "ส่วนสูงต้องอยู่ระหว่าง 120 - 240 ซม." });
      setIsLoading(false);
      return;
    }
    if (weightKg < 30 || weightKg > 200) {
      setStatusMessage({ type: "error", text: "น้ำหนักต้องอยู่ระหว่าง 30 - 200 กก." });
      setIsLoading(false);
      return;
    }
    if (wingspanCm < 120 || wingspanCm > 260) {
      setStatusMessage({ type: "error", text: "ช่วงแขนต้องอยู่ระหว่าง 120 - 260 ซม." });
      setIsLoading(false);
      return;
    }
    if (standingReachCm < 140 || standingReachCm > 320) {
      setStatusMessage({ type: "error", text: "ระยะเอื้อมยืนแตะต้องอยู่ระหว่าง 140 - 320 ซม." });
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        heightCm,
        weightKg,
        wingspanCm,
        standingReachCm,
        primaryPosition,
        secondaryPosition: secondaryPosition === "NONE" ? null : secondaryPosition,
        jerseyNumber,
        schoolOrClub,
        province,
        bio,
      };

      const res = await fetch(`/api/athletes/${athlete.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      setStatusMessage({
        type: "success",
        text: "อัปเดตสรีระและโปรไฟล์นักกีฬาสำเร็จ! ข้อมูลถูกบันทึกลงระบบเรียบร้อย",
      });

      // Update parent state
      const updatedProfile: AthleteProfile = {
        ...athlete,
        ...payload,
        secondaryPosition: secondaryPosition === "NONE" ? null : secondaryPosition,
      };
      onProfileUpdated(updatedProfile);

      // Auto-close after 1.5s
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 text-white font-mono">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#1E293B]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#AF101A]/20 border border-[#AF101A]/40 flex items-center justify-center text-[#DC2626]">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>แก้ไขข้อมูลสรีระและโปรไฟล์นักกีฬา</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  DRAFT COMBINE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                อัปเดตสัดส่วนทางกายภาพ สังกัด และตำแหน่งเพื่อคำนวณ Ape Index และส่งออก TCAS Portfolio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICATION BANNER */}
        {statusMessage && (
          <div
            className={`px-6 py-3 flex items-center gap-2 text-xs font-bold border-b ${
              statusMessage.type === "success"
                ? "bg-slate-900 text-white border-slate-800"
                : "bg-red-950/80 text-red-300 border-red-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {/* LIVE BIOMETRIC HUD CARD */}
          <div className="bg-gradient-to-r from-slate-900 to-[#1E293B] border border-slate-700/80 rounded-xl p-4 shadow-inner">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>คำนวณดัชนีสรีระแบบเรียลไทม์ (REAL-TIME BIOMETRICS HUD)</span>
              </span>
              <span className="text-[11px] text-slate-400">FIBA Combine Standard</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {/* Ape Index */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  APE INDEX
                </div>
                <div className="text-2xl font-bold text-white mt-0.5">
                  {apeIndex >= 0 ? `+${apeIndex}` : apeIndex} <span className="text-xs">CM</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  อัตราส่วน {wingspanRatio}x
                </div>
              </div>

              {/* Height Imperial */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  ส่วนสูง (IMPERIAL)
                </div>
                <div className="text-2xl font-bold text-white mt-0.5">
                  {imperialHeight}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{heightCm} cm</div>
              </div>

              {/* Standing Reach Imperial */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  ยืนแตะ (STAND REACH)
                </div>
                <div className="text-2xl font-bold text-white mt-0.5">
                  {imperialReach}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{reachInches} inches</div>
              </div>

              {/* Weight Imperial */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  น้ำหนัก (POUNDS)
                </div>
                <div className="text-2xl font-bold text-white mt-0.5">
                  {weightLbs} <span className="text-xs font-normal text-slate-400">LBS</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{weightKg} kg</div>
              </div>
            </div>

            {/* Ape Index Evaluation Badge */}
            <div className={`mt-3 p-2 rounded-lg border text-xs flex items-center gap-2 ${apeTierColor}`}>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <span className="font-bold">การวิเคราะห์สรีระ:</span> {apeTierLabel}
              </div>
            </div>
          </div>

          {/* SECTION 1: สัดส่วนสรีระ (Physical Measurements) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <Ruler className="w-4 h-4 text-red-400" />
              <span>1. สัดส่วนและสมรรถภาพทางสรีระ (Measurements)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ส่วนสูง (Height in cm) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-bold">
                    ส่วนสูง (Height) <span className="text-red-400">*</span>
                  </label>
                  <span className="text-slate-400">{imperialHeight}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHeightCm((prev) => Math.max(120, prev - 1))}
                    className="w-9 h-9 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition flex items-center justify-center"
                  >
                    -
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={120}
                      max={240}
                      step={0.5}
                      value={heightCm}
                      onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-red-500 pr-10 text-center"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">cm</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHeightCm((prev) => Math.min(240, prev + 1))}
                    className="w-9 h-9 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* น้ำหนัก (Weight in kg) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-bold">
                    น้ำหนัก (Weight) <span className="text-red-400">*</span>
                  </label>
                  <span className="text-slate-400">{weightLbs} lbs</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWeightKg((prev) => Math.max(30, prev - 1))}
                    className="w-9 h-9 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition flex items-center justify-center"
                  >
                    -
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={30}
                      max={200}
                      step={0.5}
                      value={weightKg}
                      onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-red-500 pr-10 text-center"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">kg</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeightKg((prev) => Math.min(200, prev + 1))}
                    className="w-9 h-9 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ช่วงแขน (Wingspan in cm) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-bold">
                    ช่วงแขน (Wingspan) <span className="text-red-400">*</span>
                  </label>
                  <span className="text-slate-300 font-bold">
                    Ape: {apeIndex >= 0 ? `+${apeIndex}` : apeIndex} cm
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWingspanCm((prev) => Math.max(120, prev - 1))}
                    className="w-9 h-9 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition flex items-center justify-center"
                  >
                    -
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={120}
                      max={260}
                      step={0.5}
                      value={wingspanCm}
                      onChange={(e) => setWingspanCm(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-red-500 pr-10 text-center"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">cm</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWingspanCm((prev) => Math.min(260, prev + 1))}
                    className="w-9 h-9 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ระยะเอื้อมยืนแตะ (Standing Reach in cm) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-bold">
                    ระยะเอื้อมยืนแตะ (Standing Reach)
                  </label>
                  <span className="text-slate-400">{reachInches} in</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStandingReachCm((prev) => Math.max(140, prev - 1))}
                    className="w-9 h-9 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition flex items-center justify-center"
                  >
                    -
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={140}
                      max={320}
                      step={0.5}
                      value={standingReachCm}
                      onChange={(e) => setStandingReachCm(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-red-500 pr-10 text-center"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">cm</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStandingReachCm((prev) => Math.min(320, prev + 1))}
                    className="w-9 h-9 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: ข้อมูลการเล่นและสังกัด (Positions & Team) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>2. ข้อมูลตำแหน่ง หมายเลข และสังกัดทีม (Team & Position)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Primary Position */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-bold">
                  ตำแหน่งหลัก (Primary Position) <span className="text-red-400">*</span>
                </label>
                <select
                  value={primaryPosition}
                  onChange={(e) => setPrimaryPosition(e.target.value as Position)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-red-500"
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.labelTh}
                    </option>
                  ))}
                </select>
              </div>

              {/* Secondary Position */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-bold">
                  ตำแหน่งรอง (Secondary Position)
                </label>
                <select
                  value={secondaryPosition}
                  onChange={(e) => setSecondaryPosition(e.target.value as Position | "NONE")}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-red-500"
                >
                  <option value="NONE">ไม่มี / ไม่ระบุ (None)</option>
                  {POSITIONS.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.labelTh}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jersey Number */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-bold">
                  หมายเลขเสื้อ (Jersey #)
                </label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-red-500 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* School or Club */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-bold">
                  โรงเรียน / สโมสรต้นสังกัด (School / Club)
                </label>
                <input
                  type="text"
                  value={schoolOrClub}
                  onChange={(e) => setSchoolOrClub(e.target.value)}
                  placeholder="เช่น Bangkok Christian College"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Province */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-bold">จังหวัด (Province)</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="เช่น Bangkok หรือ Chiang Mai"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: ประวัติและสไตล์การเล่น (Bio & Scouting Notes) */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold flex items-center justify-between">
              <span>3. ข้อมูลประวัติและรูปแบบการเล่น (Athlete & Scouting Bio)</span>
              <span className="text-[11px] text-slate-500">
                {bio.length} ตัวอักษร
              </span>
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="ระบุจุดเด่น ทักษะความเชี่ยวชาญ และเป้าหมายทางวิชาการและกีฬาในระดับอุดมศึกษา..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-sans focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          {/* MODAL ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-900/30 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>บันทึกการเปลี่ยนแปลง</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
