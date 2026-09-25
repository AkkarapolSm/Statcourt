"use client";

import React from "react";

export default function CredibilityStatsSection() {
  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          
          <div className="p-4 sm:p-5 space-y-1.5 flex flex-col items-center">
            <p className="font-headline-xl text-[#0B1C30] font-black text-4xl sm:text-5xl tracking-tight leading-none">
              100%
            </p>
            <p className="text-xs font-mono font-bold text-[#AF101A] uppercase tracking-wider">
              FIBA OFFICIAL COMPLIANT
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
              ระบบคำนวณสถิติและกติกาการแข่งขัน สอดคล้องตามเกณฑ์มาตรฐานสากล FIBA 2026
            </p>
          </div>

          <div className="p-4 sm:p-5 space-y-1.5 flex flex-col items-center">
            <p className="font-headline-xl text-[#0B1C30] font-black text-4xl sm:text-5xl tracking-tight leading-none">
              0-SEC
            </p>
            <p className="text-xs font-mono font-bold text-[#AF101A] uppercase tracking-wider">
              REAL-TIME VIDEO SYNC
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
              ผสานตัวเลขสถิติเข้ากับคลิปวิดีโอเหตุการณ์จริง ตรวจสอบย้อนหลังได้อย่างแม่นยำและโปร่งใส
            </p>
          </div>

          <div className="p-4 sm:p-5 space-y-1.5 flex flex-col items-center">
            <p className="font-headline-xl text-[#0B1C30] font-black text-4xl sm:text-5xl tracking-tight leading-none">
              TCAS-69
            </p>
            <p className="text-xs font-mono font-bold text-[#AF101A] uppercase tracking-wider">
              ACCREDITED PORTFOLIO
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
              เอกสารรับรองสถิติทางการพร้อมรหัส QR Code ตามเกณฑ์คัดเลือกโควตากีฬาระดับอุดมศึกษา
            </p>
          </div>

          <div className="p-4 sm:p-5 space-y-1.5 flex flex-col items-center">
            <p className="font-headline-xl text-[#0B1C30] font-black text-4xl sm:text-5xl tracking-tight leading-none">
              40+
            </p>
            <p className="text-xs font-mono font-bold text-[#AF101A] uppercase tracking-wider">
              CERTIFIED TABLE OFFICIALS
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
              เครือข่ายเจ้าหน้าที่โต๊ะเทคนิคที่ผ่านการอบรมและรับรองมาตรฐานจาก StatCourt Academy
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
