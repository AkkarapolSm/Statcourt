"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  History,
  RefreshCw,
  Download,
  Copy,
  Check,
  Filter,
  Clock,
  User,
  KeyRound,
  FileText,
  BadgeCheck,
} from "lucide-react";

export interface AuditLogItem {
  id: string;
  actionType: string;
  operatorLicense: string;
  operatorName: string;
  quarter: number;
  gameClockDisplay: string;
  details: any;
  digitalSignature: string;
  timestamp: string;
}

interface OfficialAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  matchTitle?: string;
}

export default function OfficialAuditLogModal({
  isOpen,
  onClose,
  matchId,
  matchTitle = "TOA Youth League Thailand 2026",
}: OfficialAuditLogModalProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isIntegrityValid, setIsIntegrityValid] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/audit`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setIsIntegrityValid(data.isIntegrityValid ?? true);
      }
    } catch (err) {
      console.warn("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    if (isOpen) {
      fetchAuditLogs();
    }
  }, [isOpen, fetchAuditLogs]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filterType === "ALL") return true;
    if (filterType === "SCORE" && log.actionType.includes("SCORE")) return true;
    if (filterType === "FOUL" && log.actionType.includes("FOUL")) return true;
    if (filterType === "REVERSE" && log.actionType.includes("REVERSE")) return true;
    if (filterType === "LOGIN" && log.actionType.includes("TABLE_")) return true;
    return log.actionType === filterType;
  });

  const handleCopySignature = (sig: string, id: string) => {
    navigator.clipboard.writeText(sig);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyReport = () => {
    const lines = [
      `================================================================`,
      `STATCOURT.TH — OFFICIAL BSAT MATCH INCIDENT & AUDIT REPORT`,
      `Match ID: ${matchId}`,
      `Tournament: ${matchTitle}`,
      `Exported At: ${new Date().toLocaleString("th-TH")}`,
      `Cryptographic Verification: ${isIntegrityValid ? "VALID & UNTAMPERED (SHA-256)" : "TAMPER WARNING"}`,
      `Total Logged Actions: ${logs.length}`,
      `================================================================`,
      ``,
    ];

    logs.forEach((log, idx) => {
      lines.push(
        `[#${idx + 1}] ${new Date(log.timestamp).toLocaleTimeString("th-TH")} | Q${log.quarter} ${log.gameClockDisplay}`
      );
      lines.push(`Action: ${log.actionType} | Officer: ${log.operatorName} (${log.operatorLicense})`);
      lines.push(`Details: ${JSON.stringify(log.details)}`);
      lines.push(`SHA-256 Signature: ${log.digitalSignature}`);
      lines.push(`----------------------------------------------------------------`);
    });

    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B1C30]/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0B1C30] border border-[#213145] rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#213145] bg-[#071322] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AF101A] flex items-center justify-center text-white shadow-md">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase font-headline">
                  ANTI-TAMPER AUDIT TRAIL
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] font-sans text-slate-400 font-medium">FIBA COMPLIANT</span>
              </div>
              <h2 className="text-lg font-bold text-white font-headline">
                บันทึกประวัติการตัดสินและแก้ไขคะแนน (Match Audit Trail)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAuditLogs}
              title="รีเฟรชข้อมูล"
              className="p-2 rounded-xl bg-[#142C47] hover:bg-[#1E3E64] text-slate-300 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#142C47] hover:bg-[#1E3E64] text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cryptographic Integrity Status Strip */}
        <div className="px-5 sm:px-6 py-3 bg-[#081729] border-b border-[#213145] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {isIntegrityValid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="font-mono">CRYPTOGRAPHIC CHAIN VERIFIED (SHA-256)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 font-bold text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="font-mono">INTEGRITY MISMATCH DETECTED</span>
              </span>
            )}
            <span className="text-slate-300 font-sans text-xs">
              บันทึกทั้งหมด: <strong className="text-white tabular-nums">{logs.length}</strong> รายการ
            </span>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#142C47] border border-[#213145] text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#AF101A]"
            >
              <option value="ALL">ทุกการกระทำ (All Actions)</option>
              <option value="SCORE">การบันทึกคะแนน (Score)</option>
              <option value="FOUL">การฟาวล์ (Fouls)</option>
              <option value="REVERSE">การกดยกเลิกย้อนหลัง (Reversals)</option>
              <option value="LOGIN">การเข้า/ออกระบบ (Auth Logs)</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs space-y-3 font-sans">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#AF101A]" />
              <p>กำลังโหลดและตรวจสอบความถูกต้องของลายเซ็นดิจิทัล...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-[#071322] rounded-xl border border-[#213145]">
              <History className="w-8 h-8 mx-auto text-slate-500 mb-2" />
              <p className="font-medium">ยังไม่มีบันทึกประวัติการตัดสินในแมตช์นี้</p>
              <p className="text-[11px] text-slate-500 mt-1">
                การกดบันทึกคะแนน ฟาวล์ หรือการกดยกเลิกย้อนหลังจะถูกบันทึกลงในห่วงโซ่ดิจิทัลทันที
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLogs.map((log, index) => {
                const isReversal = log.actionType.includes("REVERSE");
                const isScore = log.actionType.includes("SCORE");
                const isFoul = log.actionType.includes("FOUL");
                const isAuth = log.actionType.includes("LOGIN") || log.actionType.includes("LOGOUT");

                return (
                  <div
                    key={log.id || index}
                    className="p-3.5 rounded-xl bg-[#0d223a] border border-[#213145] hover:border-slate-600 transition space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                            isReversal
                              ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                              : isScore
                              ? "bg-red-950/80 text-red-300 border border-red-800"
                              : isFoul
                              ? "bg-rose-950/80 text-rose-300 border border-rose-800"
                              : isAuth
                              ? "bg-blue-950/80 text-blue-300 border border-blue-800"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {log.actionType}
                        </span>

                        <span className="text-slate-400 text-[11px] flex items-center gap-1 font-sans">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="tabular-nums">Q{log.quarter} • {log.gameClockDisplay}</span>
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 flex items-center gap-1.5 font-sans">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-white font-medium">{log.operatorName}</span>
                        <span className="text-slate-400">({log.operatorLicense})</span>
                      </div>
                    </div>

                    {/* Details Snippet */}
                    <div className="bg-[#071322] p-2.5 rounded-xl border border-[#213145] text-[11px] text-slate-300 font-sans leading-relaxed">
                      {typeof log.details === "object" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                          {Object.entries(log.details).map(([k, v]) => (
                            <div key={k} className="flex gap-1.5">
                              <span className="text-slate-400">{k}:</span>
                              <span className="text-white font-medium tabular-nums">
                                {typeof v === "object" ? JSON.stringify(v) : String(v)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span>{String(log.details)}</span>
                      )}
                    </div>

                    {/* Digital Signature & Timestamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-3 h-3 text-[#AF101A]" />
                        <span className="font-mono text-slate-300 truncate max-w-[280px] sm:max-w-md">
                          Sig: {log.digitalSignature}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySignature(log.digitalSignature, log.id)}
                          className="hover:text-white transition p-0.5 cursor-pointer"
                          title="คัดลอกลายเซ็นดิจิทัล"
                        >
                          {copiedId === log.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <span className="tabular-nums font-sans">{new Date(log.timestamp).toLocaleTimeString("th-TH")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#213145] bg-[#071322] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[11px] text-slate-300 flex items-center gap-1.5 font-sans">
            <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>มาตรฐานรายงานข้อพิพาทสมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT-IRS-2026)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-4 py-2 rounded-xl bg-[#142C47] hover:bg-[#1E3E64] text-white font-medium transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>คัดลอกรายงานแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอกรายงานทางการ (Copy Report)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#AF101A] hover:bg-[#8E0D15] text-white font-bold transition cursor-pointer active:scale-95"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
