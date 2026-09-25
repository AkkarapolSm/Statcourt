"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Trophy,
  Play,
  Award,
  School,
  Video,
  Share2,
  QrCode,
  ArrowRight,
  Radio,
  Flame,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

import { useAuthStore } from "@/lib/auth/useAuthStore";
import { canAccessScoutHub } from "@/lib/auth/rbac";

interface HomeHeroSectionProps {
  onOpenSocialGraphics: () => void;
  onOpenPlayerPass: () => void;
}

export default function HomeHeroSection({
  onOpenSocialGraphics,
  onOpenPlayerPass,
}: HomeHeroSectionProps) {
  const { currentUser } = useAuthStore();
  const hasScoutAccess = canAccessScoutHub(currentUser);
  const isMember = currentUser.role !== "PUBLIC";

  return (
    <section className="relative bg-[#0F172A] text-white py-12 sm:py-16 lg:py-20 overflow-hidden border-b border-slate-800">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute inset-0 court-grid-pattern opacity-15 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-red-950/20 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ============================================================== */}
          {/* LEFT: HERO VALUE PROPOSITION & COMMANDING HEADLINE (7 COLS)    */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Platform Identification Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-950/80 to-slate-900 border border-red-500/40 text-red-200 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-lg shadow-red-950/30">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>OFFICIAL BASKETBALL INTELLIGENCE &amp; STATS PLATFORM</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-headline-xl text-3xl sm:text-5xl lg:text-6xl text-white uppercase font-normal tracking-tight leading-[1.08]">
              ศูนย์กลางสถิติสดและวิดีโอ <br />
              <span className="text-[#DC2626] font-black">
                บาสเกตบอลไทย มาตรฐาน FIBA
              </span>
            </h1>

            {/* Clear, Concise Value Proposition */}
            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              แพลตฟอร์มดิจิทัลครบวงจรสำหรับวงการกีฬาบาสเกตบอลไทย: ควบคุมโต๊ะเทคนิคเรียลไทม์ 
              (FIBA LiveStats), ถ่ายทอดสดคลิกซิงค์วิดีโอเพลย์ต่อเพลย์, และคลังข้อมูลแมวมองสำหรับโควตากีฬา TCAS
            </p>

            {/* 2 Clear, High-Contrast Hero Action CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1 w-full sm:w-auto font-mono text-xs">
              <Link
                href="/live"
                className="bg-gradient-to-r from-red-600 to-[#AF101A] hover:from-red-500 hover:to-red-600 text-white font-bold px-7 py-3.5 rounded-xl shadow-xl shadow-red-950/60 flex items-center gap-2.5 transition uppercase tracking-wider cursor-pointer active:scale-98"
              >
                <Radio className="w-4 h-4 text-white animate-pulse" />
                <span>ชมถ่ายทอดสด &amp; สถิติสด (Live Arena)</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>

              {hasScoutAccess ? (
                <Link
                  href="/scout"
                  className="bg-slate-800/90 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700/80 flex items-center gap-2 transition uppercase tracking-wider shadow-md hover:border-slate-600"
                >
                  <Trophy className="w-4 h-4 text-red-400" />
                  <span>คลังแมวมอง &amp; พอร์ต TCAS</span>
                </Link>
              ) : currentUser.role === "ATHLETE" ? (
                <Link
                  href="/athlete/ath-1"
                  className="bg-slate-800/90 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700/80 flex items-center gap-2 transition uppercase tracking-wider shadow-md hover:border-slate-600"
                >
                  <Trophy className="w-4 h-4 text-blue-400" />
                  <span>โปรไฟล์นักกีฬา &amp; พอร์ต TCAS</span>
                </Link>
              ) : currentUser.role === "OFFICIAL" ? (
                <Link
                  href="/official/console/match-bcc-ds-01"
                  className="bg-slate-800/90 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700/80 flex items-center gap-2 transition uppercase tracking-wider shadow-md hover:border-slate-600"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>เข้าสู่ระบบโต๊ะเทคนิค (Console)</span>
                </Link>
              ) : (
                <Link
                  href="/tournaments"
                  className="bg-slate-800/90 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700/80 flex items-center gap-2 transition uppercase tracking-wider shadow-md hover:border-slate-600"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>ตารางการแข่งขัน &amp; สายแข่ง</span>
                </Link>
              )}
            </div>

            {/* Credibility & Endorsement Strip */}
            <div className="pt-6 border-t border-slate-800/80 w-full flex flex-wrap items-center gap-5 sm:gap-8 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-400" />
                <span>สมาคมกีฬาบาสเกตบอลฯ (BSAT)</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-300" />
                <span>FIBA LiveStats 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-slate-300" />
                <span>โควตากีฬา TCAS พร้อม QR</span>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* RIGHT: FEATURE MATCH SHOWCASE GLASS CARD (5 COLS)              */}
          {/* ============================================================== */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-800 hover:border-slate-700 transition-all text-white relative">
              
              {/* Card Header: Live Match Status & Tournament */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-bold text-white uppercase tracking-wider">
                    LIVE STREAM • นิมิบุตร (COURT 1)
                  </span>
                </div>
                <span className="bg-red-950 text-red-300 border border-red-800/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                  TOA U18 FINALS
                </span>
              </div>

              {/* Clean, Prestigious Match Scoreboard */}
              <div className="py-5 bg-slate-950/70 rounded-xl my-4 px-4 border border-slate-800/90">
                <div className="flex items-center justify-between gap-2">
                  {/* Home Team (BCC) */}
                  <div className="flex-1 text-center space-y-1 min-w-0">
                    <div className="w-12 h-12 mx-auto bg-slate-800 rounded-full flex items-center justify-center font-headline font-bold text-white border-2 border-red-600 shadow">
                      BCC
                    </div>
                    <div className="font-bold text-white text-xs sm:text-sm truncate">
                      กรุงเทพคริสเตียน
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">ชนะ 4 แพ้ 0</div>
                  </div>

                  {/* Center Score & Quarter Clock */}
                  <div className="shrink-0 text-center space-y-1.5 px-3">
                    <div className="font-mono text-2xl sm:text-3xl lg:text-4xl text-white font-black tracking-tight leading-none whitespace-nowrap">
                      75 - 63
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      Q4 05:20
                    </div>
                  </div>

                  {/* Away Team (DS) */}
                  <div className="flex-1 text-center space-y-1 min-w-0">
                    <div className="w-12 h-12 mx-auto bg-slate-800 rounded-full flex items-center justify-center font-headline font-bold text-white border-2 border-slate-600 shadow">
                      DS
                    </div>
                    <div className="font-bold text-white text-xs sm:text-sm truncate">
                      เทพศิรินทร์
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">ชนะ 3 แพ้ 1</div>
                  </div>
                </div>
              </div>

              {/* Player Spotlight (Player of the Game) */}
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 mb-5 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold">
                    #7
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Thanakorn Siriphan (BCC)</span>
                      <span className="text-[10px] text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-bold uppercase">
                        MVP
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      18 แต้ม • 8 แอสซิส • 3 รีบาว
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">FIBA EFF</span>
                  <span className="font-black text-[#DC2626] text-sm">26.4</span>
                </div>
              </div>

              {/* ONE Clear, Commanding Primary Button */}
              <Link
                href="/live"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-[#AF101A] hover:from-red-500 hover:to-red-600 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-red-950/50 transition-all cursor-pointer group"
              >
                <Video className="w-4 h-4 text-white" />
                <span>เข้าสู่ห้องถ่ายทอดสด &amp; Multi-Cam (Live Arena)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Subtle Utility Links */}
              <div className="flex items-center justify-center gap-4 pt-3.5 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 mt-4">
                <button
                  type="button"
                  onClick={onOpenSocialGraphics}
                  className="hover:text-white transition flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>สร้างภาพสรุปโซเชียล</span>
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={onOpenPlayerPass}
                  className="hover:text-white transition flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-400" />
                  <span>ตรวจ Digital Player Pass</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
