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
  SlidersHorizontal,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Shield,
  Play,
  Trophy,
  Users,
  Eye,
  ChevronRight,
  Flame,
  Radio,
  CheckCircle2,
  FileText,
  Activity,
  ArrowRight,
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
    // Search query filter
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

    // Tournament filter
    if (selectedTournament !== "ALL" && m.tournamentId !== selectedTournament) {
      return false;
    }

    // Status filter
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
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-16 max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-4">
          <Link href="/" className="hover:text-white transition">หน้าแรก</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link href="/tournaments" className="hover:text-white transition">ทัวร์นาเมนต์</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-amber-400 font-bold">MATCH CENTRAL & GAME FILM</span>
        </div>

        {/* Page Hero Header */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-[#0A1020] border border-slate-800 p-6 sm:p-8 mb-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-primary font-mono text-xs font-bold">
              <Film className="w-3.5 h-3.5" />
              <span>HUDL-GRADE GAME FILM ARCHIVE & SCOUT ROOM</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              ศูนย์รวมแมตช์การแข่งขัน <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-amber-400 to-amber-200">
                และคลังเทปวิดีโอย้อนหลัง
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
              เลือกชมเทปบันทึกการแข่งขันแบบเจาะลึก (Click-to-Clip Breakdown), กรองดูเฉพาะช็อต 3PT, แอสซิสต์,
              และช็อตเกมรับของนักกีฬา พร้อมบันทึกโน้ตแท็กติกสำหรับทีมงานโค้ชและแมวมอง
            </p>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>{matches.length} แมตช์พร้อมเทป HD</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>สถิติโต๊ะกลาง FIBA สากล</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                <span>Click-to-Clip Marker (-8s Replay)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Marquee Match Card */}
        {featuredMatch && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-brand-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
                  แมตช์ไฮไลท์ประจำสัปดาห์ (FEATURED GAME FILM)
                </h2>
              </div>
              <span className="text-xs font-mono text-amber-400">
                พร้อมจุดมาร์กเกอร์ 42 จังหวะ
              </span>
            </div>

            <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 border border-purple-900/50 hover:border-purple-600/80 rounded-2xl p-5 sm:p-6 transition shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Match Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-primary text-white font-mono text-[10px] font-black tracking-widest uppercase">
                      QUARTERFINAL MARQUEE
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono text-[10px] font-bold">
                      VERIFIED FILM
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {featuredMatch.tournamentName}
                    </span>
                  </div>

                  {/* Teams vs Score */}
                  <div className="flex items-center gap-4 sm:gap-8 pt-1">
                    {/* Home Team */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-900/80 border border-purple-600 flex items-center justify-center font-mono text-lg font-black text-purple-200">
                        {featuredMatch.homeTeam?.shortName || "BCC"}
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-black text-white">
                          {featuredMatch.homeTeam?.name || "Bangkok Christian College"}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">BCC Silom • ชนะเลิศกลุ่ม A</div>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="text-center font-mono shrink-0">
                      <div className="text-2xl sm:text-3xl font-black text-white tracking-wider">
                        <span className="text-purple-300">{featuredMatch.homeScore ?? 75}</span>
                        <span className="text-slate-600 mx-2">-</span>
                        <span className="text-emerald-300">{featuredMatch.awayScore ?? 63}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        FINAL SCORE
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-900/80 border border-emerald-600 flex items-center justify-center font-mono text-lg font-black text-emerald-200">
                        {featuredMatch.awayTeam?.shortName || "DS"}
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-black text-white">
                          {featuredMatch.awayTeam?.name || "Debsirin School"}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">Debsirin • รองชนะเลิศกลุ่ม B</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-sans pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>21 กันยายน 2026</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>อาคารนิมิบุตร สนามกีฬาแห่งชาติ</span>
                    </span>
                    <span className="text-amber-400 font-mono font-bold">
                      MVP: #7 Thanakorn Siriphan (18 PTS, 8 AST)
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                  <Link
                    href={`/matches/${featuredMatch.id}/film`}
                    className="px-5 py-3 rounded-xl bg-brand-primary hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-brand-primary/25 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>เข้าสู่ห้องดูเทป (GAME FILM ROOM)</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/live"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Radio className="w-3.5 h-3.5 text-red-400" />
                      <span>ศูนย์ถ่ายทอดสด (LIVE)</span>
                    </Link>

                    <Link
                      href={`/official/console/${featuredMatch.id}`}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Shield className="w-3.5 h-3.5 text-brand-primary" />
                      <span>โต๊ะกรรมการ</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อทีม, โรงเรียน หรือรหัสแมตช์..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
              />
            </div>

            {/* Filter by Tournament */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs text-slate-400 font-mono whitespace-nowrap shrink-0">
                ทัวร์นาเมนต์:
              </span>
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary font-sans shrink-0"
              >
                <option value="ALL">ทุกทัวร์นาเมนต์ (All Tournaments)</option>
                {mockTournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              {/* Filter by Status */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setSelectedStatus("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    selectedStatus === "ALL"
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ทั้งหมด ({matches.length})
                </button>
                <button
                  onClick={() => setSelectedStatus("FILM")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1 ${
                    selectedStatus === "FILM"
                      ? "bg-brand-primary text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Film className="w-3 h-3" />
                  <span>มีเทป HD</span>
                </button>
                <button
                  onClick={() => setSelectedStatus("LIVE")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1 ${
                    selectedStatus === "LIVE"
                      ? "bg-red-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <span>สด (Live)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>แสดง {filteredMatches.length} จาก {matches.length} แมตช์การแข่งขัน</span>
            <span>จัดเรียงตาม: ล่าสุด (Newest First)</span>
          </div>

          {filteredMatches.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
              <Film className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300">
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
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
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
                    className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition shadow-xl group hover:shadow-2xl hover:bg-slate-900"
                  >
                    {/* Top: Tournament & Status */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                          {match.tournamentName || "TOA Youth Basketball League"}
                        </span>

                        {isLive ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950 border border-red-700 text-red-400 font-mono text-[10px] font-bold shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span>LIVE</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px] font-bold shrink-0">
                            FINAL
                          </span>
                        )}
                      </div>

                      {/* Teams & Score Box */}
                      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
                        {/* Home Team */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-200">
                              {home?.shortName || "H"}
                            </div>
                            <span className="text-xs font-bold text-white truncate max-w-[170px]">
                              {home?.name || "Home Team"}
                            </span>
                          </div>
                          <span className="text-base font-black font-mono text-white">
                            {match.homeScore ?? "-"}
                          </span>
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-200">
                              {away?.shortName || "A"}
                            </div>
                            <span className="text-xs font-bold text-white truncate max-w-[170px]">
                              {away?.name || "Away Team"}
                            </span>
                          </div>
                          <span className="text-base font-black font-mono text-white">
                            {match.awayScore ?? "-"}
                          </span>
                        </div>
                      </div>

                      {/* Venue & Metadata */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1 truncate max-w-[180px]">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>อาคารนิมิบุตร</span>
                        </span>

                        {hasFilm && (
                          <span className="text-amber-400 flex items-center gap-1 font-bold shrink-0">
                            <Film className="w-3 h-3" />
                            <span>1080p TAPE</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-2">
                      <Link
                        href={`/matches/${match.id}/film`}
                        className="w-full py-2.5 rounded-xl bg-brand-primary/15 hover:bg-brand-primary border border-brand-primary/40 hover:border-transparent text-brand-primary hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer group-hover:bg-brand-primary group-hover:text-white"
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>ชมเทปวิเคราะห์เกม (GAME FILM)</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </Link>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        {isLive && (
                          <Link
                            href="/live"
                            className="py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-bold flex items-center justify-center gap-1 transition"
                          >
                            <Radio className="w-3 h-3 text-red-400" />
                            <span>ดูสด (Live)</span>
                          </Link>
                        )}
                        <Link
                          href={`/official/console/${match.id}`}
                          className={`py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold flex items-center justify-center gap-1 transition ${
                            !isLive ? "col-span-2" : ""
                          }`}
                        >
                          <Shield className="w-3 h-3 text-brand-primary" />
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

        {/* Scout & Coaching Staff Video Workflow Info */}
        <section className="mt-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              ขั้นตอนการใช้งาน Game Film Room สำหรับโค้ชและแมวมอง
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-6 font-sans">
            ระบบจัดเก็บเทปและมาร์กเกอร์จังหวะเพลย์อัตโนมัติ ช่วยลดเวลาตัดต่อวิดีโอจาก 3 ชั่วโมงเหลือเพียง 10 นาที
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800 text-red-400 font-mono font-bold flex items-center justify-center text-sm">
                1
              </div>
              <div className="text-xs font-bold text-white">เลือกแมตช์ที่ต้องการศึกษา</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                คลิกเข้าสู่ห้องดูเทปของแมตช์ที่ต้องการ ระบบจะโหลดเทป 1080p พร้อมชุดข้อมูลสถิติที่ได้รับการรับรอง
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 font-mono font-bold flex items-center justify-center text-sm">
                2
              </div>
              <div className="text-xs font-bold text-white">กรองช็อตและจังหวะเพลย์</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                ใช้ Filter Drawer กรองดูเฉพาะช็อต 3 แต้ม, แอสซิสต์ หรือบล็อก/สตีล พร้อมคลิกดูคลิปย้อนหลัง -8s ทันที
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono font-bold flex items-center justify-center text-sm">
                3
              </div>
              <div className="text-xs font-bold text-white">บันทึกแท็กติก & ส่งออกสถิติ</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                พิมพ์บันทึกข้อคิดเห็นของโค้ชลงใน Telestration Notes และพิมพ์รายงานสถิติ FIBA สำหรับเตรียมความพร้อมก่อนแข่ง
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
