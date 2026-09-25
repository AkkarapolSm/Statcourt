"use client";

import React, { useState, useEffect } from "react";
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

  // RBAC Permission checks for athlete profile
  const canEdit = canEditAthleteProfile(currentUser, athleteId);
  const canViewPrivate = canViewAthletePrivateData(currentUser, athleteId);
  const isCoach = currentUser.role === "COACH";
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Phase 2 Modals State
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
  const [isRecruiterViewsModalOpen, setIsRecruiterViewsModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [athlete, setAthlete] = useState<AthleteProfile>(initialProfile);
  const [stats, setStats] = useState<AthleteSeasonStats>(initialStats);
  const [events, setEvents] = useState<MatchEvent[]>(mockMatchEvents);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  const getTabFromParam = (t?: string) => {
    const upper = t?.toUpperCase();
    if (upper === "CAREER" || upper === "CAREER_STATS") return "CAREER_STATS";
    if (upper === "ACTIVITY" || upper === "EXPERIENCE") return "ACTIVITY";
    if (upper === "SHOT_CHART" || upper === "SHOT") return "SHOT_CHART";
    if (upper === "EFF_TREND" || upper === "TREND") return "EFF_TREND";
    if (upper === "LOGS") return "LOGS";
    if (upper === "TCAS") return "TCAS";
    if (upper === "ACADEMIC" || upper === "ACADEMICS" || upper === "GPA") return "ACADEMICS";
    return "OVERVIEW";
  };

  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "CAREER_STATS" | "ACTIVITY" | "SHOT_CHART" | "EFF_TREND" | "LOGS" | "TCAS" | "ACADEMICS"
  >(() => getTabFromParam(searchParams?.tab));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const tab = sp.get("tab")?.toUpperCase();
      if (tab) {
        setActiveTab(getTabFromParam(tab));
      }
    }
  }, []);

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

            if (d.seasonStats) {
              const s = d.seasonStats;
              setStats({
                athleteId: d.id,
                firstName: d.firstName,
                lastName: d.lastName,
                jerseyNumber: d.jerseyNumber || 0,
                schoolOrClub: d.schoolOrClub,
                province: d.province,
                position: d.primaryPosition,
                ageCategory: s.ageCategory,
                avatarUrl: d.avatarUrl,
                gamesPlayed: s.gamesPlayed,
                points: s.points,
                rebounds: s.rebounds,
                assists: s.assists,
                steals: s.steals,
                blocks: s.blocks,
                turnovers: s.turnovers,
                fouls: s.fouls,
                fgMade: s.fgMade,
                fgMissed: s.fgMissed,
                ftMade: s.ftMade,
                ftMissed: s.ftMissed,
                fg3Made: s.fg3Made,
                fg3Missed: s.fg3Missed,
                eff: s.eff,
                effPerGame: s.effPerGame,
                efgPct: s.efgPct,
                tsPct: s.tsPct,
                astToRatio: s.astToRatio,
                per: s.per,
                ppg: s.ppg,
                rpg: s.rpg,
                apg: s.apg,
                spg: s.spg,
                bpg: s.bpg,
                fgPct: s.fgPct,
                ftPct: s.ftPct,
                scoringRating: s.scoringRating,
                playmakingRating: s.playmakingRating,
                defenseRating: s.defenseRating,
                athleticismRating: s.athleticismRating,
              });
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
  }, [athleteId]);

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
                <span>แก้ไขสรีระ (Ape Index)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRecruiterViewsModalOpen(true)}
                title="Who Viewed My Profile - ตรวจสอบความสนใจจาก 5 แมวมอง"
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>แมวมองเข้าชม (5)</span>
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
                title="เพิ่มนักกีฬาคนนี้เข้าในลิสต์เป้าหมายของทีม"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                <span>{isBookmarked ? "บันทึกใน Shortlist แล้ว" : "บันทึกใน Shortlist"}</span>
              </button>

              <button
                type="button"
                onClick={() => alert("ติดต่อโค้ชต้นสังกัด Bangkok Christian College: coach.somkid@bcc.ac.th")}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                title="ส่งข้อความหาโค้ชโรงเรียนเพื่อสอบถามข้อมูลการย้ายหรือคัดตัว"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>ติดต่อโค้ช รร.</span>
              </button>
            </>
          )}

          {/* 3. COMMON ACTIONS */}
          <button
            type="button"
            onClick={() => setIsPassModalOpen(true)}
            title="บัตรประจำตัวนักกีฬาดิจิทัล Digital Player Pass"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-400" />
            <span>Player Pass</span>
          </button>

          {canViewPrivate && (
            <button
              type="button"
              onClick={() => setIsAcademicModalOpen(true)}
              title="Academic Eligibility & GPAX Tracker (เกรดสะสม 3.68)"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>GPAX 3.68 (TCAS)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsReelModalOpen(true)}
            title="สร้างวิดีโอ 1-Minute Highlight Reel"
            className="px-3 py-1.5 rounded-lg bg-[#AF101A] hover:bg-[#8F0D15] text-white font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm cursor-pointer shrink-0"
          >
            <Film className="w-3.5 h-3.5 text-white" />
            <span>Highlight Reel</span>
          </button>
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
        </div>

        {/* Tab 0: Overview & FIBA Season Stats (Default Landing View) */}
        {activeTab === "OVERVIEW" && (
          <AthleteOverview
            athlete={athlete}
            stats={stats}
            onNavigateTab={(tab) => setActiveTab(tab)}
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
          <AthleteGameLogs athlete={athlete} stats={stats} />
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

        {/* Tab 4: TCAS University Export & Highlight Reel Compiler */}
        {activeTab === "TCAS" && (
          <AthleteTcasPortfolio
            athlete={athlete}
            stats={stats}
            isPro={isPro}
            onOpenPricing={() => setIsPricingModalOpen(true)}
          />
        )}

        {/* Tab 5: Academic & TCAS Quota Eligibility View */}
        {activeTab === "ACADEMICS" && (
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
                    เชื่อมโยงฐานข้อมูลผลการเรียน 4 ภาคเรียน ยืนยันสิทธิ์รอบ Portfolio สำหรับโค้ชมหาวิทยาลัย
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAcademicModalOpen(true)}
                    className="px-4 py-2 rounded bg-[#AF101A] hover:bg-[#8F0D15] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>เปิดระบบจัดการเกรด</span>
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
                    <span>ผ่านเกณฑ์ขั้นต่ำทุกมหาวิทยาลัย (&ge; 2.50)</span>
                  </div>
                </div>

                <div className="bg-[#F8F9FC] p-4 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 uppercase font-bold block">
                    หน่วยกิตสะสมที่ผ่าน
                  </span>
                  <div className="text-3xl font-headline-xl text-slate-900 font-normal mt-1">
                    67.0 หน่วยกิต
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    ม.4 ภาค 1-2 • ม.5 ภาค 1-2 (ครบถ้วน)
                  </div>
                </div>

                <div className="bg-[#F8F9FC] p-4 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-400 uppercase font-bold block">
                    โควตากีฬา TCAS ที่มีสิทธิ์ยื่น
                  </span>
                  <div className="text-3xl font-headline-xl text-[#DC2626] font-normal mt-1">
                    4 สถาบัน
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    จุฬาฯ • มธ. • ม.กรุงเทพ • มก.
                  </div>
                </div>
              </div>

              {/* Term By Term Breakdown */}
              <div className="space-y-3 font-mono text-xs">
                <span className="font-bold text-slate-900 uppercase block">
                  ประวัติผลการเรียน 4 ภาคเรียนล่าสุด (M.4 - M.5)
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                      <tr>
                        <th className="py-2.5 px-4">ระดับชั้น / ภาคเรียน</th>
                        <th className="py-2.5 px-4">ปีการศึกษา</th>
                        <th className="py-2.5 px-4 text-center">หน่วยกิต</th>
                        <th className="py-2.5 px-4 text-center">GPA</th>
                        <th className="py-2.5 px-4 text-right">สถานะรับรอง</th>
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
                    กำลังมองหาทุนการศึกษาบาสเกตบอล หรือโควตาเข้ามหาวิทยาลัยชั้นนำ?
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    ตรวจสอบกระดานรับสมัครคัดตัวนักกีฬาช้างเผือกทั่วประเทศได้ที่หน้า Opportunities
                  </p>
                </div>
                <Link
                  href="/opportunities"
                  className="px-4 py-2.5 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold uppercase tracking-wider flex items-center gap-1.5 transition shrink-0"
                >
                  <span>ดูกระดานทุนการศึกษา</span>
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

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
