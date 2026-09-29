"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  History,
  Clock,
  UserCheck,
  ExternalLink,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  Search,
  Filter,
} from "lucide-react";
import type { AthleteStatsLineageResult, MatchLineageProvenance } from "@/lib/stats/statsLineageService";

interface StatsLineageModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string;
  season?: string;
}

export default function StatsLineageModal({
  isOpen,
  onClose,
  athleteId,
  season = "2026",
}: StatsLineageModalProps) {
  const [data, setData] = useState<AthleteStatsLineageResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"MATCHES" | "TIMELINE">("MATCHES");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CERTIFIED" | "PROVISIONAL" | "DISPUTED">("ALL");
  const [expandedMatches, setExpandedMatches] = useState<Record<string, boolean>>({});
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (!isOpen || !athleteId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/athletes/${athleteId}/stats-lineage?season=${season}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "ไม่สามารถโหลดประวัติที่มาของสถิติได้");
        }
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          setData(json);
          // Expand the first match by default
          if (json.matches?.[0]?.matchId) {
            setExpandedMatches({ [json.matches[0].matchId]: true });
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, athleteId, season]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleMatchExpand = (matchId: string) => {
    setExpandedMatches((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }));
  };

  const handleCopyHash = () => {
    if (!data?.summary.verificationSealHash) return;
    navigator.clipboard.writeText(data.summary.verificationSealHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  // Filtered matches
  const filteredMatches = (data?.matches || []).filter((m) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "CERTIFIED") return m.certification.isCertified;
    if (statusFilter === "PROVISIONAL") return !m.certification.isCertified;
    if (statusFilter === "DISPUTED") return m.reopenHistory.length > 0 || m.reversedEventsCount > 0;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-lineage-title"
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-[#0B1C30] to-slate-950 text-white p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>FEDERATION STATS LINEAGE &amp; PROVENANCE (3.6)</span>
            </div>
            <h2 id="stats-lineage-title" className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>ประวัติและที่มาของสถิติ:</span>
              <span className="text-amber-400 font-sans font-bold">
                {data?.athlete?.fullName || "นักกีฬา"}
              </span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-sans">
              ตรวจสอบที่มาของคะแนนเฉลี่ย, รีบาวด์, แอสซิสต์ และค่าประสิทธิภาพ FIBA จากใบบันทึกคะแนนแข่งขันทางการ พร้อมลายเซ็นกรรมการผู้ตัดสิน และประวัติการรับรองผลอย่างเป็นทางการ
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างประวัติสถิติ"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#F8FAFC]">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#AF101A] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono font-bold text-slate-600">กำลังตรวจสอบสายสัมพันธ์สถิติจากใบบันทึกคะแนน (Loading Lineage Ledger)...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl space-y-3">
              <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
              <p className="text-sm font-bold text-red-800">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#0B1C30] text-white text-xs font-mono font-bold hover:bg-slate-800 transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          ) : data ? (
            <>
              {/* Summary Badges & Integrity Proof Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-mono font-bold text-slate-500 uppercase block">ระดับความน่าเชื่อถือ</span>
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>{data.summary.trustScorePct}% FIBA CERTIFIED</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">รับรองโดยสมาคมบาสเกตบอล</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-mono font-bold text-slate-500 uppercase block">แมตช์ที่นำมาคำนวณ</span>
                    <div className="text-base font-black font-mono text-slate-900">
                      {data.summary.certifiedGames} / {data.summary.totalGames} <span className="text-xs font-normal text-slate-500">เกม</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold">
                      {data.summary.provisionalGames === 0 ? "● ทั้งหมดรับรองทางการแล้ว" : `● ${data.summary.provisionalGames} เกมรอรับรอง`}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-mono font-bold text-slate-500 uppercase block">สถิติสะสมที่ผ่านการตรวจ</span>
                    <div className="text-base font-black font-mono text-[#AF101A]">
                      {data.summary.totalPoints} PTS • {data.summary.ppg} PPG
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {data.summary.rpg} RPG • {data.summary.apg} APG • {data.summary.effPerGame} EFF
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-mono font-bold text-slate-500 uppercase block">สังกัดสโมสร / โรงเรียน</span>
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {data.athlete.schoolOrClub || "ไม่ระบุสังกัด"}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{data.athlete.jerseyNumber || "0"} • {data.athlete.primaryPosition}
                    </span>
                  </div>
                </div>

                {/* Cryptographic Seal & Verification Fingerprint */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>ลายเซ็นดิจิทัลรับรองสถิติ (Deterministic Cryptographic Seal)</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 break-all">
                      SHA256: <span className="text-slate-700 font-bold">{data.summary.verificationSealHash}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-mono font-bold text-slate-700 transition shadow-2xs cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    {copiedHash ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">คัดลอกสำเร็จ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>คัดลอกรหัสตรวจสอบ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* View Tabs & Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("MATCHES")}
                    className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === "MATCHES"
                        ? "bg-[#0B1C30] text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>รายการแมตช์ที่มา ({data.matches.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("TIMELINE")}
                    className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === "TIMELINE"
                        ? "bg-[#0B1C30] text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>ไทม์ไลน์การรับรอง &amp; แก้ไข ({data.timeline.length})</span>
                  </button>
                </div>

                {activeTab === "MATCHES" && (
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
                    <span className="text-slate-400 font-bold text-[11px] mr-1">สถานะ:</span>
                    {(["ALL", "CERTIFIED", "PROVISIONAL", "DISPUTED"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          statusFilter === st
                            ? "bg-[#AF101A] text-white"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {st === "ALL"
                          ? "ทั้งหมด"
                          : st === "CERTIFIED"
                          ? "รับรองแล้ว"
                          : st === "PROVISIONAL"
                          ? "รอรับรอง"
                          : "มีประวัติทักท้วง"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tab 1: Matches Breakdown List */}
              {activeTab === "MATCHES" && (
                <div className="space-y-4">
                  {filteredMatches.length === 0 ? (
                    <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
                      <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">ไม่พบแมตช์ตามเงื่อนไขตัวกรอง</p>
                      <p className="text-xs text-slate-500 font-mono">ลองเปลี่ยนตัวกรองเพื่อดูรายการแข่งขันอื่น</p>
                    </div>
                  ) : (
                    filteredMatches.map((m) => {
                      const isExpanded = Boolean(expandedMatches[m.matchId]);
                      const isCert = m.certification.isCertified;
                      const hasReopen = m.reopenHistory.length > 0;

                      return (
                        <div
                          key={m.matchId}
                          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition hover:border-slate-300"
                        >
                          {/* Card Summary Header */}
                          <div
                            onClick={() => toggleMatchExpand(m.matchId)}
                            className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition"
                          >
                            <div className="space-y-1.5 max-w-xl">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                    isCert
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      : hasReopen
                                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                                      : "bg-slate-100 text-slate-700 border border-slate-200"
                                  }`}
                                >
                                  {isCert ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>CERTIFIED OFFICIAL</span>
                                    </>
                                  ) : hasReopen ? (
                                    <>
                                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                                      <span>DISPUTE REOPENED</span>
                                    </>
                                  ) : (
                                    <span>PROVISIONAL DRAFT</span>
                                  )}
                                </span>

                                <span className="text-xs font-mono text-slate-500">
                                  {m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString("th-TH") : "ไม่ระบุวัน"} • {m.venue}
                                </span>
                              </div>

                              <div className="text-sm font-bold text-slate-900">
                                <span>{m.tournamentName}</span>
                                <span className="text-xs text-slate-500 font-mono ml-2">({m.tournamentCategory})</span>
                              </div>

                              <div className="text-xs font-mono text-slate-600">
                                คู่แข่งขัน: <span className="font-bold text-slate-900">{m.homeTeamName}</span> {m.homeScore} - {m.awayScore} <span className="font-bold text-slate-900">{m.awayTeamName}</span>
                                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${m.isWin ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                  {m.isWin ? "WIN (ชนะ)" : "LOSS (แพ้)"}
                                </span>
                              </div>
                            </div>

                            {/* Performance in this match */}
                            <div className="flex items-center gap-4 sm:gap-6 self-start lg:self-auto">
                              <div className="text-right">
                                <div className="text-lg font-black font-mono text-[#AF101A]">
                                  {m.boxscore.points} <span className="text-xs font-normal text-slate-500">PTS</span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {m.boxscore.rebounds} REB • {m.boxscore.assists} AST • {m.boxscore.fibaEfficiency} EFF
                                </div>
                              </div>

                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Provenance Details */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-1 duration-200">
                              {/* Boxscore Metrics Grid */}
                              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider flex items-center gap-1.5">
                                  <Award className="w-3.5 h-3.5 text-[#AF101A]" />
                                  <span>ใบบันทึกสถิติรายบุคคลในแมตช์นี้ (Official Boxscore)</span>
                                </h4>

                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
                                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] text-slate-400 block">POINTS</span>
                                    <span className="font-bold text-sm text-[#AF101A]">{m.boxscore.points}</span>
                                  </div>
                                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] text-slate-400 block">2PT (M/A)</span>
                                    <span className="font-bold text-slate-800">{m.boxscore.fg2Made}/{m.boxscore.fg2Made + m.boxscore.fg2Missed}</span>
                                  </div>
                                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] text-slate-400 block">3PT (M/A)</span>
                                    <span className="font-bold text-slate-800">{m.boxscore.fg3Made}/{m.boxscore.fg3Made + m.boxscore.fg3Missed}</span>
                                  </div>
                                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] text-slate-400 block">FT (M/A)</span>
                                    <span className="font-bold text-slate-800">{m.boxscore.ftMade}/{m.boxscore.ftMade + m.boxscore.ftMissed}</span>
                                  </div>
                                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] text-slate-400 block">REB (O/D)</span>
                                    <span className="font-bold text-slate-800">{m.boxscore.rebounds} ({m.boxscore.offensiveRebounds}/{m.boxscore.defensiveRebounds})</span>
                                  </div>
                                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] text-slate-400 block">FIBA EFF</span>
                                    <span className="font-bold text-emerald-700">+{m.boxscore.fibaEfficiency}</span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                                  <span>แอสซิสต์: {m.boxscore.assists} • สตีล: {m.boxscore.steals} • บล็อก: {m.boxscore.blocks} • เทิร์นโอเวอร์: {m.boxscore.turnovers} • ฟาวล์: {m.boxscore.fouls}</span>
                                  <span>ลงเล่น: {m.boxscore.minutesPlayed} นาที {m.boxscore.isStarter ? "(ผู้เล่นตัวจริง)" : "(ตัวสำรอง)"}</span>
                                </div>
                              </div>

                              {/* Certification & Authority Verification Box */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                                  <div className="flex items-center gap-1.5 text-slate-700 font-bold font-mono">
                                    <UserCheck className="w-4 h-4 text-emerald-600" />
                                    <span>ผู้รับรองผลการแข่งขัน (Certifying Authority)</span>
                                  </div>
                                  {m.certification.certifiedBy ? (
                                    <div className="space-y-0.5 text-slate-600">
                                      <p className="font-bold text-slate-900">{m.certification.certifiedBy.name}</p>
                                      <p className="text-[11px] font-mono text-slate-500">{m.certification.certifiedBy.email} ({m.certification.certifiedBy.role})</p>
                                      <p className="text-[10px] font-mono text-emerald-700">
                                        ลงนามรับรองเมื่อ: {m.certification.certifiedAt ? new Date(m.certification.certifiedAt).toLocaleString("th-TH") : "-"}
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-slate-400 text-xs py-1">ยังไม่มีการรับรองผลอย่างเป็นทางการจากผู้ดูแลระบบ</p>
                                  )}
                                </div>

                                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                                  <div className="flex items-center gap-1.5 text-slate-700 font-bold font-mono">
                                    <Award className="w-4 h-4 text-indigo-600" />
                                    <span>กรรมการบันทึกโต๊ะเทคนิค (Table Officials)</span>
                                  </div>
                                  <div className="space-y-1">
                                    {m.certification.tableOfficials.map((off, idx) => (
                                      <div key={idx} className="text-slate-600 text-[11px] font-mono">
                                        <span className="font-bold text-slate-900">{off.name}</span>
                                        <span className="text-slate-500 ml-1.5">[{off.licenseNumber || "BSAT License"}]</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Dispute / Reopen Audit History Alert (if any) */}
                              {m.reopenHistory.length > 0 && (
                                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                                  <div className="flex items-center gap-1.5 font-bold font-mono text-amber-800">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>ประวัติการเปิดคำร้องทักท้วง / ตรวจสอบผลแข่งขัน (Dispute Audit History)</span>
                                  </div>
                                  {m.reopenHistory.map((rh) => (
                                    <div key={rh.id} className="pl-5 text-[11px] space-y-0.5">
                                      <p className="font-semibold text-amber-900">• เหตุผล: &quot;{rh.reason || "ขอเปิดแก้ไขใบบันทึกคะแนน"}&quot;</p>
                                      <p className="text-slate-600 font-mono">โดย {rh.approverName} เมื่อ {new Date(rh.createdAt).toLocaleString("th-TH")}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Play-by-Play Event Ledger Table */}
                              {m.eventsLedger.length > 0 && (
                                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold text-slate-700 uppercase">
                                      ใบบันทึกเหตุการณ์ Play-by-Play ({m.eventsLedger.length} รายการ)
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">บันทึกสดขณะแข่งขัน</span>
                                  </div>

                                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                                    {m.eventsLedger.map((ev) => (
                                      <div key={ev.id} className="py-1.5 flex items-center justify-between gap-2 text-[11px] font-mono">
                                        <div className="flex items-center gap-2">
                                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                                            Q{ev.quarter} • {ev.gameClockDisplay}
                                          </span>
                                          <span className="font-semibold text-slate-800">{ev.eventType.replace(/_/g, " ")}</span>
                                          {ev.points > 0 && (
                                            <span className="text-[#AF101A] font-bold">+{ev.points} PTS</span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-slate-400">ผู้ตรวจ: {ev.officialName}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 2: Chronological Audit Timeline */}
              {activeTab === "TIMELINE" && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-600" />
                      <span>บันทึกสายสัมพันธ์เหตุการณ์ตามลำดับเวลา (Chronological Audit Ledger)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      แสดงประวัติการรับรองคะแนน, การตรวจสอบโดยผู้ดูแลระบบ และการเปิดแก้ไขผล เพื่อความโปร่งใสและตรวจสอบย้อนหลังได้ 100%
                    </p>
                  </div>

                  {data.timeline.length === 0 ? (
                    <p className="text-xs text-slate-500 font-mono py-8 text-center">ไม่มีบันทึกเหตุการณ์ประวัติสถิติ</p>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {data.timeline.map((item) => (
                        <div key={item.id} className="relative space-y-1">
                          <span className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${item.badgeColor}`} />
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">{item.title}</span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {new Date(item.timestamp).toLocaleString("th-TH")}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-sans">{item.description}</p>
                          <span className="inline-block text-[10px] font-mono text-slate-400">ผู้ดำเนินการ: {item.actor}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>มาตรฐานข้อมูลสถิติระดับชาติ สมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT x StatCourtTH)</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
