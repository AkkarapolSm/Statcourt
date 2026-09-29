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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  PRE-APPROVAL INTEGRITY AUDIT
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {matchId}</span>
              </div>
              <h2 className="text-lg font-black text-[#0B1C30] uppercase tracking-tight mt-0.5">
                ตรวจสอบความครบถ้วนก่อนรับรองผลการแข่งขัน
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAuditData}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
              title="รีเฟรชการตรวจสอบ"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {isLoading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-700">กำลังวิเคราะห์ความถูกต้องของข้อมูลและเหตุการณ์ Play-by-Play...</p>
              <p className="text-xs text-slate-400">ตรวจสอบความสอดคล้องของคะแนน, บัญชีรายชื่อ, และกติกาการฟาวล์</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isLoading && data && audit && (
            <>
              {/* Match Score Summary Header Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-2.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>{match.tournamentName}</span>
                  </span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700 uppercase">
                    สถานะปัจจุบัน: {match.resultStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {/* Home Team */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">ทีมเหย้า (Home)</span>
                      <h4 className="font-bold text-sm text-[#0B1C30] truncate">{match.homeTeam.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-[#0B1C30] tabular-nums">
                        {match.homeTeam.score}
                      </span>
                      <div className="text-[10px] font-mono text-slate-400">
                        Ledger: {audit.scoreSummary.ledgerHomeScore}
                      </div>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">ทีมเยือน (Away)</span>
                      <h4 className="font-bold text-sm text-[#0B1C30] truncate">{match.awayTeam.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-[#0B1C30] tabular-nums">
                        {match.awayTeam.score}
                      </span>
                      <div className="text-[10px] font-mono text-slate-400">
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
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : audit.overallStatus === "WARNINGS_DETECTED"
                    ? "bg-amber-50 border-amber-200 text-amber-950"
                    : "bg-red-50 border-red-200 text-red-950"
                }`}
              >
                {audit.overallStatus === "READY" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : audit.overallStatus === "WARNINGS_DETECTED" ? (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm uppercase tracking-tight">
                      {audit.overallStatus === "READY"
                        ? "ผ่านเกณฑ์การตรวจสอบครบถ้วน (พร้อมรับรองผลเป็นทางการ)"
                        : audit.overallStatus === "WARNINGS_DETECTED"
                        ? "พบข้อสังเกตบางจุด (แนะนำให้ตรวจทานก่อนอนุมัติ)"
                        : "ตรวจพบข้อผิดพลาดร้ายแรง (ระงับการรับรองผล)"}
                    </h3>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {audit.overallStatus === "READY"
                      ? "คะแนน Play-by-Play ตรงกับใบคะแนนรวม 100%, ผู้เล่นทุกคนมีรายชื่อในสารบบถูกต้อง และไม่มีการทำฟาวล์เกินเกณฑ์"
                      : audit.overallStatus === "WARNINGS_DETECTED"
                      ? "มีรายการที่ควรตรวจสอบเพิ่มเติม เช่น ข้อมูลสนามหรือควอเตอร์ แต่ยังสามารถพิจารณารับรองผลได้ตามดุลยพินิจของแอดมิน"
                      : "มีข้อผิดพลาดระดับวิกฤต เช่น คะแนนไม่ตรงกับ Ledger หรือมีนักกีฬาเถื่อนที่ไม่มีในรายชื่อทางการ กรุณาสั่งเปิดแก้ไข (Reopen)"}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-[11px] font-mono font-bold">
                    <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      ผ่าน: {audit.passCount}
                    </span>
                    <span className="text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                      แจ้งเตือน: {audit.warnCount}
                    </span>
                    <span className="text-red-700 bg-red-100/80 px-2 py-0.5 rounded">
                      ไม่ผ่าน: {audit.failCount}
                    </span>
                    <span className="text-slate-500 ml-auto">
                      เหตุการณ์ทั้งหมด: {audit.eventStats.activeEvents} Play
                    </span>
                  </div>
                </div>
              </div>

              {/* 5-Pillar Detailed Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  รายการตรวจสอบ 5 ด้าน (5-Pillar Audit Checklist)
                </h4>

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
                            ? "border-slate-200 bg-white"
                            : isWarn
                            ? "border-amber-200 bg-amber-50/30"
                            : "border-red-200 bg-red-50/30"
                        }`}
                      >
                        <div
                          className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50/50 transition"
                          onClick={() => setExpandedCheckId(isExpanded ? null : item.id)}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            {isPass ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            ) : isWarn ? (
                              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-[#0B1C30] truncate">{item.titleTh}</h5>
                              <p className="text-[11px] text-slate-500 font-mono truncate">{item.titleEn}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                                isPass
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isWarn
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
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
                          <div className="px-4 pb-3.5 pt-1 text-xs border-t border-slate-100/80 space-y-2">
                            <p className="text-slate-700 leading-relaxed font-sans">{item.detailsTh}</p>
                            <p className="text-slate-400 text-[11px] font-sans">{item.detailsEn}</p>

                            {item.evidence && (
                              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">หลักฐานในระบบ (System Evidence):</div>
                                <pre className="text-slate-700 whitespace-pre-wrap break-all overflow-x-auto text-[10px]">
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
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase">
                  หมายเหตุการรับรองผลอย่างเป็นทางการ (Official Certification Audit Note):
                </label>
                <textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-sans"
                  placeholder="ระบุเหตุผลและหลักฐานการตรวจรับรองผล..."
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={handleReopen}
            disabled={isSubmitting || isLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>สั่งเปิดแก้ไขผล (REOPEN / DISPUTE)</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-mono font-bold transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>

            <button
              type="button"
              onClick={handleApprove}
              disabled={isSubmitting || isLoading || (audit && !audit.canApprove)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
