"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Trophy,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  Play,
  Share2,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Filter,
  Eye,
  Tv,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import POTWShareModal from "@/components/news/POTWShareModal";
import ClutchVideoModal from "@/components/news/ClutchVideoModal";
import CreateArticleModal from "@/components/news/CreateArticleModal";
import ArticleDetailModal from "@/components/news/ArticleDetailModal";
import {
  mockNewsArticles,
  mockPowerRankings,
  mockPOTWDivisions,
} from "@/lib/db/news-data";
import { NewsArticle, NewsCategory, POTWData, PowerRankingItem } from "@/lib/types";

export default function NewsAndRecapsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>(mockNewsArticles);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<"ALL" | NewsCategory>("ALL");
  const [activePotwDivision, setActivePotwDivision] = useState<"U18" | "U16" | "U14">("U18");

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isClutchModalOpen, setIsClutchModalOpen] = useState(false);
  const [selectedClutchData, setSelectedClutchData] = useState<{
    title: string;
    opponent: string;
    quarterClock: string;
    description: string;
    videoUrl?: string;
  } | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Top featured articles for hero carousel
  const featuredArticles = articles.filter((a) => a.isFeatured).slice(0, 5);
  const currentHeroArticle = featuredArticles[activeHeroIndex] || articles[0];

  // Secondary top stories (top right 3 stories like Image 1)
  const secondaryStories = articles.slice(1, 4);

  // Active POTW data based on selected division
  const currentPotw =
    mockPOTWDivisions.find((p) => p.ageCategory === activePotwDivision) ||
    mockPOTWDivisions[0];

  // Filtered latest stream
  const filteredArticles = articles.filter((a) => {
    if (activeCategory === "ALL") return true;
    return a.category === activeCategory;
  });

  const handleArticleCreated = (newArticle: NewsArticle) => {
    setArticles([newArticle, ...articles]);
  };

  const handleOpenClutch = (article: NewsArticle) => {
    if (article.clutchPlay) {
      setSelectedClutchData({
        title: article.title,
        opponent: article.clutchPlay.opponent,
        quarterClock: article.clutchPlay.quarterClock,
        description: article.clutchPlay.description,
        videoUrl: article.clutchPlay.videoUrl,
      });
      setIsClutchModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-slate-900 flex flex-col font-sans">
      <Navbar />

      {/* TOP STREAM LIKE YOU'RE COURTSIDE PROMO BANNER (Matching Image 1 & 2 Top) */}
      <div className="bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#075985] text-white py-2 px-4 shadow-sm border-b border-sky-700">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="bg-white text-sky-900 px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase">
              STATCOURT PASS
            </span>
            <span className="font-bold tracking-wide">
              STREAM LIKE YOU'RE COURTSIDE: ถ่ายทอดสดบาสเกตบอลนักเรียนทั่วประเทศแบบ 4K
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/live"
              className="px-3 py-1 rounded bg-white hover:bg-slate-100 text-sky-950 font-bold uppercase tracking-wider text-[11px] shadow-xs transition"
            >
              ดูสตรีมสด (SIGN UP NOW)
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 pb-20">
        {/* ============================================================== */}
        {/* SECTION 1: NBA.COM STYLE FEATURED HERO CAROUSEL (IMAGES 1 & 2) */}
        {/* ============================================================== */}
        <section className="bg-[#0B0F19] text-white border-b border-slate-800">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* Top Sub-bar with Admin Action & Section Title */}
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-300">
                  STATCOURT BASKETBALL NEWS &amp; MATCH RECAPS
                </h2>
              </div>

              {/* ADMIN POST BUTTON */}
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg shadow-red-950/50 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>เขียนข่าวใหม่ (ADMIN POST)</span>
              </button>
            </div>

            {/* Main Hero Grid: Left Big Hero + Right 3 Stories (Matching Image 1) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Big Feature Story (Image 2 Layout) */}
              <div className="lg:col-span-8 bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative flex flex-col justify-between group">
                {/* Hero Background Image with Gradient Overlay */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={currentHeroArticle.coverImage}
                    alt={currentHeroArticle.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />
                  
                  {/* Category Pill on Image */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="bg-[#AF101A] text-white font-mono text-xs font-bold px-3 py-1 rounded uppercase tracking-wider shadow">
                      {currentHeroArticle.categoryDisplay}
                    </span>
                    <span className="bg-black/60 backdrop-blur text-slate-300 font-mono text-[11px] px-2.5 py-1 rounded">
                      {currentHeroArticle.readTime}
                    </span>
                  </div>
                </div>

                {/* Hero Content Overlay (Text & CTA) */}
                <div className="p-6 sm:p-8 -mt-20 sm:-mt-28 relative z-10 space-y-3">
                  <h1
                    onClick={() => setSelectedArticle(currentHeroArticle)}
                    className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wider font-normal text-white hover:text-red-400 transition cursor-pointer leading-tight"
                  >
                    {currentHeroArticle.title}
                  </h1>

                  <p className="text-slate-300 text-xs sm:text-sm font-sans max-w-3xl leading-relaxed line-clamp-2">
                    {currentHeroArticle.excerpt}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedArticle(currentHeroArticle)}
                      className="px-5 py-2.5 rounded-full border-2 border-white hover:bg-white hover:text-black font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                    >
                      อ่านข่าวฉบับเต็ม (MORE)
                    </button>

                    {currentHeroArticle.clutchPlay && (
                      <button
                        type="button"
                        onClick={() => handleOpenClutch(currentHeroArticle)}
                        className="px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-md"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>ดูคลิปตัดสินเกม ({currentHeroArticle.clutchPlay.quarterClock})</span>
                      </button>
                    )}

                    <span className="text-xs text-slate-400 font-mono">
                      โดย {currentHeroArticle.author} • {currentHeroArticle.publishedAt}
                    </span>
                  </div>
                </div>

                {/* Bottom Ticker Slider (Matching Image 2 Bottom Tabs) */}
                <div className="border-t border-slate-800/80 bg-[#0F172A]/90 backdrop-blur p-2.5 grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px]">
                  {featuredArticles.map((story, idx) => (
                    <button
                      key={story.id}
                      type="button"
                      onClick={() => setActiveHeroIndex(idx)}
                      className={`text-left p-2 rounded transition relative ${
                        activeHeroIndex === idx
                          ? "bg-slate-800 text-white font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {/* Active Indicator Line */}
                      {activeHeroIndex === idx && (
                        <div className="absolute top-0 left-2 right-2 h-0.5 bg-red-500 rounded-full" />
                      )}
                      <div className="text-[9px] text-red-400 uppercase font-bold tracking-wider truncate">
                        {story.categoryDisplay}
                      </div>
                      <div className="truncate font-semibold mt-0.5 text-[11px]">
                        {story.title.split("|")[0] || story.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: 3 Stacked Secondary Breaking Stories (Image 1 Top Right) */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-slate-800">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span>TOP HEADLINES</span>
                </div>

                {secondaryStories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => setSelectedArticle(story)}
                    className="bg-[#0F172A] border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition cursor-pointer flex gap-3 group"
                  >
                    <div className="w-28 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-900 relative">
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider">
                        {story.categoryDisplay}
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition line-clamp-2 leading-snug">
                        {story.title}
                      </h4>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {story.publishedAt}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Banner Ad / Basketball Trivia Widget (Matching Image 1 Top) */}
                <div className="bg-gradient-to-r from-red-950 via-slate-900 to-black p-4 rounded-xl border border-red-900/60 font-mono text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">
                      STATCOURT TRIVIA
                    </span>
                    <div className="font-bold text-white text-xs mt-0.5">
                      ทดสอบความรู้บาสเกตบอลเยาวชนไทย
                    </div>
                  </div>
                  <Link
                    href="/academy"
                    className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] uppercase tracking-wider"
                  >
                    เล่นเลย
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: PLAYER OF THE WEEK (POTW) SHOWCASE & IG STORY SHARE */}
        {/* ============================================================== */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-black rounded-2xl border-2 border-red-800/80 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header with Division Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold tracking-widest uppercase mb-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>STATCOURT PLAYER OF THE WEEK (POTW)</span>
                  </div>
                  <h3 className="font-headline-lg uppercase text-2xl sm:text-3xl font-normal text-white">
                    ดาราเด่นประจำสัปดาห์ • FIBA EFFICIENCY MVP
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    คัดเลือกนักกีฬาที่ทำค่า FIBA EFF สูงสุดในแต่ละรุ่นอายุ พร้อมสถิติรับรองจากโต๊ะกลาง BSAT
                  </p>
                </div>

                {/* Division Segmented Buttons */}
                <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
                  {(["U18", "U16", "U14"] as const).map((div) => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => setActivePotwDivision(div)}
                      className={`px-3.5 py-1.5 rounded-lg font-bold uppercase transition ${
                        activePotwDivision === div
                          ? "bg-[#AF101A] text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      รุ่น {div}
                    </button>
                  ))}
                </div>
              </div>

              {/* POTW Showcase Layout: Portrait + High-Impact Stats + Quote */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: Player Photo Card */}
                <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
                  <div className="relative w-44 h-52 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-slate-900 group">
                    <img
                      src={currentPotw.avatarUrl}
                      alt={currentPotw.athleteName}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition"
                    />
                    <div className="absolute top-2 left-2 bg-red-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      {currentPotw.ageCategory} POTW
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <div className="font-bold text-base text-white">{currentPotw.athleteName}</div>
                    <div className="text-xs text-slate-400 font-mono">{currentPotw.athleteSchool}</div>
                  </div>
                </div>

                {/* Center: Core FIBA Stats Matrix */}
                <div className="md:col-span-8 lg:col-span-6 space-y-4">
                  {/* EFF Headline Banner */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">
                        FIBA EFFICIENCY INDEX (TOP 1% NATIONAL)
                      </span>
                      <div className="text-3xl font-headline-xl font-normal text-white mt-0.5 flex items-baseline gap-2">
                        <span>{currentPotw.effPerGame.toFixed(1)}</span>
                        <span className="text-xs text-slate-400 font-mono font-bold">EFF / GAME</span>
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>100% BSAT VERIFIED</span>
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">ชู้ตแม่นยำ {currentPotw.fgPct}% FG</div>
                    </div>
                  </div>

                  {/* 4 Stat Boxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                    <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">PPG</span>
                      <div className="text-2xl font-bold text-white mt-0.5">{currentPotw.ppg.toFixed(1)}</div>
                      <span className="text-[10px] text-slate-500">แต้มต่อเกม</span>
                    </div>
                    <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">RPG</span>
                      <div className="text-2xl font-bold text-white mt-0.5">{currentPotw.rpg.toFixed(1)}</div>
                      <span className="text-[10px] text-slate-500">รีบาวด์</span>
                    </div>
                    <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">APG</span>
                      <div className="text-2xl font-bold text-white mt-0.5">{currentPotw.apg.toFixed(1)}</div>
                      <span className="text-[10px] text-slate-500">แอสซิสต์</span>
                    </div>
                    <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">SPG</span>
                      <div className="text-2xl font-bold text-white mt-0.5">{currentPotw.spg.toFixed(1)}</div>
                      <span className="text-[10px] text-slate-500">สตีล</span>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="bg-slate-950/60 border-l-2 border-amber-400 p-3 rounded-r text-xs text-slate-300 italic font-sans">
                    "{currentPotw.quote}"
                  </blockquote>
                </div>

                {/* Right: Social Media Share CTA Button */}
                <div className="md:col-span-12 lg:col-span-3 flex flex-col justify-center items-center text-center p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/40">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-white font-mono">
                      แชร์ความภูมิใจของนักกีฬา
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      สร้างการ์ดสถิติสวยงามขนาด 9:16 โพสต์ลง Instagram Story หรือ Facebook ได้ทันที
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-red-950/50 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>แชร์รูปสถิติลง IG / FB</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: WEEKLY BIG MATCH RECAPS (3 บิ๊กแมตช์ประจำสัปดาห์)     */}
        {/* ============================================================== */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div>
              <div className="text-[11px] font-mono text-red-600 font-bold uppercase tracking-wider">
                WEEKLY HIGHLIGHTS
              </div>
              <h3 className="font-headline-lg uppercase text-2xl font-normal text-slate-900">
                สรุปผล 3 คู่บิ๊กแมตช์เดือดประจำสัปดาห์
              </h3>
            </div>
            <Link
              href="/matches/match-bcc-ds-01/film"
              className="font-mono text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span>ดูวิดีโอเทปแข่งขันทั้งหมด</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Match 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80"
                    alt="BCC vs Debsirin"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-red-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    BUZZER BEATER
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                    Q4 • 00:01
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                    <span>TOA LEAGUE U18</span>
                    <span className="text-red-600">FINAL: 78 - 76</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition">
                    กรุงเทพคริสเตียน 78 - 76 เทพศิรินทร์
                  </h4>
                  <p className="text-xs text-slate-600 font-sans line-clamp-2">
                    ช็อตรีบาวด์เกมรุกพร้อมพัตแบ็กตัดสินชัยของ ธนากร ในเสี้ยววินาทีก่อนเสียงไซเรนดัง
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClutchData({
                      title: "กรุงเทพคริสเตียน vs เทพศิรินทร์",
                      opponent: "เทพศิรินทร์",
                      quarterClock: "Q4 • 00:01",
                      description: "จังหวะรีบาวด์เกมรุกของ ธนากร ท่ามกลางวงล้อม 3 คน ซ้ำแต้มชัย 78-76",
                    });
                    setIsClutchModalOpen(true);
                  }}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-800 font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>ดูคลิปช็อตตัดสินเกม (1.5 วินาที)</span>
                </button>
              </div>
            </div>

            {/* Match 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=600&q=80"
                    alt="Suankularb vs Assumption"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-amber-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    CLUTCH 3-POINT
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                    Q4 • 00:08
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                    <span>BANGKOK DERBY</span>
                    <span className="text-red-600">FINAL: 82 - 81</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition">
                    สวนกุหลาบวิทยาลัย 82 - 81 อัสสัมชัญ
                  </h4>
                  <p className="text-xs text-slate-600 font-sans line-clamp-2">
                    สเต็ปแบ็กยิงสามแต้มสุดคมจากมุม 45 องศา พลิกนรกแซงคว้าตั๋วเข้าสู่รอบ 8 ทีมสุดท้าย
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClutchData({
                      title: "สวนกุหลาบวิทยาลัย vs อัสสัมชัญ",
                      opponent: "อัสสัมชัญ",
                      quarterClock: "Q4 • 00:08",
                      description: "จังหวะ Stepback 3-pointer ท้ายเกม แซงเอาชนะด้วยระยะยิงสุดแม่น",
                    });
                    setIsClutchModalOpen(true);
                  }}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-800 font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>ดูคลิปช็อตตัดสินเกม (8 วินาที)</span>
                </button>
              </div>
            </div>

            {/* Match 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80"
                    alt="BCC vs CMU Demo"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    OVERTIME BLOCK
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                    OT • 00:03
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                    <span>INTER-REGIONAL CUP</span>
                    <span className="text-red-600">FINAL: 88 - 85</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition">
                    กรุงเทพคริสเตียน 88 - 85 สาธิต มช. (OT)
                  </h4>
                  <p className="text-xs text-slate-600 font-sans line-clamp-2">
                    การกระโดดบล็อกลูกเลย์อัปใต้แป้นช่วงต่อเวลาพิเศษ ดับความหวังตีเสมอของยอดทีมแดนเหนือ
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClutchData({
                      title: "กรุงเทพคริสเตียน vs สาธิต มช. (OT)",
                      opponent: "สาธิต มช.",
                      quarterClock: "OT • 00:03",
                      description: "การกระโดดบล็อกลูกใต้แป้นของเซ็นเตอร์ ปิดประตูชัยในช่วงต่อเวลาพิเศษ",
                    });
                    setIsClutchModalOpen(true);
                  }}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-800 font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>ดูคลิปช็อตตัดสินเกม (OT 3 วินาที)</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 4: MONTHLY TEAM POWER RANKINGS (TOP 10 โรงเรียน)        */}
        {/* ============================================================== */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="text-[11px] font-mono text-red-600 font-bold uppercase tracking-wider">
                  STATCOURT ANALYTICS
                </div>
                <h3 className="font-headline-lg uppercase text-2xl font-normal text-slate-900">
                  MONTHLY HIGH SCHOOL POWER RANKINGS (TOP 10)
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  จัดอันดับทีมโรงเรียนฟอร์มแรงประจำเดือนกันยายน 2026 โดยอิงจากสูตร Net Rating, Win% และ Strength of Schedule
                </p>
              </div>
              <span className="px-3 py-1 rounded bg-slate-100 font-mono text-xs font-bold text-slate-700">
                UPDATE: SEPTEMBER 2026
              </span>
            </div>

            {/* Power Rankings Table */}
            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-3 text-center">อันดับ</th>
                    <th className="py-3 px-2 text-center">แนวโน้ม</th>
                    <th className="py-3 px-4">สถาบัน / โรงเรียน</th>
                    <th className="py-3 px-4 text-center">ชนะ - แพ้</th>
                    <th className="py-3 px-4 text-center">ผลต่างแต้ม</th>
                    <th className="py-3 px-4 text-center">ฟอร์ม 5 นัด</th>
                    <th className="py-3 px-4">บทวิเคราะห์ฟอร์มการเล่น (Editorial Notes)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockPowerRankings.map((team) => (
                    <tr key={team.rank} className="hover:bg-slate-50 transition">
                      {/* Rank */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                            team.rank === 1
                              ? "bg-amber-400 text-slate-900 shadow-sm"
                              : team.rank === 2
                              ? "bg-slate-300 text-slate-900"
                              : team.rank === 3
                              ? "bg-amber-700 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          #{team.rank}
                        </span>
                      </td>

                      {/* Trend */}
                      <td className="py-3 px-2 text-center">
                        {team.trend === "UP" ? (
                          <span className="inline-flex items-center text-emerald-600 font-bold text-[11px]">
                            <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{team.change}
                          </span>
                        ) : team.trend === "DOWN" ? (
                          <span className="inline-flex items-center text-red-600 font-bold text-[11px]">
                            <TrendingDown className="w-3.5 h-3.5 mr-0.5" />-{team.change}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-400 font-bold text-[11px]">
                            <Minus className="w-3.5 h-3.5 mr-0.5" />0
                          </span>
                        )}
                      </td>

                      {/* Team Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {team.teamName}
                        </div>
                        <span className="text-[11px] text-slate-400 font-bold">
                          {team.schoolCode}
                        </span>
                      </td>

                      {/* W-L */}
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {team.wins} - {team.losses}
                      </td>

                      {/* Point Diff */}
                      <td className="py-3 px-4 text-center font-bold text-emerald-700">
                        {team.pointDiff > 0 ? `+${team.pointDiff}` : team.pointDiff}
                      </td>

                      {/* Last 5 Form Badges */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {team.last5.map((res, i) => (
                            <span
                              key={i}
                              className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${
                                res === "W"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-red-600 text-white"
                              }`}
                            >
                              {res}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-4 text-slate-600 font-sans text-xs max-w-md">
                        {team.editorialNotes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 5: LATEST NEWS STREAM & SIDEBAR (IMAGE 1 BOTTOM)        */}
        {/* ============================================================== */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Stream: Latest Articles List (Image 1 Bottom Left) */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <span>LATEST STORIES</span>
                  <span className="text-xs text-slate-400 font-normal">({filteredArticles.length} รายการ)</span>
                </h3>

                <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveCategory("ALL")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      activeCategory === "ALL"
                        ? "bg-[#AF101A] text-white"
                        : "bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("MATCH_RECAP")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      activeCategory === "MATCH_RECAP"
                        ? "bg-[#AF101A] text-white"
                        : "bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    สรุปผลแข่ง
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("PLAYER_SPOTLIGHT")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      activeCategory === "PLAYER_SPOTLIGHT"
                        ? "bg-[#AF101A] text-white"
                        : "bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    POTW
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("SPORTS_SCIENCE")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${
                      activeCategory === "SPORTS_SCIENCE"
                        ? "bg-[#AF101A] text-white"
                        : "bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    วิทย์การกีฬา
                  </button>
                </div>
              </div>

              {/* Articles Feed */}
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-400 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row gap-4 group"
                  >
                    {/* Thumbnail */}
                    <div className="sm:w-56 aspect-[16/10] sm:aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-900 relative">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute top-2 left-2 bg-[#AF101A] text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded">
                        {article.categoryDisplay}
                      </div>
                    </div>

                    {/* Excerpt Details */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-mono">
                          {article.publishedAt} • {article.readTime}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition leading-snug">
                          {article.title}
                        </h4>
                        <p className="text-xs text-slate-600 font-sans line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-2 border-t border-slate-100">
                        <span>โดย {article.author}</span>
                        <span className="text-red-600 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                          <span>อ่านต่อ</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar (Image 1 Bottom Right Layout) */}
            <div className="lg:col-span-4 space-y-6">
              {/* TOP STORIES WIDGET */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  TOP STORIES
                </div>
                <div className="space-y-3.5 divide-y divide-slate-100">
                  <div
                    onClick={() => setSelectedArticle(articles[0])}
                    className="cursor-pointer group"
                  >
                    <span className="text-[10px] text-slate-400 font-mono">28 นาทีที่แล้ว</span>
                    <h5 className="text-xs font-bold text-slate-800 group-hover:text-red-600 transition mt-0.5 leading-snug">
                      'THIS TEAM IS SCARY' | RECAP: กรุงเทพคริสเตียน เฉือนเทพศิรินทร์ 1.5 วินาทีท้าย
                    </h5>
                  </div>

                  <div
                    onClick={() => setSelectedArticle(articles[1])}
                    className="pt-3 cursor-pointer group"
                  >
                    <span className="text-[10px] text-slate-400 font-mono">2 ชั่วโมงที่แล้ว</span>
                    <h5 className="text-xs font-bold text-slate-800 group-hover:text-red-600 transition mt-0.5 leading-snug">
                      PLAYER OF THE WEEK: ธนากร ศิริพันธุ์ ค่า EFF ทะลุ 34.0 นำทัพ BCC ไร้พ่าย
                    </h5>
                  </div>

                  <div
                    onClick={() => setSelectedArticle(articles[3])}
                    className="pt-3 cursor-pointer group"
                  >
                    <span className="text-[10px] text-slate-400 font-mono">1 วันที่แล้ว</span>
                    <h5 className="text-xs font-bold text-slate-800 group-hover:text-red-600 transition mt-0.5 leading-snug">
                      SPORTS SCIENCE: 5 ท่าฝึก Plyometrics เพิ่มแรงกระโดด Vertical Jump 4 นิ้ว
                    </h5>
                  </div>

                  <div
                    onClick={() => setSelectedArticle(articles[6])}
                    className="pt-3 cursor-pointer group"
                  >
                    <span className="text-[10px] text-slate-400 font-mono">4 วันที่แล้ว</span>
                    <h5 className="text-xs font-bold text-slate-800 group-hover:text-red-600 transition mt-0.5 leading-snug">
                      BSAT ประกาศรายชื่อ 24 ขุนพลแคมป์เก็บตัวทีมชาติไทยชุดเยาวชน U18
                    </h5>
                  </div>
                </div>
              </div>

              {/* PODCASTS & HIGHLIGHT CLIPS */}
              <div className="bg-[#0F172A] text-white border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 font-mono">
                <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-red-500" />
                    <span>PODCASTS &amp; FILM</span>
                  </div>
                  <Link href="/matches/match-bcc-ds-01/film" className="text-red-400 hover:text-red-300 text-[10px]">
                    ดูทั้งหมด
                  </Link>
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => {
                      setSelectedClutchData({
                        title: "EP.14: วิเคราะห์เจาะลึก 5-Zone Shot Chart กุญแจสู่แชมป์ TOA U18",
                        opponent: "StatCourt Analyst Room",
                        quarterClock: "42:15 นาที",
                        description: "พูดคุยกับโค้ชระดับประเทศเรื่องการใช้ข้อมูลสถิติขั้นสูงเปลี่ยนเกม",
                      });
                      setIsClutchModalOpen(true);
                    }}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition cursor-pointer flex gap-3 items-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white line-clamp-1">
                        EP.14: เจาะลึก Shot Chart กุญแจสู่แชมป์
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">42:15 นาที • StatCourt Podcast</div>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setSelectedClutchData({
                        title: "EP.13: ถอดรหัสพัฒนาความสูงและกระดูกนักกีฬาบาสเกตบอลวัยรุ่น",
                        opponent: "Sports Science Clinic",
                        quarterClock: "35:20 นาที",
                        description: "สัมภาษณ์แพทย์เวชศาสตร์การกีฬาเรื่อง Growth Plate และการนอนหลับลึก",
                      });
                      setIsClutchModalOpen(true);
                    }}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition cursor-pointer flex gap-3 items-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white line-clamp-1">
                        EP.13: ถอดรหัสพัฒนาความสูงวัยรุ่น
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">35:20 นาที • Medical Panel</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK LINKS (Image 1 Bottom Right) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 font-mono text-xs">
                <div className="font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  QUICK LINKS
                </div>
                <ul className="space-y-2 text-slate-600">
                  <li>
                    <Link href="/tournaments" className="hover:text-red-600 transition flex items-center justify-between">
                      <span>Key Tournament Dates</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </li>
                  <li>
                    <Link href="/leaderboard" className="hover:text-red-600 transition flex items-center justify-between">
                      <span>FIBA LiveStats National Rankings</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </li>
                  <li>
                    <Link href="/scout" className="hover:text-red-600 transition flex items-center justify-between">
                      <span>College Scout Engine</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </li>
                  <li>
                    <Link href="/academy" className="hover:text-red-600 transition flex items-center justify-between">
                      <span>BSAT Official Certification</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </li>
                  <li>
                    <Link href="/opportunities" className="hover:text-red-600 transition flex items-center justify-between">
                      <span>TCAS Sports Scholarships</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* MODALS */}
      <POTWShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        potw={currentPotw}
      />

      {selectedClutchData && (
        <ClutchVideoModal
          isOpen={isClutchModalOpen}
          onClose={() => {
            setIsClutchModalOpen(false);
            setSelectedClutchData(null);
          }}
          title={selectedClutchData.title}
          opponent={selectedClutchData.opponent}
          quarterClock={selectedClutchData.quarterClock}
          description={selectedClutchData.description}
          videoUrl={selectedClutchData.videoUrl}
        />
      )}

      <CreateArticleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onArticleCreated={handleArticleCreated}
      />

      <ArticleDetailModal
        isOpen={Boolean(selectedArticle)}
        onClose={() => setSelectedArticle(null)}
        article={selectedArticle}
      />

      <Footer />
    </div>
  );
}
