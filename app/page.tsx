"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Lock, UserPlus, LogIn, X } from "lucide-react";
import { useAuthStore } from "@/lib/auth/useAuthStore";

// Clean Sports Audience Homepage Sections (as specified in PROJECT_REVIEW_2026-09-27.md)
import LiveMatchTicker from "@/components/home/LiveMatchTicker";
import HomeHeroSection from "@/components/home/HomeHeroSection";
import TodaysGamesSection from "@/components/home/TodaysGamesSection";
import StandingsAndLeadersSection from "@/components/home/StandingsAndLeadersSection";
import NewsAndOpportunitiesSection from "@/components/home/NewsAndOpportunitiesSection";
import OrganizerSolutionsBanner from "@/components/home/OrganizerSolutionsBanner";

// Modals
import PricingModal from "@/components/premium/PricingModal";
import EdgeCameraSimulatorModal from "@/components/camera/EdgeCameraSimulatorModal";
import HighlightReelGeneratorModal from "@/components/scout/HighlightReelGeneratorModal";
import DigitalPlayerPassModal from "@/components/athlete/DigitalPlayerPassModal";
import SocialGraphicsGeneratorModal from "@/components/video/SocialGraphicsGeneratorModal";

export default function UnifiedHomePage() {
  const { currentUser } = useAuthStore();
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

  return (
    <div className="bg-[#F8FAFC] text-[#0B1C30] font-body-md text-base antialiased min-h-screen flex flex-col selection:bg-[#AF101A] selection:text-white">
      {/* Universal Navigation Bar */}
      <Navbar />

      {/* 1. Top Live Match Center Ticker */}
      <LiveMatchTicker />

      <main className="flex-grow">
        {/* 2. Hero Section: Featured Match Scoreboard & Value Proposition */}
        <HomeHeroSection
          onOpenSocialGraphics={() =>
            guardMemberFeature(() => setIsSocialGraphicsModalOpen(true), "สร้างภาพกราฟิกสรุปผลโซเชียล")
          }
          onOpenPlayerPass={() =>
            guardMemberFeature(() => setIsPlayerPassModalOpen(true), "ตรวจสอบ Digital Player Pass")
          }
        />

        {/* 3. Today's Schedule & Recent Results */}
        <TodaysGamesSection />

        {/* 4. Standings & Stat Leaders */}
        <StandingsAndLeadersSection />

        {/* 5. Basketball News & TCAS Scholarships */}
        <NewsAndOpportunitiesSection />

        {/* 6. Organizer & Federation Solutions Banner */}
        <OrganizerSolutionsBanner />
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
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
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                MEMBER FEATURE ACCESS
              </span>
              <h3 className="text-xl font-bold text-white mt-1">ต้องเข้าสู่ระบบสมาชิก</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
                ฟีเจอร์ <span className="text-amber-300 font-bold">"{memberPrompt.featureName}"</span>{" "}
                สงวนไว้สำหรับนักกีฬาที่ยืนยันตัวตน, โค้ช หรือเจ้าหน้าที่โต๊ะเทคนิค
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <Link
                href="/auth/register"
                className="w-full py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-red-950/50"
              >
                <UserPlus className="w-4 h-4" />
                <span>สมัครสมาชิกนักกีฬา / โค้ช</span>
              </Link>
              <Link
                href="/auth/login"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบด้วยบัญชีเดิม</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
