"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GameFilmPlayer from "@/components/video/GameFilmPlayer";
import DigitalPlayerPassModal, { DigitalPassData } from "@/components/athlete/DigitalPlayerPassModal";
import { mockMatch, mockMatches, mockTeams } from "@/lib/db/seed-data";
import { Match, MatchEvent } from "@/lib/types";
import {
  Film,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Shield,
  Activity,
  FileText,
  Share2,
  Printer,
  ChevronRight,
  Radio,
  SlidersHorizontal,
  CheckCircle2,
  Trophy,
  Users,
  Eye,
  ArrowLeft,
  Flame,
  BadgeCheck,
  Send,
  PlusCircle,
  Tag,
  Swords,
  Info,
} from "lucide-react";

interface CoachNote {
  id: string;
  quarter: number;
  timeDisplay: string;
  author: string;
  role: "Head Coach" | "Scout" | "Video Analyst";
  teamTag: "BCC" | "DS" | "GENERAL";
  content: string;
  tag: string;
  createdAt: string;
}

const initialCoachNotes: CoachNote[] = [
  {
    id: "note-1",
    quarter: 1,
    timeDisplay: "08:45 (00:42)",
    author: "โค้ชธีรพงษ์ (BCC Head Coach)",
    role: "Head Coach",
    teamTag: "BCC",
    tag: "3PT SPACING",
    content: "การเซ็ต Spacing ใน Half-Court และจังหวะไดรฟ์-คิกของ #7 ธนกร ดึงตัวประกบฝั่ง Help-side เปิดโอกาสยิง 3 แต้มโล่งๆ ได้สมบูรณ์แบบ",
    createdAt: "2026-09-21 14:18",
  },
  {
    id: "note-2",
    quarter: 2,
    timeDisplay: "04:15 (02:18)",
    author: "แมวมอง กิตติศักดิ์ (TBA Pro Scout)",
    role: "Scout",
    teamTag: "DS",
    tag: "TRANSITION DEF",
    content: "เทพศิรินทร์ปรับใช้ 2-3 Zone Trap ตัดบอลเปลี่ยนเป็นแต้มฟาสต์เบรกได้ 3 เพลย์ติด แต่ยังมีจุดอ่อนเรื่องรีบาวด์ฝั่งเกมรับ (Defensive Rebound)",
    createdAt: "2026-09-21 14:40",
  },
  {
    id: "note-3",
    quarter: 4,
    timeDisplay: "06:10 (04:35)",
    author: "ฝ่ายวิเคราะห์วิดีโอ (StatCourt Analyst)",
    role: "Video Analyst",
    teamTag: "GENERAL",
    tag: "TURNING POINT",
    content: "ช่วงรัน 11-0 ของ BCC ช่วงต้นควอเตอร์ 4 เริ่มจากสตีลของ #15 ภูริภัทร และการยิงระยะไกล 2 ลูกติดของ #24 กิตติพงษ์ ปิดเกมได้เด็ดขาด",
    createdAt: "2026-09-21 15:15",
  },
];

