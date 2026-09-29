"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, Shield, Users, Trophy, ExternalLink, Heart } from "lucide-react";

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

export default function TeamsDirectoryPage() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [followedTeams, setFollowedTeams] = useState<string[]>([]);

  useEffect(() => {
    // Load followed teams from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("statcourt_followed_teams") || "[]");
      setFollowedTeams(saved);
    } catch {}

    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTeams(data.data);
        }
      })
      .catch((err) => console.error("Failed to load teams:", err))
      .finally(() => setLoading(false));
  }, []);

  const toggleFollow = (teamId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const filteredTeams = teams.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.shortName && t.shortName.toLowerCase().includes(q)) ||
      t.institution.toLowerCase().includes(q) ||
      (t.coach && t.coach.fullName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased selection:bg-primary selection:text-white">
      <Navbar />

      {/* Hero Sub-banner */}
      <div className="w-full bg-[#0B1C30] text-white py-8 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 bg-red-600/20 text-red-400 px-2.5 py-0.5 rounded font-label-caps text-xs tracking-wider uppercase font-bold border border-red-500/30">
                  <Shield className="w-3.5 h-3.5" />
                  BSAT REGISTERED CLUBS
                </span>
                <span className="text-slate-400 text-xs font-mono">• THAILAND BASKETBALL FEDERATION</span>
              </div>
              <h1 className="font-headline-lg text-3xl md:text-4xl uppercase tracking-wide">
                ทำเนียบสโมสรและทีมบาสเกตบอล
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-2xl">
                ค้นหาข้อมูลทีมบาสเกตบอล รายชื่อนักกีฬา (Roster) ตารางแข่งขัน และผลงานการแข่งขันอย่างเป็นทางการในสังกัด BSAT และรายการทั่วประเทศ
              </p>
            </div>

            {/* Quick Search */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อทีม, โรงเรียน, มหาวิทยาลัย..."
                className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-secondary font-mono">
            แสดงทั้งหมด <span className="font-bold text-on-surface">{filteredTeams.length}</span> สโมสร/ทีม
          </div>
          {followedTeams.length > 0 && (
            <div className="text-xs bg-red-50 text-primary border border-red-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-primary text-primary" />
              <span>ติดตามอยู่ {followedTeams.length} ทีม</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-800">ไม่พบทีมที่ค้นหา</h3>
            <p className="text-sm text-slate-500 mt-1">ลองเปลี่ยนคำค้นหาเป็นชื่อสถาบันหรืออักษรย่อ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => {
              const isFollowed = followedTeams.includes(team.id);
              const totalMatches = (team._count?.homeMatches || 0) + (team._count?.awayMatches || 0);

              return (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-red-500/60 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-inner flex-shrink-0"
                          style={{ backgroundColor: team.primaryColor || "#AF101A" }}
                        >
                          {team.logoUrl ? (
                            <img
                              src={team.logoUrl}
                              alt={team.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            team.shortName || team.name.slice(0, 3).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h2 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors leading-snug">
                            {team.name}
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{team.institution}</p>
                        </div>
                      </div>

                      {/* Follow Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFollow(team.id, e)}
                        className={`p-2 rounded-full transition-all ${
                          isFollowed
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "text-slate-300 hover:text-red-500 hover:bg-slate-50"
                        }`}
                        title={isFollowed ? "เลิกติดตาม" : "ติดตามทีม"}
                      >
                        <Heart className={`w-5 h-5 ${isFollowed ? "fill-red-600 text-red-600" : ""}`} />
                      </button>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>นักกีฬา {team._count?.roster || 12} คน</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span>{totalMatches} แมตช์ในระบบ</span>
                      </div>
                    </div>

                    {team.coach && (
                      <div className="mt-3 bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-600 flex items-center justify-between">
                        <span>หัวหน้าผู้ฝึกสอน:</span>
                        <span className="font-semibold text-slate-800">{team.coach.fullName}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50/70 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-xs font-semibold text-primary group-hover:bg-red-50/40 transition-colors">
                    <span>ดูโปรไฟล์ทีม &amp; รายชื่อนักกีฬา</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
