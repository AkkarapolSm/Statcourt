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
import { PlayerAnalyticsSpotlight, BasketballCommunitySection, BasketballPossibilityBanner, LiveStatsIntroduction, HomeGuideSection } from "@/components/home/HomeStorySections";

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
    <div className="sc-reference-home bg-[#F8F9FF] text-[#0B1C30] font-body-md text-base antialiased min-h-screen flex flex-col selection:bg-[#AF101A] selection:text-white">
      {/* Universal Navigation Bar */}
      <Navbar />

      <main className="sc-home-main flex-grow">
        {/* 2. Hero Section: Featured Match Scoreboard & Value Proposition */}
        <HomeHeroSection
          onOpenSocialGraphics={() =>
            guardMemberFeature(() => setIsSocialGraphicsModalOpen(true), "สร้างภาพกราฟิกสรุปผลโซเชียล")
          }
          onOpenPlayerPass={() =>
            guardMemberFeature(() => setIsPlayerPassModalOpen(true), "ตรวจสอบ Digital Player Pass")
          }
        />

        <PlayerAnalyticsSpotlight />
        <BasketballCommunitySection />
        <BasketballPossibilityBanner />
        <LiveStatsIntroduction />
        <LiveMatchTicker />

        {/* 3. Today's Schedule & Recent Results */}
        <TodaysGamesSection />

        {/* 4. Standings & Stat Leaders */}
        <StandingsAndLeadersSection />

        {/* 5. Basketball News & TCAS Scholarships */}
        <NewsAndOpportunitiesSection />

        {/* 6. Organizer & Federation Solutions Banner */}
        <OrganizerSolutionsBanner />
        <HomeGuideSection />
      </main>

      {/* Universal Footer */}
      <Footer />
      <div className="sc-footer-wordmark" aria-hidden="true">STATCOURT.TH</div>

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
        <div className="fixed inset-0 z-50 bg-[#0B1C30]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0B1C30] border border-[#7F8A9E]/30 rounded-xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-center space-y-4">
            <button
              type="button"
              onClick={() => setMemberPrompt({ isOpen: false, featureName: "" })}
              className="absolute top-4 right-4 text-[#DFE2EB]/70 hover:text-white p-1"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-white">ต้องเข้าสู่ระบบสมาชิก</h3>
              <p className="text-sm text-[#DFE2EB]/80 mt-2 leading-relaxed">
                ฟีเจอร์ "{memberPrompt.featureName}" สงวนไว้สำหรับนักกีฬาที่ยืนยันตัวตน, โค้ช หรือเจ้าหน้าที่โต๊ะเทคนิค
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <Link
                href="/auth/register"
                className="w-full py-2.5 px-4 rounded-lg bg-[#AF101A] hover:bg-[#8E0D15] text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>สมัครสมาชิกนักกีฬา / โค้ช</span>
              </Link>
              <Link
                href="/auth/login"
                className="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium flex items-center justify-center gap-2 border border-white/15 transition"
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
