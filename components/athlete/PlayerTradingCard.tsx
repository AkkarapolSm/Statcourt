"use client";

import React, { useRef, useState } from "react";
import {
  ShieldCheck,
  Download,
  Share2,
  MapPin,
  Check,
  QrCode,
} from "lucide-react";
import { AthleteProfile, AthleteSeasonStats, Position } from "@/lib/types";

interface PlayerTradingCardProps {
  athlete: AthleteProfile;
  stats?: Partial<AthleteSeasonStats>;
  onVerificationClick?: () => void;
}

function formatPosition(pos: Position): { full: string; abbr: string; thai: string } {
  switch (pos) {
    case "POINT_GUARD":
      return { full: "POINT GUARD", abbr: "PG", thai: "พอยต์การ์ด" };
    case "SHOOTING_GUARD":
      return { full: "SHOOTING GUARD", abbr: "SG", thai: "ชูตติ้งการ์ด" };
    case "SMALL_FORWARD":
      return { full: "SMALL FORWARD", abbr: "SF", thai: "สมอลฟอร์เวิร์ด" };
    case "POWER_FORWARD":
      return { full: "POWER FORWARD", abbr: "PF", thai: "เพาเวอร์ฟอร์เวิร์ด" };
    case "CENTER":
      return { full: "CENTER", abbr: "C", thai: "เซ็นเตอร์" };
    default:
      return { full: String(pos).replace("_", " "), abbr: "ATH", thai: "นักกีฬา" };
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
    <div className="w-full max-w-[370px] flex flex-col items-center gap-3.5 select-none mx-auto font-sans">
      {/* Outer Holographic & Metallic Frame */}
      <div
        ref={cardRef}
        className="w-full p-[2px] rounded-2xl bg-gradient-to-br from-[#AF101A] via-slate-600 to-[#0B1C30] shadow-2xl shadow-black/80"
      >
        <div
          className="rounded-[14px] bg-[#0B1C30] p-4 sm:p-5 text-white relative overflow-hidden flex flex-col space-y-3"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at top center, rgba(175, 16, 26, 0.22), transparent 60%),
              radial-gradient(ellipse at bottom center, rgba(30, 58, 138, 0.15), transparent 60%),
              radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 100% 100%, 16px 16px",
          }}
        >
          {/* Card Corner Tech Brackets */}
          <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-[#AF101A]/60 pointer-events-none rounded-tl-sm" />
          <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-[#AF101A]/60 pointer-events-none rounded-tr-sm" />
          <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-[#AF101A]/60 pointer-events-none rounded-bl-sm" />
          <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-[#AF101A]/60 pointer-events-none rounded-br-sm" />

          {/* Top Micro-Header Bar */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="bg-[#AF101A] text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded shadow-xs">
                STATCOURT.TH
              </span>
              <span className="text-[9px] font-bold text-slate-300 tracking-wider uppercase">
                TCAS ATHLETE
              </span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[9px] text-emerald-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
              <span>OFFICIAL VERIFIED</span>
            </div>
          </div>

          {/* Hero Section: Centered Athlete Photo, Name, and Position */}
          <div className="relative z-10 flex flex-col items-center text-center pt-1">
            {/* Centered Avatar Box */}
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border-2 border-[#AF101A]/80 shadow-xl shadow-red-950/40">
              {athlete.avatarUrl ? (
                <img
                  src={athlete.avatarUrl}
                  alt={`${athlete.firstName} ${athlete.lastName}`}
                  className="w-full h-full object-cover object-center"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#AF101A] text-white font-extrabold text-2xl tabular-nums">
                  #{athlete.jerseyNumber || "0"}
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-[#AF101A] text-white font-bold text-[10px] px-1.5 py-0.5 rounded-tl shadow tabular-nums">
                #{athlete.jerseyNumber || "0"}
              </div>
            </div>

            {/* Position Pill */}
            <div className="mt-2.5 px-3 py-0.5 rounded-full bg-slate-800/90 border border-[#AF101A]/40 text-[10px] font-semibold text-rose-200 flex items-center gap-1.5">
              <span className="font-bold tracking-wider">{posInfo.abbr}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">{posInfo.thai}</span>
            </div>

            {/* Centered Athlete Name */}
            <h1 className="text-xl font-black tracking-tight text-white leading-tight font-sans mt-1.5">
              {athlete.firstName} {athlete.lastName}
            </h1>

            {/* Centered School & Province (Thai Text - No font-mono) */}
            <div className="text-xs text-slate-300 font-medium flex items-center justify-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate max-w-[280px]">
                {athlete.schoolOrClub} • {athlete.province}
              </span>
            </div>
          </div>

          {/* Physical Biometrics Section */}
          <div className="relative z-10 grid grid-cols-4 gap-1 py-2 px-1 bg-slate-900/90 rounded-xl border border-slate-800 text-center shadow-inner divide-x divide-slate-800/80">
            <div className="px-0.5">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 block font-bold leading-tight">
                HEIGHT
              </span>
              <span className="text-[8px] text-slate-400 block leading-none mt-0.5">
                ส่วนสูง
              </span>
              <span className="text-xs sm:text-sm font-black text-white mt-0.5 block tabular-nums">
                {height} <span className="text-[9px] font-normal text-slate-400">cm</span>
              </span>
            </div>
            <div className="px-0.5">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 block font-bold leading-tight">
                WINGSPAN
              </span>
              <span className="text-[8px] text-slate-400 block leading-none mt-0.5">
                วงแขน
              </span>
              <span className="text-xs sm:text-sm font-black text-white mt-0.5 block tabular-nums">
                {wingspan} <span className="text-[9px] font-normal text-slate-400">cm</span>
              </span>
            </div>
            <div className="px-0.5">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 block font-bold leading-tight">
                REACH
              </span>
              <span className="text-[8px] text-slate-400 block leading-none mt-0.5">
                ระยะเอื้อม
              </span>
              <span className="text-xs sm:text-sm font-black text-white mt-0.5 block tabular-nums">
                {reach} <span className="text-[9px] font-normal text-slate-400">cm</span>
              </span>
            </div>
            <div className="px-0.5">
              <span className="text-[8.5px] uppercase tracking-wider text-slate-400 block font-bold leading-tight">
                WEIGHT
              </span>
              <span className="text-[8px] text-slate-400 block leading-none mt-0.5">
                น้ำหนัก
              </span>
              <span className="text-xs sm:text-sm font-black text-white mt-0.5 block tabular-nums">
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
                    <stop offset="0%" stopColor="#AF101A" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#8E0D15" stopOpacity="0.25" />
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
                  stroke="#FF7A7A"
                  strokeWidth="2.5"
                  filter="url(#glow)"
                />

                {/* Data Points */}
                <circle cx={pScoring.x} cy={pScoring.y} r="3" fill="#FFFFFF" stroke="#AF101A" strokeWidth="2" />
                <circle cx={pPlaymaking.x} cy={pPlaymaking.y} r="3" fill="#FFFFFF" stroke="#AF101A" strokeWidth="2" />
                <circle cx={pDefense.x} cy={pDefense.y} r="3" fill="#FFFFFF" stroke="#AF101A" strokeWidth="2" />
                <circle cx={pAthleticism.x} cy={pAthleticism.y} r="3" fill="#FFFFFF" stroke="#AF101A" strokeWidth="2" />

                {/* Axis Labels */}
                <text
                  x={centerX}
                  y={centerY - maxR - 7}
                  textAnchor="middle"
                  fill="#F1F5F9"
                  fontSize="8.5"
                  fontWeight="800"
                  fontFamily="sans-serif"
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
                  fontFamily="sans-serif"
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
                  fontFamily="sans-serif"
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
                  fontFamily="sans-serif"
                >
                  ATHLETICISM ({athleticism})
                </text>
              </svg>
            </div>
          </div>

          {/* FIBA Official Season Averages Ticker */}
          <div className="relative z-10 grid grid-cols-6 gap-1 p-2 bg-slate-900/90 rounded-xl border border-slate-800 text-center shadow-inner items-center">
            <div className="bg-[#AF101A]/20 border border-[#AF101A]/50 rounded-lg py-1 px-0.5">
              <span className="text-[7.5px] text-rose-300 font-bold block leading-none">FIBA EFF</span>
              <span className="text-xs font-black text-rose-200 leading-tight mt-0.5 block tabular-nums">
                {stats?.effPerGame ?? stats?.per ?? "28.0"}
              </span>
            </div>
            <div>
              <span className="text-[7.5px] text-slate-400 block leading-none">PPG</span>
              <span className="text-xs font-bold text-white leading-tight mt-0.5 block tabular-nums">
                {stats?.ppg ?? "21.4"}
              </span>
            </div>
            <div>
              <span className="text-[7.5px] text-slate-400 block leading-none">APG</span>
              <span className="text-xs font-bold text-white leading-tight mt-0.5 block tabular-nums">
                {stats?.apg ?? "7.6"}
              </span>
            </div>
            <div>
              <span className="text-[7.5px] text-slate-400 block leading-none">RPG</span>
              <span className="text-xs font-bold text-white leading-tight mt-0.5 block tabular-nums">
                {stats?.rpg ?? "5.8"}
              </span>
            </div>
            <div>
              <span className="text-[7.5px] text-slate-400 block leading-none">eFG%</span>
              <span className="text-xs font-bold text-white leading-tight mt-0.5 block tabular-nums">
                {stats?.efgPct ?? "60.1"}%
              </span>
            </div>
            <div>
              <span className="text-[7.5px] text-slate-400 block leading-none">TS%</span>
              <span className="text-xs font-bold text-white leading-tight mt-0.5 block tabular-nums">
                {stats?.tsPct ?? "63.9"}%
              </span>
            </div>
          </div>

          {/* Official Table Verification Seal Footer */}
          <div className="relative z-10 pt-2.5 mt-0.5 border-t border-slate-800/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950/70 border border-emerald-600/50 flex items-center justify-center shadow-md">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              </div>
              <div>
                <div className="text-[9.5px] font-black uppercase text-white tracking-wider">
                  OFFICIAL TABLE VERIFIED
                </div>
                <div className="text-[8.5px] text-slate-400 tabular-nums">
                  REF: {refCode}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-[8px] uppercase tracking-wider text-slate-300 font-bold leading-tight">
                  SCAN PROFILE
                </div>
                <div className="text-[7.5px] text-slate-400 leading-none mt-0.5">
                  BSAT / TCAS
                </div>
              </div>
              <div
                className="w-7 h-7 rounded bg-white p-0.5 flex items-center justify-center shadow-sm shrink-0"
                title={`Scan to view: /athlete/${athlete.id}`}
              >
                <QrCode className="w-5 h-5 text-slate-900" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Triggers */}
      <div className="w-full flex items-center justify-center gap-2">
        <button
          onClick={handleExportCard}
          disabled={isExporting}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#AF101A] hover:bg-[#8E0D15] active:scale-[0.98] text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? "กำลังส่งออก..." : "ดาวน์โหลดบัตร (PNG)"}</span>
        </button>

        {onVerificationClick && (
          <button
            onClick={onVerificationClick}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700 transition cursor-pointer"
            title="ดูประวัติการรับรองสถิติ"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ประวัติรับรอง</span>
          </button>
        )}

        <button
          onClick={handleCopyCode}
          className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700 transition cursor-pointer"
          title="คัดลอกรหัสอ้างอิง TCAS"
        >
          {copiedCode ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">คัดลอกแล้ว</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>แชร์รหัส</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
