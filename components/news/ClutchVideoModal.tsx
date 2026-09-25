"use client";

import React from "react";
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 text-white font-mono flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#1E293B]/70">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100">
              CLUTCH &amp; GAME-WINNING SHOT REPLAY
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VIDEO DISPLAY / 1080P SIMULATOR */}
        <div className="w-full aspect-video bg-black relative flex items-center justify-center overflow-hidden">
          {videoUrl && videoUrl.includes("youtube.com/embed") ? (
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-radial from-slate-900 to-black p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition cursor-pointer mb-3">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <div className="font-bold text-base text-white uppercase tracking-wider">
                {title}
              </div>
              <div className="text-xs text-red-400 font-bold mt-1">
                จังหวะตัดสินเกมช่วง {quarterClock} vs {opponent}
              </div>
              <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>บันทึกด้วยระบบกล้องความเร็วสูง 1080p 60fps โต๊ะกลาง BSAT</span>
              </span>
            </div>
          )}

          {/* Timecode overlay */}
          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur border border-slate-700 rounded px-2.5 py-1 text-[10px] text-white flex items-center gap-1.5 font-bold">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>TIMECODE: {quarterClock}</span>
          </div>
        </div>

        {/* DETAILS */}
        <div className="p-5 space-y-2 bg-[#0F172A]">
          <h4 className="font-bold text-sm text-white">{title}</h4>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {description}
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[11px] text-slate-500">
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