export default function MatchFilmReviewPage({
  params,
}: {
  params: { matchId: string };
}) {
  const matchId = params.matchId;

  // Active match data with fallback
  const [matchData, setMatchData] = useState<Match>(() => {
    const found = mockMatches.find((m) => m.id === matchId);
    return found || mockMatch;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"CLIPS" | "NOTES" | "BOXSCORE" | "MATCHUP">("CLIPS");
  const [clipFilter, setClipFilter] = useState<"ALL" | "3PT" | "AST" | "DEF" | "FOUL">("ALL");
  const [coachNotes, setCoachNotes] = useState<CoachNote[]>(initialCoachNotes);
  const [copiedLink, setCopiedLink] = useState(false);

  // New Note form state
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteQuarter, setNewNoteQuarter] = useState<number>(1);
  const [newNoteTag, setNewNoteTag] = useState("TACTICAL");
  const [newNoteTeam, setNewNoteTeam] = useState<"BCC" | "DS" | "GENERAL">("BCC");

  // Athlete pass modal state
  const [selectedAthletePass, setSelectedAthletePass] = useState<Partial<DigitalPassData> | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Fetch real match data if available from API
  useEffect(() => {
    let isMounted = true;
    async function fetchMatch() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/matches/${matchId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && isMounted) {
            setMatchData(json.data);
          }
        }
      } catch {
        // Fallback remains active
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchMatch();
    return () => {
      isMounted = false;
    };
  }, [matchId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAddCoachNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: CoachNote = {
      id: `note-${Date.now()}`,
      quarter: newNoteQuarter,
      timeDisplay: `Q${newNoteQuarter} Note`,
      author: "ผู้ฝึกสอน (Coaching Staff)",
      role: "Head Coach",
      teamTag: newNoteTeam,
      tag: newNoteTag.toUpperCase(),
      content: newNoteText.trim(),
      createdAt: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
    };

    setCoachNotes([newNote, ...coachNotes]);
    setNewNoteText("");
  };

  const handleOpenPlayerPass = (athleteId: string, fullName: string, jersey: number, school: string) => {
    setSelectedAthletePass({
      athleteId,
      fullName,
      fullNameEn: fullName,
      jerseyNumber: jersey,
      schoolName: school,
      verifiedAge: 17,
      eligibleCategory: "U18 ชาย (Thailand National Youth)",
      tcasBatch: "TCAS69 (รอบที่ 1 แฟ้มสะสมผลงานช้างเผือก)",
      status: "ACTIVE",
      issuedBy: "สมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT)",
    });
    setIsPassModalOpen(true);
  };

  const homeTeam = matchData.homeTeam || mockTeams[0];
  const awayTeam = matchData.awayTeam || mockTeams[1];
  const events = matchData.events || [];

  // Filtered play events for the breakdown table
  const filteredEvents = events.filter((ev) => {
    if (clipFilter === "3PT") return ev.eventType === "THREE_POINT_MADE";
    if (clipFilter === "AST") return ev.eventType === "ASSIST";
    if (clipFilter === "DEF") return ev.eventType === "BLOCK" || ev.eventType === "STEAL";
    if (clipFilter === "FOUL") return ev.eventType === "PERSONAL_FOUL" || ev.eventType === "TURNOVER";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-16 max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <Link href="/" className="hover:text-white transition">หน้าแรก</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/tournaments" className="hover:text-white transition">ทัวร์นาเมนต์</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-amber-400 font-bold">GAME FILM ROOM (เทปวิเคราะห์แมตช์)</span>
          </div>

          {/* Quick links to Live and Official Table */}
          <div className="flex items-center gap-2">
            <Link
              href="/live"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-sans text-xs font-bold transition shadow-sm"
              title="สลับไปยังศูนย์ถ่ายทอดสดแบบ Real-time"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span>ชมถ่ายทอดสด (LIVE HUB)</span>
            </Link>

            <Link
              href={`/official/console/${matchId}`}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-sans text-xs font-bold transition"
            >
              <Shield className="w-3.5 h-3.5 text-brand-primary" />
              <span className="hidden sm:inline">โต๊ะกรรมการ (OFFICIAL)</span>
            </Link>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-sans text-xs transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? "คัดลอกแล้ว!" : "แชร์เทป"}</span>
            </button>
          </div>
        </div>

        {/* Match Header Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tournament & Context */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-brand-primary/20 border border-brand-primary/40 text-brand-primary font-mono text-[10px] font-black tracking-widest uppercase">
                  HUDL-GRADE TAPE
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-mono text-[10px] font-bold">
                  VERIFIED STATS
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  MATCH ID: {matchId}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {matchData.tournamentName || "TOA Youth Basketball League Thailand 2026 - รอบ 8 ทีมสุดท้าย"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-sans pt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>21 กันยายน 2026</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>อาคารนิมิบุตร สนามกีฬาแห่งชาติ กรุงเทพฯ</span>
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                  <Film className="w-3.5 h-3.5" />
                  <span>ความยาวเทป: 1080p HD (60 FPS)</span>
                </span>
              </div>
            </div>

            {/* Final Match Score Card */}
            <div className="flex items-center gap-4 sm:gap-6 bg-slate-950/90 border border-slate-800/80 rounded-xl px-4 py-3 shrink-0">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-300 truncate max-w-[130px] sm:max-w-none">
                  {homeTeam.shortName || homeTeam.name}
                </div>
                <div className="text-2xl font-black font-mono text-red-400">
                  {matchData.homeScore ?? 75}
                </div>
              </div>

              <div className="text-center px-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
                  FT
                </span>
                <span className="text-xs font-mono text-slate-600 font-bold">VS</span>
              </div>

              <div className="text-left">
                <div className="text-xs font-bold text-slate-300 truncate max-w-[130px] sm:max-w-none">
                  {awayTeam.shortName || awayTeam.name}
                </div>
                <div className="text-2xl font-black font-mono text-blue-400">
                  {matchData.awayScore ?? 63}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY FILM PLAYER COMPONENT */}
        <section className="mb-8">
          <GameFilmPlayer
            videoUrl={matchData.rawVideoUrl}
            events={events}
            homeTeamName={homeTeam.name}
            awayTeamName={awayTeam.name}
            matchTitle={matchData.tournamentName || "Quarterfinal Game Film Review"}
          />
        </section>

        {/* Scout & Coaching Staff Review Console (Tabs) */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Navigation Bar */}
          <div className="flex border-b border-slate-800 bg-slate-950/80 overflow-x-auto">
            <button
              onClick={() => setActiveTab("CLIPS")}
              className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "CLIPS"
                  ? "border-brand-primary text-white bg-slate-900/60"
                  : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/30"
              }`}
            >
              <Film className="w-4 h-4 text-brand-primary" />
              <span>CLICK-TO-CLIP BREAKDOWN ({events.length} จังหวะ)</span>
            </button>

            <button
              onClick={() => setActiveTab("NOTES")}
              className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "NOTES"
                  ? "border-brand-primary text-white bg-slate-900/60"
                  : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/30"
              }`}
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>COACH TELESTRATION NOTES ({coachNotes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("BOXSCORE")}
              className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "BOXSCORE"
                  ? "border-brand-primary text-white bg-slate-900/60"
                  : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/30"
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>SCOUTING BOX SCORE</span>
            </button>

            <button
              onClick={() => setActiveTab("MATCHUP")}
              className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "MATCHUP"
                  ? "border-brand-primary text-white bg-slate-900/60"
                  : "border-transparent text-slate-400 hover:text-white hover:bg-slate-900/30"
              }`}
            >
              <Swords className="w-4 h-4 text-blue-400" />
              <span>KEY MATCHUP DUEL</span>
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {/* TAB 1: Click-to-Clip Breakdown */}
            {activeTab === "CLIPS" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>รายการเพลย์สำคัญที่มาร์กเกอร์บนแถบเวลาวิดีโอ (Event Marker Log)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      คลิกที่แต่ละจังหวะเพื่อย้อนดูเทป โดยระบบจะกรอเวลาถอยหลัง 8 วินาที (-8s lead-in) อัตโนมัติ
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setClipFilter("ALL")}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer ${
                        clipFilter === "ALL" ? "bg-slate-700 text-white font-bold" : "bg-slate-800/80 text-slate-400 hover:text-white"
                      }`}
                    >
                      ทั้งหมด ({events.length})
                    </button>
                    <button
                      onClick={() => setClipFilter("3PT")}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer flex items-center gap-1 ${
                        clipFilter === "3PT" ? "bg-red-600 text-white font-bold" : "bg-slate-800/80 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span>3-Pointers</span>
                    </button>
                    <button
                      onClick={() => setClipFilter("AST")}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer flex items-center gap-1 ${
                        clipFilter === "AST" ? "bg-slate-600 text-white font-bold" : "bg-slate-800/80 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                      <span>Assists</span>
                    </button>
                    <button
                      onClick={() => setClipFilter("DEF")}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer flex items-center gap-1 ${
                        clipFilter === "DEF" ? "bg-emerald-600 text-white font-bold" : "bg-slate-800/80 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-300" />
                      <span>Block / Steal</span>
                    </button>
                  </div>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredEvents.map((ev) => {
                    const isBcc = ev.teamId === "team-bcc";
                    const is3pt = ev.eventType === "THREE_POINT_MADE";
                    const isDef = ev.eventType === "BLOCK" || ev.eventType === "STEAL";

                    return (
                      <div
                        key={ev.id}
                        className="bg-slate-950/70 border border-slate-800 hover:border-slate-600 rounded-xl p-3.5 transition flex flex-col justify-between group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center ${
                                isBcc
                                  ? "bg-purple-900/60 text-purple-300 border border-purple-700/60"
                                  : "bg-emerald-900/60 text-emerald-300 border border-emerald-700/60"
                              }`}
                            >
                              #{ev.jerseyNumber ?? "-"}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-amber-400 transition truncate max-w-[160px]">
                                {ev.athleteName || "Unknown Athlete"}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {isBcc ? "BCC Silom" : "Debsirin"}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              is3pt
                                ? "bg-red-950/80 text-red-400 border border-red-800"
                                : isDef
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {ev.eventType.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Q{ev.quarter} • {ev.gameClockDisplay}</span>
                          </span>

                          <span className="text-amber-400 font-bold text-[11px]">
                            เทป: {ev.videoElapsedSec}s
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Coach Tactical Telestration Notes */}
            {activeTab === "NOTES" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Notes List (2 Cols) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>บันทึกแท็กติกและการวิเคราะห์เทปโดยทีมงานโค้ช</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      รวม {coachNotes.length} บันทึก
                    </span>
                  </div>

                  <div className="space-y-3">
                    {coachNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                              {note.tag}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                note.teamTag === "BCC"
                                  ? "bg-purple-950/80 text-purple-300 border border-purple-800"
                                  : note.teamTag === "DS"
                                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                                  : "bg-slate-800 text-slate-300 border border-slate-700"
                              }`}
                            >
                              {note.teamTag}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {note.author}
                            </span>
                          </div>

                          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                            <span>{note.timeDisplay}</span>
                            <span>•</span>
                            <span>{note.createdAt}</span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                          {note.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Note Form (1 Col) */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 sm:p-5 h-fit space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <PlusCircle className="w-4 h-4 text-brand-primary" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      บันทึกข้อสังเกตแท็กติกใหม่
                    </span>
                  </div>

                  <form onSubmit={handleAddCoachNote} className="space-y-3 font-sans text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">
                        ทีมเป้าหมาย
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["BCC", "DS", "GENERAL"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setNewNoteTeam(t)}
                            className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition cursor-pointer ${
                              newNoteTeam === t
                                ? "bg-brand-primary border-red-500 text-white shadow"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-400 block mb-1 font-semibold">
                          ช่วงควอเตอร์
                        </label>
                        <select
                          value={newNoteQuarter}
                          onChange={(e) => setNewNoteQuarter(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-primary font-mono"
                        >
                          <option value={1}>Quarter 1</option>
                          <option value={2}>Quarter 2</option>
                          <option value={3}>Quarter 3</option>
                          <option value={4}>Quarter 4</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1 font-semibold">
                          หมวดหมู่แท็กติก
                        </label>
                        <select
                          value={newNoteTag}
                          onChange={(e) => setNewNoteTag(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-primary font-mono"
                        >
                          <option value="SPACING">SPACING</option>
                          <option value="PICK & ROLL">PICK & ROLL</option>
                          <option value="ZONE DEF">ZONE DEF</option>
                          <option value="FASTBREAK">FASTBREAK</option>
                          <option value="TURNOVER">TURNOVER</option>
                          <option value="TACTICAL">TACTICAL</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">
                        ข้อความวิเคราะห์เทป
                      </label>
                      <textarea
                        rows={4}
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="ระบุข้อสังเกตการเล่น ตำแหน่งการยืน หรือข้อผิดพลาดที่ต้องนำไปซ้อมปรับปรุง..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="w-full py-2 rounded-lg bg-brand-primary hover:bg-red-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>บันทึกโน้ตแมวมอง</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 3: Advanced Scout Box Score */}
            {activeTab === "BOXSCORE" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>สถิติผู้เล่นเชิงลึกสำหรับการคัดเลือกตัว (Scouting Box Score)</span>
                  </h3>
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") window.print();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold font-mono text-slate-300 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PRINT SCOUT REPORT</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
                  {/* Home Team Box Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-purple-950/60 border border-purple-800/80 px-4 py-2 rounded-xl text-white font-bold">
                      <span>BANGKOK CHRISTIAN COLLEGE (BCC)</span>
                      <span className="text-purple-300">75 PTS</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                      <table className="w-full text-left">
                        <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <tr>
                            <th className="py-2 px-3">#</th>
                            <th className="py-2 px-3">นักกีฬา</th>
                            <th className="py-2 px-2 text-center">PTS</th>
                            <th className="py-2 px-2 text-center">REB</th>
                            <th className="py-2 px-2 text-center">AST</th>
                            <th className="py-2 px-2 text-center">FG%</th>
                            <th className="py-2 px-2 text-center">PASS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-[11px]">
                          {[
                            { id: "ath-1", no: 7, name: "Thanakorn Siriphan", pts: 18, reb: 3, ast: 8, fg: "54.5%" },
                            { id: "ath-4", no: 24, name: "Kittipong Rattana.", pts: 21, reb: 7, ast: 4, fg: "62.5%" },
                            { id: "ath-2", no: 11, name: "Chayanon Wattana", pts: 12, reb: 2, ast: 3, fg: "45.0%" },
                            { id: "ath-5", no: 15, name: "Bhuripat Kaewmanee", pts: 14, reb: 9, ast: 1, fg: "50.0%" },
                            { id: "ath-3", no: 42, name: "Supanut Charoenrat", pts: 10, reb: 11, ast: 2, fg: "48.0%" },
                          ].map((row) => (
                            <tr key={row.no} className="hover:bg-slate-900/60 transition">
                              <td className="py-2 px-3 font-bold text-slate-400">{row.no}</td>
                              <td className="py-2 px-3 text-white font-sans font-bold">
                                <Link
                                  href={`/athlete/${row.id}`}
                                  className="hover:text-amber-400 transition"
                                >
                                  {row.name}
                                </Link>
                              </td>
                              <td className="py-2 px-2 text-center text-red-400 font-bold">{row.pts}</td>
                              <td className="py-2 px-2 text-center text-slate-300">{row.reb}</td>
                              <td className="py-2 px-2 text-center text-slate-300">{row.ast}</td>
                              <td className="py-2 px-2 text-center text-emerald-400">{row.fg}</td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => handleOpenPlayerPass(row.id, row.name, row.no, "Bangkok Christian College")}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition inline-flex items-center cursor-pointer"
                                  title="ดู Digital Player Pass"
                                >
                                  <BadgeCheck className="w-3.5 h-3.5 text-brand-primary" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Away Team Box Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-800/80 px-4 py-2 rounded-xl text-white font-bold">
                      <span>DEBSIRIN SCHOOL (DS)</span>
                      <span className="text-emerald-300">63 PTS</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                      <table className="w-full text-left">
                        <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <tr>
                            <th className="py-2 px-3">#</th>
                            <th className="py-2 px-3">นักกีฬา</th>
                            <th className="py-2 px-2 text-center">PTS</th>
                            <th className="py-2 px-2 text-center">REB</th>
                            <th className="py-2 px-2 text-center">AST</th>
                            <th className="py-2 px-2 text-center">FG%</th>
                            <th className="py-2 px-2 text-center">PASS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-[11px]">
                          {[
                            { id: "ath-8", no: 23, name: "Nattapat Sukprasert", pts: 22, reb: 9, ast: 2, fg: "52.9%" },
                            { id: "ath-6", no: 10, name: "Supacheep Rungrueang", pts: 15, reb: 4, ast: 6, fg: "46.2%" },
                            { id: "ath-7", no: 34, name: "Kasidej Phongpanit", pts: 11, reb: 8, ast: 1, fg: "41.7%" },
                            { id: "ath-9", no: 5, name: "Witchapon Chaiyaphat", pts: 9, reb: 3, ast: 4, fg: "37.5%" },
                            { id: "ath-10", no: 14, name: "Pattarapon Saetang", pts: 6, reb: 5, ast: 1, fg: "33.3%" },
                          ].map((row) => (
                            <tr key={row.no} className="hover:bg-slate-900/60 transition">
                              <td className="py-2 px-3 font-bold text-slate-400">{row.no}</td>
                              <td className="py-2 px-3 text-white font-sans font-bold">
                                <Link
                                  href={`/athlete/${row.id}`}
                                  className="hover:text-amber-400 transition"
                                >
                                  {row.name}
                                </Link>
                              </td>
                              <td className="py-2 px-2 text-center text-blue-400 font-bold">{row.pts}</td>
                              <td className="py-2 px-2 text-center text-slate-300">{row.reb}</td>
                              <td className="py-2 px-2 text-center text-slate-300">{row.ast}</td>
                              <td className="py-2 px-2 text-center text-emerald-400">{row.fg}</td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => handleOpenPlayerPass(row.id, row.name, row.no, "Debsirin School")}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition inline-flex items-center cursor-pointer"
                                  title="ดู Digital Player Pass"
                                >
                                  <BadgeCheck className="w-3.5 h-3.5 text-brand-primary" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Key Matchup Duel */}
            {activeTab === "MATCHUP" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Swords className="w-4 h-4 text-blue-400" />
                    <span>การประชันตัวต่อตัวตำแหน่งการ์ดจ่าย (Point Guard Spotlight Matchup)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    เปรียบเทียบสถิติและประสิทธิภาพการสร้างสรรค์เกมตลอดทั้งเทปวิดีโอ
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                  {/* Player A */}
                  <div className="bg-slate-950 border border-purple-800/60 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-700 flex items-center justify-center font-mono text-lg font-black text-purple-300">
                          #7
                        </div>
                        <div>
                          <div className="text-base font-bold text-white">Thanakorn Siriphan</div>
                          <div className="text-xs text-slate-400 font-mono">BCC Silom • Point Guard • 184 cm</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                        GAME MVP
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">PTS</div>
                        <div className="text-lg font-bold text-red-400">18</div>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">AST</div>
                        <div className="text-lg font-bold text-amber-400">8</div>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">FG%</div>
                        <div className="text-lg font-bold text-emerald-400">54.5%</div>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">+/-</div>
                        <div className="text-lg font-bold text-purple-400">+14</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                      💡 <strong>จุดเด่นในเทป:</strong> มีวิสัยทัศน์ส่งบอลทะลุช่องยอดเยี่ยม การอ่านกับดัก Trap ของคู่แข่งทำได้สุขุม ไม่เสีย Turnover ง่าย
                    </div>
                  </div>

                  {/* Player B */}
                  <div className="bg-slate-950 border border-emerald-800/60 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-700 flex items-center justify-center font-mono text-lg font-black text-emerald-300">
                          #10
                        </div>
                        <div>
                          <div className="text-base font-bold text-white">Supacheep Rungrueang</div>
                          <div className="text-xs text-slate-400 font-mono">Debsirin • Point Guard • 181 cm</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs font-bold">
                        FASTEST PACE
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">PTS</div>
                        <div className="text-lg font-bold text-blue-400">15</div>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">AST</div>
                        <div className="text-lg font-bold text-amber-400">6</div>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">FG%</div>
                        <div className="text-lg font-bold text-emerald-400">46.2%</div>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-xs text-slate-400">+/-</div>
                        <div className="text-lg font-bold text-slate-400">-8</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                      💡 <strong>จุดเด่นในเทป:</strong> สปีดการเล่นฟาสต์เบรกเร็วมาก การสร้างจังหวะไดรฟ์เข้าหาห่วงสร้างปัญหาให้เกมรับวงในได้ดี
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Digital Player Pass Modal */}
        <DigitalPlayerPassModal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          playerData={selectedAthletePass || undefined}
        />
      </main>

      <Footer />
    </div>
  );
}
