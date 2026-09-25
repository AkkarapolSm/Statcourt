"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { mockOpportunities } from "@/lib/db/phase2-data";

export default function TcasScholarshipsSection() {
  const featuredOpportunities = useMemo(() => {
    return mockOpportunities.slice(0, 3);
  }, []);

  return (
    <section className="py-14 bg-white border-y border-slate-200">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-block bg-emerald-100 text-emerald-800 font-mono uppercase font-bold px-3 py-1 rounded text-xs mb-2">
              TCAS ATHLETIC QUOTAS &amp; SCHOLARSHIPS
            </div>
            <h2 className="font-headline-xl text-3xl sm:text-4xl uppercase text-[#0B1C30] font-black tracking-tight">
              ศูนย์รวมโควตาทุนการศึกษาและโอกาสนักกีฬา มหาวิทยาลัยชั้นนำ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              ช่องทางคัดเลือกตรงรอบแฟ้มสะสมผลงาน (TCAS Portfolio) ด้วยสถิติการแข่งขันที่ผ่านการรับรองมาตรฐานสากล
            </p>
          </div>

          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded bg-slate-900 hover:bg-[#DC2626] text-white font-mono font-bold text-xs uppercase transition shadow-xs shrink-0"
          >
            <span>สำรวจโควตาทั้งหมด 12 สถาบัน</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-[#DC2626]/40 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-headline-md font-bold text-slate-800 text-sm">
                    {opp.institutionLogo}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {opp.quotaCount} โควตา
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-[#AF101A] font-bold block mb-0.5">
                    {opp.institution}
                  </span>
                  <h4 className="font-headline-sm font-bold text-slate-900 text-base leading-snug line-clamp-2">
                    {opp.title}
                  </h4>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 font-mono text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>สิทธิประโยชน์:</span>
                    <span className="font-bold text-slate-900 text-right">{opp.scholarshipDisplay}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>เกรดเฉลี่ยขั้นต่ำ (GPAX):</span>
                    <span className="font-bold text-slate-900">{opp.minGpax ? opp.minGpax.toFixed(2) : "ไม่กำหนด"}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>กำหนดปิดรับสมัคร:</span>
                    <span className="font-bold text-red-600">{opp.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  รอบ 1 Portfolio (TCAS)
                </span>
                <Link
                  href="/opportunities"
                  className="text-xs font-mono font-bold text-[#DC2626] hover:underline flex items-center gap-1"
                >
                  <span>ดูระเบียบการ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
