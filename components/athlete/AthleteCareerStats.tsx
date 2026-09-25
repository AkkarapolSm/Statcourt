"use client";

import React, { useState, useMemo } from "react";
import { AthleteProfile, AthleteSeasonStats } from "@/lib/types";

interface AthleteCareerStatsProps {
  athlete: AthleteProfile;
  stats: AthleteSeasonStats;
}

export default function AthleteCareerStats({ athlete, stats }: AthleteCareerStatsProps) {
  const [selectedCompetition, setSelectedCompetition] = useState("ALL");
  const [statFormat, setStatFormat] = useState("PER_GAME");
  const [viewMode, setViewMode] = useState<"STANDARD" | "SHOOTING" | "ADVANCED">("STANDARD");
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const athleteName = `${athlete.firstName} ${athlete.lastName}`;

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* FILTER TOOLBAR SECTION */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Competition Selector */}
            <div className="w-full sm:w-auto">
              <label className="block text-[11px] font-label-caps text-secondary uppercase font-bold tracking-wider mb-1">
                รายการแข่งขัน (COMPETITION)
              </label>
              <div className="relative">
                <select
                  value={selectedCompetition}
                  onChange={(e) => setSelectedCompetition(e.target.value)}
                  className="w-full sm:w-64 bg-surface border border-outline-variant rounded px-3 py-1.5 pr-8 text-on-surface font-body-md text-body-md font-semibold focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer outline-none"
                >
                  <option value="ALL">ทุกรายการแข่งขันทางการ (All Tournaments)</option>
                  <option value="TOA_U18">TOA Youth Basketball League U18</option>
                  <option value="YOUTH_GAMES">กีฬาเยาวชนแห่งชาติ (National Youth Games)</option>
                  <option value="OBEC_CUP">บาสเกตบอลนักเรียน สพฐ. ลีก (OBEC Cup)</option>
                  <option value="DPE_CUP">กีฬากรมพลศึกษา (DPE Cup U16)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-2 text-secondary pointer-events-none text-base">
                  expand_more
                </span>
              </div>
            </div>

            {/* Statistic Format Selector */}
            <div className="w-full sm:w-auto">
              <label className="block text-[11px] font-label-caps text-secondary uppercase font-bold tracking-wider mb-1">
                รูปแบบสถิติ (STATISTIC FORMAT)
              </label>
              <div className="relative">
                <select
                  value={statFormat}
                  onChange={(e) => setStatFormat(e.target.value)}
                  className="w-full sm:w-56 bg-surface border border-outline-variant rounded px-3 py-1.5 pr-8 text-on-surface font-body-md text-body-md font-semibold focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer outline-none"
                >
                  <option value="PER_GAME">สถิติเฉลี่ยต่อนัด (Per Game)</option>
                  <option value="TOTALS">สถิติรวมทั้งหมด (Totals)</option>
                  <option value="PER_36">ต่อ 36 นาที (Per 36 Minutes)</option>
                  <option value="PER_100">ร้อยละการครองบอล (Per 100 Possessions)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-2 text-secondary pointer-events-none text-base">
                  expand_more
                </span>
              </div>
            </div>

            {/* Quick Metric Filter Chips */}
            <div className="hidden xl:flex items-end gap-1.5 self-end pb-0.5">
              <span className="font-label-caps text-[10px] uppercase text-secondary mr-1 self-center">
                View:
              </span>
              <button
                onClick={() => setViewMode("STANDARD")}
                className={`px-2.5 py-1 text-xs font-bold uppercase rounded transition-colors ${
                  viewMode === "STANDARD"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                }`}
              >
                Standard Box
              </button>
              <button
                onClick={() => setViewMode("SHOOTING")}
                className={`px-2.5 py-1 text-xs font-bold uppercase rounded transition-colors ${
                  viewMode === "SHOOTING"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                }`}
              >
                Shooting %
              </button>
              <button
                onClick={() => setViewMode("ADVANCED")}
                className={`px-2.5 py-1 text-xs font-bold uppercase rounded transition-colors ${
                  viewMode === "ADVANCED"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                }`}
              >
                Advanced Impact
              </button>
            </div>
          </div>

          {/* Right Side Utility: Glossary & Pagination indicator */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant">
            <button
              onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant hover:border-primary rounded bg-surface hover:bg-surface-container-low text-on-surface font-label-caps text-label-caps uppercase tracking-wider transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-primary">help_outline</span>
              <span>GLOSSARY (คำอธิบายสถิติ)</span>
            </button>
            <div className="flex items-center gap-1 text-secondary font-body-sm text-body-sm">
              <span>12 แถว • หน้า 1 จาก 1</span>
              <button
                className="p-1 text-secondary hover:text-on-surface disabled:opacity-30"
                disabled
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button
                className="p-1 text-secondary hover:text-on-surface disabled:opacity-30"
                disabled
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Glossary Quick Dropdown/Modal */}
        {isGlossaryOpen && (
          <div className="mt-4 p-4 bg-surface-container-low rounded border border-outline-variant grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="font-bold text-primary font-headline-sm block">EFF (Efficiency)</span>
              <p className="text-secondary">(PTS + REB + AST + STL + BLK) - ((FGA - FGM) + (FTA - FTM) + TO)</p>
            </div>
            <div>
              <span className="font-bold text-on-surface font-headline-sm block">TR (Total Rebounds)</span>
              <p className="text-secondary">OR (Offensive Rebounds) + DR (Defensive Rebounds)</p>
            </div>
            <div>
              <span className="font-bold text-slate-900 font-headline-sm block">eFG% (Effective FG%)</span>
              <p className="text-secondary">(FGM + 0.5 * 3PM) / FGA ถ่วงน้ำหนักความคุ้มค่าลูกยิง 3 แต้ม</p>
            </div>
            <div>
              <span className="font-bold text-slate-900 font-headline-sm block">TS% (True Shooting)</span>
              <p className="text-secondary">PTS / (2 * (FGA + 0.44 * FTA)) รวมประสิทธิภาพลูกโทษ</p>
            </div>
          </div>
        )}
      </div>

      {/* CAREER & TOURNAMENT STATS CARD CONTAINER */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden mb-6">
        {/* Table Header & FIBA Validation Strip */}
        <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="bg-primary-container text-on-primary-container font-headline-sm text-xs px-2 py-0.5 rounded tracking-widest font-bold">
              FIBA LIVESTATS
            </span>
            <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface tracking-wide">
              ประวัติสถิติการแข่งขันรายปีและทัวร์นาเมนต์ (CAREER & TOURNAMENT STATS)
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-secondary font-body-sm">
            <span
              className="material-symbols-outlined text-sm text-[#AF101A]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span>มาตรฐานสมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT) & FIBA 3x3 / 5v5 Synchronized</span>
          </div>
        </div>

        {/* Comprehensive Multi-Year Career Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-surface-container text-on-surface font-label-caps text-[11px] uppercase tracking-wider border-b border-outline-variant">
                <th className="py-2.5 px-3 font-bold sticky left-0 bg-surface-container z-20 shadow-[1px_0_0_0_#e4beba]">
                  ปีการศึกษา (YEAR)
                </th>
                <th className="py-2.5 px-4 font-bold min-w-[240px]">รายการแข่งขัน (TOURNAMENT)</th>
                <th className="py-2.5 px-2 font-bold text-center">ทีม (TEAM)</th>
                <th className="py-2.5 px-2 font-bold text-right">GP</th>
                <th className="py-2.5 px-2 font-bold text-right">MIN</th>
                <th className="py-2.5 px-2.5 font-bold text-right text-primary bg-primary-fixed/20">PTS</th>
                <th className="py-2.5 px-2 font-bold text-right">FGM</th>
                <th className="py-2.5 px-2 font-bold text-right">FGA</th>
                <th className="py-2.5 px-2 font-bold text-right">FG%</th>
                <th className="py-2.5 px-2 font-bold text-right">3PM</th>
                <th className="py-2.5 px-2 font-bold text-right">3PA</th>
                <th className="py-2.5 px-2 font-bold text-right">3P%</th>
                <th className="py-2.5 px-2 font-bold text-right">FTM</th>
                <th className="py-2.5 px-2 font-bold text-right">FTA</th>
                <th className="py-2.5 px-2 font-bold text-right">FT%</th>
                <th className="py-2.5 px-2 font-bold text-right">OR</th>
                <th className="py-2.5 px-2 font-bold text-right">DR</th>
                <th className="py-2.5 px-2.5 font-bold text-right text-primary bg-primary-fixed/20">TR</th>
                <th className="py-2.5 px-2 font-bold text-right">AST</th>
                <th className="py-2.5 px-2 font-bold text-right">STL</th>
                <th className="py-2.5 px-2 font-bold text-right">BLK</th>
                <th className="py-2.5 px-2 font-bold text-right">TO</th>
                <th className="py-2.5 px-2 font-bold text-right">PF</th>
                <th className="py-2.5 px-3 font-bold text-right text-on-surface bg-surface-container-high">EFF</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md divide-y divide-outline-variant/60">
              {/* ====== 2568-69 (ม.6 / U18) SECTION ====== */}
              {/* Official Total Row */}
              <tr className="bg-surface-container-low font-bold text-on-surface hover:bg-surface-container transition-colors">
                <td className="py-2.5 px-3 sticky left-0 bg-surface-container-low z-10 shadow-[1px_0_0_0_#e4beba]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span className="font-headline-sm text-sm">2568-69 (ม.6)</span>
                  </div>
                  <span className="text-[10px] text-secondary font-label-caps block">U18 Division</span>
                </td>
                <td className="py-2.5 px-4 font-headline-sm text-sm text-primary tracking-wide">
                  สรุปทุกรายการแข่งขันทางการ (Official Total)
                </td>
                <td className="py-2.5 px-2 text-center">
                  <span className="bg-surface-container-highest px-1.5 py-0.5 rounded text-[10px] font-label-caps font-bold">
                    TOT
                  </span>
                </td>
                <td className="py-2.5 px-2 text-right font-headline-sm text-sm">14</td>
                <td className="py-2.5 px-2 text-right">31.5</td>
                <td className="py-2.5 px-2.5 text-right font-headline-sm text-base text-primary bg-primary-fixed/30 font-bold">
                  19.1
                </td>
                <td className="py-2.5 px-2 text-right">7.8</td>
                <td className="py-2.5 px-2 text-right">12.8</td>
                <td className="py-2.5 px-2 text-right font-bold">59.2%</td>
                <td className="py-2.5 px-2 text-right">0.1</td>
                <td className="py-2.5 px-2 text-right">0.4</td>
                <td className="py-2.5 px-2 text-right">25.0%</td>
                <td className="py-2.5 px-2 text-right">3.4</td>
                <td className="py-2.5 px-2 text-right">4.4</td>
                <td className="py-2.5 px-2 text-right">62.5%</td>
                <td className="py-2.5 px-2 text-right">4.5</td>
                <td className="py-2.5 px-2 text-right">9.7</td>
                <td className="py-2.5 px-2.5 text-right font-headline-sm text-base text-primary bg-primary-fixed/30 font-bold">
                  14.2
                </td>
                <td className="py-2.5 px-2 text-right">2.0</td>
                <td className="py-2.5 px-2 text-right">1.1</td>
                <td className="py-2.5 px-2 text-right font-bold text-tertiary">3.4</td>
                <td className="py-2.5 px-2 text-right">1.8</td>
                <td className="py-2.5 px-2 text-right">2.2</td>
                <td className="py-2.5 px-3 text-right font-headline-sm text-base bg-surface-container-high font-bold text-primary">
                  29.6
                </td>
              </tr>
              {/* Tournament 1 */}
              <tr className="hover:bg-surface-container/50 transition-colors">
                <td className="py-2 px-3 sticky left-0 bg-surface-container-lowest z-10 text-secondary text-xs shadow-[1px_0_0_0_#e4beba]">
                  2568-69 (ม.6)
                </td>
                <td className="py-2 px-4 text-on-surface">
                  TOA บาสเกตบอลชิงแชมป์ประเทศไทย U18 (BSAT)
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="border border-outline-variant text-[10px] font-label-caps px-1 rounded">
                    CMU
                  </span>
                </td>
                <td className="py-2 px-2 text-right">8</td>
                <td className="py-2 px-2 text-right text-secondary">32.5</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">20.4</td>
                <td className="py-2 px-2 text-right text-secondary">8.4</td>
                <td className="py-2 px-2 text-right text-secondary">13.2</td>
                <td className="py-2 px-2 text-right font-semibold">63.6%</td>
                <td className="py-2 px-2 text-right text-secondary">0.1</td>
                <td className="py-2 px-2 text-right text-secondary">0.3</td>
                <td className="py-2 px-2 text-right text-secondary">33.3%</td>
                <td className="py-2 px-2 text-right text-secondary">3.5</td>
                <td className="py-2 px-2 text-right text-secondary">4.5</td>
                <td className="py-2 px-2 text-right text-secondary">77.8%</td>
                <td className="py-2 px-2 text-right text-secondary">4.8</td>
                <td className="py-2 px-2 text-right text-secondary">10.4</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">15.2</td>
                <td className="py-2 px-2 text-right text-secondary">2.2</td>
                <td className="py-2 px-2 text-right text-secondary">1.3</td>
                <td className="py-2 px-2 text-right font-semibold">3.8</td>
                <td className="py-2 px-2 text-right text-secondary">1.9</td>
                <td className="py-2 px-2 text-right text-secondary">2.4</td>
                <td className="py-2 px-3 text-right font-bold bg-surface-container-high/40">31.8</td>
              </tr>
              {/* Tournament 2 */}
              <tr className="hover:bg-surface-container/50 transition-colors">
                <td className="py-2 px-3 sticky left-0 bg-surface-container-lowest z-10 text-secondary text-xs shadow-[1px_0_0_0_#e4beba]">
                  2568-69 (ม.6)
                </td>
                <td className="py-2 px-4 text-on-surface">
                  กีฬาเยาวชนแห่งชาติ ครั้งที่ 40 (SAT)
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="border border-outline-variant text-[10px] font-label-caps px-1 rounded">
                    CNX
                  </span>
                </td>
                <td className="py-2 px-2 text-right">4</td>
                <td className="py-2 px-2 text-right text-secondary">30.0</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">17.3</td>
                <td className="py-2 px-2 text-right text-secondary">7.0</td>
                <td className="py-2 px-2 text-right text-secondary">12.3</td>
                <td className="py-2 px-2 text-right font-semibold">56.9%</td>
                <td className="py-2 px-2 text-right text-secondary">0</td>
                <td className="py-2 px-2 text-right text-secondary">0.5</td>
                <td className="py-2 px-2 text-right text-secondary">0.0%</td>
                <td className="py-2 px-2 text-right text-secondary">3.3</td>
                <td className="py-2 px-2 text-right text-secondary">4.3</td>
                <td className="py-2 px-2 text-right text-secondary">76.7%</td>
                <td className="py-2 px-2 text-right text-secondary">4.3</td>
                <td className="py-2 px-2 text-right text-secondary">8.8</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">13.1</td>
                <td className="py-2 px-2 text-right text-secondary">1.8</td>
                <td className="py-2 px-2 text-right text-secondary">0.8</td>
                <td className="py-2 px-2 text-right font-semibold">2.8</td>
                <td className="py-2 px-2 text-right text-secondary">1.5</td>
                <td className="py-2 px-2 text-right text-secondary">2.0</td>
                <td className="py-2 px-3 text-right font-bold bg-surface-container-high/40">26.5</td>
              </tr>
              {/* Tournament 3 */}
              <tr className="hover:bg-surface-container/50 transition-colors">
                <td className="py-2 px-3 sticky left-0 bg-surface-container-lowest z-10 text-secondary text-xs shadow-[1px_0_0_0_#e4beba]">
                  2568-69 (ม.6)
                </td>
                <td className="py-2 px-4 text-on-surface">
                  รอบชิงแชมป์ประเทศไทย TOA National Finals
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="border border-outline-variant text-[10px] font-label-caps px-1 rounded">
                    CMU
                  </span>
                </td>
                <td className="py-2 px-2 text-right">2</td>
                <td className="py-2 px-2 text-right text-secondary">33.0</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">21.0</td>
                <td className="py-2 px-2 text-right text-secondary">8.5</td>
                <td className="py-2 px-2 text-right text-secondary">13.5</td>
                <td className="py-2 px-2 text-right font-semibold">63.0%</td>
                <td className="py-2 px-2 text-right text-secondary">0</td>
                <td className="py-2 px-2 text-right text-secondary">0.5</td>
                <td className="py-2 px-2 text-right text-secondary">0.0%</td>
                <td className="py-2 px-2 text-right text-secondary">4.0</td>
                <td className="py-2 px-2 text-right text-secondary">5.0</td>
                <td className="py-2 px-2 text-right text-secondary">80.0%</td>
                <td className="py-2 px-2 text-right text-secondary">4.5</td>
                <td className="py-2 px-2 text-right text-secondary">9.5</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">14.0</td>
                <td className="py-2 px-2 text-right text-secondary">2.0</td>
                <td className="py-2 px-2 text-right text-secondary">1.0</td>
                <td className="py-2 px-2 text-right font-semibold">3.5</td>
                <td className="py-2 px-2 text-right text-secondary">2.0</td>
                <td className="py-2 px-2 text-right text-secondary">2.0</td>
                <td className="py-2 px-3 text-right font-bold bg-surface-container-high/40">31.0</td>
              </tr>

              {/* ====== 2567-68 (ม.5 / U17) SECTION ====== */}
              {/* Official Total Row */}
              <tr className="bg-surface-container-low font-bold text-on-surface hover:bg-surface-container transition-colors">
                <td className="py-2.5 px-3 sticky left-0 bg-surface-container-low z-10 shadow-[1px_0_0_0_#e4beba]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span className="font-headline-sm text-sm">2567-68 (ม.5)</span>
                  </div>
                  <span className="text-[10px] text-secondary font-label-caps block">U17 Division</span>
                </td>
                <td className="py-2.5 px-4 font-headline-sm text-sm text-on-surface tracking-wide">
                  สรุปทุกรายการแข่งขันทางการ (Official Total)
                </td>
                <td className="py-2.5 px-2 text-center">
                  <span className="bg-surface-container-highest px-1.5 py-0.5 rounded text-[10px] font-label-caps font-bold">
                    TOT
                  </span>
                </td>
                <td className="py-2.5 px-2 text-right font-headline-sm text-sm">18</td>
                <td className="py-2.5 px-2 text-right">28.5</td>
                <td className="py-2.5 px-2.5 text-right font-headline-sm text-base text-on-surface bg-primary-fixed/20 font-bold">
                  16.5
                </td>
                <td className="py-2.5 px-2 text-right">6.8</td>
                <td className="py-2.5 px-2 text-right">11.8</td>
                <td className="py-2.5 px-2 text-right font-bold">57.6%</td>
                <td className="py-2.5 px-2 text-right">0</td>
                <td className="py-2.5 px-2 text-right">0.2</td>
                <td className="py-2.5 px-2 text-right">0.0%</td>
                <td className="py-2.5 px-2 text-right">2.9</td>
                <td className="py-2.5 px-2 text-right">4.0</td>
                <td className="py-2.5 px-2 text-right">72.5%</td>
                <td className="py-2.5 px-2 text-right">3.8</td>
                <td className="py-2.5 px-2 text-right">8.1</td>
                <td className="py-2.5 px-2.5 text-right font-headline-sm text-base text-on-surface bg-primary-fixed/20 font-bold">
                  11.9
                </td>
                <td className="py-2.5 px-2 text-right">1.6</td>
                <td className="py-2.5 px-2 text-right">0.9</td>
                <td className="py-2.5 px-2 text-right font-bold text-tertiary">2.7</td>
                <td className="py-2.5 px-2 text-right">2.1</td>
                <td className="py-2.5 px-2 text-right">2.5</td>
                <td className="py-2.5 px-3 text-right font-headline-sm text-base bg-surface-container-high font-bold">
                  24.2
                </td>
              </tr>
              {/* Tournament 4 */}
              <tr className="hover:bg-surface-container/50 transition-colors">
                <td className="py-2 px-3 sticky left-0 bg-surface-container-lowest z-10 text-secondary text-xs shadow-[1px_0_0_0_#e4beba]">
                  2567-68 (ม.5)
                </td>
                <td className="py-2 px-4 text-on-surface">
                  บาสเกตบอลนักเรียน สพฐ. ลีก ถ้วย ก (OBEC Cup)
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="border border-outline-variant text-[10px] font-label-caps px-1 rounded">
                    CMU
                  </span>
                </td>
                <td className="py-2 px-2 text-right">12</td>
                <td className="py-2 px-2 text-right text-secondary">29.0</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">17.2</td>
                <td className="py-2 px-2 text-right text-secondary">7.1</td>
                <td className="py-2 px-2 text-right text-secondary">12.0</td>
                <td className="py-2 px-2 text-right font-semibold">59.2%</td>
                <td className="py-2 px-2 text-right text-secondary">0</td>
                <td className="py-2 px-2 text-right text-secondary">0.1</td>
                <td className="py-2 px-2 text-right text-secondary">0.0%</td>
                <td className="py-2 px-2 text-right text-secondary">3.0</td>
                <td className="py-2 px-2 text-right text-secondary">4.1</td>
                <td className="py-2 px-2 text-right text-secondary">73.2%</td>
                <td className="py-2 px-2 text-right text-secondary">4.0</td>
                <td className="py-2 px-2 text-right text-secondary">8.3</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">12.3</td>
                <td className="py-2 px-2 text-right text-secondary">1.8</td>
                <td className="py-2 px-2 text-right text-secondary">1.0</td>
                <td className="py-2 px-2 text-right font-semibold">2.9</td>
                <td className="py-2 px-2 text-right text-secondary">2.0</td>
                <td className="py-2 px-2 text-right text-secondary">2.4</td>
                <td className="py-2 px-3 text-right font-bold bg-surface-container-high/40">25.1</td>
              </tr>
              {/* Tournament 5 */}
              <tr className="hover:bg-surface-container/50 transition-colors">
                <td className="py-2 px-3 sticky left-0 bg-surface-container-lowest z-10 text-secondary text-xs shadow-[1px_0_0_0_#e4beba]">
                  2567-68 (ม.5)
                </td>
                <td className="py-2 px-4 text-on-surface">
                  กีฬาเยาวชนแห่งชาติ ครั้งที่ 39 (SAT)
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="border border-outline-variant text-[10px] font-label-caps px-1 rounded">
                    CNX
                  </span>
                </td>
                <td className="py-2 px-2 text-right">6</td>
                <td className="py-2 px-2 text-right text-secondary">27.5</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">15.1</td>
                <td className="py-2 px-2 text-right text-secondary">6.2</td>
                <td className="py-2 px-2 text-right text-secondary">11.4</td>
                <td className="py-2 px-2 text-right font-semibold">54.4%</td>
                <td className="py-2 px-2 text-right text-secondary">0</td>
                <td className="py-2 px-2 text-right text-secondary">0.3</td>
                <td className="py-2 px-2 text-right text-secondary">0.0%</td>
                <td className="py-2 px-2 text-right text-secondary">2.7</td>
                <td className="py-2 px-2 text-right text-secondary">3.8</td>
                <td className="py-2 px-2 text-right text-secondary">71.1%</td>
                <td className="py-2 px-2 text-right text-secondary">3.4</td>
                <td className="py-2 px-2 text-right text-secondary">7.7</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">11.1</td>
                <td className="py-2 px-2 text-right text-secondary">1.2</td>
                <td className="py-2 px-2 text-right text-secondary">0.7</td>
                <td className="py-2 px-2 text-right font-semibold">2.3</td>
                <td className="py-2 px-2 text-right text-secondary">2.3</td>
                <td className="py-2 px-2 text-right text-secondary">2.7</td>
                <td className="py-2 px-3 text-right font-bold bg-surface-container-high/40">22.4</td>
              </tr>

              {/* ====== 2566-67 (ม.4 / U16) SECTION ====== */}
              {/* Official Total Row */}
              <tr className="bg-surface-container-low font-bold text-on-surface hover:bg-surface-container transition-colors">
                <td className="py-2.5 px-3 sticky left-0 bg-surface-container-low z-10 shadow-[1px_0_0_0_#e4beba]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span className="font-headline-sm text-sm">2566-67 (ม.4)</span>
                  </div>
                  <span className="text-[10px] text-secondary font-label-caps block">U16 Division</span>
                </td>
                <td className="py-2.5 px-4 font-headline-sm text-sm text-on-surface tracking-wide">
                  สรุปทุกรายการแข่งขันทางการ (Official Total)
                </td>
                <td className="py-2.5 px-2 text-center">
                  <span className="bg-surface-container-highest px-1.5 py-0.5 rounded text-[10px] font-label-caps font-bold">
                    TOT
                  </span>
                </td>
                <td className="py-2.5 px-2 text-right font-headline-sm text-sm">16</td>
                <td className="py-2.5 px-2 text-right">25.0</td>
                <td className="py-2.5 px-2.5 text-right font-headline-sm text-base text-on-surface bg-primary-fixed/20 font-bold">
                  13.2
                </td>
                <td className="py-2.5 px-2 text-right">5.4</td>
                <td className="py-2.5 px-2 text-right">10.2</td>
                <td className="py-2.5 px-2 text-right font-bold">52.9%</td>
                <td className="py-2.5 px-2 text-right">0</td>
                <td className="py-2.5 px-2 text-right">0.1</td>
                <td className="py-2.5 px-2 text-right">0.0%</td>
                <td className="py-2.5 px-2 text-right">2.4</td>
                <td className="py-2.5 px-2 text-right">3.6</td>
                <td className="py-2.5 px-2 text-right">66.7%</td>
                <td className="py-2.5 px-2 text-right">3.1</td>
                <td className="py-2.5 px-2 text-right">6.7</td>
                <td className="py-2.5 px-2.5 text-right font-headline-sm text-base text-on-surface bg-primary-fixed/20 font-bold">
                  9.8
                </td>
                <td className="py-2.5 px-2 text-right">1.2</td>
                <td className="py-2.5 px-2 text-right">0.6</td>
                <td className="py-2.5 px-2 text-right font-bold text-tertiary">2.0</td>
                <td className="py-2.5 px-2 text-right">2.4</td>
                <td className="py-2.5 px-2 text-right">2.8</td>
                <td className="py-2.5 px-3 text-right font-headline-sm text-base bg-surface-container-high font-bold">
                  18.9
                </td>
              </tr>
              {/* Tournament 6 */}
              <tr className="hover:bg-surface-container/50 transition-colors">
                <td className="py-2 px-3 sticky left-0 bg-surface-container-lowest z-10 text-secondary text-xs shadow-[1px_0_0_0_#e4beba]">
                  2566-67 (ม.4)
                </td>
                <td className="py-2 px-4 text-on-surface">
                  TOA บาสเกตบอลชิงแชมป์ประเทศไทย U16 (BSAT)
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="border border-outline-variant text-[10px] font-label-caps px-1 rounded">
                    CMU
                  </span>
                </td>
                <td className="py-2 px-2 text-right">10</td>
                <td className="py-2 px-2 text-right text-secondary">26.2</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">14.1</td>
                <td className="py-2 px-2 text-right text-secondary">5.8</td>
                <td className="py-2 px-2 text-right text-secondary">10.5</td>
                <td className="py-2 px-2 text-right font-semibold">55.2%</td>
                <td className="py-2 px-2 text-right text-secondary">0</td>
                <td className="py-2 px-2 text-right text-secondary">0.1</td>
                <td className="py-2 px-2 text-right text-secondary">0.0%</td>
                <td className="py-2 px-2 text-right text-secondary">2.5</td>
                <td className="py-2 px-2 text-right text-secondary">3.7</td>
                <td className="py-2 px-2 text-right text-secondary">67.6%</td>
                <td className="py-2 px-2 text-right text-secondary">3.3</td>
                <td className="py-2 px-2 text-right text-secondary">7.0</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">10.3</td>
                <td className="py-2 px-2 text-right text-secondary">1.4</td>
                <td className="py-2 px-2 text-right text-secondary">0.7</td>
                <td className="py-2 px-2 text-right font-semibold">2.2</td>
                <td className="py-2 px-2 text-right text-secondary">2.2</td>
                <td className="py-2 px-2 text-right text-secondary">2.7</td>
                <td className="py-2 px-3 text-right font-bold bg-surface-container-high/40">20.4</td>
              </tr>
              {/* Tournament 7 */}
              <tr className="hover:bg-surface-container/50 transition-colors">
                <td className="py-2 px-3 sticky left-0 bg-surface-container-lowest z-10 text-secondary text-xs shadow-[1px_0_0_0_#e4beba]">
                  2566-67 (ม.4)
                </td>
                <td className="py-2 px-4 text-on-surface">
                  กีฬากรมพลศึกษา รุ่นอายุไม่เกิน 16 ปี (DPE Cup)
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="border border-outline-variant text-[10px] font-label-caps px-1 rounded">
                    CMU
                  </span>
                </td>
                <td className="py-2 px-2 text-right">6</td>
                <td className="py-2 px-2 text-right text-secondary">23.0</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">11.7</td>
                <td className="py-2 px-2 text-right text-secondary">4.7</td>
                <td className="py-2 px-2 text-right text-secondary">9.7</td>
                <td className="py-2 px-2 text-right font-semibold">48.5%</td>
                <td className="py-2 px-2 text-right text-secondary">0</td>
                <td className="py-2 px-2 text-right text-secondary">0</td>
                <td className="py-2 px-2 text-right text-secondary">0.0%</td>
                <td className="py-2 px-2 text-right text-secondary">2.3</td>
                <td className="py-2 px-2 text-right text-secondary">3.5</td>
                <td className="py-2 px-2 text-right text-secondary">65.7%</td>
                <td className="py-2 px-2 text-right text-secondary">2.8</td>
                <td className="py-2 px-2 text-right text-secondary">6.2</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">9.0</td>
                <td className="py-2 px-2 text-right text-secondary">0.8</td>
                <td className="py-2 px-2 text-right text-secondary">0.5</td>
                <td className="py-2 px-2 text-right font-semibold">1.7</td>
                <td className="py-2 px-2 text-right text-secondary">2.7</td>
                <td className="py-2 px-2 text-right text-secondary">3.0</td>
                <td className="py-2 px-3 text-right font-bold bg-surface-container-high/40">16.4</td>
              </tr>

              {/* ====== 2565-66 (ม.3 / U15) SECTION ====== */}
              {/* Official Total Row */}
              <tr className="bg-surface-container-low font-bold text-on-surface hover:bg-surface-container transition-colors">
                <td className="py-2.5 px-3 sticky left-0 bg-surface-container-low z-10 shadow-[1px_0_0_0_#e4beba]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span className="font-headline-sm text-sm">2565-66 (ม.3)</span>
                  </div>
                  <span className="text-[10px] text-secondary font-label-caps block">U15 Division</span>
                </td>
                <td className="py-2.5 px-4 font-headline-sm text-sm text-on-surface tracking-wide">
                  สรุปทุกรายการแข่งขันทางการ (Official Total)
                </td>
                <td className="py-2.5 px-2 text-center">
                  <span className="bg-surface-container-highest px-1.5 py-0.5 rounded text-[10px] font-label-caps font-bold">
                    TOT
                  </span>
                </td>
                <td className="py-2.5 px-2 text-right font-headline-sm text-sm">14</td>
                <td className="py-2.5 px-2 text-right">21.0</td>
                <td className="py-2.5 px-2.5 text-right font-headline-sm text-base text-on-surface bg-primary-fixed/20 font-bold">
                  10.5
                </td>
                <td className="py-2.5 px-2 text-right">4.3</td>
                <td className="py-2.5 px-2 text-right">8.8</td>
                <td className="py-2.5 px-2 text-right font-bold">48.9%</td>
                <td className="py-2.5 px-2 text-right">0</td>
                <td className="py-2.5 px-2 text-right">0</td>
                <td className="py-2.5 px-2 text-right">0.0%</td>
                <td className="py-2.5 px-2 text-right">1.9</td>
                <td className="py-2.5 px-2 text-right">3.2</td>
                <td className="py-2.5 px-2 text-right">59.4%</td>
                <td className="py-2.5 px-2 text-right">2.5</td>
                <td className="py-2.5 px-2 text-right">5.3</td>
                <td className="py-2.5 px-2.5 text-right font-headline-sm text-base text-on-surface bg-primary-fixed/20 font-bold">
                  7.8
                </td>
                <td className="py-2.5 px-2 text-right">0.9</td>
                <td className="py-2.5 px-2 text-right">0.4</td>
                <td className="py-2.5 px-2 text-right font-bold text-tertiary">1.4</td>
                <td className="py-2.5 px-2 text-right">2.8</td>
                <td className="py-2.5 px-2 text-right">3.1</td>
                <td className="py-2.5 px-3 text-right font-headline-sm text-base bg-surface-container-high font-bold">
                  14.1
                </td>
              </tr>
              {/* Tournament 8 */}
              <tr className="hover:bg-surface-container/50 transition-colors">
                <td className="py-2 px-3 sticky left-0 bg-surface-container-lowest z-10 text-secondary text-xs shadow-[1px_0_0_0_#e4beba]">
                  2565-66 (ม.3)
                </td>
                <td className="py-2 px-4 text-on-surface">
                  บาสเกตบอลนักเรียน สพฐ. ลีก รุ่น 15 ปี (OBEC Cup)
                </td>
                <td className="py-2 px-2 text-center">
                  <span className="border border-outline-variant text-[10px] font-label-caps px-1 rounded">
                    CMU
                  </span>
                </td>
                <td className="py-2 px-2 text-right">14</td>
                <td className="py-2 px-2 text-right text-secondary">21.0</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">10.5</td>
                <td className="py-2 px-2 text-right text-secondary">4.3</td>
                <td className="py-2 px-2 text-right text-secondary">8.8</td>
                <td className="py-2 px-2 text-right font-semibold">48.9%</td>
                <td className="py-2 px-2 text-right text-secondary">0</td>
                <td className="py-2 px-2 text-right text-secondary">0</td>
                <td className="py-2 px-2 text-right text-secondary">0.0%</td>
                <td className="py-2 px-2 text-right text-secondary">1.9</td>
                <td className="py-2 px-2 text-right text-secondary">3.2</td>
                <td className="py-2 px-2 text-right text-secondary">59.4%</td>
                <td className="py-2 px-2 text-right text-secondary">2.5</td>
                <td className="py-2 px-2 text-right text-secondary">5.3</td>
                <td className="py-2 px-2.5 text-right font-bold text-on-surface bg-primary-fixed/10">7.8</td>
                <td className="py-2 px-2 text-right text-secondary">0.9</td>
                <td className="py-2 px-2 text-right text-secondary">0.4</td>
                <td className="py-2 px-2 text-right font-semibold">1.4</td>
                <td className="py-2 px-2 text-right text-secondary">2.8</td>
                <td className="py-2 px-2 text-right text-secondary">3.1</td>
                <td className="py-2 px-3 text-right font-bold bg-surface-container-high/40">14.1</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Footnote & Tactical Keys */}
        <div className="bg-surface-container-lowest px-4 py-2.5 border-t border-outline-variant flex flex-wrap items-center justify-between text-xs text-secondary gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 font-label-caps">
              <span className="w-3 h-3 bg-primary-fixed/40 border border-primary/40 rounded inline-block"></span>
              Primary Statistical Anchors (PTS / TR / EFF)
            </span>
            <span className="flex items-center gap-1 font-label-caps">
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
              Current Academic Season (ม.6)
            </span>
            <span className="font-body-sm text-body-sm text-secondary">
              * Official FIBA live log sync completed 23 September 2026
            </span>
          </div>
          <div className="font-label-caps uppercase text-[11px]">
            12 แถวที่แสดงผล | ระบบคำนวณอัตโนมัติ FIBA LIVE STATS 4.2
          </div>
        </div>
      </div>

      {/* HIGHLIGHT OF THE SEASON CALLOUT BOX: DOUBLE-DOUBLE MACHINE (Bento Architecture) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Primary Spotlight Card (Double-Double Machine) */}
        <div className="lg:col-span-8 bg-surface-container-lowest border-2 border-primary-container rounded p-5 relative overflow-hidden shadow-[0_8px_24px_-4px_rgba(211,47,47,0.15)]">
          {/* Live Watermark/Badge */}
          <div className="absolute -right-6 -bottom-6 text-outline-variant/20 select-none pointer-events-none font-headline-xl text-[140px] leading-none">
            #15
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-on-primary font-label-caps text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                SEASON RECAP • ม.6
              </span>
              <span className="font-headline-sm text-headline-sm uppercase text-on-surface">
                HIGHLIGHT OF THE SEASON: DOUBLE-DOUBLE MACHINE
              </span>
            </div>
            <span className="text-tertiary font-bold font-label-caps text-xs uppercase bg-tertiary-fixed/30 px-2 py-0.5 rounded border border-tertiary/20">
              TCAS QUOTA CANDIDATE #1
            </span>
          </div>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mb-4">
            ภูริภัทร พงษ์ศกร สถาปนาตนเองเป็นเซ็นเตอร์ระดับมัธยมปลายที่มีประสิทธิภาพสูงสุดในประเทศไทย (EFF 29.6) ทำสถิติ{" "}
            <strong className="text-primary font-bold">ดับเบิล-ดับเบิล เฉลี่ยต่อเกม (19.1 แต้ม, 14.2 รีบาวด์)</strong>{" "}
            ตลอดการแข่งขัน 14 นัดในระดับ ม.6 พร้อมสถิติ 3.4 บล็อกต่อเกม ครองอันดับ 1 ในการแข่งขันชิงแชมป์ประเทศไทย U18
          </p>

          {/* Attribute Progress Meters & Radar Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-outline-variant">
            <div>
              <div className="flex justify-between text-[11px] font-label-caps mb-1 uppercase">
                <span className="text-secondary font-bold">Paint Dominance</span>
                <span className="text-primary font-bold">96%</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                <div className="bg-primary h-full rounded" style={{ width: "96%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-label-caps mb-1 uppercase">
                <span className="text-secondary font-bold">Offensive Glass</span>
                <span className="text-primary font-bold">91%</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                <div className="bg-primary h-full rounded" style={{ width: "91%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-label-caps mb-1 uppercase">
                <span className="text-secondary font-bold">Rim Protection</span>
                <span className="text-primary font-bold">98%</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                <div className="bg-tertiary h-full rounded" style={{ width: "98%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-label-caps mb-1 uppercase">
                <span className="text-secondary font-bold">FT Stability</span>
                <span className="text-on-surface font-bold">62.5%</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded overflow-hidden">
                <div className="bg-secondary h-full rounded" style={{ width: "62.5%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Bento Card: Scout Verification Status */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-label-caps uppercase text-secondary font-bold tracking-widest">
                BSAT VERIFICATION RECORD
              </span>
              <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">
                  verified_user
                </span>
                <div>
                  <span className="block font-headline-sm text-sm uppercase text-on-surface leading-tight">
                    FIBA LiveStats Tier-1 Sync
                  </span>
                  <span className="text-[11px] text-secondary font-body-sm">
                    บันทึกสดผ่านระบบดิจิทัลข้างสนามโดยกรรมการสถิติสมาคมฯ
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">
                  school
                </span>
                <div>
                  <span className="block font-headline-sm text-sm uppercase text-on-surface leading-tight">
                    TCAS Port Ready
                  </span>
                  <span className="text-[11px] text-secondary font-body-sm">
                    ได้รับการรับรองเอกสารโควต้านักกีฬาทีมชาติตามระเบียบ สพฐ.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant mt-4">
            <button
              onClick={handleDownload}
              className="w-full bg-inverse-surface hover:bg-slate-800 text-inverse-on-surface py-2 rounded font-label-caps text-label-caps uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>
                {downloadSuccess
                  ? "ดาวน์โหลดเอกสารเรียบร้อย"
                  : "Download Official Scouting Dossier (PDF)"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
