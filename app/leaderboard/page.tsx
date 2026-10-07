"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import RankingBoard from "@/components/leaderboard/RankingBoard";
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
  | "fgPct"
  | "efgPct"
  | "tsPct"
  | "astToRatio"
  | "heightCm"
  | "weightKg";

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

import { fetchWithCache } from "@/lib/cache/clientCache";

export default function LeaderboardPage() {
  const [seasonFilter, setSeasonFilter] = useState<string>("2026");
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

  const [dataStatus, setDataStatus] = useState<"loading" | "ready" | "fallback">("loading");

  // Keep a previous season's response from replacing the current selection.
  useEffect(() => {
    let isCancelled = false;
    async function loadAthletes() {
      setDataStatus("loading");
      try {
        const query = seasonFilter !== "ALL" ? `?season=${seasonFilter}` : "";
        const json = await fetchWithCache<{ success?: boolean; data?: any[] }>(`/api/leaderboard${query}`, 30000);
        if (isCancelled) return;
        if (!json?.success || !Array.isArray(json.data)) throw new Error("Invalid leaderboard response");
        setAthletesData(json.data.map((entry: AthleteSeasonStats & { effectiveFgPct?: number; trueShootingPct?: number }) => ({
          ...entry, efgPct: entry.effectiveFgPct ?? entry.efgPct, tsPct: entry.trueShootingPct ?? entry.tsPct,
        })));
        setDataStatus("ready");
      } catch (err) {
        if (isCancelled) return;
        setAthletesData(mockLeaderboardAthletes);
        setDataStatus("fallback");
        console.warn("Using local fallback leaderboard data:", err);
      }
    }
    loadAthletes();
    return () => {
      isCancelled = true;
    };
  }, [seasonFilter, currentUser.tier]);

  const getProvinceThai = useCallback((prov: string) => provinceMap[prov] || prov, []);

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
  }, [athletesData, getProvinceThai]);

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

      <RankingBoard
        athletes={dataStatus === "loading" ? [] : paginatedAthletes} count={dataStatus === "loading" ? 0 : sortedAthletes.length} page={currentPage} pages={totalPages} pageSize={pageSize} onPage={setCurrentPage}
        search={searchQuery} onSearch={(value) => { setSearchQuery(value); setCurrentPage(1); }}
        season={seasonFilter} onSeason={(value) => { setSeasonFilter(value); setCurrentPage(1); }}
        age={ageFilter} onAge={(value) => { setAgeFilter(value); setCurrentPage(1); }}
        province={provinceFilter} onProvince={(value) => { setProvinceFilter(value); setCurrentPage(1); }} provinces={availableProvinces}
        activity={activityFilter} onActivity={(value) => { setActivityFilter(value); setCurrentPage(1); }}
        position={positionFilter} onPosition={(value) => { setPositionFilter(value); setCurrentPage(1); }}
        positions={positionButtons.map(({ id, label }) => ({ value: id, label: id === "ALL" ? "อันดับรวม" : label }))}
        sort={sortField} order={sortOrder} onSort={handleSort} view={viewMode} onView={setViewMode}
        onExport={handleExportCsv} onAudit={() => setIsTcasAuditModalOpen(true)} provinceLabel={getProvinceThai}
        isPro={isPro} onPricing={() => setIsPricingModalOpen(true)} dataStatus={dataStatus}
      />
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
