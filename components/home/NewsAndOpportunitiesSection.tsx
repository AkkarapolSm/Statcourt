"use client";

import React from "react";
import Link from "next/link";
import {
  Newspaper,
  GraduationCap,
  ArrowRight,
  ChevronRight,
  Clock,
  Sparkles,
  Play,
  Calendar,
  Building2,
} from "lucide-react";
import { mockOpportunities } from "@/lib/db/phase2-data";

export default function NewsAndOpportunitiesSection() {
  const newsItems = [
    {
      id: "news-01",
      title: "กรุงเทพคริสเตียน เฉือน เทพศิรินทร์ สุดมันส์ 75-63 คว้าแชมป์กลุ่มสาย A ศึก TOA U18",
      category: "TOA U18 FINALS",
      time: "2 ชั่วโมงที่แล้ว",
      readTime: "อ่าน 3 นาที",
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "news-02",
      title: "สรุป 10 ดาวรุ่งฟอร์มเด่นรอบคัดเลือก TCAS 2569 โค้ชมหาวิทยาลัยจับตามองใกล้ชิด",
      category: "SCOUT REPORT",
      time: "5 ชั่วโมงที่แล้ว",
      readTime: "อ่าน 4 นาที",
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "news-03",
      title: "เปิดรับสมัครผู้ตัดสินโต๊ะเทคนิคมาตรฐาน FIBA LiveStats รุ่นที่ 4 ประจำปี 2026",
      category: "FIBA ACADEMY",
      time: "1 วันที่แล้ว",
      readTime: "อ่าน 2 นาที",
      imageUrl: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const topOpportunities = mockOpportunities.slice(0, 3);

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ========================================================= */}
          {/* LEFT: BASKETBALL NEWS & HIGHLIGHTS (7 COLS)               */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#AF101A] uppercase">
                  <Newspaper className="w-4 h-4" />
                  <span>THAILAND BASKETBALL NEWS &amp; HIGHLIGHTS</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0B1C30] uppercase">
                  ข่าวสารและไฮไลต์การแข่งขัน
                </h3>
              </div>

              <Link
                href="/news"
                className="text-xs font-mono font-bold text-slate-500 hover:text-[#AF101A] flex items-center gap-1 transition"
              >
                <span>ดูข่าวทั้งหมด</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {newsItems.map((news) => (
                <Link
                  key={news.id}
                  href="/news"
                  className="group rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="aspect-[16/10] bg-slate-900 relative overflow-hidden">
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                    />
                    <span className="absolute top-2 left-2 bg-[#AF101A] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
                      {news.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B1C30] group-hover:text-[#AF101A] transition line-clamp-2 leading-snug">
                      {news.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                      <span>{news.time}</span>
                      <span>{news.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: SCHOLARSHIPS & TCAS QUOTA (5 COLS)                 */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 bg-[#0B1C30] text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase">
                  <GraduationCap className="w-4 h-4" />
                  <span>ATHLETE PATHWAYS &amp; SCHOLARSHIPS</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase">
                  โอกาสและทุนการศึกษา TCAS
                </h3>
              </div>

              <Link
                href="/opportunities"
                className="text-xs font-mono font-bold text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <span>ดูทุกทุน</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {topOpportunities.map((opp) => (
                <Link
                  key={opp.id}
                  href="/opportunities"
                  className="block p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition group space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-red-400 font-bold uppercase text-[10px]">
                      {opp.level} • {opp.scholarshipDisplay}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      ปิดรับ {new Date(opp.deadline).toLocaleDateString("th-TH")}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover:text-red-300 transition line-clamp-1 font-sans">
                    {opp.title}
                  </h4>

                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      <span>{opp.institution}</span>
                    </span>
                    <span>•</span>
                    <span>เกรดขั้นต่ำ {opp.minGpax ? opp.minGpax.toFixed(2) : "2.00"}</span>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              href="/opportunities"
              className="w-full py-2.5 rounded-xl bg-[#AF101A] hover:bg-[#8F0D15] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition text-center shadow cursor-pointer"
            >
              <span>ส่งใบสมัครคัดตัวด้วย StatCourt ID</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
