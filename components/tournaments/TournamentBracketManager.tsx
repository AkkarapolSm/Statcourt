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

const defaultGroups: Record<string, StandingItem[]> = {
  "Group A (สาย ก)": [
    { id: "g-1", teamId: "team-bcc", groupName: "Group A", played: 2, won: 2, lost: 0, pointsFor: 168, pointsAgainst: 132, pointsDiff: 36, points: 4, rank: 1, team: { id: "team-bcc", name: "กรุงเทพคริสเตียนวิทยาลัย", shortName: "BCC" } },
    { id: "g-2", teamId: "team-ds", groupName: "Group A", played: 2, won: 1, lost: 1, pointsFor: 145, pointsAgainst: 140, pointsDiff: 5, points: 3, rank: 2, team: { id: "team-ds", name: "เทพศิรินทร์", shortName: "DS" } },
    { id: "g-3", teamId: "team-ac", groupName: "Group A", played: 2, won: 1, lost: 1, pointsFor: 139, pointsAgainst: 144, pointsDiff: -5, points: 3, rank: 3, team: { id: "team-ac", name: "อัสสัมชัญ บางรัก", shortName: "AC" } },
    { id: "g-4", teamId: "team-sk", groupName: "Group A", played: 2, won: 0, lost: 2, pointsFor: 120, pointsAgainst: 156, pointsDiff: -36, points: 2, rank: 4, team: { id: "team-sk", name: "สวนกุหลาบวิทยาลัย", shortName: "SK" } },
  ],
  "Group B (สาย ข)": [
    { id: "g-5", teamId: "team-satit-cu", groupName: "Group B", played: 2, won: 2, lost: 0, pointsFor: 152, pointsAgainst: 128, pointsDiff: 24, points: 4, rank: 1, team: { id: "team-satit-cu", name: "สาธิตจุฬาลงกรณ์ฯ", shortName: "CUD" } },
    { id: "g-6", teamId: "team-bansomdej", groupName: "Group B", played: 2, won: 1, lost: 1, pointsFor: 142, pointsAgainst: 138, pointsDiff: 4, points: 3, rank: 2, team: { id: "team-bansomdej", name: "บ้านสมเด็จจูเนียร์", shortName: "BSD" } },
    { id: "g-7", teamId: "team-swu", groupName: "Group B", played: 2, won: 1, lost: 1, pointsFor: 135, pointsAgainst: 141, pointsDiff: -6, points: 3, rank: 3, team: { id: "team-swu", name: "สาธิต มศว ประสานมิตร", shortName: "SWU" } },
    { id: "g-8", teamId: "team-triam", groupName: "Group B", played: 2, won: 0, lost: 2, pointsFor: 119, pointsAgainst: 141, pointsDiff: -22, points: 2, rank: 4, team: { id: "team-triam", name: "เตรียมอุดมศึกษา", shortName: "TU" } },
  ],
};

const defaultGroupMatches: MatchItem[] = [
  { id: "m-01", round: "รอบแรก (Pool A)", scheduledAt: "2026-10-15T09:00:00Z", venue: "อาคารนิมิบุตร", courtName: "คอร์ท 1", status: "LIVE", resultStatus: "LIVE", homeScore: 58, awayScore: 54, homeTeam: { id: "team-bcc", name: "กรุงเทพคริสเตียนวิทยาลัย", shortName: "BCC" }, awayTeam: { id: "team-ds", name: "เทพศิรินทร์", shortName: "DS" } },
  { id: "m-02", round: "รอบแรก (Pool B)", scheduledAt: "2026-10-15T10:45:00Z", venue: "อาคารนิมิบุตร", courtName: "คอร์ท 2", status: "SCHEDULED", resultStatus: "UPCOMING", homeScore: 0, awayScore: 0, homeTeam: { id: "team-satit-cu", name: "สาธิตจุฬาลงกรณ์ฯ", shortName: "CUD" }, awayTeam: { id: "team-bansomdej", name: "บ้านสมเด็จจูเนียร์", shortName: "BSD" } },
  { id: "m-03", round: "รอบแรก (Pool A)", scheduledAt: "2026-10-15T13:00:00Z", venue: "อาคารนิมิบุตร", courtName: "คอร์ท 1", status: "SCHEDULED", resultStatus: "UPCOMING", homeScore: 0, awayScore: 0, homeTeam: { id: "team-ac", name: "อัสสัมชัญ บางรัก", shortName: "AC" }, awayTeam: { id: "team-sk", name: "สวนกุหลาบวิทยาลัย", shortName: "SK" } },
  { id: "m-04", round: "รอบแรก (Pool B)", scheduledAt: "2026-10-15T14:45:00Z", venue: "อาคารนิมิบุตร", courtName: "คอร์ท 2", status: "SCHEDULED", resultStatus: "UPCOMING", homeScore: 0, awayScore: 0, homeTeam: { id: "team-swu", name: "สาธิต มศว ประสานมิตร", shortName: "SWU" }, awayTeam: { id: "team-triam", name: "เตรียมอุดมศึกษา", shortName: "TU" } },
];

