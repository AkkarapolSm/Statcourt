"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Zap,
  Crosshair,
  CalendarCheck,
  Activity,
  AlertTriangle,
  HeartPulse,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  UserCheck,
  Share2,
  Smartphone,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
  QrCode,
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
  const { currentUser, loginAs } = useAuthStore();
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

  // Non-coach Access Gate (Strict RBAC protection: Only Coaches & Admins can access Team Operations Hub)
  if (!canManage) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white flex flex-col font-sans relative overflow-x-hidden">
        <Navbar />
        {/* Subtle Background Ambience */}
        <div className="fixed inset-0 court-grid-pattern pointer-events-none opacity-40" />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

        <main className="flex-1 flex items-center justify-center p-4 py-16 relative z-10">
          <div className="w-full max-w-lg bg-[#101622] border border-white/10 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(245,158,11,0.2)]">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#2b1014] border border-red-500/30 text-red-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>RESTRICTED COACH OPERATIONS HUB</span>
              </div>
              <h1 className="font-headline-lg text-xl sm:text-2xl uppercase tracking-wider text-white">
                พื้นที่สงวนสิทธิ์เฉพาะผู้ฝึกสอน (Coaches Only)
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-md mx-auto">
                ระบบ Team Hub (การวางแท็กติกการเล่น, วิเคราะห์คู่แข่ง, เช็กชื่อการฝึกซ้อม และ Sports Science) สงวนสิทธิ์การเข้าถึงเฉพาะผู้ฝึกสอนต้นสังกัดเท่านั้น (Coaches Only) บัญชีผู้ใช้อื่นไม่สามารถเข้าถึงหรือมองเห็นได้
              </p>
            </div>

            <div className="space-y-2.5 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => loginAs("COACH")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-[#AF101A] hover:from-red-500 hover:to-red-600 text-white font-bold uppercase transition flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>เข้าสู่ระบบบัญชีผู้ฝึกสอน</span>
              </button>
              <Link
                href="/tournaments"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold uppercase transition border border-slate-700 flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>ดูตารางการแข่งขันและสายแข่ง (Tournaments)</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 py-2 text-slate-400 hover:text-white transition text-xs"
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
        <section className="bg-[#0F172A] text-white py-12 border-b border-slate-800">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#AF101A]/30 border border-[#AF101A]/50 text-red-200 text-xs font-mono font-bold tracking-widest uppercase">
                    <ShieldCheck className="w-4 h-4 text-[#DC2626]" />
                    <span>TEAM OPERATIONS &amp; SPORTS SCIENCE</span>
                  </div>
                  {canManage ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      COACH ACCESS: {currentUser.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono">
                      SPECTATOR VIEW
                    </span>
                  )}
                </div>
                <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider font-normal text-white leading-tight">
                  ระบบบริหารทีมและแท็กติก <br />
                  <span className="text-[#DC2626]">Bangkok Christian College</span> (BCC U18)
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  ศูนย์กลางการปฏิบัติการประจำวันสำหรับสตาฟฟ์โค้ช: วิเคราะห์จุดบอดคู่แข่ง (Debsirin),
                  รายงานเทียบจุดยิง, ติดตามการฝึกซ้อม และระบบมอนิเตอร์อาการล้าสะสม
                </p>
              </div>

              {/* Quick Status Pill */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-6">
                <div className="space-y-1 font-mono">
                  <div className="text-[11px] text-slate-400 uppercase font-bold">
                    แมตช์สำคัญถัดไป
                  </div>
                  <div className="text-lg font-bold text-white">
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
        <section className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-2 overflow-x-auto font-mono text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("OPPOSITION")}
                className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "OPPOSITION"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>OPPOSITION SCOUTING (DEBSIRIN)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("SHOT_CHART")}
                className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "SHOT_CHART"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Crosshair className="w-4 h-4" />
                <span>HEAD-TO-HEAD SHOT CHART</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ATTENDANCE")}
                className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "ATTENDANCE"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>PRACTICE &amp; ATTENDANCE</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("SPORTS_SCIENCE")}
                className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "SPORTS_SCIENCE"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <HeartPulse className="w-4 h-4 text-red-500" />
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
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <span className="text-slate-400 uppercase font-bold block text-[10px]">
                    แนวโน้มทิศทางการไดรฟ์บอล (DRIVE DIRECTION)
                  </span>
                  <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                    <span className="text-[#DC2626]">ขวา {mockOppositionReport.driveTendency.rightPct}%</span>
                    <span className="text-slate-400">ซ้าย {mockOppositionReport.driveTendency.leftPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-[#DC2626]" style={{ width: `${mockOppositionReport.driveTendency.rightPct}%` }} />
                    <div className="bg-slate-400" style={{ width: `${mockOppositionReport.driveTendency.leftPct}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    การ์ดคู่แข่งเลี้ยงมือขวาเป็นหลัก บีบให้ออกซ้ายตลอดเวลา
                  </div>
                </div>

                {/* Transition Pace */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <span className="text-slate-400 uppercase font-bold block text-[10px]">
                    ความเร็วเกมสวนกลับ (FASTBREAK PACE)
                  </span>
                  <div className="text-2xl font-headline-xl text-slate-900 font-normal">
                    {mockOppositionReport.transitionPacePpg} PPG
                  </div>
                  <div className="text-[10px] text-slate-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-[#AF101A]" />
                    <span>วิ่งสวนกลับเร็วอันดับ 2 ของลีก</span>
                  </div>
                </div>

                {/* Q3 Slump */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <span className="text-slate-400 uppercase font-bold block text-[10px]">
                    จุดบอดควอเตอร์ 3 (Q3 NET RATING DROP)
                  </span>
                  <div className="text-2xl font-headline-xl text-[#DC2626] font-normal flex items-center gap-1">
                    <TrendingDown className="w-6 h-6" />
                    <span>{mockOppositionReport.q3RatingDrop}</span>
                  </div>
                  <div className="text-[10px] text-slate-700 font-bold">
                    โอกาสทอง: แต้มเฉลี่ยคู่แข่งจะตกฮวบใน Q3
                  </div>
                </div>

                {/* Match Details */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
                  <span className="text-slate-400 uppercase font-bold block text-[10px]">
                    รายการแข่งขัน
                  </span>
                  <div className="font-bold text-slate-900 text-xs">
                    {mockOppositionReport.tournamentName}
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1">
                    สนาม: นิมิบุตร สนามกีฬาแห่งชาติ
                  </div>
                </div>

              </div>

              {/* Vulnerabilities & Key Defensive Rules */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Vulnerabilities List */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-base text-slate-900 font-mono uppercase">
                      จุดอ่อนเชิงโครงสร้างของคู่แข่ง (VULNERABILITIES)
                    </h3>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {mockOppositionReport.vulnerabilities.map((vuln, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
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
                <div className="lg:col-span-6 bg-[#0F172A] text-white border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-red-500" />
                      <h3 className="font-bold text-base text-white font-mono uppercase">
                        กฎเหล็กการเล่นป้องกัน 4 ข้อ (MUST-FOLLOW RULES)
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {mockOppositionReport.gameplanRules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                          rule.isMustFollow
                            ? "bg-red-950/40 border-red-800/80 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                          <span>{rule.rule}</span>
                        </div>
                        {rule.isMustFollow && (
                          <span className="text-[10px] bg-red-800 text-white px-2 py-0.5 rounded font-bold uppercase shrink-0">
                            MUST FOLLOW
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Key Opposition Personnel Scouting Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 font-mono uppercase text-sm">
                    วิเคราะห์รายบุคคลผู้เล่นตัวหลักของเทพศิรินทร์ (KEY PERSONNEL)
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    สถิติอ้างอิงจากแมตช์ย้อนหลัง 5 นัด
                  </span>
                </div>

                <div className="overflow-x-auto font-mono text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                      <tr>
                        <th className="py-3 px-4">ผู้เล่นคู่แข่ง</th>
                        <th className="py-3 px-4">ตำแหน่ง</th>
                        <th className="py-3 px-4 text-center">PPG</th>
                        <th className="py-3 px-4 text-center">EFF</th>
                        <th className="py-3 px-4">จุดเด่น / พฤติกรรมในสนาม (TENDENCY)</th>
                        <th className="py-3 px-4">แท็กติกรับมือ (DEFENSIVE ASSIGNMENT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockOppositionReport.keyPersonnel.map((p) => (
                        <tr key={p.number} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            #{p.number} {p.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {p.position}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-[#DC2626]">
                            {p.ppg}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                            {p.eff}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 text-[11px]">
                            {p.keyTendency}
                          </td>
                          <td className="py-3.5 px-4 text-[#AF101A] font-bold text-[11px]">
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

          {/* TAB 3: HEAD-TO-HEAD SHOT CHART COMPARISON */}
          {activeTab === "SHOT_CHART" && (
            <div className="space-y-6">
              <ShotChartComparison />
            </div>
          )}

          {/* TAB 4: PRACTICE & ATTENDANCE TRACKING */}
          {activeTab === "ATTENDANCE" && (
            <div className="space-y-6">
              
              {/* Practice Session Selector & Summary Strip */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {activeSession.sessionType}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      โค้ชผู้คุมซ้อม: {activeSession.coachInCharge}
                    </span>
                  </div>
                  <h3 className="font-headline-lg uppercase text-xl sm:text-2xl font-normal text-slate-900">
                    {activeSession.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {activeSession.date} • {activeSession.timeDisplay} • {activeSession.location}
                  </p>
                </div>

                {/* Session Attendance Meter */}
                <div className="flex items-center gap-4 bg-[#F8F9FC] p-4 rounded-xl border border-slate-100 font-mono text-center shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">อัตราเข้าซ้อม</span>
                    <span className="text-2xl font-headline-xl text-slate-900 font-normal">{attendancePct}%</span>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">จำนวนนักกีฬา</span>
                    <span className="text-2xl font-headline-xl text-slate-900 font-normal">{presentCount}/{totalRoster}</span>
                  </div>
                </div>
              </div>

              {/* Roster Attendance Table with 1-Tap Status Check */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                  <div>
                    <span className="font-bold text-slate-900 uppercase">
                      รายชื่อนักกีฬาในทีม BCC (1-TAP CHECK-IN)
                    </span>
                    <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                      {canManage
                        ? "คลิกเปลี่ยนสถานะ: มาซ้อม / มาสาย / ลาป่วย / ขาด"
                        : "สถานะการเข้าซ้อม (โหมดเข้าชมทั่วไป - สิทธิ์แก้ไขเฉพาะสตาฟฟ์โค้ช)"}
                    </p>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setImportModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-mono text-xs font-bold transition shrink-0 cursor-pointer"
                      title="นำเข้ารายชื่อนักกีฬาจาก CSV"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                      <span>นำเข้ารายชื่อจาก CSV</span>
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto font-mono text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                      <tr>
                        <th className="py-3 px-4">เบอร์ / ชื่อนักกีฬา</th>
                        <th className="py-3 px-4">ตำแหน่ง</th>
                        <th className="py-3 px-4 text-center">เวลาสแกนเข้าสนาม</th>
                        <th className="py-3 px-4 text-center">DISCIPLINE RATING</th>
                        <th className="py-3 px-4 text-center">สถานะการเข้าซ้อม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeRoster.map((player) => (
                        <tr key={player.athleteId} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-mono">
                              #{player.jerseyNumber}
                            </span>
                            <span>{player.athleteName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {player.position.replace("_", " ")}
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-500">
                            {player.checkInTime || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-bold text-slate-900">
                              {(player.disciplineRating ?? 95.0).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {canManage ? (
                              <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(player.athleteId, "PRESENT")}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                    player.status === "PRESENT"
                                      ? "bg-slate-900 text-white shadow-xs"
                                      : "text-slate-500 hover:text-slate-800"
                                  }`}
                                >
                                  มาซ้อม
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(player.athleteId, "LATE")}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                    player.status === "LATE"
                                      ? "bg-slate-700 text-white shadow-xs"
                                      : "text-slate-500 hover:text-slate-800"
                                  }`}
                                >
                                  มาสาย
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(player.athleteId, "EXCUSED")}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                    player.status === "EXCUSED"
                                      ? "bg-slate-300 text-slate-900 shadow-xs"
                                      : "text-slate-500 hover:text-slate-800"
                                  }`}
                                >
                                  ลา
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(player.athleteId, "ABSENT")}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                    player.status === "ABSENT"
                                      ? "bg-[#AF101A] text-white shadow-xs"
                                      : "text-slate-500 hover:text-slate-800"
                                  }`}
                                >
                                  ขาด
                                </button>
                              </div>
                            ) : (
                              <span
                                className={`px-2.5 py-1 rounded text-xs font-bold inline-block font-mono ${
                                  player.status === "PRESENT"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : player.status === "LATE"
                                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                                    : player.status === "EXCUSED"
                                    ? "bg-slate-100 text-slate-700 border border-slate-200"
                                    : "bg-red-50 text-red-800 border border-red-200"
                                }`}
                                title="สิทธิ์การแก้ไขสถานะการเช็คชื่อจำกัดสำหรับสตาฟฟ์โค้ช"
                              >
                                {player.status === "PRESENT"
                                  ? "มาซ้อม"
                                  : player.status === "LATE"
                                  ? "มาสาย"
                                  : player.status === "EXCUSED"
                                  ? "ลา"
                                  : "ขาด"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: SPORTS SCIENCE & INJURY LOG */}
          {activeTab === "SPORTS_SCIENCE" && (
            <div className="space-y-6">
              
              {/* Load Management Banner */}
              <div className="bg-[#0F172A] border border-slate-800 text-white rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-mono font-bold uppercase">
                    <HeartPulse className="w-3.5 h-3.5 text-red-400" />
                    <span>LOAD MANAGEMENT &amp; OVERUSE MONITORING</span>
                  </div>
                  <h3 className="font-headline-lg uppercase text-2xl font-normal text-white">
                    รายงานปริมาณชั่วโมงการลงเล่นและความเสี่ยงอาการบาดเจ็บ
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    คำนวณชั่วโมงการลงเล่นรวมจากทัวร์นาเมนต์ TOA, กรมพลศึกษา และการฝึกซ้อมเพื่อลดความเสี่ยง Overuse Injury
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono text-xs space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] block font-bold">
                    นักกีฬาที่มีการแจ้งเตือนความเสี่ยงสูง
                  </span>
                  <div className="text-red-400 font-bold flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>#7 Thanakorn Siriphan (104 นาที / 7 วัน)</span>
                  </div>
                </div>
              </div>

              {/* Workload Roster Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-mono text-xs font-bold text-slate-900 uppercase">
                  ตารางตรวจสอบภาระงานนักกีฬา (WORKLOAD &amp; FATIGUE INDEX)
                </div>

                <div className="overflow-x-auto font-mono text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                      <tr>
                        <th className="py-3 px-4">นักกีฬา</th>
                        <th className="py-3 px-4 text-center">นาทีแข่ง (7 วัน)</th>
                        <th className="py-3 px-4 text-center">นาทีแข่ง (14 วัน)</th>
                        <th className="py-3 px-4 text-center">แมตช์ในสัปดาห์นี้</th>
                        <th className="py-3 px-4 text-center">RECOVERY SCORE</th>
                        <th className="py-3 px-4 text-center">ระดับความเสี่ยงอาการล้า</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockPlayerWorkloads.map((wl) => (
                        <tr key={wl.athleteId} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            #{wl.jerseyNumber} {wl.athleteName}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                            {wl.minutesLast7Days} นาที
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-600">
                            {wl.minutesLast14Days} นาที
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-600">
                            {wl.gamesPlayedLast7Days} แมตช์
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                            {wl.recoveryScore}%
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {wl.fatigueRisk === "HIGH" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                                <AlertTriangle className="w-3 h-3" />
                                <span>HIGH RISK (จำกัดนาที)</span>
                              </span>
                            ) : wl.fatigueRisk === "MODERATE" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                                <span>MODERATE (เฝ้าระวัง)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded bg-slate-900 text-white border border-slate-800">
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
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-base text-slate-900 font-mono uppercase">
                      สมุดบันทึกอาการบาดเจ็บและการฟื้นฟู (INJURY REHAB LOG)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    ดูแลโดยแพทย์เวชศาสตร์การกีฬาประจำทีม
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {injuries.map((inj) => (
                    <div
                      key={inj.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>#{inj.jerseyNumber} {inj.athleteName}</span>
                          <span className="text-red-700 font-normal">({inj.injuryType})</span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase ${
                            inj.status === "RECOVERED"
                              ? "bg-slate-900 text-white border border-slate-800"
                              : "bg-red-950 text-red-300 border border-red-800"
                          }`}
                        >
                          {inj.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px]">
                        <div>วันที่เกิดการบาดเจ็บ: <span className="font-bold text-slate-800">{inj.occurredDate}</span></div>
                        <div>คาดการณ์วันกลับมาลงสนาม: <span className="font-bold text-slate-900">{inj.expectedReturnDate}</span></div>
                      </div>

                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                        <span className="font-bold text-slate-700">แผนการรักษาและกายภาพ:</span> {inj.treatmentProtocol}
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
