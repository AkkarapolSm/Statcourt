"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  Award,
  ChevronDown,
  LogOut,
  Sparkles,
  Compass,
  Users,
  Film,
  Trophy,
  GraduationCap,
  QrCode,
  Ruler,
  CheckCircle2,
  Lock,
  ArrowRight,
  SlidersHorizontal,
  Heart,
  Bell,
  ShoppingBag,
  Calendar,
  Star,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { ExtendedRole, getRoleBadgeInfo, ROLE_METADATA } from "@/lib/auth/rbac";
import PricingModal from "@/components/premium/PricingModal";

export default function UserRoleProfileMenu() {
  const { currentUser, loginAs, logout, toggleSubscriptionTier } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsRoleSwitcherOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="h-8 w-24 bg-slate-100 rounded-md animate-pulse" />
    );
  }

  const roleMeta = getRoleBadgeInfo(currentUser.role);
  const isPublic = currentUser.role === "PUBLIC";
  const isPro = currentUser.tier === "PRO";

  const handleRoleSelect = (role: ExtendedRole) => {
    loginAs(role);
    setIsOpen(false);
    setIsRoleSwitcherOpen(false);
  };

  return (
    <div className="relative shrink-0" ref={menuRef}>
      {/* Trigger Button */}
      {isPublic ? (
        <div className="flex items-center gap-1.5">
          {/* Quick Simulation Badge */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="hidden sm:inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold transition shadow-xs cursor-pointer"
            title="คลิกเพื่อสลับ Role ทดสอบระบบ (Guest / Athlete / Coach / Official / Admin)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="font-mono text-[11px] uppercase">GUEST</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Sign In / Register CTA */}
          <Link
            href="/auth/register"
            className="bg-primary hover:bg-red-700 text-white font-bold uppercase px-3 py-1.5 rounded-md flex items-center gap-1 shadow-xs active:scale-95 transition-all text-xs tracking-wider whitespace-nowrap cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg border transition-all shadow-xs cursor-pointer ${
            isOpen
              ? "bg-slate-100 border-primary ring-2 ring-primary/10"
              : "bg-white hover:bg-slate-50 border-slate-200"
          }`}
          title={`${currentUser.name} (${roleMeta.labelEn})`}
        >
          {/* Avatar with Role Ping Ring */}
          <div className="relative">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                currentUser.role === "OFFICIAL"
                  ? "bg-red-600"
                  : currentUser.role === "COACH"
                  ? "bg-emerald-600"
                  : currentUser.role === "ATHLETE"
                  ? "bg-blue-600"
                  : currentUser.role === "ADMIN"
                  ? "bg-purple-600"
                  : currentUser.role === "FAN"
                  ? "bg-amber-500"
                  : "bg-slate-400"
              }`}
            />
          </div>

          {/* User Name & Role Chip */}
          <div className="text-left hidden sm:block max-w-[130px] lg:max-w-[150px]">
            <p className="text-xs font-bold text-slate-800 truncate leading-tight">
              {currentUser.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`text-[9px] font-black uppercase font-mono px-1.5 py-0.2 rounded ${roleMeta.badgeBg} ${roleMeta.badgeText}`}
              >
                {roleMeta.shortLabel}
              </span>
              {isPro && (
                <span className="text-[9px] font-black font-mono text-amber-600 bg-amber-50 px-1 rounded">
                  PRO
                </span>
              )}
            </div>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>
      )}

      {/* Floating Profile & RBAC Drawer Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Card */}
          <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white/20 shadow-sm"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-base border-2 border-white/20">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    currentUser.role === "OFFICIAL"
                      ? "bg-red-500"
                      : currentUser.role === "COACH"
                      ? "bg-emerald-500"
                      : currentUser.role === "ATHLETE"
                      ? "bg-blue-500"
                      : currentUser.role === "ADMIN"
                      ? "bg-purple-500"
                      : currentUser.role === "FAN"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white truncate">
                    {currentUser.name}
                  </h4>
                  <span
                    className={`text-[10px] font-black uppercase font-mono px-1.5 py-0.5 rounded shadow-xs ${roleMeta.badgeBg} ${roleMeta.badgeText}`}
                  >
                    {roleMeta.shortLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  {currentUser.organization || currentUser.email}
                </p>
                {currentUser.licenseNumber && (
                  <p className="text-[10px] text-amber-300 font-mono mt-0.5">
                    License: {currentUser.licenseNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Subscription Tier Strip */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-300 text-[11px] font-bold">Plan:</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded shadow-2xs ${
                    isPro ? "bg-amber-400 text-slate-950" : "bg-slate-700 text-white"
                  }`}
                >
                  {isPro ? "⭐ PRO" : "FREE"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Segmented Switch: FREE | PRO */}
                <div className="inline-flex items-center bg-slate-950 rounded-md p-0.5 border border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => {
                      if (isPro) toggleSubscriptionTier();
                    }}
                    title="สลับเป็นโหมด FREE"
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      !isPro
                        ? "bg-slate-700 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    FREE
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isPro) toggleSubscriptionTier();
                    }}
                    title="สลับเป็นโหมด PRO"
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      isPro
                        ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Star className="w-2.5 h-2.5 fill-current text-amber-500" />
                    <span>PRO</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsPricingModalOpen(true);
                  }}
                  className="text-[10px] text-slate-400 hover:text-amber-300 transition underline underline-offset-2 ml-1 cursor-pointer"
                  title="ดูรายละเอียดแพ็กเกจทั้งหมด"
                >
                  แพ็กเกจ
                </button>
              </div>
            </div>
          </div>

          {/* Role-Specific Quick Actions */}
          <div className="p-2 border-b border-slate-100">
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              {roleMeta.labelTh} ({roleMeta.labelEn})
            </p>

            {/* ATHLETE ACTIONS */}
            {currentUser.role === "ATHLETE" && (
              <div className="space-y-0.5">
                <Link
                  href="/athlete/ath-1"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition"
                >
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight">โปรไฟล์ของฉัน (My Profile)</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      สถิติส่วนบุคคล, กราฟพัฒนาการ &amp; แมตช์ล่าสุด
                    </p>
                  </div>
                </Link>

                <Link
                  href="/athlete/ath-1?tab=TCAS"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition"
                >
                  <GraduationCap className="w-4 h-4 text-purple-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight">แฟ้มสะสมงาน TCAS 1 Portfolio</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      ส่งออก PDF ทางการพร้อม QR Code รับรอง
                    </p>
                  </div>
                </Link>

                <Link
                  href="/athlete/ath-1?tab=OVERVIEW"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition"
                >
                  <Ruler className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight">สัดส่วนสรีระ &amp; Ape Index</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      อัปเดตส่วนสูง, Wingspan และ Standing Reach
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* COACH ACTIONS */}
            {currentUser.role === "COACH" && (
              <div className="space-y-0.5">
                <Link
                  href="/scout"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition"
                >
                  <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight">Scout Talent Hub (ค้นหาดาวรุ่ง)</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      กรองสรีระ 190+, Wingspan &amp; TS% ประเมินโควตา
                    </p>
                  </div>
                </Link>

                <Link
                  href="/team"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition"
                >
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight">จัดการทีม &amp; Roster Lineup</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      วางแผนผังผู้เล่น 5 ตัวจริงและสถิติสโมสร
                    </p>
                  </div>
                </Link>

                <Link
                  href="/matches/match-bcc-ds-01/film"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition"
                >
                  <Film className="w-4 h-4 text-purple-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight">Game Film Room &amp; แท็กติก</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      เทปบันทึกเกมและวิเคราะห์เพลย์ย้อนหลัง
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* OFFICIAL ACTIONS */}
            {currentUser.role === "OFFICIAL" && (
              <div className="space-y-0.5">
                <Link
                  href="/official/console/match-bcc-ds-01"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight font-black">
                      Table Official Console (เปิดสด)
                    </p>
                    <p className="text-[10px] text-red-600/80 font-normal">
                      คุมนาฬิกา 1000Hz, บันทึกคะแนน และเซ็นชื่อดิจิทัล
                    </p>
                  </div>
                </Link>

                <div className="px-2.5 py-2 bg-slate-50 rounded-lg text-xs text-slate-600">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-slate-700">BSAT License:</span>
                    <span className="text-emerald-600 font-bold">VERIFIED</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {currentUser.licenseNumber || "BSAT-TABLE-2026-088"}
                  </p>
                </div>
              </div>
            )}

            {/* ADMIN ACTIONS */}
            {currentUser.role === "ADMIN" && (
              <div className="space-y-0.5">
                <Link
                  href="/solutions"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition"
                >
                  <Trophy className="w-4 h-4 text-purple-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight font-black">
                      Tournament Creator &amp; B2B SaaS
                    </p>
                    <p className="text-[10px] text-purple-600/80 font-normal">
                      เปิดทัวร์นาเมนต์ใหม่, จัดสายแข่ง และระบบโต๊ะเทคนิค
                    </p>
                  </div>
                </Link>

                <Link
                  href="/official/console/match-bcc-ds-01"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-primary transition"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight">ตรวจสอบ Table Console &amp; Audit</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      ดูบันทึกข้อพิพาทและลายเซ็นดิจิทัล SHA-256
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* FAN ACTIONS (สมาชิกทั่วไป / แฟนคลับ) */}
            {currentUser.role === "FAN" && (
              <div className="space-y-0.5">
                <Link
                  href="/team"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition"
                >
                  <Heart className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500/20" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight">ทีมโปรดที่ติดตาม (BCC Basketball)</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      แจ้งเตือนแมตช์แข่งขัน &amp; สถิติผู้เล่นที่ชื่นชอบ
                    </p>
                  </div>
                </Link>

                <Link
                  href="/live"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition"
                >
                  <Bell className="w-4 h-4 text-red-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight">แจ้งเตือนคะแนนสด &amp; ถ่ายทอดสด</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      เกาะติดผลสดแบบ Play-by-Play ไม่พลาดทุกแต้ม
                    </p>
                  </div>
                </Link>

                <Link
                  href="/marketplace"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight">Gear Market &amp; ตั๋วเข้าชม</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      ซื้อเสื้อทีม, อุปกรณ์บาสเกตบอล และบัตรที่นั่ง VIP
                    </p>
                  </div>
                </Link>

                <Link
                  href="/tournaments"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition"
                >
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="leading-tight">ตารางทัวร์นาเมนต์ &amp; สายแข่ง</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      ผังรอบน็อกเอาต์ Brackets และสนามแข่งขัน
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* PUBLIC ACTIONS */}
            {currentUser.role === "PUBLIC" && (
              <div className="space-y-1 p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">
                  คุณกำลังใช้งานในโหมด <b>ผู้เข้าชมทั่วไป</b> สามารถดูผลการแข่งขันและตารางคะแนนได้ฟรี
                </p>
                <div className="flex gap-1.5 pt-1">
                  <Link
                    href="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center bg-primary hover:bg-red-700 text-white font-bold text-[11px] py-1.5 rounded transition"
                  >
                    สมัครสมาชิก
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Role Switcher Simulation Strip (For Demo & Evaluator) */}
          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                <span>จำลองสลับบทบาท (Role Switcher)</span>
              </span>
              <span className="text-[10px] text-slate-400">คลิกเพื่อสลับ</span>
            </div>

            <div className="grid grid-cols-6 gap-1 text-[11px] font-bold font-mono">
              {(["PUBLIC", "FAN", "ATHLETE", "COACH", "OFFICIAL", "ADMIN"] as ExtendedRole[]).map((r) => {
                const isSelected = currentUser.role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`py-1 rounded text-center transition cursor-pointer border ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs font-black"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {r.substring(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logout Action */}
          {!isPublic && (
            <div className="p-2 bg-white border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ (Sign Out)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        defaultPerspective={currentUser.role === "COACH" || currentUser.role === "OFFICIAL" ? "SCOUT" : "ATHLETE"}
      />
    </div>
  );
}
