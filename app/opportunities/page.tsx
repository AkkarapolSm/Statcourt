"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  GraduationCap,
  Calendar,
  Clock,
  Send,
  X,
  ShieldCheck,
  Search,
  UserCheck,
  AlertCircle,
  Check,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { OpportunityPosting } from "@/lib/types";
import { mockOpportunities } from "@/lib/db/phase2-data";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import MyApplicationsModal from "@/components/recruitment/MyApplicationsModal";
import CandidateReviewModal from "@/components/recruitment/CandidateReviewModal";

export default function OpportunitiesPage() {
  const { currentUser } = useAuthStore();
  const [opportunities, setOpportunities] = useState<OpportunityPosting[]>(mockOpportunities);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<"ALL" | "HIGH_SCHOOL" | "UNIVERSITY" | "SEMI_PRO">("ALL");
  const [selectedFunding, setSelectedFunding] = useState<"ALL" | "FULL_100" | "PARTIAL_50" | "QUOTA_ONLY">("ALL");
  const [selectedRegion] = useState<"ALL" | "BANGKOK" | "CENTRAL" | "NORTH" | "NORTHEAST" | "SOUTH">("ALL");

  // Recruitment Workflow State
  const [isMyApplicationsOpen, setIsMyApplicationsOpen] = useState(false);
  const [isCandidatesModalOpen, setIsCandidatesModalOpen] = useState(false);
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [activeReviewCandidate, setActiveReviewCandidate] = useState<any | null>(null);

  const fetchCandidates = () => {
    fetch("/api/opportunities/applications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCandidatesList(data.data);
          setIsCandidatesModalOpen(true);
        }
      })
      .catch((err) => console.warn(err));
  };

  useEffect(() => {
    fetch("/api/opportunities")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: OpportunityPosting[] = json.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            institution: item.institution,
            institutionLogo: item.institution.includes("จุฬา") ? "CU" : item.institution.includes("ธรรมศาสตร์") ? "TU" : "BSAT",
            level: item.level as any,
            levelDisplay: item.level === "UNIVERSITY" ? "ระดับอุดมศึกษา" : "ระดับมัธยมศึกษา",
            scholarshipType: item.funding as any,
            scholarshipDisplay: item.funding === "FULL_100" ? "ทุนเต็มจำนวน 100%" : item.funding === "PARTIAL_50" ? "ทุน 50%" : "โควตากีฬา",
            province: item.province,
            region: item.region as any,
            deadline: item.deadline ? item.deadline.split("T")[0] : "2026-12-31",
            quotaCount: item.openSpots || 5,
            minGpax: item.minGpax || 2.0,
            ageRequirement: "กำลังศึกษาชั้น ม.6 หรือเทียบเท่า",
            stipendNotes: "เบี้ยเลี้ยงฝึกซ้อมและสิทธิ์รักษาพยาบาล",
            status: item.status as any,
            description: item.description || item.title,
            requirements: item.requirementsJson ? JSON.parse(item.requirementsJson) : [],
            contactEmail: item.contactEmail || "admissions@statcourt.th",
            contactPhone: item.contactPhone || "02-123-4567",
          }));
          setOpportunities(mapped);
        }
      })
      .catch((err) => console.warn("Failed to fetch opportunities:", err));
  }, []);

  // Selected for application
  const [applyingOpportunity, setApplyingOpportunity] = useState<OpportunityPosting | null>(null);
  const [applicantName] = useState(currentUser.name || "Thanakorn Siriphan");
  const [applicantTcasCode] = useState(currentUser.tcasReferenceCode || "STC-VERIFIED-TH-BCC-007");
  const [applicantGpax] = useState("3.68");
  const [applicantPosition] = useState("Point Guard (PG)");
  const [applicantPhone, setApplicantPhone] = useState("081-234-5678");
  const [applicantNotes, setApplicantNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filtering
  const filteredList = useMemo(() => {
    return opportunities.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchInst = item.institution.toLowerCase().includes(q);
        const matchProv = item.province.toLowerCase().includes(q);
        if (!matchTitle && !matchInst && !matchProv) return false;
      }

      // Level
      if (selectedLevel !== "ALL" && item.level !== selectedLevel) return false;

      // Funding
      if (selectedFunding !== "ALL" && item.scholarshipType !== selectedFunding) return false;

      // Region
      if (selectedRegion !== "ALL" && item.region !== selectedRegion) return false;

      return true;
    });
  }, [opportunities, searchQuery, selectedLevel, selectedFunding, selectedRegion]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingOpportunity) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: applyingOpportunity.id,
          athleteId: currentUser.athleteId || "ath-1",
          applicantName,
          applicantTcasCode,
          applicantGpax,
          applicantPosition,
          applicantPhone,
          applicantNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data.error || "เกิดข้อผิดพลาดในการส่งใบสมัคร");
        return;
      }
      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setApplyingOpportunity(null);
    setIsSubmitted(false);
    setSubmitError(null);
    setApplicantNotes("");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Banner (Courtside Editorial) */}
        <section className="bg-[#0B1C30] text-white py-12 border-b border-[#1E3A5F]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#AF101A]/20 border border-[#AF101A]/40 text-red-200 text-xs font-mono font-semibold tracking-wider uppercase">
                  <GraduationCap className="w-3.5 h-3.5 text-[#AF101A]" />
                  <span>NATIONAL BASKETBALL SCHOLARSHIPS &amp; TCAS QUOTA BOARD</span>
                </div>
                <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wide font-normal text-white leading-tight">
                  กระดานคัดตัวนักกีฬา <br />
                  <span className="text-[#AF101A]">และทุนการศึกษาบาสเกตบอล</span> ทั่วประเทศ
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  รวบรวมโควตากีฬา TCAS รอบที่ 1 Portfolio ของมหาวิทยาลัยชั้นนำ, ทุนการศึกษาระดับ ม.ปลาย และเวทีคัดตัวเยาวชนสโมสรกึ่งอาชีพ สมัครได้ทันทีด้วยพอร์ตสถิติและบัตรดิจิทัลที่ผ่านการรับรอง
                </p>
              </div>

              {/* Stats & Role-Aware Action Bar */}
              <div className="bg-[#142338] border border-[#223956] rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    ทุนที่เปิดรับสมัครอยู่
                  </div>
                  <div className="text-3xl font-headline-xl text-white font-normal tabular-nums">
                    {opportunities.length} รายการ
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#AF101A]" />
                    <span>อัปเดตเกณฑ์ระเบียบการทางการ 2026/2570</span>
                  </div>
                </div>

                {/* Workflow Buttons */}
                <div className="flex flex-col gap-2 w-full sm:w-auto font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setIsMyApplicationsOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold transition cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-300" />
                    <span>ติดตามใบสมัครของฉัน</span>
                  </button>

                  {(currentUser.role === "COACH" || currentUser.role === "ADMIN") && (
                    <button
                      type="button"
                      onClick={fetchCandidates}
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-sm bg-[#AF101A] hover:bg-[#8E0D15] text-white font-semibold transition cursor-pointer shadow-xs"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>ระบบคัดกรองผู้สมัคร (โค้ช)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="bg-white border-b border-[#DFE2EB] sticky top-14 z-30 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <label htmlFor="opportunity-search" className="sr-only">
                  ค้นหาโครงการ, สถาบัน หรือจังหวัด
                </label>
                <Search className="w-4 h-4 text-[#505A69] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="opportunity-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาโครงการ, สถาบัน หรือจังหวัด..."
                  className="w-full bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm pl-9 pr-8 py-1.5 text-xs text-[#0B1C30] placeholder:text-[#505A69] focus:outline-none focus:border-[#AF101A] focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#505A69] hover:text-[#0B1C30]"
                    aria-label="ล้างคำค้นหา"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Level Filter */}
              <div className="flex items-center gap-1.5 font-mono text-xs overflow-x-auto">
                {(
                  [
                    { id: "ALL", label: "ทุกระดับชั้น" },
                    { id: "UNIVERSITY", label: "TCAS / มหาวิทยาลัย" },
                    { id: "HIGH_SCHOOL", label: "มัธยมปลาย (ม.4)" },
                    { id: "SEMI_PRO", label: "สโมสร / กึ่งอาชีพ" },
                  ] as const
                ).map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSelectedLevel(lvl.id)}
                    aria-pressed={selectedLevel === lvl.id}
                    className={`px-3 py-1.5 rounded-sm font-bold transition whitespace-nowrap cursor-pointer ${
                      selectedLevel === lvl.id
                        ? "bg-[#0B1C30] text-white"
                        : "bg-[#F8F9FF] border border-[#DFE2EB] text-[#505A69] hover:text-[#0B1C30] hover:bg-[#EEF1F8]"
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>

              {/* Funding Type Filter */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                {(
                  [
                    { id: "ALL", label: "ทุนทุกประเภท" },
                    { id: "FULL_100", label: "ทุน 100% (เรียนฟรี)" },
                    { id: "PARTIAL_50", label: "ทุน 50%" },
                  ] as const
                ).map((fund) => (
                  <button
                    key={fund.id}
                    type="button"
                    onClick={() => setSelectedFunding(fund.id)}
                    aria-pressed={selectedFunding === fund.id}
                    className={`px-2.5 py-1 rounded-sm font-semibold transition cursor-pointer ${
                      selectedFunding === fund.id
                        ? "bg-[#AF101A] text-white shadow-xs"
                        : "bg-[#F8F9FF] border border-[#DFE2EB] text-[#505A69] hover:text-[#0B1C30]"
                    }`}
                  >
                    {fund.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Opportunities Listing */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="space-y-4">
            {filteredList.length === 0 ? (
              <div className="bg-white rounded-lg border border-[#DFE2EB] p-12 text-center max-w-lg mx-auto space-y-3 shadow-xs">
                <AlertCircle className="w-10 h-10 text-[#505A69] mx-auto" />
                <h3 className="font-headline-lg uppercase text-lg text-[#0B1C30]">
                  ไม่พบประกาศรับสมัครตามเงื่อนไขที่เลือก
                </h3>
                <p className="text-xs text-[#505A69] font-mono">
                  ลองเลือก "ทุกระดับชั้น" หรือล้างคำค้นหาเพื่อดูทุนการศึกษาทั้งหมด
                </p>
              </div>
            ) : (
              filteredList.map((opp) => (
                <article
                  key={opp.id}
                  className="bg-white border border-[#DFE2EB] rounded-lg p-6 hover:border-[#7F8A9E] transition-all space-y-4 shadow-xs"
                >
                  {/* Top Bar: Institution Crest, Level & Deadline */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFE2EB] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-sm bg-[#0B1C30] text-white flex items-center justify-center font-bold text-sm tracking-tight shrink-0 border border-[#1E3A5F]">
                        {opp.institutionLogo}
                      </div>
                      <div>
                        <span className="text-xs font-mono font-semibold text-[#505A69] uppercase">
                          {opp.institution}
                        </span>
                        <h2 className="font-bold text-base sm:text-lg text-[#0B1C30] hover:text-[#AF101A] transition-colors">
                          {opp.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#AF101A]/10 border border-[#AF101A]/30 text-[#AF101A] font-mono font-bold text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ปิดรับสมัคร: {opp.deadline}</span>
                      </span>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono bg-[#F8F9FF] p-4 rounded-sm border border-[#DFE2EB]">
                    <div>
                      <span className="text-[#505A69] uppercase font-semibold block text-[10px]">ระดับชั้น</span>
                      <span className="font-bold text-[#0B1C30]">{opp.levelDisplay}</span>
                    </div>
                    <div>
                      <span className="text-[#505A69] uppercase font-semibold block text-[10px]">ประเภททุน</span>
                      <span className="font-bold text-[#AF101A]">{opp.scholarshipDisplay}</span>
                    </div>
                    <div>
                      <span className="text-[#505A69] uppercase font-semibold block text-[10px]">จำนวนที่รับ</span>
                      <span className="font-bold text-[#0B1C30] tabular-nums">{opp.quotaCount} ตำแหน่ง</span>
                    </div>
                    <div>
                      <span className="text-[#505A69] uppercase font-semibold block text-[10px]">เกณฑ์ GPAX</span>
                      <span className="font-bold text-[#0B1C30] tabular-nums">
                        {opp.minGpax ? `ไม่ต่ำกว่า ${opp.minGpax.toFixed(2)}` : "ไม่กำหนดเกรดขั้นต่ำ"}
                      </span>
                    </div>
                  </div>

                  {/* Description & Requirements */}
                  <div className="space-y-2 text-xs">
                    <p className="text-[#0B1C30] leading-relaxed">
                      {opp.description}
                    </p>
                    <div className="space-y-1 pt-1 font-mono text-[11px] text-[#505A69]">
                      <span className="font-bold text-[#0B1C30] block uppercase">เกณฑ์การพิจารณาเบื้องต้น:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {opp.requirements.map((req, idx) => (
                          <li key={idx} className="text-[#505A69]">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#DFE2EB]">
                    <div className="text-xs font-mono text-[#505A69]">
                      ติดต่อ: {opp.contactEmail} • โทร {opp.contactPhone}
                    </div>

                    <button
                      type="button"
                      onClick={() => setApplyingOpportunity(opp)}
                      className="px-5 py-2.5 rounded-sm bg-[#AF101A] hover:bg-[#8E0D15] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>สมัครด้วย StatCourt ID</span>
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Application Modal */}
        {applyingOpportunity && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1C30]/70 backdrop-blur-xs p-4 overflow-y-auto"
          >
            <div className="bg-white border border-[#DFE2EB] w-full max-w-xl rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-[#0B1C30] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-sm bg-[#AF101A] flex items-center justify-center text-white">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 id="apply-modal-title" className="font-headline-lg uppercase text-base sm:text-lg tracking-wide font-normal">
                      สมัครคัดตัวด้วย StatCourt ID
                    </h3>
                    <p className="text-[11px] text-slate-300 font-mono">
                      ระบบจะส่ง Digital Pass และสถิติที่ผ่านการรับรองตรงสู่กรรมการคัดเลือก
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  aria-label="ปิดหน้าต่างสมัคร"
                  className="text-slate-400 hover:text-white p-1 rounded-sm hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-[#0B1C30] text-xs font-mono">
                {isSubmitted ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#AF101A] flex items-center justify-center mx-auto text-white shadow-md">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-headline-lg uppercase text-xl text-[#0B1C30] font-normal">
                        ส่งใบสมัครและพอร์ตสำเร็จ!
                      </h4>
                      <p className="text-[#505A69]">
                        โครงการ: {applyingOpportunity.title}
                      </p>
                      <p className="text-[11px] text-[#0B1C30] font-bold">
                        รหัสการสมัคร: APP-CU-2026-{(Math.random() * 9000 + 1000).toFixed(0)}
                      </p>
                    </div>

                    <div className="bg-[#F8F9FF] p-4 rounded-sm border border-[#DFE2EB] text-left space-y-2 text-[11px]">
                      <div className="flex items-center gap-2 text-[#0B1C30]">
                        <Check className="w-4 h-4 text-[#AF101A]" />
                        <span>แนบเอกสาร Digital Player Pass &amp; QR Code ยืนยันตัวตน</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#0B1C30]">
                        <Check className="w-4 h-4 text-[#AF101A]" />
                        <span>แนบประวัติสถิติ FIBA Box Score และวิดีโอคลิปการแข่งขัน</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#0B1C30]">
                        <Check className="w-4 h-4 text-[#AF101A]" />
                        <span>แนบเกรดเฉลี่ยสะสม GPAX ({applicantGpax}) และใบ ปพ.1 ดิจิทัล</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="w-full py-2.5 rounded-sm bg-[#0B1C30] hover:bg-[#142338] text-white font-bold uppercase transition cursor-pointer"
                    >
                      เสร็จสิ้น
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-4">
                    <div className="bg-[#F8F9FF] p-3.5 rounded-sm border border-[#DFE2EB] space-y-1">
                      <span className="text-[10px] text-[#505A69] uppercase font-bold">โครงการที่สมัคร</span>
                      <div className="font-bold text-[#0B1C30] text-sm">
                        {applyingOpportunity.title}
                      </div>
                      <div className="text-[#AF101A] text-[11px] font-semibold">
                        {applyingOpportunity.institution} • {applyingOpportunity.scholarshipDisplay}
                      </div>
                    </div>

                    {/* Pre-filled Dossier Credentials */}
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="applicant-name" className="block text-[#505A69] mb-1 uppercase font-bold">
                          ชื่อ-นามสกุล นักกีฬา (Verified Profile)
                        </label>
                        <input
                          id="applicant-name"
                          type="text"
                          disabled
                          value={applicantName}
                          className="w-full px-3 py-2 rounded-sm bg-[#F8F9FF] border border-[#DFE2EB] text-[#505A69] cursor-not-allowed font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="applicant-tcas" className="block text-[#505A69] mb-1 uppercase font-bold">
                            รหัส TCAS / StatCourt ID
                          </label>
                          <input
                            id="applicant-tcas"
                            type="text"
                            disabled
                            value={applicantTcasCode}
                            className="w-full px-3 py-2 rounded-sm bg-[#F8F9FF] border border-[#DFE2EB] text-[#0B1C30] font-bold cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label htmlFor="applicant-gpax" className="block text-[#505A69] mb-1 uppercase font-bold">
                            ผลการเรียนเฉลี่ยสะสม (GPAX)
                          </label>
                          <input
                            id="applicant-gpax"
                            type="text"
                            disabled
                            value={applicantGpax}
                            className="w-full px-3 py-2 rounded-sm bg-[#F8F9FF] border border-[#DFE2EB] text-[#0B1C30] font-bold cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="applicant-phone" className="block text-[#505A69] mb-1 uppercase font-bold">
                          เบอร์โทรศัพท์สำหรับติดต่อกลับ *
                        </label>
                        <input
                          id="applicant-phone"
                          type="tel"
                          required
                          value={applicantPhone}
                          onChange={(e) => setApplicantPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-sm bg-white border border-[#DFE2EB] text-[#0B1C30] focus:outline-none focus:border-[#AF101A]"
                        />
                      </div>

                      <div>
                        <label htmlFor="applicant-notes" className="block text-[#505A69] mb-1 uppercase font-bold">
                          ข้อความเพิ่มเติมถึงสตาฟฟ์โค้ชผู้คัดเลือก
                        </label>
                        <textarea
                          id="applicant-notes"
                          rows={2}
                          value={applicantNotes}
                          onChange={(e) => setApplicantNotes(e.target.value)}
                          placeholder="ระบุประสบการณ์แข่งพิเศษ, เป้าหมายการเรียน หรือตำแหน่งที่ถนัด"
                          className="w-full px-3 py-2 rounded-sm bg-white border border-[#DFE2EB] text-[#0B1C30] placeholder:text-[#505A69] focus:outline-none focus:border-[#AF101A] font-sans"
                        />
                      </div>
                    </div>

                    {submitError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-[#AF101A] rounded-sm flex items-center gap-2 text-xs font-mono">
                        <AlertCircle className="w-4 h-4 text-[#AF101A] shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="p-3 bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm flex items-start gap-2.5 text-[11px] text-[#505A69]">
                      <ShieldCheck className="w-4 h-4 text-[#AF101A] shrink-0 mt-0.5" />
                      <span>
                        การกดส่งใบสมัครเป็นการยินยอมให้ระบบส่งรายงานสถิติ FIBA, ผลการเรียน GPAX และประวัติการแข่งขันให้แก่ทีมงานสเกาต์ของสถาบันเพื่อการพิจารณาคัดตัว
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-sm bg-[#AF101A] hover:bg-[#8E0D15] text-white font-mono font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? "กำลังตรวจสอบและส่งใบสมัคร..." : "ยืนยันการส่งใบสมัครและพอร์ตโฟลิโอ"}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Athlete My Applications Tracking */}
        {isMyApplicationsOpen && (
          <MyApplicationsModal onClose={() => setIsMyApplicationsOpen(false)} />
        )}

        {/* Modal: Coach / Recruiter Candidates Review List */}
        {isCandidatesModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="candidates-modal-title"
            onClick={() => setIsCandidatesModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1C30]/70 backdrop-blur-xs p-4 overflow-y-auto cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-[#DFE2EB] rounded-lg max-w-3xl w-full p-6 text-[#0B1C30] shadow-2xl space-y-4 cursor-default max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between pb-3 border-b border-[#DFE2EB]">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#AF101A] uppercase">
                    CANDIDATE RECRUITMENT WORKSPACE
                  </span>
                  <h3 id="candidates-modal-title" className="text-lg font-bold text-[#0B1C30] mt-0.5">
                    รายชื่อนักกีฬาที่สมัครเข้ารับการคัดเลือก ({candidatesList.length} คน)
                  </h3>
                  <p className="text-xs text-[#505A69]">
                    สำหรับผู้ฝึกสอนและฝ่ายสรรหา: คัดกรองพอร์ต, นัดหมายคัดตัว และบันทึกผลการคัดเลือก
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCandidatesModalOpen(false)}
                  aria-label="ปิดหน้าต่างรายชื่อผู้สมัคร"
                  className="p-1 rounded-sm text-[#505A69] hover:text-[#0B1C30] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {candidatesList.length === 0 ? (
                <div className="p-8 text-center text-[#505A69] font-mono text-xs">ยังไม่มีผู้สมัครในโครงการ</div>
              ) : (
                <div className="space-y-2.5 max-h-[480px] overflow-y-auto">
                  {candidatesList.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-3.5 bg-[#F8F9FF] rounded-sm border border-[#DFE2EB] flex items-center justify-between gap-4 text-xs font-mono"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0B1C30] text-sm truncate font-sans">{cand.applicantName}</span>
                          <span className="text-[10px] bg-white border border-[#DFE2EB] text-[#505A69] px-2 py-0.5 rounded-sm">
                            {cand.applicantPosition}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            GPAX {cand.applicantGpax}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#505A69] truncate">
                          โครงการ: {cand.opportunity?.title || "ทุนนักกีฬา"} • โทร {cand.applicantPhone}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-white border border-[#DFE2EB] text-[#0B1C30]">
                          {cand.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveReviewCandidate(cand)}
                          className="px-3 py-1.5 rounded-sm bg-[#AF101A] hover:bg-[#8E0D15] text-white font-bold transition cursor-pointer"
                        >
                          ประเมิน &amp; นัดหมาย
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Candidate Detailed Screening & Scheduling */}
        {activeReviewCandidate && (
          <CandidateReviewModal
            application={activeReviewCandidate}
            onClose={() => setActiveReviewCandidate(null)}
            onSuccess={() => {
              fetchCandidates();
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