const defaultKnockoutRounds: Record<string, MatchItem[]> = {
  "รอบรองชนะเลิศ (Semi-finals)": [
    { id: "sf-01", round: "รอบรองฯ คู่ 1", scheduledAt: "2026-11-18T14:00:00Z", venue: "อาคารนิมิบุตร", courtName: "คอร์ท 1", status: "SCHEDULED", resultStatus: "UPCOMING", homeScore: 0, awayScore: 0, homeTeam: { id: "seed-a1", name: "อันดับ 1 สาย ก (BCC)", shortName: "1A" }, awayTeam: { id: "seed-b2", name: "อันดับ 2 สาย ข (BSD)", shortName: "2B" } },
    { id: "sf-02", round: "รอบรองฯ คู่ 2", scheduledAt: "2026-11-18T16:00:00Z", venue: "อาคารนิมิบุตร", courtName: "คอร์ท 1", status: "SCHEDULED", resultStatus: "UPCOMING", homeScore: 0, awayScore: 0, homeTeam: { id: "seed-b1", name: "อันดับ 1 สาย ข (CUD)", shortName: "1B" }, awayTeam: { id: "seed-a2", name: "อันดับ 2 สาย ก (DS)", shortName: "2A" } },
  ],
  "รอบชิงชนะเลิศ (Championship Final)": [
    { id: "fn-01", round: "ชิงชนะเลิศ", scheduledAt: "2026-11-20T15:30:00Z", venue: "อาคารนิมิบุตร", courtName: "คอร์ท 1", status: "SCHEDULED", resultStatus: "UPCOMING", homeScore: 0, awayScore: 0, homeTeam: { id: "win-sf1", name: "ผู้ชนะรอบรองฯ คู่ 1", shortName: "W-SF1" }, awayTeam: { id: "win-sf2", name: "ผู้ชนะรอบรองฯ คู่ 2", shortName: "W-SF2" } },
  ],
};

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
  const [courtFilter, setCourtFilter] = useState<string>("ALL");

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

  const hasRealMatches =
    Boolean(data?.groupMatches && data.groupMatches.length > 0) ||
    Boolean(data?.knockoutRounds && Object.keys(data.knockoutRounds).length > 0);

  const tournament = data?.tournament;
  const summary = data?.summary;
  const groups = hasRealMatches && data?.groups && Object.keys(data.groups).length > 0
    ? data.groups
    : defaultGroups;
  const knockoutRounds = hasRealMatches && data?.knockoutRounds && Object.keys(data.knockoutRounds).length > 0
    ? data.knockoutRounds
    : defaultKnockoutRounds;
  const conflicts = data?.conflicts || [];
  const groupNames = Object.keys(groups);
  const knockoutRoundNames = Object.keys(knockoutRounds);

  const allMatchesList = hasRealMatches
    ? (data?.groupMatches || []).concat(Object.values(data?.knockoutRounds || {}).flat())
    : defaultGroupMatches.concat(Object.values(defaultKnockoutRounds).flat());

  const filteredMatches = courtFilter === "ALL"
    ? allMatchesList
    : allMatchesList.filter((m) => m.courtName?.includes(courtFilter));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B1C30]/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#DFE2EB] overflow-hidden font-sans text-slate-800"
      >
        {/* Header: Clean, Authoritative, Editorial Style */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:px-6 bg-[#0B1C30] text-white shrink-0 border-b border-[#213145]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#AF101A]/30 text-rose-300 border border-[#AF101A]/40">
                FIBA Official Bracket
              </span>
              <span className="text-xs text-slate-400">
                รุ่น {tournament?.category || "U18"}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-headline text-white tracking-normal">
              ผังสายการแข่งขันและตารางสนาม
            </h2>
            <p className="text-xs text-slate-300 font-sans line-clamp-1">
              {tournament?.name || "TOA Youth Basketball League Thailand 2026"}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isAdminOrOfficial && (
              <>
                <button
                  type="button"
                  onClick={() => setShowGenModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>จัดสายอัตโนมัติ</span>
                </button>

                {summary && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleToggleRosterLock(!summary.isAllRostersLocked)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                      summary.isAllRostersLocked
                        ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60"
                        : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                    }`}
                    title={summary.isAllRostersLocked ? "คลิกเพื่อปลดล็อกรายชื่อ" : "คลิกเพื่อล็อกรายชื่อทุกทีม"}
                  >
                    {summary.isAllRostersLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ล็อกรายชื่อแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          ล็อกรายชื่อ ({summary.lockedRostersCount}/{summary.approvedTeamsCount})
                        </span>
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
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#142C47] transition cursor-pointer"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#142C47] transition cursor-pointer"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between shrink-0 ${
              actionMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200"
                : "bg-red-50 text-red-800 border-b border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline ml-4"
            >
              ปิด
            </button>
          </div>
        )}

        {/* KPI & Status Strip: Courtside Ice & Deep Ink */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:px-6 bg-[#F8F9FF] border-b border-[#DFE2EB] text-xs shrink-0">
          <div className="p-3 rounded-xl bg-white border border-[#DFE2EB] shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block mb-0.5">ทีมในสายการแข่งขัน</span>
            <div className="text-base font-extrabold text-[#0B1C30] tabular-nums">
              {summary?.approvedTeamsCount || 8} <span className="text-xs font-normal text-slate-500">ทีม</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#DFE2EB] shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block mb-0.5">รูปแบบการแข่งขัน</span>
            <div className="text-xs font-bold text-[#0B1C30] truncate mt-0.5">
              รอบแบ่งกลุ่ม + น็อกเอาต์
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#DFE2EB] shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block mb-0.5">สนามแข่งขัน</span>
            <div className="text-xs font-bold text-[#0B1C30] truncate mt-0.5">
              {tournament?.venue || "อาคารนิมิบุตร (คอร์ท 1, 2)"}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#DFE2EB] shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block mb-0.5">จำนวนแมตช์ทั้งหมด</span>
            <div className="text-base font-extrabold text-[#AF101A] tabular-nums">
              {allMatchesList.length} <span className="text-xs font-normal text-slate-500">แมตช์</span>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#DFE2EB] bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("BRACKETS")}
            className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "BRACKETS"
                ? "border-[#AF101A] text-[#AF101A]"
                : "border-transparent text-slate-500 hover:text-[#0B1C30]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ผังสายการแข่งขัน (Pools &amp; Brackets)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("SCHEDULE")}
            className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "SCHEDULE"
                ? "border-[#AF101A] text-[#AF101A]"
                : "border-transparent text-slate-500 hover:text-[#0B1C30]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>ตารางแข่งแยกสนาม ({allMatchesList.length})</span>
          </button>
          {isAdminOrOfficial && conflicts.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("CONFLICTS")}
              className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer text-red-600 flex items-center gap-1.5 ${
                activeTab === "CONFLICTS" ? "border-red-600 font-black" : "border-transparent opacity-80"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ตรวจพบเวลาชน ({conflicts.length})</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-[#AF101A]" />
                          <span>รอบแบ่งกลุ่ม (Group Stage Pools)</span>
                        </h3>
                        <span className="text-[11px] text-slate-500">
                          คัดอันดับ 1-2 เข้าสู่รอบน็อกเอาต์
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groupNames.map((gName) => {
                          const standings = groups[gName];
                          return (
                            <div
                              key={gName}
                              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:shadow-xs transition"
                            >
                              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-[#0B1C30]">
                                  {gName}
                                </span>
                                <span className="text-[11px] font-medium text-slate-500 tabular-nums">
                                  {standings.length} ทีม
                                </span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-[#F8F9FF] text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                                    <tr>
                                      <th className="py-2.5 px-3 text-center w-12">อันดับ</th>
                                      <th className="py-2.5 px-3">ทีม</th>
                                      <th className="py-2.5 px-2 text-center w-10">แข่ง</th>
                                      <th className="py-2.5 px-2 text-center w-10">ชนะ</th>
                                      <th className="py-2.5 px-2 text-center w-10">แพ้</th>
                                      <th className="py-2.5 px-2 text-center w-16">ได้-เสีย</th>
                                      <th className="py-2.5 px-3 text-right w-12">แต้ม</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-xs">
                                    {standings.map((st, idx) => (
                                      <tr
                                        key={st.id}
                                        className={`hover:bg-slate-50/80 transition ${
                                          idx < 2 ? "bg-emerald-50/20" : ""
                                        }`}
                                      >
                                        <td className="py-2 px-3 text-center tabular-nums font-bold">
                                          <span
                                            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                                              idx === 0
                                                ? "bg-amber-100 text-amber-800 font-black"
                                                : idx === 1
                                                ? "bg-slate-200 text-slate-800 font-bold"
                                                : "text-slate-500"
                                            }`}
                                          >
                                            {idx + 1}
                                          </span>
                                        </td>
                                        <td className="py-2 px-3 font-semibold text-slate-900 truncate max-w-[150px]">
                                          {st.team.name}
                                        </td>
                                        <td className="py-2 px-2 text-center tabular-nums text-slate-600">
                                          {st.played}
                                        </td>
                                        <td className="py-2 px-2 text-center tabular-nums font-bold text-emerald-600">
                                          {st.won}
                                        </td>
                                        <td className="py-2 px-2 text-center tabular-nums text-red-500">
                                          {st.lost}
                                        </td>
                                        <td className="py-2 px-2 text-center tabular-nums text-slate-600 font-medium">
                                          {st.pointsDiff > 0 ? `+${st.pointsDiff}` : st.pointsDiff}
                                        </td>
                                        <td className="py-2 px-3 text-right tabular-nums font-bold text-[#AF101A]">
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
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span>รอบแพ้คัดออก (Knockout Brackets)</span>
                        </h3>
                        <span className="text-[11px] text-slate-500">
                          สายการแข่งขันสู่ตำแหน่งแชมป์
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {knockoutRoundNames.map((rName) => {
                          const roundMatches = knockoutRounds[rName];
                          return (
                            <div
                              key={rName}
                              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs"
                            >
                              <div className="text-xs font-bold text-[#0B1C30] border-b border-slate-100 pb-2 flex items-center justify-between">
                                <span>{rName}</span>
                                <span className="text-[11px] text-slate-500 tabular-nums">
                                  {roundMatches.length} คู่
                                </span>
                              </div>

                              <div className="space-y-3">
                                {roundMatches.map((m) => {
                                  const isHomeWinner = m.resultStatus === "FINAL" && m.homeScore > m.awayScore;
                                  const isAwayWinner = m.resultStatus === "FINAL" && m.awayScore > m.homeScore;

                                  return (
                                    <div
                                      key={m.id}
                                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#AF101A]/30 transition space-y-2"
                                    >
                                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                                        <span className="font-medium">{m.courtName || "คอร์ทหลัก"}</span>
                                        <span className="tabular-nums">
                                          {m.scheduledAt
                                            ? new Date(m.scheduledAt).toLocaleTimeString("th-TH", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })
                                            : "รอระบุเวลา"}
                                        </span>
                                      </div>

                                      <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center justify-between">
                                          <span
                                            className={`text-xs truncate pr-2 ${
                                              isHomeWinner
                                                ? "font-extrabold text-[#0B1C30]"
                                                : "font-semibold text-slate-700"
                                            }`}
                                          >
                                            {m.homeTeam.name}
                                          </span>
                                          <span
                                            className={`tabular-nums text-xs px-1.5 py-0.5 rounded-md ${
                                              isHomeWinner
                                                ? "bg-[#AF101A] text-white font-extrabold"
                                                : "bg-slate-200 text-slate-800 font-bold"
                                            }`}
                                          >
                                            {m.homeScore}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span
                                            className={`text-xs truncate pr-2 ${
                                              isAwayWinner
                                                ? "font-extrabold text-[#0B1C30]"
                                                : "font-semibold text-slate-700"
                                            }`}
                                          >
                                            {m.awayTeam.name}
                                          </span>
                                          <span
                                            className={`tabular-nums text-xs px-1.5 py-0.5 rounded-md ${
                                              isAwayWinner
                                                ? "bg-[#AF101A] text-white font-extrabold"
                                                : "bg-slate-200 text-slate-800 font-bold"
                                            }`}
                                          >
                                            {m.awayScore}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
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
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
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
                  {/* Court Filter Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-[#DFE2EB]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 font-bold text-xs">เลือกคอร์ท:</span>
                      {["ALL", "คอร์ท 1", "คอร์ท 2"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCourtFilter(c)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            courtFilter === c
                              ? "bg-[#0B1C30] text-white shadow-2xs"
                              : "bg-white text-slate-600 hover:bg-slate-100 border border-[#CBD5E1]"
                          }`}
                        >
                          {c === "ALL" ? "ทุกคอร์ท" : c}
                        </button>
                      ))}
                    </div>
                    <span className="text-slate-500 font-medium text-xs tabular-nums">
                      แสดง {filteredMatches.length} คู่แข่งขัน
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#DFE2EB]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F9FF] text-slate-700 font-bold border-b border-[#DFE2EB]">
                        <tr>
                          <th className="py-3 px-4">วันที่ / เวลา</th>
                          <th className="py-3 px-3">สนาม / คอร์ท</th>
                          <th className="py-3 px-3">รอบการแข่งขัน</th>
                          <th className="py-3 px-4">คู่แข่งขัน &amp; สกอร์</th>
                          <th className="py-3 px-3 text-center">สถานะ</th>
                          <th className="py-3 px-3 text-right">แอ็กชัน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DFE2EB] text-xs">
                        {filteredMatches.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 tabular-nums">
                              {m.scheduledAt ? (
                                <>
                                  <span className="font-bold text-[#0B1C30]">
                                    {new Date(m.scheduledAt).toLocaleDateString("th-TH", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </span>{" "}
                                  <span className="text-slate-500">
                                    {new Date(m.scheduledAt).toLocaleTimeString("th-TH", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })} น.
                                  </span>
                                </>
                              ) : (
                                <span className="text-slate-400">ยังไม่กำหนด</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-[#0B1C30]">{m.venue || "อาคารนิมิบุตร"}</span>
                              <span className="block text-[11px] text-slate-500">
                                {m.courtName || "คอร์ท 1"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-medium">
                              {m.round || "-"}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#0B1C30] flex items-center gap-2">
                                <span className="truncate max-w-[140px]">{m.homeTeam.name}</span>
                                <span className="tabular-nums font-bold text-[#AF101A] px-1.5 py-0.5 bg-slate-100 rounded-md">
                                  {m.homeScore}
                                </span>
                                <span className="text-slate-400 font-normal">-</span>
                                <span className="tabular-nums font-bold text-[#AF101A] px-1.5 py-0.5 bg-slate-100 rounded-md">
                                  {m.awayScore}
                                </span>
                                <span className="truncate max-w-[140px]">{m.awayTeam.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  m.resultStatus === "FINAL"
                                    ? "bg-slate-100 text-slate-700 border border-slate-300"
                                    : m.status === "LIVE"
                                    ? "bg-rose-50 text-[#AF101A] border border-rose-200 animate-pulse"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {m.status === "LIVE" ? "กำลังแข่ง (LIVE)" : m.resultStatus === "FINAL" ? "จบการแข่งขัน" : "รอการแข่งขัน"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Link
                                href="/live"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#AF101A]/10 hover:bg-[#AF101A] hover:text-white text-[#AF101A] font-bold text-xs transition"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>ดูสด/ย้อนหลัง</span>
                              </Link>
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
                    <span className="font-semibold">
                      ระบบตรวจพบข้อขัดแย้ง {conflicts.length} จุด ขอแนะนำให้ปรับเวลาหรือเปลี่ยนคอร์ทแข่งขัน
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {conflicts.map((c, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white border border-red-200 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 border border-red-200">
                            {c.type === "COURT_OVERLAP" ? "สนามชนกัน (Court Overlap)" : "เวลาพักไม่พอ (Rest Breach)"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-semibold">{c.descriptionTh}</p>
                        <div className="text-[11px] text-slate-500 tabular-nums">
                          เวลา: {new Date(c.scheduledTimeA).toLocaleTimeString("th-TH")} น. vs{" "}
                          {new Date(c.scheduledTimeB).toLocaleTimeString("th-TH")} น.
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">FIBA Regulation Bracket &amp; Scheduling Engine</span>
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
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#0B1C30]/75 backdrop-blur-xs animate-fadeIn">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
              <div className="p-4 bg-[#0B1C30] text-white flex items-center justify-between border-b border-[#213145]">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>สร้างสายและจัดตารางอัตโนมัติ (Auto-Scheduler)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                  aria-label="ปิดกล่องสร้างสาย"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleGenerateBrackets} className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs block">
                    รูปแบบการแข่งขัน (Tournament Format)
                  </label>
                  <select
                    value={genFormat}
                    onChange={(e: any) => setGenFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#AF101A] focus:ring-1 focus:ring-[#AF101A]"
                  >
                    <option value="GROUP_STAGE">รอบแบ่งกลุ่ม (Group Stage / Pool Play)</option>
                    <option value="SINGLE_ELIMINATION">แพ้คัดออก (Single Elimination Knockout)</option>
                  </select>
                </div>

                {genFormat === "GROUP_STAGE" && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-xs block">
                      จำนวนกลุ่ม (Number of Groups)
                    </label>
                    <select
                      value={genGroupCount}
                      onChange={(e) => setGenGroupCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#AF101A] focus:ring-1 focus:ring-[#AF101A]"
                    >
                      <option value={1}>1 กลุ่ม (พบกันหมดในพูลเดียว)</option>
                      <option value={2}>2 กลุ่ม (Group A, Group B)</option>
                      <option value={4}>4 กลุ่ม (Group A, B, C, D)</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-xs block">
                      วันที่เริ่มแข่งขัน
                    </label>
                    <input
                      type="date"
                      value={genStartDate}
                      onChange={(e) => setGenStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl tabular-nums text-xs focus:outline-none focus:border-[#AF101A] focus:ring-1 focus:ring-[#AF101A]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-xs block">
                      เวลาเริ่มแข่งนัดแรก
                    </label>
                    <input
                      type="time"
                      value={genStartTime}
                      onChange={(e) => setGenStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl tabular-nums text-xs focus:outline-none focus:border-[#AF101A] focus:ring-1 focus:ring-[#AF101A]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs block">
                    สถานที่แข่งขัน (Venue)
                  </label>
                  <input
                    type="text"
                    value={genVenue}
                    onChange={(e) => setGenVenue(e.target.value)}
                    placeholder="เช่น อาคารกีฬานิมิบุตร สนามกีฬาแห่งชาติ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#AF101A] focus:ring-1 focus:ring-[#AF101A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs block">
                    คอร์ทสนามที่ใช้ได้ (คั่นด้วยเครื่องหมายจุลภาค)
                  </label>
                  <input
                    type="text"
                    value={genCourts}
                    onChange={(e) => setGenCourts(e.target.value)}
                    placeholder="คอร์ท 1, คอร์ท 2, คอร์ท 3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#AF101A] focus:ring-1 focus:ring-[#AF101A]"
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
                    <span className="font-semibold text-slate-700">
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
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-[#0B1C30] hover:bg-[#152e4d] text-white font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm transition active:scale-[0.98]"
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
