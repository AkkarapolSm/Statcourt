"use client";

import React, { useState } from "react";
import { Lock, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import PricingModal from "./PricingModal";
import ProBadge from "./ProBadge";

interface PaywallOverlayProps {
  title?: string;
  description?: string;
  features?: string[];
  perspective?: "ATHLETE" | "SCOUT";
  compact?: boolean;
}

export default function PaywallOverlay({
  title = "สถิติขั้นสูงสำหรับสมาชิก StatCourtTH Pro",
  description = "อัปเกรดเป็น StatCourtTH Pro เพื่อปลดล็อกการวิเคราะห์เชิงลึกตามมาตรฐาน FIBA และคลังวิดีโอย้อนหลัง",
  features = [
    "สถิติเชิงลึก FIBA: TS%, eFG%, AST/TO Ratio",
    "แผนที่จุดยิง 5 โซน (Interactive 5-Zone Shot Chart)",
    "Export เอกสารสรุป PDF/Excel สำหรับประชุมทีมและยื่นโควตา TCAS",
  ],
  perspective = "SCOUT",
  compact = false,
}: PaywallOverlayProps) {
  const { toggleSubscriptionTier, currentUser } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (currentUser.tier === "PRO") return null;

  return (
    <>
      <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md bg-[#071322]/85 border border-[#213145]/80 rounded-2xl overflow-y-auto transition-all">
        <div className={`w-full text-center ${compact ? "max-w-xs space-y-2 p-3" : "max-w-md space-y-3 p-4 sm:p-5"} bg-[#0B1C30] border border-[#213145] rounded-2xl shadow-2xl text-white my-auto max-h-[96%]`}>
          <div className="mx-auto w-9 h-9 rounded-xl bg-[#AF101A]/20 border border-[#AF101A]/50 text-[#FF7A7A] flex items-center justify-center shadow-inner">
            <Lock className="w-4 h-4" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF7A7A] uppercase">
                PRO FEATURE
              </span>
              <ProBadge size="sm" variant="amber" />
            </div>
            <h4 className={`${compact ? "text-xs" : "text-sm sm:text-base"} font-bold tracking-tight text-white leading-snug`}>
              {title}
            </h4>
            <p className="text-xs text-[#DFE2EB]/80 leading-relaxed max-w-sm mx-auto">
              {description}
            </p>
          </div>

          {!compact && features.length > 0 && (
            <div className="border-t border-b border-[#213145] py-2.5 space-y-1.5 text-left text-xs text-[#DFE2EB]/90">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">{feat}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1.5 pt-1">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#AF101A] hover:bg-[#8E0D15] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer"
            >
              <span>ดูรายละเอียดแพ็กเกจ PRO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleSubscriptionTier}
              className="text-[11px] font-sans text-slate-400 hover:text-amber-300 transition underline underline-offset-2 py-0.5 cursor-pointer"
            >
              [จำลองการใช้งานโหมด PRO ทันที]
            </button>
          </div>
        </div>
      </div>

      <PricingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultPerspective={perspective}
      />
    </>
  );
}
