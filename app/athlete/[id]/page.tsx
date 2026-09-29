"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Lock,
  Film,
  GraduationCap,
  Eye,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Building,
  School,
  FileText,
  Download,
  Calendar,
  Sparkles,
  ArrowRight,
  Ruler,
  Bookmark,
  Mail,
  UserCheck,
} from "lucide-react";
import { canEditAthleteProfile, canViewAthletePrivateData } from "@/lib/auth/rbac";
import AthleteActivityIndex from "@/components/athlete/AthleteActivityIndex";
import NbaAthleteHero from "@/components/athlete/NbaAthleteHero";
import AthleteOverview from "@/components/athlete/AthleteOverview";
import AthleteEffTrend from "@/components/athlete/AthleteEffTrend";
import AthleteCareerStats from "@/components/athlete/AthleteCareerStats";
import AthleteGameLogs from "@/components/athlete/AthleteGameLogs";
import AthleteTcasPortfolio from "@/components/athlete/AthleteTcasPortfolio";
import EditAthleteProfileModal from "@/components/athlete/EditAthleteProfileModal";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  mockAthleteProfiles,
  mockLeaderboardAthletes,
  mockMatchEvents,
} from "@/lib/db/seed-data";
import { AthleteProfile, AthleteSeasonStats, MatchEvent } from "@/lib/types";
import PricingModal from "@/components/premium/PricingModal";
import ShotChart from "@/components/athlete/ShotChart";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import HighlightReelGeneratorModal from "@/components/scout/HighlightReelGeneratorModal";
import AcademicTrackerModal from "@/components/athlete/AcademicTrackerModal";
import RecruiterViewsModal from "@/components/athlete/RecruiterViewsModal";
import DigitalPlayerPassModal from "@/components/athlete/DigitalPlayerPassModal";
import StatsLineageModal from "@/components/athlete/StatsLineageModal";
import { mockAcademicRecords, mockTargetUniversities } from "@/lib/db/phase2-data";

