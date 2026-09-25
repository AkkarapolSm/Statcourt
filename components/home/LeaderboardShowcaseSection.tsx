"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight, ExternalLink } from "lucide-react";
import { mockLeaderboardAthletes } from "@/lib/db/seed-data";
import { Position, AthleteSeasonStats } from "@/lib/types";

// Province Thai translation dictionary (matching /leaderboard)
const provinceMap: Record<string, string> = {
  Bangkok: "กรุงเทพมหานคร",
  "Chiang Mai": "เชียงใหม่",
  Chonburi: "ชลบุรี",
  Nonthaburi: "นนทบุรี",
  Phuket: "ภูเก็ต",
  Songkhla: "สงขลา",
  "Nakhon Ratchasima": "นครราชสีมา",
};

const getProvinceThai = (prov?: string) => (prov ? provinceMap[prov] || prov : "กรุงเทพมหานคร");

const positionMap: Record<string, { th: string; abbr: string }> = {
  POINT_GUARD: { th: "พอยต์การ์ด", abbr: "PG" },
  SHOOTING_GUARD: { th: "ชูตติ้งการ์ด", abbr: "SG" },
  SMALL_FORWARD: { th: "สมอลฟอร์เวิร์ด", abbr: "SF" },
  POWER_FORWARD: { th: "เพาเวอร์ฟอร์เวิร์ด", abbr: "PF" },
  CENTER: { th: "เซ็นเตอร์", abbr: "C" },
};

