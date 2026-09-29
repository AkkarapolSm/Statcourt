"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldCheck,
  Users,
  Award,
  Clock,
  Heart,
  Globe,
  Check,
  ChevronDown,
  Sparkles,
  Zap,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import type { Role, SubscriptionTier } from "@/lib/types";

interface RoleOption {
  role: Role | "PUBLIC";
  nameTh: string;
  nameEn: string;
  badge: string;
  colorScheme: {
    pillBg: string;
    pillText: string;
    pillBorder: string;
    indicator: string;
    activeBorder: string;
    iconColor: string;
  };
  icon: React.ElementType;
  descriptionTh: string;
  suggestedUrl: string;
  suggestedLabel: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "ADMIN",
    nameTh: "ผู้ดูแลระบบสหพันธ์",
    nameEn: "Federation Admin",
    badge: "ADMIN",
    colorScheme: {
      pillBg: "bg-purple-950/80 hover:bg-purple-900",
      pillText: "text-purple-200",
      pillBorder: "border-purple-600/70",
      indicator: "bg-purple-400",
      activeBorder: "border-purple-500 bg-purple-500/10",
      iconColor: "text-purple-400",
    },
    icon: ShieldCheck,
    descriptionTh: "ควบคุมระบบทั้งหมด, อนุมัติสิทธิ์กรรมการ, จัดตารางแข่ง, สิทธิ์เต็มทุกหน้า",
    suggestedUrl: "/tournaments",
    suggestedLabel: "หน้าจัดการทัวร์นาเมนต์",
  },
  {
    role: "COACH",
    nameTh: "ผู้ฝึกสอน / แมวมอง",
    nameEn: "Head Coach & Scout",
    badge: "COACH",
    colorScheme: {
      pillBg: "bg-emerald-950/80 hover:bg-emerald-900",
      pillText: "text-emerald-200",
      pillBorder: "border-emerald-600/70",
      indicator: "bg-emerald-400",
      activeBorder: "border-emerald-500 bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    icon: Users,
    descriptionTh: "จัดทีม, จัดไลน์อัพแข่งขัน, ลงทะเบียนทีม, แผนกลยุทธ์, ติดตามการซ้อม",
    suggestedUrl: "/team",
    suggestedLabel: "ศูนย์จัดการทีม (Team Suite)",
  },
  {
    role: "ATHLETE",
    nameTh: "นักกีฬาเยาวชน",
    nameEn: "Student Athlete",
    badge: "ATHLETE",
    colorScheme: {
      pillBg: "bg-blue-950/80 hover:bg-blue-900",
      pillText: "text-blue-200",
      pillBorder: "border-blue-600/70",
      indicator: "bg-blue-400",
      activeBorder: "border-blue-500 bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    icon: Award,
    descriptionTh: "ข้อมูลสรีระ Ape Index, แฟ้มสะสมงาน TCAS, บัตร Digital Pass, สถิติส่วนตัว",
    suggestedUrl: "/athlete/ath-01",
    suggestedLabel: "หน้าโปรไฟล์นักกีฬา (TCAS)",
  },
  {
    role: "OFFICIAL",
    nameTh: "เจ้าหน้าที่โต๊ะเทคนิค",
    nameEn: "Table Official (FIBA)",
    badge: "OFFICIAL",
    colorScheme: {
      pillBg: "bg-red-950/80 hover:bg-red-900",
      pillText: "text-red-200",
      pillBorder: "border-red-600/70",
      indicator: "bg-red-500",
      activeBorder: "border-red-500 bg-red-500/10",
      iconColor: "text-red-400",
    },
    icon: Clock,
    descriptionTh: "ควบคุมนาฬิกา, บันทึกคะแนน/ฟาวล์สด, Live Console โต๊ะกรรมการ, Export Ledger",
    suggestedUrl: "/official/console/match-bcc-ds-01",
    suggestedLabel: "โต๊ะควบคุมคะแนนสด (Console)",
  },
  {
    role: "FAN",
    nameTh: "แฟนคลับ / ผู้ติดตาม",
    nameEn: "Basketball Fan",
    badge: "FAN",
    colorScheme: {
      pillBg: "bg-amber-950/80 hover:bg-amber-900",
      pillText: "text-amber-200",
      pillBorder: "border-amber-600/70",
      indicator: "bg-amber-400",
      activeBorder: "border-amber-500 bg-amber-500/10",
      iconColor: "text-amber-400",
    },
    icon: Heart,
    descriptionTh: "ติดตามทีมโปรด, โหวตผู้เล่น, แจ้งเตือนผลสด, บันทึกไฮไลต์การแข่ง",
    suggestedUrl: "/teams",
    suggestedLabel: "ทำเนียบสโมสร & ติดตามทีม",
  },
  {
    role: "PUBLIC",
    nameTh: "บุคคลทั่วไป (ไม่ได้เข้าสู่ระบบ)",
    nameEn: "Public Spectator",
    badge: "GUEST",
    colorScheme: {
      pillBg: "bg-slate-800 hover:bg-slate-700",
      pillText: "text-slate-200",
      pillBorder: "border-slate-600",
      indicator: "bg-slate-400",
      activeBorder: "border-slate-400 bg-slate-500/10",
      iconColor: "text-slate-400",
    },
    icon: Globe,
    descriptionTh: "มุมมองผู้เข้าชมทั่วไปก่อนลงชื่อเข้าใช้ (Public Landing, ผลสด, ข่าว)",
    suggestedUrl: "/",
    suggestedLabel: "หน้าแรกสาธารณะ",
  },
];

export default function NavbarRoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, switchRole, toggleSubscriptionTier } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Active configuration based on current user role
  const activeRoleOption =
    ROLE_OPTIONS.find((r) => r.role === currentUser.role) || ROLE_OPTIONS[5];

  // Close when clicked outside or on Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleRoleSelect = async (option: RoleOption, navigate: boolean = false) => {
    setSwitching(option.role);
    try {
      const ok = await switchRole(option.role, currentUser.tier);
      if (ok) {
        setToastMessage(`สลับสิทธิ์เป็น [${option.badge}] สำเร็จ`);
        setTimeout(() => setToastMessage(null), 3500);

        if (navigate && option.suggestedUrl) {
          setIsOpen(false);
          router.push(option.suggestedUrl);
        } else {
          // Refresh current page so role-based guards re-evaluate
          router.refresh();
        }
      }
    } finally {
      setSwitching(null);
      setIsOpen(false);
    }
  };

  const handleTierToggle = async () => {
    const nextTier: SubscriptionTier = currentUser.tier === "PRO" ? "FREE" : "PRO";
    setSwitching("TIER");
    try {
      await switchRole(currentUser.role, nextTier);
      setToastMessage(`เปลี่ยนแพ็กเกจเป็น [${nextTier}] เรียบร้อย`);
      setTimeout(() => setToastMessage(null), 3000);
      router.refresh();
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2 bg-[#0B1C30] text-white border border-emerald-500/60 shadow-2xl px-4 py-2.5 rounded-xl text-xs font-mono font-bold animate-in fade-in slide-in-from-top-2">
          <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition shadow-xs cursor-pointer ${activeRoleOption.colorScheme.pillBg} ${activeRoleOption.colorScheme.pillText} ${activeRoleOption.colorScheme.pillBorder}`}
        title="คลิกเพื่อสลับสิทธิ์ผู้ใช้งาน (Developer Role Switcher)"
        aria-expanded={isOpen}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeRoleOption.colorScheme.indicator}`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${activeRoleOption.colorScheme.indicator}`}
          />
        </span>

        <span className="hidden sm:inline text-[11px] font-semibold tracking-wide text-slate-300">
          สิทธิ์:
        </span>

        <span className="tracking-wider uppercase font-black">
          {activeRoleOption.badge}
        </span>

        {currentUser.tier === "PRO" && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black tracking-widest shadow-2xs">
            <Sparkles className="w-2.5 h-2.5" />
            PRO
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 opacity-80 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Modal Flyout */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[420px] max-w-[95vw] bg-[#0B1C30] border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-white z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#DC2626]">
                <Zap className="w-3.5 h-3.5" />
                <span>ROLE & ACCESS SWITCHER</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                สลับบทบาทการเข้าถึงระบบ
              </h3>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                เลือกสิทธิ์เพื่อดูหน้าต่าง ๆ ได้ทันทีโดยไม่ต้องสมัครบัญชีใหม่
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Subscription Tier Toggle (Free vs Pro) */}
          <div className="my-3 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-200">
                  แพ็กเกจ: {currentUser.tier === "PRO" ? "PRO SCOUT (ปลดล็อกเต็มรูปแบบ)" : "FREE TIER (พื้นฐาน)"}
                </p>
                <p className="text-[10px] text-slate-400">
                  {currentUser.tier === "PRO"
                    ? "เปิดใช้งาน Shot Chart, TS%, eFG% และ Dossier แล้ว"
                    : "คลิกเพื่อจำลองสิทธิ์ระดับ PRO สเกาต์มืออาชีพ"}
                </p>
              </div>
            </div>
            <button
              onClick={handleTierToggle}
              disabled={switching === "TIER"}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
                currentUser.tier === "PRO"
                  ? "bg-amber-400 hover:bg-amber-300 text-slate-950"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
            >
              {switching === "TIER" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : currentUser.tier === "PRO" ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>PRO ★</span>
                </>
              ) : (
                <span>เปิด PRO</span>
              )}
            </button>
          </div>

          {/* Role Cards List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
            {ROLE_OPTIONS.map((option) => {
              const isCurrent = currentUser.role === option.role;
              const IconComp = option.icon;
              const isThisSwitching = switching === option.role;

              return (
                <div
                  key={option.role}
                  className={`p-2.5 rounded-xl border transition-all text-left flex flex-col gap-2 ${
                    isCurrent
                      ? `${option.colorScheme.activeBorder} border-2`
                      : "bg-slate-900/60 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isCurrent ? "bg-white/10" : "bg-slate-800"
                        } ${option.colorScheme.iconColor}`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {option.nameTh}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded border ${option.colorScheme.pillBg} ${option.colorScheme.pillText} ${option.colorScheme.pillBorder}`}
                          >
                            {option.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {option.descriptionTh}
                        </p>
                      </div>
                    </div>

                    {/* Switch Button */}
                    <button
                      type="button"
                      onClick={() => handleRoleSelect(option, false)}
                      disabled={isThisSwitching}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase transition shrink-0 cursor-pointer ${
                        isCurrent
                          ? "bg-white/20 text-white cursor-default"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                      }`}
                    >
                      {isThisSwitching ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isCurrent ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Check className="w-3 h-3" />
                          <span>ใช้งานอยู่</span>
                        </span>
                      ) : (
                        <span>เลือกสิทธิ์</span>
                      )}
                    </button>
                  </div>

                  {/* Quick Link to Suggested Page */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono">
                    <span className="text-slate-500">ปลายทางแนะนำ:</span>
                    <button
                      type="button"
                      onClick={() => handleRoleSelect(option, true)}
                      className="text-slate-300 hover:text-[#DC2626] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>{option.suggestedLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-center">
            <p className="text-[10px] font-mono text-slate-400">
              * ข้อมูลจะถูกซิงค์ทั้ง Session Server และ Client State พร้อมกันแบบ Real-time
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
