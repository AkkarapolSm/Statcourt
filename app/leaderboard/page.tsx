"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Download,
  FileCheck,
  Clock,
  ExternalLink,
  Flame,
  LayoutGrid,
  List,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Printer,
  X,
  BadgeCheck,
  Filter,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PricingModal from "@/components/premium/PricingModal";
import { mockLeaderboardAthletes } from "@/lib/db/seed-data";
import { Position, AthleteSeasonStats } from "@/lib/types";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { canAccessFullLeaderboard } from "@/lib/permissions";

type SortField =
  | "effPerGame"
  | "ppg"
  | "rpg"
  | "apg"
  | "efgPct"
  | "tsPct"
  | "astToRatio"
  | "heightCm"
  | "weightKg";

export default function LeaderboardPage() {
  const [positionFilter, setPositionFilter] = useState<Position | "ALL">("ALL");
  const [ageFilter, setAgeFilter] = useState<string>("ALL");
  const [provinceFilter, setProvinceFilter] = useState<string>("ALL");
  const [activityFilter, setActivityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("effPerGame");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"TABLE" | "CARDS">("TABLE");
  const [athletesData, setAthletesData] = useState<AthleteSeasonStats[]>(mockLeaderboardAthletes);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isTcasAuditModalOpen, setIsTcasAuditModalOpen] = useState(false);
  const pageSize = 10;

  const { currentUser } = useAuthStore();
  const isPro = canAccessFullLeaderboard(currentUser.tier);

  // Fetch real database records if available
  useEffect(() => {
    async function loadAthletes() {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAthletesData(json.data);
          }
        }
      } catch (err) {
        console.warn("Using local fallback leaderboard data:", err);
      }
    }
    loadAthletes();
  }, []);

  // Province translation dictionary
  const provinceMap: Record<string, string> = {
    Bangkok: "กรุงเทพมหานคร",
    "Chiang Mai": "เชียงใหม่",
    Chonburi: "ชลบุรี",
    Nonthaburi: "นนทบุรี",
    Phuket: "ภูเก็ต",
    Songkhla: "สงขลา",
    "Nakhon Ratchasima": "นครราชสีมา",
  };

  const getProvinceThai = (prov: string) => provinceMap[prov] || prov;

  // Dynamic Provinces with count
  const availableProvinces = useMemo(() => {
    const counts: Record<string, number> = {};
    athletesData.forEach((ath) => {
      const p = ath.province || "Other";
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).map(([prov, count]) => ({
      value: prov,
      label: `${getProvinceThai(prov)} (${count})`,
    }));
  }, [athletesData]);

  // Position label dictionary
  const positionMap: Record<Position, { th: string; short: string }> = {
    POINT_GUARD: { th: "พอยต์การ์ด", short: "PG" },
    SHOOTING_GUARD: { th: "ชูตติ้งการ์ด", short: "SG" },
    SMALL_FORWARD: { th: "สมอลฟอร์เวิร์ด", short: "SF" },
    POWER_FORWARD: { th: "เพาเวอร์ฟอร์เวิร์ด", short: "PF" },
    CENTER: { th: "เซ็นเตอร์", short: "C" },
  };

  // Filter athletes
  const filteredAthletes = useMemo(() => {
    return athletesData.filter((ath) => {
      if (positionFilter !== "ALL" && ath.position !== positionFilter) {
        return false;
      }
      if (ageFilter !== "ALL" && ath.ageCategory !== ageFilter) {
        return false;
      }
      if (provinceFilter !== "ALL" && ath.province !== provinceFilter) {
        return false;
      }
      if (activityFilter === "ACTIVE_30D") {
        if ((ath.gamesPlayed || 0) < 4) return false;
      }
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = `${ath.firstName} ${ath.lastName}`.toLowerCase().includes(query);
        const matchesSchool = ath.schoolOrClub.toLowerCase().includes(query);
        if (!matchesName && !matchesSchool) return false;
      }
      return true;
    });
  }, [athletesData, positionFilter, ageFilter, provinceFilter, activityFilter, searchQuery]);

  // Sort athletes by selected metric
  const sortedAthletes = useMemo(() => {
    return [...filteredAthletes].sort((a, b) => {
      const numA = Number(a[sortField]) || 0;
      const numB = Number(b[sortField]) || 0;
      return sortOrder === "desc" ? numB - numA : numA - numB;
    });
  }, [filteredAthletes, sortField, sortOrder]);

  // Handle header click to toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // Top 3 Podium Highlights for current position filter
  const podiumTop3 = useMemo(() => {
    return sortedAthletes.slice(0, 3);
  }, [sortedAthletes]);

  // Pagination
  const totalPages = Math.ceil(sortedAthletes.length / pageSize) || 1;
  const paginatedAthletes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAthletes.slice(start, start + pageSize);
  }, [sortedAthletes, currentPage, pageSize]);

  // Export CSV handler
  const handleExportCsv = () => {
    const headers = [
      "Rank",
      "Name",
      "School",
      "Province",
      "Number",
      "Position",
      "Height_cm",
      "Weight_kg",
      "EFF_Per_Game",
      "PPG",
      "RPG",
      "APG",
      "eFG_Pct",
      "TS_Pct",
    ];
    const rows = sortedAthletes.map((ath, index) => [
      index + 1,
      `"${ath.firstName} ${ath.lastName}"`,
      `"${ath.schoolOrClub}"`,
      `"${getProvinceThai(ath.province)}"`,
      ath.jerseyNumber,
      ath.position,
      ath.heightCm,
      ath.weightKg,
      ath.effPerGame,
      ath.ppg,
      ath.rpg,
      ath.apg,
      ath.efgPct,
      ath.tsPct,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `StatCourtTH_Leaderboard_${positionFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const positionButtons: { id: "ALL" | Position; label: string }[] = [
    { id: "ALL", label: "อันดับรวมทั้งหมด (OVERALL TOP 100)" },
    { id: "POINT_GUARD", label: "พอยต์การ์ด (PG)" },
    { id: "SHOOTING_GUARD", label: "ชูตติ้งการ์ด (SG)" },
    { id: "SMALL_FORWARD", label: "สมอลฟอร์เวิร์ด (SF)" },
    { id: "POWER_FORWARD", label: "เพาเวอร์ฟอร์เวิร์ด (PF)" },
    { id: "CENTER", label: "เซ็นเตอร์ (C)" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans antialiased selection:bg-[#DC2626] selection:text-white">
      {/* Universal Navigation Bar */}
      <Navbar />

      {/* 1. Top Crimson Sub-Banner / FIBA Status */}
      <div className="bg-[#991B1B] text-white py-2 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
        <div className="flex items-center gap-2 flex-wrap font-mono">
          <span className="bg-white text-[#991B1B] font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-sans">
            FIBA OFFICIAL STANDARD
          </span>
          <span className="font-bold tracking-wide text-[11px]">
            ระบบจัดอันดับสถิติประสิทธิภาพนักกีฬา (FIBA LiveStats Efficiency)
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-red-100">
            <Clock className="w-3.5 h-3.5" />
            <span>อัปเดตสถิติล่าสุด: ทัวร์นาเมนต์ TOA 2026</span>
          </span>
          <span className="bg-slate-950 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-400/40 uppercase">
            BSAT ACCREDITED
          </span>
        </div>
      </div>

      {/* 2. Signature Hero Header Section (Consistent with /tournaments, /team, and /matches) */}
      <section className="bg-[#0F172A] text-white py-10 sm:py-12 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 court-grid-pattern opacity-15 pointer-events-none" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#AF101A]/20 border border-[#AF101A]/40 text-[#FFDAD6] text-xs font-mono font-bold tracking-widest uppercase">
                <Trophy className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>NATIONAL ATHLETE EFFICIENCY DIRECTORY</span>
              </div>
              <h1 className="font-headline-xl text-white uppercase tracking-wider text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                ทำเนียบอันดับผลงานนักกีฬาบาสเกตบอลไทย
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                ฐานข้อมูลสถิติมาตรฐาน FIBA และการจัดอันดับผลงานรายบุคคลเพื่อการเฟ้นหานักกีฬา (Scouting)
                เข้าสู่ระบบโควตากีฬา TCAS และทุนการศึกษาระดับอุดมศึกษาทั่วประเทศ
              </p>
            </div>

            {/* Action Buttons: Export CSV & TCAS Certificate */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center font-mono">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-lg transition shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>ส่งออก CSV (EXPORT)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTcasAuditModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs px-4 py-2.5 rounded-lg transition shadow-md cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>ใบรับรองสถิติ TCAS</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-grow max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* 3. Position Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar font-mono text-xs">
          {positionButtons.map((btn) => {
            const isActive = positionFilter === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  setPositionFilter(btn.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                  isActive
                    ? "bg-[#AF101A] text-white shadow-md shadow-red-950/20 border border-red-700"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* 4. Top 3 Podium Cards Showcase (Left: #2, Center: #1 Featured, Right: #3) */}
        {podiumTop3.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            
            {/* Podium #2 (Left - Silver) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center font-mono border border-slate-300 shrink-0">
                      2
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wider">
                      อันดับ 2 • PODIUM #2
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                    {positionMap[podiumTop3[1]?.position]?.th || podiumTop3[1]?.position}
                  </span>
                </div>

                <div className="flex items-start gap-3.5 mb-4">
                  <div className="relative shrink-0">
                    <img
                      src={podiumTop3[1]?.avatarUrl || "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80"}
                      alt={podiumTop3[1]?.firstName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm"
                    />
                    <span className="absolute -bottom-1.5 -right-1.5 bg-slate-900 text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded shadow">
                      #{podiumTop3[1]?.jerseyNumber}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded uppercase">
                        TCAS PORTFOLIO READY
                      </span>
                    </div>
                    <h3 className="font-headline-sm uppercase text-base text-slate-900 font-bold truncate mt-0.5">
                      {podiumTop3[1]?.firstName} {podiumTop3[1]?.lastName}
                    </h3>
                    <p className="text-xs text-slate-500 truncate font-sans">
                      {podiumTop3[1]?.schoolOrClub}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {getProvinceThai(podiumTop3[1]?.province)} • {podiumTop3[1]?.heightCm} ซม.
                    </p>
                  </div>
                </div>

                {/* 5 Stat Columns */}
                <div className="grid grid-cols-5 gap-1 py-3 bg-slate-50 rounded-xl px-2 mb-3 text-center border border-slate-100 font-mono">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">EFF/G</div>
                    <div className="text-xl text-[#AF101A] font-black leading-none mt-1">
                      {podiumTop3[1]?.effPerGame}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">แต้ม</div>
                    <div className="text-lg text-slate-900 font-bold leading-none mt-1">
                      {podiumTop3[1]?.ppg}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">รีบาวด์</div>
                    <div className="text-lg text-slate-900 font-bold leading-none mt-1">
                      {podiumTop3[1]?.rpg}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">แอสซิสต์</div>
                    <div className="text-lg text-slate-900 font-bold leading-none mt-1">
                      {podiumTop3[1]?.apg}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">eFG%</div>
                    <div className="text-lg text-slate-900 font-bold leading-none mt-1">
                      {podiumTop3[1]?.efgPct}%
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={`/athlete/${podiumTop3[1]?.athleteId}`}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 font-mono text-xs font-bold text-slate-800 transition flex items-center justify-center gap-1.5"
              >
                <span>ดูโปรไฟล์ &amp; แฟ้มสถิติ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Podium #1 (Center - Featured Red Glow Leader) */}
            <div className="bg-white border-2 border-[#AF101A] rounded-2xl p-5 shadow-lg shadow-red-950/5 flex flex-col justify-between relative hover:shadow-xl transition">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-red-100 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center font-mono shadow-xs shrink-0">
                      1
                    </div>
                    <span className="font-mono text-xs font-black text-[#AF101A] uppercase tracking-wider">
                      อันดับ 1 • TOP EFF LEADER
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#AF101A] uppercase bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                    {positionMap[podiumTop3[0]?.position]?.th || podiumTop3[0]?.position}
                  </span>
                </div>

                <div className="flex items-start gap-3.5 mb-4">
                  <div className="relative shrink-0">
                    <img
                      src={podiumTop3[0]?.avatarUrl || "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80"}
                      alt={podiumTop3[0]?.firstName}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-[#AF101A] shadow-md"
                    />
                    <span className="absolute -bottom-1.5 -right-1.5 bg-[#AF101A] text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded shadow">
                      #{podiumTop3[0]?.jerseyNumber}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded uppercase flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        <span>โควตาช้างเผือก TCAS</span>
                      </span>
                    </div>
                    <h3 className="font-headline-sm uppercase text-lg text-slate-900 font-black truncate mt-0.5">
                      {podiumTop3[0]?.firstName} {podiumTop3[0]?.lastName}
                    </h3>
                    <p className="text-xs text-slate-700 truncate font-sans font-medium">
                      {podiumTop3[0]?.schoolOrClub}
                    </p>
                    <p className="text-[11px] font-mono font-bold text-[#AF101A]">
                      {getProvinceThai(podiumTop3[0]?.province)} • {podiumTop3[0]?.heightCm} ซม. / {podiumTop3[0]?.weightKg} กก.
                    </p>
                  </div>
                </div>

                {/* 5 Stat Columns */}
                <div className="grid grid-cols-5 gap-1 py-3 bg-red-50/70 rounded-xl px-2 mb-3 text-center border border-red-200 font-mono">
                  <div>
                    <div className="text-[9px] text-[#AF101A] uppercase font-bold">FIBA EFF</div>
                    <div className="text-2xl text-[#AF101A] font-black leading-none mt-1">
                      {podiumTop3[0]?.effPerGame}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold">แต้ม</div>
                    <div className="text-xl text-slate-900 font-bold leading-none mt-1">
                      {podiumTop3[0]?.ppg}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold">รีบาวด์</div>
                    <div className="text-xl text-slate-900 font-bold leading-none mt-1">
                      {podiumTop3[0]?.rpg}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold">แอสซิสต์</div>
                    <div className="text-xl text-slate-900 font-bold leading-none mt-1">
                      {podiumTop3[0]?.apg}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold">eFG%</div>
                    <div className="text-xl text-slate-900 font-bold leading-none mt-1">
                      {podiumTop3[0]?.efgPct}%
                    </div>
                  </div>
                </div>

                {/* League Efficiency Percentile Bar */}
                <div className="space-y-1 mb-4 font-mono">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 uppercase font-bold">ระดับประสิทธิภาพเทียบทั้งลีก:</span>
                    <strong className="text-[#AF101A] font-black">TOP 99.8% PERCENTILE</strong>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div className="bg-[#AF101A] h-full rounded-full" style={{ width: "99.8%" }} />
                  </div>
                </div>
              </div>

              <Link
                href={`/athlete/${podiumTop3[0]?.athleteId}`}
                className="w-full text-center py-2.5 rounded-xl bg-[#AF101A] hover:bg-red-800 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-red-950/20"
              >
                <span>ดูโปรไฟล์ &amp; แฟ้มสถิติ TCAS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Podium #3 (Right - Bronze) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center font-mono border border-amber-300 shrink-0">
                      3
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-800 uppercase tracking-wider">
                      อันดับ 3 • PODIUM #3
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                    {positionMap[podiumTop3[2]?.position]?.th || podiumTop3[2]?.position}
                  </span>
                </div>

                <div className="flex items-start gap-3.5 mb-4">
                  <div className="relative shrink-0">
                    <img
                      src={podiumTop3[2]?.avatarUrl || "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80"}
                      alt={podiumTop3[2]?.firstName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm"
                    />
                    <span className="absolute -bottom-1.5 -right-1.5 bg-slate-900 text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded shadow">
                      #{podiumTop3[2]?.jerseyNumber}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded uppercase">
                        TCAS PORTFOLIO READY
                      </span>
                    </div>
                    <h3 className="font-headline-sm uppercase text-base text-slate-900 font-bold truncate mt-0.5">
                      {podiumTop3[2]?.firstName} {podiumTop3[2]?.lastName}
                    </h3>
                    <p className="text-xs text-slate-500 truncate font-sans">
                      {podiumTop3[2]?.schoolOrClub}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {getProvinceThai(podiumTop3[2]?.province)} • {podiumTop3[2]?.heightCm} ซม.
                    </p>
                  </div>
                </div>

                {/* 5 Stat Columns */}
                <div className="grid grid-cols-5 gap-1 py-3 bg-slate-50 rounded-xl px-2 mb-3 text-center border border-slate-100 font-mono">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">EFF/G</div>
                    <div className="text-xl text-[#AF101A] font-black leading-none mt-1">
                      {podiumTop3[2]?.effPerGame}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">แต้ม</div>
                    <div className="text-lg text-slate-900 font-bold leading-none mt-1">
                      {podiumTop3[2]?.ppg}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">รีบาวด์</div>
                    <div className="text-lg text-slate-900 font-bold leading-none mt-1">
                      {podiumTop3[2]?.rpg}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">แอสซิสต์</div>
                    <div className="text-lg text-slate-900 font-bold leading-none mt-1">
                      {podiumTop3[2]?.apg}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">eFG%</div>
                    <div className="text-lg text-slate-900 font-bold leading-none mt-1">
                      {podiumTop3[2]?.efgPct}%
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={`/athlete/${podiumTop3[2]?.athleteId}`}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 font-mono text-xs font-bold text-slate-800 transition flex items-center justify-center gap-1.5"
              >
                <span>ดูโปรไฟล์ &amp; แฟ้มสถิติ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        )}

        {/* 5. Search & Filter Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-mono text-xs">
          {/* Left: Search & Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 flex-grow">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-grow sm:flex-grow-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ค้นหาชื่อนักกีฬา หรือโรงเรียน..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition font-sans"
              />
            </div>

            {/* Age Dropdown */}
            <div className="relative">
              <select
                value={ageFilter}
                onChange={(e) => {
                  setAgeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200 hover:border-slate-400 text-xs font-bold rounded-xl px-3 py-2 pr-8 text-slate-700 cursor-pointer focus:outline-none transition"
              >
                <option value="ALL">รุ่นอายุ: ทั้งหมด (U16 / U18 / U20)</option>
                <option value="U16">รุ่นอายุ: U16</option>
                <option value="U18">รุ่นอายุ: U18</option>
                <option value="U20">รุ่นอายุ: U20</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Province Dropdown */}
            <div className="relative">
              <select
                value={provinceFilter}
                onChange={(e) => {
                  setProvinceFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200 hover:border-slate-400 text-xs font-bold rounded-xl px-3 py-2 pr-8 text-slate-700 cursor-pointer focus:outline-none transition"
              >
                <option value="ALL">จังหวัด: ทุกจังหวัดทั่วประเทศ</option>
                {availableProvinces.map((p) => (
                  <option key={p.value} value={p.value}>
                    จังหวัด: {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Activity Dropdown */}
            <div className="relative">
              <select
                value={activityFilter}
                onChange={(e) => {
                  setActivityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-slate-200 hover:border-slate-400 text-xs font-bold rounded-xl px-3 py-2 pr-8 text-slate-700 cursor-pointer focus:outline-none transition"
              >
                <option value="ALL">ความเคลื่อนไหว: ทั้งหมด</option>
                <option value="ACTIVE_30D">มีสถิติแข่งขันใน 30 วันล่าสุด</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Right: Counter & View Mode Switcher */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <span className="text-xs text-slate-500 font-mono">
              พบ <strong className="text-slate-900 font-bold">{sortedAthletes.length}</strong> นักกีฬา
            </span>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("TABLE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "TABLE"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>ตาราง</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("CARDS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "CARDS"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>การ์ด</span>
              </button>
            </div>
          </div>
        </div>

        {/* 6. Main Leaderboard Table View */}
        {viewMode === "TABLE" ? (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase text-[11px] select-none">
                    <th className="py-3.5 px-4 font-bold">อันดับ</th>
                    <th className="py-3.5 px-4 font-bold">นักกีฬา (PLAYER)</th>
                    <th className="py-3.5 px-4 font-bold">สังกัด / สโมสร</th>
                    <th className="py-3.5 px-3 font-bold text-center">เบอร์</th>
                    <th className="py-3.5 px-3 font-bold text-center">ตำแหน่ง</th>
                    <th
                      onClick={() => handleSort("heightCm")}
                      className="py-3.5 px-3 font-bold text-center cursor-pointer hover:bg-slate-100 transition"
                      title="คลิกเพื่อเรียงตามส่วนสูง"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>ส่วนสูง</span>
                        {sortField === "heightCm" ? (
                          sortOrder === "desc" ? <ArrowDown className="w-3 h-3 text-[#AF101A]" /> : <ArrowUp className="w-3 h-3 text-[#AF101A]" />
                        ) : (
                          <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("ppg")}
                      className="py-3.5 px-3 font-bold text-center cursor-pointer hover:bg-slate-100 transition"
                      title="คลิกเพื่อเรียงตามแต้มเฉลี่ยต่อเกม (PPG)"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>PPG (แต้ม)</span>
                        {sortField === "ppg" ? (
                          sortOrder === "desc" ? <ArrowDown className="w-3 h-3 text-[#AF101A]" /> : <ArrowUp className="w-3 h-3 text-[#AF101A]" />
                        ) : (
                          <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("rpg")}
                      className="py-3.5 px-3 font-bold text-center cursor-pointer hover:bg-slate-100 transition"
                      title="คลิกเพื่อเรียงตามรีบาวด์เฉลี่ย (RPG)"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>RPG (รีบาวด์)</span>
                        {sortField === "rpg" ? (
                          sortOrder === "desc" ? <ArrowDown className="w-3 h-3 text-[#AF101A]" /> : <ArrowUp className="w-3 h-3 text-[#AF101A]" />
                        ) : (
                          <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("apg")}
                      className="py-3.5 px-3 font-bold text-center cursor-pointer hover:bg-slate-100 transition"
                      title="คลิกเพื่อเรียงตามแอสซิสต์เฉลี่ย (APG)"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>APG (แอสซิสต์)</span>
                        {sortField === "apg" ? (
                          sortOrder === "desc" ? <ArrowDown className="w-3 h-3 text-[#AF101A]" /> : <ArrowUp className="w-3 h-3 text-[#AF101A]" />
                        ) : (
                          <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("efgPct")}
                      className="py-3.5 px-3 font-bold text-center cursor-pointer hover:bg-slate-100 transition"
                      title="คลิกเพื่อเรียงตามความแม่นยำ (eFG%)"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>eFG%</span>
                        {sortField === "efgPct" ? (
                          sortOrder === "desc" ? <ArrowDown className="w-3 h-3 text-[#AF101A]" /> : <ArrowUp className="w-3 h-3 text-[#AF101A]" />
                        ) : (
                          <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("effPerGame")}
                      className="py-3.5 px-4 font-black text-right text-[#AF101A] cursor-pointer hover:bg-red-50 transition"
                      title="คลิกเพื่อเรียงตามดัชนีประสิทธิภาพรวม FIBA EFF/G"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>FIBA EFF/G</span>
                        {sortField === "effPerGame" ? (
                          sortOrder === "desc" ? <ArrowDown className="w-3.5 h-3.5 text-[#AF101A]" /> : <ArrowUp className="w-3.5 h-3.5 text-[#AF101A]" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-red-300" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedAthletes.map((ath, index) => {
                    const globalRank = (currentPage - 1) * pageSize + index + 1;
                    const isRankOne = globalRank === 1;

                    return (
                      <tr
                        key={ath.athleteId}
                        className="hover:bg-slate-50/90 transition-colors"
                      >
                        {/* Rank Badge */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
                              isRankOne
                                ? "bg-[#AF101A] text-white shadow-xs"
                                : globalRank <= 3
                                ? "bg-slate-800 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            #{globalRank}
                          </span>
                        </td>

                        {/* Player */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Link
                            href={`/athlete/${ath.athleteId}`}
                            className="flex items-center gap-3 group"
                          >
                            <img
                              src={ath.avatarUrl || "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80"}
                              alt={ath.firstName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-[#AF101A] transition text-sm">
                                {ath.firstName} {ath.lastName}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {getProvinceThai(ath.province)} • {ath.ageCategory}
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* School / Club */}
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700">
                          {ath.schoolOrClub}
                        </td>

                        {/* Jersey Number */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="bg-slate-100 text-slate-700 font-mono font-bold text-xs px-2 py-0.5 rounded-md border border-slate-200">
                            #{ath.jerseyNumber}
                          </span>
                        </td>

                        {/* Position */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="bg-red-50 border border-red-100 text-[#AF101A] font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-md uppercase">
                            {positionMap[ath.position]?.short || ath.position}
                          </span>
                        </td>

                        {/* Height */}
                        <td className="py-3 px-3 text-center whitespace-nowrap font-mono font-bold text-slate-800">
                          {ath.heightCm} <span className="text-[10px] text-slate-400 font-normal">ซม.</span>
                        </td>

                        {/* PPG */}
                        <td className="py-3 px-3 text-center whitespace-nowrap font-mono font-bold text-slate-900 text-sm">
                          {ath.ppg}
                        </td>

                        {/* RPG */}
                        <td className="py-3 px-3 text-center whitespace-nowrap font-mono font-medium text-slate-700">
                          {ath.rpg}
                        </td>

                        {/* APG */}
                        <td className="py-3 px-3 text-center whitespace-nowrap font-mono font-medium text-slate-700">
                          {ath.apg}
                        </td>

                        {/* eFG% */}
                        <td className="py-3 px-3 text-center whitespace-nowrap font-mono font-medium text-slate-700">
                          {ath.efgPct}%
                        </td>

                        {/* EFF/G */}
                        <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-base font-black text-[#AF101A]">
                          {ath.effPerGame}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <span className="text-slate-500">
                แสดงอันดับ <strong>{(currentPage - 1) * pageSize + 1}</strong>-<strong>{Math.min(currentPage * pageSize, sortedAthletes.length)}</strong> จากทั้งหมด <strong>{sortedAthletes.length}</strong> คน (หน้า {currentPage} จาก {totalPages})
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? "bg-[#AF101A] text-white shadow-xs"
                          : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <span className="text-slate-400 px-1">...</span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                        currentPage === totalPages
                          ? "bg-[#AF101A] text-white shadow-xs"
                          : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Cards Grid View (When user switches to Cards) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedAthletes.map((ath, index) => {
              const globalRank = (currentPage - 1) * pageSize + index + 1;
              return (
                <div
                  key={ath.athleteId}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <span className="bg-slate-900 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
                        อันดับ #{globalRank}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-red-50 border border-red-100 text-[#AF101A] px-2 py-0.5 rounded uppercase">
                        {positionMap[ath.position]?.th || ath.position}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={ath.avatarUrl || "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80"}
                        alt={ath.firstName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate">
                          {ath.firstName} {ath.lastName}
                        </h4>
                        <p className="text-xs text-slate-500 truncate font-sans">
                          {ath.schoolOrClub}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          {getProvinceThai(ath.province)} • #{ath.jerseyNumber}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 py-2.5 bg-slate-50 rounded-xl px-2 text-center text-xs mb-3 border border-slate-100 font-mono">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">EFF/G</div>
                        <div className="text-lg text-[#AF101A] font-black mt-0.5">
                          {ath.effPerGame}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">แต้ม</div>
                        <div className="text-base text-slate-800 font-bold mt-0.5">
                          {ath.ppg}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">รีบาวด์</div>
                        <div className="text-base text-slate-800 font-bold mt-0.5">
                          {ath.rpg}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase">แอสซิสต์</div>
                        <div className="text-base text-slate-800 font-bold mt-0.5">
                          {ath.apg}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/athlete/${ath.athleteId}`}
                    className="w-full text-center py-2.5 bg-slate-50 hover:bg-[#AF101A] hover:text-white rounded-xl text-xs font-mono font-bold text-slate-800 transition flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <span>ดูโปรไฟล์นักกีฬา</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* 7. FIBA Official Efficiency Formula Standard (EFF) Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#AF101A]/10 border border-[#AF101A]/20 text-[#AF101A] flex items-center justify-center font-bold text-xl shrink-0 font-mono">
              Σ
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-black uppercase text-slate-900 tracking-wider">
                สูตรคำนวณมาตรฐานสากล FIBA LiveStats Efficiency (EFF)
              </h4>
              <p className="text-xs text-slate-600 font-mono leading-relaxed max-w-4xl">
                EFF = (PTS + REB + AST + STL + BLK - ((FGA - FGM) + (FTA - FTM) + TO)) / GP
              </p>
              <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                สถิติทุกรายการได้รับการบันทึกและตรวจสอบโดยตรงจากโต๊ะเทคนิคสมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT) 
                เพื่อใช้เป็นเอกสารรับรองมาตรฐานทางการในการพิจารณาโควตานักกีฬาเข้าศึกษาต่อระดับอุดมศึกษา
              </p>
            </div>
          </div>

          <div className="shrink-0 self-start md:self-center font-mono">
            <span className="bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-700 uppercase whitespace-nowrap">
              BSAT VALIDATED 2026
            </span>
          </div>
        </div>

      </main>

      {/* Universal Footer */}
      <Footer />

      {/* Official TCAS Dossier Modal */}
      {isTcasAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0F172A] border border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-white font-mono">
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-headline-lg uppercase text-lg text-white font-bold">
                  ระบบตรวจสอบแฟ้มรับรองสถิติทางการ (OFFICIAL TCAS AUDIT)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTcasAuditModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={podiumTop3[0]?.avatarUrl || "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80"}
                    alt={podiumTop3[0]?.firstName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] text-red-400 font-bold uppercase block">
                      นักกีฬาอันดับ 1 ของประเทศ
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {podiumTop3[0]?.firstName} {podiumTop3[0]?.lastName} (#{podiumTop3[0]?.jerseyNumber})
                    </h4>
                    <p className="text-slate-400 text-[11px] font-sans">
                      {podiumTop3[0]?.schoolOrClub} • {getProvinceThai(podiumTop3[0]?.province)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">ดัชนี FIBA EFF</span>
                  <span className="text-2xl font-black text-amber-400">
                    {podiumTop3[0]?.effPerGame}
                  </span>
                </div>
              </div>

              <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[11px]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>สถิติผ่านการตรวจสอบรับรองระดับมาตรฐานสากล (AUDIT VERIFIED)</span>
                </div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  สถิตินี้ถูกบันทึกผ่านระบบโต๊ะเทคนิคดิจิทัล StatCourt Console เชื่อมโยงกับวิดีโอย้อนหลัง 100% 
                  สามารถใช้เป็นเอกสารหลักฐานทางการในการยื่นสมัครโควตานักกีฬา TCAS รอบที่ 1 (Portfolio)
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-400 pt-2 border-t border-slate-800 text-[11px]">
                  <div>รหัสอ้างอิง: <span className="text-white font-bold">STC-TCAS-2026-BCC07</span></div>
                  <div>หน่วยงานรับรอง: <span className="text-white font-bold">BSAT / FIBA Table Crew</span></div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTcasAuditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold transition"
                >
                  ปิดหน้าต่าง
                </button>
                <Link
                  href={`/athlete/${podiumTop3[0]?.athleteId}?tab=TCAS`}
                  className="px-5 py-2 rounded-xl bg-[#AF101A] hover:bg-red-700 text-white font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์แฟ้มสถิติ TCAS ฉบับเต็ม &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Freemium Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        defaultPerspective="ATHLETE"
      />
    </div>
  );
}
