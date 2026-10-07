"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Radio,
  FileText,
  Trophy,
  LogIn,
} from "lucide-react";

export default function OrganizerSolutionsBanner() {
  return (
    <section className="py-12 lg:py-16 bg-[#F8F9FF] border-b border-[#DFE2EB]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-[#0B1C30] text-white border border-[#213145] shadow-2xl p-6 sm:p-8 lg:p-10">
          
          {/* Subtle Decorative Basketball Court Arc */}
          <div 
            className="absolute -right-16 -top-16 w-80 h-80 rounded-full border border-white/[0.04] pointer-events-none hidden md:block" 
            aria-hidden="true"
          />
          <div 
            className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full border border-[#AF101A]/10 pointer-events-none hidden md:block" 
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* ฝั่งซ้าย: ข้อมูลและ Value Proposition */}
            <div className="space-y-4 max-w-3xl font-thai">
              
              {/* Overline Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#AF101A]/15 border border-[#AF101A]/30 text-xs font-medium text-slate-300">
                <Trophy className="w-3.5 h-3.5 text-[#FF7A7A]" />
                <span>สำหรับผู้จัดการแข่งขัน &amp; สมาคมกีฬาบาสเกตบอล</span>
              </div>
              
              {/* Main Headline */}
              <h3 className="text-2xl sm:text-3xl lg:text-3.5xl font-bold tracking-tight text-white leading-tight font-thai">
                ยกระดับทัวร์นาเมนต์สู่มาตรฐานสากล ด้วยระบบ FIBA LiveStats
              </h3>
              
              {/* Supporting Text */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-thai">
                ครบจบในระบบเดียว: บันทึกแต้มด้วย <strong className="text-white font-semibold">โต๊ะเทคนิคสัมผัส</strong>, สตรีมมิ่งสถิติสดระดับเสี้ยววินาที, ตรวจสอบอายุด้วย <strong className="text-white font-semibold">Digital Pass</strong> และออกใบคะแนน <strong className="text-white font-semibold">FIBA Scoresheet PDF</strong> ได้ทันทีหลังจบเกม
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-thai">
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#071322] border border-[#213145] text-xs text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">มาตรฐาน FIBA LiveStats</span>
                </div>
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#071322] border border-[#213145] text-xs text-slate-200">
                  <Radio className="w-4 h-4 text-[#FF7A7A] shrink-0" />
                  <span className="font-medium">ถ่ายทอดสถิติสดเรียลไทม์</span>
                </div>
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#071322] border border-[#213145] text-xs text-slate-200">
                  <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="font-medium">ออก Scoresheet PDF ทันที</span>
                </div>
              </div>
            </div>

            {/* ฝั่งขวา: Action Buttons */}
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 font-thai lg:min-w-[220px]">
              <Link
                href="/solutions"
                className="group px-6 py-3.5 rounded-xl bg-[#AF101A] hover:bg-[#8E0D15] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-900/40"
              >
                <span>ดูโซลูชันสำหรับผู้จัด</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/admin"
                className="px-6 py-3 rounded-xl bg-[#0d223a] hover:bg-[#153354] text-slate-200 hover:text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all border border-[#213145]"
              >
                <LogIn className="w-4 h-4 text-slate-400" />
                <span>เข้าสู่ระบบหลังบ้าน</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
