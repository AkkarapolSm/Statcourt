"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Trophy, ArrowRight, ShieldCheck, Radio, FileText } from "lucide-react";

export default function OrganizerSolutionsBanner() {
  return (
    <section className="py-12 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white border-b border-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 court-grid-pattern opacity-10 pointer-events-none" />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 rounded-2xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-sm">
          
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AF101A]/30 border border-[#AF101A]/50 text-red-200 text-xs font-mono font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>FOR TOURNAMENT ORGANIZERS &amp; FEDERATIONS</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              คุณเป็นผู้จัดทัวร์นาเมนต์บาสเกตบอล หรือตัวแทนสมาคมกีฬา?
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
              ยกระดับสู่มาตรฐานสากลด้วยระบบโต๊ะเทคนิคสัมผัส (Table Official Console), สตรีมมิ่งสถิติสดระดับเสี้ยววินาที (SSE), บัตรนักกีฬาตรวจสอบอายุ Digital Pass และออกใบบันทึกคะแนน FIBA Scoresheet PDF ในคลิกเดียว
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>มาตรฐาน FIBA 2026</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-red-400" />
                <span>Live Score SSE</span>
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>ใบคะแนน PDF ทันที</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              href="/solutions"
              className="px-6 py-3.5 rounded-xl bg-[#AF101A] hover:bg-[#8F0D15] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xl shadow-red-950/50 cursor-pointer"
            >
              <span>ดูโซลูชันสำหรับผู้จัด (Solutions Hub)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <span>เข้าสู่ระบบหลังบ้านผู้ดูแล (Admin)</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
