"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ChevronRight,
  X,
  Play,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import type { ScheduleConflict } from "@/lib/tournaments/bracketEngine";

interface TeamItem {
  teamId: string;
  teamName: string;
  institution: string;
  isRosterLocked: boolean;
}

interface StandingItem {
  id: string;
  teamId: string;
  groupName: string;
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDiff: number;
  points: number;
  rank: number;
  team: {
    id: string;
    name: string;
    shortName: string | null;
  };
}

interface MatchItem {
  id: string;
  round: string | null;
  scheduledAt: string | null;
  venue: string | null;
  courtName: string | null;
  status: string;
  resultStatus: string;
  homeScore: number;
  awayScore: number;
  homeTeam: { id: string; name: string; shortName: string | null };
  awayTeam: { id: string; name: string; shortName: string | null };
}

interface BracketData {
  tournament: {
    id: string;
    name: string;
    category: string;
    status: string;
    venue: string | null;
    startDate: string;
    endDate: string;
  };
  summary: {
    approvedTeamsCount: number;
    lockedRostersCount: number;
    isAllRostersLocked: boolean;
    totalMatches: number;
    conflictsCount: number;
  };
  teams: TeamItem[];
  groups: Record<string, StandingItem[]>;
  groupMatches: MatchItem[];
  knockoutRounds: Record<string, MatchItem[]>;
  conflicts: ScheduleConflict[];
}

interface TournamentBracketManagerProps {
  tournamentId: string;
  isOpen: boolean;
  onClose: () => void;
  canManage?: boolean;
}

