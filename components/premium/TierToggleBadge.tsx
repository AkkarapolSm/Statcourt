"use client";

import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import PricingModal from "./PricingModal";

interface TierToggleBadgeProps {
  className?: string;
}

export default function TierToggleBadge({ className = "" }: TierToggleBadgeProps) {
  const { currentUser, toggleSubscriptionTier } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPro = mounted && currentUser.tier === "PRO";

  return (
    <>
      <div className={`inline-flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1 text-xs font-mono shadow-sm shrink-0 select-none ${className}`}>
        {/* Segmented Switch: FREE | PRO */}
        <div className="inline-flex items-center bg-slate-950/90 rounded-md p-0.5 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              if (isPro) toggleSubscriptionTier();
            }}
            title="เปลี่ยนเป็นโหมด FREE"
            className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-all duration-150 ${
              !isPro
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            FREE
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isPro) toggleSubscriptionTier();
            }}
            title="เปลี่ยนเป็นโหมด PRO"
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-all duration-150 ${
              isPro
                ? "bg-[#AF101A] text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3 h-3 fill-current text-white" />
            <span>PRO</span>
          </button>
        </div>

        {/* Subtle Plans Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          title="ดูรายละเอียดแพ็กเกจ PRO ทั้งหมด"
          className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-white transition rounded hover:bg-slate-800/80"
        >
          Plans
        </button>
      </div>

      <PricingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultPerspective={currentUser.role === "COACH" || currentUser.role === "OFFICIAL" ? "SCOUT" : "ATHLETE"}
      />
    </>
  );
}
