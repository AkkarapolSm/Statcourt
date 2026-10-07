"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ArrowRight,
  Clock,
  Building2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { mockOpportunities } from "@/lib/db/phase2-data";

export default function NewsAndOpportunitiesSection() {
  const newsItems = [
    {
      id: "news-01",
      title: "กรุงเทพคริสเตียน เฉือน เทพศิรินทร์ สุดมันส์ 75-63 คว้าแชมป์กลุ่มสาย A ศึก TOA U18",
      category: "TOA U18 Finals",
      time: "2 ชม. ที่แล้ว",
      readTime: "อ่าน 3 นาที",
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "news-02",
      title: "สรุป 10 ดาวรุ่งฟอร์มเด่นรอบคัดเลือก TCAS 2569 ที่โค้ชมหาวิทยาลัยกำลังจับตามอง",
      category: "Scout Report",
      time: "5 ชม. ที่แล้ว",
      readTime: "อ่าน 4 นาที",
      imageUrl: "/images/home/basketball-athlete.png",
    },
    {
      id: "news-03",
      title: "เปิดรับสมัครผู้ตัดสินโต๊ะเทคนิค มาตรฐาน FIBA LiveStats รุ่นที่ 4 ประจำปี 2026",
      category: "FIBA Academy",
      time: "1 วันที่แล้ว",
      readTime: "อ่าน 2 นาที",
      imageUrl: "/images/court/hardwood-court.jpg",
    },
  ];

  const topOpportunities = mockOpportunities.slice(0, 3);

  return (
    <section className="py-12 lg:py-16 bg-[#F8F9FF] border-b border-[#DFE2EB]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* ========================================================= */}
          {/* ซ้าย: ข่าวสารและไฮไลต์ (7 คอลัมน์)                        */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            {/* Header */}
            <div className="flex items-end justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#AF101A]" />
                  <span className="text-xs font-medium text-[#5B6574] font-thai">
                    รายงานสนามและบทวิเคราะห์
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#0B1C30] font-thai tracking-normal">
                  ข่าวสารและไฮไลต์การแข่งขัน
                </h3>
              </div>

              <Link
                href="/news"
                className="group text-xs font-semibold text-[#5B6574] hover:text-[#AF101A] flex items-center gap-1 transition-colors pb-0.5"
              >
                <span>ดูข่าวทั้งหมด</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* News Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 flex-1">
              {newsItems.map((news) => (
                <Link
                  key={news.id}
                  href="/news"
                  className="group bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[16/10] bg-slate-900 relative overflow-hidden">
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      loading="lazy"
                      onError={(event) => {
                        const image = event.currentTarget;
                        if (!image.src.endsWith("/images/court/hardwood-court.jpg")) {
                          image.src = "/images/court/hardwood-court.jpg";
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                    <span className="absolute top-2.5 left-2.5 bg-[#0B1C30]/85 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-md border border-white/10">
                      {news.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between font-thai">
                    <h4 className="font-semibold text-xs sm:text-sm text-[#0B1C30] group-hover:text-[#AF101A] transition-colors line-clamp-2 leading-relaxed">
                      {news.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-[#5B6574] pt-3 mt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {news.time}
                      </span>
                      <span>{news.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* ขวา: โควตาและทุนการศึกษา TCAS (5 คอลัมน์)                  */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 bg-[#0B1C30] text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-[#213145] flex flex-col justify-between space-y-4.5">
            {/* Header */}
            <div className="flex items-end justify-between pb-3 border-b border-[#213145]">
              <div>
                <div className="flex items-center gap-1.5 mb-1 text-[#FF7A7A] text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-thai">เส้นทางสู่นักกีฬาอาชีพ &amp; มหาวิทยาลัย</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-thai">
                  โอกาสและทุนการศึกษา TCAS
                </h3>
              </div>

              <Link
                href="/opportunities"
                className="group text-xs font-medium text-[#A9B6C8] hover:text-white flex items-center gap-1 transition-colors pb-0.5"
              >
                <span>ดูทุกทุน</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Opportunities List */}
            <div className="space-y-2.5">
              {topOpportunities.map((opp) => (
                <Link
                  key={opp.id}
                  href="/opportunities"
                  className="block p-3 rounded-xl bg-[#071322] border border-[#213145] hover:bg-[#0d223a] hover:border-slate-500/60 transition-all duration-200 group space-y-1.5"
                >
                  {/* Meta Chips */}
                  <div className="flex items-center justify-between text-xs font-thai gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#AF101A]/20 border border-[#AF101A]/40 text-[#FF7A7A] font-medium text-[11px]">
                      {opp.scholarshipDisplay || "โควตานักกีฬา"}
                    </span>
                    <span className="text-[#A9B6C8] text-[11px] shrink-0 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      ปิดรับ {new Date(opp.deadline).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-medium text-xs sm:text-sm text-slate-100 group-hover:text-white transition-colors line-clamp-1 leading-snug font-thai">
                    {opp.title}
                  </h4>

                  {/* Institution & Requirement */}
                  <div className="text-[11px] text-[#A9B6C8] font-thai flex items-center gap-2 pt-0.5">
                    <span className="flex items-center gap-1 truncate">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{opp.institution}</span>
                    </span>
                    <span className="shrink-0 text-slate-600">•</span>
                    <span className="shrink-0 text-slate-300 font-mono tabular-nums">
                      GPAX {opp.minGpax ? opp.minGpax.toFixed(2) : "2.00"}+
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Modern Action CTA */}
            <Link
              href="/opportunities"
              className="w-full py-3 px-4 rounded-xl bg-[#AF101A] hover:bg-[#8E0D15] text-white font-thai text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-900/30 group"
            >
              <span>ส่งใบสมัครคัดตัวด้วย StatCourt ID</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
