"use client";

import React, { useRef, useState } from "react";
import {
  ShieldCheck,
  Download,
  Share2,
  MapPin,
  Check,
} from "lucide-react";
import { AthleteProfile, AthleteSeasonStats, Position } from "@/lib/types";

interface PlayerTradingCardProps {
  athlete: AthleteProfile;
  stats?: Partial<AthleteSeasonStats>;
  onVerificationClick?: () => void;
}

function formatPosition(pos: Position): { full: string; abbr: string } {
  switch (pos) {
    case "POINT_GUARD":
      return { full: "POINT GUARD", abbr: "PG" };
    case "SHOOTING_GUARD":
      return { full: "SHOOTING GUARD", abbr: "SG" };
    case "SMALL_FORWARD":
      return { full: "SMALL FORWARD", abbr: "SF" };
    case "POWER_FORWARD":
      return { full: "POWER FORWARD", abbr: "PF" };
    case "CENTER":
      return { full: "CENTER", abbr: "C" };
    default:
      return { full: String(pos).replace("_", " "), abbr: "ATH" };
  }
}

export default function PlayerTradingCard({
  athlete,
  stats,
  onVerificationClick,
}: PlayerTradingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Radar metrics (0 - 100)
  const scoring = stats?.scoringRating ?? 82;
  const playmaking = stats?.playmakingRating ?? 54;
  const defense = stats?.defenseRating ?? 98;
  const athleticism = stats?.athleticismRating ?? 91;

  // Radar Chart geometry calibrated for 250x150 viewBox
  const centerX = 125;
  const centerY = 75;
  const maxR = 42;

  // 4 points
  const pScoring = { x: centerX, y: centerY - (scoring / 100) * maxR };
  const pPlaymaking = { x: centerX + (playmaking / 100) * maxR, y: centerY };
  const pDefense = { x: centerX, y: centerY + (defense / 100) * maxR };
  const pAthleticism = { x: centerX - (athleticism / 100) * maxR, y: centerY };

  const radarPolygonPoints = `${pScoring.x},${pScoring.y} ${pPlaymaking.x},${pPlaymaking.y} ${pDefense.x},${pDefense.y} ${pAthleticism.x},${pAthleticism.y}`;

  const posInfo = formatPosition(athlete.primaryPosition);
  const refCode = athlete.tcasReferenceCode || `STC-2026-${athlete.id.toUpperCase()}`;

  // Export Card trigger using html2canvas
  const handleExportCard = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#070B14",
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${athlete.firstName}_${athlete.lastName}_StatCourtTH_Card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export card failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCode = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(refCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const height = athlete.heightCm || 185;
  const wingspan = athlete.wingspanCm || Math.round(height * 1.04);
  const reach = athlete.standingReachCm || Math.round(height * 1.3);
  const weight = athlete.weightKg || 78;

  return (
    <div className="w-full max-w-[370px] flex flex-col items-center gap-3.5 select-none mx-auto">
      {/* Outer Holographic & Metallic Frame */}
      <div
        ref={cardRef}
        className="w-full p-[2px] rounded-2xl bg-gradient-to-br from-red-600/70 via-slate-600/70 to-slate-800 shadow-2xl shadow-black/80"
      >
        <div
          className="rounded-[14px] bg-gradient-to-b from-[#090D18] via-[#0F172A] to-[#070B14] p-4 sm:p-5 text-white relative overflow-hidden flex flex-col space-y-3"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at top center, rgba(220, 38, 38, 0.18), transparent 60%),
              radial-gradient(ellipse at bottom center, rgba(59, 130, 246, 0.1), transparent 60%),
              radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 100% 100%, 16px 16px",
          }}
        >
          {/* Card Corner Tech Brackets */}
          <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-red-500/50 pointer-events-none rounded-tl-sm" />
          <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-red-500/50 pointer-events-none rounded-tr-sm" />
          <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-red-500/50 pointer-events-none rounded-bl-sm" />
          <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-red-500/50 pointer-events-none rounded-br-sm" />

          {/* Top Micro-Header Bar */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="bg-brand-primary text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded font-mono shadow-sm">
                STATCOURT.TH
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-300 tracking-wider uppercase">
                TCAS ATHLETE
              </span>
            </div>
            <div className="flex items-center gap-1 bg-[#AF101A]/20 border border-[#AF101A]/60 px-1.5 py-0.5 rounded text-[8.5px] font-mono text-red-200 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
              <span>OFFICIAL VERIFIED</span>
            </div>
          </div>

          {/* Hero Section: Centered Athlete Photo, Name, and Position */}
          <div className="relative z-10 flex flex-col items-center text-center pt-1">
            {/* Centered Avatar Box */}
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border-2 border-red-500/80 shadow-xl shadow-red-950/50">
              {athlete.avatarUrl ? (
                <img
                  src={athlete.avatarUrl}
                  alt={`${athlete.firstName} ${athlete.lastName}`}
                  className="w-full h-full object-cover object-center"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-primary text-white font-mono font-black text-2xl">
                  #{athlete.jerseyNumber || "0"}
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-brand-primary text-white font-mono font-black text-[10px] px-1.5 py-0.5 rounded-tl shadow">
                #{athlete.jerseyNumber || "0"}
              </div>
            </div>

            {/* Position Pill */}
            <div className="mt-2 px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-red-500/40 text-[9.5px] font-mono font-bold text-red-300 uppercase tracking-wider">
              {posInfo.full}
            </div>

            {/* Centered Athlete Name */}
            <h1 className="text-xl font-black tracking-tight text-white leading-tight font-sans mt-1.5">
              {athlete.firstName} {athlete.lastName}
            </h1>

            {/* Centered School & Province */}
            <div className="text-xs text-slate-300 font-medium flex items-center justify-center gap-1 mt-0.5 font-mono">
              <MapPin className="w-3 h-3 text-brand-primary shrink-0" />
              <span className="truncate max-w-[280px]">
                {athlete.schoolOrClub} • {athlete.province}
              </span>
            </div>
          </div>

          {/* Physical Biometrics Section */}
          <div className="relative z-10 grid grid-cols-4 gap-1 py-1.5 px-1 bg-slate-900/90 rounded-xl border border-slate-800 text-center font-mono shadow-inner divide-x divide-slate-800/80">
            <div className="px-0.5">
              <span className="text-[8.5px] uppercase tracking-widest text-slate-400 block font-semibold">
                HEIGHT
              </span>
              <span className="text-xs sm:text-sm font-black text-white">
                {height} <span className="text-[9px] font-normal text-slate-400">cm</span>
              </span>
            </div>
            <div className="px-0.5">
              <span className="text-[8.5px] uppercase tracking-widest text-slate-400 block font-semibold">
                WINGSPAN
              </span>
              <span className="text-xs sm:text-sm font-black text-white">
                {wingspan} <span className="text-[9px] font-normal text-slate-400">cm</span>
              </span>
            </div>
            <div className="px-0.5">
              <span className="text-[8.5px] uppercase tracking-widest text-slate-400 block font-semibold">
                REACH
              </span>
              <span className="text-xs sm:text-sm font-black text-white">
                {reach} <span className="text-[9px] font-normal text-slate-400">cm</span>
              </span>
            </div>
            <div className="px-0.5">
              <span className="text-[8.5px] uppercase tracking-widest text-slate-400 block font-semibold">
                WEIGHT
              </span>
              <span className="text-xs sm:text-sm font-black text-white">
                {weight} <span className="text-[9px] font-normal text-slate-400">kg</span>
              </span>
            </div>
          </div>

          {/* Centered 4-Axis Skill Diamond Radar Chart */}
          <div className="relative z-10 flex flex-col items-center justify-center my-0.5">
            <div className="relative w-full max-w-[250px] h-[150px]">
              <svg
                viewBox="0 0 250 150"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#991B1B" stopOpacity="0.25" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Grid Rings */}
                {[0.25, 0.5, 0.75, 1.0].map((level) => {
                  const r = maxR * level;
                  return (
                    <polygon
                      key={level}
                      points={`${centerX},${centerY - r} ${centerX + r},${centerY} ${centerX},${centerY + r} ${centerX - r},${centerY}`}
                      fill="none"
                      stroke={level === 1.0 ? "#475569" : "#1E293B"}
                      strokeWidth={level === 1.0 ? "1.2" : "0.9"}
                      strokeDasharray={level === 1.0 ? "none" : "2 2"}
                    />
                  );
                })}

                {/* Axis Crosshairs */}
                <line
                  x1={centerX}
                  y1={centerY - maxR}
                  x2={centerX}
                  y2={centerY + maxR}
                  stroke="#334155"
                  strokeWidth="1"
                />
                <line
                  x1={centerX - maxR}
                  y1={centerY}
                  x2={centerX + maxR}
                  y2={centerY}
                  stroke="#334155"
                  strokeWidth="1"
                />

                {/* Player Data Polygon */}
                <polygon
                  points={radarPolygonPoints}
                  fill="url(#radarFill)"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  filter="url(#glow)"
                />

                {/* Data Points */}
                <circle cx={pScoring.x} cy={pScoring.y} r="3" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2" />
                <circle cx={pPlaymaking.x} cy={pPlaymaking.y} r="3" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2" />
                <circle cx={pDefense.x} cy={pDefense.y} r="3" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2" />
                <circle cx={pAthleticism.x} cy={pAthleticism.y} r="3" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2" />

                {/* Axis Labels */}
                <text
                  x={centerX}
                  y={centerY - maxR - 7}
                  textAnchor="middle"
                  fill="#F1F5F9"
                  fontSize="8.5"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  SCORING ({scoring})
                </text>

                <text
                  x={centerX + maxR + 8}
                  y={centerY + 3}
                  textAnchor="start"
                  fill="#F1F5F9"
                  fontSize="8.5"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  PLAYMAKING ({playmaking})
                </text>

                <text
                  x={centerX}
                  y={centerY + maxR + 15}
                  textAnchor="middle"
                  fill="#F1F5F9"
                  fontSize="8.5"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  DEFENSE ({defense})
                </text>

                <text
                  x={centerX - maxR - 8}
                  y={centerY + 3}
                  textAnchor="end"
                  fill="#F1F5F9"
                  fontSize="8.5"
                  fontWeight="800"
                  fontFamily="monospace"
                >
                  ATHLETICISM ({athleticism})
                </text>
              </svg>
            </div>
          </div>

          {/* FIBA Official Season Averages Ticker */}
          <div className="relative z-10 grid grid-cols-6 gap-1 p-1.5 bg-slate-900/90 rounded-xl border border-slate-800 text-center font-mono shadow-inner items-center">
            <div className="bg-brand-primary/15 border border-brand-primary/40 rounded-lg py-1 px-0.5">
              <span className="text-[7.5px] text-red-400 font-bold block leading-none">FIBA EFF</span>
              <span className="text-xs font-black text-brand-primary leading-tight mt-0.5 block">
                {stats?.effPerGame ?? stats?.per ?? "28.0"}
              </span>
            </div>
            <div>
              <span className="text-[7.5px] text-slate-400 block leading-none">PPG</span>
              <span className="text-xs font-bold text-white leading-tight mt-0.5 block">
                {stats?.ppg ?? "21.4"}
              </span>
            </div>
            <div>
              <span className="text-[7.5px] text-slate-400 block leading-none">APG</span>
              <span className="text-xs font-bold text-white leading-tight mt-0.5 block">
                {stats?.apg ?? "7.6"}
              </span>
            </div>
            <div>
              <span className="text-[7.5px] text-slate-400 block leading-none">RPG</span>
              <span className="text-xs font-bold text-white leading-tight mt-0.5 block">
                {stats?.rpg ?? "5.8"}
              </span>
            </div>
            <div>
              <span className="text-[7.5px] text-slate-400 block leading-none">eFG%</span>
              <span className="text-xs font-bold text-white leading-tight mt-0.5 block">
                {stats?.efgPct ?? "60.1"}%
              </span>
            </div>
            <div>
              <span className="text-[7.5px] text-slate-400 block leading-none">TS%</span>
              <span className="text-xs font-bold text-white leading-tight mt-0.5 block">
                {stats?.tsPct ?? "63.9"}%
              </span>
            </div>
          </div>

          {/* Official Table Verification Seal Footer */}
          <div className="relative z-10 pt-2.5 mt-0.5 border-t border-slate-800/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md">
                <ShieldCheck className="w-4 h-4 text-[#DC2626]" />
              </div>
              <div>
                <div className="text-[9.5px] font-black uppercase text-white font-mono tracking-wider">
                  OFFICIAL TABLE VERIFIED
                </div>
                <div className="text-[8.5px] text-slate-400 font-mono tracking-tight">
                  REF: {refCode}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex items-center gap-0.5 h-2.5 opacity-60">
                <span className="w-0.5 h-full bg-slate-400" />
                <span className="w-1 h-full bg-slate-400" />
                <span className="w-0.5 h-full bg-slate-500" />
                <span className="w-1.5 h-full bg-slate-400" />
                <span className="w-0.5 h-full bg-slate-400" />
                <span className="w-1 h-full bg-slate-500" />
                <span className="w-0.5 h-full bg-slate-400" />
              </div>
              <span className="text-[8px] uppercase tracking-wider text-slate-400 font-mono font-semibold mt-0.5">
                BSAT / THAI TABLE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Triggers */}
      <div className="w-full flex items-center justify-center gap-2">
        <button
          onClick={handleExportCard}
          disabled={isExporting}
          className="flex-1 flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-red-700 text-white font-bold font-mono text-xs py-2 px-3 rounded-xl shadow-md transition disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? "EXPORTING..." : "EXPORT PNG"}</span>
        </button>

        {onVerificationClick && (
          <button
            onClick={onVerificationClick}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold py-2 px-3 rounded-xl border border-slate-700 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>LOGS</span>
          </button>
        )}

        <button
          onClick={handleCopyCode}
          className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold py-2 px-3 rounded-xl border border-slate-700 transition"
          title="Copy TCAS Reference Code"
        >
          {copiedCode ? (
            <>
              <Check className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400 font-bold">COPIED</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>SHARE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
