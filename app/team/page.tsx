"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Crosshair,
  CalendarCheck,
  AlertTriangle,
  HeartPulse,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Lock,
  Trophy,
  FileSpreadsheet,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ShotChartComparison from "@/components/team/ShotChartComparison";
import RosterImportModal from "@/components/import/RosterImportModal";
import {
  mockPracticeSessions,
  mockOppositionReport,
  mockPlayerWorkloads,
  mockInjuryLogs,
} from "@/lib/db/phase3-data";
import { PracticeSession, PracticeAttendanceItem, InjuryLogItem } from "@/lib/types";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { canManageTeamLineup } from "@/lib/auth/rbac";

export default function TeamOperationsHubPage() {
  const { currentUser, loginAs, loading: authLoading } = useAuthStore();
  const canManage = canManageTeamLineup(currentUser);

  const [activeTab, setActiveTab] = useState<
    "OPPOSITION" | "SHOT_CHART" | "ATTENDANCE" | "SPORTS_SCIENCE"
  >("OPPOSITION");

  // Practice Attendance State
  const [sessions, setSessions] = useState<PracticeSession[]>(mockPracticeSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0].id);

  // Injury Logs State from API
  const [injuries, setInjuries] = useState<InjuryLogItem[]>(mockInjuryLogs);
  const [importModalOpen, setImportModalOpen] = useState(false);

  React.useEffect(() => {
    fetch("/api/team/practice?teamId=team-bcc")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setSessions(json.data);
          setSelectedSessionId(json.data[0].id);
        }
      })
      .catch((err) => console.warn("Failed to fetch practice sessions:", err));

    fetch("/api/team/injuries?teamId=team-bcc")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setInjuries(json.data);
        }
      })
      .catch((err) => console.warn("Failed to fetch injury logs:", err));
  }, []);

  const activeSession =
    sessions.find((s) => s.id === selectedSessionId) ||
    sessions[0] || {
      id: "prac-default",
      title: "ซ้อมทีมประจำวัน",
      date: "2026-09-26",
      timeDisplay: "120 นาที",
      sessionType: "TACTICAL" as const,
      location: "โรงยิมเนเซียมบาสเกตบอล 1",
      coachInCharge: "โค้ชทีม BCC",
      roster: [],
    };

  const handleUpdateStatus = async (
    athleteId: string,
    newStatus: PracticeAttendanceItem["status"]
  ) => {
    // 1. Optimistic UI update
    const updated = sessions.map((sess) => {
      if (sess.id !== activeSession.id) return sess;
      return {
        ...sess,
        roster: (sess.roster || []).map((player) =>
          player.athleteId === athleteId ? { ...player, status: newStatus } : player
        ),
      };
    });
    setSessions(updated);

    // 2. Persist to database via API
    try {
      await fetch("/api/team/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_ATTENDANCE",
          sessionId: activeSession.id,
          athleteId,
          status: newStatus,
        }),
      });
    } catch (err) {
      console.warn("Failed to persist attendance status to database:", err);
    }
  };

  const activeRoster = activeSession?.roster ?? [];
  const presentCount = activeRoster.filter((p) => p.status === "PRESENT").length;
  const totalRoster = activeRoster.length;
  const attendancePct = totalRoster > 0 ? ((presentCount / totalRoster) * 100).toFixed(1) : "0.0";

  // Loading skeleton while session resolves to avoid flash of access-denied gate
  if (authLoading && !canManage) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] text-slate-900 flex flex-col font-sans">
        <Navbar />
        {/* Skeleton Banner */}
        <div className="bg-[#0B1C30] text-white py-10 border-b border-[#1E3A5F]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
            <div className="h-6 w-48 bg-[#1E3A5F] rounded-sm mb-3" />
            <div className="h-10 w-96 bg-[#1E3A5F] rounded-sm mb-2" />
            <div className="h-4 w-72 bg-[#1E3A5F]/60 rounded-sm" />
          </div>
        </div>
        <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-white border border-[#DFE2EB] rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="h-80 bg-white border border-[#DFE2EB] rounded-lg animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  // Non-coach Access Gate (Courtside Editorial Coach Gateway)
  if (!canManage) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] text-slate-900 flex flex-col font-sans">
        <Navbar />

        <main className="flex-1 flex items-center justify-center p-4 py-16">
          <div className="w-full max-w-lg bg-white border border-[#DFE2EB] rounded-lg p-6 sm:p-8 text-center space-y-5 shadow-xs">
            <div className="w-14 h-14 rounded-sm bg-[#AF101A]/10 border border-[#AF101A]/30 text-[#AF101A] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-[#AF101A]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-red-50 border border-red-200 text-[#AF101A] text-[10px] font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#AF101A]" />
                <span>RESTRICTED COACH OPERATIONS HUB</span>
              </div>
              <h1 className="font-headline-lg text-xl sm:text-2xl uppercase tracking-wider text-[#0B1C30]">
                พื้นที่สงวนสิทธิ์เฉพาะผู้ฝึกสอน (Coaches Only)
              </h1>
              <p className="text-xs text-[#505A69] leading-relaxed font-sans max-w-md mx-auto">
                ระบบ Team Hub (การวางแท็กติกการเล่น, วิเคราะห์จุดบอดคู่แข่ง, เช็กชื่อการฝึกซ้อม และ Sports Science) สงวนสิทธิ์การเข้าถึงเฉพาะสตาฟฟ์โค้ชต้นสังกัดที่ได้รับการรับรองเท่านั้น
              </p>
            </div>

            <div className="space-y-2.5 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => loginAs("COACH")}
                className="w-full py-3 rounded-sm bg-[#AF101A] hover:bg-[#8F0D15] text-white font-bold uppercase transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>เข้าสู่ระบบบัญชีผู้ฝึกสอน (COACH SIGN IN)</span>
              </button>
              <Link
                href="/tournaments"
                className="w-full py-2.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase transition border border-[#DFE2EB] flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>ดูตารางการแข่งขันและสายแข่ง (Tournaments)</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 py-2 text-[#505A69] hover:text-[#0B1C30] transition text-xs"
              >
                <span>&larr; กลับสู่หน้าแรก (Back to Home)</span>
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
        {/* Hero Banner: Team Operations Hub */}
        <section className="bg-[#0B1C30] text-white py-10 border-b border-[#1E3A5F]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#AF101A]/20 border border-[#AF101A]/40 text-red-200 text-xs font-mono font-bold tracking-widest uppercase">
                    <ShieldCheck className="w-4 h-4 text-[#AF101A]" />
                    <span>TEAM OPERATIONS &amp; SPORTS SCIENCE</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold">
                    <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400" />
                    COACH ACCESS: {currentUser.name}
                  </span>
                </div>
                <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider font-normal text-white leading-tight">
                  ระบบบริหารทีมและแท็กติก <br />
                  <span className="text-[#AF101A]">Bangkok Christian College</span> (BCC U18)
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  ศูนย์กลางการปฏิบัติการประจำวันสำหรับสตาฟฟ์โค้ช: วิเคราะห์จุดบอดคู่แข่ง (Debsirin),
                  รายงานเทียบจุดยิง, ติดตามการฝึกซ้อม และระบบมอนิเตอร์อาการล้าสะสม
                </p>
              </div>

              {/* Quick Status Card */}
              <div className="bg-[#081422] border border-[#1E3A5F] rounded-lg p-5 flex items-center gap-6">
                <div className="space-y-1 font-mono">
                  <div className="text-[11px] text-slate-400 uppercase font-bold">
                    แมตช์สำคัญถัดไป
                  </div>
                  <div className="text-lg font-bold text-white font-headline-sm">
                    vs Debsirin School
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#AF101A]" />
                    <span>26 ก.ย. 2026 • 15:30 น. (รอบ 8 ทีม)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation Bar */}
        <section className="bg-white border-b border-[#DFE2EB] sticky top-14 z-30 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-2 overflow-x-auto font-mono text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("OPPOSITION")}
                className={`px-4 py-2.5 rounded-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "OPPOSITION"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-[#DFE2EB]"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>OPPOSITION SCOUTING (DEBSIRIN)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("SHOT_CHART")}
                className={`px-4 py-2.5 rounded-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "SHOT_CHART"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-[#DFE2EB]"
                }`}
              >
                <Crosshair className="w-4 h-4" />
                <span>HEAD-TO-HEAD SHOT CHART</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ATTENDANCE")}
                className={`px-4 py-2.5 rounded-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "ATTENDANCE"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-[#DFE2EB]"
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>PRACTICE &amp; ATTENDANCE</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("SPORTS_SCIENCE")}
                className={`px-4 py-2.5 rounded-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "SPORTS_SCIENCE"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-[#DFE2EB]"
                }`}
              >
                <HeartPulse className="w-4 h-4 text-[#AF101A]" />
                <span>SPORTS SCIENCE &amp; INJURY</span>
              </button>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* TAB 1: OPPOSITION SCOUTING & TENDENCIES REPORT */}
          {activeTab === "OPPOSITION" && (
            <div className="space-y-6">
              
              {/* Top Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                
                {/* Drive Tendency */}
                <div className="bg-white border border-[#DFE2EB] rounded-lg p-4 space-y-2">
                  <span className="text-[#505A69] uppercase font-bold block text-[10px]">
                    แนวโน้มทิศทางการไดรฟ์บอล (DRIVE DIRECTION)
                  </span>
                  <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                    <span className="text-[#AF101A]">ขวา {mockOppositionReport.driveTendency.rightPct}%</span>
                    <span className="text-[#505A69]">ซ้าย {mockOppositionReport.driveTendency.leftPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-sm overflow-hidden flex">
                    <div className="bg-[#AF101A]" style={{ width: `${mockOppositionReport.driveTendency.rightPct}%` }} />
                    <div className="bg-slate-400" style={{ width: `${mockOppositionReport.driveTendency.leftPct}%` }} />
                  </div>
                  <div className="text-[10px] text-[#505A69] font-sans">
                    การ์ดคู่แข่งเลี้ยงมือขวาเป็นหลัก บีบให้ออกซ้ายตลอดเวลา
                  </div>
                </div>

                {/* Transition Pace */}
                <div className="bg-white border border-[#DFE2EB] rounded-lg p-4 space-y-2">
                  <span className="text-[#505A69] uppercase font-bold block text-[10px]">
                    ความเร็วเกมสวนกลับ (FASTBREAK PACE)
                  </span>
                  <div className="text-2xl font-headline-xl text-[#0B1C30] font-normal tabular-nums">
                    {mockOppositionReport.transitionPacePpg} PPG
                  </div>
                  <div className="text-[10px] text-slate-700 font-bold flex items-center gap-1 font-sans">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#AF101A]" />
                    <span>วิ่งสวนกลับเร็วอันดับ 2 ของลีก</span>
                  </div>
                </div>

                {/* Q3 Slump */}
                <div className="bg-white border border-[#DFE2EB] rounded-lg p-4 space-y-2">
                  <span className="text-[#505A69] uppercase font-bold block text-[10px]">
                    จุดบอดควอเตอร์ 3 (Q3 NET RATING DROP)
                  </span>
                  <div className="text-2xl font-headline-xl text-[#AF101A] font-normal flex items-center gap-1 tabular-nums">
                    <TrendingDown className="w-6 h-6" />
                    <span>{mockOppositionReport.q3RatingDrop}</span>
                  </div>
                  <div className="text-[10px] text-slate-700 font-bold font-sans">
                    โอกาสทอง: แต้มเฉลี่ยคู่แข่งจะตกฮวบใน Q3
                  </div>
                </div>

                {/* Match Details */}
                <div className="bg-white border border-[#DFE2EB] rounded-lg p-4 space-y-1">
                  <span className="text-[#505A69] uppercase font-bold block text-[10px]">
                    รายการแข่งขัน
                  </span>
                  <div className="font-bold text-[#0B1C30] text-xs">
                    {mockOppositionReport.tournamentName}
                  </div>
                  <div className="text-[10px] text-[#505A69] pt-1 font-sans">
                    สนาม: นิมิบุตร สนามกีฬาแห่งชาติ
                  </div>
                </div>

              </div>

              {/* Vulnerabilities & Key Defensive Rules */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Vulnerabilities List */}
                <div className="lg:col-span-6 bg-white border border-[#DFE2EB] rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#DFE2EB] pb-3">
                    <AlertCircle className="w-5 h-5 text-[#AF101A]" />
                    <h3 className="font-bold text-base text-[#0B1C30] font-mono uppercase">
                      จุดอ่อนเชิงโครงสร้างของคู่แข่ง (VULNERABILITIES)
                    </h3>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {mockOppositionReport.vulnerabilities.map((vuln, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-[#F8F9FF] border border-[#DFE2EB] flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-sm bg-red-100 text-[#AF101A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-slate-700 leading-relaxed font-sans text-xs">
                          {vuln}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Tactical Rules Checklist */}
                <div className="lg:col-span-6 bg-[#0B1C30] text-white border border-[#1E3A5F] rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#AF101A]" />
                      <h3 className="font-bold text-base text-white font-mono uppercase">
                        กฎเหล็กการเล่นป้องกัน 4 ข้อ (MUST-FOLLOW RULES)
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {mockOppositionReport.gameplanRules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`p-3.5 rounded-sm border flex items-center justify-between gap-3 ${
                          rule.isMustFollow
                            ? "bg-[#142338] border-[#AF101A]/60 text-white"
                            : "bg-[#081422] border-[#1E3A5F] text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#AF101A] shrink-0" />
                          <span>{rule.rule}</span>
                        </div>
                        {rule.isMustFollow && (
                          <span className="text-[10px] bg-[#AF101A] text-white px-2 py-0.5 rounded-sm font-bold uppercase shrink-0">
                            MUST FOLLOW
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Key Opposition Personnel Scouting Table */}
              <div className="bg-white border border-[#DFE2EB] rounded-lg overflow-hidden shadow-xs">
                <div className="px-6 py-4 bg-[#F8F9FF] border-b border-[#DFE2EB] flex items-center justify-between">
                  <h3 className="font-bold text-[#0B1C30] font-mono uppercase text-sm">
                    วิเคราะห์รายบุคคลผู้เล่นตัวหลักของเทพศิรินทร์ (KEY PERSONNEL)
                  </h3>
                  <span className="text-xs text-[#505A69] font-mono">
                    สถิติอ้างอิงจากแมตช์ย้อนหลัง 5 นัด
                  </span>
                </div>

                <div className="overflow-x-auto font-mono text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8F9FF] border-b border-[#DFE2EB] text-[#505A69] text-[11px] uppercase">
                      <tr>
                        <th className="py-3 px-4">ผู้เล่นคู่แข่ง</th>
                        <th className="py-3 px-4">ตำแหน่ง</th>
                        <th className="py-3 px-4 text-center">PPG</th>
                        <th className="py-3 px-4 text-center">EFF</th>
                        <th className="py-3 px-4">จุดเด่น / พฤติกรรมในสนาม (TENDENCY)</th>
                        <th className="py-3 px-4">แท็กติกรับมือ (DEFENSIVE ASSIGNMENT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFE2EB]/60">
                      {mockOppositionReport.keyPersonnel.map((p) => (
                        <tr key={p.number} className="hover:bg-[#F8F9FF] transition">
                          <td className="py-3.5 px-4 font-bold text-[#0B1C30]">
                            #{p.number} {p.name}
                          </td>
                          <td className="py-3.5 px-4 text-[#505A69]">
                            {p.position}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-[#AF101A] tabular-nums">
                            {p.ppg}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                            {p.eff}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 text-[11px] font-sans">
                            {p.keyTendency}
                          </td>
                          <td className="py-3.5 px-4 text-[#AF101A] font-bold text-[11px] font-sans">
                            {p.defensiveAssignment}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: HEAD-TO-HEAD SHOT CHART COMPARISON */}
          {activeTab === "SHOT_CHART" && (
            <div className="space-y-6">
              <ShotChartComparison />
            </div>
          )}

          {/* TAB 3: PRACTICE & ATTENDANCE TRACKING */}
          {activeTab === "ATTENDANCE" && (
            <div className="space-y-6">
              
              {/* Practice Session Selector & Summary Strip */}
              <div className="bg-white border border-[#DFE2EB] rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#0B1C30] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                      {activeSession.sessionType}
                    </span>
                    <span className="text-xs text-[#505A69] font-mono">
                      โค้ชผู้คุมซ้อม: {activeSession.coachInCharge}
                    </span>
                  </div>
                  <h3 className="font-headline-lg uppercase text-xl sm:text-2xl font-normal text-[#0B1C30]">
                    {activeSession.title}
                  </h3>
                  <p className="text-xs text-[#505A69] font-mono mt-0.5">
                    {activeSession.date} • {activeSession.timeDisplay} • {activeSession.location}
                  </p>
                </div>

                {/* Session Attendance Meter */}
                <div className="flex items-center gap-4 bg-[#F8F9FF] p-4 rounded-lg border border-[#DFE2EB] font-mono text-center shrink-0">
                  <div>
                    <span className="text-[10px] text-[#505A69] uppercase block">อัตราเข้าซ้อม</span>
                    <span className="text-2xl font-headline-xl text-[#0B1C30] font-normal tabular-nums">{attendancePct}%</span>
                  </div>
                  <div className="w-px h-8 bg-[#DFE2EB]" />
                  <div>
                    <span className="text-[10px] text-[#505A69] uppercase block">จำนวนนักกีฬา</span>
                    <span className="text-2xl font-headline-xl text-[#0B1C30] font-normal tabular-nums">{presentCount}/{totalRoster}</span>
                  </div>
                </div>
              </div>

              {/* Roster Attendance Table with 1-Tap Status Check */}
              <div className="bg-white border border-[#DFE2EB] rounded-lg overflow-hidden shadow-xs">
                <div className="px-6 py-4 bg-[#F8F9FF] border-b border-[#DFE2EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                  <div>
                    <span className="font-bold text-[#0B1C30] uppercase">
                      รายชื่อนักกีฬาในทีม BCC (1-TAP CHECK-IN)
                    </span>
                    <p className="text-[#505A69] font-mono text-[11px] mt-0.5">
                      คลิกเปลี่ยนสถานะ: มาซ้อม / มาสาย / ลาป่วย / ขาด
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImportModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white hover:bg-slate-100 text-slate-800 border border-[#DFE2EB] font-mono text-xs font-bold transition shrink-0 cursor-pointer"
                    title="นำเข้ารายชื่อนักกีฬาจาก CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#AF101A]" />
                    <span>นำเข้ารายชื่อจาก CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto font-mono text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8F9FF] border-b border-[#DFE2EB] text-[#505A69] text-[11px] uppercase">
                      <tr>
                        <th className="py-3 px-4">เบอร์ / ชื่อนักกีฬา</th>
                        <th className="py-3 px-4">ตำแหน่ง</th>
                        <th className="py-3 px-4 text-center">เวลาสแกนเข้าสนาม</th>
                        <th className="py-3 px-4 text-center">DISCIPLINE RATING</th>
                        <th className="py-3 px-4 text-center">สถานะการเข้าซ้อม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFE2EB]/60">
                      {activeRoster.map((player) => (
                        <tr key={player.athleteId} className="hover:bg-[#F8F9FF] transition">
                          <td className="py-3.5 px-4 font-bold text-[#0B1C30] flex items-center gap-2">
                            <span className="w-6 h-6 rounded-sm bg-[#0B1C30] text-white flex items-center justify-center text-xs font-mono">
                              #{player.jerseyNumber}
                            </span>
                            <span>{player.athleteName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-[#505A69]">
                            {player.position.replace("_", " ")}
                          </td>
                          <td className="py-3.5 px-4 text-center text-[#505A69] tabular-nums">
                            {player.checkInTime || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-bold text-[#0B1C30] tabular-nums">
                              {(player.disciplineRating ?? 95.0).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-sm border border-[#DFE2EB]">
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(player.athleteId, "PRESENT")}
                                className={`px-2.5 py-1 rounded-sm text-[11px] font-bold transition cursor-pointer ${
                                  player.status === "PRESENT"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                มาซ้อม
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(player.athleteId, "LATE")}
                                className={`px-2.5 py-1 rounded-sm text-[11px] font-bold transition cursor-pointer ${
                                  player.status === "LATE"
                                    ? "bg-amber-600 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                มาสาย
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(player.athleteId, "EXCUSED")}
                                className={`px-2.5 py-1 rounded-sm text-[11px] font-bold transition cursor-pointer ${
                                  player.status === "EXCUSED"
                                    ? "bg-slate-600 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                ลา
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(player.athleteId, "ABSENT")}
                                className={`px-2.5 py-1 rounded-sm text-[11px] font-bold transition cursor-pointer ${
                                  player.status === "ABSENT"
                                    ? "bg-[#AF101A] text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                ขาด
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SPORTS SCIENCE & INJURY LOG */}
          {activeTab === "SPORTS_SCIENCE" && (
            <div className="space-y-6">
              
              {/* Load Management Banner */}
              <div className="bg-[#0B1C30] border border-[#1E3A5F] text-white rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-sm bg-[#AF101A]/20 text-red-200 border border-[#AF101A]/40 text-[10px] font-mono font-bold uppercase">
                    <HeartPulse className="w-3.5 h-3.5 text-[#AF101A]" />
                    <span>LOAD MANAGEMENT &amp; OVERUSE MONITORING</span>
                  </div>
                  <h3 className="font-headline-lg uppercase text-2xl font-normal text-white">
                    รายงานปริมาณชั่วโมงการลงเล่นและความเสี่ยงอาการบาดเจ็บ
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">
                    คำนวณชั่วโมงการลงเล่นรวมจากทัวร์นาเมนต์ TOA, กรมพลศึกษา และการฝึกซ้อมเพื่อลดความเสี่ยง Overuse Injury
                  </p>
                </div>

                <div className="bg-[#142338] border border-[#1E3A5F] p-4 rounded-lg font-mono text-xs space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] block font-bold">
                    นักกีฬาที่มีการแจ้งเตือนความเสี่ยงสูง
                  </span>
                  <div className="text-red-400 font-bold flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="w-4 h-4 text-[#AF101A]" />
                    <span>#7 Thanakorn Siriphan (104 นาที / 7 วัน)</span>
                  </div>
                </div>
              </div>

              {/* Workload Roster Table */}
              <div className="bg-white border border-[#DFE2EB] rounded-lg overflow-hidden shadow-xs">
                <div className="px-6 py-4 bg-[#F8F9FF] border-b border-[#DFE2EB] font-mono text-xs font-bold text-[#0B1C30] uppercase">
                  ตารางตรวจสอบภาระงานนักกีฬา (WORKLOAD &amp; FATIGUE INDEX)
                </div>

                <div className="overflow-x-auto font-mono text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8F9FF] border-b border-[#DFE2EB] text-[#505A69] text-[11px] uppercase">
                      <tr>
                        <th className="py-3 px-4">นักกีฬา</th>
                        <th className="py-3 px-4 text-center">นาทีแข่ง (7 วัน)</th>
                        <th className="py-3 px-4 text-center">นาทีแข่ง (14 วัน)</th>
                        <th className="py-3 px-4 text-center">แมตช์ในสัปดาห์นี้</th>
                        <th className="py-3 px-4 text-center">RECOVERY SCORE</th>
                        <th className="py-3 px-4 text-center">ระดับความเสี่ยงอาการล้า</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFE2EB]/60">
                      {mockPlayerWorkloads.map((wl) => (
                        <tr key={wl.athleteId} className="hover:bg-[#F8F9FF] transition">
                          <td className="py-3.5 px-4 font-bold text-[#0B1C30]">
                            #{wl.jerseyNumber} {wl.athleteName}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                            {wl.minutesLast7Days} นาที
                          </td>
                          <td className="py-3.5 px-4 text-center text-[#505A69] tabular-nums">
                            {wl.minutesLast14Days} นาที
                          </td>
                          <td className="py-3.5 px-4 text-center text-[#505A69] tabular-nums">
                            {wl.gamesPlayedLast7Days} แมตช์
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                            {wl.recoveryScore}%
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {wl.fatigueRisk === "HIGH" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-sm bg-red-50 text-[#AF101A] border border-red-200">
                                <AlertTriangle className="w-3 h-3 text-[#AF101A]" />
                                <span>HIGH RISK (จำกัดนาที)</span>
                              </span>
                            ) : wl.fatigueRisk === "MODERATE" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-200">
                                <span>MODERATE (เฝ้าระวัง)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span>OPTIMAL (พร้อม 100%)</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Active Injury Rehabilitation Log */}
              <div className="bg-white border border-[#DFE2EB] rounded-lg p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#DFE2EB] pb-3">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-[#AF101A]" />
                    <h3 className="font-bold text-base text-[#0B1C30] font-mono uppercase">
                      สมุดบันทึกอาการบาดเจ็บและการฟื้นฟู (INJURY REHAB LOG)
                    </h3>
                  </div>
                  <span className="text-xs text-[#505A69] font-mono">
                    ดูแลโดยแพทย์เวชศาสตร์การกีฬาประจำทีม
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {injuries.map((inj) => (
                    <div
                      key={inj.id}
                      className="p-4 rounded-lg border border-[#DFE2EB] bg-[#F8F9FF] space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-bold text-[#0B1C30] text-sm flex items-center gap-2">
                          <span>#{inj.jerseyNumber} {inj.athleteName}</span>
                          <span className="text-[#AF101A] font-normal">({inj.injuryType})</span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-sm uppercase ${
                            inj.status === "RECOVERED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-red-50 text-[#AF101A] border border-red-200"
                          }`}
                        >
                          {inj.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#505A69] text-[11px]">
                        <div>วันที่เกิดการบาดเจ็บ: <span className="font-bold text-[#0B1C30]">{inj.occurredDate}</span></div>
                        <div>คาดการณ์วันกลับมาลงสนาม: <span className="font-bold text-[#0B1C30]">{inj.expectedReturnDate}</span></div>
                      </div>

                      <p className="text-[11px] text-[#505A69] pt-1 border-t border-[#DFE2EB] font-sans">
                        <span className="font-bold text-slate-800">แผนการรักษาและกายภาพ:</span> {inj.treatmentProtocol}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </section>
      </main>

      <Footer />

      {/* CSV Roster Import & Deduplication Modal */}
      <RosterImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        initialTeamId="team-bcc"
      />
    </div>
  );
}
