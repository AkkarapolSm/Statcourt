"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import UnifiedLiveMatchHub from "@/components/live/UnifiedLiveMatchHub";
import {
  Radio,
  Film,
  Shield,
  ChevronRight,
  Eye,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function LiveMatchStreamPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans antialiased selection:bg-[#DC2626] selection:text-white">
      <Navbar />

      {/* 1. Top Crimson Sub-Banner (Standard StatCourtTH header) */}
      <div className="bg-[#991B1B] text-white py-2 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
        <div className="flex items-center gap-2 flex-wrap font-mono">
          <span className="bg-white text-[#991B1B] font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-sans">
            FIBA LIVE BROADCAST
          </span>
          <span className="font-bold tracking-wide text-[11px]">
            การถ่ายทอดสดสัญญาณตรงมาตรฐานสากล ซิงก์คะแนนโต๊ะกลางแบบ Real-time (&lt; 30ms)
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-red-100 hidden sm:inline">Multi-Court Sync • Multi-Cam Active</span>
        </div>
      </div>

      {/* 2. Hero Header Section (Consistent with /tournaments, /team, and /matches) */}
      <section className="bg-[#0F172A] text-white py-8 sm:py-10 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 court-grid-pattern opacity-15 pointer-events-none" />
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#AF101A]/20 border border-[#AF101A]/40 text-[#FFDAD6] text-xs font-mono font-bold tracking-widest uppercase">
                <Radio className="w-3.5 h-3.5 text-[#DC2626] animate-pulse" />
                <span>LIVE BROADCAST &amp; COURTSIDE ARENA</span>
              </div>
              <h1 className="font-headline-xl text-white uppercase tracking-wider text-2xl sm:text-3xl lg:text-4xl font-normal leading-tight">
                ศูนย์ถ่ายทอดสดและผลการแข่งขันสด
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                รับชมการแข่งขันสดพร้อมกันหลายสนาม (Multi-Court Arena), คะแนนสด SSE Real-time,
                แชตเชียร์สดร่วมกับแฟนบาสเกตบอล, และระบบชาเลนจ์คำตัดสิน FIBA IRS
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Live Stream Hub Component */}
      <main className="flex-1 pb-16 max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <UnifiedLiveMatchHub matchId="match-bcc-ds-01" />
      </main>

      <Footer />
    </div>
  );
}
