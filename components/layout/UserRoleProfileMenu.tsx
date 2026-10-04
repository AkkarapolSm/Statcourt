"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, ChevronDown, Shield, Users, Award, Clock, Heart, ExternalLink, KeyRound, Zap } from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { ROLE_METADATA } from "@/lib/auth/rbac";
import AccountSecurityModal from "@/components/auth/AccountSecurityModal";

export default function UserRoleProfileMenu() {
  const { currentUser, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  if (currentUser.role === "PUBLIC") {
    return (
      <div className="flex items-center gap-2 text-xs font-mono font-bold">
        <Link
          href="/demo"
          className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs"
          title="เปิดศูนย์รวมทางลัดทดสอบระบบ (Demo Hub)"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>ทดสอบระบบ</span>
        </Link>
        <Link
          href="/auth/login"
          className="text-[#0B1C30] hover:text-[#AF101A] px-2.5 py-1.5 rounded transition"
        >
          เข้าสู่ระบบ
        </Link>
        <Link
          href="/auth/register"
          className="rounded-lg bg-[#AF101A] hover:bg-[#8E0D15] px-3 py-1.5 text-white transition shadow-xs"
        >
          สมัครสมาชิก
        </Link>
      </div>
    );
  }

  const roleMeta = ROLE_METADATA[currentUser.role] || ROLE_METADATA.PUBLIC;

  const getWorkspaceUrl = () => {
    switch (currentUser.role) {
      case "COACH":
        return "/team";
      case "OFFICIAL":
        return "/official/console/match-bcc-ds-01";
      case "ATHLETE":
        return currentUser.athleteId ? `/athlete/${currentUser.athleteId}` : "/athlete/ath-1";
      case "ADMIN":
        return "/admin";
      case "FAN":
      default:
        return "/teams";
    }
  };

  const getWorkspaceLabel = () => {
    switch (currentUser.role) {
      case "COACH":
        return "ศูนย์จัดการทีม & แมวมอง (Team Suite)";
      case "OFFICIAL":
        return "โต๊ะควบคุมคะแนนสด (Console)";
      case "ATHLETE":
        return "โปรไฟล์นักกีฬา (Athlete Hub)";
      case "ADMIN":
        return "ศูนย์ควบคุมผู้ดูแลระบบ (Admin Command)";
      case "FAN":
      default:
        return "ทำเนียบทีม & สถิติ";
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
        aria-expanded={dropdownOpen}
      >
        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
          {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
        </div>

        <div className="hidden md:flex flex-col text-left max-w-[120px]">
          <span className="text-xs font-bold text-slate-800 truncate leading-tight">
            {currentUser.name}
          </span>
          <span className="text-[10px] text-slate-500 font-mono truncate leading-tight">
            {currentUser.organization || roleMeta.labelEn}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900 truncate">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {currentUser.email || "dev-account@statcourt.th"}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${roleMeta.badgeBg} ${roleMeta.badgeText} ${roleMeta.badgeBorder}`}
              >
                {currentUser.role}
              </span>
              <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                {currentUser.tier}
              </span>
            </div>
          </div>

          <div className="py-1">
            <Link
              href={getWorkspaceUrl()}
              onClick={() => setDropdownOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <span>{getWorkspaceLabel()}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <Link
              href="/demo"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center justify-between px-3.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold">ศูนย์รวมทดสอบระบบ (Demo)</span>
              </div>
              <ExternalLink className="w-3 h-3 text-emerald-500" />
            </Link>

            <button
              onClick={() => {
                setDropdownOpen(false);
                setSecurityModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>ความปลอดภัย &amp; เซสชัน</span>
              </div>
              <KeyRound className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          <div className="pt-1 border-t border-slate-100">
            <button
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ (Sign Out)</span>
            </button>
          </div>
        </div>
      )}

      {/* Account Security Lifecycle & Sessions Modal */}
      <AccountSecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />
    </div>
  );
}
