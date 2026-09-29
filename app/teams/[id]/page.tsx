"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Users,
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Share2,
  ChevronRight,
  Shield,
  ExternalLink,
  Award,
  AlertCircle,
} from "lucide-react";

interface TeamDetail {
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
  roster: {
    id: string;
    jerseyNumber: number;
    athlete: {
      id: string;
      firstName: string;
      lastName: string;
      jerseyNumber?: number | null;
      primaryPosition: string;
      heightCm: number;
      schoolOrClub: string;
      province: string;
      avatarUrl?: string | null;
      seasonStats?: any[];
    };
  }[];
  record: {
    wins: number;
    losses: number;
    total: number;
  };
  recentMatches: {
    id: string;
    status: string;
    scheduledAt?: string | null;
    venue?: string | null;
    courtName?: string | null;
    round?: string | null;
    homeScore: number;
    awayScore: number;
    isHome: boolean;
    isWin: boolean;
    opponent: {
      id: string;
      name: string;
      shortName?: string | null;
      logoUrl?: string | null;
    };
    tournament?: {
      id: string;
      name: string;
    };
  }[];
  tournamentRegistrations?: {
    id: string;
    status: string;
    tournament: {
      id: string;
      name: string;
      category: string;
      status: string;
    };
  }[];
}

export default function PublicTeamPage({ params }: { params: { id: string } }) {
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ROSTER" | "MATCHES" | "TOURNAMENTS">("ROSTER");
  const [isFollowed, setIsFollowed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check follow status
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("statcourt_followed_teams") || "[]");
      setIsFollowed(saved.includes(params.id));
    } catch {}

    fetch(`/api/teams/${encodeURIComponent(params.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setTeam(data.data);
        }
      })
      .catch((err) => console.error("Error fetching team profile:", err))
      .finally(() => setLoading(false));
  }, [params.id]);

  const toggleFollow = () => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("statcourt_followed_teams") || "[]");
      let updated: string[];
      if (saved.includes(params.id)) {
        updated = saved.filter((id) => id !== params.id);
        setIsFollowed(false);
      } else {
        updated = [...saved, params.id];
        setIsFollowed(true);
      }
      localStorage.setItem("statcourt_followed_teams", JSON.stringify(updated));
    } catch {}
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-48 bg-slate-200 rounded-2xl w-full" />
          <div className="h-12 bg-slate-200 rounded-lg w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">ไม่พบข้อมูลทีม</h2>
          <p className="text-slate-500 mt-2 mb-6">ทีมที่คุณต้องการอาจไม่มีอยู่ในระบบ หรือถูกเปลี่ยนรหัส</p>
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#8e0d15] transition"
          >
            ← กลับไปทำเนียบทีม
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const primaryColor = team.primaryColor || "#AF101A";
  const upcomingMatches = team.recentMatches.filter((m) => m.status === "SCHEDULED" || m.status === "POSTPONED");
  const pastMatches = team.recentMatches.filter((m) => m.status === "COMPLETED");

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased selection:bg-primary selection:text-white">
      <Navbar />

      {/* Team Header Sub-banner */}
      <div className="w-full bg-[#0B1C30] text-white pt-8 pb-12 px-4 border-b border-slate-800 relative overflow-hidden">
        <div
          className="absolute -right-20 -top-20 w-96 h-96 rounded-full opacity-10 pointer-events-none blur-3xl"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition">หน้าแรก</Link>
            <span>/</span>
            <Link href="/teams" className="hover:text-white transition">สโมสรและทีม</Link>
            <span>/</span>
            <span className="text-white font-bold">{team.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-xl border-2 border-white/20 flex-shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  team.shortName || team.name.slice(0, 3).toUpperCase()
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 bg-white/10 text-white px-2.5 py-0.5 rounded text-xs font-mono uppercase tracking-wider font-bold">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    BSAT SANCTIONED CLUB
                  </span>
                  {team.shortName && (
                    <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-xs px-2 py-0.5 rounded font-mono font-bold">
                      {team.shortName}
                    </span>
                  )}
                </div>

                <h1 className="font-headline-lg text-3xl md:text-5xl uppercase tracking-wide text-white">
                  {team.name}
                </h1>
                <p className="text-slate-300 text-sm mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{team.institution}</span>
                </p>

                {team.coach && (
                  <p className="text-xs text-slate-400 mt-2">
                    ผู้ฝึกสอน: <span className="text-white font-semibold">{team.coach.fullName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions & W-L Record */}
            <div className="flex flex-row md:flex-col items-center md:items-end gap-3">
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2 text-center">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">OFFICIAL RECORD</div>
                <div className="text-2xl font-bold font-mono tracking-wider text-white">
                  <span className="text-emerald-400">{team.record.wins}W</span> - <span className="text-red-400">{team.record.losses}L</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFollow}
                  className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isFollowed
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-white text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFollowed ? "fill-white" : ""}`} />
                  <span>{isFollowed ? "กำลังติดตาม" : "ติดตามทีม"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg transition cursor-pointer"
                  title="แชร์โปรไฟล์ทีม"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {copied && <span className="text-xs text-emerald-400 font-mono">คัดลอกลิงก์แล้ว!</span>}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-3">
            {[
              { id: "ROSTER", label: `รายชื่อนักกีฬา (${team.roster.length})`, icon: Users },
              { id: "MATCHES", label: `โปรแกรม & ผลแข่ง (${team.recentMatches.length})`, icon: Calendar },
              { id: "TOURNAMENTS", label: `รายการแข่งขัน (${team.tournamentRegistrations?.length || 0})`, icon: Trophy },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs tracking-wider uppercase transition flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        {activeTab === "ROSTER" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
                ทำเนียบผู้เล่นประจำทีม (Official Team Roster)
              </h2>
              <span className="text-xs font-mono text-slate-500">
                ตรวจสอบสิทธิ์โดยฝ่ายเทคนิค BSAT
              </span>
            </div>

            {team.roster.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                ยังไม่มีข้อมูลผู้เล่นที่ลงทะเบียนในทีมนี้
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {team.roster.map((member) => {
                  const athlete = member.athlete;
                  return (
                    <Link
                      key={member.id}
                      href={`/athlete/${athlete.id}`}
                      className="group bg-white rounded-xl border border-slate-200 hover:border-red-500/60 p-4 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5"
                    >
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg text-primary overflow-hidden flex-shrink-0 border border-slate-200">
                        {athlete.avatarUrl ? (
                          <img src={athlete.avatarUrl} alt={athlete.firstName} className="w-full h-full object-cover" />
                        ) : (
                          `#${member.jerseyNumber}`
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-900 text-white font-mono text-xs px-1.5 py-0.2 rounded font-bold">
                            #{member.jerseyNumber}
                          </span>
                          <span className="text-xs font-bold text-primary">{athlete.primaryPosition.replace("_", " ")}</span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors truncate mt-1">
                          {athlete.firstName} {athlete.lastName}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {athlete.heightCm ? `${athlete.heightCm} ซม.` : "-"} • {athlete.province}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "MATCHES" && (
          <div className="space-y-8">
            {/* Upcoming Matches */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>โปรแกรมการแข่งขันที่กำลังจะมาถึง (Upcoming Fixtures)</span>
              </h2>

              {upcomingMatches.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
                  ไม่มีโปรแกรมการแข่งขันที่กำหนดไว้ในขณะนี้
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMatches.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 rounded-lg p-3 text-center min-w-[90px]">
                          <div className="text-xs font-bold text-slate-600">
                            {m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) : "เร็วๆ นี้"}
                          </div>
                          <div className="text-base font-bold text-slate-900">
                            {m.scheduledAt ? new Date(m.scheduledAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "-"}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-primary font-bold">{m.tournament?.name || "การแข่งขันบาสเกตบอล"}</div>
                          <div className="text-base font-bold text-slate-900 mt-0.5">
                            {m.isHome ? team.name : m.opponent.name} <span className="text-slate-400">VS</span> {m.isHome ? m.opponent.name : team.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <span>{m.venue || "สนามแข่งขันหลัก"}</span>
                            {m.courtName && <span>• {m.courtName}</span>}
                            {m.round && <span>• {m.round}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-1 rounded font-bold ${
                          m.status === "POSTPONED" ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {m.status === "POSTPONED" ? "เลื่อนการแข่งขัน" : "ตามกำหนดการ"}
                        </span>
                        <Link
                          href={`/matches/${m.id}`}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                        >
                          Match Center
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Matches */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>ผลการแข่งขันย้อนหลัง (Recent Results)</span>
              </h2>

              {pastMatches.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
                  ยังไม่มีประวัติการแข่งขันที่เสร็จสิ้น
                </div>
              ) : (
                <div className="space-y-3">
                  {pastMatches.map((m) => (
                    <Link
                      key={m.id}
                      href={`/matches/${m.id}`}
                      className="group bg-white rounded-xl border border-slate-200 hover:border-slate-400 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white ${
                          m.isWin ? "bg-emerald-600" : "bg-red-600"
                        }`}>
                          {m.isWin ? "WIN" : "LOSS"}
                        </div>

                        <div>
                          <div className="text-xs text-slate-500">{m.tournament?.name || "การแข่งขันอย่างเป็นทางการ"}</div>
                          <div className="text-lg font-bold text-slate-900 mt-0.5">
                            {team.name} <span className="text-primary font-mono">{m.isHome ? m.homeScore : m.awayScore}</span> - <span className="font-mono">{m.isHome ? m.awayScore : m.homeScore}</span> {m.opponent.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 group-hover:text-primary transition-colors">
                        <span>ดูบันทึกคะแนน &amp; Box Score</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "TOURNAMENTS" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
              ทัวร์นาเมนต์ที่เข้าร่วม (Tournament Participations)
            </h2>

            {!team.tournamentRegistrations || team.tournamentRegistrations.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                ยังไม่มีข้อมูลการสมัครทัวร์นาเมนต์ในระบบ
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.tournamentRegistrations.map((reg) => (
                  <div key={reg.id} className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="bg-red-50 text-primary text-xs font-bold px-2 py-0.5 rounded font-mono">
                          รุ่น {reg.tournament.category}
                        </span>
                        <h3 className="font-bold text-lg text-slate-900 mt-2">{reg.tournament.name}</h3>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded font-bold ${
                        reg.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {reg.status === "APPROVED" ? "ได้รับการรับรอง" : "รอการตรวจสอบ"}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>สถานะรายการ: {reg.tournament.status}</span>
                      <Link href="/tournaments" className="font-bold text-primary hover:underline">
                        ดูตารางแข่งขัน →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
