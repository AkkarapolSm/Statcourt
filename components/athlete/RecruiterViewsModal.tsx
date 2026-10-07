"use client";

import React, { useState } from "react";
import {
  X,
  Eye,
  Building2,
  ShieldCheck,
  Video,
  FileDown,
  BookmarkPlus,
  Compass,
  ArrowUpRight,
  TrendingUp,
  Lock,
  Sparkles,
} from "lucide-react";
import { ScoutProfileViewItem } from "@/lib/types";
import { mockScoutProfileViews } from "@/lib/db/phase2-data";

interface RecruiterViewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteName?: string;
  isPro?: boolean;
}

export default function RecruiterViewsModal({
  isOpen,
  onClose,
  athleteName = "Thanakorn Siriphan",
  isPro = true,
}: RecruiterViewsModalProps) {
  const [views] = useState<ScoutProfileViewItem[]>(mockScoutProfileViews);

  if (!isOpen) return null;

  const totalViews = views.reduce((acc, v) => acc + v.viewCount, 0);

  const getActionBadge = (action: ScoutProfileViewItem["actionTaken"]) => {
    switch (action) {
      case "VIEWED_FILM":
        return {
          icon: Video,
          text: "เข้าชมวิดีโอบันทึกการแข่งขัน (Game Film)",
          color: "text-red-400 bg-red-950/60 border-red-900/60",
        };
      case "DOWNLOADED_DOSSIER":
        return {
          icon: FileDown,
          text: "ดาวน์โหลดเอกสารแฟ้มผลงาน TCAS Dossier",
          color: "text-red-300 bg-red-950/60 border-red-900/60",
        };
      case "ADDED_TO_SHORTLIST":
        return {
          icon: BookmarkPlus,
          text: "บันทึกในรายชื่อนักกีฬาเป้าหมาย (Shortlist)",
          color: "text-slate-200 bg-slate-800 border-slate-700",
        };
      case "VIEWED_BIOMETRICS":
        return {
          icon: Compass,
          text: "ตรวจสอบข้อมูลสรีระและการทดสอบสมรรถภาพ (Biometrics & Combine)",
          color: "text-slate-300 bg-slate-900 border-slate-800",
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1C30]/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0B1C30] border border-[#213145] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#071322] border-b border-[#213145] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AF101A] flex items-center justify-center text-white shadow-md">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-headline text-lg sm:text-xl font-bold flex items-center gap-2">
                <span>Who Viewed My Profile</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">
                  RECRUITER RADAR
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                {athleteName} • ตรวจสอบสถิติการเข้าชมประวัติโดยผู้ฝึกสอนและผู้สรรหานักกีฬา (Scouts)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-[#142C47] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 bg-[#081729] border-b border-[#213145] font-sans">
          <div className="bg-[#0d223a] p-3.5 rounded-xl border border-[#213145]">
            <span className="text-[11px] text-slate-400 font-medium block">
              สถิติการเข้าชมสะสม (30 วัน)
            </span>
            <div className="text-2xl font-bold text-white mt-1 flex items-baseline gap-1.5 tabular-nums font-mono">
              <span>{totalViews}</span>
              <span className="text-xs text-red-400 font-sans font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +140%
              </span>
            </div>
          </div>

          <div className="bg-[#0d223a] p-3.5 rounded-xl border border-[#213145]">
            <span className="text-[11px] text-slate-400 font-medium block">
              สถาบันที่ให้ความสนใจ
            </span>
            <div className="text-2xl font-bold text-white mt-1 tabular-nums">
              5 สถาบัน
            </div>
          </div>

          <div className="bg-[#0d223a] p-3.5 rounded-xl border border-[#213145]">
            <span className="text-[11px] text-slate-400 font-medium block">
              ระดับความสนใจจากผู้สรรหา (Scout Interest)
            </span>
            <div className="text-xs font-bold text-red-400 mt-2 flex items-center gap-1 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HIGH DEMAND PROSPECT</span>
            </div>
          </div>
        </div>

        {/* List of Scout Views */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1 text-slate-200 font-sans">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-[#213145]">
            <span className="text-slate-400 font-bold">
              บันทึกประวัติการเข้าชมล่าสุด (Activity Logs)
            </span>
            <span className="text-slate-500 text-[11px]">เรียงตามเวลาล่าสุด</span>
          </div>

          <div className="space-y-3">
            {views.map((item) => {
              const badge = getActionBadge(item.actionTaken);
              const Icon = badge.icon;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#0d223a] border border-[#213145] hover:border-slate-600 transition flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#071322] border border-[#213145] flex items-center justify-center font-black text-sm text-white shrink-0 font-headline">
                      {item.institutionBadge || "SC"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {item.scoutName}
                        </span>
                        {item.isVerifiedScout && (
                          <span title="Verified Scout">
                            <ShieldCheck className="w-4 h-4 text-[#AF101A]" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        {item.scoutRole} • {item.institution}
                      </div>

                      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badge.color}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{badge.text}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          (เข้าดู {item.viewCount} ครั้ง)
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 shrink-0 tabular-nums font-mono">
                    {item.lastViewedAt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 bg-[#071322] border-t border-[#213145] flex flex-wrap items-center justify-between gap-3 font-sans">
          <span className="text-xs text-slate-400">
            ระบบจะแจ้งเตือนทันทีเมื่อมีผู้ฝึกสอนหรือผู้สรรหานักกีฬาเข้าตรวจดูประวัติและวิดีโอของท่าน
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#142C47] hover:bg-[#1E3E64] text-white text-xs font-medium transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
