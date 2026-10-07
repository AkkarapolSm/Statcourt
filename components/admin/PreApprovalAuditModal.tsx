"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  FileCheck,
  RefreshCw,
  Trophy,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Loader2,
  Scale,
  Calendar,
  MapPin,
  Send,
} from "lucide-react";
import type { AuditCheckItem } from "@/app/api/matches/[id]/pre-approval-audit/route";

interface PreApprovalAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  onApprovedSuccess?: () => void;
  onReopenedSuccess?: () => void;
}

interface AuditData {
  overallStatus: "READY" | "WARNINGS_DETECTED" | "BLOCKED";
  canApprove: boolean;
  scoreSummary: {
    matchHomeScore: number;
    ledgerHomeScore: number;
    matchAwayScore: number;
    ledgerAwayScore: number;
    isBalanced: boolean;
  };
  eventStats: {
    activeEvents: number;
    reversedEvents: number;
  };
  passCount: number;
  warnCount: number;
  failCount: number;
  checks: AuditCheckItem[];
}

export default function PreApprovalAuditModal({
  isOpen,
  onClose,
  matchId,
  onApprovedSuccess,
  onReopenedSuccess,
}: PreApprovalAuditModalProps) {
  const [data, setData] = useState<{ match: any; audit: AuditData } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [approvalReason, setApprovalReason] = useState(
    "ตรวจสอบใบคะแนนและเหตุการณ์ Play-by-Play ร่วมกับหัวหน้าผู้ตัดสินประจำสนามครบถ้วนแล้ว"
  );
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(null);

  const fetchAuditData = useCallback(async () => {
    if (!matchId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/matches/${matchId}/pre-approval-audit`);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "ไม่สามารถโหลดข้อมูลการตรวจสอบได้");
      }
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูลตรวจสอบ");
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    if (isOpen) {
      fetchAuditData();
      setSuccessMsg(null);
      setError(null);
    }
  }, [isOpen, fetchAuditData]);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/matches/${matchId}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPROVE",
          reason: approvalReason.trim() || undefined,
        }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || "รับรองผลการแข่งขันไม่สำเร็จ");
      }

      setSuccessMsg("รับรองผลการแข่งขันเป็นทางการ (FINAL) สำเร็จ พร้อมอัปเดตสถิติและตารางคะแนนเรียบร้อยแล้ว!");
      setTimeout(() => {
        onApprovedSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการรับรองผล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopen = async () => {
    const reasonPrompt = prompt("กรุณาระบุเหตุผลในการส่งกลับไปแก้ไขผลการแข่งขัน (อย่างน้อย 10 ตัวอักษร):");
    if (!reasonPrompt || reasonPrompt.trim().length < 10) {
      if (reasonPrompt !== null) {
        alert("กรุณาระบุเหตุผลอย่างน้อย 10 ตัวอักษรเพื่อบันทึกประวัติการตรวจสอบ (Audit Trail)");
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/matches/${matchId}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REOPEN",
          reason: reasonPrompt.trim(),
        }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || "เปิดแก้ไขผลการแข่งขันไม่สำเร็จ");
      }

      setSuccessMsg("เปิดแก้ไขผลการแข่งขันเรียบร้อยแล้ว (สถานะเปลี่ยนเป็น DRAFT / DISPUTED)");
      setTimeout(() => {
        onReopenedSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเปิดแก้ไขผล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const audit = data?.audit;
  const match = data?.match;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#0B1C30] rounded-2xl shadow-2xl border border-[#213145] overflow-hidden font-sans text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#213145] bg-[#071322]/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-700/60 flex items-center justify-center text-indigo-400 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/60 border border-indigo-700/60 px-2 py-0.5 rounded-full">
                  PRE-APPROVAL INTEGRITY AUDIT
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {matchId}</span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                ตรวจสอบความครบถ้วนก่อนรับรองผลการแข่งขัน
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAuditData}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#0d223a] border border-transparent hover:border-[#213145] transition cursor-pointer"
              title="รีเฟรชการตรวจสอบ"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#0d223a] border border-transparent hover:border-[#213145] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {isLoading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-200">กำลังวิเคราะห์ความถูกต้องของข้อมูลและเหตุการณ์ Play-by-Play...</p>
              <p className="text-xs text-slate-400">ตรวจสอบความสอดคล้องของคะแนน, บัญชีรายชื่อ, และกติกาการฟาวล์</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs font-bold flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 text-xs font-bold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isLoading && data && audit && (
            <>
              {/* Match Score Summary Header Card */}
              <div className="rounded-2xl border border-[#213145] bg-[#0d223a] p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2.5 border-b border-[#213145]">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{match.tournamentName}</span>
                  </span>
                  <span className="bg-[#071322] border border-[#213145] px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-300">
                    สถานะปัจจุบัน: <span className="font-mono uppercase">{match.resultStatus}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {/* Home Team */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#071322] border border-[#213145]">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-slate-400">ทีมเหย้า <span className="font-mono uppercase text-slate-500">(Home)</span></span>
                      <h4 className="font-bold text-sm text-white truncate">{match.homeTeam.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-white tabular-nums">
                        {match.homeTeam.score}
                      </span>
                      <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                        Ledger: {audit.scoreSummary.ledgerHomeScore}
                      </div>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#071322] border border-[#213145]">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-slate-400">ทีมเยือน <span className="font-mono uppercase text-slate-500">(Away)</span></span>
                      <h4 className="font-bold text-sm text-white truncate">{match.awayTeam.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-white tabular-nums">
                        {match.awayTeam.score}
                      </span>
                      <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                        Ledger: {audit.scoreSummary.ledgerAwayScore}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Integrity Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  audit.overallStatus === "READY"
                    ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-100"
                    : audit.overallStatus === "WARNINGS_DETECTED"
                    ? "bg-amber-950/40 border-amber-800/60 text-amber-100"
                    : "bg-rose-950/40 border-rose-800/60 text-rose-100"
                }`}
              >
                {audit.overallStatus === "READY" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : audit.overallStatus === "WARNINGS_DETECTED" ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">
                      {audit.overallStatus === "READY"
                        ? "ผ่านเกณฑ์การตรวจสอบครบถ้วน (พร้อมรับรองผลเป็นทางการ)"
                        : audit.overallStatus === "WARNINGS_DETECTED"
                        ? "พบข้อสังเกตบางจุด (แนะนำให้ตรวจทานก่อนอนุมัติ)"
                        : "ตรวจพบข้อผิดพลาดร้ายแรง (ระงับการรับรองผล)"}
                    </h3>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed text-slate-300">
                    {audit.overallStatus === "READY"
                      ? "คะแนน Play-by-Play ตรงกับใบคะแนนรวม 100%, ผู้เล่นทุกคนมีรายชื่อในสารบบถูกต้อง และไม่มีการทำฟาวล์เกินเกณฑ์"
                      : audit.overallStatus === "WARNINGS_DETECTED"
                      ? "มีรายการที่ควรตรวจสอบเพิ่มเติม เช่น ข้อมูลสนามหรือควอเตอร์ แต่ยังสามารถพิจารณารับรองผลได้ตามดุลยพินิจของแอดมิน"
                      : "มีข้อผิดพลาดระดับวิกฤต เช่น คะแนนไม่ตรงกับ Ledger หรือมีนักกีฬาเถื่อนที่ไม่มีในรายชื่อทางการ กรุณาสั่งเปิดแก้ไข (Reopen)"}
                  </p>

                  <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-3 text-[11px]">
                    <span className="text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-0.5 rounded-full font-medium">
                      ผ่าน: <span className="font-mono font-bold tabular-nums">{audit.passCount}</span>
                    </span>
                    <span className="text-amber-300 bg-amber-950/80 border border-amber-700/60 px-2.5 py-0.5 rounded-full font-medium">
                      แจ้งเตือน: <span className="font-mono font-bold tabular-nums">{audit.warnCount}</span>
                    </span>
                    <span className="text-rose-300 bg-rose-950/80 border border-rose-700/60 px-2.5 py-0.5 rounded-full font-medium">
                      ไม่ผ่าน: <span className="font-mono font-bold tabular-nums">{audit.failCount}</span>
                    </span>
                    <span className="text-slate-400 sm:ml-auto">
                      เหตุการณ์ทั้งหมด: <span className="font-mono font-bold text-slate-200 tabular-nums">{audit.eventStats.activeEvents}</span> Play
                    </span>
                  </div>
                </div>
              </div>

              {/* 5-Pillar Detailed Checklist */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">รายการตรวจสอบ 5 ด้าน</span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">(5-Pillar Audit Checklist)</span>
                </div>

                <div className="space-y-2">
                  {audit.checks.map((item) => {
                    const isExpanded = expandedCheckId === item.id;
                    const isPass = item.status === "PASS";
                    const isWarn = item.status === "WARN";

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border transition-all ${
                          isPass
                            ? "border-[#213145] bg-[#0d223a]"
                            : isWarn
                            ? "border-amber-800/60 bg-amber-950/20"
                            : "border-rose-800/60 bg-rose-950/20"
                        }`}
                      >
                        <div
                          className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-[#071322]/50 transition rounded-2xl"
                          onClick={() => setExpandedCheckId(isExpanded ? null : item.id)}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            {isPass ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            ) : isWarn ? (
                              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-white truncate">{item.titleTh}</h5>
                              <p className="text-[11px] text-slate-400 font-mono truncate">{item.titleEn}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span
                              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                isPass
                                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60"
                                  : isWarn
                                  ? "bg-amber-950/80 text-amber-300 border border-amber-700/60"
                                  : "bg-rose-950/80 text-rose-300 border border-rose-700/60"
                              }`}
                            >
                              {item.status}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        {isExpanded && (
                          <div className="px-4 pb-3.5 pt-2 text-xs border-t border-[#213145]/60 space-y-2">
                            <p className="text-slate-200 leading-relaxed font-sans">{item.detailsTh}</p>
                            <p className="text-slate-400 text-[11px] font-sans">{item.detailsEn}</p>

                            {item.evidence && (
                              <div className="mt-2 p-3 rounded-xl bg-[#071322] border border-[#213145] font-mono text-[11px] space-y-1">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">หลักฐานในระบบ (System Evidence):</div>
                                <pre className="text-slate-300 whitespace-pre-wrap break-all overflow-x-auto text-[10px]">
                                  {JSON.stringify(item.evidence, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Admin Certification Reason Input */}
              <div className="space-y-2 pt-2 border-t border-[#213145]">
                <label className="block text-xs font-semibold text-slate-300">
                  หมายเหตุการรับรองผลอย่างเป็นทางการ <span className="font-mono text-slate-500 uppercase tracking-wider text-[11px]">(Official Certification Audit Note)</span>
                </label>
                <textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  rows={2}
                  className="w-full bg-[#071322] border border-[#213145] rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#AF101A] focus:border-[#AF101A] font-sans transition"
                  placeholder="ระบุเหตุผลและหลักฐานการตรวจรับรองผล..."
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#213145] bg-[#071322]/90 shrink-0">
          <button
            type="button"
            onClick={handleReopen}
            disabled={isSubmitting || isLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-800/80 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>สั่งเปิดแก้ไขผล (REOPEN / DISPUTE)</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#213145] bg-[#0d223a] hover:bg-[#122842] text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>

            <button
              type="button"
              onClick={handleApprove}
              disabled={isSubmitting || isLoading || (audit && !audit.canApprove)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึกและซิงก์สถิติ...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>ยืนยันรับรองผลทางการ (APPROVE FINAL)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

