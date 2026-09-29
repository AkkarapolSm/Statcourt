"use client";

import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  X,
  Users,
  ShieldCheck,
  ArrowRight,
  Filter,
  Check,
  ChevronRight,
  Link as LinkIcon,
  UserPlus,
  SkipForward,
} from "lucide-react";
import type { StagedAthleteItem } from "@/lib/import/deduplicationEngine";

interface TeamOption {
  id: string;
  name: string;
  institution: string;
}

interface RosterImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTeamId?: string;
  teamsList?: TeamOption[];
}

export default function RosterImportModal({
  isOpen,
  onClose,
  onSuccess,
  initialTeamId,
  teamsList,
}: RosterImportModalProps) {
  // Step 1: Input, Step 2: Review & Deduplicate, Step 3: Result
  const [step, setStep] = useState<"INPUT" | "REVIEW" | "RESULT">("INPUT");

  // Input states
  const [csvText, setCsvText] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || "");
  const [teams, setTeams] = useState<TeamOption[]>(teamsList || []);
  const [parsing, setParsing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Review states
  const [stagedItems, setStagedItems] = useState<StagedAthleteItem[]>([]);
  const [summary, setSummary] = useState<{
    totalRows: number;
    newCount: number;
    exactMatchCount: number;
    potentialDuplicateCount: number;
    invalidCount: number;
  }>({
    totalRows: 0,
    newCount: 0,
    exactMatchCount: 0,
    potentialDuplicateCount: 0,
    invalidCount: 0,
  });
  const [activeFilter, setActiveFilter] = useState<"ALL" | "NEW" | "EXACT_MATCH" | "POTENTIAL_DUPLICATE" | "INVALID">("ALL");

  // Per-row user decisions (rowNumber -> "CREATE_NEW" | "LINK_EXISTING" | "SKIP")
  const [rowActions, setRowActions] = useState<Record<number, "CREATE_NEW" | "LINK_EXISTING" | "SKIP">>({});

  // Result state
  const [commitResult, setCommitResult] = useState<{
    createdCount: number;
    linkedCount: number;
    skippedCount: number;
    message: string;
  } | null>(null);

  // Fetch teams if not provided
  useEffect(() => {
    if (!teamsList || teamsList.length === 0) {
      fetch("/api/teams")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setTeams(
              json.data.map((t: any) => ({
                id: t.id,
                name: t.name,
                institution: t.institution || "",
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [teamsList]);

  if (!isOpen) return null;

  // Handle CSV file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        setErrorMessage(null);
      }
    };
    reader.readAsText(file);
  };

  // Step 1 -> Step 2: Parse and run deduplication
  const handleParseCsv = async () => {
    if (!csvText.trim()) {
      setErrorMessage("กรุณาเลือกไฟล์ CSV หรือวางข้อความข้อมูลนักกีฬา");
      return;
    }

    setParsing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/athletes/import/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent: csvText,
          teamId: selectedTeamId || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "วิเคราะห์ไฟล์ไม่สำเร็จ");
      }

      setStagedItems(json.items);
      setSummary(json.summary);

      // Initialize default actions from suggestedAction
      const actions: Record<number, "CREATE_NEW" | "LINK_EXISTING" | "SKIP"> = {};
      json.items.forEach((item: StagedAthleteItem) => {
        actions[item.rowNumber] = item.suggestedAction;
      });
      setRowActions(actions);

      setStep("REVIEW");
    } catch (err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการวิเคราะห์ไฟล์");
    } finally {
      setParsing(false);
    }
  };

  // Step 2 -> Step 3: Commit import
  const handleCommitImport = async () => {
    setCommitting(true);
    setErrorMessage(null);

    try {
      const payloadItems = stagedItems.map((item) => ({
        data: item.data,
        action: rowActions[item.rowNumber] || item.suggestedAction,
        existingAthleteId: item.existingAthlete?.id,
      }));

      const res = await fetch("/api/athletes/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: payloadItems,
          teamId: selectedTeamId || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "บันทึกข้อมูลไม่สำเร็จ");
      }

      setCommitResult({
        createdCount: json.createdCount,
        linkedCount: json.linkedCount,
        skippedCount: json.skippedCount,
        message: json.message,
      });

      setStep("RESULT");
    } catch (err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setCommitting(false);
    }
  };

  // Bulk action helpers
  const handleBulkAction = (action: "LINK_ALL" | "SKIP_INVALID" | "CREATE_NEW_ALL") => {
    const updated = { ...rowActions };
    stagedItems.forEach((item) => {
      if (action === "LINK_ALL" && (item.status === "EXACT_MATCH" || item.status === "POTENTIAL_DUPLICATE")) {
        updated[item.rowNumber] = "LINK_EXISTING";
      } else if (action === "SKIP_INVALID" && item.status === "INVALID") {
        updated[item.rowNumber] = "SKIP";
      } else if (action === "CREATE_NEW_ALL" && item.status !== "INVALID") {
        updated[item.rowNumber] = "CREATE_NEW";
      }
    });
    setRowActions(updated);
  };

  const filteredItems = stagedItems.filter((item) => {
    if (activeFilter === "ALL") return true;
    return item.status === activeFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:px-6 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-2 py-0.5 rounded-full">
                  ROSTER IMPORT &amp; DEDUPLICATION
                </span>
                <span className="text-slate-400 font-mono text-xs">FIBA Compatible</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-white mt-0.5">
                นำเข้ารายชื่อนักกีฬาจาก CSV และตรวจสอบข้อมูลซ้ำ
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 px-6 bg-red-50 border-b border-red-200 flex items-center justify-between text-red-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* STEP 1: CSV INPUT */}
          {step === "INPUT" && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Instructions & Template Download */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>ระบบตรวจสอบข้อมูลซ้ำซ้อนอัตโนมัติ (Entity Resolution)</span>
                  </h3>
                  <p className="text-xs text-indigo-800/80 leading-relaxed">
                    ระบบจะจับคู่ชื่อ-นามสกุล, วันเดือนปีเกิด, รหัสบัตร/TCAS, อีเมล และเบอร์โทรศัพท์ เพื่อป้องกันปัญหานักกีฬาคนเดียวมีหลายโปรไฟล์
                  </p>
                </div>

                <a
                  href="/api/athletes/import/template"
                  download="statcourt_roster_template.csv"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>ดาวน์โหลดไฟล์ตัวอย่าง CSV</span>
                </a>
              </div>

              {/* Target Team Selection */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-700 uppercase">
                  สังกัด / ทีมที่ต้องการนำเข้า (Target Team):
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- ไม่ระบุสังกัด (นำเข้าเป็นนักกีฬาอิสระในระบบ) --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.institution})
                    </option>
                  ))}
                </select>
              </div>

              {/* File Dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-700 uppercase">
                  อัปโหลดไฟล์ CSV (.csv):
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center transition bg-slate-50/50 hover:bg-indigo-50/30">
                  <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-700 font-medium">
                    คลิกเพื่อเลือกไฟล์ หรือลากไฟล์ CSV มาวางที่นี่
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    รองรับไฟล์เข้ารหัส UTF-8 และฟอร์แมตมาตรฐานของ StatCourtTH
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Or Paste CSV text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-700 uppercase">
                    หรือวางข้อความ CSV โดยตรง (Paste CSV Content):
                  </label>
                  {csvText && (
                    <button
                      onClick={() => setCsvText("")}
                      className="text-[11px] font-mono text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      ล้างข้อความ
                    </button>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`firstName,lastName,birthDate,position,heightCm,weightKg,jerseyNumber,schoolOrClub,province,email,phoneNumber,nationalId\nณัฐภัทร,วิจิตรจันทร์,2008-04-12,POINT_GUARD,183,74,7,กรุงเทพคริสเตียนวิทยาลัย,กรุงเทพมหานคร,nattapat@example.com,0812345678,1100501234567`}
                  className="w-full p-3.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleParseCsv}
                  disabled={parsing || !csvText.trim()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${parsing ? "animate-spin" : ""}`} />
                  <span>{parsing ? "กำลังประมวลผล..." : "ตรวจสอบข้อมูลและตรวจความซ้ำซ้อน"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: STAGING & DEDUPLICATION REVIEW */}
          {step === "REVIEW" && (
            <div className="space-y-5">
              
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button
                  onClick={() => setActiveFilter("ALL")}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    activeFilter === "ALL"
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-[11px] font-mono font-bold uppercase opacity-80">ทั้งหมด (Total)</div>
                  <div className="text-xl sm:text-2xl font-black font-mono mt-0.5">{summary.totalRows}</div>
                </button>

                <button
                  onClick={() => setActiveFilter("NEW")}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    activeFilter === "NEW"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  <div className="text-[11px] font-mono font-bold uppercase opacity-80">สร้างใหม่ (New)</div>
                  <div className="text-xl sm:text-2xl font-black font-mono mt-0.5">{summary.newCount}</div>
                </button>

                <button
                  onClick={() => setActiveFilter("EXACT_MATCH")}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    activeFilter === "EXACT_MATCH"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
                  }`}
                >
                  <div className="text-[11px] font-mono font-bold uppercase opacity-80">ตรงกับเดิม (Exact)</div>
                  <div className="text-xl sm:text-2xl font-black font-mono mt-0.5">{summary.exactMatchCount}</div>
                </button>

                <button
                  onClick={() => setActiveFilter("POTENTIAL_DUPLICATE")}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    activeFilter === "POTENTIAL_DUPLICATE"
                      ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                      : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                  }`}
                >
                  <div className="text-[11px] font-mono font-bold uppercase opacity-80">อาจซ้ำซ้อน (Dupe)</div>
                  <div className="text-xl sm:text-2xl font-black font-mono mt-0.5">{summary.potentialDuplicateCount}</div>
                </button>

                <button
                  onClick={() => setActiveFilter("INVALID")}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    activeFilter === "INVALID"
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-red-50 border-red-200 text-red-800 hover:bg-red-100"
                  }`}
                >
                  <div className="text-[11px] font-mono font-bold uppercase opacity-80">ไม่สมบูรณ์ (Invalid)</div>
                  <div className="text-xl sm:text-2xl font-black font-mono mt-0.5">{summary.invalidCount}</div>
                </button>
              </div>

              {/* Bulk Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold uppercase">ตัวช่วยตัดสินใจด่วน:</span>
                  <button
                    type="button"
                    onClick={() => handleBulkAction("LINK_ALL")}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold transition cursor-pointer"
                  >
                    เชื่อมโยงข้อมูลเดิมทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkAction("SKIP_INVALID")}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition cursor-pointer"
                  >
                    ข้ามรายการที่ผิดพลาดทั้งหมด
                  </button>
                </div>

                <div className="text-slate-500">
                  แสดง {filteredItems.length} จากทั้งหมด {stagedItems.length} แถว
                </div>
              </div>

              {/* Staging Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[46vh]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-900 text-white font-mono uppercase text-[11px] sticky top-0 z-10">
                      <tr>
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3">ข้อมูลในไฟล์ CSV</th>
                        <th className="p-3">สถานะตรวจพบ</th>
                        <th className="p-3">ข้อมูลเดิมในระบบ (Existing Record)</th>
                        <th className="p-3 text-right">การตัดสินใจ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredItems.map((item) => {
                        const currentAction = rowActions[item.rowNumber] || item.suggestedAction;

                        return (
                          <tr key={item.rowNumber} className="hover:bg-slate-50/80 transition">
                            <td className="p-3 text-center font-mono font-bold text-slate-400">
                              {item.rowNumber}
                            </td>

                            <td className="p-3">
                              <div className="font-bold text-slate-900">
                                {item.data.firstName} {item.data.lastName}
                                {item.data.jerseyNumber !== null && (
                                  <span className="ml-1 text-slate-400 font-mono">#{item.data.jerseyNumber}</span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono space-x-2">
                                <span>{item.data.primaryPosition}</span>
                                <span>•</span>
                                <span>{item.data.heightCm} ซม.</span>
                                <span>•</span>
                                <span>เกิด: {item.data.birthDate || "-"}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                                🏫 {item.data.schoolOrClub} ({item.data.province})
                              </div>
                            </td>

                            <td className="p-3">
                              {item.status === "NEW" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                                  <UserPlus className="w-3 h-3" />
                                  <span>สร้างใหม่</span>
                                </span>
                              )}
                              {item.status === "EXACT_MATCH" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>ตรงกับเดิม (100%)</span>
                                </span>
                              )}
                              {item.status === "POTENTIAL_DUPLICATE" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px] font-bold">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>อาจซ้ำซ้อน ({item.matchConfidence}%)</span>
                                </span>
                              )}
                              {item.status === "INVALID" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-mono text-[10px] font-bold">
                                  <XCircle className="w-3 h-3" />
                                  <span>ข้อมูลไม่สมบูรณ์</span>
                                </span>
                              )}

                              {item.matchReason && (
                                <p className="text-[11px] text-slate-500 font-mono mt-1">
                                  {item.matchReason}
                                </p>
                              )}
                              {item.validationErrors.length > 0 && (
                                <p className="text-[11px] text-red-600 font-mono mt-1">
                                  {item.validationErrors.join(", ")}
                                </p>
                              )}
                            </td>

                            <td className="p-3">
                              {item.existingAthlete ? (
                                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono space-y-0.5">
                                  <div className="font-bold text-slate-800">
                                    {item.existingAthlete.fullName}
                                  </div>
                                  <div className="text-slate-500">
                                    เกิด: {item.existingAthlete.birthDate} | {item.existingAthlete.primaryPosition}
                                  </div>
                                  <div className="text-slate-500 truncate max-w-xs">
                                    {item.existingAthlete.schoolOrClub}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-mono text-[11px]">- ไม่พบข้อมูลเดิม -</span>
                              )}
                            </td>

                            <td className="p-3 text-right">
                              <select
                                value={currentAction}
                                onChange={(e) => {
                                  const val = e.target.value as "CREATE_NEW" | "LINK_EXISTING" | "SKIP";
                                  setRowActions((prev) => ({ ...prev, [item.rowNumber]: val }));
                                }}
                                className={`px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold border transition cursor-pointer ${
                                  currentAction === "CREATE_NEW"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : currentAction === "LINK_EXISTING"
                                    ? "bg-blue-50 text-blue-800 border-blue-300"
                                    : "bg-slate-100 text-slate-600 border-slate-300"
                                }`}
                              >
                                {item.status !== "INVALID" && (
                                  <option value="CREATE_NEW">สร้างโปรไฟล์ใหม่</option>
                                )}
                                {item.existingAthlete && (
                                  <option value="LINK_EXISTING">เชื่อมโยงข้อมูลเดิม</option>
                                )}
                                <option value="SKIP">ข้ามรายการนี้</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("INPUT")}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  ← กลับไปแก้ไข CSV
                </button>

                <button
                  type="button"
                  onClick={handleCommitImport}
                  disabled={committing || stagedItems.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Check className={`w-4 h-4 ${committing ? "animate-spin" : ""}`} />
                  <span>{committing ? "กำลังบันทึกลงระบบ..." : "ยืนยันการนำเข้าข้อมูล (Commit Roster)"}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RESULT */}
          {step === "RESULT" && commitResult && (
            <div className="p-8 text-center space-y-5 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold font-mono text-slate-900">
                  นำเข้าและตรวจสอบข้อมูลสำเร็จ!
                </h3>
                <p className="text-xs text-slate-600 mt-1">{commitResult.message}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono">
                <div>
                  <div className="text-slate-400 font-bold uppercase text-[10px]">สร้างใหม่</div>
                  <div className="text-lg font-bold text-emerald-700">{commitResult.createdCount} คน</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase text-[10px]">เชื่อมโยงเดิม</div>
                  <div className="text-lg font-bold text-blue-700">{commitResult.linkedCount} คน</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase text-[10px]">ข้ามรายการ</div>
                  <div className="text-lg font-bold text-slate-500">{commitResult.skippedCount} คน</div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSuccess) onSuccess();
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  เสร็จสิ้นและปิดหน้าต่าง
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
