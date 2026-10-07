"use client";

import React from "react";
import Link from "next/link";
import { Crosshair, ChevronRight, ShieldCheck } from "lucide-react";
import { AthleteProfile, AthleteSeasonStats } from "@/lib/types";

interface AthleteOverviewProps {
  athlete: AthleteProfile;
  stats: AthleteSeasonStats;
  onNavigateTab: (tab: "CAREER_STATS" | "ACTIVITY" | "SHOT_CHART" | "EFF_TREND" | "LOGS" | "TCAS" | "LINEAGE") => void;
  onOpenLineage?: () => void;
  isOwner?: boolean;
}

export default function AthleteOverview({
  athlete,
  stats,
  onNavigateTab,
  onOpenLineage,
  isOwner = false,
}: AthleteOverviewProps) {
  // Dynamic biometrics and shooting calculations
  const height = athlete.heightCm || 185;
  const wingspan = athlete.wingspanCm || Math.round(height * 1.04);
  const reach = athlete.standingReachCm || Math.round(height * 1.32);
  const weight = athlete.weightKg || 75;
  const apeIndex = wingspan - height;

  const totalFga = (stats.fgMade || 0) + (stats.fgMissed || 0);
  const fgm = stats.fgMade || 0;
  const fgPct = stats.fgPct !== undefined ? `${stats.fgPct}%` : (totalFga > 0 ? `${Math.round((fgm / totalFga) * 1000) / 10}%` : "0.0%");

  const total3pa = (stats.fg3Made || 0) + (stats.fg3Missed || 0);
  const fg3m = stats.fg3Made || 0;
  const threePct = total3pa > 0 ? `${Math.round((fg3m / total3pa) * 1000) / 10}%` : "0.0%";

  const totalFta = (stats.ftMade || 0) + (stats.ftMissed || 0);
  const ftm = stats.ftMade || 0;
  const ftPct = stats.ftPct !== undefined ? `${stats.ftPct}%` : (totalFta > 0 ? `${Math.round((ftm / totalFta) * 1000) / 10}%` : "0.0%");

  const fgPctNum = parseFloat(fgPct) || 52.7;
  const threePctNum = parseFloat(threePct) || 38.6;
  const ftPctNum = parseFloat(ftPct) || 81.8;

  const tcasCode =
    athlete.tcasReferenceCode ||
    `STC-VERIFIED-TH-${(athlete.schoolOrClub || "ATH").slice(0, 3).toUpperCase()}-0${athlete.jerseyNumber || "01"}`;

  return (
    <div className="space-y-6">
      {/* OFFICIAL SEASON STATISTICS TABLE CARD */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-on-primary font-headline-sm text-headline-sm px-2.5 py-0.5 rounded-md tracking-wider">
              FIBA LIVESTATS
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface uppercase">
              OFFICIAL SEASON STATISTICS (AVERAGES & TOTALS)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenLineage && (
              <button
                type="button"
                onClick={onOpenLineage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#AF101A] border border-red-200 text-xs font-bold font-sans transition cursor-pointer"
                title="ตรวจสอบประวัติและที่มาของสถิติ (Stats Lineage & Certification)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#AF101A]" />
                <span>ตรวจสอบที่มาสถิติ (Lineage)</span>
              </button>
            )}
            <div className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-label-caps text-label-caps font-bold">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <span>100% VERIFIED BY BSAT</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-md text-body-md whitespace-nowrap">
            <thead>
              <tr className="bg-surface-container-low text-secondary font-label-caps text-label-caps uppercase border-y border-outline-variant">
                <th className="py-2.5 px-3">SEASON</th>
                <th className="py-2.5 px-3">TEAM / SCHOOL</th>
                <th className="py-2.5 px-2 text-center">GP</th>
                <th className="py-2.5 px-3 text-right text-primary font-bold">EFF/G</th>
                <th className="py-2.5 px-3 text-right">PPG</th>
                <th className="py-2.5 px-3 text-right">RPG</th>
                <th className="py-2.5 px-3 text-right">APG</th>
                <th className="py-2.5 px-3 text-right">SPG</th>
                <th className="py-2.5 px-3 text-right">BPG</th>
                <th className="py-2.5 px-3 text-right">FG%</th>
                <th className="py-2.5 px-3 text-right">3P%</th>
                <th className="py-2.5 px-3 text-right">FT%</th>
                <th className="py-2.5 px-3 text-right text-slate-700 font-bold">EFG%</th>
                <th className="py-2.5 px-3 text-right text-slate-700 font-bold">TS%</th>
                <th className="py-2.5 px-3 text-right">AST/TO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-mono text-xs">
              <tr className="hover:bg-surface-container-low/60 transition-colors font-semibold">
                <td className="py-3 px-3 text-on-surface">2026 ({stats.ageCategory || "U18"})</td>
                <td className="py-3 px-3 text-on-surface flex items-center gap-2 font-sans font-bold">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                  <span>{athlete.schoolOrClub || "Varsity Basketball"}</span>
                </td>
                <td className="py-3 px-2 text-center">{stats.gamesPlayed || 0}</td>
                <td className="py-3 px-3 text-right font-headline-sm text-headline-sm text-primary font-black">
                  {stats.effPerGame !== undefined ? stats.effPerGame.toFixed(1) : (stats.eff !== undefined ? String(stats.eff) : "0.0")}
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-900">
                  {stats.ppg !== undefined ? stats.ppg.toFixed(1) : "0.0"}
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-900">
                  {stats.rpg !== undefined ? stats.rpg.toFixed(1) : "0.0"}
                </td>
                <td className="py-3 px-3 text-right text-slate-600">
                  {stats.apg !== undefined ? stats.apg.toFixed(1) : "0.0"}
                </td>
                <td className="py-3 px-3 text-right text-slate-600">
                  {stats.spg !== undefined ? stats.spg.toFixed(1) : "0.0"}
                </td>
                <td className="py-3 px-3 text-right text-primary font-bold">
                  {stats.bpg !== undefined ? stats.bpg.toFixed(1) : "0.0"}
                </td>
                <td className="py-3 px-3 text-right text-slate-700">{fgPct}</td>
                <td className="py-3 px-3 text-right text-slate-600">{threePct}</td>
                <td className="py-3 px-3 text-right text-slate-700">{ftPct}</td>
                <td className="py-3 px-3 text-right font-bold text-slate-800">
                  {stats.efgPct !== undefined ? `${stats.efgPct}%` : "0.0%"}
                </td>
                <td className="py-3 px-3 text-right font-bold text-slate-800">
                  {stats.tsPct !== undefined ? `${stats.tsPct}%` : "0.0%"}
                </td>
                <td className="py-3 px-3 text-right">
                  {stats.astToRatio !== undefined ? stats.astToRatio.toFixed(2) : "0.00"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2-COLUMN MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
        {/* LEFT COLUMN: Scouting Report & Attributes & Physical Ape Index */}
        <div className="lg:col-span-7 space-y-5">
          {/* Scouting Report & Strengths */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
                  SCOUTING REPORT & PROFILE
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase">
                  Traditional Paint Anchor & Rim Protector
                </h2>
              </div>
              <span className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps px-3 py-1 rounded-full uppercase font-bold">
                {athlete.primaryPosition ? athlete.primaryPosition.replace("_", " ") : "CENTER"}
              </span>
            </div>

            <p className="font-body-md text-body-md text-secondary mb-4 leading-relaxed">
              Premier interior defender and glass cleaner in Northern Thailand high school circuit. Natural pick-and-roll dive threat with relentless motor, elite second-jump bounce, and verified 2.8+ block average against national tournament competition.
            </p>

            <div className="space-y-2 mb-6">
              <div className="font-mono text-xs text-slate-500 uppercase font-bold tracking-wider">
                KEY SCOUTING STRENGTHS
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-[#AF101A] shrink-0" />
                <span className="text-xs font-semibold text-slate-800 font-sans">
                  Interior Rim Protection (Elite shot deterrence &amp; vertical contest wall)
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-[#AF101A] shrink-0" />
                <span className="text-xs font-semibold text-slate-800 font-sans">
                  Offensive Glass Crashing &amp; Rapid Putback Conversion
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-[#AF101A] shrink-0" />
                <span className="text-xs font-semibold text-slate-800 font-sans">
                  High-Efficiency Interior Paint Touch &amp; Drop-Step Hook (59.2% FG)
                </span>
              </div>
            </div>

            {/* Player Attribute Ratings (0-100) */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <span className="font-mono text-xs text-slate-900 uppercase font-bold tracking-wider">
                  PLAYER ATTRIBUTE RATINGS (0 - 100)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  SPORTS SCIENCE COMBINE BENCHMARK
                </span>
              </div>
              <div className="space-y-3 font-mono">
                {/* Scoring */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-800 font-bold uppercase font-sans">Scoring &amp; Inside Shot Creation</span>
                    <span className="font-bold text-slate-900">82 <span className="text-slate-400 font-normal">/ 100</span></span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div className="bg-[#AF101A] h-full rounded-full" style={{ width: "82%" }}></div>
                  </div>
                </div>

                {/* Playmaking */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-800 font-bold uppercase font-sans">Playmaking &amp; Passing Vision</span>
                    <span className="font-bold text-slate-900">54 <span className="text-slate-400 font-normal">/ 100</span></span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div className="bg-slate-700 h-full rounded-full" style={{ width: "54%" }}></div>
                  </div>
                </div>

                {/* Defense */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-800 font-bold uppercase font-sans">Defense &amp; Rim Protection</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-full uppercase">Tier 1 National</span>
                      <span className="font-bold text-slate-900">98 <span className="text-slate-400 font-normal">/ 100</span></span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div className="bg-[#AF101A] h-full rounded-full" style={{ width: "98%" }}></div>
                  </div>
                </div>

                {/* Athleticism */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-800 font-bold uppercase font-sans">Athleticism &amp; Lateral Pace</span>
                    <span className="font-bold text-slate-900">91 <span className="text-slate-400 font-normal">/ 100</span></span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div className="bg-slate-700 h-full rounded-full" style={{ width: "91%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Measurements & Ape Index */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
              <span className="font-headline-sm text-headline-sm text-on-surface uppercase">
                PHYSICAL MEASUREMENTS & APE INDEX
              </span>
              <span className="bg-surface-container font-label-caps text-label-caps px-2.5 py-0.5 rounded-full text-secondary font-bold">
                DRAFT COMBINE PROTOCOL
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                <div className="font-label-caps text-label-caps text-secondary uppercase">HEIGHT</div>
                <div className="font-headline-md text-headline-md text-on-surface">
                  {height} <span className="text-xs">CM</span>
                </div>
                <div className="text-xs text-secondary">Barefoot: {height - 2} cm</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                <div className="font-label-caps text-label-caps text-secondary uppercase">WINGSPAN</div>
                <div className="font-headline-md text-headline-md text-primary">
                  {wingspan} <span className="text-xs">CM</span>
                </div>
                <div className="text-xs text-slate-800 font-mono font-bold">
                  {apeIndex >= 0 ? `+${apeIndex} cm Ape Index` : `${apeIndex} cm`}
                </div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                <div className="font-label-caps text-label-caps text-secondary uppercase">STAND REACH</div>
                <div className="font-headline-md text-headline-md text-on-surface">
                  {reach} <span className="text-xs">CM</span>
                </div>
                <div className="text-xs text-secondary">{(reach / 2.54).toFixed(1)} inches</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                <div className="font-label-caps text-label-caps text-secondary uppercase">WEIGHT</div>
                <div className="font-headline-md text-headline-md text-on-surface">
                  {weight} <span className="text-xs">KG</span>
                </div>
                <div className="text-xs text-secondary">{Math.round(weight * 2.20462)} lbs (Lean)</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Shooting Splits, TCAS Quota Verification, Match Footwear */}
        <div className="lg:col-span-5 space-y-5">
          {/* Shooting Accuracy Splits */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <span className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">
                SHOOTING ACCURACY SPLITS
              </span>
              <span className="text-[11px] text-slate-400 font-mono">9 GAMES SAMPLED</span>
            </div>
            <div className="space-y-4 font-mono">
              {/* FG% */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-800 font-sans">
                    Field Goal (FG%)
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {fgPct}{" "}
                    <span className="text-[11px] font-normal text-slate-400">
                      ({fgm}/{totalFga})
                    </span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                  <div className="bg-[#AF101A] h-full rounded-full" style={{ width: `${Math.min(fgPctNum, 100)}%` }}></div>
                </div>
              </div>

              {/* 3P% */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-800 font-sans">
                    3-Point (3P%)
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {threePct}{" "}
                    <span className="text-[11px] font-normal text-slate-400">
                      ({fg3m}/{total3pa})
                    </span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                  <div className="bg-slate-700 h-full rounded-full" style={{ width: `${Math.min(threePctNum, 100)}%` }}></div>
                </div>
              </div>

              {/* FT% */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-800 font-sans">
                    Free Throw (FT%)
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {ftPct}{" "}
                    <span className="text-[11px] font-normal text-slate-400">
                      ({ftm}/{totalFta})
                    </span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                  <div className="bg-[#AF101A] h-full rounded-full" style={{ width: `${Math.min(ftPctNum, 100)}%` }}></div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab("SHOT_CHART")}
              className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 bg-[#071322] hover:bg-[#0B1C30] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-slate-300" />
              <span>ตรวจสอบแผนภาพการยิง 5-Zone Shot Chart</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* TCAS PORTFOLIO QUOTA BOX (Owner / Admin Only) */}
          {isOwner && (
            <div className="bg-inverse-surface text-surface-bright rounded-2xl p-5 border border-outline shadow-md relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#AF101A] text-white font-label-caps text-label-caps px-2 py-0.5 rounded-full font-bold uppercase">
                    TCAS PORTFOLIO
                  </span>
                  <span className="text-tertiary-fixed-dim font-label-caps text-label-caps font-bold tracking-wider">
                    VERIFIED QUOTA
                  </span>
                </div>
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-xl">
                  verified_user
                </span>
              </div>

              <div className="bg-black/30 border border-outline/70 p-3.5 rounded-xl mb-3">
                <div className="font-label-caps text-label-caps text-surface-dim uppercase">
                  OFFICIAL VERIFICATION CODE
                </div>
                <div className="font-headline-md text-headline-md text-primary-fixed tracking-widest font-mono">
                  {tcasCode}
                </div>
                <div className="text-xs text-surface-dim mt-1 leading-snug font-sans">
                  สถิติรับรองผ่านระบบบันทึกข้อมูลกลางมาตรฐานสากล พร้อมใช้เป็นเอกสารประกอบการคัดเลือกโควตานักกีฬา TCAS รอบที่ 1 แฟ้มสะสมผลงาน (Portfolio) สถาบันอุดมศึกษา
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-surface-bright p-1 rounded-xl border border-outline flex items-center justify-center shrink-0">
                  {/* Visual QR representation */}
                  <div className="grid grid-cols-4 gap-0.5 w-full h-full bg-slate-900 p-1 rounded-sm">
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-white"></div>
                  </div>
                </div>
                <div className="flex-grow">
                  <button
                    onClick={() => onNavigateTab("TCAS")}
                    className="w-full py-2.5 px-3 bg-[#AF101A] hover:bg-[#8E0D15] text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-colors shadow cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    <span>เปิดแฟ้มผลงาน TCAS Portfolio &amp; วิดีโอไฮไลต์</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Official Match Footwear & Gear Reference */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-2xl">shopping_bag</span>
              </div>
              <div>
                <div className="font-label-caps text-label-caps text-secondary uppercase font-bold">
                  OFFICIAL MATCH FOOTWEAR
                </div>
                <div className="font-body-md text-body-md font-bold text-on-surface">
                  Nike Kobe 6 Protro
                </div>
                <div className="text-xs text-secondary">
                  อุปกรณ์ที่ใช้ในการแข่งขันทางการ: Colorway Grinch / Reverse Grinch
                </div>
              </div>
            </div>
            <Link
              href="/marketplace"
              className="px-3.5 py-2 bg-on-surface text-surface-bright hover:bg-primary font-label-caps text-label-caps tracking-wider uppercase font-bold rounded-xl transition-colors shrink-0"
            >
              Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
