"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Search,
  SlidersHorizontal,
  Download,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  Building,
  Plus,
  X,
  GitBranch,
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
  bannerColor: string;
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
    bannerColor: "from-[#0F172A] via-slate-900 to-slate-950",
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
    bannerColor: "from-[#0F172A] via-slate-900 to-slate-950",
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
    bannerColor: "from-[#0F172A] via-slate-900 to-slate-950",
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
    bannerColor: "from-[#0F172A] via-slate-900 to-slate-950",
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
    bannerColor: "from-[#0F172A] via-slate-900 to-slate-950",
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
    bannerColor: "from-[#0F172A] via-slate-900 to-slate-950",
  },
];

export default function TournamentsDirectoryPage() {
  const [tournamentsList, setTournamentsList] = useState<TournamentItem[]>(mockTournamentsList);
  const [isPersisted, setIsPersisted] = useState(false);
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
            bannerColor: item.bannerColor || "from-[#0F172A] via-slate-900 to-slate-950",
            liveMatchId: item.matches?.[0]?.id,
          }));
          setTournamentsList(mapped);
          setIsPersisted(json.source === "PRISMA_SQLITE_PERSISTENT");
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

  const getStatusBadge = (status: TournamentItem["status"], registered: number, max: number) => {
    const slotsLeft = max - registered;
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 text-slate-200 border border-slate-700 text-[11px] font-mono font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            เปิดรับสมัคร (ว่างอีก {slotsLeft} ทีม)
          </span>
        );
      case "CLOSING_SOON":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#AF101A]/20 text-red-200 border border-[#AF101A]/50 text-[11px] font-mono font-bold tracking-wider uppercase">
            <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
            ใกล้ปิดรับสมัคร (เหลือ {slotsLeft} ทีมสุดท้าย)
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#AF101A] text-white border border-red-700 text-[11px] font-mono font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            กำลังแข่งขัน (LIVE)
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-mono font-bold tracking-wider uppercase">
            จบการแข่งขันแล้ว
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-body-md antialiased selection:bg-[#DC2626] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="bg-[#0F172A] text-white py-12 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 court-grid-pattern opacity-15 pointer-events-none" />
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#AF101A]/20 border border-[#AF101A]/40 text-[#FFDAD6] text-xs font-mono font-bold tracking-widest uppercase">
                  <Calendar className="w-3.5 h-3.5 text-[#DC2626]" />
                  NATIONAL TOURNAMENT DIRECTORY
                </div>
                <h1 className="font-headline-xl text-white uppercase tracking-wider text-3xl sm:text-4xl lg:text-5xl font-normal">
                  ปฏิทินการแข่งขันบาสเกตบอลทั่วประเทศ
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  รวบรวมรายการแข่งขันบาสเกตบอลเยาวชนและประชาชนทุกรุ่นอายุ พร้อมสถานะรับสมัคร 
                  เอกสารระเบียบการทางการ และพิกัดสนามแข่งขันในที่เดียว
                </p>
              </div>

              {/* Organizer Quick Button */}
              <div className="shrink-0">
                <Link
                  href="/#contact-form"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono font-bold text-xs tracking-wider uppercase transition shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>ลงประกาศรายการแข่งขันของคุณ</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Bar */}
        <section className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs font-mono">
              
              {/* Search Bar */}
              <div className="flex items-center bg-[#F8F9FC] border border-slate-300 rounded px-3 py-2 w-full lg:w-72 focus-within:border-[#DC2626] focus-within:bg-white transition">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อทัวร์นาเมนต์, จังหวัด, สนาม..."
                  className="bg-transparent border-0 p-0 text-slate-800 placeholder:text-slate-400 w-full outline-none"
                />
              </div>

              {/* Filter Selectors */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Age Filter */}
                <div className="flex items-center gap-1 bg-[#F8F9FC] border border-slate-300 rounded px-2.5 py-1.5">
                  <span className="text-slate-500 uppercase font-bold text-[11px]">รุ่นอายุ:</span>
                  <select
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">ทุกรุ่นอายุ (All Ages)</option>
                    <option value="U12">รุ่น U12 (อายุไม่เกิน 12 ปี)</option>
                    <option value="U14">รุ่น U14 (อายุไม่เกิน 14 ปี)</option>
                    <option value="U16">รุ่น U16 (อายุไม่เกิน 16 ปี)</option>
                    <option value="U18">รุ่น U18 (อายุไม่เกิน 18 ปี / ม.ปลาย)</option>
                    <option value="Open">รุ่นประชาชนทั่วไป (Open)</option>
                  </select>
                </div>

                {/* Region Filter */}
                <div className="flex items-center gap-1 bg-[#F8F9FC] border border-slate-300 rounded px-2.5 py-1.5">
                  <span className="text-slate-500 uppercase font-bold text-[11px]">ภูมิภาค:</span>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
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
                <div className="flex items-center gap-1 bg-[#F8F9FC] border border-slate-300 rounded px-2.5 py-1.5">
                  <span className="text-slate-500 uppercase font-bold text-[11px]">สถานะ:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
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
          </div>
        </section>

        {/* Tournament Cards List */}
        <section className="py-8 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-6 text-xs font-mono text-slate-600">
            <span>พบรายการแข่งขันทั้งหมด {filteredTournaments.length} รายการ</span>
            <span className="text-slate-400">อัปเดตข้อมูลล่าสุดทุก 6 ชั่วโมง</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTournaments.map((tourn) => {
              const slotsLeft = tourn.maxTeams - tourn.registeredTeams;
              const percentFilled = Math.round((tourn.registeredTeams / tourn.maxTeams) * 100);

              return (
                <div
                  key={tourn.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-[#DC2626]/40 transition flex flex-col justify-between"
                >
                  {/* Card Header Top */}
                  <div>
                    <div className={`bg-gradient-to-r ${tourn.bannerColor} p-4 sm:p-5 text-white flex items-start justify-between gap-4 border-b border-slate-800`}>
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {tourn.isOfficialEndorsed && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#AF101A]/20 border border-[#AF101A]/50 text-red-200 text-[10px] font-mono font-bold tracking-wider uppercase">
                              <ShieldCheck className="w-3 h-3 text-[#DC2626]" />
                              BSAT VERIFIED
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold uppercase">
                            {tourn.province} ({tourn.region})
                          </span>
                        </div>
                        <h2 className="font-headline-md text-white font-bold text-xl uppercase tracking-wide">
                          {tourn.name}
                        </h2>
                        <p className="text-xs text-slate-300 font-mono">
                          ผู้จัด: {tourn.organizer}
                        </p>
                      </div>

                      {/* Status pill top right */}
                      <div className="shrink-0">
                        {getStatusBadge(tourn.status, tourn.registeredTeams, tourn.maxTeams)}
                      </div>
                    </div>

                    {/* Card Body Details */}
                    <div className="p-4 sm:p-5 space-y-4">
                      
                      {/* Grid info: Dates, Venue, Fee */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-start gap-2 text-slate-700">
                          <Calendar className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                          <div>
                            <span className="block font-mono font-bold text-slate-900">วันแข่งขัน:</span>
                            <span>{tourn.startDate} ถึง {tourn.endDate}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-slate-700">
                          <MapPin className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                          <div>
                            <span className="block font-mono font-bold text-slate-900">สนามแข่งขัน:</span>
                            <span className="line-clamp-1">{tourn.venue}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-slate-700">
                          <Trophy className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                          <div>
                            <span className="block font-mono font-bold text-slate-900">รุ่นอายุที่เปิดรับ:</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {tourn.ageCategories.map((c) => (
                                <span
                                  key={c}
                                  className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-300 text-slate-700 font-mono text-[10px] font-bold"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-slate-700">
                          <Building className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                          <div>
                            <span className="block font-mono font-bold text-slate-900">ค่าธรรมเนียมสมัคร:</span>
                            <span className="font-mono font-black text-[#DC2626]">
                              ฿{tourn.entryFeeThb.toLocaleString()} / ทีม
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quota Progress Bar */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 font-mono text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>โควตารับสมัคร:</span>
                          <span className="font-bold text-slate-900">
                            {tourn.registeredTeams} / {tourn.maxTeams} ทีม ({percentFilled}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentFilled >= 90
                                ? "bg-[#AF101A]"
                                : "bg-slate-900"
                            }`}
                            style={{ width: `${percentFilled}%` }}
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                    <button
                      onClick={() => setActiveDownloadModal(tourn)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ดาวน์โหลดระเบียบการ (PDF)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveStandingsModal(tourn)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 font-bold transition cursor-pointer"
                        title="ดูตารางคะแนนและอันดับ FIBA"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        <span>ตารางคะแนน</span>
                      </button>

                      <button
                        onClick={() => setActiveBracketModal(tourn)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-300 font-bold transition cursor-pointer"
                        title="ดูสายการแข่งขันและตารางสนาม (Brackets & Court Schedule)"
                      >
                        <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                        <span>สายแข่ง &amp; ตารางสนาม</span>
                      </button>

                      {tourn.liveMatchId && (
                        <Link
                          href={`/matches/${tourn.liveMatchId}/film`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-red-950 text-red-300 hover:bg-red-900 border border-red-800 font-bold transition"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          <span>ดูสถิติสด</span>
                        </Link>
                      )}

                      {tourn.status === "OPEN" || tourn.status === "CLOSING_SOON" ? (
                        <button
                          onClick={() => setActiveRegisterModal(tourn)}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold transition shadow-xs cursor-pointer"
                        >
                          <span>ลงทะเบียนทีม</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="px-3 py-2 text-slate-400 font-bold">
                          ปิดรับสมัครแล้ว
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredTournaments.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 my-8">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-headline-md text-slate-800 font-bold text-xl uppercase">
                ไม่พบรายการแข่งขันตามเงื่อนไขที่เลือก
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                ลองรีเซ็ตตัวกรองรุ่นอายุหรือภูมิภาค เพื่อดูรายการแข่งขันทั้งหมดที่เปิดรับสมัครในประเทศไทย
              </p>
              <button
                onClick={() => {
                  setSelectedAge("ALL");
                  setSelectedRegion("ALL");
                  setSelectedStatus("ALL");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded bg-slate-800 text-white font-mono text-xs font-bold uppercase transition"
              >
                รีเซ็ตตัวกรองทั้งหมด
              </button>
            </div>
          )}

        </section>

        {/* Modal: Rules Document Preview & Download */}
        {activeDownloadModal && (
          <div
            onClick={() => setActiveDownloadModal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 text-slate-800 shadow-2xl cursor-default space-y-4"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#DC2626] uppercase">
                    OFFICIAL TOURNAMENT RULES & REGULATIONS
                  </span>
                  <h3 className="font-headline-md text-slate-900 font-bold text-lg uppercase mt-0.5">
                    {activeDownloadModal.name}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDownloadModal(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <p className="text-slate-500 font-bold uppercase text-[10px]">เอกสารระเบียบการกติกาและคุณสมบัตินักกีฬา</p>
                  <p className="text-slate-800">ไฟล์: {activeDownloadModal.id}-regulations-2026.pdf (1.4 MB)</p>
                  <p className="text-slate-600">รับรองโดย: {activeDownloadModal.organizer}</p>
                </div>

                <div className="space-y-2 text-slate-700">
                  <p className="font-bold text-slate-900 uppercase">ข้อกำหนดสำคัญโดยย่อ:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>นักกีฬาต้องมีสัญชาติไทย หรือศึกษาอยู่ในสถาบันการศึกษาตามรุ่นอายุ</li>
                    <li>ต้องแสดงบัตร Digital Player Pass สแกนหน้าสนามก่อนลงแข่งทุกแมตช์</li>
                    <li>ใช้กติกาการแข่งขันมาตรฐาน FIBA Official Basketball Rules 2024</li>
                    <li>สถิติและผลการแข่งขันจะบันทึกผ่านระบบ StatCourtTH แบบเรียลไทม์</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-800 text-[11px]">
                  ติดต่อฝ่ายจัดการแข่งขัน: <span className="font-bold">{activeDownloadModal.contactPerson}</span> โทร. {activeDownloadModal.contactPhone}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveDownloadModal(null)}
                  className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-mono text-xs font-bold"
                >
                  ปิดหน้าต่าง
                </button>
                <a
                  href={`#download-${activeDownloadModal.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`กำลังดาวน์โหลดระเบียบการ: ${activeDownloadModal.name}`);
                    setActiveDownloadModal(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono text-xs font-bold uppercase transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์ PDF</span>
                </a>
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
