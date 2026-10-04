"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Columns2,
  X,
  Film,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Download,
  Lock,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HighlightReelGeneratorModal from "@/components/scout/HighlightReelGeneratorModal";
import AcademicTrackerModal from "@/components/athlete/AcademicTrackerModal";
import { Position } from "@/lib/types";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { canAccessScoutHub } from "@/lib/auth/rbac";

interface ScoutProspect {
  id: string;
  name: string;
  fullName: string;
  school: string;
  province: string;
  position: Position;
  age: number;
  heightCm: number;
  wingspanCm: number;
  standingReachCm: number;
  effPerGame: number;
  ppg: number;
  rpg: number;
  apg: number;
  efgPct: number;
  tsPct: number;
  astToRatio: number;
  tcasCode: string;
  avatarUrl: string;
  gpax: number;
  isNationalPool: boolean;
}

export default function AdvancedScoutEnginePage() {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<"ALL" | Position>("ALL");
  const [minHeight, setMinHeight] = useState<number>(175);
  const [onlyOver190, setOnlyOver190] = useState(false);

  // Advanced FIBA Metrics Filters
  const [minEff] = useState<number>(0);
  const [minTsPct, setMinTsPct] = useState<number>(0);
  const [minAstTo, setMinAstTo] = useState<number>(0);

  // Interaction States
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(["ath-1"]);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL_PROSPECTS" | "SHORTLIST">("ALL_PROSPECTS");
  const { currentUser, loginAs } = useAuthStore();
  const hasScoutAccess = canAccessScoutHub(currentUser);

  // Modals
  const [selectedAthleteForReel, setSelectedAthleteForReel] = useState<ScoutProspect | null>(null);
  const [selectedAthleteForAcademic, setSelectedAthleteForAcademic] = useState<ScoutProspect | null>(null);

  // Raw mock list combining seed profiles with verified combine stats
  const allProspects: ScoutProspect[] = useMemo(() => {
    return [
      {
        id: "ath-1",
        name: "Thanakorn Siriphan",
        fullName: "Thanakorn Siriphan (ธนากร ศิริพันธ์)",
        school: "Bangkok Christian College",
        province: "Bangkok",
        position: "POINT_GUARD" as Position,
        age: 18,
        heightCm: 184,
        wingspanCm: 191,
        standingReachCm: 238,
        effPerGame: 26.4,
        ppg: 18.0,
        rpg: 4.2,
        apg: 6.4,
        efgPct: 58.4,
        tsPct: 62.4,
        astToRatio: 2.8,
        tcasCode: "STC-VERIFIED-TH-BCC-007",
        avatarUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80",
        gpax: 3.68,
        isNationalPool: true,
      },
      {
        id: "ath-8",
        name: "Nattapat Sukprasert",
        fullName: "Nattapat Sukprasert (ณัฐภัทร สุขประเสริฐ)",
        school: "Debsirin School",
        province: "Bangkok",
        position: "SHOOTING_GUARD" as Position,
        age: 18,
        heightCm: 189,
        wingspanCm: 196,
        standingReachCm: 245,
        effPerGame: 24.1,
        ppg: 22.4,
        rpg: 5.8,
        apg: 3.2,
        efgPct: 55.2,
        tsPct: 59.8,
        astToRatio: 1.6,
        tcasCode: "STC-VERIFIED-TH-DS-023",
        avatarUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80",
        gpax: 3.42,
        isNationalPool: true,
      },
      {
        id: "ath-10",
        name: "Phurit Charoenwong",
        fullName: "Phurit Charoenwong (ภูริช เจริญวงศ์)",
        school: "Assumption College Thonburi",
        province: "Bangkok",
        position: "SMALL_FORWARD" as Position,
        age: 17,
        heightCm: 194,
        wingspanCm: 202,
        standingReachCm: 252,
        effPerGame: 22.8,
        ppg: 17.5,
        rpg: 8.4,
        apg: 2.8,
        efgPct: 52.0,
        tsPct: 56.5,
        astToRatio: 1.9,
        tcasCode: "STC-VERIFIED-TH-ACT-013",
        avatarUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
        gpax: 3.55,
        isNationalPool: false,
      },
      {
        id: "ath-11",
        name: "Teerawat Prasertkul",
        fullName: "Teerawat Prasertkul (ธีรวัฒน์ ประเสริฐกุล)",
        school: "Suankularb Wittayalai",
        province: "Nonthaburi",
        position: "POWER_FORWARD" as Position,
        age: 18,
        heightCm: 199,
        wingspanCm: 206,
        standingReachCm: 258,
        effPerGame: 21.6,
        ppg: 15.2,
        rpg: 10.6,
        apg: 1.8,
        efgPct: 56.0,
        tsPct: 58.0,
        astToRatio: 1.2,
        tcasCode: "STC-VERIFIED-TH-SK-034",
        avatarUrl: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=400&q=80",
        gpax: 3.15,
        isNationalPool: true,
      },
      {
        id: "ath-12",
        name: "Anusorn Khummuang",
        fullName: "Anusorn Khummuang (อนุสรณ์ คำเมือง)",
        school: "Debsirin School",
        province: "Bangkok",
        position: "CENTER" as Position,
        age: 18,
        heightCm: 203,
        wingspanCm: 214,
        standingReachCm: 268,
        effPerGame: 23.5,
        ppg: 14.8,
        rpg: 12.2,
        apg: 1.4,
        efgPct: 61.2,
        tsPct: 63.0,
        astToRatio: 0.9,
        tcasCode: "STC-VERIFIED-TH-DS-055",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        gpax: 3.20,
        isNationalPool: true,
      },
      {
        id: "ath-2",
        name: "Thanawat Chotirattana",
        fullName: "Thanawat Chotirattana (ธนวรรธน์ โชติรัตนะ)",
        school: "Assumption College Thonburi",
        province: "Bangkok",
        position: "SHOOTING_GUARD" as Position,
        age: 17,
        heightCm: 188,
        wingspanCm: 194,
        standingReachCm: 242,
        effPerGame: 21.8,
        ppg: 19.4,
        rpg: 4.8,
        apg: 3.6,
        efgPct: 53.8,
        tsPct: 57.2,
        astToRatio: 2.1,
        tcasCode: "STC-VERIFIED-TH-ACT-011",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        gpax: 3.60,
        isNationalPool: false,
      },
    ];
  }, []);

  // Filter Pipeline
  const filteredProspects = useMemo(() => {
    return allProspects.filter((p) => {
      // Tab filter
      if (activeTab === "SHORTLIST" && !shortlistedIds.includes(p.id)) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q) || p.fullName.toLowerCase().includes(q);
        const matchSchool = p.school.toLowerCase().includes(q);
        const matchTcas = p.tcasCode.toLowerCase().includes(q);
        if (!matchName && !matchSchool && !matchTcas) return false;
      }

      // Position
      if (selectedPosition !== "ALL" && p.position !== selectedPosition) {
        return false;
      }

      // Height
      const targetMinHeight = onlyOver190 ? 190 : minHeight;
      if (p.heightCm < targetMinHeight) {
        return false;
      }

      // FIBA Metrics
      if (p.effPerGame < minEff) return false;
      if (p.tsPct < minTsPct) return false;
      if (p.astToRatio < minAstTo) return false;

      return true;
    });
  }, [
    allProspects,
    activeTab,
    shortlistedIds,
    searchQuery,
    selectedPosition,
    minHeight,
    onlyOver190,
    minEff,
    minTsPct,
    minAstTo,
  ]);

  // Comparison toggle
  const toggleCompare = (id: string) => {
    if (comparedIds.includes(id)) {
      setComparedIds(comparedIds.filter((item) => item !== id));
    } else {
      if (comparedIds.length >= 3) {
        alert("สามารถเปรียบเทียบได้สูงสุดครั้งละ 3 คน");
        return;
      }
      setComparedIds([...comparedIds, id]);
      setIsCompareDrawerOpen(true);
    }
  };

  const toggleShortlist = (id: string) => {
    if (shortlistedIds.includes(id)) {
      setShortlistedIds(shortlistedIds.filter((item) => item !== id));
    } else {
      setShortlistedIds([...shortlistedIds, id]);
    }
  };

  const comparedProspects = allProspects.filter((p) => comparedIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Banner (Courtside Editorial Combine Hub) */}
        <section className="bg-[#0B1C30] text-white py-10 border-b border-[#1E3A5F]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#AF101A]/20 border border-[#AF101A]/40 text-red-200 text-xs font-mono font-semibold tracking-wider uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#AF101A]" />
                  <span>SCOUTING COMBINE &amp; RECRUITING INTELLIGENCE</span>
                </div>
                <h1 className="font-headline-xl text-3xl sm:text-4xl uppercase tracking-wide font-normal text-white">
                  ศูนย์ค้นหาดาวรุ่ง <span className="text-[#AF101A]">และข้อมูลสรีระ FIBA</span>
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  สำหรับผู้ฝึกสอนมหาวิทยาลัย โควตากีฬา TCAS และแมวมองสโมสรอาชีพ ข้อมูลสรีระ Wingspan, Standing Reach พร้อมสถิติขั้นสูง True Shooting และบันทึกผลการแข่งขันที่ตรวจสอบคลิปได้จริง
                </p>
              </div>

              {/* Counters & Shortlist / Compare Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-[#142338] border border-[#223956] rounded-lg px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-[#AF101A] flex items-center justify-center text-white">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      SHORTLIST TARGETS
                    </div>
                    <div className="text-lg font-headline-lg text-white font-normal tabular-nums">
                      {shortlistedIds.length} คนในเป้าหมาย
                    </div>
                  </div>
                </div>

                {comparedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCompareDrawerOpen(true)}
                    className="px-4 py-3 rounded-sm bg-[#AF101A] hover:bg-[#8E0D15] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <Columns2 className="w-4 h-4" />
                    <span>เปรียบเทียบสถิติ ({comparedIds.length}) คน</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar & Combine Station */}
        <section className="bg-white border-b border-[#DFE2EB] sticky top-14 z-30 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
            {/* Row 1: Search, Position Filter, View Mode */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <label htmlFor="scout-search-input" className="sr-only">
                  ค้นหาชื่อ, โรงเรียน, หรือรหัส TCAS
                </label>
                <Search className="w-4 h-4 text-[#505A69] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="scout-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อ, โรงเรียน, หรือรหัส TCAS..."
                  className="w-full bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm pl-9 pr-8 py-1.5 text-xs text-[#0B1C30] placeholder:text-[#505A69] focus:outline-none focus:border-[#AF101A] focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#505A69] hover:text-[#0B1C30]"
                    aria-label="ล้างคำค้นหา"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Position Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
                {(["ALL", "POINT_GUARD", "SHOOTING_GUARD", "SMALL_FORWARD", "POWER_FORWARD", "CENTER"] as const).map(
                  (pos) => {
                    const shortLabel =
                      pos === "ALL"
                        ? "ALL"
                        : pos === "POINT_GUARD"
                        ? "PG"
                        : pos === "SHOOTING_GUARD"
                        ? "SG"
                        : pos === "SMALL_FORWARD"
                        ? "SF"
                        : pos === "POWER_FORWARD"
                        ? "PF"
                        : "C";
                    const isSelected = selectedPosition === pos;

                    return (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setSelectedPosition(pos)}
                        aria-pressed={isSelected}
                        className={`px-3 py-1.5 rounded-sm uppercase font-bold transition whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? "bg-[#0B1C30] text-white"
                            : "bg-[#F8F9FF] border border-[#DFE2EB] text-[#505A69] hover:text-[#0B1C30] hover:bg-[#EEF1F8]"
                        }`}
                      >
                        {shortLabel}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Tab Selector: All vs Shortlist */}
              <div className="flex items-center gap-1 bg-[#F8F9FF] p-1 rounded-sm border border-[#DFE2EB] font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("ALL_PROSPECTS")}
                  aria-pressed={activeTab === "ALL_PROSPECTS"}
                  className={`px-3 py-1 rounded-sm font-semibold transition cursor-pointer ${
                    activeTab === "ALL_PROSPECTS"
                      ? "bg-white text-[#0B1C30] shadow-xs"
                      : "text-[#505A69] hover:text-[#0B1C30]"
                  }`}
                >
                  ทั้งหมด ({allProspects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("SHORTLIST")}
                  aria-pressed={activeTab === "SHORTLIST"}
                  className={`px-3 py-1 rounded-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "SHORTLIST"
                      ? "bg-[#AF101A] text-white shadow-xs"
                      : "text-[#505A69] hover:text-[#0B1C30]"
                  }`}
                >
                  <Bookmark className="w-3 h-3" />
                  <span>บันทึกไว้ ({shortlistedIds.length})</span>
                </button>
              </div>
            </div>

            {/* Row 2: Deep Metric Sliders & Combine Filters */}
            <div className="pt-2.5 border-t border-[#DFE2EB] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-4 flex-wrap">
                {/* 190+ cm Quick Switch */}
                <button
                  type="button"
                  onClick={() => setOnlyOver190(!onlyOver190)}
                  aria-pressed={onlyOver190}
                  className={`px-2.5 py-1 rounded-sm border font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    onlyOver190
                      ? "bg-[#AF101A]/10 border-[#AF101A] text-[#AF101A]"
                      : "bg-white border-[#DFE2EB] text-[#505A69] hover:border-[#7F8A9E]"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>สรีระ &ge; 190 cm</span>
                </button>

                {/* Min Height Slider */}
                {!onlyOver190 && (
                  <div className="flex items-center gap-2">
                    <label htmlFor="min-height-range" className="text-[#505A69] uppercase">
                      ส่วนสูงขั้นต่ำ:
                    </label>
                    <input
                      id="min-height-range"
                      type="range"
                      min={175}
                      max={205}
                      value={minHeight}
                      onChange={(e) => setMinHeight(Number(e.target.value))}
                      aria-label="ส่วนสูงขั้นต่ำหน่วยเซนติเมตร"
                      className="accent-[#AF101A] cursor-pointer w-24"
                    />
                    <span className="font-bold text-[#0B1C30] tabular-nums w-12">{minHeight} cm</span>
                  </div>
                )}

                {/* Min True Shooting */}
                <div className="flex items-center gap-2">
                  <label htmlFor="min-ts-select" className="text-[#505A69] uppercase">
                    TS% &ge;
                  </label>
                  <select
                    id="min-ts-select"
                    value={minTsPct}
                    onChange={(e) => setMinTsPct(Number(e.target.value))}
                    className="bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm px-2 py-0.5 text-[#0B1C30] font-semibold focus:outline-none focus:border-[#AF101A]"
                  >
                    <option value={0}>ทั้งหมด</option>
                    <option value={50}>50%+</option>
                    <option value={55}>55%+</option>
                    <option value={60}>60%+ (Elite)</option>
                  </select>
                </div>

                {/* Min Assist/TO */}
                <div className="flex items-center gap-2">
                  <label htmlFor="min-ast-select" className="text-[#505A69] uppercase">
                    AST/TO &ge;
                  </label>
                  <select
                    id="min-ast-select"
                    value={minAstTo}
                    onChange={(e) => setMinAstTo(Number(e.target.value))}
                    className="bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm px-2 py-0.5 text-[#0B1C30] font-semibold focus:outline-none focus:border-[#AF101A]"
                  >
                    <option value={0}>ทั้งหมด</option>
                    <option value={1.5}>1.5+</option>
                    <option value={2.0}>2.0+ (Floor General)</option>
                  </select>
                </div>
              </div>

              <div className="text-[#505A69]">
                พบ <span className="font-bold text-[#0B1C30] tabular-nums">{filteredProspects.length}</span> คนตรงตามเกณฑ์
              </div>
            </div>
          </div>
        </section>

        {/* Dignified Recruiter Access Notice for Non-Coach Users */}
        {!hasScoutAccess && (
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-white border border-[#DFE2EB] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-sm bg-[#AF101A]/10 border border-[#AF101A]/30 text-[#AF101A] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-[#AF101A]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0B1C30]">
                      พื้นที่สำหรับผู้ฝึกสอน (Coaches), แมวมองสถาบัน และฝ่ายสรรหาบุคลากรกีฬา
                    </h3>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm bg-[#F8F9FF] border border-[#DFE2EB] text-[#505A69] uppercase">
                      ROLE: {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#505A69] mt-1 leading-relaxed">
                    ระบบแสดงตัวอย่างรายชื่อดาวรุ่งที่ผ่านการรับรองเพื่อการศึกษา หากท่านเป็นผู้ฝึกสอน หรือต้องการทดลองสิทธิ์แมวมองเพื่อเข้าถึงฐานข้อมูลฉบับเต็ม บันทึกผลการเรียน GPAX และคลิปวิเคราะห์ กรุณาเข้าสู่ระบบด้วยบัญชีโค้ช
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => loginAs("COACH")}
                  className="bg-[#0B1C30] hover:bg-[#142338] text-white font-mono text-xs font-semibold px-3 py-2 rounded-sm transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>สลับเป็นบัญชีโค้ช</span>
                </button>
                <Link
                  href="/auth/register"
                  className="bg-white border border-[#DFE2EB] hover:bg-[#F8F9FF] text-[#0B1C30] font-mono text-xs font-semibold px-3 py-2 rounded-sm transition"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Prospect Grid List */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {filteredProspects.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#DFE2EB] p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-sm bg-[#F8F9FF] border border-[#DFE2EB] text-[#505A69] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-headline-lg uppercase text-xl font-normal text-[#0B1C30]">
                ไม่พบข้อมูลนักกีฬาตามเกณฑ์ที่เลือก
              </h3>
              <p className="text-xs text-[#505A69] font-mono">
                ลองปรับลดเงื่อนไขส่วนสูง หรือค่าตัวชี้วัดประสิทธิภาพเพื่อขยายผลการค้นหา
              </p>
              <button
                type="button"
                onClick={() => {
                  setMinHeight(175);
                  setOnlyOver190(false);
                  setMinTsPct(0);
                  setMinAstTo(0);
                  setSelectedPosition("ALL");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-sm bg-[#0B1C30] hover:bg-[#142338] text-white font-mono text-xs font-semibold uppercase transition cursor-pointer"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(hasScoutAccess ? filteredProspects : filteredProspects.slice(0, 2)).map((prospect) => {
                const isShortlisted = shortlistedIds.includes(prospect.id);
                const isCompared = comparedIds.includes(prospect.id);

                return (
                  <article
                    key={prospect.id}
                    className="bg-white border border-[#DFE2EB] rounded-lg overflow-hidden hover:border-[#7F8A9E] transition-all flex flex-col justify-between shadow-xs"
                  >
                    {/* Card Content & Bio */}
                    <div className="p-5 space-y-4">
                      {/* Top Badges & Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-[#AF101A] text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            {prospect.position.replace("_", " ")}
                          </span>
                          {prospect.isNationalPool && (
                            <span className="bg-[#0B1C30] text-white font-mono font-semibold text-[10px] px-2 py-0.5 rounded-sm uppercase">
                              NATIONAL POOL
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleShortlist(prospect.id)}
                          aria-label={
                            isShortlisted
                              ? `นำ ${prospect.name} ออกจาก Shortlist`
                              : `บันทึก ${prospect.name} ใน Shortlist`
                          }
                          aria-pressed={isShortlisted}
                          className={`p-1.5 rounded-sm border transition cursor-pointer ${
                            isShortlisted
                              ? "bg-[#AF101A]/10 border-[#AF101A] text-[#AF101A]"
                              : "bg-[#F8F9FF] border-[#DFE2EB] text-[#505A69] hover:text-[#0B1C30]"
                          }`}
                        >
                          {isShortlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Athlete Identity */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={prospect.avatarUrl}
                          alt={prospect.name}
                          className="w-14 h-14 rounded-md object-cover border border-[#DFE2EB] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/athlete/${prospect.id}`}
                            className="font-bold text-[#0B1C30] text-base hover:text-[#AF101A] transition-colors flex items-center gap-1.5 truncate"
                          >
                            <span className="truncate">{prospect.name}</span>
                            <ShieldCheck className="w-4 h-4 text-[#AF101A] shrink-0" title="ยืนยันผลงานโดย StatCourtTH" />
                          </Link>
                          <div className="text-xs text-[#505A69] font-medium truncate mt-0.5">
                            {prospect.school} • {prospect.province}
                          </div>
                          <div className="text-[10px] text-[#505A69] font-mono mt-0.5">
                            TCAS: <span className="font-semibold text-[#0B1C30]">{prospect.tcasCode}</span>
                          </div>
                        </div>
                      </div>

                      {/* Biometric Measurements Bar */}
                      <div className="bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm p-2.5 font-mono">
                        <div className="grid grid-cols-3 divide-x divide-[#DFE2EB] text-center">
                          <div>
                            <span className="text-[10px] text-[#505A69] uppercase font-semibold block">ส่วนสูง</span>
                            <span className="font-bold text-sm text-[#0B1C30] tabular-nums">{prospect.heightCm} cm</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#505A69] uppercase font-semibold block">ช่วงแขน</span>
                            <span className="font-bold text-sm text-[#0B1C30] tabular-nums">{prospect.wingspanCm} cm</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#505A69] uppercase font-semibold block">ยืนเอื้อม</span>
                            <span className="font-bold text-sm text-[#0B1C30] tabular-nums">{prospect.standingReachCm} cm</span>
                          </div>
                        </div>
                      </div>

                      {/* FIBA Analytics Metrics Grid */}
                      <div className="grid grid-cols-4 gap-2 font-mono text-center">
                        <div className="bg-[#F8F9FF] p-2 rounded-sm border border-[#DFE2EB]">
                          <span className="text-[10px] text-[#505A69] uppercase font-semibold block">FIBA EFF</span>
                          <span className="font-bold text-sm text-[#AF101A] tabular-nums">
                            {prospect.effPerGame.toFixed(1)}
                          </span>
                        </div>
                        <div className="bg-[#F8F9FF] p-2 rounded-sm border border-[#DFE2EB]">
                          <span className="text-[10px] text-[#505A69] uppercase font-semibold block">PPG</span>
                          <span className="font-bold text-sm text-[#0B1C30] tabular-nums">
                            {prospect.ppg.toFixed(1)}
                          </span>
                        </div>
                        <div className="bg-[#F8F9FF] p-2 rounded-sm border border-[#DFE2EB]">
                          <span className="text-[10px] text-[#505A69] uppercase font-semibold block">TS%</span>
                          <span className="font-bold text-sm text-[#0B1C30] tabular-nums">
                            {prospect.tsPct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="bg-[#F8F9FF] p-2 rounded-sm border border-[#DFE2EB]">
                          <span className="text-[10px] text-[#505A69] uppercase font-semibold block">AST/TO</span>
                          <span className="font-bold text-sm text-[#0B1C30] tabular-nums">
                            {prospect.astToRatio.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="px-5 py-3 bg-[#F8F9FF] border-t border-[#DFE2EB] flex items-center justify-between text-xs font-mono">
                      <label className="flex items-center gap-2 cursor-pointer text-[#505A69] hover:text-[#0B1C30] select-none">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompare(prospect.id)}
                          aria-label={`เลือกเปรียบเทียบสถิติของ ${prospect.name}`}
                          className="accent-[#AF101A] w-3.5 h-3.5 rounded-sm"
                        />
                        <span>เทียบสถิติ</span>
                      </label>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedAthleteForReel(prospect)}
                          className="p-1.5 rounded-sm border border-transparent hover:border-[#DFE2EB] hover:bg-white text-[#505A69] hover:text-[#AF101A] transition cursor-pointer"
                          aria-label={`สร้างคลิปไฮไลต์ของ ${prospect.name}`}
                          title="สร้าง Highlight Reel 1 นาที"
                        >
                          <Film className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAthleteForAcademic(prospect)}
                          className="p-1.5 rounded-sm border border-transparent hover:border-[#DFE2EB] hover:bg-white text-[#505A69] hover:text-[#0B1C30] transition cursor-pointer"
                          aria-label={`ดูประวัติการศึกษาและเกรด GPAX ของ ${prospect.name}`}
                          title="ดูประวัติผลการเรียน GPAX"
                        >
                          <GraduationCap className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/athlete/${prospect.id}?tab=TCAS`}
                          className="text-[#AF101A] hover:underline font-bold flex items-center pl-1"
                        >
                          <span>พอร์ต TCAS</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Locked Prospect Card for Non-Coach / Public */}
              {!hasScoutAccess && filteredProspects.length > 2 && (
                <div className="bg-white border-2 border-dashed border-[#DFE2EB] rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[340px]">
                  <div className="w-12 h-12 rounded-sm bg-[#F8F9FF] border border-[#DFE2EB] text-[#505A69] flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#0B1C30]" />
                  </div>
                  <h4 className="font-bold text-[#0B1C30] text-base">
                    ซ่อนดาวรุ่งอีก {filteredProspects.length - 2} คนในฐานข้อมูล
                  </h4>
                  <p className="text-xs text-[#505A69] max-w-xs leading-relaxed">
                    การเข้าถึงดาวรุ่งระดับลึก คัดกรองสรีระ 190+ ตรวจสอบ GPAX ฉบับเต็ม และดูข้อมูลการติดต่อโรงเรียน เปิดให้สำหรับผู้ฝึกสอน โค้ชมหาวิทยาลัย และสโมสร
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={() => loginAs("COACH")}
                      className="w-full bg-[#0B1C30] hover:bg-[#142338] text-white font-mono text-xs font-semibold py-2 px-3 rounded-sm transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>สลับเป็นบัญชีโค้ช</span>
                    </button>
                    <Link
                      href="/auth/register"
                      className="w-full bg-white border border-[#DFE2EB] hover:bg-[#F8F9FF] text-[#0B1C30] font-mono text-xs font-semibold py-2 px-3 rounded-sm transition text-center"
                    >
                      สมัครสมาชิก
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Head-to-Head Comparison Modal */}
        {isCompareDrawerOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1C30]/70 backdrop-blur-xs p-4 overflow-y-auto"
          >
            <div className="bg-white border border-[#DFE2EB] w-full max-w-4xl rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-[#0B1C30] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-sm bg-[#AF101A] flex items-center justify-center text-white">
                    <Columns2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 id="compare-modal-title" className="font-headline-lg uppercase text-lg sm:text-xl tracking-wide font-normal">
                      Head-to-Head Prospect Comparison
                    </h3>
                    <p className="text-xs text-slate-300 font-mono">
                      เปรียบเทียบสรีระ สมรรถภาพ และประสิทธิภาพขั้นสูง FIBA แบบตัวต่อตัว
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCompareDrawerOpen(false)}
                  aria-label="ปิดหน้าต่างเปรียบเทียบ"
                  className="text-slate-400 hover:text-white p-1 rounded-sm hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-[#0B1C30]">
                {comparedProspects.length < 2 ? (
                  <div className="text-center py-8 space-y-2 text-[#505A69] font-mono text-xs">
                    <p>กรุณาเลือกนักกีฬาอย่างน้อย 2 คนเพื่อเปรียบเทียบสถิติเคียงข้างกัน</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Selected Athletes Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {comparedProspects.map((p) => (
                        <div
                          key={p.id}
                          className="bg-[#F8F9FF] p-4 rounded-lg border border-[#DFE2EB] text-center space-y-2 relative"
                        >
                          <button
                            type="button"
                            onClick={() => toggleCompare(p.id)}
                            aria-label={`นำ ${p.name} ออกจากการเปรียบเทียบ`}
                            className="absolute top-2 right-2 text-[#505A69] hover:text-[#AF101A] transition cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <img
                            src={p.avatarUrl}
                            alt={p.name}
                            className="w-16 h-16 rounded-md mx-auto object-cover border border-[#DFE2EB]"
                          />
                          <div>
                            <div className="font-bold text-[#0B1C30] text-sm">{p.name}</div>
                            <div className="text-xs text-[#505A69] font-medium">{p.school}</div>
                            <div className="text-[11px] text-[#AF101A] font-mono font-bold mt-1">
                              {p.position.replace("_", " ")} • {p.heightCm} cm
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comparison Metrics Table */}
                    <div className="border border-[#DFE2EB] rounded-lg overflow-hidden bg-white text-xs font-mono">
                      <table className="w-full text-left">
                        <thead className="bg-[#F8F9FF] border-b border-[#DFE2EB] text-[#505A69] text-[11px]">
                          <tr>
                            <th className="py-3 px-4 font-semibold uppercase">ดัชนีชี้วัด (METRIC)</th>
                            {comparedProspects.map((p) => (
                              <th key={p.id} className="py-3 px-4 text-center text-[#0B1C30] font-bold">
                                {p.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DFE2EB]">
                          <tr>
                            <td className="py-3 px-4 text-[#505A69]">ส่วนสูง (Height)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                                {p.heightCm} cm
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-[#505A69]">ช่วงแขน (Wingspan)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                                {p.wingspanCm} cm
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-[#505A69]">ยืนเอื้อม (Standing Reach)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                                {p.standingReachCm} cm
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-[#AF101A]/5">
                            <td className="py-3 px-4 text-[#AF101A] font-bold">FIBA EFF / Game</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-[#AF101A] text-sm tabular-nums">
                                {p.effPerGame.toFixed(1)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-[#505A69]">แต้มเฉลี่ย (PPG)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                                {p.ppg.toFixed(1)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-[#505A69]">รีบาวด์เฉลี่ย (RPG)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                                {p.rpg.toFixed(1)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-[#505A69]">แอสซิสต์เฉลี่ย (APG)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                                {p.apg.toFixed(1)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-[#505A69]">True Shooting (TS%)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                                {p.tsPct.toFixed(1)}%
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-[#505A69]">Effective FG (eFG%)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                                {p.efgPct.toFixed(1)}%
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-[#505A69]">Assist-to-Turnover (AST/TO)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                                {p.astToRatio.toFixed(1)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-[#505A69]">ผลการเรียนเฉลี่ย (GPAX)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                                {p.gpax.toFixed(2)}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-[#F8F9FF] border-t border-[#DFE2EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                <span className="text-[#505A69] text-center sm:text-left">
                  สถิติอ้างอิงจากการแข่งขันที่ผ่านการรับรองโดยสมาคมและโต๊ะเทคนิค StatCourtTH
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert("ดาวน์โหลดตารางเปรียบเทียบนักกีฬา (PDF Report) เรียบร้อยแล้ว");
                    }}
                    className="px-4 py-2 rounded-sm bg-[#0B1C30] hover:bg-[#142338] text-white font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ส่งออกรายงาน PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCompareDrawerOpen(false)}
                    className="px-4 py-2 rounded-sm bg-white border border-[#DFE2EB] text-[#505A69] hover:text-[#0B1C30] font-semibold cursor-pointer"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Highlight Reel Modal */}
        {selectedAthleteForReel && (
          <HighlightReelGeneratorModal
            isOpen={!!selectedAthleteForReel}
            onClose={() => setSelectedAthleteForReel(null)}
            athleteName={selectedAthleteForReel.name}
            schoolName={selectedAthleteForReel.school}
            tcasCode={selectedAthleteForReel.tcasCode}
          />
        )}

        {/* Academic Tracker Modal */}
        {selectedAthleteForAcademic && (
          <AcademicTrackerModal
            isOpen={!!selectedAthleteForAcademic}
            onClose={() => setSelectedAthleteForAcademic(null)}
            athleteId={selectedAthleteForAcademic.id}
            athleteName={selectedAthleteForAcademic.name}
            schoolName={selectedAthleteForAcademic.school}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
