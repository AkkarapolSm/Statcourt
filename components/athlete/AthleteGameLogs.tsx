"use client";

import React, { useState, useMemo } from "react";
import { Check, X } from "lucide-react";
import { AthleteProfile, AthleteSeasonStats } from "@/lib/types";

interface AthleteGameLogsProps {
  athlete: AthleteProfile;
  stats: AthleteSeasonStats;
  onOpenLineage?: () => void;
}

export interface GameEventRow {
  id: string;
  eventId: string;
  matchStage: string;
  scoreContext: string;
  actionBadge: string;
  actionBadgeColor: string;
  isClutch?: boolean;
  clutchLabel?: string;
  championshipPoint?: boolean;
  actionDescription: string;
  points: string;
  pointsClass: string;
  periodClock: string;
  videoDuration: string;
  verifierName: string;
  quarter: number;
  category: "PTS" | "REB" | "AST" | "DEF";
}

export default function AthleteGameLogs({ athlete, stats, onOpenLineage }: AthleteGameLogsProps) {
  const [selectedTournament, setSelectedTournament] = useState("BSAT_U18");
  const [selectedMatch, setSelectedMatch] = useState("match-1");
  const [activeCategory, setActiveCategory] = useState<"ALL" | "PTS" | "REB" | "AST" | "DEF">("ALL");
  const [activeQuarter, setActiveQuarter] = useState<"ALL" | 1 | 2 | 3 | 4>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const events: GameEventRow[] = useMemo(() => [
    {
      id: "ev-1",
      eventId: "#EV-71-22",
      matchStage: "TOA Grand Final vs. Debsirin",
      scoreContext: "104-102 Overtime F",
      actionBadge: "2-POINT FIELD GOAL",
      actionBadgeColor: "bg-[#AF101A] text-white",
      isClutch: true,
      clutchLabel: "CLUTCH",
      championshipPoint: true,
      actionDescription: "หมุนตัวทำคะแนนใต้แป้น (Drop Step) หลบการบล็อก ปิดเกมด้วยคะแนน 78-74 คว้าตำแหน่งชนะเลิศระดับประเทศ",
      points: "+2 PTS",
      pointsClass: "text-slate-900 bg-slate-100 font-mono font-bold border border-slate-200",
      periodClock: "Q4 • 00:08",
      videoDuration: "14s Reel",
      verifierName: "T. Somchai",
      quarter: 4,
      category: "PTS",
    },
    {
      id: "ev-2",
      eventId: "#EV-71-21",
      matchStage: "TOA Grand Final vs. Debsirin",
      scoreContext: "National Championship Q4",
      actionBadge: "BLOCK (บล็อกลูกยิง)",
      actionBadgeColor: "bg-slate-900 text-white",
      isClutch: true,
      clutchLabel: "CLUTCH DEF",
      actionDescription: "กระโดดบล็อกลูกเลย์อัพเดี่ยวในระยะ 15 วินาทีสุดท้าย ยับยั้งการทำคะแนนตีเสมอ 74-74 ปัดบอลออกนอกเส้นสนาม",
      points: "0 PTS",
      pointsClass: "text-slate-500 font-mono",
      periodClock: "Q4 • 00:25",
      videoDuration: "18s Reel",
      verifierName: "T. Somchai",
      quarter: 4,
      category: "DEF",
    },
    {
      id: "ev-3",
      eventId: "#EV-71-20",
      matchStage: "TOA Grand Final vs. Debsirin",
      scoreContext: "National Championship Q4",
      actionBadge: "DEF REBOUND",
      actionBadgeColor: "bg-slate-100 text-slate-800 border border-slate-300",
      actionDescription: "เก็บบอลรีบาวด์เกมรับใต้แป้นพร้อมครอบครองบอลอย่างสมบูรณ์จากจังหวะยิง 3 คะแนนของฝ่ายตรงข้าม",
      points: "0 PTS",
      pointsClass: "text-slate-500 font-mono",
      periodClock: "Q4 • 01:20",
      videoDuration: "09s Reel",
      verifierName: "W. Anan",
      quarter: 4,
      category: "REB",
    },
    {
      id: "ev-4",
      eventId: "#EV-71-19",
      matchStage: "TOA Grand Final vs. Debsirin",
      scoreContext: "National Championship Q4",
      actionBadge: "2-POINT FIELD GOAL",
      actionBadgeColor: "bg-[#AF101A] text-white",
      actionDescription: "เข้าทำคะแนนจากตำแหน่งโพสต์ (Post Play) หมุนตัวหลบผู้เล่นป้องกันวงใน สำเร็จ 2 คะแนน",
      points: "+2 PTS",
      pointsClass: "text-slate-900 bg-slate-100 font-mono font-bold border border-slate-200",
      periodClock: "Q4 • 04:12",
      videoDuration: "12s Reel",
      verifierName: "W. Anan",
      quarter: 4,
      category: "PTS",
    },
    {
      id: "ev-5",
      eventId: "#EV-71-18",
      matchStage: "TOA Grand Final vs. Debsirin",
      scoreContext: "National Championship Q3",
      actionBadge: "STEAL (สตีลบอล)",
      actionBadgeColor: "bg-slate-900 text-white",
      actionDescription: "อ่านทางบอลและตัดบอล (Steal) จากการส่งของพอยต์การ์ดฝ่ายตรงข้าม บริเวณหัวกะโหลก",
      points: "0 PTS",
      pointsClass: "text-slate-500 font-mono",
      periodClock: "Q3 • 02:40",
      videoDuration: "08s Reel",
      verifierName: "T. Somchai",
      quarter: 3,
      category: "DEF",
    },
    {
      id: "ev-6",
      eventId: "#EV-71-17",
      matchStage: "TOA Grand Final vs. Debsirin",
      scoreContext: "National Championship Q3",
      actionBadge: "FREE THROW (FT 1/1)",
      actionBadgeColor: "bg-[#AF101A] text-white",
      actionDescription: "ยิงลูกโทษจากการได้ฟาวล์จังหวะทำคะแนน (And-One) สำเร็จ",
      points: "+1 FT",
      pointsClass: "text-slate-900 bg-slate-100 font-mono font-bold border border-slate-200",
      periodClock: "Q3 • 05:14",
      videoDuration: "10s Reel",
      verifierName: "W. Anan",
      quarter: 3,
      category: "PTS",
    },
    {
      id: "ev-7",
      eventId: "#EV-70-16",
      matchStage: "Semi-Final vs. BCC",
      scoreContext: "Chiang Mai Arena Stadium",
      actionBadge: "OFF REB + TIP-IN",
      actionBadgeColor: "bg-[#AF101A] text-white",
      isClutch: true,
      clutchLabel: "CLUTCH",
      actionDescription: "กระโดดปัดบอลซ้ำเข้าห่วง (Tip-In) จังหวะสองก่อนหมดเวลา 40 วินาที ขยายคะแนนนำเป็น 74-70",
      points: "+2 PTS",
      pointsClass: "text-slate-900 bg-slate-100 font-mono font-bold border border-slate-200",
      periodClock: "Q4 • 00:40",
      videoDuration: "15s Reel",
      verifierName: "P. Nattapon",
      quarter: 4,
      category: "PTS",
    },
    {
      id: "ev-8",
      eventId: "#EV-70-15",
      matchStage: "Semi-Final vs. BCC",
      scoreContext: "Chiang Mai Arena Stadium",
      actionBadge: "BLOCK (บล็อกลูกยิง)",
      actionBadgeColor: "bg-slate-900 text-white",
      actionDescription: "กระโดดบล็อกลูกยิงกระทบแป้นของผู้เล่นหมายเลข 12 ปัดบอลออกนอกเส้นสนาม",
      points: "0 PTS",
      pointsClass: "text-slate-500 font-mono",
      periodClock: "Q4 • 04:19",
      videoDuration: "08s Reel",
      verifierName: "P. Nattapon",
      quarter: 4,
      category: "DEF",
    },
    {
      id: "ev-9",
      eventId: "#EV-70-14",
      matchStage: "Semi-Final vs. BCC",
      scoreContext: "Chiang Mai Arena Stadium",
      actionBadge: "ASSIST (ส่งทำคะแนน)",
      actionBadgeColor: "bg-slate-700 text-white",
      actionDescription: "จ่ายบอลส่งให้เพื่อนร่วมทีม (Assist) ดึงตัวประกบสองคนและส่งทำคะแนน 3 คะแนนจากมุมปีกซ้าย",
      points: "0 PTS",
      pointsClass: "text-slate-500 font-mono",
      periodClock: "Q3 • 06:18",
      videoDuration: "11s Reel",
      verifierName: "P. Nattapon",
      quarter: 3,
      category: "AST",
    },
    {
      id: "ev-10",
      eventId: "#EV-69-13",
      matchStage: "Quarter-Final vs. Suankularb",
      scoreContext: "National Youth Games Q1",
      actionBadge: "2-POINT HOOK SHOT",
      actionBadgeColor: "bg-[#AF101A] text-white",
      actionDescription: "ยิงฮุกช็อตมือขวา (Hook Shot) ข้ามผู้เล่นป้องกัน ระยะ 10 ฟุต",
      points: "+2 PTS",
      pointsClass: "text-slate-900 bg-slate-100 font-mono font-bold border border-slate-200",
      periodClock: "Q1 • 07:20",
      videoDuration: "07s Reel",
      verifierName: "K. Kriangkrai",
      quarter: 1,
      category: "PTS",
    },
  ], []);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (activeCategory !== "ALL" && e.category !== activeCategory) return false;
      if (activeQuarter !== "ALL" && e.quarter !== activeQuarter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.actionDescription.toLowerCase().includes(q) ||
          e.matchStage.toLowerCase().includes(q) ||
          e.eventId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, activeCategory, activeQuarter, searchQuery]);

  const handleExportPdf = () => {
    setExportNotice("เริ่มดาวน์โหลดไฟล์ Courtside_Audit_Logs_STC_CMU_015.pdf เรียบร้อย");
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handlePrintSheet = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Audit Header Card & Verification Seal */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 md:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-2xl">description</span>
              <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wide flex items-center">
                COURTSIDE TABLE EVENT AUDIT LOGS
              </h2>
              <span className="text-body-md font-bold text-on-surface-variant">
                (บันทึกสถิติทางการส่งตรงจากโต๊ะกรรมการเทคนิค FIBA Digital Score)
              </span>
              <span className="bg-[#AF101A] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center uppercase tracking-wider">
                <span className="material-symbols-outlined mr-1 text-xs">verified_user</span>
                100% OFFICIALLY AUDITED
              </span>
            </div>
            <p className="text-body-sm text-secondary flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                Official Certification Token:{" "}
                <code className="font-mono bg-surface-container px-1 rounded text-primary font-bold">
                  STC-VERIFIED-TH-CMU-015
                </code>
              </span>
              <span>•</span>
              <span>FIBA LiveStats & Basketball Sport Association of Thailand (BSAT) Real-Time Feeder</span>
              <span>•</span>
              <span className="text-[#AF101A] font-semibold flex items-center">
                <span className="w-2 h-2 rounded-full bg-[#AF101A] mr-1 animate-pulse"></span>
                Zero Discrepancies Logged
              </span>
            </p>
          </div>

          {/* Export & Hardware Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrintSheet}
              className="bg-surface border border-outline-variant hover:border-primary text-on-surface hover:text-primary px-3 py-1.5 rounded text-body-sm font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              <span>พิมพ์ใบบันทึกคะแนน (Scoresheet)</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="bg-primary hover:bg-primary-container text-on-primary px-4 py-1.5 rounded text-body-sm font-bold uppercase tracking-wider flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              <span>ส่งออกรายงานสถิติ (PDF)</span>
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="mt-3 p-2.5 rounded bg-slate-900 border border-slate-800 text-white text-xs font-bold animate-fadeIn flex items-center gap-1.5">
            <Check className="w-4 h-4 text-[#AF101A] shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}
      </div>

      {/* 2. Tournament & Match Selectors Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Tournament Dropdown Filter */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-lg p-4">
          <label className="block text-label-caps uppercase text-secondary font-bold mb-1 flex items-center justify-between">
            <span>1. รายการแข่งขันทางการ (TOURNAMENT / COMPETITION)</span>
            <span className="text-primary font-bold text-[10px]">7 Matches Recorded</span>
          </label>
          <div className="relative">
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded p-2 text-body-md font-bold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer outline-none"
            >
              <option value="BSAT_U18">
                ชิงชนะเลิศเยาวชนแห่งชาติ U18 (BSAT National Youth Grand Slam 2026)
              </option>
              <option value="STUDENT_QUAL">
                กีฬานักเรียนนักศึกษาแห่งประเทศไทย รอบคัดเลือกภาค 5 (Chiang Mai Qualifiers)
              </option>
              <option value="TOA_NORTH">TOA Thailand Open Championship 2025 (North Regional)</option>
              <option value="ASEAN_TRIALS">ASEAN School Games Thailand Trials 2025</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
              arrow_drop_down
            </span>
          </div>
        </div>

        {/* Match Selectors Horizon (Pills Carousel) */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
            <span className="text-label-caps uppercase text-secondary font-bold">
              2. แมตช์การแข่งขันในรายการ (MATCHES IN THIS TOURNAMENT)
            </span>
            <div className="flex items-center gap-2">
              {onOpenLineage && (
                <button
                  type="button"
                  onClick={onOpenLineage}
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-mono font-bold hover:bg-indigo-100 transition cursor-pointer"
                  title="ตรวจสอบประวัติและใบรับรองผลสถิติอย่างเป็นทางการ"
                >
                  <span>ตรวจที่มาสถิติ (Provenance)</span>
                </button>
              )}
              <span className="text-[11px] text-primary-container font-bold flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1"></span>
                กำลังแสดง: {selectedMatch === "match-1" ? "รอบชิงชนะเลิศ vs Debsirin" : "แมตช์ที่ระบุ"} (22 รายการบันทึก)
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-1">
            {/* Match Pill 1 (Active) */}
            <div
              onClick={() => setSelectedMatch("match-1")}
              className={`p-2 rounded border cursor-pointer transition-all shadow-sm ${
                selectedMatch === "match-1"
                  ? "bg-primary-container text-on-primary-container border-primary"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface border-outline-variant"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-0.5">
                <span>28 ม.ค. 2026</span>
                <span className={selectedMatch === "match-1" ? "bg-surface-container-lowest text-primary px-1.5 py-0.5 rounded font-mono font-bold" : "bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-bold"}>
                  78 - 74
                </span>
              </div>
              <div className="font-headline-sm text-sm uppercase leading-tight font-bold">
                vs Debsirin School
              </div>
              <div className="text-[10px] flex items-center justify-between mt-0.5 opacity-90">
                <span>Grand Final</span>
                <span className="font-bold text-white bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] uppercase">MVP</span>
              </div>
            </div>

            {/* Match Pill 2 */}
            <div
              onClick={() => setSelectedMatch("match-2")}
              className={`p-2 rounded border cursor-pointer transition-all ${
                selectedMatch === "match-2"
                  ? "bg-primary-container text-on-primary-container border-primary"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface border-outline-variant"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-0.5 text-secondary">
                <span>26 ม.ค. 2026</span>
                <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-bold">69 - 61</span>
              </div>
              <div className="font-headline-sm text-sm uppercase leading-tight font-bold">
                vs Bangkok Christian (BCC)
              </div>
              <div className="text-[10px] text-secondary flex items-center justify-between mt-0.5">
                <span>Semi-Final</span>
                <span>18 pts / 12 reb</span>
              </div>
            </div>

            {/* Match Pill 3 */}
            <div
              onClick={() => setSelectedMatch("match-3")}
              className={`p-2 rounded border cursor-pointer transition-all ${
                selectedMatch === "match-3"
                  ? "bg-primary-container text-on-primary-container border-primary"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface border-outline-variant"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-0.5 text-secondary">
                <span>24 ม.ค. 2026</span>
                <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-bold">82 - 70</span>
              </div>
              <div className="font-headline-sm text-sm uppercase leading-tight font-bold">
                vs Suankularb Wittayalai
              </div>
              <div className="text-[10px] text-secondary flex items-center justify-between mt-0.5">
                <span>Quarter-Final</span>
                <span>16 pts / 15 reb</span>
              </div>
            </div>

            {/* Match Pill 4 */}
            <div
              onClick={() => setSelectedMatch("match-4")}
              className={`p-2 rounded border cursor-pointer transition-all ${
                selectedMatch === "match-4"
                  ? "bg-primary-container text-on-primary-container border-primary"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface border-outline-variant"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-0.5 text-secondary">
                <span>21 ม.ค. 2026</span>
                <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-bold">90 - 54</span>
              </div>
              <div className="font-headline-sm text-sm uppercase leading-tight font-bold">
                vs Triam Udom Suksa
              </div>
              <div className="text-[10px] text-secondary flex items-center justify-between mt-0.5">
                <span>Group Phase</span>
                <span>24 pts / 10 reb</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Official Cumulative Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#AF101A] text-2xl shrink-0">gavel</span>
          <div>
            <h4 className="font-headline-sm text-headline-sm text-white uppercase leading-none">
              บันทึกเหตุการณ์การแข่งขันทางการอย่างเป็นทางการ (Official Cumulative Logs)
            </h4>
            <p className="text-body-sm text-slate-300 mt-0.5">
              รวบรวมทุกจังหวะการเล่นที่ได้รับการรับรองจากกรรมการบันทึกสถิติ FIBA LiveStats • ปรับปรุงข้อมูลตามเวลาจริงผ่านระบบสมาคมกีฬาบาสเกตบอลแห่งประเทศไทย
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded text-body-sm font-bold border border-slate-700 shadow-sm font-mono">
            รวม 22 เหตุการณ์
          </span>
          <span className="bg-[#AF101A] text-white px-3 py-1 rounded text-label-caps uppercase font-bold tracking-wider flex items-center">
            <span className="material-symbols-outlined text-sm mr-1">check</span> BSAT TABLE SYNCED
          </span>
        </div>
      </div>

      {/* 4. Tactical Event Filters Toolbar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Primary Action Categories */}
        <div className="flex flex-wrap items-center gap-1.5 text-body-sm">
          <span className="text-label-caps uppercase text-secondary font-bold mr-1 flex items-center">
            <span className="material-symbols-outlined text-base mr-0.5">filter_alt</span> ตัวกรองสถิติ:
          </span>
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-3 py-1 rounded font-bold uppercase tracking-wider text-xs transition-colors ${
              activeCategory === "ALL" ? "bg-on-surface text-surface-container-lowest" : "bg-surface-container hover:bg-surface-dim text-on-surface"
            }`}
          >
            ทั้งหมด (22)
          </button>
          <button
            onClick={() => setActiveCategory("PTS")}
            className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider text-xs transition-colors ${
              activeCategory === "PTS" ? "bg-on-surface text-surface-container-lowest" : "bg-surface-container hover:bg-surface-dim text-on-surface"
            }`}
          >
            ทำคะแนน (PTS)
          </button>
          <button
            onClick={() => setActiveCategory("REB")}
            className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider text-xs transition-colors ${
              activeCategory === "REB" ? "bg-on-surface text-surface-container-lowest" : "bg-surface-container hover:bg-surface-dim text-on-surface"
            }`}
          >
            รีบาวด์ (REB)
          </button>
          <button
            onClick={() => setActiveCategory("AST")}
            className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider text-xs transition-colors ${
              activeCategory === "AST" ? "bg-on-surface text-surface-container-lowest" : "bg-surface-container hover:bg-surface-dim text-on-surface"
            }`}
          >
            แอสซิสต์ (AST)
          </button>
          <button
            onClick={() => setActiveCategory("DEF")}
            className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider text-xs transition-colors ${
              activeCategory === "DEF" ? "bg-on-surface text-surface-container-lowest" : "bg-surface-container hover:bg-surface-dim text-on-surface"
            }`}
          >
            การป้องกัน (BLK & STL)
          </button>

          <div className="h-4 w-px bg-outline-variant mx-1 hidden sm:block"></div>

          {/* Quarter Filters */}
          <span className="text-label-caps uppercase text-secondary font-bold mr-1">ควอเตอร์:</span>
          <button
            onClick={() => setActiveQuarter("ALL")}
            className={`px-2 py-0.5 rounded text-xs font-bold uppercase transition-colors ${
              activeQuarter === "ALL" ? "bg-primary text-on-primary" : "bg-surface-container hover:bg-surface-dim text-on-surface"
            }`}
          >
            ทุกควอเตอร์
          </button>
          <button
            onClick={() => setActiveQuarter(1)}
            className={`px-2 py-0.5 rounded text-xs font-bold uppercase transition-colors ${
              activeQuarter === 1 ? "bg-primary text-on-primary" : "bg-surface-container hover:bg-surface-dim text-on-surface"
            }`}
          >
            Q1
          </button>
          <button
            onClick={() => setActiveQuarter(2)}
            className={`px-2 py-0.5 rounded text-xs font-bold uppercase transition-colors ${
              activeQuarter === 2 ? "bg-primary text-on-primary" : "bg-surface-container hover:bg-surface-dim text-on-surface"
            }`}
          >
            Q2
          </button>
          <button
            onClick={() => setActiveQuarter(3)}
            className={`px-2 py-0.5 rounded text-xs font-bold uppercase transition-colors ${
              activeQuarter === 3 ? "bg-primary text-on-primary" : "bg-surface-container hover:bg-surface-dim text-on-surface"
            }`}
          >
            Q3
          </button>
          <button
            onClick={() => setActiveQuarter(4)}
            className={`px-2 py-0.5 rounded text-xs font-bold uppercase transition-colors ${
              activeQuarter === 4 ? "bg-primary text-on-primary" : "bg-surface-container hover:bg-surface-dim text-on-surface"
            }`}
          >
            Q4
          </button>
        </div>

        {/* Right Search Box & Chrono Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-secondary text-base">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded pl-7 pr-2 py-1 text-xs text-on-surface placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="ค้นหาเหตุการณ์..."
              type="text"
            />
          </div>
          <button
            className="bg-surface-container-low hover:bg-surface-container p-1.5 rounded border border-outline-variant text-secondary hover:text-primary transition-colors cursor-pointer"
            title="เรียงจากล่าสุด"
          >
            <span className="material-symbols-outlined text-lg">swap_vert</span>
          </button>
        </div>
      </div>

      {/* 5. Comprehensive Chronological Audit Table (FIBA LiveStats Spec) */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-secondary uppercase tracking-wider font-label-caps">
                <th className="py-2.5 px-3 text-center w-24">EVENT ID</th>
                <th className="py-2.5 px-3 w-48">MATCH & STAGE</th>
                <th className="py-2.5 px-4 min-w-[320px]">ACTION PERFORMED (รูปแบบการเล่นในสนาม)</th>
                <th className="py-2.5 px-3 text-center w-24">POINTS</th>
                <th className="py-2.5 px-3 text-center w-28">PERIOD & CLOCK</th>
                <th className="py-2.5 px-3 text-center w-28">VIDEO CLIP</th>
                <th className="py-2.5 px-3 text-right w-24">VERIFIER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
              {filteredEvents.map((row) => (
                <tr key={row.id} className="hover:bg-primary-fixed/20 transition-colors">
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-primary text-xs">
                    {row.eventId}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-xs">{row.matchStage}</div>
                    <div className="text-[10px] text-secondary">{row.scoreContext}</div>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`${row.actionBadgeColor} px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider`}>
                        {row.actionBadge}
                      </span>
                      {row.isClutch && (
                        <span className="bg-[#AF101A] text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide flex items-center">
                          <span className="material-symbols-outlined text-xs mr-0.5">bolt</span>
                          {row.clutchLabel}
                        </span>
                      )}
                      {row.championshipPoint && (
                        <span className="font-bold text-on-surface">[CHAMPIONSHIP POINT]</span>
                      )}
                      <span className="text-secondary text-xs">{row.actionDescription}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${row.pointsClass}`}>
                      {row.points}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-xs text-primary">
                    {row.periodClock}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => setActiveVideoModal(row.eventId)}
                      className="bg-surface-container-low hover:bg-primary hover:text-on-primary text-on-surface px-2 py-1 rounded text-[11px] font-bold flex items-center justify-center mx-auto gap-1 border border-outline-variant transition-colors shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">play_circle</span>
                      <span>{row.videoDuration}</span>
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-right text-[11px] text-secondary font-mono">
                    <span className="text-slate-700 font-bold inline-flex items-center gap-1" title="FIBA Verified Table Stamp">
                      <Check className="w-3 h-3 text-[#AF101A] shrink-0" />
                      {row.verifierName}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Control Pagination & Summary */}
        <div className="bg-surface-container-low border-t border-outline-variant p-3 flex flex-col sm:flex-row items-center justify-between text-body-sm text-secondary gap-2">
          <div className="flex items-center gap-2">
            <span>แสดง {filteredEvents.length} จาก 22 รายการบันทึก</span>
            <span>•</span>
            <span className="text-primary font-bold">บันทึกข้อมูลสถิติสมบูรณ์ตามเกณฑ์มาตรฐาน FIBA</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 border border-outline-variant rounded bg-surface-container-lowest text-secondary font-bold text-xs opacity-50 cursor-not-allowed">
              « ก่อนหน้า
            </button>
            <button className="px-2.5 py-1 border border-primary rounded bg-primary text-on-primary font-bold text-xs">
              1
            </button>
            <button className="px-2.5 py-1 border border-outline-variant rounded bg-surface-container-lowest text-secondary hover:text-primary font-bold text-xs">
              2
            </button>
            <button className="px-2.5 py-1 border border-outline-variant rounded bg-surface-container-lowest text-secondary hover:text-primary font-bold text-xs">
              3
            </button>
            <button className="px-2.5 py-1 border border-outline-variant rounded bg-surface-container-lowest text-secondary hover:text-primary font-bold text-xs">
              ถัดไป »
            </button>
          </div>
        </div>
      </div>

      {/* 6. Cryptographic Hash Footer & Sports Science Verification Seal */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 md:p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-body-sm">
          {/* Crypto Hash Verification */}
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl shrink-0">lock</span>
            <div>
              <div className="text-label-caps uppercase text-secondary font-bold">
                CRYPTOGRAPHIC INTEGRITY HASH
              </div>
              <div className="font-mono text-xs font-bold text-on-surface select-all">
                SHA-256: 9a7b2c01f4e8839d09c3
              </div>
              <div className="text-[10px] text-slate-600 font-semibold">
                FIBA LiveStats Immutable Block Verified
              </div>
            </div>
          </div>

          {/* Official Match ID */}
          <div className="flex items-center gap-3 border-y md:border-y-0 md:border-x border-outline-variant py-2 md:py-0 md:px-4">
            <span className="material-symbols-outlined text-secondary text-3xl shrink-0">tag</span>
            <div>
              <div className="text-label-caps uppercase text-secondary font-bold">
                TOURNAMENT MATCH IDENTIFIER
              </div>
              <div className="font-mono text-xs font-bold text-primary">
                TH-TOA-2026-F01-CMU-DEB
              </div>
              <div className="text-[10px] text-secondary">Courtside Official Table Terminal #02</div>
            </div>
          </div>

          {/* BSAT Digital Stamp */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-label-caps uppercase text-secondary font-bold">
                GOVERNING BODY AUDIT
              </div>
              <div className="font-bold text-xs text-on-surface">
                Basketball Sport Association of Thailand
              </div>
              <div className="text-[10px] text-slate-600 font-semibold">
                Official Table Verified • License Passed
              </div>
            </div>
            <div className="bg-surface-container px-2.5 py-1.5 rounded border border-outline-variant text-center shrink-0">
              <span
                className="material-symbols-outlined text-primary text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <div className="text-[9px] font-bold uppercase text-primary leading-none mt-0.5">
                BSAT APPROVED
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Reel Modal Simulation */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-xl border border-outline p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm uppercase text-primary">
                Official Highlight Clip • {activeVideoModal}
              </span>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-secondary hover:text-on-surface p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center text-white/50 relative overflow-hidden">
              <span className="material-symbols-outlined text-5xl">play_circle</span>
              <span className="absolute bottom-2 left-2 text-xs font-mono bg-black/80 px-2 py-0.5 rounded text-white">
                FIBA LiveSync Timestamp: 00:08 Q4
              </span>
            </div>
            <p className="text-xs text-secondary">
              วิดีโอบันทึกภาพจากกล้องถ่ายทอดสดหลักข้างสนาม (Official Broadcast Cam 1) รับรองความถูกต้องของสถิตินักกีฬา
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
