"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Trophy,
  Search,
  Download,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Building2,
  Plus,
  X,
  GitBranch,
  Radio,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TournamentRegisterModal from "@/components/tournament/TournamentRegisterModal";
import TournamentStandingsModal from "@/components/tournament/TournamentStandingsModal";
import TournamentBracketManager from "@/components/tournaments/TournamentBracketManager";

interface TournamentItem {
  id: string;
  name: string;
  organizer: string;
  isOfficialEndorsed: boolean;
  ageCategories: ("U12" | "U14" | "U16" | "U18" | "Open")[];
  region: "กรุงเทพฯ และปริมณฑล" | "ภาคกลาง" | "ภาคเหนือ" | "ภาคอีสาน" | "ภาคใต้" | "ภาคตะวันออก";
  province: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: "OPEN" | "CLOSING_SOON" | "IN_PROGRESS" | "COMPLETED";
  maxTeams: number;
  registeredTeams: number;
  entryFeeThb: number;
  rulesPdfUrl: string;
  contactPerson: string;
  contactPhone: string;
  liveMatchId?: string;
}

const mockTournamentsList: TournamentItem[] = [
  {
    id: "tourn-toa-2026",
    name: "TOA Youth Basketball League Thailand 2026",
    organizer: "สมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT) ร่วมกับ TOA",
    isOfficialEndorsed: true,
    ageCategories: ["U14", "U16", "U18"],
    region: "กรุงเทพฯ และปริมณฑล",
    province: "กรุงเทพมหานคร",
    venue: "อาคารนิมิบุตร สนามกีฬาแห่งชาติ เขตปทุมวัน",
    startDate: "2026-10-15",
    endDate: "2026-11-20",
    status: "OPEN",
    maxTeams: 24,
    registeredTeams: 18,
    entryFeeThb: 8500,
    rulesPdfUrl: "#download-rules-toa",
    contactPerson: "ฝ่ายจัดการแข่งขัน บสท.",
    contactPhone: "02-170-XXXX",
    liveMatchId: "match-bcc-ds-01",
  },
  {
    id: "tourn-tcas-invitational-2026",
    name: "TCAS Elite High School Invitational 2026",
    organizer: "ศูนย์ส่งเสริมกีฬาและการศึกษาต่อระดับอุดมศึกษา",
    isOfficialEndorsed: true,
    ageCategories: ["U18"],
    region: "กรุงเทพฯ และปริมณฑล",
    province: "กรุงเทพมหานคร",
    venue: "ศูนย์กีฬาจุฬาลงกรณ์มหาวิทยาลัย (CU Sports Complex)",
    startDate: "2026-10-25",
    endDate: "2026-11-05",
    status: "CLOSING_SOON",
    maxTeams: 16,
    registeredTeams: 14,
    entryFeeThb: 10000,
    rulesPdfUrl: "#download-rules-tcas",
    contactPerson: "อาจารย์กิตติศักดิ์",
    contactPhone: "081-998-XXXX",
    liveMatchId: "match-bcc-ds-01",
  },
  {
    id: "tourn-korat-supercup-2026",
    name: "Nakhon Ratchasima Junior Super Cup 2026",
    organizer: "ชมรมกีฬาบาสเกตบอลจังหวัดนครราชสีมา",
    isOfficialEndorsed: false,
    ageCategories: ["U12", "U14", "U16"],
    region: "ภาคอีสาน",
    province: "นครราชสีมา",
    venue: "เทอร์มินอล ฮอลล์ ศูนย์การค้าเทอร์มินอล 21 โคราช",
    startDate: "2026-11-12",
    endDate: "2026-11-16",
    status: "OPEN",
    maxTeams: 20,
    registeredTeams: 11,
    entryFeeThb: 6500,
    rulesPdfUrl: "#download-rules-korat",
    contactPerson: "โค้ชสมนึก โคราช",
    contactPhone: "089-445-XXXX",
  },
  {
    id: "tourn-chiangmai-open-2026",
    name: "Northern Thailand Student Basketball Championship",
    organizer: "สมาคมกีฬาแห่งจังหวัดเชียงใหม่",
    isOfficialEndorsed: true,
    ageCategories: ["U16", "U18", "Open"],
    region: "ภาคเหนือ",
    province: "เชียงใหม่",
    venue: "โรงยิมเนเซียม 2 สนามกีฬาสมโภชเชียงใหม่ 700 ปี",
    startDate: "2026-12-01",
    endDate: "2026-12-10",
    status: "OPEN",
    maxTeams: 32,
    registeredTeams: 19,
    entryFeeThb: 7000,
    rulesPdfUrl: "#download-rules-cm",
    contactPerson: "ฝ่ายกีฬาเยาวชนภาค 5",
    contactPhone: "053-221-XXXX",
  },
  {
    id: "tourn-hatyai-classic-2026",
    name: "Songkhla Hat Yai Youth Classic 2026",
    organizer: "เทศบาลนครหาดใหญ่ ร่วมกับ สโมสรบาสเกตบอลภาคใต้",
    isOfficialEndorsed: false,
    ageCategories: ["U14", "U18"],
    region: "ภาคใต้",
    province: "สงขลา",
    venue: "โรงยิมเนเซียมจิระนคร อำเภอหาดใหญ่",
    startDate: "2026-11-28",
    endDate: "2026-12-04",
    status: "OPEN",
    maxTeams: 16,
    registeredTeams: 9,
    entryFeeThb: 5500,
    rulesPdfUrl: "#download-rules-hatyai",
    contactPerson: "นายทะเบียนสโมสร",
    contactPhone: "074-233-XXXX",
  },
  {
    id: "tourn-chonburi-coastal-2026",
    name: "Eastern Coastal Basketball League 2026",
    organizer: "ชมรมบาสเกตบอลชลบุรี-ระยอง",
    isOfficialEndorsed: false,
    ageCategories: ["U16", "Open"],
    region: "ภาคตะวันออก",
    province: "ชลบุรี",
    venue: "โรงยิมเนเซียมเทศบาลเมืองชลบุรี",
    startDate: "2026-09-10",
    endDate: "2026-09-24",
    status: "COMPLETED",
    maxTeams: 16,
    registeredTeams: 16,
    entryFeeThb: 6000,
    rulesPdfUrl: "#download-rules-chonburi",
    contactPerson: "โค้ชธนภัทร",
    contactPhone: "038-412-XXXX",
  },
];

