"use client";

import React, { useRef, useState } from "react";
import {
  X,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Instagram,
  Facebook,
  Copy,
} from "lucide-react";
import { POTWData } from "@/lib/types";
import html2canvas from "html2canvas";

interface POTWShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  potw: POTWData;
}

export default function POTWShareModal({
  isOpen,
  onClose,
  potw,
}: POTWShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const element = cardRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // Ultra crisp 3x resolution for IG Story
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0B0F19",
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `POTW_${potw.ageCategory}_${potw.athleteName.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 text-white font-mono flex flex-col max-h-[95vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#1E293B]/70 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100">
              แชร์รูปสถิติลง IG Story / Facebook
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICATION STATUS */}
        {downloadSuccess && (
          <div className="bg-emerald-950 border-b border-emerald-800 text-emerald-300 px-4 py-2 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ดาวน์โหลดภาพกราฟิกความละเอียดสูง 3x สำเร็จ! พร้อมโพสต์ลง Story</span>
          </div>
        )}

        {/* GRAPHIC CANVAS PREVIEW CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center items-center">
          {/* ============================================================== */}
          {/* 9:16 INSTAGRAM STORY READY GRAPHIC CARD                         */}
          {/* ============================================================== */}
          <div
            ref={cardRef}
            className="w-full max-w-[340px] aspect-[9/16] bg-gradient-to-b from-[#1E1B4B] via-[#0F172A] to-black rounded-2xl border-2 border-red-600/70 p-5 shadow-2xl relative flex flex-col justify-between overflow-hidden select-none"
          >
            {/* AMBIENT GLOW */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-0 w-44 h-44 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* CARD TOP BRANDING */}
            <div className="relative z-10">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded bg-[#AF101A] flex items-center justify-center text-white text-[10px] font-black">
                    SC
                  </div>
                  <span className="font-headline-sm text-xs font-bold tracking-wider text-white">
                    STATCOURT.TH
                  </span>
                </div>
                <div className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-300 text-[9px] font-bold tracking-widest uppercase">
                  {potw.ageCategory} DIVISION
                </div>
              </div>

              {/* CARD TITLE */}
              <div className="text-center mt-3">
                <div className="text-[10px] tracking-widest text-amber-400 font-bold uppercase">
                  OFFICIAL FIBA RECOGNITION
                </div>
                <h3 className="text-xl font-headline-xl font-normal text-white uppercase tracking-wider mt-0.5 leading-none">
                  PLAYER OF THE WEEK
                </h3>
              </div>
            </div>

            {/* PLAYER PORTRAIT & DETAILS */}
            <div className="relative z-10 flex flex-col items-center my-auto py-2">
              <div className="relative w-32 h-36 rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-2xl bg-slate-900">
                <img
                  src={potw.avatarUrl}
                  alt={potw.athleteName}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute bottom-0 inset-x-0 bg-red-950/90 text-white text-[9px] font-bold text-center py-0.5">
                  {potw.athleteSchool}
                </div>
              </div>

              <h4 className="text-base font-bold text-white uppercase mt-2.5 text-center">
                {potw.athleteName}
              </h4>
              <p className="text-[10px] text-slate-400 text-center font-sans max-w-[260px] line-clamp-2 mt-0.5 italic">
                "{potw.quote}"
              </p>

              {/* STATS MATRIX (4 CORE METRICS) */}
              <div className="grid grid-cols-4 gap-2 w-full mt-3 bg-black/60 border border-slate-700/80 rounded-xl p-2.5 text-center font-mono">
                <div>
                  <div className="text-[9px] text-amber-400 font-bold">EFF</div>
                  <div className="text-base font-bold text-white leading-none mt-0.5">
                    {potw.effPerGame.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 font-bold">PPG</div>
                  <div className="text-base font-bold text-white leading-none mt-0.5">
                    {potw.ppg.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 font-bold">RPG</div>
                  <div className="text-base font-bold text-white leading-none mt-0.5">
                    {potw.rpg.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 font-bold">APG</div>
                  <div className="text-base font-bold text-white leading-none mt-0.5">
                    {potw.apg.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD BOTTOM VERIFICATION FOOTER */}
            <div className="relative z-10 border-t border-slate-700/80 pt-2 flex items-center justify-between text-[8px] text-slate-400">
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>BSAT 100% VERIFIED</span>
              </div>
              <div className="font-mono text-slate-400">statcourt.in.th/news</div>
            </div>
          </div>
        </div>

        {/* MODAL ACTION BUTTONS */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A] shrink-0 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              type="button"
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "คัดลอกลิงก์แล้ว!" : "คัดลอกลิงก์"}</span>
            </button>
          </div>

          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            type="button"
            className="px-5 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950/50 transition cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังสร้างภาพ...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดรูปการ์ด IG Story (PNG)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
