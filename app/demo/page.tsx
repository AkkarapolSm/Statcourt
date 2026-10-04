"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  Award,
  Clock,
  Heart,
  Sparkles,
  Zap,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Lock,
  Play,
  Trophy,
  Activity,
  Layers,
  Video,
  FileText,
  Search,
  BookOpen,
  Newspaper,
  Compass,
  Cpu,
  BarChart3,
  Calendar,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import type { Role, SubscriptionTier } from "@/lib/types";

interface PageTestItem {
  id: string;
  title: string;
  path: string;
  category: "ATHLETE" | "COACH" | "OFFICIAL" | "ADMIN" | "PUBLIC";
  categoryLabel: string;
  requiredRole: Role | "PUBLIC";
  requiredTier?: SubscriptionTier;
  icon: React.ElementType;
  description: string;
  testChecklist: string[];
}

const TEST_PAGES: PageTestItem[] = [
  // 1. ATHLETE & TCAS
  {
    id: "ath-profile",
    title: "โปรไฟล์นักกีฬา & Player Trading Card",
    path: "/athlete/ath-1",
    category: "ATHLETE",
    categoryLabel: "นักกีฬาเยาวชน (Athlete)",
    requiredRole: "ATHLETE",
    icon: Award,
    description: "หน้าโปรไฟล์สถิติ 4 มิติ, กราฟ Ape Index, แฟ้มสะสมงาน TCAS และปุ่มส่งออก Trading Card",
    testChecklist: [
      "ตรวจสอบ SVG QR Code และป้ายกำกับชีวมิติ 2 ภาษา",
      "ทดสอบปุ่ม Export PNG การ์ดนักกีฬา",
      "เปิดโมดัลประวัติการศึกษา (Academic Tracker)",
      "เปิดโมดัลส่งออกเอกสารแฟ้มสะสมงาน (TCAS Dossier PDF)",
    ],
  },
  {
    id: "tcas-quotas",
    title: "ศูนย์ข้อมูลโควตาทุนการศึกษา TCAS",
    path: "/opportunities",
    category: "ATHLETE",
    categoryLabel: "นักกีฬาเยาวชน (Athlete)",
    requiredRole: "PUBLIC",
    icon: BookOpen,
    description: "รวบรวมระเบียบการและเกณฑ์โควตานักกีฬาบาสเกตบอลของ 12 มหาวิทยาลัยชั้นนำรอบ Portfolio",
    testChecklist: [
      "ค้นหาโควตาตามสถาบันการศึกษา",
      "ตรวจสอบเกณฑ์ผลการเรียนขั้นต่ำ (GPAX)",
      "ดูสิทธิประโยชน์ทุนการศึกษาและการยกเว้นค่าเล่าเรียน",
    ],
  },

  // 2. COACH & SCOUT
  {
    id: "team-suite",
    title: "ศูนย์จัดการทีมและการฝึกซ้อม (Team Operations Suite)",
    path: "/team",
    category: "COACH",
    categoryLabel: "ผู้ฝึกสอน & แมวมอง (Coach & Scout)",
    requiredRole: "COACH",
    icon: Users,
    description: "ระบบวางแผนแท็กติกแข่งขัน, กราฟ Shot Chart เปรียบเทียบ, เช็กชื่อซ้อม และวิเคราะห์โหลด ACWR",
    testChecklist: [
      "สลับดูแท็กติกคู่แข่ง (Tactical Matchup Report)",
      "ทดสอบเครื่องมือ Shot Chart Interactive แผนผังจุดยิง",
      "เช็กชื่อการเข้าฝึกซ้อมและสถิติวินัย (Attendance Tracker)",
      "ตรวจดูดัชนีภาระงานความเหนื่อยล้า ACWR Sports Science",
    ],
  },
  {
    id: "scout-platform",
    title: "ระบบคัดกรองนักกีฬาอัจฉริยะ (Scout Intelligence Hub)",
    path: "/scout",
    category: "COACH",
    categoryLabel: "ผู้ฝึกสอน & แมวมอง (Coach & Scout)",
    requiredRole: "COACH",
    requiredTier: "PRO",
    icon: Search,
    description: "คลังข้อมูลแมวมองระดับประเทศ คัดกรองตามข้อมูลสรีระ (Wingspan, Standing Reach) และสถิติขั้นสูง",
    testChecklist: [
      "ทดสอบฟิลเตอร์คัดกรองตามตำแหน่ง ส่วนสูง และ Ape Index",
      "สลับแพ็กเกจ PRO เพื่อปลดล็อก TS% และ eFG%",
      "ดูรายชื่อและวิดีโอคลิปการเล่นของนักกีฬาเป้าหมาย",
    ],
  },
  {
    id: "teams-directory",
    title: "ทำเนียบสโมสรและทีมบาสเกตบอล",
    path: "/teams",
    category: "COACH",
    categoryLabel: "ผู้ฝึกสอน & แมวมอง (Coach & Scout)",
    requiredRole: "PUBLIC",
    icon: Trophy,
    description: "ฐานข้อมูลสโมสร โรงเรียน และอะคาเดมีบาสเกตบอลทั่วประเทศ พร้อมสถิติผลงานทีม",
    testChecklist: [
      "ดูรายชื่อทีมและสถิติการแข่งขันของแต่ละโรงเรียน",
      "คลิกเข้าชมหน้ารายละเอียดทีม เช่น BCC, Thepsirin",
    ],
  },

  // 3. TABLE OFFICIAL
  {
    id: "official-console",
    title: "คอนโซลโต๊ะบันทึกสถิติสด (Live Courtside Console)",
    path: "/official/console/match-bcc-ds-01",
    category: "OFFICIAL",
    categoryLabel: "เจ้าหน้าที่โต๊ะเทคนิค (Table Official)",
    requiredRole: "OFFICIAL",
    icon: Clock,
    description: "คอนโซลสำหรับเจ้าหน้าที่โต๊ะเทคนิคมาตรฐาน FIBA LiveStats บันทึกคะแนน, ฟาวล์ และย้อนคืนค่า",
    testChecklist: [
      "ทดสอบกดปุ่มบันทึกแต้ม 2PT / 3PT / FT",
      "ทดสอบระบบย้อนคืนคะแนน (Reverse Action)",
      "ตรวจสอบนาฬิกาการแข่งขันและบันทึกประวัติ (Audit Log)",
      "ทดสอบระบบ PIN ยืนยันตัวตนเจ้าหน้าที่",
    ],
  },
  {
    id: "academy-hub",
    title: "สถาบันพัฒนาบุคลากร StatCourt Academy",
    path: "/academy",
    category: "OFFICIAL",
    categoryLabel: "เจ้าหน้าที่โต๊ะเทคนิค (Table Official)",
    requiredRole: "PUBLIC",
    icon: Award,
    description: "หลักสูตรฝึกอบรมและทดสอบกติกา FIBA LiveStats สำหรับผู้ตัดสินและเจ้าหน้าที่โต๊ะเทคนิค",
    testChecklist: [
      "ดูรายชื่อคอร์สอบรมผู้ตัดสินโต๊ะเทคนิค",
      "เปิดเครื่องเล่นวิดีโอบทเรียน (Course Player Modal)",
      "ตรวจสอบคุณวุฒิและใบรับรอง (Certification Registry)",
    ],
  },

  // 4. FEDERATION ADMIN
  {
    id: "admin-control",
    title: "ศูนย์ควบคุมผู้ดูแลระบบสหพันธ์ (Federation Admin Command)",
    path: "/admin",
    category: "ADMIN",
    categoryLabel: "ผู้ดูแลระบบสหพันธ์ (Admin)",
    requiredRole: "ADMIN",
    icon: ShieldCheck,
    description: "ศูนย์กลางการบริหารสหพันธ์ อนุมัติใบอนุญาตเจ้าหน้าที่ จัดการทีมแข่งขัน และตรวจสอบ Audit Log",
    testChecklist: [
      "พิจารณาอนุมัติใบอนุญาตเจ้าหน้าที่โต๊ะเทคนิค (Official Approvals)",
      "ตรวจสอบและล็อกบัญชีรายชื่อแข่งขัน (Roster Lock & Audit)",
      "เปิดโมดัลตรวจสอบความสอดคล้องก่อนแข่ง (Pre-Approval Audit Modal)",
      "ดูประวัติการดำเนินการระบบความปลอดภัย (Security Audit Trail)",
    ],
  },
  {
    id: "tournaments-manager",
    title: "ระบบจัดตารางแข่งและสายการแข่งขัน (Tournament Brackets)",
    path: "/tournaments",
    category: "ADMIN",
    categoryLabel: "ผู้ดูแลระบบสหพันธ์ (Admin)",
    requiredRole: "ADMIN",
    icon: Layers,
    description: "บริหารจัดการลีกและทัวร์นาเมนต์ อัปเดตผังสายแข่งขันแบบแพ้คัดออกและพบกันหมด",
    testChecklist: [
      "ดูผังสายการแข่งขัน (Interactive Brackets)",
      "ตรวจสอบเวลาและสนามแข่งขันของแต่ละรอบ",
    ],
  },

  // 5. PUBLIC & COMPETITIONS
  {
    id: "live-hub",
    title: "ศูนย์ถ่ายทอดสดและวิดีโอเพลย์ (Live Match Hub)",
    path: "/live",
    category: "PUBLIC",
    categoryLabel: "ผู้ชม & สื่อมวลชน (Public & Media)",
    requiredRole: "PUBLIC",
    icon: Play,
    description: "ศูนย์รวมการแข่งขันสด กล่องคะแนนสดแบบเรียลไทม์ และวิดีโอเพลย์บายเพลย์",
    testChecklist: [
      "ดูคะแนนสดและ Play-by-play Feed",
      "ทดสอบกรองเพลย์ตามประเภทแต้มหรือทีม",
      "เปิดเครื่องมือสร้างภาพสรุปโซเชียล (Social Graphics Generator)",
    ],
  },
  {
    id: "standings-page",
    title: "ตารางคะแนนรวมทัวร์นาเมนต์ (Standings)",
    path: "/standings",
    category: "PUBLIC",
    categoryLabel: "ผู้ชม & สื่อมวลชน (Public & Media)",
    requiredRole: "PUBLIC",
    icon: BarChart3,
    description: "ตารางอันดับคะแนนสะสมรอบแบ่งกลุ่มและผลต่างประตูได้เสียตามมาตรฐาน FIBA",
    testChecklist: [
      "ตรวจสอบตารางคะแนนสาย A และสาย B",
      "ตรวจสอบคะแนน ชนะ 2 / แพ้ 1 / สละสิทธิ์ 0",
    ],
  },
  {
    id: "leaderboard-page",
    title: "ทำเนียบผู้นำสถิติประจำฤดูกาล (Stat Leaders)",
    path: "/leaderboard",
    category: "PUBLIC",
    categoryLabel: "ผู้ชม & สื่อมวลชน (Public & Media)",
    requiredRole: "PUBLIC",
    icon: Activity,
    description: "อันดับผู้เล่นยอดเยี่ยมในแต่ละหมวดสถิติ (PPG, APG, RPG, FIBA EFF, 3P%)",
    testChecklist: [
      "สลับดูหมวดสถิติคะแนน, รีบาวด์, แอสซิสต์",
      "คลิกเข้าชมโปรไฟล์ของผู้นำสถิติแต่ละคน",
    ],
  },
  {
    id: "game-film",
    title: "ห้องวิเคราะห์วิดีโอเทปเพลย์ (Game Film Room)",
    path: "/matches/match-bcc-ds-01/film",
    category: "PUBLIC",
    categoryLabel: "ผู้ชม & สื่อมวลชน (Public & Media)",
    requiredRole: "PUBLIC",
    icon: Video,
    description: "ห้องชมและวิเคราะห์วิดีโอเทปการแข่งขันย้อนหลังแบบซิงค์กับสถิติทุกเพลย์",
    testChecklist: [
      "ทดสอบคลิกที่เพลย์เพื่อเลื่อนวิดีโอไปยังจังหวะทำแต้ม",
      "ตรวจสอบการแสดงผลกราฟิกสรุปผลงาน",
    ],
  },
  {
    id: "news-page",
    title: "ศูนย์ข่าวสารและสรุปผลการแข่งขัน (News & Recaps)",
    path: "/news",
    category: "PUBLIC",
    categoryLabel: "ผู้ชม & สื่อมวลชน (Public & Media)",
    requiredRole: "PUBLIC",
    icon: Newspaper,
    description: "บทวิเคราะห์เกม ข่าวการย้ายทีม และสรุปผลการแข่งขันประจำสัปดาห์",
    testChecklist: [
      "อ่านบทความสรุปผลการแข่งขันรอบรองชนะเลิศ",
    ],
  },
  {
    id: "solutions-page",
    title: "โซลูชันเทคโนโลยีสำหรับองค์กร (Solutions By Role)",
    path: "/solutions",
    category: "PUBLIC",
    categoryLabel: "ผู้ชม & สื่อมวลชน (Public & Media)",
    requiredRole: "PUBLIC",
    icon: Compass,
    description: "รายละเอียดฟังก์ชันและแพ็กเกจสำหรับผู้จัดแข่งขัน โรงเรียน และแมวมอง",
    testChecklist: [
      "สลับแท็บตามบทบาทองค์กร 3 รูปแบบ",
      "ตรวจสอบแพ็กเกจค่าบริการและฟังก์ชันเฉพาะทาง",
    ],
  },
];

