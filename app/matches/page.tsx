"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { mockMatches, mockTournaments } from "@/lib/db/seed-data";
import { Match } from "@/lib/types";
import {
  Film,
  Search,
  Calendar,
  MapPin,
  Sparkles,
  Shield,
  Play,
  Flame,
  Radio,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { fetchWithCache } from "@/lib/cache/clientCache";

export default function MatchesArchivePage() {
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTournament, setSelectedTournament] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Fetch API matches if available with fallback to seed data
  useEffect(() => {
    let isMounted = true;
    async function loadMatches() {
      try {
        const json = await fetchWithCache<{ data?: Match[] }>("/api/matches", 60000);
        if (json?.data && Array.isArray(json.data) && json.data.length > 0 && isMounted) {
          setMatches(json.data);
        }
      } catch {
        // Fallback to mockMatches
      }
    }
    loadMatches();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter matches with useMemo for optimal client performance
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (m.tournamentName || "").toLowerCase();
        const homeName = (m.homeTeam?.name || "").toLowerCase();
        const homeShort = (m.homeTeam?.shortName || "").toLowerCase();
        const awayName = (m.awayTeam?.name || "").toLowerCase();
        const awayShort = (m.awayTeam?.shortName || "").toLowerCase();
        const matchId = (m.id || "").toLowerCase();

        if (
          !matchTitle.includes(q) &&
          !homeName.includes(q) &&
          !homeShort.includes(q) &&
          !awayName.includes(q) &&
          !awayShort.includes(q) &&
          !matchId.includes(q)
        ) {
          return false;
        }
      }

      if (selectedTournament !== "ALL" && m.tournamentId !== selectedTournament) {
        return false;
      }

      if (selectedStatus === "FILM") {
        return !!m.rawVideoUrl;
      }
      if (selectedStatus === "LIVE") {
        return m.status === "LIVE";
      }
      if (selectedStatus === "COMPLETED") {
        return m.status === "COMPLETED";
      }

      return true;
    });
  }, [matches, searchQuery, selectedTournament, selectedStatus]);

  const featuredMatch = matches.find((m) => m.id === "match-bcc-ds-01") || matches[0];

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans antialiased selection:bg-[#AF101A] selection:text-white">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* 1. Header Hero Section (Courtside Editorial Standard) */}
        <section className="bg-[#0B1C30] text-white py-10 sm:py-14 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 court-grid-pattern opacity-10 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#AF101A]/15 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                {/* Pill Badges Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#AF101A]/20 border border-[#AF101A]/50 text-[#FFDAD6] text-xs font-mono font-bold tracking-widest uppercase">
                    <Film className="w-3.5 h-3.5 text-[#FF7A7A]" />
                    HUDL-GRADE GAME FILM ARCHIVE &amp; SCOUT ROOM
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>1080p HD Tape • Click-to-Clip (-8s)</span>
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="font-headline-xl text-white uppercase tracking-wider text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  ศูนย์รวมแมตช์และคลังเทปการแข่งขัน
                </h1>

                {/* Subtitle */}
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans">
                  เลือกชมเทปบันทึกการแข่งขันแบบเจาะลึก (Click-to-Clip Breakdown), กรองดูเฉพาะช็อต 3PT, แอสซิสต์,
                  และช็อตเกมรับของนักกีฬา พร้อมบันทึกโน้ตแท็กติกสำหรับทีมงานโค้ชและแมวมอง
                </p>
              </div>

              {/* Quick Action Button */}
              <div className="shrink-0 flex items-center gap-3">
                <Link
                  href="/live"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#AF101A] hover:bg-[#8E0D15] text-white font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Radio className="w-4 h-4 text-[#FF7A7A] animate-pulse" />
                  <span>ศูนย์ถ่ายทอดสด (LIVE HUB)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Sticky Filters Bar */}
        <section className="bg-white/95 backdrop-blur-md border-b border-[#DFE2EB] sticky top-14 z-30 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs font-mono">
              
              {/* Search Bar */}
              <div className="flex items-center bg-[#F8F9FC] border border-[#DFE2EB] rounded-lg px-3 py-2 w-full md:w-80 focus-within:border-[#AF101A] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#AF101A]/10 transition">
                <Search className="w-3.5 h-3.5 text-[#5B6574] mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อทีม, โรงเรียน หรือรหัสแมตช์..."
                  className="bg-transparent border-0 p-0 text-[#0B1C30] placeholder:text-[#5B6574] w-full outline-none font-sans text-xs"
                  aria-label="ค้นหาชื่อทีม โรงเรียน หรือรหัสแมตช์"
                />
              </div>

              {/* Filter Selectors & Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Tournament Filter */}
                <div className="flex items-center gap-1.5 bg-[#F8F9FC] border border-[#DFE2EB] rounded-lg px-2.5 py-1.5">
                  <label htmlFor="tournament-select" className="text-[#5B6574] uppercase font-bold text-[11px] shrink-0">
                    ทัวร์นาเมนต์:
                  </label>
                  <select
                    id="tournament-select"
                    value={selectedTournament}
                    onChange={(e) => setSelectedTournament(e.target.value)}
                    className="bg-transparent text-[#0B1C30] font-bold focus:outline-none cursor-pointer font-sans text-xs max-w-[200px] truncate"
                  >
                    <option value="ALL">ทุกทัวร์นาเมนต์ (All)</option>
                    {mockTournaments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Pills */}
                <div role="tablist" aria-label="กรองสถานะแมตช์" className="flex items-center gap-1 bg-[#F8F9FC] border border-[#DFE2EB] rounded-lg p-1">
                  <button
                    role="tab"
                    aria-selected={selectedStatus === "ALL"}
                    onClick={() => setSelectedStatus("ALL")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                      selectedStatus === "ALL"
                        ? "bg-[#AF101A] text-white shadow-xs"
                        : "text-[#5B6574] hover:text-[#0B1C30]"
                    }`}
                  >
                    ทั้งหมด ({matches.length})
                  </button>
                  <button
                    role="tab"
                    aria-selected={selectedStatus === "FILM"}
                    onClick={() => setSelectedStatus("FILM")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      selectedStatus === "FILM"
                        ? "bg-[#AF101A] text-white shadow-xs"
                        : "text-[#5B6574] hover:text-[#0B1C30]"
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>มีเทป HD</span>
                  </button>
                  <button
                    role="tab"
                    aria-selected={selectedStatus === "LIVE"}
                    onClick={() => setSelectedStatus("LIVE")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      selectedStatus === "LIVE"
                        ? "bg-[#AF101A] text-white shadow-xs"
                        : "text-[#5B6574] hover:text-[#0B1C30]"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A7A] animate-pulse" />
                    <span>สด (Live)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Main Content Container */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Featured Marquee Match Card */}
          {featuredMatch && (
            <section aria-labelledby="featured-match-heading">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#AF101A]" />
                  <h2 id="featured-match-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B1C30]">
                    แมตช์ไฮไลท์ประจำสัปดาห์ (FEATURED GAME FILM)
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#AF101A] font-bold hidden sm:inline">
                  พร้อมจุดมาร์กเกอร์เพลย์ 42 จังหวะ
                </span>
              </div>

              <div className="bg-white border border-[#DFE2EB] hover:border-[#7F8A9E] rounded-2xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Match Info & Scoreboard */}
                  <div className="space-y-4 flex-1">
                    {/* Badge Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded bg-red-100/80 text-[#AF101A] font-mono text-[10px] font-bold tracking-wider uppercase border border-[#AF101A]/20">
                        QUARTERFINAL MARQUEE
                      </span>
                      <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold tracking-wider uppercase border ${
                        featuredMatch.resultStatus === "FINAL"
                          ? "bg-emerald-50 text-[#15803D] border-emerald-200"
                          : "bg-amber-50 text-[#B45309] border-amber-200"
                      }`}>
                        {featuredMatch.resultStatus === "FINAL" ? "✓ ผลรับรองแล้ว" : "รอรับรองผล"}
                      </span>
                      <span className="text-xs text-[#5B6574] font-mono">
                        {featuredMatch.tournamentName}
                      </span>
                    </div>

                    {/* Resilient Responsive Matchup Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4 pt-1">
                      {/* Home Team */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-mono text-base font-black flex items-center justify-center shrink-0 shadow-xs">
                          {featuredMatch.homeTeam?.shortName || "BCC"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-base sm:text-lg font-bold text-[#0B1C30] truncate">
                            {featuredMatch.homeTeam?.name || "Bangkok Christian College"}
                          </div>
                          <div className="text-xs text-[#5B6574] font-mono">BCC Silom • แชมป์กลุ่ม A</div>
                        </div>
                      </div>

                      {/* Score Box Centerpiece */}
                      <div className="text-center font-mono shrink-0 px-4 py-2 bg-[#F8F9FC] border border-[#DFE2EB] rounded-xl my-1 sm:my-0">
                        <div className="text-3xl sm:text-4xl font-black text-[#0B1C30] tracking-wider flex items-center justify-center gap-2">
                          <span>{featuredMatch.homeScore ?? 75}</span>
                          <span className="text-[#5B6574] text-xl font-normal">-</span>
                          <span>{featuredMatch.awayScore ?? 63}</span>
                        </div>
                        <span className="text-[10px] text-[#5B6574] uppercase tracking-widest font-bold block mt-0.5">
                          FINAL SCORE
                        </span>
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center sm:justify-end gap-3 text-left sm:text-right">
                        <div className="min-w-0 sm:order-1">
                          <div className="text-base sm:text-lg font-bold text-[#0B1C30] truncate">
                            {featuredMatch.awayTeam?.name || "Debsirin School"}
                          </div>
                          <div className="text-xs text-[#5B6574] font-mono">Debsirin • รองแชมป์กลุ่ม B</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#0B1C30]/80 text-white font-mono text-base font-black flex items-center justify-center shrink-0 shadow-xs sm:order-2">
                          {featuredMatch.awayTeam?.shortName || "DS"}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#5B6574] font-sans pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#5B6574]" />
                        <span>21 กันยายน 2026</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#5B6574]" />
                        <span>อาคารนิมิบุตร สนามกีฬาแห่งชาติ</span>
                      </span>
                      <span className="text-[#AF101A] font-mono font-bold">
                        ★ MVP: #7 Thanakorn Siriphan (18 PTS, 8 AST)
                      </span>
                    </div>
                  </div>

                  {/* Action Column */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 pt-2 lg:pt-0 lg:border-l lg:border-slate-100 lg:pl-6">
                    <Link
                      href={`/matches/${featuredMatch.id}/film`}
                      className="px-6 py-3.5 rounded-lg bg-[#AF101A] hover:bg-[#8E0D15] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm hover:shadow-md"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>เข้าสู่ห้องดูเทป (GAME FILM)</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/live"
                        className="flex-1 px-3.5 py-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#AF101A] border border-[#AF101A]/20 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition"
                      >
                        <Radio className="w-3.5 h-3.5 text-[#AF101A]" />
                        <span>ถ่ายทอดสด</span>
                      </Link>

                      <Link
                        href={`/official/console/${featuredMatch.id}`}
                        className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0B1C30] border border-[#DFE2EB] font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#5B6574]" />
                        <span>โต๊ะกรรมการ</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 4. All Matches Listing Grid */}
          <section aria-labelledby="all-matches-heading" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DFE2EB] text-xs font-mono text-[#5B6574]">
              <span id="all-matches-heading" className="font-bold text-[#0B1C30]">
                แสดง {filteredMatches.length} จาก {matches.length} แมตช์การแข่งขัน
              </span>
              <span>เรียงตาม: ล่าสุด (Newest First)</span>
            </div>

            {filteredMatches.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[#DFE2EB] rounded-2xl space-y-3">
                <Film className="w-10 h-10 text-[#5B6574] mx-auto" />
                <div className="text-sm font-bold text-[#0B1C30]">
                  ไม่พบแมตช์ที่ตรงกับเงื่อนไขการค้นหา
                </div>
                <p className="text-xs text-[#5B6574]">
                  ลองปรับคำค้นหาหรือเลือกตัวกรองทัวร์นาเมนต์ใหม่
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTournament("ALL");
                    setSelectedStatus("ALL");
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-[#DFE2EB] text-xs font-bold text-[#0B1C30] transition cursor-pointer"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((match) => {
                  const home = match.homeTeam;
                  const away = match.awayTeam;
                  const hasFilm = !!match.rawVideoUrl;
                  const isLive = match.status === "LIVE";

                  return (
                    <article
                      key={match.id}
                      className="bg-white border border-[#DFE2EB] hover:border-[#7F8A9E] rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
                    >
                      {/* Top: Tournament & Status */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono text-[#5B6574] font-bold truncate max-w-[200px]">
                            {match.tournamentName || "TOA Youth Basketball League"}
                          </span>

                          {isLive ? (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-50 border border-[#FF7A7A]/40 text-[#AF101A] font-mono text-[10px] font-bold shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A7A] animate-pulse" />
                              <span>LIVE</span>
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 border ${
                              match.resultStatus === "FINAL"
                                ? "bg-emerald-50 text-[#15803D] border-emerald-200"
                                : "bg-slate-100 text-[#5B6574] border-slate-200"
                            }`}>
                              {match.resultStatus === "FINAL" ? "✓ รับรองแล้ว" : match.resultStatus === "PENDING_APPROVAL" ? "รอรับรอง" : match.status === "SCHEDULED" ? "เร็ว ๆ นี้" : "ผลชั่วคราว"}
                            </span>
                          )}
                        </div>

                        {/* Team Score Box */}
                        <div className="bg-[#F8F9FC] border border-[#DFE2EB] rounded-lg p-3.5 space-y-2.5">
                          {/* Home */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded bg-[#0B1C30] text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                                {home?.shortName?.substring(0, 3) || "H"}
                              </div>
                              <span className="text-xs font-bold text-[#0B1C30] truncate max-w-[170px]">
                                {home?.name || "Home Team"}
                              </span>
                            </div>
                            <span className="text-base font-black font-mono text-[#0B1C30] shrink-0 pl-2">
                              {match.homeScore ?? "-"}
                            </span>
                          </div>

                          {/* Away */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded bg-slate-700 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                                {away?.shortName?.substring(0, 3) || "A"}
                              </div>
                              <span className="text-xs font-bold text-[#0B1C30] truncate max-w-[170px]">
                                {away?.name || "Away Team"}
                              </span>
                            </div>
                            <span className="text-base font-black font-mono text-[#0B1C30] shrink-0 pl-2">
                              {match.awayScore ?? "-"}
                            </span>
                          </div>
                        </div>

                        {/* Venue & Tape Badge */}
                        <div className="flex items-center justify-between text-[11px] text-[#5B6574] font-mono pt-1">
                          <span className="flex items-center gap-1 truncate max-w-[180px]">
                            <MapPin className="w-3 h-3 text-[#5B6574] shrink-0" />
                            <span>อาคารนิมิบุตร</span>
                          </span>

                          {hasFilm && (
                            <span className="text-[#AF101A] flex items-center gap-1 font-bold shrink-0">
                              <Film className="w-3 h-3" />
                              <span>1080p HD TAPE</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                        <Link
                          href={`/matches/${match.id}/film`}
                          className="w-full py-2.5 rounded-lg bg-[#AF101A] hover:bg-[#8E0D15] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-2xs"
                        >
                          <Film className="w-3.5 h-3.5" />
                          <span>ชมเทปวิเคราะห์เกม (GAME FILM)</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                        </Link>

                        {/* Compact Contextual Action Row */}
                        <div className="flex items-center justify-between gap-2 text-[11px] font-mono pt-1">
                          {isLive ? (
                            <Link
                              href="/live"
                              className="flex-1 py-1.5 rounded-md bg-red-50 hover:bg-red-100 border border-[#FF7A7A]/30 text-[#AF101A] font-bold flex items-center justify-center gap-1 transition"
                            >
                              <Radio className="w-3 h-3 text-[#AF101A]" />
                              <span>ดูสด (Live)</span>
                            </Link>
                          ) : (
                            <span className="text-[10px] text-[#5B6574] font-mono">
                              รหัสแมตช์: {match.id}
                            </span>
                          )}

                          <Link
                            href={`/official/console/${match.id}`}
                            className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 border border-[#DFE2EB] text-[#5B6574] hover:text-[#0B1C30] font-bold flex items-center gap-1 transition ml-auto"
                            title="เปิดระบบคอนโซลโต๊ะบันทึกคะแนน"
                          >
                            <Shield className="w-3 h-3" />
                            <span>โต๊ะกรรมการ</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* 5. Scout Workflow Guide */}
          <section aria-labelledby="scout-guide-heading" className="bg-white border border-[#DFE2EB] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#AF101A]" />
              <h3 id="scout-guide-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B1C30]">
                ขั้นตอนการใช้งาน Game Film Room สำหรับโค้ชและแมวมอง
              </h3>
            </div>
            <p className="text-xs text-[#5B6574] mb-6 font-sans">
              ระบบจัดเก็บเทปและมาร์กเกอร์จังหวะเพลย์อัตโนมัติ ช่วยลดเวลาตัดต่อวิดีโอจาก 3 ชั่วโมงเหลือเพียง 10 นาที
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
              <div className="bg-[#F8F9FC] p-4 sm:p-5 rounded-xl border border-[#DFE2EB] space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#AF101A]/10 text-[#AF101A] border border-[#AF101A]/20 font-mono font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <div className="text-xs font-bold text-[#0B1C30]">เลือกแมตช์ที่ต้องการศึกษา</div>
                <p className="text-xs text-[#5B6574] leading-relaxed">
                  คลิกเข้าสู่ห้องดูเทปของแมตช์ที่ต้องการ ระบบจะโหลดเทป 1080p พร้อมชุดข้อมูลสถิติที่ได้รับการรับรอง
                </p>
              </div>

              <div className="bg-[#F8F9FC] p-4 sm:p-5 rounded-xl border border-[#DFE2EB] space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#B45309] border border-amber-500/20 font-mono font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <div className="text-xs font-bold text-[#0B1C30]">กรองช็อตและจังหวะเพลย์</div>
                <p className="text-xs text-[#5B6574] leading-relaxed">
                  ใช้ Filter Drawer กรองดูเฉพาะช็อต 3 แต้ม, แอสซิสต์ หรือบล็อก/สตีล พร้อมคลิกดูคลิปย้อนหลัง -8s ทันที
                </p>
              </div>

              <div className="bg-[#F8F9FC] p-4 sm:p-5 rounded-xl border border-[#DFE2EB] space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-[#15803D] border border-emerald-500/20 font-mono font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <div className="text-xs font-bold text-[#0B1C30]">บันทึกแท็กติก &amp; ส่งออกสถิติ</div>
                <p className="text-xs text-[#5B6574] leading-relaxed">
                  พิมพ์บันทึกข้อคิดเห็นของโค้ชลงใน Telestration Notes และพิมพ์รายงานสถิติ FIBA สำหรับเตรียมความพร้อมก่อนแข่ง
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
