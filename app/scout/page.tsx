"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  SlidersHorizontal,
  ShieldCheck,
  Trophy,
  ArrowUpDown,
  Bookmark,
  BookmarkCheck,
  Columns2,
  X,
  ExternalLink,
  Film,
  GraduationCap,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Download,
  Share2,
  Lock,
  UserPlus,
  LogIn,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HighlightReelGeneratorModal from "@/components/scout/HighlightReelGeneratorModal";
import AcademicTrackerModal from "@/components/athlete/AcademicTrackerModal";
import { Position } from "@/lib/types";
import { mockAthleteProfiles, mockLeaderboardAthletes } from "@/lib/db/seed-data";
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
  const [selectedAge, setSelectedAge] = useState<"ALL" | "U16" | "U18" | "OPEN">("ALL");
  const [selectedRegion, setSelectedRegion] = useState<"ALL" | "BANGKOK" | "CENTRAL" | "NORTH" | "NORTHEAST" | "SOUTH">("ALL");
  
  // Advanced FIBA Metrics Filters
  const [minEff, setMinEff] = useState<number>(0);
  const [minTsPct, setMinTsPct] = useState<number>(0);
  const [minAstTo, setMinAstTo] = useState<number>(0);
  const [timeframe, setTimeframe] = useState<"1M" | "6M" | "SEASON" | "CAREER">("SEASON");

  // Interaction States
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(["ath-1"]);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL_PROSPECTS" | "SHORTLIST">("ALL_PROSPECTS");
  const { currentUser, loginAs, toggleSubscriptionTier } = useAuthStore();
  const hasScoutAccess = canAccessScoutHub(currentUser);

  // Modals
  const [selectedAthleteForReel, setSelectedAthleteForReel] = useState<ScoutProspect | null>(null);
  const [selectedAthleteForAcademic, setSelectedAthleteForAcademic] = useState<ScoutProspect | null>(null);

  // Raw mock list combining seed profiles with stats
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
        school: "Debsirin School",
        province: "Bangkok",
        position: "POWER_FORWARD" as Position,
        age: 18,
        heightCm: 199,
        wingspanCm: 208,
        standingReachCm: 260,
        effPerGame: 21.6,
        ppg: 15.2,
        rpg: 10.6,
        apg: 1.8,
        efgPct: 56.0,
        tsPct: 58.0,
        astToRatio: 1.2,
        tcasCode: "STC-VERIFIED-TH-DS-034",
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

  // Non-member Access Gate (Strict RBAC protection)
  if (currentUser.role === "PUBLIC") {
    return (
      <div className="min-h-screen bg-[#080c14] text-white flex flex-col font-sans relative overflow-x-hidden">
        <Navbar />
        {/* Subtle Background Ambience */}
        <div className="fixed inset-0 court-grid-pattern pointer-events-none opacity-40" />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

        <main className="flex-1 flex items-center justify-center p-4 py-16 relative z-10">
          <div className="w-full max-w-lg bg-[#101622] border border-white/10 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(245,158,11,0.2)]">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#2b1014] border border-red-500/30 text-red-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>RESTRICTED SCOUT INTELLIGENCE HUB</span>
              </div>
              <h1 className="font-headline-lg text-xl sm:text-2xl uppercase tracking-wider text-white">
                พื้นที่สงวนสิทธิ์สำหรับสมาชิกและผู้ฝึกสอน
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-md mx-auto">
                ระบบ Scout Engine และคลังข้อมูลนักกีฬาเยาวชน TCAS สงวนสิทธิ์สำหรับสมาชิก StatCourtTH, ผู้ฝึกสอน (Coaches) และผู้ใช้ระดับ PRO เท่านั้น กรุณาสมัครสมาชิกทั่วไป (ฟรี) หรือเข้าสู่ระบบเพื่อใช้งาน
              </p>
            </div>

            <div className="space-y-2.5 pt-2 font-mono text-xs">
              <Link
                href="/auth/register"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-[#AF101A] hover:from-red-500 hover:to-red-600 text-white font-bold uppercase transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/50"
              >
                <UserPlus className="w-4 h-4" />
                <span>สมัครสมาชิกทั่วไปฟรี (Free Member Pass)</span>
              </Link>
              <button
                type="button"
                onClick={() => loginAs("COACH")}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold uppercase transition border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ทดสอบระบบในบทบาทโค้ช (Demo Coach)</span>
              </button>
              <button
                type="button"
                onClick={() => loginAs("FAN")}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold uppercase transition border border-amber-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>จำลองเข้าสู่ระบบทันที (Demo As Fan)</span>
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 py-2 text-slate-400 hover:text-white transition text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับสู่หน้าแรก (Return to Home)</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Banner (Scout & Recruiter Portal) */}
        <section className="bg-[#0F172A] text-white py-12 border-b border-slate-800">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#AF101A]/30 border border-[#AF101A]/50 text-red-200 text-xs font-mono font-bold tracking-widest uppercase">
                  <ShieldCheck className="w-4 h-4 text-[#DC2626]" />
                  <span>COLLEGE SCOUTING &amp; TALENT RECRUITMENT ENGINE</span>
                </div>
                <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider font-normal text-white leading-tight">
                  ค้นหานักกีฬาช้างเผือก <br />
                  <span className="text-[#DC2626]">ด้วยตัวกรองสรีระระดับลึก</span> และสถิติ FIBA
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  สำหรับโค้ชมหาวิทยาลัย, ทีมงานคัดตัวโควตากีฬา TCAS และสโมสรอาชีพ 
                  กรองส่วนสูง Wingspan ค่า eFG% และ True Shooting จากการแข่งขันที่ตรวจสอบคลิปได้จริง
                </p>
              </div>

              {/* Quick Actions & Shortlist Counter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#AF101A] flex items-center justify-center text-white font-bold">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                      SHORTLISTED PROSPECTS
                    </div>
                    <div className="text-xl font-headline-lg text-white font-normal">
                      {shortlistedIds.length} นักกีฬาในเป้าหมาย
                    </div>
                  </div>
                </div>

                {comparedIds.length > 0 && (
                  <button
                    onClick={() => setIsCompareDrawerOpen(true)}
                    className="px-4 py-3 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-red-950/50"
                  >
                    <Columns2 className="w-4 h-4" />
                    <span>เปรียบเทียบ ({comparedIds.length}) คน</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar & Search Controls */}
        <section className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* Search Box */}
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded px-3 py-1.5 w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อ, โรงเรียน, หรือรหัส TCAS..."
                  className="bg-transparent border-0 p-0 text-xs font-medium text-slate-800 placeholder:text-slate-400 w-full outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Position Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
                {(["ALL", "POINT_GUARD", "SHOOTING_GUARD", "SMALL_FORWARD", "POWER_FORWARD", "CENTER"] as const).map(
                  (pos) => {
                    const label = pos === "ALL" ? "ALL POS" : pos.replace("_", " ");
                    const isSelected = selectedPosition === pos;

                    return (
                      <button
                        key={pos}
                        onClick={() => setSelectedPosition(pos)}
                        className={`px-3 py-1.5 rounded uppercase font-bold transition whitespace-nowrap ${
                          isSelected
                            ? "bg-[#AF101A] text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Tab Selector: All vs Shortlist */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded font-mono text-xs">
                <button
                  onClick={() => setActiveTab("ALL_PROSPECTS")}
                  className={`px-3 py-1 rounded font-bold transition ${
                    activeTab === "ALL_PROSPECTS"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  ทั้งหมด ({allProspects.length})
                </button>
                <button
                  onClick={() => setActiveTab("SHORTLIST")}
                  className={`px-3 py-1 rounded font-bold transition flex items-center gap-1 ${
                    activeTab === "SHORTLIST"
                      ? "bg-[#AF101A] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Bookmark className="w-3 h-3" />
                  <span>บันทึกไว้ ({shortlistedIds.length})</span>
                </button>
              </div>

            </div>

            {/* Deep Metric Sliders Drawer / Bar */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-4 flex-wrap">
                
                {/* 190+ cm Quick Switch */}
                <button
                  type="button"
                  onClick={() => setOnlyOver190(!onlyOver190)}
                  className={`px-3 py-1 rounded border font-bold flex items-center gap-1.5 transition ${
                    onlyOver190
                      ? "bg-red-50 border-[#DC2626] text-[#DC2626]"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>เฉพาะส่วนสูง &ge; 190 cm</span>
                </button>

                {/* Min Height Slider */}
                {!onlyOver190 && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 uppercase">ส่วนสูงขั้นต่ำ:</span>
                    <input
                      type="range"
                      min={170}
                      max={205}
                      value={minHeight}
                      onChange={(e) => setMinHeight(Number(e.target.value))}
                      className="accent-[#AF101A] cursor-pointer w-24"
                    />
                    <span className="font-bold text-slate-900 w-12">{minHeight} cm</span>
                  </div>
                )}

                {/* Min True Shooting */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 uppercase">TS% &ge;</span>
                  <select
                    value={minTsPct}
                    onChange={(e) => setMinTsPct(Number(e.target.value))}
                    className="bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-slate-800 font-bold"
                  >
                    <option value={0}>ทั้งหมด</option>
                    <option value={50}>50%+</option>
                    <option value={55}>55%+</option>
                    <option value={60}>60%+ (Elite)</option>
                  </select>
                </div>

                {/* Min Assist/TO */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 uppercase">AST/TO &ge;</span>
                  <select
                    value={minAstTo}
                    onChange={(e) => setMinAstTo(Number(e.target.value))}
                    className="bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-slate-800 font-bold"
                  >
                    <option value={0}>ทั้งหมด</option>
                    <option value={1.5}>1.5+</option>
                    <option value={2.0}>2.0+ (Floor General)</option>
                  </select>
                </div>

                {/* Timeframe */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">ช่วงเวลา:</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                    ซีซันปัจจุบัน (2026)
                  </span>
                </div>
              </div>

              <div className="text-slate-500">
                พบ <span className="font-bold text-slate-900">{filteredProspects.length}</span> คนตรงตามเกณฑ์
              </div>
            </div>
          </div>
        </section>

        {/* Role Access Notice for Public / Non-Coach Users */}
        {!hasScoutAccess && (
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-amber-950">
                      สิทธิ์การใช้งาน Scout Hub สำหรับ ผู้ฝึกสอน (Coaches), สโมสร และสมาชิก PRO
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 uppercase">
                      ROLE: {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1">
                    ในฐานะ {currentUser.role === "ATHLETE" ? "นักกีฬา" : "ผู้เข้าชมทั่วไป"} ท่านสามารถดูตัวอย่างรายชื่อดาวรุ่งได้ 2 คน หากต้องการใช้ตัวกรองสรีระ 190+, ดูค่า GPAX และข้อมูลติดต่อ กรุณาใช้งานในบทบาทโค้ชหรือสมาชิก PRO
                  </p>
                </div>
              </div>

              {/* Quick Switch Buttons for Evaluator / User */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => loginAs("COACH")}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-bold px-3 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>สลับเป็นโค้ช (Demo Coach)</span>
                </button>
                <button
                  type="button"
                  onClick={toggleSubscriptionTier}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-xs font-bold px-3 py-2 rounded-lg transition shadow-xs cursor-pointer"
                >
                  <span>อัปเกรดเป็น PRO ⭐</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prospect Grid List */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {filteredProspects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-headline-lg uppercase text-xl font-normal text-slate-800">
                ไม่พบข้อมูลนักกีฬาตามเกณฑ์ที่เลือก
              </h3>
              <p className="text-xs text-slate-500 font-mono">
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
                className="px-4 py-2 rounded bg-slate-900 text-white font-mono text-xs font-bold uppercase transition cursor-pointer"
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
                  <div
                    key={prospect.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition flex flex-col justify-between"
                  >
                    {/* Card Header & Bio */}
                    <div className="p-5 space-y-4">
                      
                      {/* Top Badges & Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-[#AF101A] text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                            {prospect.position.replace("_", " ")}
                          </span>
                          {prospect.isNationalPool && (
                            <span className="bg-slate-900 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                              NATIONAL POOL
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleShortlist(prospect.id)}
                            className={`p-1.5 rounded-lg border transition ${
                              isShortlisted
                                ? "bg-red-50 border-red-300 text-[#DC2626]"
                                : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700"
                            }`}
                            title={isShortlisted ? "ลบออกจากลิสต์" : "บันทึกในลิสต์สเกาต์"}
                          >
                            {isShortlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Athlete Identity */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={prospect.avatarUrl}
                          alt={prospect.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/athlete/${prospect.id}`}
                            className="font-bold text-slate-900 text-base hover:text-[#DC2626] transition flex items-center gap-1.5 truncate"
                          >
                            <span>{prospect.name}</span>
                            <ShieldCheck className="w-4 h-4 text-[#AF101A] shrink-0" />
                          </Link>
                          <div className="text-xs text-slate-500 font-mono truncate">
                            {prospect.school} • {prospect.province}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            TCAS CODE: {prospect.tcasCode}
                          </div>
                        </div>
                      </div>

                      {/* Biometric Measurements Bar */}
                      <div className="grid grid-cols-3 gap-2 bg-[#F8F9FC] p-2.5 rounded-xl border border-slate-100 font-mono text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block">ส่วนสูง</span>
                          <span className="font-bold text-xs text-slate-900">{prospect.heightCm} cm</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block">ช่วงแขน</span>
                          <span className="font-bold text-xs text-slate-900">{prospect.wingspanCm} cm</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block">ยืนเอื้อม</span>
                          <span className="font-bold text-xs text-slate-900">{prospect.standingReachCm} cm</span>
                        </div>
                      </div>

                      {/* FIBA Analytics Metrics Grid */}
                      <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-center">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase block">FIBA EFF</span>
                          <span className="font-bold text-xs text-[#DC2626]">{prospect.effPerGame.toFixed(1)}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase block">PPG</span>
                          <span className="font-bold text-xs text-slate-900">{prospect.ppg.toFixed(1)}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase block">TS%</span>
                          <span className="font-bold text-xs text-slate-900">{prospect.tsPct.toFixed(1)}%</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase block">AST/TO</span>
                          <span className="font-bold text-xs text-slate-900">{prospect.astToRatio.toFixed(1)}</span>
                        </div>
                      </div>

                    </div>

                    {/* Card Actions Footer */}
                    <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompare(prospect.id)}
                          className="accent-[#AF101A] w-3.5 h-3.5 rounded"
                        />
                        <span>เทียบสถิติ</span>
                      </label>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedAthleteForReel(prospect)}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
                          title="สร้าง Highlight Reel 1 นาที"
                        >
                          <Film className="w-4 h-4 text-red-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAthleteForAcademic(prospect)}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition"
                          title="ดูประวัติผลการเรียน GPAX"
                        >
                          <GraduationCap className="w-4 h-4 text-slate-700" />
                        </button>
                        <Link
                          href={`/athlete/${prospect.id}?tab=TCAS`}
                          className="text-[#DC2626] hover:underline font-bold flex items-center pl-1"
                        >
                          <span>พอร์ต TCAS</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Locked Prospect Card for Non-Coach / Public */}
              {!hasScoutAccess && filteredProspects.length > 2 && (
                <div className="bg-slate-100/70 border-2 border-dashed border-slate-300 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[320px]">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shadow-xs">
                    <Lock className="w-6 h-6 text-slate-700" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">
                    ซ่อนนักกีฬาอีก {filteredProspects.length - 2} คน
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    ฟังก์ชันค้นหาดาวรุ่ง คัดกรองสรีระ 190+, ดูเกรดสะสม GPAX และข้อมูลติดต่อโรงเรียน เปิดให้เข้าถึงเฉพาะ โค้ช / แมวมอง และสมาชิก PRO
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={() => loginAs("COACH")}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-bold py-2 px-3 rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>สลับเป็นโค้ช (Demo)</span>
                    </button>
                    <button
                      type="button"
                      onClick={toggleSubscriptionTier}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold py-2 px-3 rounded-lg transition cursor-pointer"
                    >
                      <span>อัปเกรด PRO</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Head-to-Head Comparison Drawer / Modal */}
        {isCompareDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#0F172A] border border-slate-700 w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
              {/* Drawer Header */}
              <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#AF101A] flex items-center justify-center text-white">
                    <Columns2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-headline-lg uppercase text-lg sm:text-xl tracking-wide font-normal">
                      Head-to-Head Prospect Comparison
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      เปรียบเทียบสรีระ สมรรถภาพ และประสิทธิภาพขั้นสูง FIBA แบบตัวต่อตัว
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCompareDrawerOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
                {comparedProspects.length < 2 ? (
                  <div className="text-center py-8 space-y-2 text-slate-400 font-mono text-xs">
                    <p>กรุณาเลือกนักกีฬาอย่างน้อย 2 คนเพื่อเปรียบเทียบสถิติเคียงข้างกัน</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Header Columns for selected athletes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {comparedProspects.map((p) => (
                        <div key={p.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center space-y-2 relative">
                          <button
                            onClick={() => toggleCompare(p.id)}
                            className="absolute top-2 right-2 text-slate-500 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <img
                            src={p.avatarUrl}
                            alt={p.name}
                            className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-white text-sm">{p.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{p.school}</div>
                            <div className="text-[11px] text-red-400 font-mono font-bold mt-1">
                              {p.position.replace("_", " ")} • {p.heightCm} cm
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comparison Metrics Table */}
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 text-xs font-mono">
                      <table className="w-full text-left">
                        <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                          <tr>
                            <th className="py-3 px-4">ดัชนีชี้วัด (METRIC)</th>
                            {comparedProspects.map((p) => (
                              <th key={p.id} className="py-3 px-4 text-center text-white">
                                {p.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          <tr>
                            <td className="py-3 px-4 text-slate-400">ส่วนสูง (Height)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-white">
                                {p.heightCm} cm
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-slate-400">ช่วงแขน (Wingspan)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-white">
                                {p.wingspanCm} cm
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-slate-400">FIBA EFF / Game</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-red-400 text-sm">
                                {p.effPerGame.toFixed(1)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-slate-400">แต้มเฉลี่ย (PPG)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-white">
                                {p.ppg.toFixed(1)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-slate-400">True Shooting (TS%)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-white">
                                {p.tsPct.toFixed(1)}%
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-slate-400">Effective FG (eFG%)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-white">
                                {p.efgPct.toFixed(1)}%
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-slate-400">Assist-to-Turnover (AST/TO)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-white">
                                {p.astToRatio.toFixed(1)}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-slate-400">ผลการเรียนเฉลี่ย (GPAX)</td>
                            {comparedProspects.map((p) => (
                              <td key={p.id} className="py-3 px-4 text-center font-bold text-slate-200">
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

              {/* Drawer Footer */}
              <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  สถิติอ้างอิงจากการแข่งขันที่ผ่านการรับรองโดยสมาคมและโต๊ะเทคนิค StatCourtTH
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert("ดาวน์โหลดตารางเปรียบเทียบนักกีฬา (PDF Report) เรียบร้อยแล้ว");
                    }}
                    className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ส่งออกรายงาน PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCompareDrawerOpen(false)}
                    className="px-4 py-2 rounded bg-[#DC2626] text-white font-bold"
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
