"use client";

import React, { useState, useMemo } from "react";
import { AthleteSeasonStats } from "@/lib/types";

interface ShotChartProps {
  athleteId: string;
  athleteName: string;
  stats: AthleteSeasonStats;
  className?: string;
}

export default function ShotChart({
  athleteId,
  athleteName,
  stats,
  className = "",
}: ShotChartProps) {
  const [selectedTournament, setSelectedTournament] = useState("ALL");
  const [selectedMatch, setSelectedMatch] = useState("ALL");
  const [displayMode, setDisplayMode] = useState<"SHOTS" | "HEATMAP">("SHOTS");
  const [quarterFilter, setQuarterFilter] = useState<"ALL" | "Q1" | "Q2" | "Q3" | "Q4">("ALL");
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const handleDownloadPdf = () => {
    setPdfDownloaded(true);
    setTimeout(() => setPdfDownloaded(false), 3000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* SHOT CHART ANALYTICS CONTAINER */}
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 md:p-6 shadow-sm space-y-5">
        {/* SECTION TITLE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="material-symbols-outlined text-primary text-xl">track_changes</span>
              <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wide">
                FIBA 5-ZONE SHOT CHART & SPATIAL ANALYTICS
              </h2>
              <span className="bg-surface-container text-on-surface-variant text-label-badge font-label-badge px-2 py-0.5 rounded border border-outline-variant flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                Courtside Table Sync
              </span>
            </div>
            <p className="text-body-sm font-body-sm text-secondary mt-0.5">
              {athleteName} (#15) • เลือกดูตำแหน่งจุดยิงแต่ละโซนระยะคอร์ทจริง และประสิทธิภาพการเข้าทำรายแมตช์
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="block font-label-caps text-label-caps text-secondary uppercase">2PT Field Goal</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                65.5% <span className="text-body-sm font-body-sm text-secondary font-normal">(36/55)</span>
              </span>
            </div>
            <div className="text-right">
              <span className="block font-label-caps text-label-caps text-primary uppercase">3PT Field Goal</span>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                40.0% <span className="text-body-sm font-body-sm text-secondary font-normal">(8/20)</span>
              </span>
            </div>
          </div>
        </div>

        {/* 1. TOURNAMENT SELECTOR */}
        <div className="space-y-1">
          <label className="font-label-caps text-label-caps text-on-surface font-bold uppercase flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-tertiary-container text-sm">emoji_events</span>
              1. เลือกรายการแข่งขัน (Tournament / Competition)
            </span>
            <span className="text-secondary font-normal">7 แมตช์ในรายการนี้</span>
          </label>
          <div className="relative">
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant text-on-surface font-body-md text-body-md rounded px-3 py-2 pr-8 focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
            >
              <option value="ALL">รวมทุกการแข่งขันทางการสะสม (All Tournaments - 7 แมตช์, 75 ช็อต)</option>
              <option value="STUDENT_LEAGUE">2026 Thailand National Student League U18 Finals (4 แมตช์)</option>
              <option value="ASIA_YOUTH">FIBA Asia Youth Invitational Qualifiers (3 แมตช์)</option>
            </select>
          </div>
        </div>

        {/* 2. MATCH CHIPS CAROUSEL */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-label-caps font-label-caps flex-wrap gap-1">
            <span className="text-on-surface font-bold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-sm">calendar_month</span>
              2. เลือกแมตช์แข่งขันของรายการนี้ (Matches in this tournament)
            </span>
            <span className="text-primary font-bold">
              ● กำลังแสดง: {selectedMatch === "ALL" ? "รวมทุกแมตช์ในรายการนี้ (7 แมตช์)" : "แมตช์ที่เลือก"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 pt-1">
            {/* All Matches Active Card */}
            <div
              onClick={() => setSelectedMatch("ALL")}
              className={`p-2.5 rounded border-2 shadow-sm cursor-pointer relative overflow-hidden transition-all ${
                selectedMatch === "ALL"
                  ? "bg-inverse-surface text-inverse-on-surface border-primary"
                  : "bg-surface-container-lowest border-outline-variant hover:border-primary/60"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-label-badge text-label-badge uppercase flex items-center gap-0.5 ${
                  selectedMatch === "ALL" ? "text-tertiary-fixed-dim" : "text-secondary"
                }`}>
                  <span
                    className="material-symbols-outlined text-xs"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    stars
                  </span>
                  รวมทุกแมตช์
                </span>
                <span className="bg-primary px-1.5 py-0.2 rounded font-label-badge text-label-badge text-white">
                  7 นัด
                </span>
              </div>
              <div className={`font-headline-sm text-headline-sm tracking-tight leading-tight ${
                selectedMatch === "ALL" ? "text-white" : "text-on-surface"
              }`}>
                สถิติสะสมทุกรายการ
              </div>
              <div className={`text-body-sm font-body-sm mt-1 ${
                selectedMatch === "ALL" ? "text-surface-dim" : "text-secondary"
              }`}>
                75 ช็อต • FG 44/75 (58%)
              </div>
            </div>

            {/* Match 1 */}
            <div
              onClick={() => setSelectedMatch("match-1")}
              className={`p-2.5 rounded border cursor-pointer transition-colors ${
                selectedMatch === "match-1"
                  ? "bg-inverse-surface text-white border-2 border-primary shadow-sm"
                  : "bg-surface-container-lowest border-outline-variant hover:border-primary/60"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-body-sm font-body-sm text-secondary">20 ก.พ. 2026</span>
                <span className="bg-surface-container text-on-surface-variant font-label-badge text-label-badge px-1 rounded">
                  78 - 75
                </span>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                vs เทพศิรินทร์ (Debsirin)
              </div>
              <div className="text-body-sm font-body-sm text-secondary mt-1">
                19 แต้ม (31 นาที) • FG 6/11 (55%)
              </div>
            </div>

            {/* Match 2 */}
            <div
              onClick={() => setSelectedMatch("match-2")}
              className={`p-2.5 rounded border cursor-pointer transition-colors ${
                selectedMatch === "match-2"
                  ? "bg-inverse-surface text-white border-2 border-primary shadow-sm"
                  : "bg-surface-container-lowest border-outline-variant hover:border-primary/60"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-body-sm font-body-sm text-secondary">12 ก.พ. 2026</span>
                <span className="bg-surface-container text-on-surface-variant font-label-badge text-label-badge px-1 rounded">
                  82 - 71
                </span>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                vs กรุงเทพคริสเตียน (BCC)
              </div>
              <div className="text-body-sm font-body-sm text-secondary mt-1">
                22 แต้ม (35 นาที) • FG 9/15 (60%)
              </div>
            </div>

            {/* Match 3 */}
            <div
              onClick={() => setSelectedMatch("match-3")}
              className={`p-2.5 rounded border cursor-pointer transition-colors ${
                selectedMatch === "match-3"
                  ? "bg-inverse-surface text-white border-2 border-primary shadow-sm"
                  : "bg-surface-container-lowest border-outline-variant hover:border-primary/60"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-body-sm font-body-sm text-secondary">2 ก.พ. 2026</span>
                <span className="bg-surface-container text-on-surface-variant font-label-badge text-label-badge px-1 rounded">
                  69 - 65
                </span>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                vs สวนกุหลาบ (Suankularb)
              </div>
              <div className="text-body-sm font-body-sm text-secondary mt-1">
                16 แต้ม (29 นาที) • FG 6/9 (67%)
              </div>
            </div>

            {/* Match 4 */}
            <div
              onClick={() => setSelectedMatch("match-4")}
              className={`p-2.5 rounded border cursor-pointer transition-colors ${
                selectedMatch === "match-4"
                  ? "bg-inverse-surface text-white border-2 border-primary shadow-sm"
                  : "bg-surface-container-lowest border-outline-variant hover:border-primary/60"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-body-sm font-body-sm text-secondary">25 ม.ค. 2026</span>
                <span className="bg-surface-container text-on-surface-variant font-label-badge text-label-badge px-1 rounded">
                  85 - 80
                </span>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                vs อัสสัมชัญ (Assumption)
              </div>
              <div className="text-body-sm font-body-sm text-secondary mt-1">
                18 แต้ม (27 นาที) • FG 7/12 (58%)
              </div>
            </div>
          </div>
        </div>

        {/* FILTER CONTROLS BAR */}
        <div className="bg-surface-container-low rounded p-2.5 flex flex-wrap items-center justify-between gap-3 border border-outline-variant">
          {/* Display Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-label-caps font-label-caps uppercase text-secondary font-bold">
              โหมดแสดงผล:
            </span>
            <div className="inline-flex rounded border border-outline-variant overflow-hidden bg-surface-container-lowest p-0.5">
              <button
                onClick={() => setDisplayMode("SHOTS")}
                className={`px-2.5 py-1 text-label-caps font-label-caps font-bold rounded-sm flex items-center gap-1 transition-colors ${
                  displayMode === "SHOTS"
                    ? "bg-inverse-surface text-inverse-on-surface shadow-sm"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-xs">visibility</span> จุดยิงรายลูก (75)
              </button>
              <button
                onClick={() => setDisplayMode("HEATMAP")}
                className={`px-2.5 py-1 text-label-caps font-label-caps font-bold rounded-sm flex items-center gap-1 transition-colors ${
                  displayMode === "HEATMAP"
                    ? "bg-inverse-surface text-inverse-on-surface shadow-sm"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-xs">local_fire_department</span> Zone Heatmap (ความแม่นยำ)
              </button>
            </div>
          </div>

          {/* Quarter Filters */}
          <div className="flex items-center gap-2">
            <span className="text-label-caps font-label-caps uppercase text-secondary font-bold">
              ควอเตอร์:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQuarterFilter("ALL")}
                className={`px-2.5 py-1 rounded font-label-badge text-label-badge font-bold transition-colors ${
                  quarterFilter === "ALL"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container"
                }`}
              >
                ทั้งหมด (75)
              </button>
              <button
                onClick={() => setQuarterFilter("Q1")}
                className={`px-2 py-1 rounded font-label-badge text-label-badge font-bold transition-colors ${
                  quarterFilter === "Q1"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container"
                }`}
              >
                Q1 (21)
              </button>
              <button
                onClick={() => setQuarterFilter("Q2")}
                className={`px-2 py-1 rounded font-label-badge text-label-badge font-bold transition-colors ${
                  quarterFilter === "Q2"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container"
                }`}
              >
                Q2 (20)
              </button>
              <button
                onClick={() => setQuarterFilter("Q3")}
                className={`px-2 py-1 rounded font-label-badge text-label-badge font-bold transition-colors ${
                  quarterFilter === "Q3"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container"
                }`}
              >
                Q3 (18)
              </button>
              <button
                onClick={() => setQuarterFilter("Q4")}
                className={`px-2 py-1 rounded font-label-badge text-label-badge font-bold transition-colors ${
                  quarterFilter === "Q4"
                    ? "bg-primary text-on-primary shadow-xs"
                    : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container"
                }`}
              >
                Q4 (16)
              </button>
            </div>
          </div>
        </div>

        {/* COURT HEADER STATUS */}
        <div className="flex justify-between items-center px-1 text-body-sm font-body-sm flex-wrap gap-2">
          <span className="text-on-surface font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary-container text-sm">military_tech</span>
            รวมทุกฤดูกาลสะสมตลอดฤดูกาลแข่งขัน (All Official Matches)
          </span>
          <div className="flex items-center gap-3">
            <span className="text-secondary">
              ลงยิง: <strong className="text-primary font-headline-sm text-headline-sm">75</strong> จาก 75 ช็อต
            </span>
            <span className="bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-bold border border-outline-variant">
              แม่นยำ: <strong className="text-primary">58.7%</strong> (44/75)
            </span>
          </div>
        </div>

        {/* BASKETBALL HALF-COURT SPATIAL VISUALIZATION */}
        <div className="relative w-full max-w-3xl mx-auto rounded-lg overflow-hidden border-2 border-outline/30 shadow-lg bg-surface-container-highest">
          {/* Live Tracker Floating Header */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-on-surface/90 backdrop-blur-sm text-white px-2.5 py-1 rounded border border-outline-variant/40">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">
              FIBA LIVESTATS TRACKER
            </span>
          </div>
          <div className="absolute top-3 right-3 z-20 bg-on-surface/90 backdrop-blur-sm text-white px-3 py-1 rounded border border-outline-variant/40 font-headline-sm text-headline-sm">
            ACCURACY: <span className="text-tertiary-fixed-dim font-bold">58.7%</span>{" "}
            <span className="text-xs text-surface-dim font-normal font-body-sm">(44/75)</span>
          </div>

          {/* Hardwood Half-Court SVG Canvas */}
          <div
            className="p-4 sm:p-8 flex justify-center items-center select-none"
            style={{
              background: "radial-gradient(circle at center, #ba6834 0%, #8c4118 70%, #682c0b 100%)",
            }}
          >
            <svg
              className="w-full h-auto max-w-[560px] drop-shadow-xl"
              viewBox="0 0 500 470"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Hardwood Floor Pattern */}
                <pattern id="woodPlanks" width="500" height="20" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="500" y2="0" stroke="#7e3b15" strokeWidth="0.7" opacity="0.4" />
                  <line x1="120" y1="0" x2="120" y2="20" stroke="#7e3b15" strokeWidth="0.5" opacity="0.3" />
                  <line x1="310" y1="0" x2="310" y2="20" stroke="#7e3b15" strokeWidth="0.5" opacity="0.3" />
                </pattern>
                {/* Zone Overlays */}
                <radialGradient id="paintGlow" cx="50%" cy="30%" r="50%">
                  <stop offset="0%" stopColor="#af101a" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#af101a" stopOpacity="0.08" />
                </radialGradient>
              </defs>

              {/* Court Base Plate */}
              <rect x="0" y="0" width="500" height="470" fill="#a0522d" />
              <rect x="0" y="0" width="500" height="470" fill="url(#woodPlanks)" />

              {/* Heatmap overlay if active */}
              {displayMode === "HEATMAP" && (
                <g opacity="0.45">
                  <rect x="170" y="10" width="160" height="190" fill="#10b981" />
                  <rect x="170" y="190" width="160" height="110" fill="#10b981" opacity="0.8" />
                  <polygon points="10,10 170,10 170,200 30,120" fill="#f59e0b" opacity="0.6" />
                  <polygon points="490,10 330,10 330,200 470,120" fill="#ef4444" opacity="0.5" />
                  <path d="M 30 120 A 225 225 0 0 0 470 120 L 490 460 L 10 460 Z" fill="#3b82f6" opacity="0.3" />
                </g>
              )}

              {/* Outer Court Bounding Lines */}
              <rect x="10" y="10" width="480" height="450" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.9" />

              {/* Paint / Key Area */}
              <rect x="170" y="10" width="160" height="190" fill="url(#paintGlow)" stroke="#ffffff" strokeWidth="3" />

              {/* Free Throw Circle */}
              <circle cx="250" cy="200" r="60" fill="none" stroke="#ffffff" strokeWidth="3" />
              <path d="M 190 200 A 60 60 0 0 0 310 200" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="8 6" />

              {/* Restricted Area Semi-Circle */}
              <path d="M 210 52 A 40 40 0 0 0 290 52" fill="none" stroke="#ffffff" strokeWidth="2.5" />

              {/* Backboard and Rim */}
              <line x1="220" y1="40" x2="280" y2="40" stroke="#ffffff" strokeWidth="4" />
              <line x1="250" y1="40" x2="250" y2="48" stroke="#ff8c00" strokeWidth="3" />
              <circle cx="250" cy="55" r="9" fill="none" stroke="#ff5722" strokeWidth="3" />

              {/* Three-Point Arc (FIBA 6.75m scaled) */}
              <line x1="30" y1="10" x2="30" y2="120" stroke="#ffffff" strokeWidth="3" />
              <line x1="470" y1="10" x2="470" y2="120" stroke="#ffffff" strokeWidth="3" />
              <path d="M 30 120 A 225 225 0 0 0 470 120" fill="none" stroke="#ffffff" strokeWidth="3" />

              {/* Center Court Semi-Circle at Baseline Bottom */}
              <path d="M 190 460 A 60 60 0 0 1 310 460" fill="none" stroke="#ffffff" strokeWidth="3" />

              {/* 5-ZONE REGION LABELS */}
              <g className="font-label-caps text-[11px] font-bold fill-white tracking-wider" opacity="0.65">
                <text x="250" y="115" textAnchor="middle">PAINT / RESTRICTED (71.9%)</text>
                <text x="250" y="240" textAnchor="middle">MID-RANGE KEY (56.5%)</text>
                <text x="65" y="65" textAnchor="middle">LEFT CORNER (50%)</text>
                <text x="435" y="65" textAnchor="middle">RIGHT CORNER (33%)</text>
                <text x="250" y="360" textAnchor="middle">ABOVE THE BREAK 3PT (45.5%)</text>
              </g>

              {/* PLOTTED SHOT MARKERS */}
              {/* 1. Paint / Restricted Area Shots */}
              {/* Made (Green circles) */}
              <circle cx="250" cy="68" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="245" cy="78" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="258" cy="74" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="240" cy="90" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="252" cy="95" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="262" cy="102" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="235" cy="110" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="245" cy="120" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="258" cy="125" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="225" cy="122" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="238" cy="132" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="250" cy="140" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="265" cy="135" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="230" cy="145" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="242" cy="152" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="255" cy="155" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="268" cy="148" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="220" cy="150" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="232" cy="158" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="246" cy="165" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="260" cy="168" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="272" cy="162" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="238" cy="172" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />

              {/* Missed in paint (Red circles) */}
              <circle cx="265" cy="85" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="270" cy="112" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="260" cy="120" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="275" cy="130" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="272" cy="140" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="262" cy="150" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="276" cy="158" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="280" cy="170" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="268" cy="178" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />

              {/* 2. Mid-Range Paint & Key */}
              {/* Makes */}
              <circle cx="210" cy="205" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="225" cy="210" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="238" cy="215" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="248" cy="212" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="260" cy="218" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="215" cy="225" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="230" cy="230" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="245" cy="228" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="258" cy="235" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="270" cy="228" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="225" cy="245" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="240" cy="250" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="255" cy="248" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />

              {/* Misses */}
              <circle cx="280" cy="210" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="290" cy="222" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="282" cy="236" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="295" cy="245" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="275" cy="255" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="285" cy="265" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="300" cy="272" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="265" cy="270" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="278" cy="280" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="290" cy="288" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />

              {/* 3. Left Corner 3 */}
              <circle cx="50" cy="45" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="60" cy="55" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="45" cy="85" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="55" cy="100" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />

              {/* 4. Right Corner 3 */}
              <circle cx="450" cy="50" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="445" cy="80" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="458" cy="95" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />

              {/* 5. Above the Break 3 */}
              <circle cx="160" cy="300" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="180" cy="315" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="210" cy="340" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="230" cy="350" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="245" cy="358" r="6" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
              <circle cx="265" cy="362" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="280" cy="368" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="300" cy="374" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="315" cy="380" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="335" cy="390" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
              <circle cx="350" cy="405" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Legend Bottom Ribbon */}
          <div className="bg-inverse-surface/95 border-t border-outline-variant/30 p-2.5 text-white flex items-center justify-around text-label-caps font-label-caps flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
              <span>MADE SHOTS (FGM: 44)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 border border-white"></span>
              <span>MISSED ATTEMPTS (29)</span>
            </div>
            <div className="flex items-center gap-1.5 text-tertiary-fixed-dim">
              <span className="material-symbols-outlined text-xs">lightbulb</span>
              <span>RESTRICTED ZONE CONVERSION INDEX: ELITE TIER</span>
            </div>
          </div>
        </div>

        {/* 5-ZONE PRECISION BREAKDOWN CARDS */}
        <div className="space-y-2 pt-2">
          <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wide flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base">pie_chart</span>
            5-Zone Precision Breakdown (ประสิทธิภาพแยก 5 โซนในแมตช์ที่เลือก)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Zone 1: Paint / Restricted */}
            <div className="bg-surface-container-low p-3 rounded border border-outline-variant/70 relative">
              <div className="flex justify-between items-start mb-1">
                <span className="font-label-caps text-label-caps font-bold text-on-surface uppercase truncate">
                  PAINT / RESTRICTED
                </span>
                <span className="bg-slate-900 text-white text-label-badge font-mono font-bold px-1.5 py-0.5 rounded">
                  71.9%
                </span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface leading-tight mt-1">
                23 <span className="text-body-sm font-body-sm font-normal text-secondary">/ 32 FGM</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#AF101A] h-full rounded-full" style={{ width: "71.9%" }}></div>
              </div>
              <span className="block text-body-sm font-body-sm text-secondary mt-1.5">ใต้แป้น / หัวกะโหลก</span>
            </div>

            {/* Zone 2: Mid-Range Paint & Key */}
            <div className="bg-surface-container-low p-3 rounded border border-outline-variant/70 relative">
              <div className="flex justify-between items-start mb-1">
                <span className="font-label-caps text-label-caps font-bold text-on-surface uppercase truncate">
                  MID-RANGE PAINT & KEY
                </span>
                <span className="bg-slate-900 text-white text-label-badge font-mono font-bold px-1.5 py-0.5 rounded">
                  56.5%
                </span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface leading-tight mt-1">
                13 <span className="text-body-sm font-body-sm font-normal text-secondary">/ 23 FGM</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#AF101A] h-full rounded-full" style={{ width: "56.5%" }}></div>
              </div>
              <span className="block text-body-sm font-body-sm text-secondary mt-1.5">ระยะกลางและขอบเขต</span>
            </div>

            {/* Zone 3: Left Corner 3 */}
            <div className="bg-surface-container-low p-3 rounded border border-outline-variant/70 relative">
              <div className="flex justify-between items-start mb-1">
                <span className="font-label-caps text-label-caps font-bold text-on-surface uppercase truncate">
                  LEFT CORNER 3
                </span>
                <span className="bg-slate-100 text-slate-800 text-label-badge font-mono font-bold px-1.5 py-0.5 rounded border border-slate-300">
                  50.0%
                </span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface leading-tight mt-1">
                2 <span className="text-body-sm font-body-sm font-normal text-secondary">/ 4 FGM</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-slate-700 h-full rounded-full" style={{ width: "50%" }}></div>
              </div>
              <span className="block text-body-sm font-body-sm text-secondary mt-1.5">สามแต้มมุมซ้าย</span>
            </div>

            {/* Zone 4: Right Corner 3 */}
            <div className="bg-surface-container-low p-3 rounded border border-outline-variant/70 relative">
              <div className="flex justify-between items-start mb-1">
                <span className="font-label-caps text-label-caps font-bold text-on-surface uppercase truncate">
                  RIGHT CORNER 3
                </span>
                <span className="bg-slate-100 text-slate-600 text-label-badge font-mono font-bold px-1.5 py-0.5 rounded border border-slate-200">
                  33.3%
                </span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface leading-tight mt-1">
                1 <span className="text-body-sm font-body-sm font-normal text-secondary">/ 3 FGM</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: "33.3%" }}></div>
              </div>
              <span className="block text-body-sm font-body-sm text-secondary mt-1.5">สามแต้มมุมขวา</span>
            </div>

            {/* Zone 5: Above The Break 3 */}
            <div className="bg-surface-container-low p-3 rounded border border-outline-variant/70 relative">
              <div className="flex justify-between items-start mb-1">
                <span className="font-label-caps text-label-caps font-bold text-on-surface uppercase truncate">
                  ABOVE THE BREAK 3
                </span>
                <span className="bg-slate-100 text-slate-800 text-label-badge font-mono font-bold px-1.5 py-0.5 rounded border border-slate-300">
                  45.5%
                </span>
              </div>
              <div className="font-headline-md text-headline-md text-on-surface leading-tight mt-1">
                5 <span className="text-body-sm font-body-sm font-normal text-secondary">/ 11 FGM</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-slate-700 h-full rounded-full" style={{ width: "45.5%" }}></div>
              </div>
              <span className="block text-body-sm font-body-sm text-secondary mt-1.5">สามแต้มหน้าหัวกะโหลก</span>
            </div>
          </div>
        </div>

        {/* FIBA SCOUT SUMMARY AUDIT */}
        <div className="bg-surface-container rounded p-4 border border-outline-variant flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="material-symbols-outlined text-primary text-2xl mt-0.5"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              fact_check
            </span>
            <div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wide">
                FIBA Official Scout Technical Notes
              </h4>
              <p className="text-body-sm font-body-sm text-on-surface-variant max-w-3xl leading-relaxed">
                "Pongsakorn exhibits elite paint control (71.9% inside restricted arc) utilizing exceptional drop-step footwork against smaller high-school rim protectors. Pick-and-pop perimeter attempts above the break (45.5%) reveal significant TCAS Division-1 collegiate stretch-five upside."
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadPdf}
            className="bg-on-surface text-inverse-on-surface hover:bg-inverse-surface px-4 py-1.5 rounded font-headline-sm text-headline-sm uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
          >
            {pdfDownloaded ? "Downloaded" : "Download PDF Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
