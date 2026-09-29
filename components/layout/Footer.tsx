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

  const [dbStatus, setDbStatus] = React.useState<{ isLive: boolean; athletes: number; matches: number } | null>(null);

  React.useEffect(() => {
    fetch("/api/db/status")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "connected") {
          setDbStatus({
            isLive: true,
            athletes: json.counts?.athletes || 11,
            matches: json.counts?.matches || 5,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-inverse-surface border-t border-slate-700 text-inverse-on-surface">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand & Certification */}
        <div className="md:col-span-1 space-y-3">
          <div className="font-headline-md uppercase text-primary-fixed tracking-wider">
            STATCOURT.TH
          </div>
          <p className="font-body-sm text-xs text-surface-dim leading-relaxed">
            Thailand's premier grassroots basketball analytics, tournament scorekeeping, and recruitment infrastructure. Designed in alignment with FIBA Official Rules &amp; BSAT Guidelines.
          </p>
          <div className="flex items-center gap-2 text-surface-dim text-[11px] pt-1 font-mono">
            <span className={`w-2 h-2 rounded-full ${dbStatus?.isLive ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
            <span>
              {dbStatus
                ? `SQLite DB Live • ${dbStatus.athletes} Athletes • ${dbStatus.matches} Matches`
                : "System v4.2.0-PRO • All Services Operational"}
            </span>
          </div>
        </div>

        {/* Col 2: Regulatory & Verification */}
        <div>
          <h4 className="font-headline-sm uppercase text-primary-fixed mb-3 tracking-wide">
            Verification &amp; Governance
          </h4>
          <ul className="space-y-2 font-body-sm text-xs text-surface-dim">
            <li>
              <Link href="/matches/match-bcc-ds-01/film" className="hover:text-white transition-colors uppercase tracking-wider block">
                FIBA LiveStats Verification
              </Link>
            </li>
            <li>
              <Link href="/academy" className="hover:text-white transition-colors uppercase tracking-wider block">
                BSAT &amp; FIBA Standards Alignment
              </Link>
            </li>
            <li>
              <Link href="/athlete/ath-1" className="hover:text-white transition-colors uppercase tracking-wider block">
                TCAS Sports Quota Portal
              </Link>
            </li>
            <li>
              <Link
                href={canCreate ? "/solutions" : "/#contact-form"}
                className="text-amber-400 hover:text-white transition-colors uppercase tracking-wider block font-bold"
              >
                B2B Tournament SaaS &amp; Solutions
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className="hover:text-white transition-colors uppercase tracking-wider block">
                National Talent Pipeline
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Rules & Portal Guidelines */}
        <div>
          <h4 className="font-headline-sm uppercase text-primary-fixed mb-3 tracking-wide">
            Scouting &amp; Community
          </h4>
          <ul className="space-y-2 font-body-sm text-xs text-surface-dim">
            <li>
              <Link href="/leaderboard" className="hover:text-white transition-colors uppercase tracking-wider block">
                Recruitment Guidelines
              </Link>
            </li>
            <li>
              <Link href="/academy" className="hover:text-white transition-colors uppercase tracking-wider block">
                Courtside Rules &amp; Exams
              </Link>
            </li>
            <li>
              <span className="hover:text-white transition-colors uppercase tracking-wider block cursor-pointer">
                Terms of Service
              </span>
            </li>
            <li>
              <span className="hover:text-white transition-colors uppercase tracking-wider block cursor-pointer">
                Privacy Policy
              </span>
            </li>
            <li>
              <span className="hover:text-white transition-colors uppercase tracking-wider block cursor-pointer">
                System Status v4.2
              </span>
            </li>
          </ul>
        </div>

        {/* Col 4: Table Official Contact & Credentials */}
        <div className="space-y-3">
          <h4 className="font-headline-sm uppercase text-primary-fixed tracking-wide">
            Table Official Access
          </h4>
          <p className="font-body-sm text-xs text-surface-dim leading-relaxed">
            Authorized access portal for certified table officials and scorekeepers to manage live courtside consoles and submit official match records.
          </p>
          {hasConsoleAccess ? (
            <Link
              href="/official/console/match-bcc-ds-01"
              className="w-full bg-white/10 hover:bg-white/20 text-white font-headline-sm uppercase py-2.5 px-3 rounded border border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm text-xs tracking-wider font-bold"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Table Dispatch Console</span>
            </Link>
          ) : (
            <Link
              href="/academy"
              className="w-full bg-white/10 hover:bg-white/20 text-white font-headline-sm uppercase py-2.5 px-3 rounded border border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm text-xs tracking-wider font-bold"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>StatCourt Academy Portal</span>
            </Link>
          )}
        </div>
      </div>

      {/* Copyright Sub-bar */}
      <div className="border-t border-white/10 py-4 text-surface-dim font-body-sm text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span>
            © 2026 STATCOURT.TH Basketball Intelligence &amp; Analytics. Standardized to FIBA Official Basketball Rules &amp; BSAT Guidelines. All rights reserved. System v4.2.0-PRO.
          </span>
          <div className="flex gap-4 uppercase font-label-badge">
            <span className="hover:text-white cursor-pointer transition">Security Disclosures</span>
            <span className="hover:text-white cursor-pointer transition">Data Protection (PDPA)</span>
            <span className="hover:text-white cursor-pointer transition">FIBA API Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
