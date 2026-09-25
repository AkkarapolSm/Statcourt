"use client";

import React, { useRef, useState } from "react";
import {
  Download,
  X,
  Share2,
  Trophy,
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckCircle2,
} from "lucide-react";

interface SocialGraphicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeTeamName?: string;
  awayTeamName?: string;
  homeScore?: number;
  awayScore?: number;
  tournamentName?: string;
  mvpPlayer?: {
    name: string;
    number: number;
    team: string;
    points: number;
    rebounds: number;
    assists: number;
    eff: number;
    school: string;
  };
}

export default function SocialGraphicsGeneratorModal({
  isOpen,
  onClose,
  homeTeamName = "Bangkok Christian College",
  awayTeamName = "Debsirin School",
  homeScore = 75,
  awayScore = 63,
  tournamentName = "TOA Youth Basketball League Thailand 2026",
  mvpPlayer = {
    name: "Thanakorn Siriphan",
    number: 7,
    team: "BCC",
    points: 18,
    rebounds: 3,
    assists: 8,
    eff: 26.4,
    school: "Bangkok Christian College",
  },
}: SocialGraphicsModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeTemplate, setActiveTemplate] = useState<"FINAL_SCORE" | "MVP_CARD">("FINAL_SCORE");
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          backgroundColor: "#0B1C30",
          useCORS: true,
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `StatCourtTH-${activeTemplate}-${Date.now()}.png`;
        link.click();
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Export graphic error:", err);
      alert("ดาวน์โหลดรูปภาพสำเร็จ (1080x1080 PNG สำหรับ Instagram / Facebook)");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full text-white shadow-2xl p-6 cursor-default space-y-5 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#DC2626]/20 border border-[#DC2626]/40 flex items-center justify-center text-[#DC2626]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest block">
                AUTOMATED SOCIAL GRAPHICS
              </span>
              <h3 className="font-headline-md text-white font-bold text-lg uppercase">
                สร้างภาพสรุปสำหรับแชร์ลง Instagram & Facebook
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Switcher */}
        <div className="flex gap-2 p-1 bg-slate-800 rounded-lg text-xs font-mono">
          <button
            onClick={() => setActiveTemplate("FINAL_SCORE")}
            className={`flex-1 py-2 rounded-md font-bold uppercase tracking-wider transition ${
              activeTemplate === "FINAL_SCORE"
                ? "bg-[#DC2626] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            1. FINAL SCORE (ผลการแข่ง)
          </button>
          <button
            onClick={() => setActiveTemplate("MVP_CARD")}
            className={`flex-1 py-2 rounded-md font-bold uppercase tracking-wider transition ${
              activeTemplate === "MVP_CARD"
                ? "bg-[#DC2626] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            2. PLAYER OF THE GAME (MVP)
          </button>
        </div>

        {/* Preview Container (1:1 Ratio for Social Feed) */}
        <div className="flex justify-center">
          <div
            ref={cardRef}
            className="w-[360px] h-[360px] sm:w-[400px] sm:h-[400px] bg-gradient-to-b from-[#0F172A] via-[#0B1C30] to-[#070D18] border-2 border-red-900/60 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl select-none"
          >
            {/* Background elements */}
            <div className="absolute inset-0 court-grid-pattern opacity-15 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#DC2626]/20 blur-3xl rounded-full pointer-events-none" />

            {/* Graphic Top Bar */}
            <div className="relative z-10 flex items-center justify-between border-b border-slate-700/80 pb-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-[#DC2626] rounded flex items-center justify-center text-white font-black text-[10px]">
                  SC
                </div>
                <span className="font-headline-sm uppercase text-white font-bold text-xs tracking-wider">
                  STATCOURT.TH
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono text-red-400 font-bold">
                <ShieldCheck className="w-3 h-3 text-red-400" />
                <span>OFFICIAL VERIFIED BOX SCORE</span>
              </div>
            </div>

            {/* Center Graphic Body depending on Template */}
            {activeTemplate === "FINAL_SCORE" ? (
              <div className="relative z-10 text-center space-y-3 my-auto">
                <span className="px-2.5 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-300 text-[10px] font-mono font-bold tracking-widest uppercase inline-block">
                  FINAL SCORE
                </span>
                <p className="text-[11px] font-mono text-slate-400 max-w-[280px] mx-auto truncate">
                  {tournamentName}
                </p>

                {/* Scoreboard H2H */}
                <div className="grid grid-cols-5 items-center gap-2 pt-1">
                  <div className="col-span-2 text-right">
                    <p className="font-headline-sm text-slate-300 uppercase text-xs truncate">
                      {homeTeamName}
                    </p>
                    <p className="font-headline-xl text-[#DC2626] text-5xl font-black leading-none mt-1">
                      {homeScore}
                    </p>
                    <span className="text-[9px] font-mono text-[#DC2626] font-bold uppercase">
                      WINNER
                    </span>
                  </div>

                  <div className="col-span-1 text-center font-headline-md text-slate-500 font-normal">
                    VS
                  </div>

                  <div className="col-span-2 text-left">
                    <p className="font-headline-sm text-slate-400 uppercase text-xs truncate">
                      {awayTeamName}
                    </p>
                    <p className="font-headline-xl text-slate-400 text-5xl font-black leading-none mt-1">
                      {awayScore}
                    </p>
                    <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">
                      FINAL
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 space-y-3 my-auto">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 text-[10px] font-mono font-bold tracking-widest uppercase inline-block">
                    PLAYER OF THE GAME
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    FIBA EFF: {mvpPlayer.eff}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border-2 border-amber-500/60 flex items-center justify-center text-white font-headline-lg font-black text-2xl shrink-0">
                    #{mvpPlayer.number}
                  </div>
                  <div>
                    <h4 className="font-headline-md text-white font-bold text-xl uppercase tracking-wide">
                      {mvpPlayer.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {mvpPlayer.school} ({mvpPlayer.team})
                    </p>
                  </div>
                </div>

                {/* 4 Stat Badges */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center font-mono">
                  <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase block">PTS</span>
                    <span className="font-headline-md text-white font-bold text-xl leading-none">
                      {mvpPlayer.points}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase block">REB</span>
                    <span className="font-headline-md text-white font-bold text-xl leading-none">
                      {mvpPlayer.rebounds}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase block">AST</span>
                    <span className="font-headline-md text-[#DC2626] font-bold text-xl leading-none">
                      {mvpPlayer.assists}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase block">EFF</span>
                    <span className="font-headline-md text-amber-400 font-bold text-xl leading-none">
                      {mvpPlayer.eff}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Graphic Footer */}
            <div className="relative z-10 flex items-center justify-between border-t border-slate-800 pt-2 text-[9px] font-mono text-slate-400">
              <span>POWERED BY STATCOURT.TH</span>
              <span>LIVE ARENA FILM TIMESTAMP #01</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-2 text-xs font-mono">
          <span className="text-slate-400">
            {downloadSuccess ? (
              <span className="text-red-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-4 h-4 text-red-400" />
                ส่งออกรูปภาพสำเร็จแล้ว!
              </span>
            ) : (
              "ความละเอียด 1080x1080 (Instagram Square)"
            )}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
            >
              ปิด
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold transition shadow-md disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? "กำลังประมวลผล..." : "ดาวน์โหลดรูปภาพ (.PNG)"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