export default function AthleteProfilePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { tab?: string };
}) {
  const athleteId = params.id;
  const initialProfile = mockAthleteProfiles[athleteId];

  if (!initialProfile) {
    notFound();
  }

  const initialStats =
    mockLeaderboardAthletes.find((s) => s.athleteId === initialProfile.id) ||
    mockLeaderboardAthletes[0];

  const { currentUser } = useAuthStore();
  const isPro = currentUser.tier === "PRO";
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const [athlete, setAthlete] = useState<AthleteProfile>(initialProfile);
  const [stats, setStats] = useState<AthleteSeasonStats>(initialStats);
  const [events, setEvents] = useState<MatchEvent[]>(mockMatchEvents);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [allSeasons, setAllSeasons] = useState<string[]>(["2026", "2025"]);
  const [selectedSeason, setSelectedSeason] = useState<string>("2026");
  const [rawSeasonStatsList, setRawSeasonStatsList] = useState<any[]>([]);

  // RBAC Permission checks for athlete profile
  const isOwner = canEditAthleteProfile(currentUser, athleteId, athlete?.userId);
  const canEdit = isOwner;
  const canViewPrivate = canViewAthletePrivateData(currentUser, athleteId);
  const isCoach = currentUser.role === "COACH";
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Phase 2 Modals State
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
  const [isRecruiterViewsModalOpen, setIsRecruiterViewsModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLineageModalOpen, setIsLineageModalOpen] = useState(false);

  const getTabFromParam = useCallback((t?: string) => {
    const upper = t?.toUpperCase();
    if (upper === "CAREER" || upper === "CAREER_STATS") return "CAREER_STATS";
    if (upper === "ACTIVITY" || upper === "EXPERIENCE") return "ACTIVITY";
    if (upper === "SHOT_CHART" || upper === "SHOT") return "SHOT_CHART";
    if (upper === "EFF_TREND" || upper === "TREND") return "EFF_TREND";
    if (upper === "LOGS") return "LOGS";
    if (upper === "LINEAGE" || upper === "PROVENANCE") return "LINEAGE";
    if (isOwner && upper === "TCAS") return "TCAS";
    if (isOwner && (upper === "ACADEMIC" || upper === "ACADEMICS" || upper === "GPA")) return "ACADEMICS";
    return "OVERVIEW";
  }, [isOwner]);

  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "CAREER_STATS" | "ACTIVITY" | "SHOT_CHART" | "EFF_TREND" | "LOGS" | "TCAS" | "ACADEMICS" | "LINEAGE"
  >(() => getTabFromParam(searchParams?.tab));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const tab = sp.get("tab")?.toUpperCase();
      if (tab) {
        setActiveTab(getTabFromParam(tab));
      }
    }
  }, [isOwner, getTabFromParam]);

  useEffect(() => {
    if (!isOwner && (activeTab === "TCAS" || activeTab === "ACADEMICS")) {
      setActiveTab("OVERVIEW");
    }
  }, [isOwner, activeTab]);

  useEffect(() => {
    async function loadAthleteData() {
      try {
        const res = await fetch(`/api/athletes/${athleteId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const d = json.data;
            setAthlete({
              id: d.id,
              userId: d.userId,
              firstName: d.firstName,
              lastName: d.lastName,
              birthDate: typeof d.birthDate === "string" ? d.birthDate : new Date(d.birthDate).toISOString().split("T")[0],
              primaryPosition: d.primaryPosition,
              secondaryPosition: d.secondaryPosition,
              heightCm: d.heightCm,
              weightKg: d.weightKg,
              wingspanCm: d.wingspanCm,
              standingReachCm: d.standingReachCm,
              schoolOrClub: d.schoolOrClub,
              province: d.province,
              jerseyNumber: d.jerseyNumber,
              bio: d.bio,
              avatarUrl: d.avatarUrl,
              tcasReferenceCode: d.tcasReferenceCode,
            });

            const mapStatsRecord = (d: any, s: any): AthleteSeasonStats => ({
              athleteId: d.id,
              firstName: d.firstName,
              lastName: d.lastName,
              jerseyNumber: d.jerseyNumber || 0,
              schoolOrClub: d.schoolOrClub,
              province: d.province,
              position: d.primaryPosition,
              ageCategory: s.ageCategory || "U18",
              avatarUrl: d.avatarUrl,
              gamesPlayed: s.gamesPlayed || 0,
              points: s.points || 0,
              rebounds: s.rebounds || 0,
              assists: s.assists || 0,
              steals: s.steals || 0,
              blocks: s.blocks || 0,
              turnovers: s.turnovers || 0,
              fouls: s.fouls || 0,
              fgMade: s.fgMade || 0,
              fgMissed: s.fgMissed || 0,
              ftMade: s.ftMade || 0,
              ftMissed: s.ftMissed || 0,
              fg3Made: s.fg3Made || 0,
              fg3Missed: s.fg3Missed || 0,
              eff: s.eff || 0,
              effPerGame: s.effPerGame || 0,
              efgPct: s.efgPct || 0,
              tsPct: s.tsPct || 0,
              astToRatio: s.astToRatio || 0,
              per: s.per || 0,
              ppg: s.ppg || 0,
              rpg: s.rpg || 0,
              apg: s.apg || 0,
              spg: s.spg || 0,
              bpg: s.bpg || 0,
              fgPct: s.fgPct || 0,
              ftPct: s.ftPct || 0,
              scoringRating: s.scoringRating,
              playmakingRating: s.playmakingRating,
              defenseRating: s.defenseRating,
              athleticismRating: s.athleticismRating,
              season: s.season || "2026",
              tournamentId: s.tournamentId,
            });

            if (d.seasonStats) {
              const list = Array.isArray(d.seasonStats) ? d.seasonStats : [d.seasonStats];
              setRawSeasonStatsList(list);
              if (d.allSeasons && Array.isArray(d.allSeasons) && d.allSeasons.length > 0) {
                setAllSeasons(d.allSeasons);
              }
              const currentSeasonMatch = list.find((st: any) => st.season === selectedSeason) || list[0];
              if (currentSeasonMatch) {
                setStats(mapStatsRecord(d, currentSeasonMatch));
              }
            }

            if (Array.isArray(d.events) && d.events.length > 0) {
              setEvents(
                d.events.map((e: any) => ({
                  id: e.id,
                  matchId: e.matchId,
                  officialId: e.officialId,
                  athleteId: e.athleteId,
                  teamId: e.teamId || "team-bcc",
                  eventType: e.eventType,
                  points: e.points,
                  quarter: e.quarter,
                  gameClockDisplay: e.gameClockDisplay,
                  videoElapsedSec: e.videoElapsedSec,
                  isVerified: e.isVerified,
                  createdAt: e.createdAt,
                  athleteName: `${d.firstName} ${d.lastName}`,
                  jerseyNumber: d.jerseyNumber,
                }))
              );
            }

            setIsDbLoaded(true);
          }
        }
      } catch (err) {
        console.warn("Using fallback local data for athlete profile:", err);
      }
    }

    loadAthleteData();
  }, [athleteId, selectedSeason]);

  // Sync active stats when user changes selected season
  useEffect(() => {
    if (rawSeasonStatsList.length > 0) {
      const match = rawSeasonStatsList.find((st: any) => st.season === selectedSeason) || rawSeasonStatsList[0];
      if (match) {
        setStats({
          athleteId: athlete.id,
          firstName: athlete.firstName,
          lastName: athlete.lastName,
          jerseyNumber: athlete.jerseyNumber || 0,
          schoolOrClub: athlete.schoolOrClub,
          province: athlete.province,
          position: athlete.primaryPosition,
          ageCategory: match.ageCategory || "U18",
          avatarUrl: athlete.avatarUrl,
          gamesPlayed: match.gamesPlayed || 0,
          points: match.points || 0,
          rebounds: match.rebounds || 0,
          assists: match.assists || 0,
          steals: match.steals || 0,
          blocks: match.blocks || 0,
          turnovers: match.turnovers || 0,
          fouls: match.fouls || 0,
          fgMade: match.fgMade || 0,
          fgMissed: match.fgMissed || 0,
          ftMade: match.ftMade || 0,
          ftMissed: match.ftMissed || 0,
          fg3Made: match.fg3Made || 0,
          fg3Missed: match.fg3Missed || 0,
          eff: match.eff || 0,
          effPerGame: match.effPerGame || 0,
          efgPct: match.efgPct || 0,
          tsPct: match.tsPct || 0,
          astToRatio: match.astToRatio || 0,
          per: match.per || 0,
          ppg: match.ppg || 0,
          rpg: match.rpg || 0,
          apg: match.apg || 0,
          spg: match.spg || 0,
          bpg: match.bpg || 0,
          fgPct: match.fgPct || 0,
          ftPct: match.ftPct || 0,
          scoringRating: match.scoringRating,
          playmakingRating: match.playmakingRating,
          defenseRating: match.defenseRating,
          athleticismRating: match.athleticismRating,
          season: match.season || selectedSeason,
          tournamentId: match.tournamentId,
        });
      }
    }
  }, [selectedSeason, rawSeasonStatsList, athlete]);

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-primary selection:text-on-primary">
      {/* TOP APP BAR */}
      <Navbar />

      {/* MAIN CANVAS */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-gutter-desktop py-4 md:py-space-md">
        {/* TOP ACTION SUB-BAR & ATHLETE HERO BANNER */}
        <NbaAthleteHero
          athlete={athlete}
          stats={stats}
          onOpenEditProfile={canEdit ? () => setIsEditModalOpen(true) : undefined}
        />

        {/* ROLE-AWARE ACTION STRIP */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-2.5 sm:px-4 sm:py-2.5 mb-5 text-white flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar whitespace-nowrap shadow-md font-mono text-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider shrink-0 pr-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>
              {currentUser.role === "COACH"
                ? "COACH SUITE:"
                : canEdit
                ? "ATHLETE SUITE:"
                : "PROSPECT VIEW:"}
            </span>
          </div>

          {/* 1. ATHLETE OWNER / ADMIN ACTIONS */}
          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                title="แก้ไขข้อมูลสรีระและคำนวณดัชนี Ape Index"
                className="px-2.5 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-700/60 font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Ruler className="w-3.5 h-3.5 text-blue-400" />
                <span>แก้ไขข้อมูลสรีระ (Biometrics)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRecruiterViewsModalOpen(true)}
                title="สถิติการเข้าชมประวัติโดยผู้ฝึกสอนและฝ่ายสรรหา 5 สถาบัน"
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>สถิติผู้เข้าชมประวัติ (5)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAcademicModalOpen(true)}
                title="ตรวจสอบผลการเรียนเฉลี่ยสะสมและคุณสมบัติ TCAS (GPAX 3.68)"
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>ผลการเรียน GPAX 3.68 (TCAS)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReelModalOpen(true)}
                title="สร้างและส่งออกวิดีโอไฮไลต์ทางการ (Highlight Reel)"
                className="px-3 py-1.5 rounded-lg bg-[#AF101A] hover:bg-[#8F0D15] text-white font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm cursor-pointer shrink-0"
              >
                <Film className="w-3.5 h-3.5 text-white" />
                <span>วิดีโอไฮไลต์ทางการ</span>
              </button>
            </>
          )}

          {/* 2. COACH ACTIONS */}
          {isCoach && (
            <>
              <button
                type="button"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  isBookmarked
                    ? "bg-amber-400 text-slate-950 shadow-xs"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
                title="บันทึกนักกีฬาในรายชื่อเป้าหมายการสรรหา"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                <span>{isBookmarked ? "บันทึกในรายชื่อติดตามแล้ว" : "บันทึกในรายชื่อติดตาม (Shortlist)"}</span>
              </button>

              <button
                type="button"
                onClick={() => alert("ติดต่อผู้ฝึกสอนต้นสังกัด Bangkok Christian College: coach.somkid@bcc.ac.th")}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                title="ส่งข้อความติดต่อผู้ฝึกสอนสถานศึกษาต้นสังกัดเพื่อสอบถามข้อมูล"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>ติดต่อผู้ฝึกสอนต้นสังกัด</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsPassModalOpen(true)}
            title="บัตรประจำตัวนักกีฬาดิจิทัล Digital Player Pass"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-400" />
            <span>บัตรประจำตัวนักกีฬา (Digital Pass)</span>
          </button>
        </div>

        {/* SEASON & AGE CATEGORY CONTROLS (Multi-season stats preservation) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-white shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#DC2626]" />
              ฤดูกาล / SEASON:
            </span>
            <div className="flex items-center gap-1.5">
              {allSeasons.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedSeason(yr)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition cursor-pointer ${
                    selectedSeason === yr
                      ? "bg-[#DC2626] text-white shadow-xs"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  SEASON {yr}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">รุ่นอายุ:</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30 font-bold">
                {stats.ageCategory || "U18"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">เกมที่ลงเล่น:</span>
              <span className="font-bold text-white">{stats.gamesPlayed} เกม</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">EFF รวม:</span>
              <span className="font-bold text-emerald-400">{stats.eff}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">PPG:</span>
              <span className="font-bold text-white">{stats.ppg?.toFixed(1) || "0.0"}</span>
            </div>
          </div>
        </div>

        {/* HORIZONTAL SUB-NAVIGATION TABS (Tactical Sports Navigation) */}
        <div className="flex overflow-x-auto no-scrollbar gap-1.5 mb-5 pb-1 border-b border-outline-variant">
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-t font-label-caps text-label-caps tracking-wider uppercase whitespace-nowrap transition-colors ${
              activeTab === "OVERVIEW"
                ? "bg-primary text-on-primary font-bold shadow-sm"
                : "bg-surface-container-lowest border border-outline-variant text-secondary hover:text-primary hover:bg-surface-container"
            }`}
          >
            <span
              className="material-symbols-outlined text-base"
              style={activeTab === "OVERVIEW" ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              analytics
            </span>
            <span>OVERVIEW & STATS</span>
          </button>

          <button
            onClick={() => setActiveTab("CAREER_STATS")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-t font-label-caps text-label-caps tracking-wider uppercase whitespace-nowrap transition-colors ${
              activeTab === "CAREER_STATS"
                ? "bg-primary text-on-primary font-bold shadow-sm"
                : "bg-surface-container-lowest border border-outline-variant text-secondary hover:text-primary hover:bg-surface-container"
            }`}
          >
            <span
              className="material-symbols-outlined text-base"
              style={activeTab === "CAREER_STATS" ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              history_edu
            </span>
            <span>CAREER STATS</span>
          </button>

          <button
            onClick={() => setActiveTab("ACTIVITY")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-t font-label-caps text-label-caps tracking-wider uppercase whitespace-nowrap transition-colors ${
              activeTab === "ACTIVITY"
                ? "bg-primary text-on-primary font-bold shadow-sm"
                : "bg-surface-container-lowest border border-outline-variant text-secondary hover:text-primary hover:bg-surface-container"
            }`}
          >
            <span
              className="material-symbols-outlined text-base"
              style={activeTab === "ACTIVITY" ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              scoreboard
            </span>
            <span>MATCH EXPERIENCE</span>
          </button>

          <button
            onClick={() => setActiveTab("SHOT_CHART")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-t font-label-caps text-label-caps tracking-wider uppercase whitespace-nowrap transition-colors ${
              activeTab === "SHOT_CHART"
                ? "bg-primary text-on-primary font-bold shadow-sm"
                : "bg-surface-container-lowest border border-outline-variant text-secondary hover:text-primary hover:bg-surface-container"
            }`}
          >
            <span
              className="material-symbols-outlined text-base"
              style={activeTab === "SHOT_CHART" ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              crisis_alert
            </span>
            <span>5-ZONE SHOT CHART</span>
            {!isPro && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
          </button>

          <button
            onClick={() => setActiveTab("EFF_TREND")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-t font-label-caps text-label-caps tracking-wider uppercase whitespace-nowrap transition-colors ${
              activeTab === "EFF_TREND"
                ? "bg-primary text-on-primary font-bold shadow-sm"
                : "bg-surface-container-lowest border border-outline-variant text-secondary hover:text-primary hover:bg-surface-container"
            }`}
          >
            <span
              className="material-symbols-outlined text-base"
              style={activeTab === "EFF_TREND" ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              trending_up
            </span>
            <span>FIBA EFF TREND</span>
            {!isPro && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
          </button>

          <button
            onClick={() => setActiveTab("LOGS")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-t font-label-caps text-label-caps tracking-wider uppercase whitespace-nowrap transition-colors ${
              activeTab === "LOGS"
                ? "bg-primary text-on-primary font-bold shadow-sm"
                : "bg-surface-container-lowest border border-outline-variant text-secondary hover:text-primary hover:bg-surface-container"
            }`}
          >
            <span
              className="material-symbols-outlined text-base"
              style={activeTab === "LOGS" ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              description
            </span>
            <span>VERIFIED GAME LOGS</span>
          </button>

          {/* Only shown if user is the athlete owner of this profile or admin */}
          {isOwner && (
            <>
              <button
                onClick={() => setActiveTab("TCAS")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-t font-label-caps text-label-caps tracking-wider uppercase whitespace-nowrap transition-colors ${
                  activeTab === "TCAS"
                    ? "bg-primary text-on-primary font-bold shadow-sm"
                    : "bg-surface-container-lowest border border-outline-variant text-secondary hover:text-primary hover:bg-surface-container"
                }`}
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={activeTab === "TCAS" ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  video_library
                </span>
                <span>TCAS & HIGHLIGHT REEL</span>
                {!isPro && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
              </button>

              <button
                onClick={() => setActiveTab("ACADEMICS")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-t font-label-caps text-label-caps tracking-wider uppercase whitespace-nowrap transition-colors ${
                  activeTab === "ACADEMICS"
                    ? "bg-primary text-on-primary font-bold shadow-sm"
                    : "bg-surface-container-lowest border border-outline-variant text-secondary hover:text-primary hover:bg-surface-container"
                }`}
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={activeTab === "ACADEMICS" ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  school
                </span>
                <span>ACADEMIC & TCAS ELIGIBILITY</span>
              </button>
            </>
          )}
          {/* Tab 3.6: Stats Lineage & Provenance Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsLineageModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-t font-label-caps text-label-caps tracking-wider uppercase whitespace-nowrap transition-colors bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold cursor-pointer"
            title="ตรวจสอบประวัติและที่มาของสถิติ (Stats Lineage & Certification)"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>STATS LINEAGE (3.6)</span>
          </button>
        </div>

        {/* Tab 0: Overview & FIBA Season Stats (Default Landing View) */}
        {activeTab === "OVERVIEW" && (
          <AthleteOverview
            athlete={athlete}
            stats={stats}
            isOwner={isOwner}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenLineage={() => setIsLineageModalOpen(true)}
          />
        )}

        {/* Tab 1: NBA Traditional Splits / Career Stats */}
        {activeTab === "CAREER_STATS" && (
          <AthleteCareerStats athlete={athlete} stats={stats} />
        )}

        {/* Tab: Match Experience & Activity Index */}
        {activeTab === "ACTIVITY" && (
          <div className="space-y-6">
            <AthleteActivityIndex
              athleteId={athlete.id}
              athlete={athlete}
              stats={stats}
              onNavigateLogs={() => setActiveTab("LOGS")}
            />
          </div>
        )}

        {/* Tab: Verified Game Logs */}
        {activeTab === "LOGS" && (
          <AthleteGameLogs
            athlete={athlete}
            stats={stats}
            onOpenLineage={() => setIsLineageModalOpen(true)}
          />
        )}

        {/* Tab 2: FIBA 5-Zone Shot Chart */}
        {activeTab === "SHOT_CHART" && (
          <ShotChart
            athleteId={athlete.id}
            athleteName={`${athlete.firstName} ${athlete.lastName}`}
            stats={stats}
          />
        )}

        {/* Tab 3: FIBA EFF Historical Trend */}
        {activeTab === "EFF_TREND" && (
          <AthleteEffTrend
            athlete={athlete}
            stats={stats}
            isPro={isPro}
            onOpenPricing={() => setIsPricingModalOpen(true)}
          />
        )}

        {/* Tab 4: TCAS University Export & Highlight Reel Compiler (Owner Only) */}
        {isOwner && activeTab === "TCAS" && (
          <AthleteTcasPortfolio
            athlete={athlete}
            stats={stats}
            isPro={isPro}
            onOpenPricing={() => setIsPricingModalOpen(true)}
          />
        )}

        {/* Tab 5: Academic & TCAS Quota Eligibility View (Owner Only) */}
        {isOwner && activeTab === "ACADEMICS" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-mono font-bold uppercase mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>TCAS ACADEMIC VERIFIED STATUS</span>
                  </div>
                  <h3 className="font-headline-lg uppercase text-2xl font-normal text-slate-900">
                    รายงานผลการเรียนสะสม (GPAX) &amp; คุณสมบัติโควตามหาวิทยาลัย
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    เชื่อมโยงฐานข้อมูลผลการเรียน 4 ภาคการศึกษา เพื่อประกอบการพิจารณาคัดเลือกโควตานักกีฬา TCAS รอบที่ 1 แฟ้มสะสมผลงาน (Portfolio)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAcademicModalOpen(true)}
                    className="px-4 py-2 rounded bg-[#AF101A] hover:bg-[#8F0D15] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>เปิดระบบตรวจสอบผลการเรียน (Academic Tracker)</span>
                  </button>
                </div>
              </div>

              {/* Top Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                <div className="bg-[#F8F9FC] p-4 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 uppercase font-bold block">
                    ผลการเรียนเฉลี่ยสะสม (GPAX)
                  </span>
                  <div className="text-3xl font-headline-xl text-slate-900 font-normal mt-1 flex items-baseline gap-1.5">
                    <span>3.68</span>
                    <span className="text-xs text-slate-400">/ 4.00</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ผ่านเกณฑ์คุณสมบัติขั้นต่ำของทุกมหาวิทยาลัย (&ge; 2.50)</span>
                  </div>
                </div>

                <div className="bg-[#F8F9FC] p-4 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 uppercase font-bold block">
                    หน่วยกิตสะสมที่ผ่านการรับรอง
                  </span>
                  <div className="text-3xl font-headline-xl text-slate-900 font-normal mt-1">
                    67.0 หน่วยกิต
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    ระดับชั้น ม.4 (ภาคเรียนที่ 1-2) และ ม.5 (ภาคเรียนที่ 1-2)
                  </div>
                </div>

                <div className="bg-[#F8F9FC] p-4 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 uppercase font-bold block">
                    โควตากีฬา TCAS ที่มีคุณสมบัติยื่น
                  </span>
                  <div className="text-3xl font-headline-xl text-[#DC2626] font-normal mt-1">
                    4 สถาบัน
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    จุฬาฯ • มธ. • มก. • มช.
                  </div>
                </div>
              </div>

              {/* Term By Term Breakdown */}
              <div className="space-y-3 font-mono text-xs">
                <span className="font-bold text-slate-900 uppercase block">
                  ประวัติผลการเรียนสะสม 4 ภาคการศึกษา (ชั้นมัธยมศึกษาปีที่ 4 - 5)
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                      <tr>
                        <th className="py-2.5 px-4">ระดับชั้น / ภาคเรียน</th>
                        <th className="py-2.5 px-4">ปีการศึกษา</th>
                        <th className="py-2.5 px-4 text-center">หน่วยกิตสะสม</th>
                        <th className="py-2.5 px-4 text-center">GPA ประจำภาค</th>
                        <th className="py-2.5 px-4 text-right">สถานะการรับรอง</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-800">ม.4 ภาคเรียนที่ 1</td>
                        <td className="py-2.5 px-4 text-slate-600">2567</td>
                        <td className="py-2.5 px-4 text-center text-slate-600">16.5</td>
                        <td className="py-2.5 px-4 text-center font-bold text-emerald-700">3.62</td>
                        <td className="py-2.5 px-4 text-right text-emerald-700 font-bold">Verified</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-800">ม.4 ภาคเรียนที่ 2</td>
                        <td className="py-2.5 px-4 text-slate-600">2567</td>
                        <td className="py-2.5 px-4 text-center text-slate-600">16.5</td>
                        <td className="py-2.5 px-4 text-center font-bold text-emerald-700">3.70</td>
                        <td className="py-2.5 px-4 text-right text-emerald-700 font-bold">Verified</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-800">ม.5 ภาคเรียนที่ 1</td>
                        <td className="py-2.5 px-4 text-slate-600">2568</td>
                        <td className="py-2.5 px-4 text-center text-slate-600">17.0</td>
                        <td className="py-2.5 px-4 text-center font-bold text-emerald-700">3.65</td>
                        <td className="py-2.5 px-4 text-right text-emerald-700 font-bold">Verified</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-800">ม.5 ภาคเรียนที่ 2</td>
                        <td className="py-2.5 px-4 text-slate-600">2568</td>
                        <td className="py-2.5 px-4 text-center text-slate-600">17.0</td>
                        <td className="py-2.5 px-4 text-center font-bold text-emerald-700">3.75</td>
                        <td className="py-2.5 px-4 text-right text-emerald-700 font-bold">Verified</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Target Quota Link */}
              <div className="bg-[#0F172A] text-white p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                <div>
                  <span className="font-bold uppercase text-red-400 block text-[11px]">
                    EXPLORE RECRUITMENT OPPORTUNITIES
                  </span>
                  <div className="font-bold text-white text-sm mt-0.5">
                    ข้อมูลการเปิดรับสมัครโควตานักกีฬาและความสามารถพิเศษทางกีฬา สถาบันอุดมศึกษา
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    ตรวจสอบประกาศรับสมัครและเกณฑ์การคัดเลือกโควตานักกีฬาช้างเผือกทั่วประเทศได้ที่ศูนย์ข้อมูลโอกาสทางการศึกษา (Opportunities)
                  </p>
                </div>
                <Link
                  href="/opportunities"
                  className="px-4 py-2.5 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold uppercase tracking-wider flex items-center gap-1.5 transition shrink-0"
                >
                  <span>ตรวจสอบประกาศรับสมัคร</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* PHASE 2 MODALS */}
      <HighlightReelGeneratorModal
        isOpen={isReelModalOpen}
        onClose={() => setIsReelModalOpen(false)}
        athleteName={`${athlete.firstName} ${athlete.lastName}`}
        jerseyNumber={athlete.jerseyNumber || 7}
        schoolName={athlete.schoolOrClub}
        tcasCode={athlete.tcasReferenceCode || "STC-VERIFIED-TH-BCC-007"}
      />

      <AcademicTrackerModal
        isOpen={isAcademicModalOpen}
        onClose={() => setIsAcademicModalOpen(false)}
        athleteId={athlete.id}
        athleteName={`${athlete.firstName} ${athlete.lastName}`}
        schoolName={athlete.schoolOrClub}
      />

      <RecruiterViewsModal
        isOpen={isRecruiterViewsModalOpen}
        onClose={() => setIsRecruiterViewsModalOpen(false)}
        athleteName={`${athlete.firstName} ${athlete.lastName}`}
        isPro={isPro}
      />

      <DigitalPlayerPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        playerData={{
          athleteId: athlete.id,
          fullName: `${athlete.firstName} ${athlete.lastName}`,
          fullNameEn: `${athlete.firstName} ${athlete.lastName}`,
          jerseyNumber: athlete.jerseyNumber || 7,
          schoolName: athlete.schoolOrClub,
          dateOfBirth: athlete.birthDate,
          verifiedAge: 18,
          eligibleCategory: "U18 Men's Division",
          tcasBatch: "TCAS 2027",
          status: "ACTIVE",
          issuedBy: "Basketball Sport Association of Thailand (BSAT)",
          validUntil: "2027-04-30",
        }}
      />

      <EditAthleteProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        athlete={athlete}
        onProfileUpdated={(updated) => {
          setAthlete(updated);
        }}
      />

      {/* Freemium Pricing & Capabilities Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        defaultPerspective="ATHLETE"
      />

      {/* Feature 3.6: Stats Lineage & Provenance Modal */}
      <StatsLineageModal
        isOpen={isLineageModalOpen}
        onClose={() => setIsLineageModalOpen(false)}
        athleteId={athlete.id}
        season={selectedSeason}
      />

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