export default function TournamentBracketManager({
  tournamentId,
  isOpen,
  onClose,
  canManage = false,
}: TournamentBracketManagerProps) {
  const { currentUser } = useAuthStore();
  const isAdminOrOfficial = canManage || currentUser.role === "ADMIN" || currentUser.role === "OFFICIAL";

  const [data, setData] = useState<BracketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"BRACKETS" | "SCHEDULE" | "CONFLICTS">("BRACKETS");

  // Generator Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [genFormat, setGenFormat] = useState<"GROUP_STAGE" | "SINGLE_ELIMINATION">("GROUP_STAGE");
  const [genGroupCount, setGenGroupCount] = useState(2);
  const [genStartDate, setGenStartDate] = useState("");
  const [genStartTime, setGenStartTime] = useState("09:00");
  const [genVenue, setGenVenue] = useState("");
  const [genCourts, setGenCourts] = useState("คอร์ท 1, คอร์ท 2");
  const [genLockRosters, setGenLockRosters] = useState(true);
  const [genClearExisting, setGenClearExisting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchBracketData = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/brackets`);
      if (!res.ok) {
        throw new Error("ไม่สามารถโหลดสายการแข่งขันได้");
      }
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (json.tournament?.venue && !genVenue) {
          setGenVenue(json.tournament.venue);
        }
        if (json.tournament?.startDate && !genStartDate) {
          setGenStartDate(json.tournament.startDate.split("T")[0]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }, [tournamentId, genVenue, genStartDate]);

  useEffect(() => {
    if (isOpen) {
      fetchBracketData();
      setActionMessage(null);
    }
  }, [isOpen, fetchBracketData]);

  if (!isOpen) return null;

  // Toggle Roster Lock for all approved teams
  const handleToggleRosterLock = async (lock: boolean) => {
    setSubmitting(true);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/roster-lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lock }),
      });
      const resJson = await res.json();
      if (res.ok) {
        setActionMessage({ text: resJson.message, type: "success" });
        await fetchBracketData();
      } else {
        setActionMessage({ text: resJson.error || "ดำเนินการไม่สำเร็จ", type: "error" });
      }
    } catch {
      setActionMessage({ text: "การเชื่อมต่อล้มเหลว", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Bracket Generation
  const handleGenerateBrackets = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMessage(null);
    try {
      const courtList = genCourts
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const res = await fetch(`/api/tournaments/${tournamentId}/brackets/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: genFormat,
          groupCount: Number(genGroupCount) || 2,
          startDate: genStartDate || undefined,
          dailyStartTime: genStartTime || "09:00",
          matchDurationMins: 90,
          minRestMins: 120,
          venue: genVenue || undefined,
          courts: courtList.length > 0 ? courtList : ["คอร์ทหลัก"],
          lockRosters: genLockRosters,
          clearExistingMatches: genClearExisting,
        }),
      });

      const resJson = await res.json();
      if (res.ok) {
        setActionMessage({ text: resJson.message, type: "success" });
        setShowGenModal(false);
        await fetchBracketData();
      } else {
        setActionMessage({ text: resJson.error || "สร้างสายการแข่งขันไม่สำเร็จ", type: "error" });
      }
    } catch {
      setActionMessage({ text: "การเชื่อมต่อล้มเหลว", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const tournament = data?.tournament;
  const summary = data?.summary;
  const groups = data?.groups || {};
  const knockoutRounds = data?.knockoutRounds || {};
  const conflicts = data?.conflicts || [];
  const groupNames = Object.keys(groups);
  const knockoutRoundNames = Object.keys(knockoutRounds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans text-slate-800">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:px-6 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                  TOURNAMENT BRACKETS &amp; SCHEDULE
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {tournament?.category || "U18"}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-0.5">
                {tournament?.name || "สายการแข่งขันและตารางสนาม"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isAdminOrOfficial && (
              <>
                <button
                  type="button"
                  onClick={() => setShowGenModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>จัดสายอัตโนมัติ</span>
                </button>

                {summary && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleToggleRosterLock(!summary.isAllRostersLocked)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                      summary.isAllRostersLocked
                        ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60"
                        : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                    }`}
                    title={summary.isAllRostersLocked ? "คลิกเพื่อปลดล็อกรายชื่อ" : "คลิกเพื่อล็อกรายชื่อทุกทีม"}
                  >
                    {summary.isAllRostersLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ล็อกรายชื่อแล้ว ({summary.lockedRostersCount}/{summary.approvedTeamsCount})</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-amber-400" />
                        <span>ล็อกรายชื่อก่อนแข่ง ({summary.lockedRostersCount}/{summary.approvedTeamsCount})</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={fetchBracketData}
              disabled={loading}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="รีเฟรช"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-bold flex items-center justify-between shrink-0 ${
              actionMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200"
                : "bg-red-50 text-red-800 border-b border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="text-[10px] font-mono underline uppercase"
            >
              ปิด
            </button>
          </div>
        )}

        {/* KPI & Status Strip */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:px-6 bg-slate-50 border-b border-slate-200 text-xs font-mono shrink-0">
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase">ทีมรับรองแล้ว</span>
              <div className="text-base font-black text-slate-800">{summary.approvedTeamsCount} ทีม</div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase">สถานะรายชื่อ</span>
              <div className="text-base font-black text-slate-800 flex items-center gap-1.5">
                {summary.isAllRostersLocked ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-xs">
                    <Lock className="w-3.5 h-3.5" /> ล็อกครบถ้วน
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1 text-xs">
                    <Unlock className="w-3.5 h-3.5" /> รอการล็อก ({summary.approvedTeamsCount - summary.lockedRostersCount})
                  </span>
                )}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase">แมตช์ทั้งหมด</span>
              <div className="text-base font-black text-slate-800">{summary.totalMatches} แมตช์</div>
            </div>
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase">เวลา/สนามชนกัน</span>
              <div className="text-base font-black text-slate-800">
                {summary.conflictsCount === 0 ? (
                  <span className="text-emerald-600 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ไม่มีข้อขัดแย้ง
                  </span>
                ) : (
                  <span className="text-red-600 text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {summary.conflictsCount} ข้อขัดแย้ง
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("BRACKETS")}
            className={`pb-2.5 font-mono text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === "BRACKETS"
                ? "border-[#AF101A] text-[#AF101A]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            สายการแข่งขัน (Brackets &amp; Pools)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("SCHEDULE")}
            className={`pb-2.5 font-mono text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === "SCHEDULE"
                ? "border-[#AF101A] text-[#AF101A]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            ตารางแข่งแยกสนาม ({summary?.totalMatches || 0})
          </button>
          {conflicts.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("CONFLICTS")}
              className={`pb-2.5 font-mono text-xs font-bold transition border-b-2 cursor-pointer text-red-600 flex items-center gap-1 ${
                activeTab === "CONFLICTS" ? "border-red-600 font-black" : "border-transparent opacity-80"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ตรวจพบเวลาชน ({conflicts.length})</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading && (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#AF101A]" />
              <p className="text-xs font-bold">กำลังโหลดสายการแข่งขันและคำนวณตาราง...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && data && (
            <>
              {/* TAB 1: BRACKETS (Groups & Knockout) */}
              {activeTab === "BRACKETS" && (
                <div className="space-y-6">
                  {/* Group Stage Pool Play */}
                  {groupNames.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h3 className="text-xs font-mono font-black uppercase text-slate-700 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-indigo-600" />
                          <span>รอบแบ่งกลุ่ม (Group Stage Pools)</span>
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groupNames.map((gName) => {
                          const standings = groups[gName];
                          return (
                            <div
                              key={gName}
                              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs"
                            >
                              <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                                <span className="font-mono text-xs font-black text-slate-800 uppercase">
                                  {gName}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  {standings.length} ทีม
                                </span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-50 text-[10px] font-mono text-slate-500 uppercase border-b border-slate-200">
                                    <tr>
                                      <th className="py-2 px-3 text-center">อันดับ</th>
                                      <th className="py-2 px-3">ทีม</th>
                                      <th className="py-2 px-2 text-center">แข่ง</th>
                                      <th className="py-2 px-2 text-center">ชนะ</th>
                                      <th className="py-2 px-2 text-center">แพ้</th>
                                      <th className="py-2 px-2 text-center">ได้-เสีย</th>
                                      <th className="py-2 px-3 text-right">แต้ม</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-[11px]">
                                    {standings.map((st, idx) => (
                                      <tr key={st.id} className="hover:bg-slate-50">
                                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-500">
                                          {idx + 1}
                                        </td>
                                        <td className="py-2 px-3 font-bold text-slate-900 truncate max-w-[140px]">
                                          {st.team.name}
                                        </td>
                                        <td className="py-2 px-2 text-center font-mono">{st.played}</td>
                                        <td className="py-2 px-2 text-center font-mono font-bold text-emerald-600">
                                          {st.won}
                                        </td>
                                        <td className="py-2 px-2 text-center font-mono text-red-500">
                                          {st.lost}
                                        </td>
                                        <td className="py-2 px-2 text-center font-mono text-slate-500">
                                          {st.pointsDiff > 0 ? `+${st.pointsDiff}` : st.pointsDiff}
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono font-black text-[#AF101A]">
                                          {st.points}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Knockout Brackets Tree */}
                  {knockoutRoundNames.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h3 className="text-xs font-mono font-black uppercase text-slate-700 flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span>รอบแพ้คัดออก (Knockout Brackets)</span>
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {knockoutRoundNames.map((rName) => {
                          const roundMatches = knockoutRounds[rName];
                          return (
                            <div
                              key={rName}
                              className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3 shadow-xs"
                            >
                              <div className="font-mono text-xs font-black text-slate-800 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                                <span>{rName}</span>
                                <span className="text-[10px] text-slate-400">{roundMatches.length} คู่</span>
                              </div>

                              <div className="space-y-2.5">
                                {roundMatches.map((m) => (
                                  <div
                                    key={m.id}
                                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs hover:border-[#AF101A]/30 transition"
                                  >
                                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                      <span>{m.courtName || "คอร์ทหลัก"}</span>
                                      <span>
                                        {m.scheduledAt
                                          ? new Date(m.scheduledAt).toLocaleTimeString("th-TH", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "รอระบุเวลา"}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between font-bold text-slate-800">
                                      <span className="truncate pr-2">{m.homeTeam.name}</span>
                                      <span className="font-mono font-black text-[#AF101A] shrink-0">
                                        {m.homeScore}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between font-bold text-slate-800">
                                      <span className="truncate pr-2">{m.awayTeam.name}</span>
                                      <span className="font-mono font-black text-[#AF101A] shrink-0">
                                        {m.awayScore}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {groupNames.length === 0 && knockoutRoundNames.length === 0 && (
                    <div className="py-16 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-700">
                        ยังไม่มีการจัดสายการแข่งขันในทัวร์นาเมนต์นี้
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        มีทีมที่ได้รับการอนุมัติแล้ว {summary?.approvedTeamsCount || 0} ทีม สามารถคลิกปุ่ม{" "}
                        <span className="font-bold text-amber-600">"จัดสายอัตโนมัติ"</span> ด้านบนเพื่อสร้างสายและตารางสนามทันที
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MASTER COURT SCHEDULE */}
              {activeTab === "SCHEDULE" && (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] font-mono text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">วันที่ / เวลา</th>
                          <th className="py-3 px-3">สนาม / คอร์ท</th>
                          <th className="py-3 px-3">รอบ</th>
                          <th className="py-3 px-4">คู่แข่งขัน &amp; สกอร์</th>
                          <th className="py-3 px-3 text-center">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {data.groupMatches.concat(Object.values(data.knockoutRounds).flat()).map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono">
                              {m.scheduledAt ? (
                                <>
                                  <span className="font-bold text-slate-800">
                                    {new Date(m.scheduledAt).toLocaleDateString("th-TH", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </span>{" "}
                                  <span className="text-slate-500">
                                    {new Date(m.scheduledAt).toLocaleTimeString("th-TH", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </>
                              ) : (
                                <span className="text-slate-400">ยังไม่กำหนด</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-slate-800">{m.venue || "-"}</span>
                              <span className="block text-[11px] font-mono text-slate-500">
                                {m.courtName || "คอร์ทหลัก"}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                              {m.round || "-"}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-800">
                                {m.homeTeam.name}{" "}
                                <span className="font-mono text-[#AF101A] px-1">{m.homeScore}</span> -{" "}
                                <span className="font-mono text-[#AF101A] px-1">{m.awayScore}</span>{" "}
                                {m.awayTeam.name}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                  m.resultStatus === "FINAL"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : m.status === "LIVE"
                                    ? "bg-red-50 text-red-700 border border-red-200 animate-pulse"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                              >
                                {m.resultStatus === "FINAL" ? "FINAL" : m.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: SCHEDULE CONFLICTS */}
              {activeTab === "CONFLICTS" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                    <span>
                      ระบบตรวจพบข้อขัดแย้ง {conflicts.length} จุด ขอแนะนำให้ปรับเวลาหรือเปลี่ยนคอร์ทแข่งขัน
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {conflicts.map((c, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-white border border-red-200 shadow-xs space-y-1.5"
                      >
                        <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-red-700">
                          <span className="px-2 py-0.5 rounded bg-red-100 border border-red-200">
                            {c.type === "COURT_OVERLAP" ? "สนามชนกัน (Court Overlap)" : "เวลาพักไม่พอ (Rest Breach)"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-semibold">{c.descriptionTh}</p>
                        <div className="text-[10px] font-mono text-slate-400">
                          เวลา: {new Date(c.scheduledTimeA).toLocaleTimeString("th-TH")} vs{" "}
                          {new Date(c.scheduledTimeB).toLocaleTimeString("th-TH")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>FIBA Regulation Bracket &amp; Scheduling Engine</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

        {/* MODAL: Auto-Generate Brackets & Court Schedule */}
        {showGenModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>สร้างสายและจัดตารางอัตโนมัติ (Auto-Scheduler)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleGenerateBrackets} className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase font-mono text-[11px]">
                    รูปแบบการแข่งขัน (Tournament Format)
                  </label>
                  <select
                    value={genFormat}
                    onChange={(e: any) => setGenFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#AF101A]"
                  >
                    <option value="GROUP_STAGE">รอบแบ่งกลุ่ม (Group Stage / Pool Play)</option>
                    <option value="SINGLE_ELIMINATION">แพ้คัดออก (Single Elimination Knockout)</option>
                  </select>
                </div>

                {genFormat === "GROUP_STAGE" && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase font-mono text-[11px]">
                      จำนวนกลุ่ม (Number of Groups)
                    </label>
                    <select
                      value={genGroupCount}
                      onChange={(e) => setGenGroupCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#AF101A]"
                    >
                      <option value={1}>1 กลุ่ม (พบกันหมดในพูลเดียว)</option>
                      <option value={2}>2 กลุ่ม (Group A, Group B)</option>
                      <option value={4}>4 กลุ่ม (Group A, B, C, D)</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase font-mono text-[11px]">
                      วันที่เริ่มแข่งขัน
                    </label>
                    <input
                      type="date"
                      value={genStartDate}
                      onChange={(e) => setGenStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#AF101A]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase font-mono text-[11px]">
                      เวลาเริ่มแข่งนัดแรก
                    </label>
                    <input
                      type="time"
                      value={genStartTime}
                      onChange={(e) => setGenStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#AF101A]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase font-mono text-[11px]">
                    สถานที่แข่งขัน (Venue)
                  </label>
                  <input
                    type="text"
                    value={genVenue}
                    onChange={(e) => setGenVenue(e.target.value)}
                    placeholder="เช่น อาคารกีฬานิมิบุตร สนามกีฬาแห่งชาติ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#AF101A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase font-mono text-[11px]">
                    คอร์ทสนามที่ใช้ได้ (คั่นด้วยเครื่องหมายจุลภาค)
                  </label>
                  <input
                    type="text"
                    value={genCourts}
                    onChange={(e) => setGenCourts(e.target.value)}
                    placeholder="คอร์ท 1, คอร์ท 2, คอร์ท 3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#AF101A]"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={genLockRosters}
                      onChange={(e) => setGenLockRosters(e.target.checked)}
                      className="rounded border-slate-300 text-[#AF101A] focus:ring-[#AF101A]"
                    />
                    <span className="font-bold text-slate-700">
                      ล็อกรายชื่อนักกีฬาทุกทีมทันที (Lock All Team Rosters)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={genClearExisting}
                      onChange={(e) => setGenClearExisting(e.target.checked)}
                      className="rounded border-slate-300 text-[#AF101A] focus:ring-[#AF101A]"
                    />
                    <span className="text-slate-600">
                      ล้างแมตช์เดิมที่ยังไม่แข่งขันก่อนสร้างใหม่ (Clear Unplayed Matches)
                    </span>
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGenModal(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold font-mono"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-[#0B1C30] hover:bg-[#1A365D] text-white font-mono font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังประมวลผล...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>สร้างสาย &amp; จัดตารางเดี๋ยวนี้</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
