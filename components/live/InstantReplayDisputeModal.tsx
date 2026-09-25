"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCcw,
  Send,
  FileText,
  BadgeCheck,
  Scale,
  Video,
} from "lucide-react";
import { DisputeRequest } from "@/lib/types";

interface InstantReplayDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  disputes: DisputeRequest[];
  onAddDispute: (newDispute: DisputeRequest) => void;
  homeTeamName?: string;
  awayTeamName?: string;
}

export default function InstantReplayDisputeModal({
  isOpen,
  onClose,
  matchId,
  disputes,
  onAddDispute,
  homeTeamName = "Bangkok Christian College",
  awayTeamName = "Debsirin School",
}: InstantReplayDisputeModalProps) {
  const [modalTab, setModalTab] = useState<"LOG" | "NEW_CHALLENGE">("LOG");

  // Form State
  const [requestingTeam, setRequestingTeam] = useState(awayTeamName);
  const [disputeType, setDisputeType] = useState<DisputeRequest["disputeType"]>("CLOCK_EXPIRATION");
  const [quarter, setQuarter] = useState<number>(4);
  const [gameClock, setGameClock] = useState("05:20");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmitChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newDispute: DisputeRequest = {
        id: `disp-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        matchId: matchId,
        tournamentName: "TOA Youth Basketball League Thailand 2026",
        requestingTeam: requestingTeam,
        quarter: Number(quarter),
        gameClock: gameClock,
        videoElapsedSec: 320,
        disputeType: disputeType,
        description: description,
        status: "UNDER_REVIEW",
        commissionerNotes:
          "คำร้องชาเลนจ์ถูกส่งเข้าสู่ระบบโต๊ะเทคนิคแล้ว กำลังรอผู้ตัดสินที่ 1 (Crew Chief) ตรวจสอบเทปภาพช้าย้อนหลัง (IRS Review in Progress)",
        resolvedAt: undefined,
      };

      onAddDispute(newDispute);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setModalTab("LOG");
        setDescription("");
      }, 1200);
    }, 600);
  };

  const getDisputeTypeLabel = (type: DisputeRequest["disputeType"]) => {
    switch (type) {
      case "CLOCK_EXPIRATION":
        return "หมดเวลาช็อตคล็อกก่อนปล่อยบอล (Shot Clock Expiration)";
      case "FOOT_ON_LINE_3PT":
        return "เท้าสัมผัสเส้น 3 คะแนน (Foot on 3PT Line)";
      case "OUT_OF_BOUNDS":
        return "ลูกบอลออกนอกสนาม / สัมผัสคนสุดท้าย (Out of Bounds)";
      case "UNSPORTSMANLIKE_FOUL":
        return "ฟาวล์ผิดวิสัยนักกีฬา (Unsportsmanlike Foul Review)";
      case "SCORE_DISCREPANCY":
        return "ข้อผิดพลาดของใบบันทึกคะแนน (Score Discrepancy)";
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0B1120] border border-slate-700/80 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-white">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-[#0F172A] to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wider">
                  FIBA Instant Replay System (IRS)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  COURTSIDE AUDIT TRAIL
                </span>
              </div>
              <h3 className="font-headline-lg uppercase text-xl font-bold text-white tracking-wide mt-0.5">
                ระบบชาเลนจ์ &amp; ตรวจสอบภาพช้าผู้ตัดสิน
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenge Quota Summary Cards (FIBA Rules) */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block font-bold">
                โควตาชาเลนจ์ทีมเหย้า
              </span>
              <span className="text-slate-200 font-bold text-sm truncate block max-w-[200px]">
                {homeTeamName}
              </span>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                1 สิทธิ์คงเหลือ
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">ยังไม่ได้ใช้</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block font-bold">
                โควตาชาเลนจ์ทีมเยือน
              </span>
              <span className="text-slate-200 font-bold text-sm truncate block max-w-[200px]">
                {awayTeamName}
              </span>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                1 สิทธิ์คงเหลือ
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">ใช้แล้ว 1 (สำเร็จ)</span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 pt-3 bg-slate-900/40 border-b border-slate-800 flex items-center gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={() => setModalTab("LOG")}
            className={`pb-2.5 font-bold transition flex items-center gap-2 border-b-2 ${
              modalTab === "LOG"
                ? "border-red-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4 text-red-400" />
            <span>ประวัติการตรวจ Replay ในแมตช์ ({disputes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab("NEW_CHALLENGE")}
            className={`pb-2.5 font-bold transition flex items-center gap-2 border-b-2 ${
              modalTab === "NEW_CHALLENGE"
                ? "border-red-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scale className="w-4 h-4 text-amber-400" />
            <span>ส่งสัญญาณขอ Replay Challenge ใหม่</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto font-mono text-xs space-y-4 flex-1">
          {modalTab === "LOG" ? (
            <div className="space-y-4">
              {disputes.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <ShieldCheck className="w-12 h-12 mx-auto text-slate-600 mb-2 opacity-60" />
                  <p className="font-bold text-sm text-slate-400">ยังไม่มีการยื่นคำร้อง Challenge ในแมตช์นี้</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    เมื่อหัวหน้าผู้ฝึกสอนส่งสัญญาณขอตรวจสอบ Replay ข้อมูลจะปรากฏที่นี่ทันที
                  </p>
                </div>
              ) : (
                disputes.map((disp) => {
                  const isCallStands = disp.status === "UPHELD_CALL_STANDS";
                  return (
                    <div
                      key={disp.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3.5 transition"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                            {disp.id.toUpperCase()}
                          </span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="font-bold text-white text-sm">
                            {disp.requestingTeam}
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                            isCallStands
                              ? "bg-slate-800 text-slate-300 border border-slate-700"
                              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {isCallStands ? (
                            <>
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>คงคำตัดสินเดิม (Call Stands)</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>ยอมรับคำร้อง / ปรับแก้แต้ม (Adjusted)</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Info Bar */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                        <div>
                          <span className="text-slate-500 uppercase text-[9px] block">ประเภทข้อพิพาท</span>
                          <span className="font-bold text-slate-200 text-[11px]">
                            {disp.disputeType}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase text-[9px] block">จังหวะเวลาเกิดเหตุ</span>
                          <span className="font-bold text-amber-400 text-[11px]">
                            Q{disp.quarter} • {disp.gameClock}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase text-[9px] block">เวลาตัดสินข้อร้องเรียน</span>
                          <span className="font-bold text-slate-300 text-[11px]">
                            {disp.resolvedAt || "Real-time"}
                          </span>
                        </div>
                      </div>

                      {/* Request Description */}
                      <div className="text-slate-300 font-sans text-xs leading-relaxed">
                        <span className="font-bold font-mono text-slate-400 text-[11px]">
                          คำร้องของทีม:
                        </span>{" "}
                        {disp.description}
                      </div>

                      {/* Verdict Note */}
                      <div className="p-3.5 bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-xl space-y-1 text-[11px]">
                        <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase text-[10px]">
                          <BadgeCheck className="w-3.5 h-3.5 text-red-400" />
                          <span>มติคณะกรรมการเทคนิคและผู้ตัดสินที่ 1 (Crew Chief):</span>
                        </div>
                        <p className="font-sans text-slate-300 leading-relaxed pl-5">
                          {disp.commissionerNotes}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {submittedSuccess ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-headline-lg uppercase text-xl text-white font-bold">
                    ส่งสัญญาณขอดูจอข้างสนาม (IRS REVIEW) สำเร็จ!
                  </h4>
                  <p className="text-slate-300 font-mono text-xs">
                    ผู้ตัดสินในสนามได้รับสัญญาณ และได้ทำการบันทึกเข้าระบบ Audit Trail แล้ว
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitChallenge} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="font-sans leading-relaxed">
                      การขอ Head Coach's Challenge ต้องกระทำโดยหัวหน้าผู้ฝึกสอนทันทีหลังจากสัญญาณเป่านกหวีดหยุดเกม
                      และก่อนที่บอลจะถูกส่งเข้าเล่นใหม่ตามระเบียบ FIBA Official Basketball Rules
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">
                      ทีมที่ยื่นคำร้อง Challenge *
                    </label>
                    <select
                      value={requestingTeam}
                      onChange={(e) => setRequestingTeam(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
                    >
                      <option value={homeTeamName}>{homeTeamName} (ทีมเหย้า)</option>
                      <option value={awayTeamName}>{awayTeamName} (ทีมเยือน)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">
                      ประเภทข้อพิพาทที่ต้องการตรวจสอบ (Challenge Reason) *
                    </label>
                    <select
                      value={disputeType}
                      onChange={(e) => setDisputeType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="CLOCK_EXPIRATION">
                        หมดเวลาช็อตคล็อกก่อนปล่อยบอล (Shot Clock Expiration)
                      </option>
                      <option value="FOOT_ON_LINE_3PT">
                        เท้าสัมผัสเส้น 3 คะแนน (Foot on 3PT Line - 2PT/3PT Decision)
                      </option>
                      <option value="OUT_OF_BOUNDS">
                        ลูกบอลออกนอกสนาม / สัมผัสคนสุดท้าย (Last Touch Out-of-Bounds)
                      </option>
                      <option value="UNSPORTSMANLIKE_FOUL">
                        ฟาวล์ผิดวิสัยนักกีฬา / ยกระดับฟาวล์ (Unsportsmanlike Foul)
                      </option>
                      <option value="SCORE_DISCREPANCY">
                        ข้อผิดพลาดของใบบันทึกคะแนนโต๊ะเทคนิค (Scoreboard Discrepancy)
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">ควอเตอร์</label>
                      <select
                        value={quarter}
                        onChange={(e) => setQuarter(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
                      >
                        <option value={1}>Q1 (ควอเตอร์ 1)</option>
                        <option value={2}>Q2 (ควอเตอร์ 2)</option>
                        <option value={3}>Q3 (ควอเตอร์ 3)</option>
                        <option value={4}>Q4 (ควอเตอร์ 4)</option>
                        <option value={5}>OT (ต่อเวลาพิเศษ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-bold">
                        เวลาบนหน้าปัด (Game Clock) *
                      </label>
                      <input
                        type="text"
                        required
                        value={gameClock}
                        onChange={(e) => setGameClock(e.target.value)}
                        placeholder="เช่น 05:20 หรือ 00:01"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-bold">
                      รายละเอียดเหตุการณ์และจังหวะที่โต้แย้ง *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="ระบุหมายเลขเสื้อผู้เล่น ทิศทางบอล และจุดที่ต้องการให้ Crew Chief ดู Replay กล้องข้างสนาม"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 font-sans text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-[#AF101A] hover:from-red-500 hover:to-red-700 text-white font-bold uppercase transition flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 disabled:opacity-50 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>
                      {isSubmitting
                        ? "กำลังส่งสัญญาณไปยัง Crew Chief..."
                        : "ยืนยันการขอ Head Coach's Challenge (IRS Review)"}
                    </span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>เชื่อมต่อกับกล้องโต๊ะเทคนิคความละเอียดสูง (FIBA Console Sync)</span>
          </div>
          <span className="font-mono text-slate-400">StatCourt IRS Engine v2.6</span>
        </div>

      </div>
    </div>
  );
}
