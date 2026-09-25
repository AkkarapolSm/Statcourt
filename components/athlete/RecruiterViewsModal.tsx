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
          text: "ดูวิดีโอคลิปการเล่น (Game Film)",
          color: "text-red-400 bg-red-950/60 border-red-900/60",
        };
      case "DOWNLOADED_DOSSIER":
        return {
          icon: FileDown,
          text: "ดาวน์โหลดเอกสาร TCAS Dossier",
          color: "text-red-300 bg-red-950/60 border-red-900/60",
        };
      case "ADDED_TO_SHORTLIST":
        return {
          icon: BookmarkPlus,
          text: "บันทึกลงลิสต์นักกีฬาเป้าหมาย",
          color: "text-slate-200 bg-slate-800 border-slate-700",
        };
      case "VIEWED_BIOMETRICS":
        return {
          icon: Compass,
          text: "ตรวจสอบข้อมูลสรีระ (Combine Stats)",
          color: "text-slate-300 bg-slate-900 border-slate-800",
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#AF101A] flex items-center justify-center text-white">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-headline-lg uppercase text-lg sm:text-xl tracking-wide font-normal flex items-center gap-2">
                <span>Who Viewed My Profile</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                  RECRUITER RADAR
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {athleteName} • ตรวจสอบความสนใจจากแมวมองและโค้ชมหาวิทยาลัย
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 p-5 bg-slate-900/60 border-b border-slate-800">
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">
              ยอดเข้าชมทั้งหมด (30 วัน)
            </span>
            <div className="text-2xl font-headline-xl text-white font-normal mt-1 flex items-baseline gap-1.5">
              <span>{totalViews}</span>
              <span className="text-xs text-red-400 font-mono flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +140%
              </span>
            </div>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">
              สถาบันที่สนใจ
            </span>
            <div className="text-2xl font-headline-xl text-white font-normal mt-1">
              5 สถาบัน
            </div>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">
              สถานะสเกาต์
            </span>
            <div className="text-xs font-mono font-bold text-red-400 mt-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HIGH DEMAND PROSPECT</span>
            </div>
          </div>
        </div>

        {/* List of Scout Views */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-slate-200">
          <div className="flex items-center justify-between text-xs font-mono pb-1 border-b border-slate-800">
            <span className="text-slate-400 uppercase font-bold">
              LOG บันทึกความสนใจล่าสุด
            </span>
            <span className="text-slate-500">เรียงตามเวลาล่าสุด</span>
          </div>

          <div className="space-y-3">
            {views.map((item) => {
              const badge = getActionBadge(item.actionTaken);
              const Icon = badge.icon;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-sm text-white shrink-0">
                      {item.institutionBadge || "SC"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {item.scoutName}
                        </span>
                        {item.isVerifiedScout && (
                          <span title="Verified Scout">
                            <ShieldCheck className="w-4 h-4 text-red-400" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 font-mono mt-0.5">
                        {item.scoutRole} • {item.institution}
                      </div>

                      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${badge.color}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{badge.text}</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          (เข้าดู {item.viewCount} ครั้ง)
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {item.lastViewedAt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            ระบบจะแจ้งเตือนผ่าน SMS / Line ทันทีเมื่อมีโค้ชใหม่เปิดดูคลิปของคุณ
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
