"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Shield,
  Users,
  Award,
  Clock,
  Sparkles,
  ExternalLink,
  X,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import type { Role, SubscriptionTier } from "@/lib/types";

interface RoleOption {
  role: Role | "PUBLIC";
  label: string;
  sub: string;
  icon: React.ElementType;
  targetUrl: string;
  color: string;
}

const ROLES: RoleOption[] = [
  {
    role: "ATHLETE",
    label: "Athlete (นักกีฬา)",
    sub: "โปรไฟล์ & TCAS Portfolio",
    icon: Award,
    targetUrl: "/athlete/ath-1",
    color: "bg-blue-600 hover:bg-blue-500",
  },
  {
    role: "COACH",
    label: "Coach / Scout",
    sub: "จัดการทีม & คลังแมวมอง",
    icon: Users,
    targetUrl: "/team",
    color: "bg-amber-600 hover:bg-amber-500",
  },
  {
    role: "OFFICIAL",
    label: "Table Official",
    sub: "โต๊ะบันทึกคะแนน FIBA Live",
    icon: Clock,
    targetUrl: "/official/console/match-bcc-ds-01",
    color: "bg-purple-600 hover:bg-purple-500",
  },
  {
    role: "ADMIN",
    label: "Tournament Admin",
    sub: "ระบบทัวร์นาเมนต์ & ควบคุมสิทธิ์",
    icon: Shield,
    targetUrl: "/admin",
    color: "bg-red-700 hover:bg-red-600",
  },
  {
    role: "PUBLIC",
    label: "Guest / Public",
    sub: "มุมมองผู้เข้าชมทั่วไป",
    icon: Sparkles,
    targetUrl: "/",
    color: "bg-slate-700 hover:bg-slate-600",
  },
];

export default function QuickTestFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [tier, setTier] = useState<SubscriptionTier>("PRO");
  const { currentUser, switchRole } = useAuthStore();
  const router = useRouter();

  const handleQuickSwitch = async (item: RoleOption) => {
    setLoadingRole(item.role);
    try {
      const ok = await switchRole(item.role, tier);
      if (ok) {
        setIsOpen(false);
        router.push(item.targetUrl);
      }
    } catch (err) {
      console.error("Role switch error:", err);
      alert("เกิดข้อผิดพลาดในการสลับสิทธิ์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <aside aria-label="แถบทดสอบระบบสิทธิ์ผู้ใช้งาน" className="fixed bottom-4 right-4 z-[9999] font-sans">
      {/* Floating Trigger Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-[#0B1C30] hover:bg-[#132a47] text-white border-2 border-emerald-400 rounded-full shadow-[0_4px_24px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_28px_rgba(16,185,129,0.6)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
          title="คลิกเพื่อเปิดเครื่องมือทดสอบสิทธิ์ผู้ใช้งานทุกบทบาท"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wide text-emerald-300 font-sans">
              ⚡ ทดสอบสิทธิ์ (Demo Roles)
            </span>
            <span className="text-[10px] text-slate-300 font-sans">
              สิทธิ์ปัจจุบัน: <b className="text-white underline font-mono">{currentUser.role}</b>
            </span>
          </div>
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
        </button>
      ) : (
        /* Expanded Floating Card */
        <div className="w-[340px] max-w-[calc(100vw-32px)] bg-[#0B1C30] text-white border-2 border-emerald-400 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Zap className="w-4 h-4 fill-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wide text-white font-sans">
                  ⚡ ทางลัดทดสอบระบบ (Quick Switcher)
                </h3>
                <p className="text-[10px] text-emerald-300 font-sans">
                  ไม่ต้องสมัครสมาชิก • สลับสิทธิ์ในคลิกเดียว
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              aria-label="ปิดเมนูทดสอบ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current State & Tier Selector */}
          <div className="my-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">สิทธิ์ปัจจุบันของคุณ:</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {currentUser.role} ({currentUser.tier})
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setTier("FREE")}
                className={`text-[10px] font-bold px-2 py-1 rounded-md font-mono transition cursor-pointer ${
                  tier === "FREE"
                    ? "bg-slate-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                FREE
              </button>
              <button
                type="button"
                onClick={() => setTier("PRO")}
                className={`text-[10px] font-bold px-2 py-1 rounded-md font-mono transition flex items-center gap-1 cursor-pointer ${
                  tier === "PRO"
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                PRO ★
              </button>
            </div>
          </div>

          {/* 1-Click Role Switch Buttons */}
          <div className="space-y-1.5 my-2">
            <span className="text-[10px] text-slate-400 block px-1 font-sans">
              คลิกเพื่อสวมสิทธิ์ & ไปยังหน้าทำงาน:
            </span>
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isLoading = loadingRole === r.role;
              const isCurrent = currentUser.role === r.role;

              return (
                <button
                  key={r.role}
                  onClick={() => handleQuickSwitch(r)}
                  disabled={!!loadingRole}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition cursor-pointer ${
                    isCurrent
                      ? "bg-emerald-950/60 border-emerald-400 text-white"
                      : "bg-slate-800/80 border-slate-700/80 hover:bg-slate-700/80 hover:border-slate-500 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg text-white ${r.color} shrink-0`}>
                      {isLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold leading-tight truncate font-sans">
                        {r.label}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight truncate font-sans">
                        {r.sub}
                      </p>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-bold font-sans px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                      ใช้งานอยู่
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Full Demo Hub Link */}
          <div className="pt-2 border-t border-slate-700 mt-2">
            <Link
              href="/demo"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md"
            >
              <span>🚀 เปิดศูนย์รวมทดสอบระบบ (15 หน้า)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
