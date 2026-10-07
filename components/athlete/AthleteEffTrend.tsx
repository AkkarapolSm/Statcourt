"use client";

import React, { useState } from "react";
import { AthleteProfile, AthleteSeasonStats } from "@/lib/types";

interface AthleteEffTrendProps {
  athlete: AthleteProfile;
  stats: AthleteSeasonStats;
  isPro?: boolean;
  onOpenPricing?: () => void;
}

export default function AthleteEffTrend({
  athlete,
  stats,
  isPro = true,
  onOpenPricing,
}: AthleteEffTrendProps) {
  const [selectedTournament, setSelectedTournament] = useState("ALL");
  const [activeMetric, setActiveMetric] = useState<"EFF" | "PTS" | "REB" | "AST" | "BLK" | "FG">("EFF");
  const [chartType, setChartType] = useState<"AREA" | "BAR">("AREA");
  const [selectedGameNode, setSelectedGameNode] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Header Panel: Competition & Tournament Filter */}
      <div className="bg-surface-container-lowest p-4 md:p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-8 h-8 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-headline-sm shrink-0">
            <span className="material-symbols-outlined text-lg">emoji_events</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                รายการแข่งขันทางการ (TOURNAMENT / COMPETITION)
              </h2>
              <span className="bg-surface-container text-primary font-label-badge text-label-badge px-2 py-0.5 rounded-full font-bold">
                7 MATCHES IN SAMPLE
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary">
              TOA High School National Championship 2024 (Regional Qualifier &amp; National Final Stage)
            </p>
          </div>
        </div>

        {/* Tournament Select Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-96">
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant font-body-sm py-2 pl-3 pr-8 rounded-xl text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
            >
              <option value="ALL">รวมสถิติการแข่งขันทางการสะสมทุกรายการ (7 แมตช์รับรองสถิติ)</option>
              <option value="TOA">TOA National High School Championship (U18)</option>
              <option value="TBL">Thailand Basketball League Youth Cup 2024</option>
              <option value="BSAT">BSAT Inter-School Division 1 Invitational</option>
            </select>
          </div>
          <button className="bg-surface-container-high hover:bg-surface-dim text-on-surface px-3 py-2 rounded-xl font-label-caps text-label-caps font-semibold flex items-center gap-1 border border-outline-variant shrink-0 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            <span>กรองข้อมูล</span>
          </button>
        </div>
      </div>

      {/* 4 High-Impact KPI Performance Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Consistency Index */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider font-bold">
              CONSISTENCY INDEX
            </span>
            <span className="material-symbols-outlined text-primary text-xl">insights</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-on-surface leading-none tabular-nums font-bold">92.4%</span>
            <span className="font-label-caps text-label-caps bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">
              ระดับยอดเยี่ยม (ELITE TIER)
            </span>
          </div>
          <p className="font-body-sm text-secondary text-xs mt-1">
            FIBA Form variance &lt; 2.4 EFF deviation across 7 full games.
          </p>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-green-600 h-full rounded-full" style={{ width: "92.4%" }}></div>
          </div>
        </div>

        {/* Performance Floor */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider font-bold">
              PERFORMANCE FLOOR
            </span>
            <span className="material-symbols-outlined text-primary text-xl">vertical_align_bottom</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-on-surface leading-none tabular-nums font-bold">22</span>
            <span className="font-body-sm text-secondary text-xs font-semibold">EFF ต่ำสุด (Minimum Floor)</span>
          </div>
          <p className="font-body-sm text-secondary text-xs mt-1">
            vs Triam Udom (G3) - Baseline double-double guaranteed.
          </p>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "65%" }}></div>
          </div>
        </div>

        {/* Performance Ceiling */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider font-bold">
              PERFORMANCE CEILING
            </span>
            <span className="material-symbols-outlined text-primary text-xl">vertical_align_top</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-primary leading-none tabular-nums font-bold">34</span>
            <span className="font-body-sm text-primary text-xs font-semibold">EFF สูงสุด (Maximum Ceiling)</span>
          </div>
          <p className="font-body-sm text-secondary text-xs mt-1">
            vs BCC Bangkok Christian College (Semi-Final Showdown).
          </p>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "100%" }}></div>
          </div>
        </div>

        {/* Clutch Elevation */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-primary/30 relative overflow-hidden shadow-sm bg-gradient-to-br from-white to-red-50/50">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider font-bold">
              CLUTCH ELEVATION
            </span>
            <span className="material-symbols-outlined text-primary text-xl">electric_bolt</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-xl text-headline-xl text-primary leading-none">+133%</span>
            <span className="font-label-caps text-label-caps bg-primary text-white px-1.5 py-0.5 rounded font-bold">
              ยกระดับช่วงควอเตอร์ 4 (Q4 SURGE)
            </span>
          </div>
          <p className="font-body-sm text-secondary text-xs mt-1">
            Playoff scoring ramp-up in final 5 minutes of regulation.
          </p>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "88%" }}></div>
          </div>
        </div>
      </div>

      {/* Interactive FIBA Efficiency Trajectory Chart Card */}
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm p-4 md:p-6 space-y-4">
        {/* Chart Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-outline-variant pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">show_chart</span>
              <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface">
                FIBA EFFICIENCY (EFF) — PERFORMANCE TRAJECTORY
              </h3>
            </div>
            <p className="font-body-sm text-secondary text-xs mt-0.5">
              กราฟวิเคราะห์แนวโน้มระดับประสิทธิภาพการเล่นรายแมตช์ เปรียบเทียบกับค่าเฉลี่ยมาตรฐานตำแหน่งเซ็นเตอร์ระดับประเทศ
            </p>
          </div>

          {/* Metric Switchers & View Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-surface-container-low p-1 rounded border border-outline-variant font-label-caps text-label-caps">
              <button
                onClick={() => setActiveMetric("EFF")}
                className={`px-2.5 py-1 rounded font-bold uppercase transition-colors ${
                  activeMetric === "EFF" ? "bg-primary text-white shadow-sm" : "text-secondary hover:text-on-surface"
                }`}
              >
                FIBA EFF
              </button>
              <button
                onClick={() => setActiveMetric("PTS")}
                className={`px-2.5 py-1 uppercase transition-colors ${
                  activeMetric === "PTS" ? "bg-primary text-white shadow-sm font-bold" : "text-secondary hover:text-on-surface"
                }`}
              >
                PTS
              </button>
              <button
                onClick={() => setActiveMetric("REB")}
                className={`px-2.5 py-1 uppercase transition-colors ${
                  activeMetric === "REB" ? "bg-primary text-white shadow-sm font-bold" : "text-secondary hover:text-on-surface"
                }`}
              >
                REB
              </button>
              <button
                onClick={() => setActiveMetric("AST")}
                className={`px-2.5 py-1 uppercase transition-colors ${
                  activeMetric === "AST" ? "bg-primary text-white shadow-sm font-bold" : "text-secondary hover:text-on-surface"
                }`}
              >
                AST
              </button>
              <button
                onClick={() => setActiveMetric("BLK")}
                className={`px-2.5 py-1 uppercase transition-colors ${
                  activeMetric === "BLK" ? "bg-primary text-white shadow-sm font-bold" : "text-secondary hover:text-on-surface"
                }`}
              >
                BLK
              </button>
              <button
                onClick={() => setActiveMetric("FG")}
                className={`px-2.5 py-1 uppercase transition-colors ${
                  activeMetric === "FG" ? "bg-primary text-white shadow-sm font-bold" : "text-secondary hover:text-on-surface"
                }`}
              >
                FG %
              </button>
            </div>

            <div className="flex items-center bg-surface-container-low p-1 rounded border border-outline-variant font-label-caps text-label-caps">
              <button
                onClick={() => setChartType("AREA")}
                className={`px-2 py-1 rounded font-bold uppercase transition-colors ${
                  chartType === "AREA" ? "bg-surface-container-highest text-on-surface" : "text-secondary hover:text-on-surface"
                }`}
              >
                Area Chart
              </button>
              <button
                onClick={() => setChartType("BAR")}
                className={`px-2 py-1 uppercase transition-colors ${
                  chartType === "BAR" ? "bg-surface-container-highest text-on-surface font-bold" : "text-secondary hover:text-on-surface"
                }`}
              >
                Bar Chart
              </button>
            </div>
          </div>
        </div>

        {/* Chart Legend & Benchmark indicators */}
        <div className="flex flex-wrap items-center justify-between text-body-sm gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
              <span className="font-body-sm text-on-surface font-semibold">
                คะแนนประสิทธิภาพจริง (Athlete EFF)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-secondary inline-block"></span>
              <span className="font-body-sm text-secondary">
                ค่าเฉลี่ยตำแหน่งเซ็นเตอร์ระดับประเทศ (Center Benchmark: 12 EFF)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-red-50 text-primary border border-primary/20 px-2 py-0.5 rounded font-label-caps">
              AVG: <span className="font-bold">26.8 EFF</span>
            </div>
            <div className="bg-surface-container text-on-surface px-2 py-0.5 rounded font-label-caps">
              PEAK: <span className="font-bold text-primary">34 EFF (SF)</span>
            </div>
          </div>
        </div>

        {/* SVG Line/Area Trajectory Visualization */}
        <div className="relative w-full h-80 pt-4 pb-2 px-2 bg-gradient-to-b from-white to-surface-container-low/30 rounded border border-outline-variant/60 select-none overflow-hidden">
          {/* Y-Axis Scale Markers */}
          <div className="absolute inset-x-8 inset-y-6 flex flex-col justify-between pointer-events-none opacity-30">
            <div className="border-b border-secondary/40 w-full flex justify-between">
              <span className="font-label-badge text-[10px] -mt-2">40 EFF</span>
            </div>
            <div className="border-b border-secondary/40 w-full flex justify-between">
              <span className="font-label-badge text-[10px] -mt-2">30 EFF</span>
            </div>
            <div className="border-b border-secondary/40 w-full flex justify-between">
              <span className="font-label-badge text-[10px] -mt-2">20 EFF</span>
            </div>
            <div className="border-b border-secondary/40 w-full flex justify-between">
              <span className="font-label-badge text-[10px] -mt-2">10 EFF</span>
            </div>
            <div className="border-b border-secondary/40 w-full flex justify-between">
              <span className="font-label-badge text-[10px] -mt-2">0 EFF</span>
            </div>
          </div>

          {/* League Benchmark Dashed Line (12 EFF) */}
          <div className="absolute left-8 right-8 top-[68%] border-t-2 border-dashed border-secondary/50 pointer-events-none flex justify-end">
            <span className="bg-surface-container-lowest text-secondary font-label-badge text-[10px] px-1 -mt-2.5">
              LEAGUE CENTER AVG (12)
            </span>
          </div>

          {/* SVG Vector Canvas */}
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 240" preserveAspectRatio="none">
            <defs>
              <linearGradient id="effAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ba1a20" stopOpacity="0.38" />
                <stop offset="60%" stopColor="#ba1a20" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#ba1a20" stopOpacity="0.0" />
              </linearGradient>
              <filter id="effGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#af101a" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Area Fill */}
            {chartType === "AREA" ? (
              <>
                <polygon
                  fill="url(#effAreaGrad)"
                  points="60,220 60,105 205,82 350,120 495,98 640,88 785,52 930,64 930,220"
                />
                <path
                  d="M 60 105 C 130 95, 150 82, 205 82 C 260 82, 300 120, 350 120 C 400 120, 440 98, 495 98 C 550 98, 600 88, 640 88 C 700 88, 740 52, 785 52 C 830 52, 880 64, 930 64"
                  fill="none"
                  stroke="#af101a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#effGlow)"
                />
              </>
            ) : (
              /* Bar Chart Mode */
              <g fill="#af101a" opacity="0.85">
                <rect x="45" y="105" width="30" height="115" rx="3" />
                <rect x="190" y="82" width="30" height="138" rx="3" />
                <rect x="335" y="120" width="30" height="100" rx="3" fill="#5b5e66" />
                <rect x="480" y="98" width="30" height="122" rx="3" />
                <rect x="625" y="88" width="30" height="132" rx="3" />
                <rect x="770" y="52" width="30" height="168" rx="3" fill="#ba1a20" />
                <rect x="915" y="64" width="30" height="156" rx="3" />
              </g>
            )}

            {/* Nodes & Interactive Callouts */}
            {/* Game 1: 25 EFF */}
            <g className="cursor-pointer" onClick={() => setSelectedGameNode(1)}>
              <circle cx="60" cy="105" r="5" fill="#ffffff" stroke="#af101a" strokeWidth="3" />
              <rect x="38" y="74" width="44" height="20" rx="3" fill="#0b1c30" />
              <text x="60" y="88" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="Barlow Condensed">
                25 EFF
              </text>
            </g>

            {/* Game 2: 29 EFF */}
            <g className="cursor-pointer" onClick={() => setSelectedGameNode(2)}>
              <circle cx="205" cy="82" r="5" fill="#ffffff" stroke="#af101a" strokeWidth="3" />
              <rect x="183" y="52" width="44" height="20" rx="3" fill="#0b1c30" />
              <text x="205" y="66" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="Barlow Condensed">
                29 EFF
              </text>
            </g>

            {/* Game 3: 22 EFF (FLOOR) */}
            <g className="cursor-pointer" onClick={() => setSelectedGameNode(3)}>
              <circle cx="350" cy="120" r="5" fill="#ffffff" stroke="#af101a" strokeWidth="3" />
              <rect x="325" y="130" width="50" height="20" rx="3" fill="#5b5e66" />
              <text x="350" y="144" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="Barlow Condensed">
                22 (FLOOR)
              </text>
            </g>

            {/* Game 4: 26 EFF */}
            <g className="cursor-pointer" onClick={() => setSelectedGameNode(4)}>
              <circle cx="495" cy="98" r="5" fill="#ffffff" stroke="#af101a" strokeWidth="3" />
              <rect x="473" y="68" width="44" height="20" rx="3" fill="#0b1c30" />
              <text x="495" y="82" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="Barlow Condensed">
                26 EFF
              </text>
            </g>

            {/* Game 5: 28 EFF (QF) */}
            <g className="cursor-pointer" onClick={() => setSelectedGameNode(5)}>
              <circle cx="640" cy="88" r="5" fill="#ffffff" stroke="#af101a" strokeWidth="3" />
              <rect x="618" y="58" width="44" height="20" rx="3" fill="#0b1c30" />
              <text x="640" y="72" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="Barlow Condensed">
                28 EFF
              </text>
            </g>

            {/* Game 6: 34 EFF (SEMI-FINAL PEAK) */}
            <g className="cursor-pointer" onClick={() => setSelectedGameNode(6)}>
              <circle cx="785" cy="52" r="7" fill="#ba1a20" stroke="#ffffff" strokeWidth="3" />
              <rect x="755" y="16" width="60" height="24" rx="4" fill="#af101a" />
              <text x="785" y="32" fill="#ffffff" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="Barlow Condensed">
                34 PEAK
              </text>
            </g>

            {/* Game 7: 32 EFF (GRAND FINAL) */}
            <g className="cursor-pointer" onClick={() => setSelectedGameNode(7)}>
              <circle cx="930" cy="64" r="6" fill="#af101a" stroke="#ffffff" strokeWidth="3" />
              <rect x="904" y="30" width="52" height="22" rx="3" fill="#af101a" />
              <text x="930" y="45" fill="#ffffff" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="Barlow Condensed">
                32 (GF)
              </text>
            </g>
          </svg>

          {/* X-Axis Labels (Opponent Sequence) */}
          <div className="flex justify-between items-center px-4 mt-2 font-label-caps text-label-caps text-secondary uppercase">
            <div className="text-center w-24">
              G1 vs Nonthaburi<br />
              <span className="text-[10px] text-on-surface font-bold">W 74 - 70</span>
            </div>
            <div className="text-center w-24">
              G2 vs BCC<br />
              <span className="text-[10px] text-on-surface font-bold">W 82 - 78</span>
            </div>
            <div className="text-center w-24">
              G3 vs Triam Udom<br />
              <span className="text-[10px] text-on-surface font-bold">W 68 - 62</span>
            </div>
            <div className="text-center w-24">
              G4 vs Assumption<br />
              <span className="text-[10px] text-on-surface font-bold">W 76 - 69</span>
            </div>
            <div className="text-center w-24">
              QF vs Nonthaburi<br />
              <span className="text-[10px] text-on-surface font-bold">W 81 - 65</span>
            </div>
            <div className="text-center w-24 text-primary font-bold">
              SF vs BCC<br />
              <span className="text-[10px] text-primary font-bold">W 83 - 79</span>
            </div>
            <div className="text-center w-24 text-primary font-bold">
              GF vs Debsirin<br />
              <span className="text-[10px] text-primary font-bold">W 78 - 76</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Spotlight Game Callout Banner (Grand Final Showcase) */}
      <div className="bg-inverse-surface rounded-lg p-4 md:p-5 text-white border-l-4 border-primary flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-primary text-white font-label-caps text-label-caps px-2 py-0.5 rounded font-bold uppercase">
              รอบชิงชนะเลิศ (GRAND FINAL)
            </span>
            <span className="text-surface-dim font-headline-sm text-headline-sm uppercase">
              vs เทพศิรินทร์ (Debsirin School)
            </span>
            <span className="bg-tertiary-container text-tertiary-fixed font-label-badge text-label-badge px-1.5 py-0.5 rounded">
              TOA 5 DAYS AGO CHAMPIONSHIP
            </span>
          </div>
          <p className="font-body-sm text-surface-dim">
            การแข่งขันบาสเกตบอลเยาวชนชิงชนะเลิศแห่งประเทศไทย U18 (BSAT) • 28 ก.ย. 2024 • เกียรติประวัติ: ชนะเลิศแห่งประเทศไทย • ผลการแข่งขัน:{" "}
            <span className="text-green-400 font-bold">WIN 78 - 76</span>
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs text-tertiary-fixed">
            <span className="material-symbols-outlined text-sm">offline_bolt</span>
            <span>จังหวะสำคัญชี้ขาดเกม (Clutch Play): กระโดดบล็อกการทำคะแนน 14 วินาทีสุดท้าย และเก็บบอลรีบาวด์ 7 ครั้งในควอเตอร์ที่ 4</span>
          </div>
        </div>

        {/* Quick stat pill in highlight match */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 px-3 py-2 rounded text-center min-w-[70px]">
            <span className="font-label-caps text-[10px] text-surface-dim uppercase">GAME EFF</span>
            <div className="font-headline-md text-headline-md text-white">32</div>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded text-center min-w-[60px]">
            <span className="font-label-caps text-[10px] text-surface-dim uppercase">PTS</span>
            <div className="font-headline-md text-headline-md text-white">19</div>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded text-center min-w-[60px]">
            <span className="font-label-caps text-[10px] text-surface-dim uppercase">REB</span>
            <div className="font-headline-md text-headline-md text-white">14</div>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded text-center min-w-[60px]">
            <span className="font-label-caps text-[10px] text-surface-dim uppercase">BLK</span>
            <div className="font-headline-md text-headline-md text-tertiary-fixed">4</div>
          </div>
        </div>
      </div>

      {/* Match by Match Detailed Performance Log Cards */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">table_chart</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              บันทึกสถิติการแข่งขันรายแมตช์ (MATCH BY MATCH PERFORMANCE LOGS)
            </h3>
          </div>
          <span className="font-body-sm text-secondary text-xs">จำนวน 7 แมตช์ในรายการแข่งขันนี้</span>
        </div>

        {/* 7 Cards Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Match 1 */}
          <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant hover:border-primary transition-colors shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
                รอบแบ่งกลุ่ม (GROUP STAGE)
              </span>
              <span className="font-label-badge text-label-badge bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">
                WIN 74 - 70
              </span>
            </div>
            <div className="font-body-lg text-body-lg font-bold text-on-surface">
              vs นนทบุรีวิทยาลัย (Nonthaburi)
            </div>
            <div className="font-body-sm text-secondary text-xs">TOA G1 • 12 ก.ย. 2024</div>
            <div className="pt-2 border-t border-outline-variant flex items-center justify-between">
              <div className="font-label-caps text-secondary">EFFICIENCY</div>
              <div className="font-headline-md text-headline-md text-primary font-bold">
                25 <span className="text-xs font-body-sm text-secondary font-normal">EFF</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center font-body-sm text-xs bg-surface-container-low p-1.5 rounded">
              <div><span className="text-secondary block">PTS</span><span className="font-bold">17</span></div>
              <div><span className="text-secondary block">REB</span><span className="font-bold">12</span></div>
              <div><span className="text-secondary block">BLK</span><span className="font-bold">3</span></div>
              <div><span className="text-secondary block">FG%</span><span className="font-bold">70%</span></div>
            </div>
          </div>

          {/* Match 2 */}
          <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant hover:border-primary transition-colors shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
                รอบแบ่งกลุ่ม (GROUP STAGE)
              </span>
              <span className="font-label-badge text-label-badge bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">
                WIN 82 - 78
              </span>
            </div>
            <div className="font-body-lg text-body-lg font-bold text-on-surface">
              vs กรุงเทพคริสเตียนวิทยาลัย (BCC)
            </div>
            <div className="font-body-sm text-secondary text-xs">TOA G2 • 15 ก.ย. 2024</div>
            <div className="pt-2 border-t border-outline-variant flex items-center justify-between">
              <div className="font-label-caps text-secondary">EFFICIENCY</div>
              <div className="font-headline-md text-headline-md text-primary font-bold">
                29 <span className="text-xs font-body-sm text-secondary font-normal">EFF</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center font-body-sm text-xs bg-surface-container-low p-1.5 rounded">
              <div><span className="text-secondary block">PTS</span><span className="font-bold">20</span></div>
              <div><span className="text-secondary block">REB</span><span className="font-bold">15</span></div>
              <div><span className="text-secondary block">BLK</span><span className="font-bold">2</span></div>
              <div><span className="text-secondary block">FG%</span><span className="font-bold">66.7%</span></div>
            </div>
          </div>

          {/* Match 3 (Floor) */}
          <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant hover:border-primary transition-colors shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
                รอบแบ่งกลุ่ม (GROUP STAGE)
              </span>
              <span className="font-label-badge text-label-badge bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">
                WIN 68 - 62
              </span>
            </div>
            <div className="font-body-lg text-body-lg font-bold text-on-surface">
              vs เตรียมอุดมศึกษา (Triam Udom)
            </div>
            <div className="font-body-sm text-secondary text-xs">TOA G3 • 17 ก.ย. 2024</div>
            <div className="pt-2 border-t border-outline-variant flex items-center justify-between">
              <div className="font-label-caps text-secondary">EFFICIENCY (FLOOR)</div>
              <div className="font-headline-md text-headline-md text-on-surface font-bold">
                22 <span className="text-xs font-body-sm text-secondary font-normal">EFF</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center font-body-sm text-xs bg-surface-container-low p-1.5 rounded">
              <div><span className="text-secondary block">PTS</span><span className="font-bold">14</span></div>
              <div><span className="text-secondary block">REB</span><span className="font-bold">10</span></div>
              <div><span className="text-secondary block">BLK</span><span className="font-bold">2</span></div>
              <div><span className="text-secondary block">FG%</span><span className="font-bold">75%</span></div>
            </div>
          </div>

          {/* Match 4 */}
          <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant hover:border-primary transition-colors shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
                รอบแบ่งกลุ่ม (GROUP STAGE)
              </span>
              <span className="font-label-badge text-label-badge bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">
                WIN 76 - 69
              </span>
            </div>
            <div className="font-body-lg text-body-lg font-bold text-on-surface">
              vs อัสสัมชัญธนบุรี (Assumption C)
            </div>
            <div className="font-body-sm text-secondary text-xs">TOA G4 • 19 ก.ย. 2024</div>
            <div className="pt-2 border-t border-outline-variant flex items-center justify-between">
              <div className="font-label-caps text-secondary">EFFICIENCY</div>
              <div className="font-headline-md text-headline-md text-primary font-bold">
                26 <span className="text-xs font-body-sm text-secondary font-normal">EFF</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center font-body-sm text-xs bg-surface-container-low p-1.5 rounded">
              <div><span className="text-secondary block">PTS</span><span className="font-bold">18</span></div>
              <div><span className="text-secondary block">REB</span><span className="font-bold">13</span></div>
              <div><span className="text-secondary block">BLK</span><span className="font-bold">3</span></div>
              <div><span className="text-secondary block">FG%</span><span className="font-bold">62.5%</span></div>
            </div>
          </div>

          {/* Match 5 (QF) */}
          <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant hover:border-primary transition-colors shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
                รอบ 8 ทีมสุดท้าย (QUARTER-FINAL)
              </span>
              <span className="font-label-badge text-label-badge bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">
                WIN 81 - 65
              </span>
            </div>
            <div className="font-body-lg text-body-lg font-bold text-on-surface">
              vs นนทบุรีวิทยาลัย (Rematch)
            </div>
            <div className="font-body-sm text-secondary text-xs">TOA QF • 23 ก.ย. 2024</div>
            <div className="pt-2 border-t border-outline-variant flex items-center justify-between">
              <div className="font-label-caps text-secondary">EFFICIENCY</div>
              <div className="font-headline-md text-headline-md text-primary font-bold">
                28 <span className="text-xs font-body-sm text-secondary font-normal">EFF</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center font-body-sm text-xs bg-surface-container-low p-1.5 rounded">
              <div><span className="text-secondary block">PTS</span><span className="font-bold">19</span></div>
              <div><span className="text-secondary block">REB</span><span className="font-bold">15</span></div>
              <div><span className="text-secondary block">BLK</span><span className="font-bold">2</span></div>
              <div><span className="text-secondary block">FG%</span><span className="font-bold">66.7%</span></div>
            </div>
          </div>

          {/* Match 6 (SF - Peak) */}
          <div className="bg-surface-container-lowest p-4 rounded-lg border-2 border-primary shadow-md space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold">
                รอบรองชนะเลิศ (SEMI-FINAL)
              </span>
              <span className="font-label-badge text-label-badge bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">
                WIN 83 - 79
              </span>
            </div>
            <div className="font-body-lg text-body-lg font-bold text-on-surface">
              vs กรุงเทพคริสเตียนวิทยาลัย (BCC)
            </div>
            <div className="font-body-sm text-secondary text-xs">TOA SF • 25 ก.ย. 2024</div>
            <div className="pt-2 border-t border-outline-variant flex items-center justify-between">
              <div className="font-label-caps text-primary font-bold">PEAK EFFICIENCY</div>
              <div className="font-headline-md text-headline-md text-primary font-bold">
                34 <span className="text-xs font-body-sm text-secondary font-normal">EFF</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center font-body-sm text-xs bg-red-50 p-1.5 rounded text-primary">
              <div><span className="text-secondary block">PTS</span><span className="font-bold">22</span></div>
              <div><span className="text-secondary block">REB</span><span className="font-bold">16</span></div>
              <div><span className="text-secondary block">BLK</span><span className="font-bold">5</span></div>
              <div><span className="text-secondary block">FG%</span><span className="font-bold">64.3%</span></div>
            </div>
          </div>

          {/* Match 7 (GF - Champion) */}
          <div className="bg-surface-container-lowest p-4 rounded-lg border-2 border-primary shadow-md space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-label-caps text-label-caps text-primary uppercase font-bold">
                รอบชิงชนะเลิศ (GRAND FINAL)
              </span>
              <span className="font-label-badge text-label-badge bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">
                WIN 78 - 76
              </span>
            </div>
            <div className="font-body-lg text-body-lg font-bold text-on-surface">
              vs เทพศิรินทร์ (Debsirin School)
            </div>
            <div className="font-body-sm text-secondary text-xs">TOA GF • 28 ก.ย. 2024</div>
            <div className="pt-2 border-t border-outline-variant flex items-center justify-between">
              <div className="font-label-caps text-primary font-bold">TITLE EFFICIENCY</div>
              <div className="font-headline-md text-headline-md text-primary font-bold">
                32 <span className="text-xs font-body-sm text-secondary font-normal">EFF</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center font-body-sm text-xs bg-red-50 p-1.5 rounded text-primary">
              <div><span className="text-secondary block">PTS</span><span className="font-bold">19</span></div>
              <div><span className="text-secondary block">REB</span><span className="font-bold">14</span></div>
              <div><span className="text-secondary block">BLK</span><span className="font-bold">4</span></div>
              <div><span className="text-secondary block">FG%</span><span className="font-bold">72.7%</span></div>
            </div>
          </div>

          {/* Summary Statistics Card */}
          <div className="bg-surface-container-low p-4 rounded-lg border border-dashed border-outline-variant flex flex-col justify-between space-y-2">
            <div>
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">
                สรุปผลการแข่งขันภาพรวมทัวร์นาเมนต์
              </span>
              <div className="font-headline-sm text-headline-sm uppercase text-on-surface mt-1">
                7 MATCHES • 7 VICTORIES
              </div>
              <p className="font-body-sm text-secondary text-xs mt-1 leading-relaxed">
                สถิติชนะ 100% (ไร้พ่าย) ครองตำแหน่งชนะเลิศการแข่งขันบาสเกตบอลเยาวชนชิงชนะเลิศแห่งประเทศไทย ประจำปี 2567
              </p>
            </div>
            <div className="pt-2 border-t border-outline-variant">
              <div className="flex justify-between items-center text-xs">
                <span className="font-body-sm text-secondary">TOTAL MINUTES:</span>
                <span className="font-bold text-on-surface">224 MIN (32.0 MPG)</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="font-body-sm text-secondary">DOUBLE-DOUBLES:</span>
                <span className="font-bold text-primary">7 / 7 MATCHES</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Conclusions & University Recruitment Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Playoff Surge & Peaking Summary */}
        <div className="bg-surface-container-lowest p-4 md:p-5 rounded-xl border-l-4 border-primary border-t border-r border-b border-outline-variant shadow-sm flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-lg">local_fire_department</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Playoff Surge &amp; Peaking (การยกระดับขีดความสามารถในรอบชิงชนะเลิศ)
            </h4>
            <p className="font-body-sm text-secondary leading-relaxed">
              ข้อมูลเชิงสถิติชี้ชัด: ประสิทธิภาพการเล่นสูงสุดอยู่ในรอบรองชนะเลิศ (34 EFF) และรอบชิงชนะเลิศ (32 EFF) สะท้อนความสามารถในการแข่งขันระดับสูง (Tier-1 Competition) โดยสามารถรักษามาตรฐานและทำผลงานได้อย่างยอดเยี่ยมภายใต้สถานการณ์กดดันสูง (Clutch Factor)
            </p>
          </div>
        </div>

        {/* Card 2: High-Floor Assurance for University Recruiters */}
        <div className="bg-surface-container-lowest p-4 md:p-5 rounded-xl border-l-4 border-green-600 border-t border-r border-b border-outline-variant shadow-sm flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-lg">verified_user</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              High-Floor Assurance (เสถียรภาพและมาตรฐานผลงานขั้นพื้นฐาน)
            </h4>
            <p className="font-body-sm text-secondary leading-relaxed">
              ระดับผลงานขั้นต่ำ (Floor: 22.0 - 24.0 EFF) สูงกว่าเกณฑ์เฉลี่ยตำแหน่งเซ็นเตอร์ระดับประเทศ (12.0 EFF) เกือบสองเท่าตลอดทั้ง 7 แมตช์ สามารถทำดับเบิล-ดับเบิล (Double-Double) ได้ครบทุกนัด มีความพร้อมสูงสุดสำหรับการพิจารณาคัดเลือกโควตานักกีฬาและทุนการศึกษาระดับอุดมศึกษา (TCAS Portfolio)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
