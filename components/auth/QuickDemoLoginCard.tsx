"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Award,
  Clock,
  Heart,
  Sparkles,
  Zap,
  ArrowRight,
  Loader2,
  Check,
  Layers,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import type { Role, SubscriptionTier } from "@/lib/types";

interface DemoRoleOption {
  role: Role;
  titleTh: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  description: string;
  destinationUrl: string;
  destinationLabel: string;
}

const DEMO_ROLES: DemoRoleOption[] = [
  {
    role: "ATHLETE",
    titleTh: "นักกีฬาเยาวชน (Student Athlete)",
    badge: "ATHLETE",
    badgeColor: "bg-blue-900/60 text-blue-200 border-blue-500/50",
    icon: Award,
    description: "หน้าโปรไฟล์สถิติ 4 มิติ, แฟ้มสะสมงาน TCAS Portfolio และบัตร Digital Player Pass",
    destinationUrl: "/athlete/ath-1",
    destinationLabel: "เปิดโปรไฟล์ TCAS",
  },
  {
    role: "COACH",
    titleTh: "ผู้ฝึกสอน / แมวมอง (Coach & Scout)",
    badge: "COACH",
    badgeColor: "bg-emerald-900/60 text-emerald-200 border-emerald-500/50",
    icon: Users,
    description: "ระบบจัดการทีม (Team Suite), วางแผนแท็กติก, แผนผัง Shot Chart และค้นหาผู้เล่น",
    destinationUrl: "/team",
    destinationLabel: "เปิดศูนย์จัดการทีม",
  },
  {
    role: "OFFICIAL",
    titleTh: "เจ้าหน้าที่โต๊ะเทคนิค (Table Official)",
    badge: "OFFICIAL",
    badgeColor: "bg-red-900/60 text-red-200 border-red-500/50",
    icon: Clock,
    description: "คอนโซลโต๊ะบันทึกคะแนนและสถิติสดมาตรฐาน FIBA LiveStats พร้อมระบบ Audit Log",
    destinationUrl: "/official/console/match-bcc-ds-01",
    destinationLabel: "เปิด Live Console",
  },
  {
    role: "ADMIN",
    titleTh: "ผู้ดูแลระบบสหพันธ์ (Federation Admin)",
    badge: "ADMIN",
    badgeColor: "bg-purple-900/60 text-purple-200 border-purple-500/50",
    icon: ShieldCheck,
    description: "ศูนย์ควบคุมสหพันธ์, จัดตารางแข่งและสายการแข่งขัน (Brackets), อนุมัติสิทธิ์กรรมการ",
    destinationUrl: "/tournaments",
    destinationLabel: "เปิดหน้าทัวร์นาเมนต์ & สายแข่ง",
  },
  {
    role: "FAN",
    titleTh: "แฟนคลับ / ผู้ติดตาม (Fan & General)",
    badge: "FAN",
    badgeColor: "bg-amber-900/60 text-amber-200 border-amber-500/50",
    icon: Heart,
    description: "ศูนย์ถ่ายทอดสดและวิดีโอเพลย์ (Live Hub), ติดตามทีมโปรด และโหวตผู้เล่น",
    destinationUrl: "/live",
    destinationLabel: "เปิดศูนย์ถ่ายทอดสด",
  },
];

interface QuickDemoLoginCardProps {
  mode?: "compact" | "full";
  className?: string;
}

export default function QuickDemoLoginCard({
  mode = "full",
  className = "",
}: QuickDemoLoginCardProps) {
  const router = useRouter();
  const { switchRole, currentUser } = useAuthStore();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("PRO");

  const handleQuickLogin = async (option: DemoRoleOption) => {
    setLoadingRole(option.role);
    try {
      const ok = await switchRole(option.role, selectedTier);
      if (ok) {
        router.push(option.destinationUrl);
      }
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div
      className={`bg-[#0B1C30] border-2 border-emerald-500/40 rounded-xl p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#AF101A]/10 blur-[80px] pointer-events-none rounded-full" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-mono text-[11px] font-bold tracking-wider uppercase">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>1-CLICK TEST LOGIN (โหมดทดสอบระบบ)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-sans font-bold text-white leading-tight">
            เข้าทดสอบได้ทันที — ไม่ต้องสมัครสมาชิก
          </h2>
          <p className="text-xs text-slate-300 font-sans">
            เลือกบทบาทที่ต้องการทดสอบด้านล่างเพื่อเข้าสู่ระบบพร้อม Session จริงทันทีในคลิกเดียว:
          </p>
        </div>

        {/* Tier Toggle Switch */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-lg shrink-0 self-start sm:self-auto font-mono text-xs">
          <span className="text-[11px] text-slate-400 pl-1">แพ็กเกจ:</span>
          <button
            type="button"
            onClick={() => setSelectedTier("FREE")}
            className={`px-2.5 py-1 rounded font-bold text-xs transition cursor-pointer ${
              selectedTier === "FREE"
                ? "bg-slate-700 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            FREE
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier("PRO")}
            className={`px-2.5 py-1 rounded font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
              selectedTier === "PRO"
                ? "bg-amber-400 text-slate-950 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>PRO ★</span>
          </button>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-4">
        {DEMO_ROLES.map((option) => {
          const IconComp = option.icon;
          const isLoading = loadingRole === option.role;
          const isCurrent = currentUser.role === option.role;

          return (
            <div
              key={option.role}
              className={`p-3 rounded-lg border transition-all flex flex-col justify-between gap-3 text-left ${
                isCurrent
                  ? "bg-slate-900/95 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30"
                  : "bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center shrink-0">
                      <IconComp className="w-4 h-4 text-slate-200" />
                    </div>
                    <span className="text-xs font-bold text-white truncate font-sans">
                      {option.titleTh.split(" (")[0]}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border uppercase shrink-0 ${option.badgeColor}`}
                  >
                    {option.badge}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-sans leading-relaxed line-clamp-2">
                  {option.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin(option)}
                disabled={Boolean(loadingRole)}
                className="w-full py-2 px-3 rounded bg-white/10 hover:bg-[#AF101A] text-white hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : isCurrent ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>สิทธิ์ปัจจุบัน · ไปที่หน้า</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <span>เข้าสู่ระบบทันที</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation Link */}
      <div className="relative z-10 mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
        <span className="text-slate-400 text-[11px]">
          * ระบบจะบันทึก Session ใน Browser ทันที คุณสามารถสลับสิทธิ์กลับเป็นผู้ใช้ทั่วไปได้ตลอดเวลา
        </span>

        <Link
          href="/demo"
          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 transition underline sm:no-underline hover:underline cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>ดูสารบัญหน้าทั้งหมดในระบบ (Demo Test Directory)</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
