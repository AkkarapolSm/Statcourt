"use client";

import React, { useState } from "react";
import {
  Crosshair,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Columns2,
  Layers,
  Flame,
} from "lucide-react";

interface ZoneStat {
  zoneName: string;
  zoneCode: string;
  homeFgPct: number;
  homeAttempts: number;
  homeMade: number;
  awayFgPct: number;
  awayAttempts: number;
  awayMade: number;
  tacticalAdvantage: "HOME" | "AWAY" | "NEUTRAL";
  tacticalNote: string;
}

export default function ShotChartComparison() {
  const [viewMode, setViewMode] = useState<"SIDE_BY_SIDE" | "OVERLAY">("SIDE_BY_SIDE");

  const zones: ZoneStat[] = [
    {
      zoneName: "ใต้แป้น / วงในระยะประชิด (Restricted Area / Paint)",
      zoneCode: "RIM",
      homeFgPct: 64.2,
      homeAttempts: 28,
      homeMade: 18,
      awayFgPct: 48.5,
      awayAttempts: 33,
      awayMade: 16,
      tacticalAdvantage: "HOME",
      tacticalNote: "BCC มีประสิทธิภาพการจบสกอร์ใต้แป้นเหนือกว่า +15.7% จากลูก Pick & Roll ของ #7 Thanakorn",
    },
    {
      zoneName: "ระยะกลาง / ขอบเส้นทึบ (Mid-Range Key)",
      zoneCode: "MID",
      homeFgPct: 38.5,
      homeAttempts: 13,
      homeMade: 5,
      awayFgPct: 44.0,
      awayAttempts: 25,
      awayMade: 11,
      tacticalAdvantage: "AWAY",
      tacticalNote: "เทพศิรินทร์พึ่งพาการยิงระยะ 15-18 ฟุตเป็นหลัก โดยเฉพาะ #23 Nattapat ที่มีสเต็ปแบ็กแม่นยำ",
    },
    {
      zoneName: "3 แต้มหัวกะโหลก (Above-the-Break 3PT)",
      zoneCode: "TOP_3",
      homeFgPct: 36.8,
      homeAttempts: 19,
      homeMade: 7,
      awayFgPct: 31.2,
      awayAttempts: 16,
      awayMade: 5,
      tacticalAdvantage: "HOME",
      tacticalNote: "BCC มีการหมุนเวียนบอลออกมายิงหัวกะโหลกได้สม่ำเสมอมากกว่า",
    },
    {
      zoneName: "3 แต้มมุมซ้าย (Left Corner 3PT)",
      zoneCode: "LC_3",
      homeFgPct: 41.7,
      homeAttempts: 12,
      homeMade: 5,
      awayFgPct: 28.6,
      awayAttempts: 7,
      awayMade: 2,
      tacticalAdvantage: "HOME",
      tacticalNote: "จุดทำแต้มสำคัญของ BCC เมื่อไดรฟ์ดึงตัวประกบแล้ว Kick-out ออกมุมซ้าย",
    },
    {
      zoneName: "3 แต้มมุมขวา (Right Corner 3PT)",
      zoneCode: "RC_3",
      homeFgPct: 33.3,
      homeAttempts: 9,
      homeMade: 3,
      awayFgPct: 42.9,
      awayAttempts: 7,
      awayMade: 3,
      tacticalAdvantage: "AWAY",
      tacticalNote: "จุดอันตรายของเทพศิรินทร์ ต้องบีบปิดไม่ให้มีตัว Spot-up โล่งเด็ดขาด",
    },
  ];

  return (
    <div className="bg-white border border-[#DFE2EB] rounded-lg overflow-hidden shadow-xs flex flex-col text-slate-900">
      {/* Header */}
      <div className="px-6 py-4 bg-[#F8F9FF] border-b border-[#DFE2EB] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#AF101A] flex items-center justify-center font-bold text-white shadow-xs">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[#0B1C30] font-headline-lg uppercase text-lg sm:text-xl tracking-wide font-normal flex items-center gap-2">
              <span>Head-to-Head Shot Chart Comparison</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-red-50 text-[#AF101A] border border-red-200 font-bold uppercase">
                TACTICAL HEATMAP
              </span>
            </h3>
            <p className="text-xs text-[#505A69] font-mono">
              Bangkok Christian College (BCC) vs Debsirin School (DS)
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-sm font-mono text-xs border border-[#DFE2EB]">
          <button
            type="button"
            onClick={() => setViewMode("SIDE_BY_SIDE")}
            className={`px-3 py-1.5 rounded-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === "SIDE_BY_SIDE"
                ? "bg-[#AF101A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>เทียบเคียงข้างกัน (Split)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("OVERLAY")}
            className={`px-3 py-1.5 rounded-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === "OVERLAY"
                ? "bg-[#AF101A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>แผนที่ทับซ้อน (Overlay)</span>
          </button>
        </div>
      </div>

      {/* Main Comparative View */}
      <div className="p-6 space-y-6">
        
        {viewMode === "SIDE_BY_SIDE" ? (
          /* Visual Half-Court Comparison Display: Side-by-Side */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* BCC Shot Profile */}
            <div className="bg-[#F8F9FF] border border-[#DFE2EB] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DFE2EB]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#AF101A]" />
                  <span className="font-bold text-sm text-[#0B1C30] font-mono uppercase">
                    Bangkok Christian College (ทีมเรา)
                  </span>
                </div>
                <span className="text-xs font-mono text-[#505A69] font-bold">
                  eFG%: <span className="text-[#AF101A] tabular-nums">57.2%</span> • TS%: <span className="text-[#0B1C30] tabular-nums">61.4%</span>
                </span>
              </div>

              {/* Heatmap Distribution Bars */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 pb-1">
                    <span className="font-bold">ใต้แป้น (Rim / Paint): 18/28 (64.2%)</span>
                    <span className="text-[#AF101A] font-bold inline-flex items-center gap-1">
                      <Flame className="w-3 h-3" /> HIGH EFFICIENCY
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-sm overflow-hidden">
                    <div className="bg-[#AF101A] h-full rounded-sm" style={{ width: "64.2%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 pb-1">
                    <span className="font-bold">3 แต้มมุมซ้าย (Left Corner): 5/12 (41.7%)</span>
                    <span className="text-[#AF101A] font-bold">HOT ZONE</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-sm overflow-hidden">
                    <div className="bg-[#AF101A] h-full rounded-sm" style={{ width: "41.7%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 pb-1">
                    <span className="font-bold">3 แต้มหัวกะโหลก (Above-the-Break): 7/19 (36.8%)</span>
                    <span className="text-[#505A69]">AVERAGE</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-sm overflow-hidden">
                    <div className="bg-slate-400 h-full rounded-sm" style={{ width: "36.8%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Debsirin Shot Profile */}
            <div className="bg-[#F8F9FF] border border-[#DFE2EB] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DFE2EB]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0B1C30]" />
                  <span className="font-bold text-sm text-[#0B1C30] font-mono uppercase">
                    Debsirin School (คู่แข่ง)
                  </span>
                </div>
                <span className="text-xs font-mono text-[#505A69] font-bold">
                  eFG%: <span className="text-[#0B1C30] tabular-nums">49.8%</span> • TS%: <span className="text-[#0B1C30] tabular-nums">53.2%</span>
                </span>
              </div>

              {/* Heatmap Distribution Bars */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 pb-1">
                    <span className="font-bold">ระยะกลาง (Mid-Range Key): 11/25 (44.0%)</span>
                    <span className="text-amber-700 font-bold">HIGH VOLUME</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-sm overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-sm" style={{ width: "44.0%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 pb-1">
                    <span className="font-bold">ใต้แป้น (Rim / Paint): 16/33 (48.5%)</span>
                    <span className="text-[#505A69] font-bold">LOW FINISH</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-sm overflow-hidden">
                    <div className="bg-slate-400 h-full rounded-sm" style={{ width: "48.5%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-700 pb-1">
                    <span className="font-bold">3 แต้มมุมขวา (Right Corner): 3/7 (42.9%)</span>
                    <span className="text-[#AF101A] font-bold">DANGER ZONE</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-sm overflow-hidden">
                    <div className="bg-[#AF101A] h-full rounded-sm" style={{ width: "42.9%" }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Overlay Comparative Mode: Single Card with Dual Bars */
          <div className="bg-[#F8F9FF] border border-[#DFE2EB] rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DFE2EB]">
              <span className="font-bold text-sm text-[#0B1C30] font-mono uppercase">
                OVERLAY COMPARISON: โซนการยิงประกบคู่ (BCC vs DEBSIRIN)
              </span>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 font-bold text-[#AF101A]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#AF101A]" /> BCC (ทีมเรา)
                </span>
                <span className="flex items-center gap-1.5 font-bold text-[#0B1C30]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#0B1C30]" /> เทพศิรินทร์
                </span>
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {zones.map((z) => (
                <div key={z.zoneCode} className="space-y-1.5 p-3 rounded-lg bg-white border border-[#DFE2EB]">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span>{z.zoneName}</span>
                    <span className={z.tacticalAdvantage === "HOME" ? "text-[#AF101A]" : "text-[#0B1C30]"}>
                      {z.tacticalAdvantage === "HOME" ? "BCC ได้เปรียบ" : "คู่แข่งได้เปรียบ"}
                    </span>
                  </div>
                  {/* BCC Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>BCC: {z.homeMade}/{z.homeAttempts} ({z.homeFgPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden">
                      <div className="bg-[#AF101A] h-full rounded-sm" style={{ width: `${z.homeFgPct}%` }} />
                    </div>
                  </div>
                  {/* DS Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>DS: {z.awayMade}/{z.awayAttempts} ({z.awayFgPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden">
                      <div className="bg-[#0B1C30] h-full rounded-sm" style={{ width: `${z.awayFgPct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tactical Breakdown Table */}
        <div className="border border-[#DFE2EB] rounded-lg overflow-hidden bg-white font-mono text-xs shadow-xs">
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FF] border-b border-[#DFE2EB] text-[#505A69] uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">โซนการยิง (COURT ZONE)</th>
                <th className="py-3 px-4 text-center text-[#0B1C30] font-bold">BCC (ทีมเรา)</th>
                <th className="py-3 px-4 text-center text-slate-700 font-bold">เทพศิรินทร์ (คู่แข่ง)</th>
                <th className="py-3 px-4 text-center">ความได้เปรียบ</th>
                <th className="py-3 px-4">ข้อเสนอแนะเชิงแท็กติก (COACHING INSIGHT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE2EB]/60">
              {zones.map((z) => (
                <tr key={z.zoneCode} className="hover:bg-[#F8F9FF] transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {z.zoneName}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#AF101A] tabular-nums">
                    {(z.homeFgPct ?? 0).toFixed(1)}% ({z.homeMade ?? 0}/{z.homeAttempts ?? 0})
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#0B1C30] tabular-nums">
                    {(z.awayFgPct ?? 0).toFixed(1)}% ({z.awayMade ?? 0}/{z.awayAttempts ?? 0})
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {z.tacticalAdvantage === "HOME" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-red-50 text-[#AF101A] border border-red-200">
                        <TrendingUp className="w-3 h-3 text-[#AF101A]" />
                        <span>BCC +{((z.homeFgPct ?? 0) - (z.awayFgPct ?? 0)).toFixed(1)}%</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-[#DFE2EB]">
                        <AlertTriangle className="w-3 h-3 text-slate-500" />
                        <span>DS +{((z.awayFgPct ?? 0) - (z.homeFgPct ?? 0)).toFixed(1)}%</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[#505A69] text-[11px] font-sans">
                    {z.tacticalNote}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Tactical Gameplan Callout */}
        <div className="bg-red-50/60 border border-red-200 border-l-4 border-l-[#AF101A] rounded-lg p-4 flex items-start gap-3 text-xs font-mono shadow-xs">
          <ShieldAlert className="w-5 h-5 text-[#AF101A] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#AF101A] uppercase text-[11px] block">
              TACTICAL DIRECTIVE FOR UPCOMING MATCH:
            </span>
            <p className="text-slate-700 leading-relaxed font-sans">
              "บีบให้เทพศิรินทร์ยิงระยะ Mid-Range 18 ฟุตต่อไป และบังคับตัวไดรฟ์ของพวกเขาออกจากโซนใต้แป้น 
              ขณะที่เกมรุกของเรา ให้เน้น Pick &amp; Roll เจาะ Drop Coverage เพื่อสร้างช็อตเลย์อัพหรือส่งออก Left Corner 3 ที่มีอัตราแม่นยำสูงถึง 41.7%"
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
