"use client";

import React, { useState, useEffect } from "react";
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
  Clock,
  Sparkles,
  Shield,
  Play,
  Trophy,
  ChevronRight,
  Flame,
  Radio,
  CheckCircle2,
  ArrowRight,
  Plus,
} from "lucide-react";

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
        const res = await fetch("/api/matches");
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0 && isMounted) {
            setMatches(json.data);
          }
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

  // Filter matches
  const filteredMatches = matches.filter((m) => {
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

  const featuredMatch = matches.find((m) => m.id === "match-bcc-ds-01") || matches[0];

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans antialiased selection:bg-[#DC2626] selection:text-white">
      <Navbar />

      {/* 1. Top Crimson Sub-Banner (Matching Leaderboard / FIBA standard style) */}
      <div className="bg-[#991B1B] text-white py-2 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
        <div className="flex items-center gap-2 flex-wrap font-mono">
          <span className="bg-white text-[#991B1B] font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-sans">
            STATCOURT MATCH ARCHIVE
          </span>
          <span className="font-bold tracking-wide text-[11px]">
            ศูนย์รวมเทปบันทึกการแข่งขันและระบบวิเคราะห์แท็กติก (Game Film & Telestration)
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-red-100 hidden sm:inline">1080p HD Tape • Click-to-Clip Marker (-8s)</span>
          <Link href="/live" className="text-white hover:underline flex items-center gap-1 font-bold">
            <span>ชมถ่ายทอดสด (Live Hub)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <main className="flex-1 pb-16">
        {/* 2. Header Hero Section (Matching /tournaments and /team standard) */}
        <section className="bg-[#0F172A] text-white py-10 sm:py-12 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 court-grid-pattern opacity-15 pointer-events-none" />
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#AF101A]/20 border border-[#AF101A]/40 text-[#FFDAD6] text-xs font-mono font-bold tracking-widest uppercase">
                  <Film className="w-3.5 h-3.5 text-[#DC2626]" />
                  HUDL-GRADE GAME FILM ARCHIVE &amp; SCOUT ROOM
                </div>
                <h1 className="font-headline-xl text-white uppercase tracking-wider text-3xl sm:text-4xl lg:text-5xl font-normal">
                  ศูนย์รวมแมตช์และคลังเทปการแข่งขัน
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  เลือกชมเทปบันทึกการแข่งขันแบบเจาะลึก (Click-to-Clip Breakdown), กรองดูเฉพาะช็อต 3PT, แอสซิสต์,
                  และช็อตเกมรับของนักกีฬา พร้อมบันทึกโน้ตแท็กติกสำหรับทีมงานโค้ชและแมวมอง
                </p>
              </div>

              {/* Quick Action Button */}
              <div className="shrink-0 flex flex-col sm:flex-row gap-2.5">
                <Link
                  href="/live"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono font-bold text-xs tracking-wider uppercase transition shadow-md"
                >
                  <Radio className="w-4 h-4" />
                  <span>ศูนย์ถ่ายทอดสด (LIVE HUB)</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Filters Bar (Matching /tournaments standard) */}
        <section className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs font-mono">
              
              {/* Search Bar */}
              <div className="flex items-center bg-[#F8F9FC] border border-slate-300 rounded-lg px-3 py-2 w-full lg:w-80 focus-within:border-[#DC2626] focus-within:bg-white transition">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อทีม, โรงเรียน หรือรหัสแมตช์..."
                  className="bg-transparent border-0 p-0 text-slate-800 placeholder:text-slate-400 w-full outline-none font-sans text-xs"
                />
              </div>

              {/* Filter Selectors & Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Tournament Filter */}
                <div className="flex items-center gap-1 bg-[#F8F9FC] border border-slate-300 rounded-lg px-2.5 py-1.5">
                  <span className="text-slate-500 uppercase font-bold text-[11px]">ทัวร์นาเมนต์:</span>
                  <select
                    value={selectedTournament}
                    onChange={(e) => setSelectedTournament(e.target.value)}
                    className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer font-sans"
                  >
                    <option value="ALL">ทุกทัวร์นาเมนต์ (All Tournaments)</option>
                    {mockTournaments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Pills */}
                <div className="flex items-center gap-1 bg-[#F8F9FC] border border-slate-300 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedStatus("ALL")}
                    className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      selectedStatus === "ALL"
                        ? "bg-[#AF101A] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ทั้งหมด ({matches.length})
                  </button>
                  <button
                    onClick={() => setSelectedStatus("FILM")}
                    className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      selectedStatus === "FILM"
                        ? "bg-[#AF101A] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Film className="w-3 h-3" />
                    <span>มีเทป HD</span>
                  </button>
                  <button
                    onClick={() => setSelectedStatus("LIVE")}
                    className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      selectedStatus === "LIVE"
                        ? "bg-[#AF101A] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <span>สด (Live)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Main Body Container */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Featured Marquee Match Card */}
          {featuredMatch && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#DC2626]" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    แมตช์ไฮไลท์ประจำสัปดาห์ (FEATURED GAME FILM)
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#DC2626] font-bold">
                  พร้อมจุดมาร์กเกอร์ 42 จังหวะ
                </span>
              </div>

              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Match Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-800 font-mono text-[10px] font-bold tracking-wider uppercase">
                        QUARTERFINAL MARQUEE
                      </span>
                      <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold tracking-wider uppercase ${featuredMatch.resultStatus === "FINAL" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
                        {featuredMatch.resultStatus === "FINAL" ? "ผลรับรองแล้ว" : "ผลยังไม่รับรอง"}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {featuredMatch.tournamentName}
                      </span>
                    </div>

                    {/* Team Matchup & Scores */}
                    <div className="flex items-center gap-4 sm:gap-8 pt-1">
                      {/* Home */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 text-purple-900 font-mono text-base font-black flex items-center justify-center">
                          {featuredMatch.homeTeam?.shortName || "BCC"}
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-bold text-slate-900">
                            {featuredMatch.homeTeam?.name || "Bangkok Christian College"}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">BCC Silom • แชมป์กลุ่ม A</div>
                        </div>
                      </div>

                      {/* Score Box */}
                      <div className="text-center font-mono shrink-0 px-2 sm:px-4 py-1.5 bg-[#F8F9FC] border border-slate-200 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wider">
                          <span className="text-purple-700">{featuredMatch.homeScore ?? 75}</span>
                          <span className="text-slate-400 mx-2">-</span>
                          <span className="text-emerald-700">{featuredMatch.awayScore ?? 63}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">
                          FINAL SCORE
                        </span>
                      </div>

                      {/* Away */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-900 font-mono text-base font-black flex items-center justify-center">
                          {featuredMatch.awayTeam?.shortName || "DS"}
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-bold text-slate-900">
                            {featuredMatch.awayTeam?.name || "Debsirin School"}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">Debsirin • รองแชมป์กลุ่ม B</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-sans pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>21 กันยายน 2026</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>อาคารนิมิบุตร สนามกีฬาแห่งชาติ</span>
                      </span>
                      <span className="text-[#DC2626] font-mono font-bold">
                        MVP: #7 Thanakorn Siriphan (18 PTS, 8 AST)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                    <Link
                      href={`/matches/${featuredMatch.id}/film`}
                      className="px-5 py-3 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>เข้าสู่ห้องดูเทป (GAME FILM ROOM)</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/live"
                        className="flex-1 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition"
                      >
                        <Radio className="w-3.5 h-3.5 text-[#DC2626]" />
                        <span>ถ่ายทอดสด (LIVE)</span>
                      </Link>

                      <Link
                        href={`/official/console/${featuredMatch.id}`}
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition"
                      >
                        <Shield className="w-3.5 h-3.5 text-slate-600" />
                        <span>โต๊ะกรรมการ</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Matches Listing Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-mono text-slate-500">
              <span>แสดง {filteredMatches.length} จาก {matches.length} แมตช์การแข่งขัน</span>
              <span>เรียงตาม: ล่าสุด (Newest First)</span>
            </div>

            {filteredMatches.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl space-y-3">
                <Film className="w-10 h-10 text-slate-400 mx-auto" />
                <div className="text-sm font-bold text-slate-700">
                  ไม่พบแมตช์ที่ตรงกับเงื่อนไขการค้นหา
                </div>
                <p className="text-xs text-slate-500">
                  ลองปรับคำค้นหาหรือเลือกตัวกรองทัวร์นาเมนต์ใหม่
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTournament("ALL");
                    setSelectedStatus("ALL");
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 transition cursor-pointer"
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
                    <div
                      key={match.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 flex flex-col justify-between transition shadow-xs hover:shadow-md"
                    >
                      {/* Top: Tournament & Status */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono text-slate-500 font-bold truncate max-w-[200px]">
                            {match.tournamentName || "TOA Youth Basketball League"}
                          </span>

                          {isLive ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono text-[10px] font-bold shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                              <span>LIVE</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold shrink-0">
                              {match.resultStatus === "FINAL" ? "รับรองแล้ว" : match.resultStatus === "PENDING_APPROVAL" ? "รอรับรอง" : match.status === "SCHEDULED" ? "เร็ว ๆ นี้" : "ผลชั่วคราว"}
                            </span>
                          )}
                        </div>

                        {/* Team Score Box */}
                        <div className="bg-[#F8F9FC] border border-slate-200 rounded-xl p-3.5 space-y-2">
                          {/* Home */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-slate-200 text-slate-800 font-mono text-xs font-bold flex items-center justify-center">
                                {home?.shortName?.substring(0, 3) || "H"}
                              </div>
                              <span className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                                {home?.name || "Home Team"}
                              </span>
                            </div>
                            <span className="text-base font-black font-mono text-slate-900">
                              {match.homeScore ?? "-"}
                            </span>
                          </div>

                          {/* Away */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-slate-200 text-slate-800 font-mono text-xs font-bold flex items-center justify-center">
                                {away?.shortName?.substring(0, 3) || "A"}
                              </div>
                              <span className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                                {away?.name || "Away Team"}
                              </span>
                            </div>
                            <span className="text-base font-black font-mono text-slate-900">
                              {match.awayScore ?? "-"}
                            </span>
                          </div>
                        </div>

                        {/* Venue & Tape Badge */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1 truncate max-w-[180px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>อาคารนิมิบุตร</span>
                          </span>

                          {hasFilm && (
                            <span className="text-[#DC2626] flex items-center gap-1 font-bold shrink-0">
                              <Film className="w-3 h-3" />
                              <span>1080p HD TAPE</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                        <Link
                          href={`/matches/${match.id}/film`}
                          className="w-full py-2.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-xs"
                        >
                          <Film className="w-3.5 h-3.5" />
                          <span>ชมเทปวิเคราะห์เกม (GAME FILM)</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                        </Link>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          {isLive && (
                            <Link
                              href="/live"
                              className="py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold flex items-center justify-center gap-1 transition"
                            >
                              <Radio className="w-3 h-3 text-[#DC2626]" />
                              <span>ดูสด (Live)</span>
                            </Link>
                          )}
                          <Link
                            href={`/official/console/${match.id}`}
                            className={`py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold flex items-center justify-center gap-1 transition ${
                              !isLive ? "col-span-2" : ""
                            }`}
                          >
                            <Shield className="w-3 h-3 text-slate-500" />
                            <span>โต๊ะกรรมการ</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Scout Workflow Guide (Matching design system) */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#DC2626]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                ขั้นตอนการใช้งาน Game Film Room สำหรับโค้ชและแมวมอง
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-6 font-sans">
              ระบบจัดเก็บเทปและมาร์กเกอร์จังหวะเพลย์อัตโนมัติ ช่วยลดเวลาตัดต่อวิดีโอจาก 3 ชั่วโมงเหลือเพียง 10 นาที
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
              <div className="bg-[#F8F9FC] p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 font-mono font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <div className="text-xs font-bold text-slate-900">เลือกแมตช์ที่ต้องการศึกษา</div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  คลิกเข้าสู่ห้องดูเทปของแมตช์ที่ต้องการ ระบบจะโหลดเทป 1080p พร้อมชุดข้อมูลสถิติที่ได้รับการรับรอง
                </p>
              </div>

              <div className="bg-[#F8F9FC] p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-mono font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <div className="text-xs font-bold text-slate-900">กรองช็อตและจังหวะเพลย์</div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ใช้ Filter Drawer กรองดูเฉพาะช็อต 3 แต้ม, แอสซิสต์ หรือบล็อก/สตีล พร้อมคลิกดูคลิปย้อนหลัง -8s ทันที
                </p>
              </div>

              <div className="bg-[#F8F9FC] p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <div className="text-xs font-bold text-slate-900">บันทึกแท็กติก &amp; ส่งออกสถิติ</div>
                <p className="text-xs text-slate-500 leading-relaxed">
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
