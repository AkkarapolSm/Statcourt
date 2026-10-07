"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Search,
  Shield,
  Users,
  Trophy,
  ArrowRight,
  Heart,
  ShieldCheck,
  Building2,
  X,
  SlidersHorizontal,
} from "lucide-react";

interface TeamItem {
  id: string;
  name: string;
  shortName?: string | null;
  institution: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  coach?: {
    id: string;
    fullName: string;
    organization: string;
    isVerified: boolean;
  } | null;
  _count?: {
    roster: number;
    homeMatches: number;
    awayMatches: number;
  };
}

type TeamCategory = "ALL" | "HIGH_SCHOOL" | "COLLEGE" | "CLUB";

import { fetchWithCache } from "@/lib/cache/clientCache";

export default function TeamsDirectoryPage() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TeamCategory>("ALL");
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);
  const [followedTeams, setFollowedTeams] = useState<string[]>([]);

  useEffect(() => {
    // Load followed teams from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("statcourt_followed_teams") || "[]");
      if (Array.isArray(saved)) {
        setFollowedTeams(saved);
      }
    } catch {}

    fetchWithCache<{ success: boolean; data: TeamItem[] }>("/api/teams", 60000)
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTeams(data.data);
        }
      })
      .catch((err) => console.error("Failed to load teams:", err))
      .finally(() => setLoading(false));
  }, []);

  const toggleFollow = (teamId: string) => {
    let updated: string[];
    if (followedTeams.includes(teamId)) {
      updated = followedTeams.filter((id) => id !== teamId);
    } else {
      updated = [...followedTeams, teamId];
    }
    setFollowedTeams(updated);
    try {
      localStorage.setItem("statcourt_followed_teams", JSON.stringify(updated));
    } catch {}
  };

  // Filter teams using useMemo
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      // 1. Follow filter
      if (showFollowedOnly && !followedTeams.includes(t.id)) {
        return false;
      }

      // 2. Category filter
      const fullText = (t.name + " " + t.institution).toLowerCase();
      if (selectedCategory === "HIGH_SCHOOL") {
        const isHs =
          fullText.includes("โรงเรียน") ||
          fullText.includes("วิทยาลัย") ||
          fullText.includes("school") ||
          fullText.includes("college") ||
          fullText.includes("bcc") ||
          fullText.includes("ds");
        if (!isHs) return false;
      } else if (selectedCategory === "COLLEGE") {
        const isUniv =
          fullText.includes("มหาวิทยาลัย") ||
          fullText.includes("university") ||
          fullText.includes("ม.") ||
          fullText.includes("จุฬา") ||
          fullText.includes("มศว");
        if (!isUniv) return false;
      } else if (selectedCategory === "CLUB") {
        const isClub =
          fullText.includes("สโมสร") ||
          fullText.includes("คลับ") ||
          fullText.includes("อะคาเดมี") ||
          fullText.includes("academy") ||
          fullText.includes("club");
        if (!isClub) return false;
      }

      // 3. Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          (t.shortName && t.shortName.toLowerCase().includes(q)) ||
          t.institution.toLowerCase().includes(q) ||
          (t.coach && t.coach.fullName.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [teams, search, selectedCategory, showFollowedOnly, followedTeams]);

  return (
    <div className="bg-[#F8F9FF] text-[#0B1C30] min-h-screen flex flex-col font-sans antialiased selection:bg-[#AF101A] selection:text-white">
      {/* Universal Navigation */}
      <Navbar />

      {/* Hero Sub-banner (Courtside Editorial Standard) */}
      <header className="w-full bg-[#0B1C30] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 court-grid-pattern opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-red-950/80 text-[#FF7A7A] px-2.5 py-1 rounded-sm font-mono text-xs uppercase font-bold border border-red-800/60">
                  <Shield className="w-3.5 h-3.5 text-[#FF7A7A]" />
                  <span>BSAT REGISTERED CLUBS</span>
                </span>
                <span className="text-slate-400 text-xs font-mono">
                  • ทำเนียบสโมสรบาสเกตบอลแห่งประเทศไทย
                </span>
              </div>

              <h1 className="font-headline text-white uppercase text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                ทำเนียบสโมสรและทีมบาสเกตบอล
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans">
                ค้นหาข้อมูลทีมบาสเกตบอล รายชื่อนักกีฬา (Roster) สถิติการแข่งขัน และผลงานอย่างเป็นทางการในสังกัดสมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT)
              </p>
            </div>

            {/* Quick Search */}
            <div className="w-full md:w-80 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาชื่อทีม, โรงเรียน, มหาวิทยาลัย..."
                  aria-label="ค้นหาชื่อทีม สถาบัน หรือผู้ฝึกสอน"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-sm pl-10 pr-9 py-2.5 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-[#AF101A] focus:ring-1 focus:ring-[#AF101A] transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    aria-label="ล้างคำค้นหา"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filters and Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFE2EB]">
          {/* Category Tabs */}
          <div
            role="tablist"
            aria-label="หมวดหมู่ทีมบาสเกตบอล"
            className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0"
          >
            <button
              role="tab"
              aria-selected={selectedCategory === "ALL"}
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === "ALL"
                  ? "bg-[#0B1C30] text-white"
                  : "bg-white text-[#5B6574] border border-[#DFE2EB] hover:bg-slate-50"
              }`}
            >
              สโมสรทั้งหมด ({teams.length})
            </button>
            <button
              role="tab"
              aria-selected={selectedCategory === "HIGH_SCHOOL"}
              onClick={() => setSelectedCategory("HIGH_SCHOOL")}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === "HIGH_SCHOOL"
                  ? "bg-[#0B1C30] text-white"
                  : "bg-white text-[#5B6574] border border-[#DFE2EB] hover:bg-slate-50"
              }`}
            >
              โรงเรียน / มัธยม
            </button>
            <button
              role="tab"
              aria-selected={selectedCategory === "COLLEGE"}
              onClick={() => setSelectedCategory("COLLEGE")}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === "COLLEGE"
                  ? "bg-[#0B1C30] text-white"
                  : "bg-white text-[#5B6574] border border-[#DFE2EB] hover:bg-slate-50"
              }`}
            >
              มหาวิทยาลัย
            </button>
            <button
              role="tab"
              aria-selected={selectedCategory === "CLUB"}
              onClick={() => setSelectedCategory("CLUB")}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === "CLUB"
                  ? "bg-[#0B1C30] text-white"
                  : "bg-white text-[#5B6574] border border-[#DFE2EB] hover:bg-slate-50"
              }`}
            >
              สโมสร &amp; อะคาเดมี
            </button>
          </div>

          {/* Right Status & Follow Filter */}
          <div className="flex items-center gap-3 text-xs font-mono">
            {followedTeams.length > 0 && (
              <button
                type="button"
                onClick={() => setShowFollowedOnly(!showFollowedOnly)}
                aria-pressed={showFollowedOnly}
                className={`px-3 py-1.5 rounded-sm border font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  showFollowedOnly
                    ? "bg-[#AF101A] text-white border-[#AF101A]"
                    : "bg-white text-[#AF101A] border-[#AF101A]/30 hover:bg-red-50"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showFollowedOnly ? "fill-white" : "fill-[#AF101A]"}`} />
                <span>เฉพาะทีมที่ติดตาม ({followedTeams.length})</span>
              </button>
            )}

            <span className="text-[#5B6574] hidden md:inline">
              แสดง <strong className="text-[#0B1C30]">{filteredTeams.length}</strong> ทีม
            </span>
          </div>
        </div>

        {/* Team Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-[#DFE2EB] p-6 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-sm bg-slate-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-slate-100 rounded w-full pt-4 border-t border-slate-100" />
              </div>
            ))}
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#DFE2EB] p-12 text-center max-w-md mx-auto space-y-3">
            <Users className="w-12 h-12 text-[#5B6574] mx-auto mb-2 opacity-40" />
            <h3 className="font-bold text-lg text-[#0B1C30]">ไม่พบทีมที่ตรงกับเงื่อนไข</h3>
            <p className="text-xs sm:text-sm text-[#5B6574]">
              ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูสโมสรทั้งหมด
            </p>
            {(search || selectedCategory !== "ALL" || showFollowedOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("ALL");
                  setShowFollowedOnly(false);
                }}
                className="px-4 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 text-[#0B1C30] font-mono text-xs font-bold transition cursor-pointer"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => {
              const isFollowed = followedTeams.includes(team.id);
              const totalMatches = (team._count?.homeMatches || 0) + (team._count?.awayMatches || 0);

              return (
                <article
                  key={team.id}
                  className="group bg-white rounded-lg border border-[#DFE2EB] hover:border-[#7F8A9E] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Top Crest, Title & Follow Action */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Team Crest */}
                        <div
                          className="w-13 h-13 rounded-sm flex items-center justify-center font-mono font-bold text-base text-white shrink-0 border border-black/10 shadow-xs"
                          style={{ backgroundColor: team.primaryColor || "#0B1C30" }}
                        >
                          {team.logoUrl ? (
                            <img
                              src={team.logoUrl}
                              alt={`ตราสโมสร ${team.name}`}
                              className="w-full h-full object-cover rounded-sm"
                            />
                          ) : (
                            team.shortName || team.name.slice(0, 3).toUpperCase()
                          )}
                        </div>

                        {/* Team Identity */}
                        <div className="min-w-0">
                          <h2 className="font-bold text-base sm:text-lg text-[#0B1C30] group-hover:text-[#AF101A] transition-colors leading-snug truncate">
                            <Link href={`/teams/${team.id}`} className="hover:underline">
                              {team.name}
                            </Link>
                          </h2>
                          <p className="text-xs text-[#5B6574] mt-0.5 truncate font-sans">
                            {team.institution}
                          </p>
                        </div>
                      </div>

                      {/* Standalone Follow Button (No nested HTML violation) */}
                      <button
                        type="button"
                        onClick={() => toggleFollow(team.id)}
                        aria-label={isFollowed ? `เลิกติดตาม ${team.name}` : `ติดตาม ${team.name}`}
                        aria-pressed={isFollowed}
                        className={`p-2 rounded-sm border transition-colors cursor-pointer shrink-0 ${
                          isFollowed
                            ? "bg-red-50 text-[#AF101A] border-[#AF101A]/30 hover:bg-red-100"
                            : "bg-white text-[#5B6574] border-[#DFE2EB] hover:text-[#AF101A] hover:bg-slate-50"
                        }`}
                        title={isFollowed ? "เลิกติดตาม" : "ติดตามทีมนี้"}
                      >
                        <Heart
                          className={`w-4 h-4 ${isFollowed ? "fill-[#AF101A] text-[#AF101A]" : ""}`}
                        />
                      </button>
                    </div>

                    {/* Metadata Counters */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-[#5B6574]">
                        <Users className="w-3.5 h-3.5 text-[#5B6574] shrink-0" />
                        <span>นักกีฬา {team._count?.roster || 12} คน</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#5B6574]">
                        <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{totalMatches} แมตช์ในระบบ</span>
                      </div>
                    </div>

                    {/* Coach Info */}
                    {team.coach && (
                      <div className="bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm px-3 py-2 text-xs text-[#5B6574] flex items-center justify-between font-sans">
                        <span>หัวหน้าผู้ฝึกสอน:</span>
                        <span className="font-semibold text-[#0B1C30] flex items-center gap-1">
                          {team.coach.fullName}
                          {team.coach.isVerified && (
                            <span title="โค้ชผ่านการรับรอง" className="inline-flex items-center">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Action */}
                  <Link
                    href={`/teams/${team.id}`}
                    className="bg-slate-50/80 hover:bg-red-50/30 border-t border-[#DFE2EB] px-5 py-3 flex items-center justify-between text-xs font-bold text-[#AF101A] transition-colors"
                  >
                    <span>ดูโปรไฟล์ทีม &amp; รายชื่อนักกีฬา</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
