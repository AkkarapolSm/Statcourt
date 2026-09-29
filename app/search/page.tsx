"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Users,
  Trophy,
  Award,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Filter,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const initialType = (searchParams.get("type") || "ALL").toUpperCase();

  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<string>(initialType);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    totalCount: number;
    results: {
      athletes: any[];
      teams: any[];
      tournaments: any[];
      matches: any[];
    };
  }>({
    totalCount: 0,
    results: { athletes: [], teams: [], tournaments: [], matches: [] },
  });

  const performSearch = (q: string, type: string) => {
    if (!q.trim()) {
      setData({
        totalCount: 0,
        results: { athletes: [], teams: [], tournaments: [], matches: [] },
      });
      return;
    }

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q.trim())}&type=${type}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData({
            totalCount: json.totalCount,
            results: json.results,
          });
        }
      })
      .catch((err) => console.warn("Search error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const t = (searchParams.get("type") || "ALL").toUpperCase();
    setQuery(q);
    setActiveType(t);
    performSearch(q, t);
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}&type=${activeType}`);
  };

  const handleTypeChange = (newType: string) => {
    setActiveType(newType);
    router.push(`/search?q=${encodeURIComponent(query.trim())}&type=${newType}`);
  };

  const { athletes, teams, tournaments, matches } = data.results;

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Search Header Banner */}
        <section className="bg-[#0B1C30] text-white py-10 border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#DC2626]">
                <Search className="w-4 h-4" />
                <span>STATCOURT UNIFIED GLOBAL SEARCH</span>
              </div>
              <h1 className="font-headline-xl text-3xl sm:text-4xl uppercase tracking-wider text-white">
                ค้นหาข้อมูลบาสเกตบอลทั่วประเทศ
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
                ค้นหานักกีฬา, สโมสรต้นสังกัด, ทัวร์นาเมนต์แข่งขัน และผลการแข่งขันย้อนหลังในระบบเดียว
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="pt-2">
                <div className="relative max-w-3xl">
                  <div className="flex items-center bg-white rounded-xl shadow-lg border border-slate-300 p-1.5 focus-within:ring-2 focus-within:ring-[#DC2626]/40">
                    <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="พิมพ์ชื่อนักกีฬา, สโมสร/โรงเรียน, ทัวร์นาเมนต์, หรือสนามแข่ง..."
                      className="w-full bg-transparent border-0 px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          router.push(`/search?q=&type=${activeType}`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 mr-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono text-xs font-bold uppercase transition cursor-pointer shrink-0"
                    >
                      ค้นหา
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Filter Tabs Bar */}
        <section className="bg-white border-b border-slate-200 sticky top-14 z-20 shadow-2xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar font-mono text-xs">
              {[
                { id: "ALL", label: "ทั้งหมด", count: data.totalCount },
                { id: "ATHLETES", label: "นักกีฬา", count: athletes.length },
                { id: "TEAMS", label: "สโมสรและทีม", count: teams.length },
                { id: "TOURNAMENTS", label: "ทัวร์นาเมนต์", count: tournaments.length },
                { id: "MATCHES", label: "แมตช์การแข่งขัน", count: matches.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTypeChange(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                    activeType === tab.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <span>{tab.label}</span>
                  {query && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded ${
                        activeType === tab.id
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Search Results Area */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#DC2626]" />
              <span className="text-xs font-mono">กำลังค้นหาข้อมูลในระบบแบบเรียลไทม์...</span>
            </div>
          ) : !query.trim() ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-headline-md text-xl text-slate-800 uppercase font-bold">
                เริ่มต้นค้นหาข้อมูล
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                ลองพิมพ์คำค้นหา เช่น <span className="font-bold text-slate-700">"BCC"</span>, <span className="font-bold text-slate-700">"ธนากร"</span>, <span className="font-bold text-slate-700">"TOA"</span>, หรือ <span className="font-bold text-slate-700">"กรุงเทพ"</span> เพื่อดูผลลัพธ์
              </p>
            </div>
          ) : data.totalCount === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Filter className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-headline-md text-xl text-slate-800 uppercase font-bold">
                ไม่พบผลลัพธ์สำหรับ "{query}"
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                ลองตรวจสอบตัวสะกด หรือเปลี่ยนหมวดหมู่ตัวกรองด้านบนเพื่อค้นหาข้อมูลที่ใกล้เคียง
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 1. Athletes Section */}
              {(activeType === "ALL" || activeType === "ATHLETES") && athletes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <h2 className="font-headline-md text-lg font-bold text-slate-900 uppercase">
                        นักกีฬา ({athletes.length})
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {athletes.map((ath) => {
                      const stat = ath.seasonStats?.[0];
                      return (
                        <Link
                          key={ath.id}
                          href={`/athlete/${ath.id}`}
                          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-500 hover:shadow-md transition flex items-center gap-3.5 group"
                        >
                          <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            <img
                              src={
                                ath.avatarUrl ||
                                "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=120&q=80"
                              }
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition truncate">
                                {ath.firstName} {ath.lastName}
                              </h3>
                              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                                #{ath.jerseyNumber || "-"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {ath.schoolOrClub} • {ath.province}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-slate-600">
                              <span>{ath.primaryPosition}</span>
                              <span>•</span>
                              <span>{ath.heightCm} cm</span>
                              {stat && (
                                <>
                                  <span>•</span>
                                  <span className="font-bold text-blue-700">{stat.ppg?.toFixed(1)} PPG</span>
                                </>
                              )}
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Teams Section */}
              {(activeType === "ALL" || activeType === "TEAMS") && teams.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      <h2 className="font-headline-md text-lg font-bold text-slate-900 uppercase">
                        สโมสรและทีม ({teams.length})
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {teams.map((tm) => (
                      <Link
                        key={tm.id}
                        href={`/teams/${tm.id}`}
                        className="bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-500 hover:shadow-md transition flex items-center gap-3.5 group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {tm.logoUrl ? (
                            <img src={tm.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            tm.shortName || tm.name.slice(0, 2)
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition truncate">
                            {tm.name}
                          </h3>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {tm.institution}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-slate-600">
                            <span>ผู้เล่น {tm._count?.roster || 0} คน</span>
                            {tm.coach?.fullName && (
                              <>
                                <span>•</span>
                                <span className="truncate">โค้ช {tm.coach.fullName}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Tournaments Section */}
              {(activeType === "ALL" || activeType === "TOURNAMENTS") && tournaments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-600" />
                      <h2 className="font-headline-md text-lg font-bold text-slate-900 uppercase">
                        ทัวร์นาเมนต์ ({tournaments.length})
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {tournaments.map((trn) => (
                      <Link
                        key={trn.id}
                        href="/tournaments"
                        className="bg-white rounded-xl border border-slate-200 p-4 hover:border-amber-500 hover:shadow-md transition space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">
                              รุ่น {trn.category || "U18"} • {trn.status}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition">
                              {trn.name}
                            </h3>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 shrink-0">
                            {trn.registeredTeams || 0}/{trn.maxTeams || 16} ทีม
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{trn.venue || trn.province || trn.location}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {trn.startDate ? new Date(trn.startDate).toLocaleDateString("th-TH") : "2026"}
                            </span>
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Matches Section */}
              {(activeType === "ALL" || activeType === "MATCHES") && matches.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-red-600" />
                      <h2 className="font-headline-md text-lg font-bold text-slate-900 uppercase">
                        แมตช์การแข่งขัน ({matches.length})
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {matches.map((m) => (
                      <Link
                        key={m.id}
                        href={`/matches/${m.id}/film`}
                        className="bg-white rounded-xl border border-slate-200 p-4 hover:border-red-500 hover:shadow-md transition space-y-2 group"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span className="truncate">{m.tournament?.name || "BSAT Tournament"}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                            {m.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                          <span className="truncate">{m.homeTeam?.name || "Home"}</span>
                          <span className="font-mono text-base px-2">
                            {m.homeScore ?? "-"} : {m.awayScore ?? "-"}
                          </span>
                          <span className="truncate text-right">{m.awayTeam?.name || "Away"}</span>
                        </div>

                        {m.venue && (
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            สนาม: {m.venue}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#DC2626]" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
