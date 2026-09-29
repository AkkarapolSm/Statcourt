"use client";

import React, { useState, useMemo } from "react";
import { Check, X } from "lucide-react";
import { AthleteProfile, AthleteSeasonStats } from "@/lib/types";
import TcasDossierPdfModal from "./TcasDossierPdfModal";

interface AthleteTcasPortfolioProps {
  athlete: AthleteProfile;
  stats: AthleteSeasonStats;
  isPro?: boolean;
  onOpenPricing?: () => void;
}

export interface HighlightPlay {
  id: string;
  title: string;
  description: string;
  quarterClock: string;
  opponent: string;
  durationSec: number;
  badge1: string;
  badge1Color: string;
  badge2?: string;
  badge2Color?: string;
  category: "CLUTCH" | "SCORE" | "BLOCK" | "TRANSITION";
  matchId: string;
  videoUrl?: string;
}

export default function AthleteTcasPortfolio({
  athlete,
  stats,
  isPro = true,
  onOpenPricing,
}: AthleteTcasPortfolioProps) {
  // State for Highlight Reel Compiler
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([
    "clip-1",
    "clip-3",
    "clip-4",
    "clip-7",
  ]);
  const [selectedTournament, setSelectedTournament] = useState("ALL");
  const [selectedMatch, setSelectedMatch] = useState("ALL");
  const [activeCategory, setActiveCategory] = useState<"ALL" | "CLUTCH" | "SCORE" | "BLOCK" | "TRANSITION">("ALL");
  const [compileState, setCompileState] = useState<"IDLE" | "COMPILING" | "SUCCESS">("IDLE");
  const [exportPdfNotice, setExportPdfNotice] = useState<string | null>(null);
  const [previewClip, setPreviewClip] = useState<HighlightPlay | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const plays: HighlightPlay[] = useMemo(() => [
    {
      id: "clip-1",
      title: "การยิงทำคะแนนตัดสินเกมช่วง 1.5 วินาทีสุดท้าย (Buzzer Beater)",
      description: "จังหวะรีบาวด์เกมรุกแล้วยิงทำคะแนนเฉือนชนะทีมโรงเรียนเทพศิรินทร์ ด้วยคะแนน 78-76 ใน 1.5 วินาทีสุดท้าย คว้าตำแหน่งชนะเลิศระดับประเทศ",
      quarterClock: "Q4 • 00:01",
      opponent: "เทพศิรินทร์ [Debsirin]",
      durationSec: 15,
      badge1: "BUZZER BEATER",
      badge1Color: "bg-primary text-on-primary",
      badge2: "CLUTCH",
      badge2Color: "bg-tertiary-fixed text-on-tertiary-fixed",
      category: "CLUTCH",
      matchId: "match-deb",
    },
    {
      id: "clip-2",
      title: "การดังก์ทำคะแนนจากจังหวะ Pick & Roll ในควอเตอร์ที่ 3",
      description: "ขับเคลื่อนเข้าทำคะแนนด้วยการดังก์สองมืออย่างเฉียบคม จากจังหวะสกรีนเปิดช่องว่างใต้แป้น",
      quarterClock: "Q3 • 05:40",
      opponent: "กท.คริสเตียน [BCC]",
      durationSec: 10,
      badge1: "DUNK / POST OFFENSE",
      badge1Color: "bg-surface-container-highest text-on-surface",
      category: "SCORE",
      matchId: "match-bcc",
    },
    {
      id: "clip-3",
      title: "การยิง 3 คะแนนช่วงท้ายเกม (Trail 3PT)",
      description: "เติมเกมขึ้นมายิง 3 คะแนนจากแนวนอกหัวกะโหลก แสดงศักยภาพความแม่นยำระยะไกลของผู้เล่นตำแหน่งเซ็นเตอร์สมัยใหม่",
      quarterClock: "Q4 • 02:11",
      opponent: "สวนกุหลาบฯ [SK]",
      durationSec: 14,
      badge1: "3-POINT TRAIL SHOT",
      badge1Color: "bg-primary text-on-primary",
      category: "SCORE",
      matchId: "match-sk",
    },
    {
      id: "clip-4",
      title: "การเก็บบอลรีบาวด์เกมรุกและซ้ำคะแนนจังหวะสอง (Putback)",
      description: "แย่งบอลรีบาวด์เกมรุกต่อเนื่อง พร้อมกระโดดซ้ำจังหวะสองและได้ฟาวล์ทำคะแนน (And-One)",
      quarterClock: "Q3 • 07:22",
      opponent: "กรุงเทพคริสเตียน [BCC]",
      durationSec: 17,
      badge1: "OFFENSIVE REBOUND & PUTBACK",
      badge1Color: "bg-primary text-on-primary",
      category: "SCORE",
      matchId: "match-bcc",
    },
    {
      id: "clip-5",
      title: "การวิ่งไล่บล็อกลูกยิงจากด้านหลังในจังหวะโต้กลับเร็ว (Chasedown Block)",
      description: "วิ่งสปรินต์จากแดนหลังเข้ากระโดดบล็อกลูกเลย์อัพชนแป้นในจังหวะโต้กลับเร็วของคู่แข่ง",
      quarterClock: "Q2 • 06:15",
      opponent: "กรุงเทพคริสเตียน [BCC]",
      durationSec: 11,
      badge1: "CHASEDOWN BLOCK",
      badge1Color: "bg-surface-container-highest text-on-surface",
      category: "BLOCK",
      matchId: "match-bcc",
    },
    {
      id: "clip-6",
      title: "ทักษะฟุตเวิร์กและการหมุนตัวทำคะแนนใต้แป้น (Post Drop Step)",
      description: "ทักษะการเล่นโพสต์ระดับมาตรฐาน หมุนตัวเข้าหาแป้นพร้อมจบการทำคะแนนด้วยมือขวาเหนือผู้เล่นป้องกันสองคน",
      quarterClock: "Q1 • 03:50",
      opponent: "เทพศิรินทร์ [Debsirin]",
      durationSec: 13,
      badge1: "POST DROP STEP",
      badge1Color: "bg-surface-container-highest text-on-surface",
      badge2: "FOOTWORK",
      badge2Color: "bg-tertiary-fixed text-on-tertiary-fixed",
      category: "SCORE",
      matchId: "match-deb",
    },
    {
      id: "clip-7",
      title: "การเก็บบอลรีบาวด์เกมรับและป้องกันคะแนนสำคัญช่วง 20 วินาทีสุดท้าย",
      description: "อ่านทิศทางลูกบอลและกระโดดป้องกันพร้อมครอบครองบอล ยับยั้งโอกาสทำคะแนนตีเสมอของฝ่ายตรงข้าม",
      quarterClock: "Q4 • 00:20",
      opponent: "สวนกุหลาบฯ [SK]",
      durationSec: 12,
      badge1: "CLUTCH DEFENSE",
      badge1Color: "bg-primary text-on-primary",
      badge2: "KEY RECOVERY",
      badge2Color: "bg-tertiary-fixed text-on-tertiary-fixed",
      category: "CLUTCH",
      matchId: "match-sk",
    },
    {
      id: "clip-8",
      title: "การจ่ายบอลเปิดเกมยาวข้ามแดน (Outlet Pass)",
      description: "เก็บบอลรีบาวด์เกมรับแล้วจ่ายบอลยาวข้ามแดนให้เพื่อนร่วมทีมทำคะแนนเลย์อัปได้อย่างแม่นยำ",
      quarterClock: "Q2 • 08:30",
      opponent: "อัสสัมชัญ [Assumption]",
      durationSec: 9,
      badge1: "PASSING / OUTLET",
      badge1Color: "bg-surface-container-highest text-on-surface",
      category: "TRANSITION",
      matchId: "match-ac",
    },
  ], []);

  // Filtered plays based on category & match
  const filteredPlays = useMemo(() => {
    return plays.filter((p) => {
      if (activeCategory !== "ALL" && p.category !== activeCategory) return false;
      if (selectedMatch !== "ALL" && p.matchId !== selectedMatch) return false;
      return true;
    });
  }, [plays, activeCategory, selectedMatch]);

  // Compute total duration of currently selected clips
  const totalDuration = useMemo(() => {
    return plays
      .filter((p) => selectedClipIds.includes(p.id))
      .reduce((sum, p) => sum + p.durationSec, 0);
  }, [plays, selectedClipIds]);

  const toggleClip = (id: string) => {
    if (selectedClipIds.includes(id)) {
      setSelectedClipIds(selectedClipIds.filter((item) => item !== id));
    } else {
      setSelectedClipIds([...selectedClipIds, id]);
    }
  };

  const handleCompile = () => {
    setCompileState("COMPILING");
    setTimeout(() => {
      setCompileState("SUCCESS");
      setTimeout(() => {
        setCompileState("IDLE");
      }, 3500);
    }, 1500);
  };

  const handleExportPdf = () => {
    setIsPdfModalOpen(true);
  };

  const currentHeightCm = athlete.heightCm || 185;
  const currentWingspanCm = athlete.wingspanCm || Math.round(currentHeightCm * 1.04);
  const currentStandingReachCm = athlete.standingReachCm || Math.round(currentHeightCm * 1.32);

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------------- */}
      {/* SECTION A: TCAS University Sports Quota Portfolio (Official Dossier)    */}
      {/* ----------------------------------------------------------------------- */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 md:p-6 shadow-sm">
        {/* Dossier Header & Export CTA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="material-symbols-outlined text-tertiary text-2xl">military_tech</span>
              <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-wide">
                TCAS UNIVERSITY SPORTS QUOTA PORTFOLIO (OFFICIAL DOSSIER)
              </h2>
              <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-label-caps uppercase rounded font-bold border border-tertiary">
                TCAS ROUND 2 QUALIFIED
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary mt-1">
              เอกสารรับรองข้อมูลสถิติทางการ สมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT) สำหรับประกอบการยื่นคัดเลือกโควตานักกีฬาและทุนการศึกษา สถาบันอุดมศึกษา
            </p>
          </div>

          {/* Official Export Button */}
          <button
            onClick={handleExportPdf}
            className="w-full md:w-auto px-5 py-2.5 bg-primary hover:bg-surface-tint active:scale-95 text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider rounded flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-xl">download</span>
            <span>ดาวน์โหลดแฟ้มเอกสาร TCAS DOSSIER (PDF)</span>
          </button>
        </div>

        {exportPdfNotice && (
          <div className="mt-3 p-2.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold animate-fadeIn flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{exportPdfNotice}</span>
          </div>
        )}

        {/* Dossier Bento Grid (4 Technical Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {/* Card 1: Official Bio & Physical Index */}
          <div className="bg-surface-container-low border border-outline-variant rounded p-4 relative flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-primary">badge</span>
                  1. ข้อมูลส่วนบุคคลและสรีระ (Biometrics)
                </span>
                <span className="font-label-badge text-label-badge px-1 bg-surface-container text-on-surface rounded font-bold">
                  U18 [2025]
                </span>
              </div>
              <div className="space-y-1 font-body-sm text-body-sm">
                <div className="text-on-surface font-semibold">
                  ชื่อ-สกุล: {athlete.firstName} {athlete.lastName}
                </div>
                <div className="text-secondary text-xs">
                  โรงเรียน: {athlete.schoolOrClub || "Chiang Mai University Demonstration School"}
                </div>
                <div className="text-on-surface">
                  ส่วนสูง / ช่วงแขน: <span className="font-bold text-primary">{currentHeightCm} cm / {currentWingspanCm} cm</span>
                </div>
                <div className="text-on-surface">
                  ระยะเอื้อมยืนแตะ: <span className="font-bold">{currentStandingReachCm} cm</span>
                </div>
              </div>
            </div>
            <div className="pt-2 mt-3 border-t border-outline-variant/60 font-label-badge text-label-badge text-secondary flex justify-between">
              <span>FIBA REG: TH-2024-8891</span>
              <span className="text-primary font-bold">VERIFIED</span>
            </div>
          </div>

          {/* Card 2: National & Tournament Honors */}
          <div className="bg-surface-container-low border border-outline-variant rounded p-4 relative flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-tertiary">emoji_events</span>
                  2. เกียรติประวัติและผลงานการแข่งขัน
                </span>
                <span className="font-label-badge text-label-badge px-1 bg-tertiary-fixed text-on-tertiary-fixed rounded font-bold">
                  CHAMPION
                </span>
              </div>
              <ul className="space-y-1.5 font-body-sm text-body-sm text-on-surface text-xs">
                <li className="flex items-start gap-1">
                  <span className="material-symbols-outlined text-[15px] text-tertiary shrink-0 mt-0.5">trophy</span>
                  <span>ชนะเลิศการแข่งขันบาสเกตบอลเยาวชนชิงชนะเลิศแห่งประเทศไทย U18 (BSAT)</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="material-symbols-outlined text-[15px] text-primary shrink-0 mt-0.5">star</span>
                  <span>รางวัลผู้เล่นตำแหน่งเซ็นเตอร์ยอดเยี่ยมแห่งปี 2567</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="material-symbols-outlined text-[15px] text-secondary shrink-0 mt-0.5">check_circle</span>
                  <span>รองชนะเลิศอันดับ 1 การแข่งขันกีฬานักเรียน กรมพลศึกษา</span>
                </li>
              </ul>
            </div>
            <div className="pt-2 mt-3 border-t border-outline-variant/60 font-label-badge text-label-badge text-secondary">
              <span>Official BSAT Quota Endorsement #B8802</span>
            </div>
          </div>

          {/* Card 3: FIBA Efficiency & Metrics */}
          <div className="bg-surface-container-low border border-outline-variant rounded p-4 relative flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-primary">monitoring</span>
                  3. ดัชนีสถิติเฉลี่ยมาตรฐานสากล (FIBA Metrics)
                </span>
                <span className="font-label-badge text-label-badge px-1 bg-primary text-on-primary rounded font-bold">
                  TOP 1%
                </span>
              </div>
              <div className="space-y-1 font-body-sm text-body-sm">
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-xs">FIBA EFF:</span>
                  <span className="font-headline-sm text-headline-sm text-primary">29.6 EFF/G</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-xs">PTS/TO:</span>
                  <span className="font-headline-sm text-sm text-on-surface font-bold">19.1 PPG (14.2%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-xs">REBOUNDS:</span>
                  <span className="font-headline-sm text-sm text-on-surface font-bold">14.2 RPG</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-xs">BLOCKS:</span>
                  <span className="font-headline-sm text-sm text-on-surface font-bold">3.1 BPG</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-xs">TRUE SHOOTING:</span>
                  <span className="font-headline-sm text-sm text-tertiary font-bold">63.4%</span>
                </div>
              </div>
            </div>
            <div className="pt-2 mt-3 border-t border-outline-variant/60 font-label-badge text-label-badge text-secondary flex justify-between">
              <span>PERCENTILE: 99.2%</span>
              <span className="text-primary font-bold">ELITE POST</span>
            </div>
          </div>

          {/* Card 4: QR Code & 4K Video Verification */}
          <div className="bg-surface-container-low border border-outline-variant rounded p-4 relative flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-primary">qr_code_2</span>
                  4. รหัส QR ตรวจสอบวิดีโอทางการ
                </span>
                <span className="font-label-badge text-label-badge px-1 bg-surface text-on-surface border border-outline-variant rounded font-semibold">
                  VERIFIED
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                {/* QR Visual Box */}
                <div className="w-16 h-16 bg-surface-container-lowest border-2 border-on-surface p-1 rounded flex items-center justify-center shrink-0 shadow-inner">
                  <div className="grid grid-cols-4 gap-0.5 w-full h-full">
                    <div className="bg-on-surface"></div>
                    <div className="bg-on-surface"></div>
                    <div className="bg-surface-container-lowest"></div>
                    <div className="bg-on-surface"></div>
                    <div className="bg-on-surface"></div>
                    <div className="bg-surface-container-lowest"></div>
                    <div className="bg-on-surface"></div>
                    <div className="bg-on-surface"></div>
                    <div className="bg-surface-container-lowest"></div>
                    <div className="bg-on-surface"></div>
                    <div className="bg-on-surface"></div>
                    <div className="bg-surface-container-lowest"></div>
                    <div className="bg-on-surface"></div>
                    <div className="bg-on-surface"></div>
                    <div className="bg-surface-container-lowest"></div>
                    <div className="bg-on-surface"></div>
                  </div>
                </div>
                <p className="font-body-sm text-[11px] leading-tight text-secondary">
                  สแกนรหัส QR เพื่อเข้าชมวิดีโอบันทึกการแข่งขันความละเอียดสูงที่ได้รับการประทับเวลารับรองโดยคณะกรรมการจัดการแข่งขัน
                </p>
              </div>
            </div>
            <div className="pt-2 mt-3 border-t border-outline-variant/60 font-label-badge text-label-badge text-secondary flex items-center justify-between">
              <span className="font-mono">HASH: 9E77F3...D91</span>
              <span className="text-primary font-bold">[ONLINE PORTAL]</span>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* SECTION B: 1-Minute Verified Highlight Reel Compiler                    */}
      {/* ----------------------------------------------------------------------- */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 md:p-6 shadow-sm space-y-4">
        {/* Compiler Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">videocam</span>
              <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-wide">
                1-MINUTE VERIFIED HIGHLIGHT REEL COMPILER (ระบบรวบรวมวิดีโอไฮไลต์ทางการ 60 วินาที)
              </h2>
            </div>
            <p className="font-body-sm text-body-sm text-secondary mt-1">
              คัดสรรจังหวะการเล่นสำคัญจากการแข่งขันทางการเพื่อประมวลผลเป็นวิดีโอไฮไลต์ความยาวไม่เกิน 60 วินาที พร้อมลายน้ำรับรองความถูกต้องสำหรับยื่นแฟ้มสะสมผลงาน TCAS
            </p>
          </div>

          {/* Preview & Compile Action CTAs */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap">
            <button
              onClick={() => {
                const firstSelected = plays.find((p) => selectedClipIds.includes(p.id));
                if (firstSelected) setPreviewClip(firstSelected);
              }}
              className="px-3.5 py-2 border border-outline hover:border-primary text-on-surface rounded font-headline-sm text-headline-sm uppercase tracking-wide flex items-center justify-center gap-1.5 hover:bg-surface-container transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">play_circle</span>
              <span>ดูตัวอย่างวิดีโอ ({selectedClipIds.length} จังหวะการเล่น)</span>
            </button>
            <button
              onClick={handleCompile}
              disabled={compileState === "COMPILING"}
              className={`px-5 py-2 rounded font-headline-sm text-headline-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                compileState === "SUCCESS"
                  ? "bg-emerald-600 text-white"
                  : compileState === "COMPILING"
                  ? "bg-tertiary text-white"
                  : "bg-primary hover:bg-surface-tint active:scale-95 text-on-primary"
              }`}
            >
              {compileState === "COMPILING" ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                  <span>GENERATING 60s REEL... (78%)</span>
                </>
              ) : compileState === "SUCCESS" ? (
                <>
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  <span>60s REEL COMPILED WITH BSAT WATERMARK!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">movie_edit</span>
                  <span>ประมวลผลวิดีโอไฮไลต์ 60 วินาที พร้อมตราสัญลักษณ์รับรอง</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Duration Progress Tracker */}
        <div className="p-4 bg-surface-container-low border border-outline-variant rounded space-y-2">
          <div className="flex flex-wrap justify-between items-center font-headline-sm text-headline-sm gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">timer</span>
              <span className="text-on-surface uppercase">ความยาวรวมของคลิปไฮไลต์:</span>
              <span className={`font-bold text-xl ${totalDuration <= 60 ? "text-primary" : "text-error"}`}>
                {totalDuration} วินาที
              </span>
              <span className="text-secondary">/ 60 วินาทีเป้าหมาย</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${totalDuration <= 60 ? "bg-primary animate-pulse" : "bg-error"}`}></span>
              <span className={`font-label-caps text-label-caps uppercase font-bold tracking-wider ${
                totalDuration <= 60 ? "text-primary" : "text-error"
              }`}>
                {totalDuration <= 60 ? "Ready to Compile (under 60s target)" : "Exceeds 60s target"}
              </span>
              <span className="font-body-sm text-body-sm text-secondary">
                | เลือกแล้ว {selectedClipIds.length} จาก {plays.length} รายการที่ได้รับการรับรอง
              </span>
            </div>
          </div>

          {/* Athletic Multi-Segment Progress Bar */}
          <div className="w-full bg-surface-dim h-3.5 rounded overflow-hidden flex border border-outline-variant p-0.5">
            {plays
              .filter((p) => selectedClipIds.includes(p.id))
              .map((p, idx) => {
                const colors = ["bg-primary", "bg-surface-tint", "bg-tertiary", "bg-primary-container", "bg-amber-600"];
                const color = colors[idx % colors.length];
                const widthPct = Math.min((p.durationSec / 60) * 100, 100);
                return (
                  <div
                    key={p.id}
                    className={`${color} h-full rounded-sm mr-0.5 transition-all duration-300 relative group`}
                    style={{ width: `${widthPct}%` }}
                    title={`${p.title}: ${p.durationSec}s`}
                  />
                );
              })}
          </div>

          <div className="flex justify-between items-center font-label-badge text-label-badge text-secondary flex-wrap gap-1">
            <span>0 วินาที</span>
            <span>15 วินาที</span>
            <span>30 วินาที (ครึ่งคลิป)</span>
            <span>45 วินาที</span>
            <span className="text-primary font-bold">ขีดจำกัดสูงสุด: 60 วินาทีสำหรับระบบ TCAS</span>
          </div>
        </div>

        {/* Filter Bar: Tournament & Matches */}
        <div className="space-y-3 pt-1">
          {/* Tournament Selection */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-1 font-label-caps text-label-caps uppercase text-secondary font-bold whitespace-nowrap">
              <span className="material-symbols-outlined text-base text-primary">filter_alt</span>
              1. รายการแข่งขันทางการ (SELECT TOURNAMENT):
            </div>
            <div className="relative flex-grow">
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 bg-surface-container-lowest border border-outline rounded text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="ALL">รวมสถิติการแข่งขันทางการสะสมทุกรายการ (7 แมตช์)</option>
                <option value="TOA">TOA Youth Basketball League U18 Thailand Championship 2024 (5 แมตช์)</option>
                <option value="DPE">การแข่งขันบาสเกตบอลนักเรียน กรมพลศึกษา ประจำปี 2567 (2 แมตช์)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2 text-secondary pointer-events-none text-lg">
                expand_more
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-secondary whitespace-nowrap text-right">
              7 แมตช์ที่ได้รับการรับรอง
            </span>
          </div>

          {/* Matches Carousel/Pills */}
          <div className="space-y-1">
            <div className="flex justify-between items-center flex-wrap gap-1">
              <span className="font-label-caps text-label-caps uppercase text-secondary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">calendar_view_week</span>
                2. แมตช์การแข่งขันในรายการ (MATCHES IN THIS TOURNAMENT):
              </span>
              <span className="font-label-badge text-label-badge text-primary uppercase font-bold">
                • แสดงแมตช์ทั้งหมด (คลิกเพื่อเลื่อนดู)
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
              {/* Pill: All Matches */}
              <button
                onClick={() => setSelectedMatch("ALL")}
                className={`px-3 py-1.5 rounded text-left shrink-0 flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                  selectedMatch === "ALL"
                    ? "bg-inverse-surface text-inverse-on-surface border-2 border-primary"
                    : "bg-surface-container-lowest border border-outline-variant hover:border-outline text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-primary-fixed text-lg">view_list</span>
                <div>
                  <div className="font-headline-sm text-headline-sm leading-tight">รวมทุกแมตช์การแข่งขัน</div>
                  <div className="font-label-badge text-label-badge text-primary-fixed">รวม 8 จังหวะการเล่น</div>
                </div>
              </button>

              {/* Pill: Match 1 */}
              <button
                onClick={() => setSelectedMatch("match-deb")}
                className={`px-3 py-1.5 rounded text-left shrink-0 transition-colors cursor-pointer ${
                  selectedMatch === "match-deb"
                    ? "bg-inverse-surface text-inverse-on-surface border-2 border-primary"
                    : "bg-surface-container-lowest hover:bg-surface-container border border-outline-variant hover:border-outline text-on-surface"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-label-badge text-label-badge text-secondary font-bold">25 ต.ค. 2024</span>
                  <span className="font-label-badge text-label-badge px-1 bg-surface-container text-primary font-bold rounded">
                    ชนะ 78 - 76
                  </span>
                </div>
                <div className="font-body-sm text-body-sm font-semibold">vs โรงเรียนเทพศิรินทร์ (Debsirin School)</div>
                <div className="font-label-badge text-label-badge text-secondary">รอบรองชนะเลิศ [TOA U18] • 3 จังหวะการเล่น</div>
              </button>

              {/* Pill: Match 2 */}
              <button
                onClick={() => setSelectedMatch("match-bcc")}
                className={`px-3 py-1.5 rounded text-left shrink-0 transition-colors cursor-pointer ${
                  selectedMatch === "match-bcc"
                    ? "bg-inverse-surface text-inverse-on-surface border-2 border-primary"
                    : "bg-surface-container-lowest hover:bg-surface-container border border-outline-variant hover:border-outline text-on-surface"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-label-badge text-label-badge text-secondary font-bold">12 ต.ค. 2024</span>
                  <span className="font-label-badge text-label-badge px-1 bg-surface-container text-primary font-bold rounded">
                    ชนะ 82 - 79
                  </span>
                </div>
                <div className="font-body-sm text-body-sm font-semibold">vs โรงเรียนกรุงเทพคริสเตียนวิทยาลัย (BCC)</div>
                <div className="font-label-badge text-label-badge text-secondary">รอบก่อนรองฯ [TOA U18] • 2 จังหวะการเล่น</div>
              </button>

              {/* Pill: Match 3 */}
              <button
                onClick={() => setSelectedMatch("match-sk")}
                className={`px-3 py-1.5 rounded text-left shrink-0 transition-colors cursor-pointer ${
                  selectedMatch === "match-sk"
                    ? "bg-inverse-surface text-inverse-on-surface border-2 border-primary"
                    : "bg-surface-container-lowest hover:bg-surface-container border border-outline-variant hover:border-outline text-on-surface"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-label-badge text-label-badge text-secondary font-bold">28 ก.ย. 2024</span>
                  <span className="font-label-badge text-label-badge px-1 bg-surface-container text-primary font-bold rounded">
                    ชนะ 69 - 65
                  </span>
                </div>
                <div className="font-body-sm text-body-sm font-semibold">vs โรงเรียนสวนกุหลาบวิทยาลัย (Suankularb)</div>
                <div className="font-label-badge text-label-badge text-secondary">รอบ 8 ทีม [TOA U18] • 2 จังหวะการเล่น</div>
              </button>

              {/* Pill: Match 4 */}
              <button
                onClick={() => setSelectedMatch("match-ac")}
                className={`px-3 py-1.5 rounded text-left shrink-0 transition-colors cursor-pointer ${
                  selectedMatch === "match-ac"
                    ? "bg-inverse-surface text-inverse-on-surface border-2 border-primary"
                    : "bg-surface-container-lowest hover:bg-surface-container border border-outline-variant hover:border-outline text-on-surface"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-label-badge text-label-badge text-secondary font-bold">15 ก.ย. 2024</span>
                  <span className="font-label-badge text-label-badge px-1 bg-surface-container text-secondary font-bold rounded">
                    แพ้ 71 - 74
                  </span>
                </div>
                <div className="font-body-sm text-body-sm font-semibold">vs โรงเรียนอัสสัมชัญ (Assumption)</div>
                <div className="font-label-badge text-label-badge text-secondary">รอบแรก [DPE Cup] • 1 จังหวะการเล่น</div>
              </button>
            </div>
          </div>

          {/* Event Type Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-outline-variant">
            <span className="font-label-caps text-label-caps uppercase text-secondary font-bold mr-1">จำแนกตามประเภทจังหวะการเล่น:</span>
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-3 py-1 rounded font-label-caps text-label-caps uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                activeCategory === "ALL" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface border border-outline-variant"
              }`}
            >
              ทั้งหมด (8)
            </button>
            <button
              onClick={() => setActiveCategory("CLUTCH")}
              className={`px-3 py-1 rounded font-label-caps text-label-caps uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ${
                activeCategory === "CLUTCH"
                  ? "bg-primary text-on-primary font-bold"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant"
              }`}
            >
              <span className="material-symbols-outlined text-sm text-primary">local_fire_department</span>
              จังหวะชี้ขาดเกม (Clutch)
            </button>
            <button
              onClick={() => setActiveCategory("SCORE")}
              className={`px-3 py-1 rounded font-label-caps text-label-caps uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ${
                activeCategory === "SCORE"
                  ? "bg-primary text-on-primary font-bold"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant"
              }`}
            >
              <span className="material-symbols-outlined text-sm text-tertiary">sports_basketball</span>
              การทำคะแนนและดังก์ (Score & Dunk)
            </button>
            <button
              onClick={() => setActiveCategory("BLOCK")}
              className={`px-3 py-1 rounded font-label-caps text-label-caps uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ${
                activeCategory === "BLOCK"
                  ? "bg-primary text-on-primary font-bold"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant"
              }`}
            >
              <span className="material-symbols-outlined text-sm text-secondary">shield</span>
              การบล็อกลูกยิง (Blocks)
            </button>
            <button
              onClick={() => setActiveCategory("TRANSITION")}
              className={`px-3 py-1 rounded font-label-caps text-label-caps uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ${
                activeCategory === "TRANSITION"
                  ? "bg-primary text-on-primary font-bold"
                  : "bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant"
              }`}
            >
              <span className="material-symbols-outlined text-sm text-secondary">replay</span>
              การเปลี่ยนจังหวะเกมรับสู่เกมรุก (Transition)
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* Event Clips Grid (Bento Grid of Tactical Clips with Status & Select)   */}
        {/* --------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {filteredPlays.map((play) => {
            const isSelected = selectedClipIds.includes(play.id);
            return (
              <div
                key={play.id}
                onClick={() => toggleClip(play.id)}
                className={`rounded-lg p-4 relative flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-surface-container-lowest border-2 border-primary shadow-sm"
                    : "bg-surface-container-lowest border border-outline-variant hover:border-outline opacity-90 hover:opacity-100"
                }`}
              >
                <div className="space-y-2">
                  {/* Header with Select Checkbox & Badge */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 font-headline-sm text-xs uppercase rounded ${play.badge1Color}`}>
                        {play.badge1}
                      </span>
                      {play.badge2 && (
                        <span className={`px-1.5 py-0.5 font-label-badge text-label-badge uppercase font-bold rounded flex items-center gap-0.5 ${play.badge2Color}`}>
                          <span className="material-symbols-outlined text-xs">star</span>
                          {play.badge2}
                        </span>
                      )}
                    </div>

                    {/* Checkbox Indicator */}
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                        isSelected ? "bg-primary text-on-primary" : "border border-outline hover:border-primary"
                      }`}
                    >
                      {isSelected && <span className="material-symbols-outlined text-lg">check</span>}
                    </div>
                  </div>

                  {/* Title & Clip Details */}
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase leading-tight">
                      {play.title}
                    </h3>
                    <p className="font-body-sm text-xs text-secondary mt-1 leading-relaxed">
                      {play.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer with Metadata & Preview Trigger */}
                <div className="pt-3 mt-2 border-t border-outline-variant flex items-center justify-between">
                  <div className="font-body-sm text-[11px] text-secondary">
                    <span>{play.quarterClock} ({play.opponent})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-headline-sm text-headline-sm ${isSelected ? "text-primary font-bold" : "text-secondary"}`}>
                      {play.durationSec} วินาที
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewClip(play);
                      }}
                      className="p-1 hover:bg-surface-container rounded text-primary flex items-center cursor-pointer"
                      title="ดูตัวอย่างคลิป"
                    >
                      <span className="material-symbols-outlined text-lg">play_circle</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* CERTIFICATION & AUTOMATION NOTICE CARD */}
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-primary font-headline-sm text-headline-sm">
                <span className="material-symbols-outlined text-xl">verified</span>
                <span>CERTIFIED BSAT VIDEO ENGINES</span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                วิดีโอทุกรายการถูกเชื่อมโยงกับรหัสเวลา (Timecode) ทางการของผู้ตัดสิน เมื่อประมวลผลระบบจะผนึก:
              </p>
              <ul className="font-body-sm text-xs text-on-surface space-y-1 pl-1">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                  <span>ลายน้ำรหัสนักกีฬา (TCAS Student ID) และธงชาติไทย</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                  <span>ตราสัญลักษณ์รับรองสมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT) พร้อมรหัส QR ตรวจสอบ</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                  <span>ตัวเลขนับเวลาถอยหลังมาตรฐานไม่เกิน 60 วินาทีตามเกณฑ์มหาวิทยาลัย</span>
                </li>
              </ul>
            </div>
            <div className="pt-2 mt-3 border-t border-outline-variant/60 flex items-center justify-between">
              <span className="font-label-badge text-label-badge text-secondary uppercase">System v4.2.0-PRO</span>
              <span className="font-label-badge text-label-badge text-primary font-bold">READY TO EXPORT</span>
            </div>
          </div>
        </div>
      </section>

      {/* Video Preview Modal */}
      {previewClip && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-xl border border-outline p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-headline-sm text-primary uppercase block">
                  {previewClip.title}
                </span>
                <span className="text-xs text-secondary font-mono">
                  {previewClip.quarterClock} • {previewClip.opponent} • {previewClip.durationSec}s
                </span>
              </div>
              <button
                onClick={() => setPreviewClip(null)}
                className="text-secondary hover:text-on-surface p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full aspect-video bg-black rounded-lg flex flex-col items-center justify-center text-white relative overflow-hidden">
              <span className="material-symbols-outlined text-6xl text-primary/80 animate-pulse">
                play_circle
              </span>
              <span className="text-xs text-surface-dim mt-2 font-mono">
                Official Clip Preview • 1080p 60fps
              </span>
              <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/80 px-2 py-0.5 rounded text-white">
                BSAT TIMECODE: {previewClip.quarterClock}
              </span>
              <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-primary px-1.5 py-0.5 rounded text-white">
                {previewClip.durationSec}s
              </span>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              {previewClip.description}
            </p>
          </div>
        </div>
      )}

      {/* Real TCAS PDF Export & Print Modal */}
      <TcasDossierPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        athlete={athlete}
        stats={stats}
      />
    </div>
  );
}