export default function DemoHubPage() {
  const router = useRouter();
  const { currentUser, switchRole } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [loadingPageId, setLoadingPageId] = useState<string | null>(null);

  const handleNavigate = async (item: PageTestItem) => {
    setLoadingPageId(item.id);
    try {
      // If page requires a specific role and current user does not have it, switch automatically!
      if (item.requiredRole !== "PUBLIC" && currentUser.role !== item.requiredRole) {
        await switchRole(item.requiredRole, item.requiredTier || currentUser.tier);
      } else if (item.requiredTier === "PRO" && currentUser.tier !== "PRO") {
        await switchRole(currentUser.role, "PRO");
      }
      router.push(item.path);
    } finally {
      setLoadingPageId(null);
    }
  };

  const filteredPages =
    selectedFilter === "ALL"
      ? TEST_PAGES
      : TEST_PAGES.filter((p) => p.category === selectedFilter);

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans antialiased">
      {/* Universal Navbar */}
      <Navbar />

      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* ============================================================== */}
        {/* 1. HERO HEADER                                                 */}
        {/* ============================================================== */}
        <div className="bg-[#0B1C30] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#AF101A]/15 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 blur-[90px] pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#AF101A]/20 border border-[#AF101A]/50 text-red-200 font-mono text-xs font-bold tracking-widest uppercase">
                <Zap className="w-3.5 h-3.5 text-[#FF7A7A]" />
                <span>INTERACTIVE TEST DIRECTORY &amp; ROLE PLAYGROUND</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                ศูนย์รวมทางลัดทดสอบระบบ StatCourtTH
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                เข้าชมและทดสอบทุกหน้าของระบบได้ทันทีในคลิกเดียว โดยไม่ต้องสมัครสมาชิกใหม่ 
                ระบบจะจำลองสิทธิ์ผู้ใช้งานจริงพร้อม Session ให้อัตโนมัติ
              </p>
            </div>

            {/* Current Active Status Pill */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shrink-0 space-y-2 min-w-[240px]">
              <span className="text-[11px] font-mono text-slate-400 block uppercase font-bold">
                สถานะสิทธิ์ปัจจุบันของคุณ:
              </span>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white font-mono text-sm uppercase">
                    {currentUser.role}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                    currentUser.tier === "PRO"
                      ? "bg-amber-400 text-slate-950"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {currentUser.tier === "PRO" ? "PRO TIER ★" : "FREE TIER"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                ผู้ใช้: {currentUser.name || "ผู้เข้าชมทั่วไป"}
              </p>
            </div>
          </div>

          {/* Quick Role Switch Bar inside Hero */}
          <div className="relative z-10 pt-1 flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-slate-400 font-bold mr-1">สลับสิทธิ์ด่วน:</span>
            {[
              { role: "ATHLETE", label: "🏀 นักกีฬา (Athlete)", tier: "FREE" },
              { role: "COACH", label: "👔 โค้ช/สเกาต์ (Coach Pro)", tier: "PRO" },
              { role: "OFFICIAL", label: "⏱️ กรรมการ (Official)", tier: "FREE" },
              { role: "ADMIN", label: "🛡️ ผู้ดูแลระบบ (Admin)", tier: "PRO" },
              { role: "FAN", label: "❤️ แฟนคลับ (Fan)", tier: "FREE" },
              { role: "PUBLIC", label: "🌐 บุคคลทั่วไป (Public)", tier: "FREE" },
            ].map((btn) => (
              <button
                key={btn.role}
                type="button"
                onClick={() => switchRole(btn.role as Role, btn.tier as SubscriptionTier)}
                className={`px-3 py-1.5 rounded-lg border transition font-bold cursor-pointer ${
                  currentUser.role === btn.role
                    ? "bg-[#AF101A] border-red-500 text-white shadow-md shadow-red-950/40"
                    : "bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. FILTER TABS                                                 */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "ALL", label: "ทั้งหมด (15 หน้า)" },
              { key: "ATHLETE", label: "🏀 นักกีฬา & TCAS" },
              { key: "COACH", label: "👔 โค้ช & แมวมอง" },
              { key: "OFFICIAL", label: "⏱️ กรรมการโต๊ะ" },
              { key: "ADMIN", label: "🛡️ ผู้ดูแลระบบ" },
              { key: "PUBLIC", label: "🏆 เกมสด & สื่อ" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition font-mono cursor-pointer ${
                  selectedFilter === tab.key
                    ? "bg-[#0B1C30] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-mono">
            แสดงผล {filteredPages.length} หน้า
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. PAGES CARDS GRID                                            */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPages.map((page) => {
            const IconComp = page.icon;
            const isLoading = loadingPageId === page.id;
            const hasRequiredRole =
              page.requiredRole === "PUBLIC" || currentUser.role === page.requiredRole;

            return (
              <div
                key={page.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Meta Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {page.categoryLabel}
                    </span>

                    {page.requiredRole !== "PUBLIC" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>ต้องใช้สิทธิ์ {page.requiredRole}</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Path */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-[#AF101A] text-slate-700 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0B1C30] text-base group-hover:text-[#AF101A] transition-colors leading-snug">
                        {page.title}
                      </h3>
                      <code className="text-[11px] text-slate-500 font-mono block mt-0.5">
                        {page.path}
                      </code>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {page.description}
                  </p>

                  {/* Checklist */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-700 font-sans">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                      จุดที่แนะนำให้ทดสอบ:
                    </span>
                    {page.testChecklist.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] leading-tight">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Trigger */}
                <button
                  type="button"
                  onClick={() => handleNavigate(page)}
                  disabled={Boolean(loadingPageId)}
                  className={`w-full py-2.5 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                    hasRequiredRole
                      ? "bg-[#0B1C30] hover:bg-[#1A365D] text-white"
                      : "bg-[#AF101A] hover:bg-[#8E0D15] text-white"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังสลับสิทธิ์และเปิดหน้า...</span>
                    </>
                  ) : hasRequiredRole ? (
                    <>
                      <span>เปิดหน้านี้ทันที</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>สลับเป็น {page.requiredRole} &amp; เปิดหน้านี้</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* 4. FOOTER NOTE                                                 */}
        {/* ============================================================== */}
        <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 text-center space-y-1 font-mono text-xs text-slate-600">
          <p className="font-bold text-slate-800">
            ระบบจำลองสิทธิ์ StatCourtTH Demo Environment
          </p>
          <p className="text-[11px] text-slate-500 max-w-xl mx-auto">
            Session ทั้งหมดได้รับการประมวลผลผ่าน Session Broker บนเซิร์ฟเวอร์จริง 
            คุณสามารถทดสอบสิทธิ์ระดับสูง การบันทึกสถิติ และการเรียกดูเอกสารลับได้เสมือนการใช้งานจริงทุกประการ
          </p>
        </div>

      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
