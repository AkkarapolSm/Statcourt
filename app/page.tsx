"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Lock, UserPlus, LogIn, X } from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";

// Home sub-components
import LiveMatchTicker from "@/components/home/LiveMatchTicker";
import HomeHeroSection from "@/components/home/HomeHeroSection";
import CredibilityStatsSection from "@/components/home/CredibilityStatsSection";
import EcosystemArchitectureSection from "@/components/home/EcosystemArchitectureSection";
import TcasScholarshipsSection from "@/components/home/TcasScholarshipsSection";
import SolutionsByRoleSection from "@/components/home/SolutionsByRoleSection";
import LeaderboardShowcaseSection from "@/components/home/LeaderboardShowcaseSection";
import B2BLeadSection from "@/components/home/B2BLeadSection";

// Modals
import PricingModal from "@/components/premium/PricingModal";
import EdgeCameraSimulatorModal from "@/components/camera/EdgeCameraSimulatorModal";
import HighlightReelGeneratorModal from "@/components/scout/HighlightReelGeneratorModal";
import DigitalPlayerPassModal from "@/components/athlete/DigitalPlayerPassModal";
import SocialGraphicsGeneratorModal from "@/components/video/SocialGraphicsGeneratorModal";

export default function UnifiedHomePage() {
  const { currentUser, loginAs } = useAuthStore();
  const isMember = currentUser.role !== "PUBLIC";

  // Modal states
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingPerspective, setPricingPerspective] = useState<"ATHLETE" | "SCOUT">("ATHLETE");
  const [isEdgeCameraModalOpen, setIsEdgeCameraModalOpen] = useState(false);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isPlayerPassModalOpen, setIsPlayerPassModalOpen] = useState(false);
  const [isSocialGraphicsModalOpen, setIsSocialGraphicsModalOpen] = useState(false);

  // Member Gate Prompt Modal for Public Guests
  const [memberPrompt, setMemberPrompt] = useState<{ isOpen: boolean; featureName: string }>({
    isOpen: false,
    featureName: "",
  });

  const guardMemberFeature = (action: () => void, featureName: string) => {
    if (!isMember) {
      setMemberPrompt({ isOpen: true, featureName });
      return;
    }
    action();
  };

  // 4-Phase Architecture interactive tab
  const [activeEcosystemPhase, setActiveEcosystemPhase] = useState<1 | 2 | 3 | 4>(1);

  // Solutions tab state
  const [activeSolutionTab, setActiveSolutionTab] = useState<"ORGANIZER" | "SCHOOL" | "SCOUT">("ORGANIZER");

  return (
    <div className="bg-[#F8F9FF] text-[#0B1C30] font-body-md text-body-md antialiased min-h-screen flex flex-col select-none selection:bg-[#DC2626] selection:text-white">
      {/* Universal Navigation Bar */}
      <Navbar />

      {/* Top Live Match Center Ticker */}
      <LiveMatchTicker />

      <main className="flex-grow">
        {/* SECTION 1: HERO SECTION */}
        <HomeHeroSection
          onOpenSocialGraphics={() => guardMemberFeature(() => setIsSocialGraphicsModalOpen(true), "สร้างภาพกราฟิกสรุปผลโซเชียล")}
          onOpenPlayerPass={() => guardMemberFeature(() => setIsPlayerPassModalOpen(true), "ตรวจสอบ Digital Player Pass")}
        />

        {/* SECTION 2: NUMBERS & CREDIBILITY */}
        <CredibilityStatsSection />

        {/* SECTION 3: 4-PHASE COMPLETE ECOSYSTEM ARCHITECTURE */}
        <EcosystemArchitectureSection
          activePhase={activeEcosystemPhase}
          onSelectPhase={setActiveEcosystemPhase}
          onOpenPlayerPass={() => guardMemberFeature(() => setIsPlayerPassModalOpen(true), "ตรวจสอบ Digital Player Pass")}
          onOpenHighlightModal={() => guardMemberFeature(() => setIsHighlightModalOpen(true), "สร้างคลิปไฮไลต์ Reel Generator")}
          onOpenEdgeCameraModal={() => guardMemberFeature(() => setIsEdgeCameraModalOpen(true), "ทดสอบระบบกล้อง Edge AI Tracking")}
        />

        {/* SECTION 4: ACTIVE TCAS SCHOLARSHIPS TICKER */}
        <TcasScholarshipsSection />

        {/* SECTION 5: INTERACTIVE SOLUTIONS BY ROLE */}
        <SolutionsByRoleSection
          activeTab={activeSolutionTab}
          onSelectTab={setActiveSolutionTab}
        />

        {/* SECTION 6: LIVE PROOF - TOP 100 LEADERBOARD SHOWCASE */}
        <LeaderboardShowcaseSection />

        {/* SECTION 7: BOTTOM B2B LEAD FORM & FAST ROLE SIMULATION */}
        <B2BLeadSection />
      </main>

      {/* Universal Footer */}
      <Footer />

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        defaultPerspective={pricingPerspective}
      />

      {/* Edge AI Camera Simulator Modal */}
      <EdgeCameraSimulatorModal
        isOpen={isEdgeCameraModalOpen}
        onClose={() => setIsEdgeCameraModalOpen(false)}
      />

      {/* 1-Minute Highlight Reel Generator Modal */}
      <HighlightReelGeneratorModal
        isOpen={isHighlightModalOpen}
        onClose={() => setIsHighlightModalOpen(false)}
      />

      {/* Digital Player Pass Modal */}
      <DigitalPlayerPassModal
        isOpen={isPlayerPassModalOpen}
        onClose={() => setIsPlayerPassModalOpen(false)}
      />

      {/* Social Graphics Generator Modal */}
      <SocialGraphicsGeneratorModal
        isOpen={isSocialGraphicsModalOpen}
        onClose={() => setIsSocialGraphicsModalOpen(false)}
      />

      {/* Member Gate Prompt Modal for Public Guests */}
      {memberPrompt.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#101622] border border-amber-500/40 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-center space-y-4">
            <button
              type="button"
              onClick={() => setMemberPrompt({ isOpen: false, featureName: "" })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                ฟังก์ชันนี้สงวนสิทธิ์สำหรับสมาชิก
              </h3>
              <p className="text-xs text-amber-300 font-mono mt-1">
                [{memberPrompt.featureName}]
              </p>
              <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                คุณยังไม่ได้เป็นสมาชิกของระบบ กรุณาสมัครสมาชิกทั่วไป (ฟรี) เพื่อเปิดใช้งานฟังก์ชันนี้ หรือเข้าสู่ระบบเพื่อใช้งาน
              </p>
            </div>
            <div className="space-y-2 pt-2 font-mono text-xs">
              <Link
                href="/auth/register"
                onClick={() => setMemberPrompt({ isOpen: false, featureName: "" })}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold uppercase transition flex items-center justify-center gap-2 shadow-lg"
              >
                <UserPlus className="w-4 h-4" />
                <span>สมัครสมาชิกทั่วไปฟรี (Register)</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  loginAs("FAN");
                  setMemberPrompt({ isOpen: false, featureName: "" });
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase transition border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>จำลองเข้าสู่ระบบทันที (DEMO AS FAN)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

