"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Radio, FileText } from "lucide-react";

export default function OrganizerSolutionsBanner() {
  return (
    <section className="py-12 bg-surface-base border-b border-borderNeutral">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-7 sm:p-8 rounded-2xl bg-[#0B1C30] text-white border border-slate-800 shadow-md">
          
          <div className="space-y-3 max-w-2xl font-sans">
            <span className="text-xs text-slate-400 block font-sans">
              สำหรับผู้จัดทัวร์นาเมนต์และองค์กรกีฬา
            </span>
            
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              คุณเป็นผู้จัดทัวร์นาเมนต์ หรือตัวแทนสมาคมกีฬา?
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
              ยกระดับสู่มาตรฐานสากลด้วยระบบโต๊ะเทคนิคสัมผัส (Table Official Console), สตรีมมิ่งสถิติสดระดับเสี้ยววินาที, บัตรนักกีฬาตรวจสอบอายุ Digital Pass และออกใบบันทึกคะแนน FIBA Scoresheet PDF ได้ทันที
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>มาตรฐาน FIBA LiveStats</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-[#FF7A7A]" />
                <span>คะแนนสดเรียลไทม์ (SSE)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-300" />
                <span>ใบคะแนน PDF ทันที</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5 font-sans">
            <Link
              href="/solutions"
              className="px-5 py-3 rounded-lg bg-[#AF101A] hover:bg-[#8E0D15] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <span>ดูโซลูชันสำหรับผู้จัด</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <span>เข้าสู่ระบบหลังบ้าน</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
