"use client";

import React from "react";
import Link from "next/link";
import { KeyRound, ShieldCheck, ExternalLink, Award, UserPlus } from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { canAccessOfficialConsole, canCreateTournament } from "@/lib/auth/rbac";

export default function Footer() {
  const { currentUser } = useAuthStore();
  const hasConsoleAccess = canAccessOfficialConsole(currentUser);
  const canCreate = canCreateTournament(currentUser);


  return (
    <footer className="bg-[#0B1C30] border-t border-[#7F8A9E]/30 text-[#DFE2EB]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand & Certification */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <svg width="20" height="18" viewBox="0 0 24 22" fill="none" aria-hidden="true">
              <rect x="2" y="10" width="4.5" height="12" rx="1" fill="#FF7A7A" />
              <rect x="9.5" y="4" width="4.5" height="18" rx="1" fill="#FF7A7A" />
              <rect x="17" y="0" width="4.5" height="22" rx="1" fill="#FF7A7A" />
            </svg>
            <span className="font-barlow font-black text-xl text-white">
              STATCOURT<span className="text-[#FF7A7A]">.TH</span>
            </span>
          </div>
          <p className="text-xs text-[#DFE2EB]/70 leading-relaxed">
            ติดตามเกม ดูสถิติ และค้นพบโอกาสต่อไปของนักบาสไทย จัดทำตามกติกา FIBA และแนวทางของ BSAT
          </p>
        </div>

        {/* Col 2: Regulatory & Verification */}
        <div>
          <h4 className="font-heading font-bold text-white text-sm mb-3">
            การรับรองและมาตรฐาน
          </h4>
          <ul className="space-y-2 text-xs text-[#DFE2EB]/80">
            <li>
              <Link href="/matches/match-bcc-ds-01/film" className="hover:text-white transition-colors block">
                FIBA LiveStats Verification
              </Link>
            </li>
            <li>
              <Link href="/academy" className="hover:text-white transition-colors block">
                BSAT &amp; FIBA Standards Alignment
              </Link>
            </li>
            <li>
              <Link href="/athlete/ath-1" className="hover:text-white transition-colors block">
                TCAS Sports Quota Portal
              </Link>
            </li>
            <li>
              <Link
                href="/solutions"
                className="text-[#FF7A7A] hover:text-white transition-colors block font-medium"
              >
                B2B Tournament SaaS &amp; Solutions
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className="hover:text-white transition-colors block">
                National Talent Pipeline
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Rules & Portal Guidelines */}
        <div>
          <h4 className="font-heading font-bold text-white text-sm mb-3">
            การคัดตัวและชุมชน
          </h4>
          <ul className="space-y-2 text-xs text-[#DFE2EB]/80">
            <li>
              <Link href="/leaderboard" className="hover:text-white transition-colors block">
                เกณฑ์การค้นหานักกีฬา (Scouting Guidelines)
              </Link>
            </li>
            <li>
              <Link href="/academy" className="hover:text-white transition-colors block">
                กติกาการบันทึกสถิติและแบบทดสอบ
              </Link>
            </li>
            <li>
              <span className="hover:text-white transition-colors block cursor-pointer">
                ข้อกำหนดการใช้งาน
              </span>
            </li>
            <li>
              <span className="hover:text-white transition-colors block cursor-pointer">
                นโยบายความเป็นส่วนตัว (PDPA)
              </span>
            </li>
            <li>
              <span className="hover:text-white transition-colors block cursor-pointer">
                สถานะระบบ v4.2
              </span>
            </li>
          </ul>
        </div>

        {/* Col 4: Table Official Contact & Credentials */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-white text-sm">
            เจ้าหน้าที่โต๊ะเทคนิค
          </h4>
          <p className="text-xs text-[#DFE2EB]/70 leading-relaxed">
            ระบบเข้าสู่ระบบสำหรับเจ้าหน้าที่โต๊ะเทคนิคและผู้บันทึกสถิติที่ผ่านการรับรองเพื่อจัดการคอนโซลและส่งรายงานผลการแข่งขัน
          </p>
          {hasConsoleAccess ? (
            <Link
              href="/official/console/match-bcc-ds-01"
              className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold py-2 px-3 rounded-lg border border-white/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Table Dispatch Console</span>
            </Link>
          ) : (
            <Link
              href="/academy"
              className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold py-2 px-3 rounded-lg border border-white/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>StatCourt Academy Portal</span>
            </Link>
          )}
        </div>
      </div>

      {/* Copyright Sub-bar */}
      <div className="border-t border-white/10 py-4 text-[#DFE2EB]/60 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span>
            © 2026 STATCOURT.TH Basketball Intelligence &amp; Analytics. Standardized to FIBA Official Basketball Rules &amp; BSAT Guidelines. All rights reserved.
          </span>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition">Security Disclosures</span>
            <span className="hover:text-white cursor-pointer transition">Data Protection (PDPA)</span>
            <span className="hover:text-white cursor-pointer transition">FIBA API Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