export default function TournamentsDirectoryPage() {
  const [tournamentsList, setTournamentsList] = useState<TournamentItem[]>(mockTournamentsList);
  const [selectedAge, setSelectedAge] = useState<string>("ALL");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDownloadModal, setActiveDownloadModal] = useState<TournamentItem | null>(null);
  const [activeRegisterModal, setActiveRegisterModal] = useState<TournamentItem | null>(null);
  const [activeStandingsModal, setActiveStandingsModal] = useState<TournamentItem | null>(null);
  const [activeBracketModal, setActiveBracketModal] = useState<TournamentItem | null>(null);

  const fetchTournaments = () => {
    fetch("/api/tournaments")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: TournamentItem[] = json.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            organizer: item.organizer || "สมาคมกีฬาบาสเกตบอลแห่งประเทศไทย (BSAT)",
            isOfficialEndorsed: item.isOfficialEndorsed ?? true,
            ageCategories: [item.category || "U18"],
            region: item.region || "กรุงเทพฯ และปริมณฑล",
            province: item.province || "กรุงเทพมหานคร",
            venue: item.venue || item.location,
            startDate: item.startDate ? item.startDate.split("T")[0] : "2026-10-15",
            endDate: item.endDate ? item.endDate.split("T")[0] : "2026-11-20",
            status: item.status || "OPEN",
            maxTeams: item.maxTeams || 16,
            registeredTeams: item.registeredTeams || 0,
            entryFeeThb: item.entryFeeThb || 0,
            rulesPdfUrl: item.rulesPdfUrl || "#download-rules",
            contactPerson: item.contactPerson || "ฝ่ายจัดการแข่งขัน",
            contactPhone: item.contactPhone || "02-170-XXXX",
            liveMatchId: item.matches?.[0]?.id,
          }));
          setTournamentsList(mapped);
        }
      })
      .catch((err) => console.warn("Failed to fetch tournaments:", err));
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const filteredTournaments = useMemo(() => {
    return tournamentsList.filter((item) => {
      if (selectedAge !== "ALL" && !item.ageCategories.includes(selectedAge as any)) {
        return false;
      }
      if (selectedRegion !== "ALL" && item.region !== selectedRegion) {
        return false;
      }
      if (selectedStatus !== "ALL" && item.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchVenue = item.venue.toLowerCase().includes(q);
        const matchProvince = item.province.toLowerCase().includes(q);
        const matchOrganizer = item.organizer.toLowerCase().includes(q);
        return matchName || matchVenue || matchProvince || matchOrganizer;
      }
      return true;
    });
  }, [tournamentsList, selectedAge, selectedRegion, selectedStatus, searchQuery]);

  const hasActiveFilters =
    selectedAge !== "ALL" ||
    selectedRegion !== "ALL" ||
    selectedStatus !== "ALL" ||
    searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setSelectedAge("ALL");
    setSelectedRegion("ALL");
    setSelectedStatus("ALL");
    setSearchQuery("");
  };

  const getStatusBadge = (status: TournamentItem["status"], registered: number, max: number) => {
    const slotsLeft = max - registered;
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
            <span>เปิดรับสมัคร (ว่าง {slotsLeft} ทีม)</span>
          </span>
        );
      case "CLOSING_SOON":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FBBC30]/15 text-[#FBBC30] border border-[#FBBC30]/30 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-[#FBBC30]" />
            <span>ใกล้ปิดรับสมัคร (เหลือ {slotsLeft} ทีม)</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#AF101A] text-white border border-[#FF7A7A]/40 text-xs font-bold font-headline uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>กำลังแข่งขัน (LIVE)</span>
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-xs font-medium">
            <span>จบการแข่งขันแล้ว</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans antialiased selection:bg-[#AF101A] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* 1. EDITORIAL HERO SECTION (Courtside Editorial) */}
        <section className="bg-[#0B1C30] text-white py-10 sm:py-12 border-b border-[#213145] relative overflow-hidden select-none">
          <div className="absolute inset-0 court-grid-pattern opacity-10 pointer-events-none" />
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#FF7A7A]/20 border border-[#FF7A7A]/40 text-[#FF7A7A] text-[11px] font-headline font-bold tracking-widest uppercase">
                  <Calendar className="w-3.5 h-3.5 text-[#FF7A7A]" />
                  <span>NATIONAL TOURNAMENT DIRECTORY</span>
                </div>
                <h1 className="font-headline uppercase tracking-wide text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                  ปฏิทินการแข่งขันบาสเกตบอลทั่วประเทศ
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                  ศูนย์รวมรายการแข่งขันบาสเกตบอลเยาวชนและประชาชนทั่วประเทศไทยที่รับรองมาตรฐานสากล
                  ตรวจสอบสถานะรับสมัคร ดาวน์โหลดระเบียบการทางการ และดูผลการแข่งขันแบบเรียลไทม์
                </p>
              </div>

              {/* B2B Organizer Portal Action */}
              <div className="shrink-0">
                <Link
                  href="/solutions"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#AF101A] hover:bg-[#8E0D15] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wide transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>สำหรับผู้จัดการแข่งขัน (Organizer Portal)</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. REFINED FILTER BAR & ACTIVE CHIPS */}
        <section className="bg-white/95 backdrop-blur-md border-b border-[#DFE2EB] sticky top-14 z-30 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2.5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
              {/* Search Bar */}
              <div className="flex items-center bg-[#F8F9FF] border border-[#CBD5E1] rounded-lg px-3 py-2 w-full lg:w-80 focus-within:border-[#AF101A] focus-within:ring-1 focus-within:ring-[#AF101A]/30 transition">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อรายการ, จังหวัด, สนาม หรือผู้จัด..."
                  className="bg-transparent border-0 p-0 text-[#0B1C30] placeholder:text-slate-400 w-full outline-none font-sans text-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Age Filter */}
                <div className="flex items-center gap-1.5 bg-[#F8F9FF] border border-[#CBD5E1] rounded-lg px-3 py-1.5">
                  <span className="text-slate-500 font-bold text-xs">รุ่นอายุ:</span>
                  <select
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className="bg-transparent text-[#0B1C30] font-bold focus:outline-none cursor-pointer text-xs font-sans"
                  >
                    <option value="ALL">ทุกรุ่นอายุ (All Ages)</option>
                    <option value="U12">รุ่น U12 (ไม่เกิน 12 ปี)</option>
                    <option value="U14">รุ่น U14 (ไม่เกิน 14 ปี)</option>
                    <option value="U16">รุ่น U16 (ไม่เกิน 16 ปี)</option>
                    <option value="U18">รุ่น U18 (ม.ปลาย / โควตา TCAS)</option>
                    <option value="Open">รุ่นประชาชนทั่วไป (Open)</option>
                  </select>
                </div>

                {/* Region Filter */}
                <div className="flex items-center gap-1.5 bg-[#F8F9FF] border border-[#CBD5E1] rounded-lg px-3 py-1.5">
                  <span className="text-slate-500 font-bold text-xs">ภูมิภาค:</span>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="bg-transparent text-[#0B1C30] font-bold focus:outline-none cursor-pointer text-xs font-sans"
                  >
                    <option value="ALL">ทุกภูมิภาคทั่วไทย</option>
                    <option value="กรุงเทพฯ และปริมณฑล">กรุงเทพฯ และปริมณฑล</option>
                    <option value="ภาคกลาง">ภาคกลาง</option>
                    <option value="ภาคเหนือ">ภาคเหนือ</option>
                    <option value="ภาคอีสาน">ภาคอีสาน</option>
                    <option value="ภาคใต้">ภาคใต้</option>
                    <option value="ภาคตะวันออก">ภาคตะวันออก</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-[#F8F9FF] border border-[#CBD5E1] rounded-lg px-3 py-1.5">
                  <span className="text-slate-500 font-bold text-xs">สถานะ:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-transparent text-[#0B1C30] font-bold focus:outline-none cursor-pointer text-xs font-sans"
                  >
                    <option value="ALL">ทุกสถานะ</option>
                    <option value="OPEN">เปิดรับสมัคร (Open)</option>
                    <option value="CLOSING_SOON">ใกล้ปิดรับสมัคร</option>
                    <option value="IN_PROGRESS">กำลังแข่งขัน (Live)</option>
                    <option value="COMPLETED">จบการแข่งขันแล้ว</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Chips Strip */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-xs animate-fadeIn">
                <span className="text-slate-500 text-[11px] font-medium mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                  <span>ตัวกรองที่ใช้งาน:</span>
                </span>

                {selectedAge !== "ALL" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#AF101A]/10 text-[#AF101A] border border-[#AF101A]/20 font-medium text-xs">
                    <span>รุ่น: {selectedAge}</span>
                    <button type="button" onClick={() => setSelectedAge("ALL")} className="hover:opacity-75">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedRegion !== "ALL" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0B1C30]/10 text-[#0B1C30] border border-[#0B1C30]/20 font-medium text-xs">
                    <span>ภาค: {selectedRegion}</span>
                    <button type="button" onClick={() => setSelectedRegion("ALL")} className="hover:opacity-75">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedStatus !== "ALL" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0B1C30]/10 text-[#0B1C30] border border-[#0B1C30]/20 font-medium text-xs">
                    <span>สถานะ: {selectedStatus}</span>
                    <button type="button" onClick={() => setSelectedStatus("ALL")} className="hover:opacity-75">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery.trim() !== "" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300 font-medium text-xs">
                    <span>คำค้น: &quot;{searchQuery}&quot;</span>
                    <button type="button" onClick={() => setSearchQuery("")} className="hover:opacity-75">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#AF101A] hover:underline font-bold ml-1.5 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ล้างตัวกรองทั้งหมด</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 3. TOURNAMENT CARDS GRID (Courtside Editorial) */}
        <section className="py-8 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5 text-xs text-slate-600">
            <span className="font-bold text-[#0B1C30]">
              พบรายการแข่งขันทั้งหมด <span className="text-[#AF101A] font-headline text-sm tabular-nums">{filteredTournaments.length}</span> รายการ
            </span>
            <span className="text-slate-400 hidden sm:inline">
              อัปเดตสถิติและโควตาโต๊ะกลางแบบเรียลไทม์
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTournaments.map((tourn) => {
              const slotsLeft = tourn.maxTeams - tourn.registeredTeams;
              const percentFilled = Math.round((tourn.registeredTeams / tourn.maxTeams) * 100);

              return (
                <div
                  key={tourn.id}
                  className="bg-white rounded-xl border border-[#DFE2EB] hover:border-[#7F8A9E] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Header Top */}
                  <div>
                    <div className="bg-[#0B1C30] p-4 sm:p-5 text-white flex items-start justify-between gap-4 border-b border-[#213145]">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {tourn.isOfficialEndorsed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-[#4ADE80] text-[11px] font-headline font-bold uppercase tracking-wider">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80]" />
                              BSAT OFFICIALLY CERTIFIED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-headline font-bold uppercase">
                              INVITATIONAL TOURNAMENT
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-[#142C47] border border-[#213145] text-slate-300 text-[11px] font-medium">
                            {tourn.province} ({tourn.region})
                          </span>
                        </div>

                        <h2 className="font-headline text-white font-extrabold text-xl sm:text-2xl uppercase tracking-wide truncate">
                          {tourn.name}
                        </h2>

                        <p className="text-xs text-slate-300 font-sans truncate">
                          ผู้จัด: {tourn.organizer}
                        </p>
                      </div>

                      {/* Status badge top right */}
                      <div className="shrink-0">
                        {getStatusBadge(tourn.status, tourn.registeredTeams, tourn.maxTeams)}
                      </div>
                    </div>

                    {/* Card Body Details */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Grid info: Dates, Venue, Categories, Entry Fee */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="flex items-start gap-2.5 text-slate-700">
                          <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-slate-500 font-bold text-[11px]">วันแข่งขัน:</span>
                            <span className="font-medium text-[#0B1C30]">{tourn.startDate} ถึง {tourn.endDate}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-slate-700">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-slate-500 font-bold text-[11px]">สนามแข่งขัน:</span>
                            <span className="font-medium text-[#0B1C30] line-clamp-1">{tourn.venue}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-slate-700">
                          <Trophy className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-slate-500 font-bold text-[11px]">รุ่นอายุที่เปิดรับ:</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {tourn.ageCategories.map((c) => (
                                <span
                                  key={c}
                                  className="px-2 py-0.2 rounded bg-[#F1F5F9] border border-[#CBD5E1] text-[#0B1C30] font-headline font-bold text-[11px]"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-slate-700">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-slate-500 font-bold text-[11px]">ค่าธรรมเนียมสมัคร:</span>
                            <span className="font-headline font-black text-[#AF101A] text-base tabular-nums">
                              ฿{tourn.entryFeeThb.toLocaleString()} <span className="text-xs text-slate-500 font-normal font-sans">/ ทีม</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quota Progress Bar */}
                      <div className="p-3 bg-[#F8F9FF] border border-[#DFE2EB] rounded-lg space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-medium">โควตารับสมัคร:</span>
                          <span className="font-headline font-bold text-[#0B1C30] tabular-nums">
                            {tourn.registeredTeams} / {tourn.maxTeams} ทีม ({percentFilled}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentFilled >= 90 ? "bg-[#AF101A]" : "bg-[#0B1C30]"
                            }`}
                            style={{ width: `${percentFilled}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Auxiliary Rail (Left) + Distinct Primary Action (Right) */}
                  <div className="p-4 sm:p-5 pt-3 border-t border-[#DFE2EB] bg-slate-50/50 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                    {/* Left: Auxiliary Tool Buttons (Disciplined Monochrome Palette) */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveDownloadModal(tourn)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#0B1C30] border border-[#CBD5E1] font-medium transition cursor-pointer"
                        title="ดาวน์โหลดระเบียบการกติกาและคุณสมบัติ (PDF)"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>ระเบียบการ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveStandingsModal(tourn)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#0B1C30] border border-[#CBD5E1] font-medium transition cursor-pointer"
                        title="ดูตารางคะแนนและอันดับทีม FIBA"
                      >
                        <Trophy className="w-3.5 h-3.5 text-[#FBBC30]" />
                        <span>ตารางคะแนน</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveBracketModal(tourn)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#0B1C30] border border-[#CBD5E1] font-medium transition cursor-pointer"
                        title="ดูสายการแข่งขันและตารางสนาม (Brackets & Court Schedule)"
                      >
                        <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                        <span>สายแข่ง &amp; สนาม</span>
                      </button>
                    </div>

                    {/* Right: Distinct Primary Action */}
                    <div className="flex items-center gap-2 shrink-0">
                      {tourn.liveMatchId && (
                        <Link
                          href={`/live`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#AF101A]/10 text-[#AF101A] hover:bg-[#AF101A]/20 border border-[#AF101A]/30 font-bold transition cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#AF101A] animate-pulse" />
                          <span>ดูถ่ายทอดสด</span>
                        </Link>
                      )}

                      {tourn.status === "OPEN" || tourn.status === "CLOSING_SOON" ? (
                        <button
                          type="button"
                          onClick={() => setActiveRegisterModal(tourn)}
                          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#AF101A] hover:bg-[#8E0D15] active:scale-[0.98] text-white font-bold transition shadow-sm cursor-pointer"
                        >
                          <span>ลงทะเบียนทีม</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 text-slate-400 font-medium">
                          ปิดรับสมัครแล้ว
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredTournaments.length === 0 && (
            <div className="bg-white rounded-xl border border-[#DFE2EB] p-12 text-center space-y-3 my-8 shadow-sm">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-headline text-[#0B1C30] font-bold text-xl uppercase">
                ไม่พบรายการแข่งขันตามเงื่อนไขที่เลือก
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-sans leading-relaxed">
                ลองรีเซ็ตตัวกรองรุ่นอายุ ภูมิภาค หรือคำค้นหา เพื่อตรวจสอบรายการแข่งขันทั้งหมดที่เปิดรับสมัคร
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg bg-[#0B1C30] hover:bg-[#142C47] text-white text-xs font-bold uppercase transition cursor-pointer"
              >
                รีเซ็ตตัวกรองทั้งหมด
              </button>
            </div>
          )}
        </section>

        {/* Modal: Official Rules & Regulations Document Sheet */}
        {activeDownloadModal && (
          <div
            onClick={() => setActiveDownloadModal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1C30]/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto cursor-pointer animate-fadeIn"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl border border-[#DFE2EB] max-w-2xl w-full p-5 sm:p-6 text-[#0B1C30] shadow-2xl cursor-default space-y-4 font-sans"
            >
              {/* Document Header */}
              <div className="flex items-start justify-between pb-3.5 border-b border-[#DFE2EB]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 font-headline font-bold text-[10px] uppercase">
                      BSAT Official Document
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {activeDownloadModal.id}-REG-2026
                    </span>
                  </div>
                  <h3 className="font-headline text-[#0B1C30] font-extrabold text-xl uppercase tracking-wide">
                    ระเบียบการแข่งขันและคุณสมบัตินักกีฬา
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    {activeDownloadModal.name} • {activeDownloadModal.organizer}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDownloadModal(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Document Body Sections */}
              <div className="space-y-3.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
                {/* 1. Eligibility */}
                <div className="p-3 bg-[#F8F9FF] rounded-lg border border-[#DFE2EB] space-y-1.5">
                  <h4 className="font-bold text-[#0B1C30] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>1. คุณสมบัตินักกีฬาและการตรวจสิทธิ์ Digital Player Pass</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 leading-relaxed text-[11px]">
                    <li>นักกีฬาต้องมีสัญชาติไทย หรือศึกษาอยู่ในสถาบันการศึกษาตามรุ่นอายุที่สมัคร</li>
                    <li>ต้องแสดงบัตร <strong>Digital Player Pass</strong> สแกน QR Code หน้าสนามก่อนลงแข่งทุกแมตช์</li>
                    <li>นักกีฬา 1 คนสามารถลงแข่งขันได้เพียง 1 ทีมต่อ 1 รุ่นอายุเท่านั้น</li>
                  </ul>
                </div>

                {/* 2. FIBA Rules */}
                <div className="p-3 bg-[#F8F9FF] rounded-lg border border-[#DFE2EB] space-y-1.5">
                  <h4 className="font-bold text-[#0B1C30] flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>2. กติกาการแข่งขันและระบบสถิติโต๊ะกลาง</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 leading-relaxed text-[11px]">
                    <li>ใช้กติกาการแข่งขันมาตรฐาน <strong>FIBA Official Basketball Rules 2024</strong> แข่งขัน 4 ควอเตอร์ ควอเตอร์ละ 10 นาที (เวลานอก 5 ครั้ง)</li>
                    <li>บันทึกสถิติสดระดับเสี้ยววินาทีผ่านระบบ <strong>FIBA LiveStats</strong> ของ StatCourtTH</li>
                    <li>กรณีคะแนนเท่ากันในรอบแบ่งกลุ่ม ตัดสินด้วย Head-to-Head ตามข้อบังคับ FIBA D.1</li>
                  </ul>
                </div>

                {/* 3. Portfolio & Recognition */}
                <div className="p-3 bg-[#F8F9FF] rounded-lg border border-[#DFE2EB] space-y-1.5">
                  <h4 className="font-bold text-[#0B1C30] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#AF101A]" />
                    <span>3. การรับรองผลงานและสถิติรายบุคคล (TCAS Portfolio)</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    สถิติการแข่งขันทุกนัดจะถูกเชื่อมโยงเข้าสู่ Digital Profile ของนักกีฬาโดยอัตโนมัติ สามารถดาวน์โหลดใบรับรองผลการแข่งขันอิเล็กทรอนิกส์ (E-Certificate) พร้อม QR ยืนยันข้อมูลไปยังมหาวิทยาลัย
                  </p>
                </div>

                {/* Coordinator Contacts */}
                <div className="p-3 bg-slate-50 border border-[#CBD5E1] rounded-lg text-slate-700 text-xs flex flex-wrap items-center justify-between gap-2">
                  <span>ผู้ประสานงานฝ่ายจัดการแข่งขัน: <strong className="text-[#0B1C30]">{activeDownloadModal.contactPerson}</strong></span>
                  <span className="font-mono font-bold text-[#0B1C30]">โทร: {activeDownloadModal.contactPhone}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#DFE2EB] flex flex-wrap items-center justify-between gap-2.5">
                <span className="text-[11px] text-slate-400 font-mono">
                  ไฟล์ PDF ขนาด 1.4 MB (ประทับตราทางการ)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveDownloadModal(null)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Real download file trigger
                      const dummyContent = `STATCOURT.TH - OFFICIAL TOURNAMENT REGULATIONS\n\nTournament: ${activeDownloadModal.name}\nOrganizer: ${activeDownloadModal.organizer}\nVenue: ${activeDownloadModal.venue}\nDates: ${activeDownloadModal.startDate} to ${activeDownloadModal.endDate}\nRules: FIBA Official Basketball Rules 2024\n\nCertified by BSAT Technical Committee.`;
                      const blob = new Blob([dummyContent], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${activeDownloadModal.id}-official-regulations.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#AF101A] hover:bg-[#8E0D15] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wide transition cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลดระเบียบการ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Team Registration */}
        {activeRegisterModal && (
          <TournamentRegisterModal
            tournament={activeRegisterModal}
            onClose={() => setActiveRegisterModal(null)}
            onSuccess={() => {
              fetchTournaments();
            }}
          />
        )}

        {/* Modal: Standings & Leaderboard */}
        {activeStandingsModal && (
          <TournamentStandingsModal
            tournament={activeStandingsModal}
            onClose={() => setActiveStandingsModal(null)}
          />
        )}

        {/* Modal: Tournament Brackets & Schedule Engine */}
        {activeBracketModal && (
          <TournamentBracketManager
            tournamentId={activeBracketModal.id}
            isOpen={!!activeBracketModal}
            onClose={() => setActiveBracketModal(null)}
            canManage={false}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
