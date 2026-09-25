"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function LiveMatchTicker() {
  const tickerMatches = [
    {
      court: "สนาม 1",
      teams: "BCC 75 : 63 DS",
      time: "Q4 05:20",
      status: "LIVE",
    },
    {
      court: "สนาม 2",
      teams: "ACT 48 : 48 SK",
      time: "Q3 04:11",
      status: "LIVE",
    },
    {
      court: "สนาม 3",
      teams: "CMU 34 : 38 CHON",
      time: "Q2 01:15",
      status: "LIVE",
    },
  ];

  return (
    <section className="bg-[#0A0F1D] text-slate-300 py-2 px-4 sm:px-6 border-b border-slate-800/80 font-mono text-xs">
      <div className="max-w-[1536px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Tournament & Live Pulse */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/60 font-bold text-[10px] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            TOA YOUTH LEAGUE LIVE
          </span>
        </div>

        {/* Center: Multi-court Scores Ticker */}
        <div className="hidden md:flex items-center gap-6 overflow-x-auto no-scrollbar">
          {tickerMatches.map((m, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11px] whitespace-nowrap">
              <span className="text-slate-500 text-[10px] font-bold">{m.court}:</span>
              <span className="font-bold text-white">{m.teams}</span>
              <span className="text-amber-400 text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-bold">
                {m.time}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Single Direct Action to Multi-Court Arena */}
        <div className="shrink-0">
          <Link
            href="/live"
            className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-white font-bold transition"
          >
            <span>ชมสด 3 สนาม (Live Arena)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
