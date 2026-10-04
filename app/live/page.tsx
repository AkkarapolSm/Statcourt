"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import UnifiedLiveMatchHub from "@/components/live/UnifiedLiveMatchHub";
import {
  Film,
  Shield,
  ChevronRight,
} from "lucide-react";

export default function LiveMatchStreamPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans antialiased selection:bg-[#AF101A] selection:text-white">
      <Navbar />

      {/* Sleek Compact Broadcast Bar (Courtside Editorial) */}
      <section className="bg-[#0B1C30] text-white border-b border-[#1E3A5F] py-2 px-4 sm:px-6 lg:px-8 relative select-none">
        <div className="max-w-[1536px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#AF101A]/20 border border-[#AF101A]/40 text-red-200 font-bold text-[11px] tracking-wide font-mono">
              <span className="w-2 h-2 rounded-full bg-[#AF101A] animate-pulse" />
              FIBA LIVE ARENA
            </span>
            <span className="text-slate-300 font-medium text-xs hidden sm:inline">
              สัญญาณตรงมาตรฐานสากล ซิงก์คะแนนโต๊ะกลางแบบ Real-time
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/matches"
              className="text-slate-300 hover:text-white flex items-center gap-1 font-medium transition"
            >
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>คลังเทปย้อนหลัง (Film Archive)</span>
            </Link>
            <span className="text-slate-600">•</span>
            <Link
              href="/official/console/match-bcc-ds-01"
              className="text-slate-300 hover:text-white flex items-center gap-1 font-medium transition"
            >
              <Shield className="w-3.5 h-3.5 text-[#AF101A]" />
              <span>โต๊ะกรรมการ (Official)</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Live Broadcast Theater Canvas */}
      <main className="flex-1 pb-16 max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
        <UnifiedLiveMatchHub matchId="match-bcc-ds-01" />
      </main>

      <Footer />
    </div>
  );
}