export default function LeaderboardShowcaseSection() {
  const [selectedPosition, setSelectedPosition] = useState<"ALL" | Position>("ALL");
  const [athletesData, setAthletesData] = useState<AthleteSeasonStats[]>(mockLeaderboardAthletes);

  // Sync with live API data if available, fallback to mockLeaderboardAthletes
  useEffect(() => {
    async function loadLiveAthletes() {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAthletesData(json.data);
          }
        }
      } catch (err) {
        console.warn("Using seed-data fallback for showcase:", err);
      }
    }
    loadLiveAthletes();
  }, []);

  // Filtered and sorted by FIBA EFF descending
  const sortedAthletes = useMemo(() => {
    let list = [...athletesData];
    if (selectedPosition !== "ALL") {
      list = list.filter((a) => a.position === selectedPosition);
    }
    list.sort((a, b) => b.effPerGame - a.effPerGame);
    return list;
  }, [athletesData, selectedPosition]);

  const podiumTop3 = useMemo(() => sortedAthletes.slice(0, 3), [sortedAthletes]);
  const tableAthletes = useMemo(() => sortedAthletes.slice(3, 9), [sortedAthletes]);

  const positionButtons: { id: "ALL" | Position; label: string }[] = [
    { id: "ALL", label: "ALL POSITIONS" },
    { id: "POINT_GUARD", label: "PG" },
    { id: "SHOOTING_GUARD", label: "SG" },
    { id: "SMALL_FORWARD", label: "SF" },
    { id: "POWER_FORWARD", label: "PF" },
    { id: "CENTER", label: "C" },
  ];

  return (
    <section className="py-16 bg-[#F8F9FD] border-b border-slate-200" id="leaderboard">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-block bg-red-100 text-[#AF101A] font-mono uppercase font-bold px-3 py-1 rounded text-xs mb-2">
              FIBA EFFICIENCY INDEX (40-MIN STANDARDIZED)
            </div>
            <h2 className="font-headline-xl text-3xl sm:text-4xl uppercase text-slate-900 font-black tracking-tight">
              ตารางอันดับนักกีฬา TOP 100 ระดับประเทศ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-mono">
              คำนวณสดจาก TOA Youth League, High School Nationals และรายการแข่งขันที่รับรองโดย BSAT
            </p>
          </div>

          {/* Position Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {positionButtons.map((btn) => {
              const isSelected = selectedPosition === btn.id;
              return (
                <button
                  type="button"
                  key={btn.id}
                  onClick={() => setSelectedPosition(btn.id)}
                  className={`px-3 py-1.5 font-bold uppercase rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#AF101A] text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Tier Podium Cards Showcase (Aligned exactly with /leaderboard) */}
        {podiumTop3.length >= 3 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch mb-8">
            
            {/* Podium #2 (Silver - Left) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between order-2 md:order-1 hover:shadow-md transition">
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
                    {positionMap[podiumTop3[1]?.position]?.abbr || podiumTop3[1]?.position}
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
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 font-mono text-xs font-bold text-slate-800 transition flex items-center justify-center gap-1.5 bg-white"
              >
                <span>ดูโปรไฟล์ &amp; แฟ้มสถิติ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Podium #1 (Featured Center National Leader) */}
            <div className="bg-white border-2 border-[#AF101A] rounded-2xl p-5 shadow-lg shadow-red-950/5 flex flex-col justify-between order-1 md:order-2 relative hover:shadow-xl transition">
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
                    {positionMap[podiumTop3[0]?.position]?.abbr || podiumTop3[0]?.position}
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
                      <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded uppercase">
                        โควตาช้างเผือก TCAS
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

            {/* Podium #3 (Bronze - Right) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between order-3 hover:shadow-md transition">
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
                    {positionMap[podiumTop3[2]?.position]?.abbr || podiumTop3[2]?.position}
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
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 font-mono text-xs font-bold text-slate-800 transition flex items-center justify-center gap-1.5 bg-white"
              >
                <span>ดูโปรไฟล์ &amp; แฟ้มสถิติ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        ) : null}

        {/* Condensed Data Table for Ranks 4 to 9 (Aligned exactly with /leaderboard) */}
        {tableAthletes.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase text-[11px] select-none">
                    <th className="py-3 px-4 font-bold">อันดับ</th>
                    <th className="py-3 px-4 font-bold">นักกีฬา (PLAYER)</th>
                    <th className="py-3 px-4 font-bold">สังกัด / สโมสร</th>
                    <th className="py-3 px-3 font-bold text-center">ตำแหน่ง</th>
                    <th className="py-3 px-3 font-bold text-center">ส่วนสูง</th>
                    <th className="py-3 px-3 font-bold text-center">PPG (แต้ม)</th>
                    <th className="py-3 px-3 font-bold text-center">RPG (รีบาวด์)</th>
                    <th className="py-3 px-3 font-bold text-center">APG (แอสซิสต์)</th>
                    <th className="py-3 px-3 font-bold text-center">eFG%</th>
                    <th className="py-3 px-4 font-black text-right text-[#AF101A]">FIBA EFF/G</th>
                    <th className="py-3 px-4 font-bold text-center">แฟ้มสถิติ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableAthletes.map((ath, index) => {
                    const rankNum = index + 4;
                    return (
                      <tr key={ath.athleteId} className="hover:bg-slate-50/90 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-900">
                          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-slate-100 text-slate-700">
                            #{rankNum < 10 ? `0${rankNum}` : rankNum}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Link href={`/athlete/${ath.athleteId}`} className="flex items-center gap-3 group">
                            <img
                              src={ath.avatarUrl || "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80"}
                              alt={ath.firstName}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shadow-xs shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-[#AF101A] transition">
                                {ath.firstName} {ath.lastName}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                #{ath.jerseyNumber} • {getProvinceThai(ath.province)}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                          {ath.schoolOrClub}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap font-mono">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                            {positionMap[ath.position]?.abbr || ath.position}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-slate-700">
                          {ath.heightCm} ซม.
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap font-mono font-bold text-slate-900">
                          {ath.ppg}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-slate-700">
                          {ath.rpg}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-slate-700">
                          {ath.apg}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-slate-700">
                          {ath.efgPct}%
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-black text-sm text-[#AF101A]">
                          {ath.effPerGame}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <Link
                            href={`/athlete/${ath.athleteId}`}
                            className="px-2.5 py-1 bg-white hover:bg-[#AF101A] hover:text-white rounded border border-slate-300 text-[11px] font-mono font-bold uppercase transition inline-block text-slate-700 shadow-xs"
                          >
                            Card
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs font-mono gap-2">
              <span className="text-slate-500">
                แสดง 1 ถึง {podiumTop3.length + tableAthletes.length} จากนักกีฬาในระบบที่ผ่านการรับรอง FIBA
              </span>
              <Link
                href="/leaderboard"
                className="text-[#AF101A] hover:underline font-bold uppercase flex items-center gap-1"
              >
                <span>ดูตารางอันดับ TOP 100 ทั้งหมด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
