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
      alert("ไม่สามารถสร้างภาพกราฟิกได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1C30]/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto cursor-pointer animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0B1C30] border border-[#213145] rounded-2xl max-w-xl w-full text-white shadow-2xl p-5 sm:p-6 cursor-default space-y-5"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#213145]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#AF101A]/20 border border-[#AF101A]/40 flex items-center justify-center text-[#AF101A]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest block">
                AUTOMATED SOCIAL GRAPHICS
              </span>
              <h3 className="font-headline text-white font-bold text-base sm:text-lg">
                สร้างภาพสรุปสำหรับแชร์ลง Instagram &amp; Facebook
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#142C47] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Switcher */}
        <div className="flex gap-2 p-1 bg-[#071322] border border-[#213145] rounded-xl text-xs font-sans">
          <button
            onClick={() => setActiveTemplate("FINAL_SCORE")}
            className={`flex-1 py-2 rounded-lg font-bold transition cursor-pointer ${
              activeTemplate === "FINAL_SCORE"
                ? "bg-[#AF101A] text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            1. FINAL SCORE (ผลการแข่ง)
          </button>
          <button
            onClick={() => setActiveTemplate("MVP_CARD")}
            className={`flex-1 py-2 rounded-lg font-bold transition cursor-pointer ${
              activeTemplate === "MVP_CARD"
                ? "bg-[#AF101A] text-white shadow-xs"
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
            className="w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] bg-gradient-to-b from-[#0F172A] via-[#0B1C30] to-[#070D18] border-2 border-[#AF101A]/60 rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl select-none"
          >
            {/* Background elements */}
            <div className="absolute inset-0 court-grid-pattern opacity-15 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#AF101A]/20 blur-3xl rounded-full pointer-events-none" />

            {/* Graphic Top Bar */}
            <div className="relative z-10 flex items-center justify-between border-b border-[#213145] pb-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-[#AF101A] rounded flex items-center justify-center text-white font-black text-[10px]">
                  SC
                </div>
                <span className="font-headline uppercase text-white font-bold text-xs tracking-wider">
                  STATCOURT.TH
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono text-red-400 font-bold">
                <ShieldCheck className="w-3 h-3 text-[#AF101A]" />
                <span>OFFICIAL VERIFIED BOX SCORE</span>
              </div>
            </div>

            {/* Center Graphic Body depending on Template */}
            {activeTemplate === "FINAL_SCORE" ? (
              <div className="relative z-10 text-center space-y-3 my-auto">
                <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-[10px] font-mono font-bold tracking-widest uppercase inline-block">
                  FINAL SCORE
                </span>
                <p className="text-[11px] font-sans text-slate-400 max-w-[280px] mx-auto truncate">
                  {tournamentName}
                </p>

                {/* Scoreboard H2H */}
                <div className="grid grid-cols-5 items-center gap-2 pt-1 font-sans">
                  <div className="col-span-2 text-right">
                    <p className="text-slate-200 uppercase text-xs truncate font-bold font-sans">
                      {homeTeamName}
                    </p>
                    <p className="font-headline text-[#AF101A] text-4xl sm:text-5xl font-black leading-none mt-1 tabular-nums">
                      {homeScore}
                    </p>
                    <span className="text-[9px] font-mono text-[#AF101A] font-bold uppercase">
                      WINNER
                    </span>
                  </div>

                  <div className="col-span-1 text-center font-headline text-slate-500 font-bold text-sm">
                    VS
                  </div>

                  <div className="col-span-2 text-left">
                    <p className="text-slate-400 uppercase text-xs truncate font-medium font-sans">
                      {awayTeamName}
                    </p>
                    <p className="font-headline text-slate-400 text-4xl sm:text-5xl font-black leading-none mt-1 tabular-nums">
                      {awayScore}
                    </p>
                    <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">
                      FINAL
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 space-y-3 my-auto font-sans">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-[10px] font-mono font-bold tracking-widest uppercase inline-block">
                    PLAYER OF THE GAME
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                    FIBA EFF: {mvpPlayer.eff}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-14 h-14 rounded-xl bg-[#071322] border-2 border-amber-500/60 flex items-center justify-center text-white font-headline font-black text-2xl shrink-0 tabular-nums">
                    #{mvpPlayer.number}
                  </div>
                  <div>
                    <h4 className="font-headline text-white font-bold text-lg sm:text-xl tracking-wide">
                      {mvpPlayer.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-sans">
                      {mvpPlayer.school} ({mvpPlayer.team})
                    </p>
                  </div>
                </div>

                {/* 4 Stat Badges */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                  <div className="p-2 rounded-xl bg-[#071322] border border-[#213145]">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">PTS</span>
                    <span className="font-headline text-white font-bold text-lg leading-none tabular-nums">
                      {mvpPlayer.points}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#071322] border border-[#213145]">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">REB</span>
                    <span className="font-headline text-white font-bold text-lg leading-none tabular-nums">
                      {mvpPlayer.rebounds}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#071322] border border-[#213145]">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">AST</span>
                    <span className="font-headline text-[#AF101A] font-bold text-lg leading-none tabular-nums">
                      {mvpPlayer.assists}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#071322] border border-[#213145]">
                    <span className="text-[10px] text-slate-400 uppercase block font-mono">EFF</span>
                    <span className="font-headline text-amber-400 font-bold text-lg leading-none tabular-nums">
                      {mvpPlayer.eff}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Graphic Footer */}
            <div className="relative z-10 flex items-center justify-between border-t border-[#213145] pt-2 text-[9px] font-mono text-slate-400">
              <span>POWERED BY STATCOURT.TH</span>
              <span>LIVE ARENA FILM TIMESTAMP #01</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-sans">
          <span className="text-slate-400 text-xs">
            {downloadSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ส่งออกรูปภาพสำเร็จแล้ว!
              </span>
            ) : (
              "ความละเอียด 1080x1080 (Instagram Square)"
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#142C47] hover:bg-[#1E3E64] text-slate-300 font-medium transition cursor-pointer"
            >
              ปิด
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#AF101A] hover:bg-[#8E0D15] text-white font-bold transition shadow-md disabled:opacity-50 cursor-pointer"
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
