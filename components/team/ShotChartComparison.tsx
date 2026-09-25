"use client";

import React, { useState } from "react";
import {
  Crosshair,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Columns2,
  Layers,
  Sparkles,
  Info,
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#AF101A] flex items-center justify-center font-bold text-white shadow-xs">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-headline-lg uppercase text-lg sm:text-xl tracking-wide font-normal flex items-center gap-2">
              <span>Head-to-Head Shot Chart Comparison</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
                TACTICAL HEATMAP
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Bangkok Christian College (BCC) vs Debsirin School (DS)
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg font-mono text-xs">
          <button
            type="button"
            onClick={() => setViewMode("SIDE_BY_SIDE")}
            className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
              viewMode === "SIDE_BY_SIDE"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>เทียบเคียงข้างกัน (Split)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("OVERLAY")}
            className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
              viewMode === "OVERLAY"
                ? "bg-[#AF101A] text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>แผนที่ทับซ้อน (Overlay)</span>
          </button>
        </div>
      </div>

      {/* Main Comparative View */}
      <div className="p-6 space-y-6">
        
        {/* Visual Half-Court Comparison Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* BCC Shot Profile */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#DC2626]" />
                <span className="font-bold text-sm text-white font-mono uppercase">
                  Bangkok Christian College (ทีมเรา)
                </span>
              </div>
              <span className="text-xs font-mono text-slate-300 font-bold">
                eFG%: <span className="text-white">57.2%</span> • TS%: <span className="text-white">61.4%</span>
              </span>
            </div>

            {/* Simulated Heatmap Distribution Bars */}
            <div className="space-y-2.5 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 pb-1">
                  <span>ใต้แป้น (Rim / Paint): 18/28 (64.2%)</span>
                  <span className="text-red-300 font-bold">HIGH EFFICIENCY</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#DC2626] h-full" style={{ width: "64.2%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 pb-1">
                  <span>3 แต้มมุมซ้าย (Left Corner): 5/12 (41.7%)</span>
                  <span className="text-red-300 font-bold">HOT ZONE</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#DC2626] h-full" style={{ width: "41.7%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 pb-1">
                  <span>3 แต้มหัวกะโหลก (Above-the-Break): 7/19 (36.8%)</span>
                  <span className="text-slate-400">AVERAGE</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-600 h-full" style={{ width: "36.8%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Debsirin Shot Profile */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="font-bold text-sm text-slate-200 font-mono uppercase">
                  Debsirin School (คู่แข่ง)
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 font-bold">
                eFG%: <span className="text-slate-300">49.8%</span> • TS%: <span className="text-slate-300">53.2%</span>
              </span>
            </div>

            {/* Simulated Heatmap Distribution Bars */}
            <div className="space-y-2.5 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 pb-1">
                  <span>ระยะกลาง (Mid-Range Key): 11/25 (44.0%)</span>
                  <span className="text-slate-300 font-bold">HIGH VOLUME</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full" style={{ width: "44.0%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 pb-1">
                  <span>ใต้แป้น (Rim / Paint): 16/33 (48.5%)</span>
                  <span className="text-slate-400 font-bold">LOW RIM FINISH</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-700 h-full" style={{ width: "48.5%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 pb-1">
                  <span>3 แต้มมุมขวา (Right Corner): 3/7 (42.9%)</span>
                  <span className="text-red-300 font-bold">DANGER ZONE</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#AF101A] h-full" style={{ width: "42.9%" }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Tactical Breakdown Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">โซนการยิง (COURT ZONE)</th>
                <th className="py-3 px-4 text-center text-white">BCC (ทีมเรา)</th>
                <th className="py-3 px-4 text-center text-slate-300">เทพศิรินทร์ (คู่แข่ง)</th>
                <th className="py-3 px-4 text-center">ความได้เปรียบ</th>
                <th className="py-3 px-4">ข้อเสนอแนะเชิงแท็กติก (COACHING INSIGHT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {zones.map((z) => (
                <tr key={z.zoneCode} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-white">
                    {z.zoneName}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-white">
                    {z.homeFgPct.toFixed(1)}% ({z.homeMade}/{z.homeAttempts})
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                    {z.awayFgPct.toFixed(1)}% ({z.awayMade}/{z.awayAttempts})
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {z.tacticalAdvantage === "HOME" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#AF101A]/20 text-red-200 border border-[#AF101A]/60">
                        <TrendingUp className="w-3 h-3 text-[#DC2626]" />
                        <span>BCC +{(z.homeFgPct - z.awayFgPct).toFixed(1)}%</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        <AlertTriangle className="w-3 h-3 text-slate-400" />
                        <span>DS +{(z.awayFgPct - z.homeFgPct).toFixed(1)}%</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                    {z.tacticalNote}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Tactical Gameplan Callout */}
        <div className="bg-slate-950 border border-slate-800 border-l-4 border-l-[#AF101A] rounded-xl p-4 flex items-start gap-3 text-xs font-mono">
          <ShieldAlert className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white uppercase text-[11px] block">
              TACTICAL DIRECTIVE FOR UPCOMING MATCH:
            </span>
            <p className="text-slate-300 leading-relaxed font-sans">
              "บีบให้เทพศิรินทร์ยิงระยะ Mid-Range 18 ฟุตต่อไป และบังคับตัวไดรฟ์ของพวกเขาออกจากโซนใต้แป้น 
              ขณะที่เกมรุกของเรา ให้เน้น Pick &amp; Roll เจาะ Drop Coverage เพื่อสร้างช็อตเลย์อัพหรือส่งออก Left Corner 3 ที่มีอัตราแม่นยำสูงถึง 41.7%"
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
