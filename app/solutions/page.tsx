"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TournamentCreationWizardModal from "@/components/solutions/TournamentCreationWizardModal";
import TournamentRoiCalculator from "@/components/solutions/TournamentRoiCalculator";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { canAccessOfficialConsole } from "@/lib/auth/rbac";
import {
  ArrowRight,
  ShieldCheck,
  Radio,
  FileText,
  Sparkles,
  QrCode,
  Check,
  Plus,
  Play,
  Clock,
  Award,
} from "lucide-react";

export default function SolutionsLandingPage() {
  const { currentUser } = useAuthStore();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const hasConsoleAccess = canAccessOfficialConsole(currentUser);

  const faqs = [
    {
      q: "ระบบรองรับกติกาบาสเกตบอลของสหพันธ์บาสเกตบอลนานาชาติ (FIBA) หรือไม่?",
      a: "รองรับตามมาตรฐานสากลครับ ระบบ Table Official Console ถูกออกแบบตามกฎ FIBA Official Basketball Rules รองรับเวลาแข่งขัน 4 ควอเตอร์ ควอเตอร์ละ 10 นาที (หรือปรับแต่งตามรุ่นอายุ), ช็อตคล็อก 24 วินาที และ 14 วินาที (รีเซ็ตหลังรีบาวด์เกมบุก), การนับฟาวล์บุคคลและฟาวล์ทีม พร้อมระบบ Undo เพื่อแก้ไขเหตุการณ์ย้อนหลังได้ทันท่วงที",
    },
    {
      q: "การถ่ายทอดสดสถิติ (Live Streaming) ต้องใช้อุปกรณ์อะไรบ้าง?",
      a: "ผู้จัดต้องการเพียงแท็บเล็ต iPad หรือโน้ตบุ๊ก 1 เครื่องประจำโต๊ะกรรมการที่มีสัญญาณอินเทอร์เน็ต (สามารถใช้ Hotspot จากมือถือได้) เมื่อกรรมการกดบันทึกคะแนน ระบบจะส่งข้อมูลไปยังผู้ชมบนมือถือผ่านเทคโนโลยี Server-Sent Events (SSE) แบบ Real-Time ทันที โดยไม่ต้องใช้อุปกรณ์ถ่ายทอดสดราคาแพง",
    },
    {
      q: "ระบบช่วยป้องกันปัญหานักกีฬาปลอมอายุ หรือสวมสิทธิ์ข้ามรุ่นอย่างไร?",
      a: "StatCourtTH มีระบบ Digital Player Pass ที่ผูกข้อมูลนักเรียนกับเลขประจำตัวประชาชน และระบุรุ่นอายุที่สามารถลงแข่งขันได้ชัดเจน กรรมการสามารถสแกน QR Code หน้าสนามก่อนลงแข่งเพื่อยืนยันตัวตนและตรวจสอบสิทธิ์ได้ทันที",
    },
    {
      q: "สามารถส่งออกใบบันทึกคะแนนทางการ (FIBA Scoresheet) ได้หรือไม่?",
      a: "ได้ครับ เมื่อจบการแข่งขัน ระบบสามารถ Export ใบบันทึกคะแนน 4 ควอเตอร์พร้อมลายเซ็นดิจิทัลของผู้ตัดสินและผู้บันทึกคะแนนเป็นไฟล์ PDF ตามแบบฟอร์มมาตรฐานสากล เพื่อนำส่งฝ่ายจัดการแข่งขันหรือสมาคมฯ ได้ทันที",
    },
    {
      q: "มีค่าบริการอย่างไร?",
      a: "เรามีแพ็กเกจ Community สำหรับทัวร์นาเมนต์ขนาดเล็กทดลองใช้ฟรี และแพ็กเกจ Pro สำหรับทัวร์นาเมนต์ทางการ เริ่มต้น 8,900 บาทต่อรายการ (ไม่จำกัดจำนวนคู่แข่งขันตลอดทัวร์นาเมนต์) ครอบคลุมระบบโต๊ะกรรมการ, ถ่ายทอดสดคะแนน และระบบรับรองสถิติสำหรับแฟ้มสะสมงาน TCAS",
    },
  ];

  return (
    <div className="bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans antialiased min-h-screen selection:bg-[#AF101A] selection:text-white">
      {/* Universal Navigation */}
      <Navbar />

      <main className="flex-1 pb-20 space-y-16 lg:space-y-20">
        {/* ============================================================== */}
        {/* 1. HERO SECTION: EDITORIAL COURTSIDE STAGE                     */}
        {/* ============================================================== */}
        <section className="bg-[#0B1C30] text-white pt-14 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 court-grid-pattern opacity-10 pointer-events-none" />

          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 text-slate-200 text-xs font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-[#FF7A7A]" />
                <span>สำหรับผู้จัดการแข่งขัน สโมสร และองค์กรกีฬา</span>
              </div>

              <h1 className="font-headline text-white uppercase text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                จัดการแข่งขันบาสเกตบอล <br />
                <span className="text-[#FF7A7A]">ด้วยระบบดิจิทัลที่ทุกคนเชื่อถือ</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans max-w-2xl">
                เปลี่ยนความยุ่งยากของใบบันทึกคะแนนกระดาษ สู่ระบบโต๊ะเทคนิคสัมผัส (Table Official Console), สตรีมมิ่งสถิติสดระดับเสี้ยววินาที, ตรวจสอบคุณสมบัตินักกีฬาด้วย Digital Pass และออกใบบันทึกคะแนนมาตรฐานสากลในคลิกเดียว
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5 font-sans text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(true)}
                  className="bg-[#AF101A] hover:bg-[#8E0D15] text-white font-bold px-6 py-3.5 rounded transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>เปิดระบบทัวร์นาเมนต์</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {hasConsoleAccess ? (
                  <Link
                    href="/official/console/match-bcc-ds-01"
                    className="bg-white/10 hover:bg-white/15 text-white font-medium px-5 py-3.5 rounded border border-slate-700 flex items-center gap-2 transition"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>ทดลองใช้ระบบโต๊ะกรรมการ</span>
                  </Link>
                ) : (
                  <a
                    href="#roi-calculator"
                    className="bg-white/10 hover:bg-white/15 text-white font-medium px-5 py-3.5 rounded border border-slate-700 flex items-center gap-2 transition"
                  >
                    <span>คำนวณงบประมาณและความคุ้มค่า</span>
                  </a>
                )}
              </div>
            </div>

            {/* Service Capabilities Strip */}
            <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-6 font-sans text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>กติกามาตรฐาน FIBA</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  ควบคุมเวลา ฟาวล์ และช็อตคล็อก 24/14 วิ ตามกฎสากล
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>ใช้งานได้แม้ออฟไลน์</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  บันทึกลงเครื่องอัตโนมัติ ไม่ต้องกังวลเรื่องสัญญาณเน็ตในสนาม
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Radio className="w-4 h-4 shrink-0" />
                  <span>คะแนนสดบนมือถือ</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  สตรีมคะแนนสดถึงผู้ชมและผู้ปกครองแบบเรียลไทม์
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#FF7A7A] font-bold">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>รับรองสถิติ TCAS</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  สถิติที่ได้รับรอง นำไปใช้ยื่นพอร์ตโฟลิโอเข้ามหาวิทยาลัยได้จริง
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 2. CORE CAPABILITIES: 4 PILLARS                                */}
        {/* ============================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 space-y-2">
            <span className="text-xs font-mono text-[#AF101A] font-bold uppercase tracking-wider block">
              TOURNAMENT CAPABILITIES
            </span>
            <h2 className="font-headline text-[#0B1C30] uppercase text-2xl sm:text-3xl font-bold">
              ครบทุกฟังก์ชันที่ฝ่ายจัดการแข่งขันต้องการ
            </h2>
            <p className="text-[#5B6574] text-xs sm:text-sm leading-relaxed">
              ออกแบบจากประสบการณ์การจัดการแข่งขันจริง ลดข้อผิดพลาดของกรรมการ และยกระดับมาตรฐานรายการให้เป็นที่ยอมรับ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-lg bg-white border border-[#DFE2EB] space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded bg-red-50 text-[#AF101A] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0B1C30]">
                  โต๊ะบันทึกคะแนนระบบสัมผัส
                </h3>
                <p className="text-xs text-[#5B6574] leading-relaxed">
                  ควบคุมนาฬิกาแข่ง, ช็อตคล็อก 24/14 วิ, แต้ม และฟาวล์ผ่านแท็บเล็ต 10 นิ้ว พร้อมปุ่ม Undo เหตุการณ์ย้อนหลังเพื่อแก้ไขความผิดพลาดได้ทันที
                </p>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium pt-2 border-t border-slate-100 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>รองรับกฎ FIBA 2026</span>
              </span>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-lg bg-white border border-[#DFE2EB] space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0B1C30]">
                  สตรีมคะแนนสดสู่มือถือ
                </h3>
                <p className="text-xs text-[#5B6574] leading-relaxed">
                  ส่งผลคะแนน, ช็อตคล็อก และเพลย์ต่อเพลย์สู่หน้าจอผู้ชมและผู้ปกครองทั่วโลกแบบ Real-time โดยไม่ต้องพึ่งพารถถ่ายทอดสดราคาแพง
                </p>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium pt-2 border-t border-slate-100 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>ส่งข้อมูลแบบเรียลไทม์</span>
              </span>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-lg bg-white border border-[#DFE2EB] space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0B1C30]">
                  บัตรนักกีฬา Digital Pass
                </h3>
                <p className="text-xs text-[#5B6574] leading-relaxed">
                  หมดปัญหาข้อพิพาทเรื่องนักกีฬาปลอมอายุหรือสวมสิทธิ์ข้ามรุ่น ด้วยบัตรประจำตัวดิจิทัล เจ้าหน้าที่สามารถสแกนเช็กชื่อหน้าสนามได้รวดเร็ว
                </p>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium pt-2 border-t border-slate-100 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>สแกนตรวจสอบใน 3 วินาที</span>
              </span>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-lg bg-white border border-[#DFE2EB] space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0B1C30]">
                  ออกใบคะแนน FIBA ใน 1 คลิก
                </h3>
                <p className="text-xs text-[#5B6574] leading-relaxed">
                  เมื่อจบเกม ดาวน์โหลดใบบันทึกคะแนนเป็นไฟล์ PDF ตามแบบฟอร์มทางการ พร้อมสถิติรายบุคคลสำหรับใช้ยื่นพอร์ตโฟลิโอโควตากีฬา TCAS
                </p>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium pt-2 border-t border-slate-100 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>ส่งออก PDF ทางการทันที</span>
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 3. INTERACTIVE ROI CALCULATOR SECTION                          */}
        {/* ============================================================== */}
        <section id="roi-calculator" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <TournamentRoiCalculator />
        </section>

        {/* ============================================================== */}
        {/* 4. COMPARISON MATRIX: TRADITIONAL VS STATCOURTTH SAAS          */}
        {/* ============================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8 space-y-2">
            <span className="text-xs font-mono uppercase text-[#AF101A] font-bold tracking-wider block">
              OPERATIONAL COMPARISON
            </span>
            <h2 className="font-headline text-[#0B1C30] uppercase text-2xl sm:text-3xl font-bold">
              เปรียบเทียบการจัดแบบเดิม vs ระบบ StatCourtTH
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6574]">
              ทำไมฝ่ายจัดการแข่งขันยุคใหม่จึงเปลี่ยนมาใช้ระบบดิจิทัล
            </p>
          </div>

          <div className="bg-white border border-[#DFE2EB] rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#DFE2EB] text-[#0B1C30] text-[11px] font-mono">
                    <th className="py-3 px-5 font-bold w-1/4">กระบวนการ</th>
                    <th className="py-3 px-5 font-bold text-[#5B6574] w-3/8">การจัดแบบเดิม (กระดาษ)</th>
                    <th className="py-3 px-5 font-bold text-[#AF101A] bg-red-50/30 w-3/8">ระบบ StatCourtTH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-5 font-bold text-[#0B1C30]">การบันทึกคะแนนและเวลา</td>
                    <td className="py-3.5 px-5 text-[#5B6574]">ใช้ปากกาเขียน เสี่ยงต่อการคำนวณคะแนนผิดพลาด</td>
                    <td className="py-3.5 px-5 text-emerald-800 font-medium bg-red-50/10">
                      หน้าจอสัมผัส FIBA Console คำนวณแต้มและฟาวล์อัตโนมัติ
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-5 font-bold text-[#0B1C30]">การรายงานผลสดให้ผู้ชม</td>
                    <td className="py-3.5 px-5 text-[#5B6574]">ต้องรอสรุปหลังจบเกม หรือใช้ทีมถ่ายทอดสดต้นทุนสูง</td>
                    <td className="py-3.5 px-5 text-emerald-800 font-medium bg-red-50/10">
                      สตรีมคะแนนสดถึงมือถือผู้ชมและผู้ปกครองแบบเรียลไทม์ ฟรี
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-5 font-bold text-[#0B1C30]">การตรวจสอบคุณสมบัติผู้เล่น</td>
                    <td className="py-3.5 px-5 text-[#5B6574]">ตรวจสำเนาเอกสาร เสี่ยงต่อการสวมสิทธิ์และโกงอายุ</td>
                    <td className="py-3.5 px-5 text-emerald-800 font-medium bg-red-50/10">
                      สแกน Digital Player Pass ตรวจสอบสิทธิ์ใน 3 วินาที
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-5 font-bold text-[#0B1C30]">การออกใบบันทึกคะแนน</td>
                    <td className="py-3.5 px-5 text-[#5B6574]">ต้องถ่ายสำเนาหรือพิมพ์ใหม่เพื่อส่งสมาคมฯ</td>
                    <td className="py-3.5 px-5 text-emerald-800 font-medium bg-red-50/10">
                      ดาวน์โหลดเป็น PDF ทางการตามแบบฟอร์มสากลได้ทันที
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-5 font-bold text-[#0B1C30]">สถิติสำหรับนักกีฬา</td>
                    <td className="py-3.5 px-5 text-[#5B6574]">ไม่มีระบบบันทึกสถิติที่เป็นทางการรายบุคคล</td>
                    <td className="py-3.5 px-5 text-emerald-800 font-medium bg-red-50/10">
                      รับรองสถิติเพื่อนำไปใช้ยื่นพอร์ตโฟลิโอโควตา TCAS ได้จริง
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
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 space-y-2">
            <span className="text-xs font-mono uppercase text-[#AF101A] font-bold tracking-wider block">
              TRANSPARENT PRICING
            </span>
            <h2 className="font-headline text-[#0B1C30] uppercase text-2xl sm:text-3xl font-bold">
              แพ็กเกจราคาสำหรับผู้จัดการแข่งขัน
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6574]">
              เลือกแพ็กเกจที่เหมาะสมกับขนาดของทัวร์นาเมนต์ ไม่มีค่าใช้จ่ายแอบแฝง
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Free Plan */}
            <div className="p-6 rounded-lg bg-white border border-[#DFE2EB] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#5B6574] font-bold">COMMUNITY</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    ฟรี
                  </span>
                </div>
                <div>
                  <span className="text-3xl font-black text-[#0B1C30] font-mono">ฟรี</span>
                  <span className="text-xs text-[#5B6574] font-sans"> / ทัวร์นาเมนต์</span>
                </div>
                <p className="text-xs text-[#5B6574] leading-relaxed">
                  สำหรับทัวร์นาเมนต์กระชับมิตร หรือการแข่งขันภายในโรงเรียน/ชมรม
                </p>
                <div className="space-y-2 text-xs text-[#0B1C30] pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>รองรับสูงสุด 8 ทีม</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ระบบโต๊ะบันทึกคะแนนพื้นฐาน</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ตารางสายการแข่งขันอัตโนมัติ</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWizardOpen(true)}
                className="w-full py-2.5 rounded bg-slate-100 hover:bg-slate-200 text-[#0B1C30] text-xs font-bold transition cursor-pointer"
              >
                เริ่มใช้งานฟรี
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-6 rounded-lg bg-white border-2 border-[#AF101A] space-y-4 flex flex-col justify-between relative shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#AF101A] font-bold">PRO TOURNAMENT</span>
                  <span className="text-[#AF101A] bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">
                    แนะนำ
                  </span>
                </div>
                <div>
                  <span className="text-3xl font-black text-[#0B1C30] font-mono">8,900</span>
                  <span className="text-xs text-[#5B6574] font-sans"> บาท / รายการ</span>
                </div>
                <p className="text-xs text-[#5B6574] leading-relaxed">
                  สำหรับทัวร์นาเมนต์เยาวชนและประชาชนระดับจังหวัดและประเทศ ไม่จำกัดจำนวนแมตช์
                </p>
                <div className="space-y-2 text-xs text-[#0B1C30] pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ไม่จำกัดจำนวนทีมและคู่แข่งขัน</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ถ่ายทอดสดคะแนนผ่าน SSE สู่หน้า /live</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ระบบ Digital Player Pass ตรวจสอบอายุ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ออกใบบันทึกคะแนน FIBA Scoresheet PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>รับรองสถิติสำหรับแฟ้มสะสมงาน TCAS</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWizardOpen(true)}
                className="w-full py-3 rounded bg-[#AF101A] hover:bg-[#8E0D15] text-white text-xs font-bold transition cursor-pointer"
              >
                เปิดระบบ Pro Tournament (8,900 บาท)
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-6 rounded-lg bg-[#0B1C30] border border-slate-800 text-white space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold">FEDERATION &amp; LEAGUE</span>
                  <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                    องค์กร
                  </span>
                </div>
                <div>
                  <span className="text-3xl font-black text-white font-mono">ติดต่อทีมงาน</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  สำหรับลีกอาชีพ สมาคมกีฬา และทัวร์นาเมนต์ระดับภูมิภาคหลายสนาม
                </p>
                <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800 font-sans">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>เชื่อมต่อกล้องวิดีโอหลายมุม (Multi-Cam)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>ระบบชาเลนจ์ภาพช้าผู้ตัดสิน (FIBA IRS)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Custom Branding &amp; โดเมนเฉพาะ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>มีเจ้าหน้าที่เทคนิคประจำสนาม (On-site)</span>
                  </div>
                </div>
              </div>

              <a
                href="mailto:partner@statcourt.th"
                className="w-full py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition text-center block border border-slate-700"
              >
                ติดต่อฝ่ายพันธมิตร
              </a>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 6. FAQ SECTION (CLEAN NATIVE DISCLOSURE)                       */}
        {/* ============================================================== */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 space-y-2">
            <h2 className="font-headline text-[#0B1C30] uppercase text-2xl sm:text-3xl font-bold">
              คำถามที่พบบ่อย
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6574]">
              ข้อสงสัยเกี่ยวกับการใช้งานระบบโต๊ะกรรมการและข้อกำหนดทางเทคนิค
            </p>
          </div>

          <div className="space-y-3 font-sans">
            {faqs.map(({ q, a }, index) => (
              <details
                key={index}
                className="rounded-lg bg-white border border-[#DFE2EB] p-4 sm:p-5 group transition"
              >
                <summary className="font-bold text-sm text-[#0B1C30] cursor-pointer list-none flex items-center justify-between gap-4">
                  <span>{q}</span>
                  <Plus className="w-4 h-4 text-[#5B6574] shrink-0 group-open:rotate-45 transition-transform duration-200" />
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-[#5B6574] leading-relaxed border-t border-slate-100 pt-3">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 7. CLOSING BANNER                                              */}
        {/* ============================================================== */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-lg bg-[#0B1C30] border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h2 className="font-headline text-white uppercase text-2xl sm:text-3xl font-bold">
                พร้อมยกระดับทัวร์นาเมนต์ของคุณหรือยัง?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                เปิดระบบได้ในไม่กี่ขั้นตอน ดึงดูดทีมชั้นนำ และร่วมสร้างมาตรฐานใหม่ให้วงการบาสเกตบอลไทย
              </p>
            </div>

            <div className="shrink-0 flex flex-wrap items-center gap-3 font-sans text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setIsWizardOpen(true)}
                className="px-6 py-3 rounded bg-[#AF101A] hover:bg-[#8E0D15] text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>เปิดระบบทัวร์นาเมนต์ทันที</span>
              </button>

              <Link
                href="/tournaments"
                className="px-5 py-3 rounded bg-white/10 hover:bg-white/15 text-white font-medium transition border border-slate-700"
              >
                ดูทัวร์นาเมนต์ในระบบ
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
