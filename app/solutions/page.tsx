"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TournamentCreationWizardModal from "@/components/solutions/TournamentCreationWizardModal";
import TournamentRoiCalculator from "@/components/solutions/TournamentRoiCalculator";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { canAccessOfficialConsole, canCreateTournament } from "@/lib/auth/rbac";
import {
  Trophy,
  ShieldCheck,
  Radio,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  FileText,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Play,
  HelpCircle,
  TrendingUp,
  Layers,
  Award,
  Flame,
  QrCode,
  DollarSign,
} from "lucide-react";

export default function SolutionsLandingPage() {
  const { currentUser, loginAs } = useAuthStore();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const hasConsoleAccess = canAccessOfficialConsole(currentUser);
  const canCreate = canCreateTournament(currentUser);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "ระบบรองรับกติกาบาสเกตบอลของสหพันธ์บาสเกตบอลนานาชาติ (FIBA) หรือไม่?",
      a: "รองรับ 100% ครับ ระบบ Table Official Console ถูกออกแบบตามกฎมาตรฐาน FIBA Official Basketball Rules 2026 รองรับเวลาแข่งขัน 4 ควอเตอร์ ควอเตอร์ละ 10 นาที (หรือปรับแต่งได้), ช็อตคล็อก 24 วินาที และ 14 วินาที (รีเซ็ตหลังรีบาวด์เกมบุก), การนับฟาวล์บุคคลและฟาวล์ทีม รวมถึงปุ่ม Undo เหตุการณ์ย้อนหลังภายใน 60 วินาที",
    },
    {
      q: "การถ่ายทอดสดสถิติ (Live SSE Broadcasting) ต้องใช้อุปกรณ์อะไรบ้าง?",
      a: "ผู้จัดต้องการเพียง iPad, แท็บเล็ต หรือโน้ตบุ๊ก 1 เครื่องประจำโต๊ะกรรมการที่มีสัญญาณอินเทอร์เน็ต (แม้เป็น Hotspot มือถือก็ใช้งานได้) กรรมการกดบันทึกคะแนนแล้วระบบจะส่งข้อมูลไปยังผู้ชมบนมือถือผ่านเทคโนโลยี Server-Sent Events (SSE) แบบ Real-Time ทันที โดยไม่ต้องมีรถถ่ายทอดสดหรืออุปกรณ์ราคาแพง",
    },
    {
      q: "ระบบป้องกันปัญหานักกีฬาปลอมอายุ หรือสวมสิทธิ์ข้ามรุ่นอย่างไร?",
      a: "StatCourtTH มีระบบ Digital Player Pass ที่ผูกข้อมูลนักเรียนกับเลขประจำตัวประชาชน (เข้ารหัสความปลอดภัย SHA-256 Hashing) และระบุรุ่นอายุที่สามารถลงแข่งขันได้ชัดเจน กรรมการสามารถสแกน QR Code หน้าสนามก่อนลงแข่งเพื่อยืนยันตัวตนได้ใน 3 วินาที",
    },
    {
      q: "สามารถส่งออกใบบันทึกคะแนนทางการ (FIBA Scoresheet) ได้หรือไม่?",
      a: "ได้ครับ เมื่อจบการแข่งขัน ระบบสามารถ Export ใบบันทึกคะแนน 4 ควอเตอร์พร้อมลายเซ็นดิจิทัลของผู้ตัดสินและผู้บันทึกคะแนนเป็นไฟล์ PDF ตามฟอร์มมาตรฐาน FIBA เพื่อนำส่งฝ่ายจัดการแข่งขันหรือสมาคมฯ ได้ทันที",
    },
    {
      q: "คิดค่าบริการอย่างไร?",
      a: "เรามีแพ็กเกจ Community สำหรับทัวร์นาเมนต์ขนาดเล็กทดลองใช้ฟรี และแพ็กเกจ Pro สำหรับทัวร์นาเมนต์ทางการ เริ่มต้นเพียง 8,900 บาทต่อรายการ (ไม่จำกัดจำนวนคู่แข่งขันตลอดทัวร์นาเมนต์) ครอบคลุมระบบโต๊ะกรรมการ, ถ่ายทอดสดคะแนน และระบบยืนยันสถิติสำหรับแฟ้มสะสมงาน TCAS",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-body-md antialiased selection:bg-[#DC2626] selection:text-white">
      {/* Universal Navigation */}
      <Navbar />

      <main className="flex-1 pb-24 space-y-16">
        {/* ============================================================== */}
        {/* 1. HERO SECTION: BRAND SIGNATURE SLATE BANNER                  */}
        {/* ============================================================== */}
        <section className="bg-[#0F172A] text-white py-14 sm:py-20 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 court-grid-pattern opacity-15 pointer-events-none" />
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              
              {/* Platform Identification Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#AF101A]/20 border border-[#AF101A]/40 text-[#FFDAD6] text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                <span>FIBA COMPLIANT BASKETBALL TOURNAMENT SAAS</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-400 font-bold">2026 EDITION</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-headline-xl text-white uppercase tracking-wider text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.08]">
                ยกระดับทัวร์นาเมนต์บาสเกตบอล <br className="hidden sm:inline" />
                สู่มาตรฐานสากล <span className="text-[#DC2626] font-normal">ด้วยแพลตฟอร์มดิจิทัลครบวงจร</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
                เปลี่ยนระบบกระดาษสู่ดิจิทัล 100% — โต๊ะเทคนิคระบบสัมผัส (Table Official Console), สตรีมมิ่งสถิติสดระดับเสี้ยววินาที (SSE), ตรวจสอบอายุด้วยบัตรนักกีฬาป้องกันการโกง และออกใบบันทึกคะแนน FIBA ในคลิกเดียว
              </p>

              {/* Hero Action CTAs */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(true)}
                  className="bg-[#AF101A] hover:bg-[#8F0D15] text-white font-bold px-7 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2.5 uppercase tracking-wider cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>เปิดระบบทัวร์นาเมนต์ทันที (Start Tournament)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {hasConsoleAccess ? (
                  <Link
                    href="/official/console/match-bcc-ds-01"
                    className="bg-slate-800/90 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700 flex items-center gap-2 transition uppercase tracking-wider shadow-md"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>ทดลองใช้ Table Console (Demo)</span>
                  </Link>
                ) : (
                  <a
                    href="#roi-calculator"
                    className="bg-slate-800/90 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700 flex items-center gap-2 transition uppercase tracking-wider shadow-md"
                  >
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span>คำนวณความคุ้มค่า (ROI Calculator)</span>
                  </a>
                )}

                <Link
                  href="/live"
                  className="bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white font-bold px-5 py-3.5 rounded-xl border border-slate-700/60 flex items-center gap-2 transition uppercase tracking-wider"
                >
                  <Radio className="w-4 h-4 text-[#DC2626] animate-pulse" />
                  <span>ดูหน้าถ่ายทอดสด (/live)</span>
                </Link>
              </div>

              {/* Live Proof Metrics Ticker */}
              <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-xl sm:text-2xl font-black text-white block">12+</span>
                  <span className="text-[11px] text-slate-400">ทัวร์นาเมนต์รับรองในระบบ</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 block">&lt; 30ms</span>
                  <span className="text-[11px] text-slate-400">SSE Latency ถ่ายทอดสด</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 block">100%</span>
                  <span className="text-[11px] text-slate-400">FIBA LiveStats Compliant</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <span className="text-xl sm:text-2xl font-black text-red-400 block">0 Case</span>
                  <span className="text-[11px] text-slate-400">ข้อพิพาทเรื่องอายุผู้เล่น</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 2. CORE PILLARS: 4 KEY ADVANTAGES FOR TOURNAMENT ORGANIZERS   */}
        {/* ============================================================== */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full pt-4">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-[#AF101A] uppercase">
              TOURNAMENT INFRASTRUCTURE
            </span>
            <h2 className="font-headline-lg text-[#0B1C30] uppercase tracking-wide text-3xl sm:text-4xl font-normal">
              4 เสาหลักที่ทำให้ทัวร์นาเมนต์ของคุณเหนือระดับ
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              โครงสร้างพื้นฐานเทคโนโลยีสำหรับผู้จัดการแข่งขันยุคใหม่ ลดภาระฝ่ายเทคนิค เพิ่มความน่าเชื่อถือ และดึงดูดทีมชั้นนำทั่วประเทศ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#AF101A]/50 transition-all duration-300 shadow-sm hover:shadow-md group space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#AF101A] group-hover:bg-[#AF101A] group-hover:text-white transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-headline-sm font-bold uppercase text-[#0B1C30] text-lg group-hover:text-[#AF101A] transition">
                  โต๊ะบันทึกคะแนน FIBA ระบบสัมผัส
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  ควบคุมนาฬิกาแข่ง, ช็อตคล็อก 24s/14s, แต้ม และฟาวล์ผ่านแท็บเล็ต มีระบบ Undo ย้อนหลัง 60 วิ ป้องกันความผิดพลาดของกรรมการโต๊ะ
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ส่งออก FIBA PDF ใน 1 คลิก</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#AF101A]/50 transition-all duration-300 shadow-sm hover:shadow-md group space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition">
                <Radio className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-headline-sm font-bold uppercase text-[#0B1C30] text-lg group-hover:text-amber-700 transition">
                  สตรีมมิ่งสดผ่าน SSE ระดับเสี้ยววินาที
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  สตรีมคะแนนสด, ช็อตคล็อกนับถอยหลัง, รายชื่อผู้เล่น และ Play-by-Play สู่หน้าจอมือถือผู้ชมและผู้ปกครองทั่วโลกแบบ Real-Time
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-amber-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>รองรับ Multi-Court 3 สนามพร้อมกัน</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#AF101A]/50 transition-all duration-300 shadow-sm hover:shadow-md group space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-headline-sm font-bold uppercase text-[#0B1C30] text-lg group-hover:text-blue-700 transition">
                  บัตรนักกีฬา QR Pass ป้องกันโกงอายุ
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  หมดปัญหานักกีฬาข้ามรุ่นหรือสวมสิทธิ์ ด้วยบัตรประจำตัวดิจิทัลเข้ารหัสเลขบัตรประชาชน SHA-256 สแกนเช็กชื่อหน้าสนามได้รวดเร็ว
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-blue-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>สแกนตรวจสอบใน 3 วินาที</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#AF101A]/50 transition-all duration-300 shadow-sm hover:shadow-md group space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-headline-sm font-bold uppercase text-[#0B1C30] text-lg group-hover:text-emerald-700 transition">
                  เชื่อมต่อสถิติ TCAS &amp; โควตามหาวิทยาลัย
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  ดึงดูดทีมเยาวชนระดับประเทศ เพราะสถิติทุกคู่แข่งขันได้รับการยืนยันอย่างเป็นทางการเพื่อใช้ยื่นพอร์ตโฟลิโอเข้าศึกษาต่อระดับอุดมศึกษา
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ดึงดูดทีมระดับ Top ของประเทศ</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 3. INTERACTIVE ROI CALCULATOR SECTION                          */}
        {/* ============================================================== */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
          <TournamentRoiCalculator />
        </section>

        {/* ============================================================== */}
        {/* 4. COMPARISON MATRIX: TRADITIONAL VS STATCOURTTH SAAS          */}
        {/* ============================================================== */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-mono uppercase text-[#AF101A] font-bold tracking-widest block">
              COMPETITIVE COMPARISON
            </span>
            <h2 className="font-headline-lg text-[#0B1C30] uppercase tracking-wide text-3xl sm:text-4xl font-normal">
              เปรียบเทียบการจัดแข่งขันแบบเดิม vs ระบบ StatCourtTH
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              ทำไมฝ่ายจัดการแข่งขันยุคใหม่จึงเปลี่ยนมาใช้ระบบดิจิทัลแบบครบวงจร
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-[11px]">
                    <th className="py-4 px-6 font-bold">ฟังก์ชันการทำงาน</th>
                    <th className="py-4 px-6 font-bold text-slate-500">การจัดแบบดั้งเดิม (กระดาษ)</th>
                    <th className="py-4 px-6 font-bold text-[#AF101A]">ระบบ StatCourtTH SaaS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs sm:text-sm">
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-bold text-[#0B1C30] font-mono">การบันทึกคะแนนและเวลา</td>
                    <td className="py-4 px-6 text-slate-500">ใช้ปากกาเขียนใบบันทึกคะแนน เสี่ยงต่อการคำนวณคะแนนผิด</td>
                    <td className="py-4 px-6 text-emerald-700 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>หน้าจอสัมผัส FIBA Console คำนวณแต้มและฟาวล์อัตโนมัติ</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-bold text-[#0B1C30] font-mono">การถ่ายทอดผลสดให้ผู้ชม</td>
                    <td className="py-4 px-6 text-slate-500">ต้องรออัปเดตสรุปหลังจบเกม หรือถ่ายทอดสดด้วยต้นทุนหลักแสน</td>
                    <td className="py-4 px-6 text-emerald-700 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Broadcast สดผ่าน SSE ถึงมือถือผู้ชมระดับเสี้ยววินาที ฟรี</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-bold text-[#0B1C30] font-mono">การตรวจสอบคุณสมบัติและอายุ</td>
                    <td className="py-4 px-6 text-slate-500">ตรวจสำเนาบัตรประชาชน เกิดข้อพิพาทเรื่องนักกีฬาปลอมอายุบ่อยครั้ง</td>
                    <td className="py-4 px-6 text-emerald-700 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>สแกน QR Digital Pass เข้ารหัส SHA-256 ตรวจสอบทันที</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-bold text-[#0B1C30] font-mono">การออกใบบันทึกคะแนน (Scoresheet)</td>
                    <td className="py-4 px-6 text-slate-500">ต้องถ่ายสำเนาหรือพิมพ์ใหม่เพื่อส่งสมาคมฯ ใช้เวลานาน</td>
                    <td className="py-4 px-6 text-emerald-700 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>ดาวน์โหลดเป็น PDF ทางการตามแบบฟอร์ม FIBA ได้ทันที</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-bold text-[#0B1C30] font-mono">การสนับสนุนพอร์ตโฟลิโอนักกีฬา</td>
                    <td className="py-4 px-6 text-slate-500">ไม่มีระบบบันทึกคลิปและสถิติรายบุคคลที่เป็นทางการ</td>
                    <td className="py-4 px-6 text-emerald-700 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>ออกรายงานสถิติยืนยันตัวตนสำหรับแฟ้มสะสมงาน TCAS 100%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 5. PRICING TIERS SECTION                                       */}
        {/* ============================================================== */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-mono uppercase text-[#AF101A] font-bold tracking-widest block">
              TRANSPARENT PRICING
            </span>
            <h2 className="font-headline-lg text-[#0B1C30] uppercase tracking-wide text-3xl sm:text-4xl font-normal">
              แพ็กเกจราคาค่าบริการสำหรับผู้จัดการแข่งขัน
            </h2>
            <p className="text-sm text-slate-600">
              เลือกแพ็กเกจที่เหมาะสมกับขนาดของทัวร์นาเมนต์ ไม่มีค่าใช้จ่ายแอบแฝง
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free / Community Plan */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 space-y-5 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500 uppercase font-bold tracking-wider">
                    COMMUNITY LEAGUE
                  </span>
                  <span className="inline-flex items-center text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase">
                    [ พร้อมใช้งาน (LIVE) ]
                  </span>
                </div>
                <div className="font-mono">
                  <span className="text-3xl font-black text-[#0B1C30]">ฟรี</span>
                  <span className="text-xs text-slate-500"> / ทัวร์นาเมนต์</span>
                </div>
                <p className="text-xs text-slate-600">
                  สำหรับทัวร์นาเมนต์กระชับมิตร หรือการแข่งขันภายในโรงเรียน/ชมรม
                </p>
                <div className="space-y-2 text-xs text-slate-700 font-sans pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>รองรับสูงสุด 8 ทีม</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ระบบ Table Official Console พื้นฐาน</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ตารางสายการแข่งขันอัตโนมัติ</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWizardOpen(true)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold transition"
              >
                เริ่มใช้งานฟรี
              </button>
            </div>

            {/* Pro Plan (Most Popular) */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-[#AF101A] shadow-xl space-y-5 flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#AF101A] text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow">
                MOST POPULAR FOR TOURNAMENTS
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#AF101A] uppercase font-bold tracking-wider">
                    PRO LEAGUE TOURNAMENT
                  </span>
                  <span className="inline-flex items-center text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-bold uppercase">
                    [ แพ็กเกจพร้อมบริการ ]
                  </span>
                </div>
                <div className="font-mono">
                  <span className="text-3xl font-black text-[#0B1C30]">8,900</span>
                  <span className="text-xs text-slate-500"> THB / ทัวร์นาเมนต์</span>
                </div>
                <p className="text-xs text-slate-600">
                  สำหรับทัวร์นาเมนต์เยาวชนและประชาชนระดับจังหวัด / ประเทศ
                </p>
                <div className="space-y-2 text-xs text-slate-700 font-sans pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ไม่จำกัดจำนวนทีมและคู่แข่งขัน</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ถ่ายทอดสดคะแนนผ่าน SSE สู่หน้า /live</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ระบบ Digital Player Pass ตรวจสอบอายุ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ออกใบบันทึกคะแนน FIBA Scoresheet PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>รับรองสถิติสำหรับแฟ้มสะสมงาน TCAS</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWizardOpen(true)}
                className="w-full py-3 rounded-xl bg-[#AF101A] hover:bg-[#8F0D15] text-white font-mono text-xs font-bold transition shadow-md cursor-pointer"
              >
                เปิดระบบ Pro Tournament
              </button>
            </div>

            {/* Enterprise / Federation Plan */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0F172A] border border-slate-800 text-white space-y-5 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <span className="text-xs font-mono text-amber-400 uppercase font-bold tracking-wider">
                  ENTERPRISE &amp; FEDERATION
                </span>
                <div className="font-mono">
                  <span className="text-3xl font-black text-white">ติดต่อทีมงาน</span>
                </div>
                <p className="text-xs text-slate-400">
                  สำหรับลีกอาชีพ สมาคมกีฬา และทัวร์นาเมนต์ระดับภูมิภาคหลายสนาม
                </p>
                <div className="space-y-2 text-xs text-slate-300 font-sans pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>เชื่อมต่อกล้องวิดีโอหลายมุม (Multi-Cam)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>ระบบชาเลนจ์ภาพช้าผู้ตัดสิน (FIBA IRS Review)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Custom Branding &amp; โดเมนเฉพาะ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>มีเจ้าหน้าที่เทคนิคประจำสนาม (On-site Support)</span>
                  </div>
                </div>
              </div>

              <a
                href="mailto:partner@statcourt.th"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition text-center block border border-slate-700"
              >
                ติดต่อฝ่ายพันธมิตร
              </a>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 6. FAQ SECTION                                                 */}
        {/* ============================================================== */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
          <div className="text-center mb-8 space-y-2">
            <span className="text-xs font-mono uppercase text-[#AF101A] font-bold tracking-widest block">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="font-headline-lg text-[#0B1C30] uppercase tracking-wide text-2xl sm:text-3xl font-normal">
              คำถามที่พบบ่อยเกี่ยวกับระบบทัวร์นาเมนต์
            </h2>
          </div>

          <div className="space-y-3 font-sans">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs transition hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition"
                >
                  <span className="font-bold text-sm sm:text-base text-[#0B1C30]">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-[#AF101A] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 7. FINAL HIGH-IMPACT CTA BANNER                                */}
        {/* ============================================================== */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
          <div className="p-8 sm:p-14 rounded-3xl bg-[#0F172A] border border-slate-800 text-white relative overflow-hidden court-grid-pattern shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#AF101A] text-white flex items-center justify-center mx-auto shadow-md">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-2xl mx-auto">
              <h2 className="font-headline-xl text-white uppercase tracking-wider text-2xl sm:text-4xl font-normal">
                พร้อมยกระดับทัวร์นาเมนต์ของคุณแล้วหรือยัง?
              </h2>
              <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
                เปิดระบบใน 3 นาที ไม่มีขั้นตอนซับซ้อน ดึงดูดทีมชั้นนำและยกระดับมาตรฐานวงการบาสเกตบอลไทยไปด้วยกัน
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 font-mono text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setIsWizardOpen(true)}
                className="px-8 py-3.5 rounded-xl bg-[#AF101A] hover:bg-[#8F0D15] text-white font-bold transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>เปิดระบบทัวร์นาเมนต์ทันที</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/tournaments"
                className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition border border-slate-700"
              >
                ดูตัวอย่างทัวร์นาเมนต์ในระบบ
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Universal Footer */}
      <Footer />

      {/* Interactive Tournament Onboarding Modal */}
      <TournamentCreationWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}
