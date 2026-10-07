"use client";

import React, { useEffect } from "react";
import { X, Play, Clock, ShieldCheck, Flame } from "lucide-react";

interface ClutchVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  opponent: string;
  quarterClock: string;
  description: string;
  videoUrl?: string;
}

export default function ClutchVideoModal({
  isOpen,
  onClose,
  title,
  opponent,
  quarterClock,
  description,
  videoUrl,
}: ClutchVideoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clutch-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0B1C30] border border-[#213145] rounded-2xl shadow-2xl overflow-hidden my-6 text-white font-sans flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#213145] bg-[#071322]">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#AF101A]" />
            <span
              id="clutch-modal-title"
              className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100"
            >
              CLUTCH &amp; GAME-WINNING SHOT REPLAY
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างคลิปไฮไลต์"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VIDEO DISPLAY / 1080P SIMULATOR */}
        <div className="w-full aspect-video bg-black relative flex items-center justify-center overflow-hidden">
          {videoUrl && videoUrl.includes("youtube.com/embed") ? (
            <iframe
              src={videoUrl}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#071322] p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#AF101A] hover:bg-[#8E0D15] text-white flex items-center justify-center shadow-lg transition cursor-pointer mb-3">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
              <div className="font-bold text-base text-white uppercase tracking-wider font-headline-md max-w-md">
                {title}
              </div>
              <div className="text-xs text-red-400 font-bold mt-1">
                จังหวะตัดสินเกมช่วง <span className="font-mono tabular-nums">{quarterClock}</span> vs {opponent}
              </div>
              <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0d223a] border border-[#213145] text-slate-300 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>บันทึกด้วยระบบกล้องความเร็วสูง 1080p 60fps โต๊ะกลาง BSAT</span>
              </span>
            </div>
          )}

          {/* Timecode overlay */}
          <div className="absolute bottom-3 left-3 bg-[#0B1C30]/90 border border-[#213145] rounded-xl px-2.5 py-1 text-[10px] text-white flex items-center gap-1.5 font-bold font-mono">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>TIMECODE: <span className="tabular-nums">{quarterClock}</span></span>
          </div>
        </div>

        {/* DETAILS */}
        <div className="p-5 space-y-2 bg-[#0B1C30]">
          <h3 className="font-bold text-sm text-white font-headline-sm">{title}</h3>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {description}
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-[#213145] text-[11px] text-slate-400">
            <span>คู่แข่ง: {opponent}</span>
            <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Highlight Verified</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
