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
    },
    {
      court: "สนาม 2",
      teams: "ACT 48 : 48 SK",
      time: "Q3 04:11",
    },
    {
      court: "สนาม 3",
      teams: "CMU 34 : 38 CHON",
      time: "Q2 01:15",
    },
  ];

  return (
    <section className="bg-[#0B1C30] text-slate-300 py-2.5 px-4 sm:px-6 border-b border-[#213145] font-sans text-xs">
      <div className="max-w-[1536px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Tournament Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7A7A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7A7A]" />
          </span>
          <span className="font-semibold text-white">
            สดจากสนาม (Live)
          </span>
          <span className="text-slate-400 hidden lg:inline">
            · TOA Youth Basketball League
          </span>
        </div>

        {/* Center: Multi-court Scores Ticker (Scrollable on mobile) */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-0.5">
          {tickerMatches.map((m, idx) => (
            <div key={idx} className="flex items-center gap-1.5 sm:gap-2 text-xs whitespace-nowrap shrink-0">
              <span className="text-slate-400 text-[11px]">{m.court}:</span>
              <span className="font-barlow font-bold text-white tabular-nums tracking-wide">{m.teams}</span>
              <span className="text-slate-300 bg-white/10 px-1.5 py-0.5 rounded-md text-[11px] font-barlow tabular-nums">
                {m.time}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Direct Action to Multi-Court Arena */}
        <div className="shrink-0 hidden sm:block">
          <Link
            href="/live"
            className="inline-flex items-center gap-1 text-xs text-[#FF7A7A] hover:text-white font-medium py-1 px-1.5 transition-colors"
          >
            <span>เปิดสนามสด 3 คอร์ท</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
