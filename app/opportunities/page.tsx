"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Trophy,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  X,
  ShieldCheck,
  Search,
  Filter,
  DollarSign,
  FileText,
  UserCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Check,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { OpportunityPosting } from "@/lib/types";
import { mockOpportunities } from "@/lib/db/phase2-data";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<OpportunityPosting[]>(mockOpportunities);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<"ALL" | "HIGH_SCHOOL" | "UNIVERSITY" | "SEMI_PRO">("ALL");
  const [selectedFunding, setSelectedFunding] = useState<"ALL" | "FULL_100" | "PARTIAL_50" | "QUOTA_ONLY">("ALL");
  const [selectedRegion, setSelectedRegion] = useState<"ALL" | "BANGKOK" | "CENTRAL" | "NORTH" | "NORTHEAST" | "SOUTH">("ALL");

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
  const [applicantName, setApplicantName] = useState("Thanakorn Siriphan");
  const [applicantTcasCode, setApplicantTcasCode] = useState("STC-VERIFIED-TH-BCC-007");
  const [applicantGpax, setApplicantGpax] = useState("3.68");
  const [applicantPosition, setApplicantPosition] = useState("Point Guard (PG)");
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
    setIsSubmitting(true);

    try {
      await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: applyingOpportunity.id,
          athleteId: "ath-1",
          applicantName,
          applicantTcasCode,
          applicantGpax,
          applicantPosition,
          applicantPhone,
          applicantNotes,
        }),
      });
    } catch (err) {
      console.warn("Failed to submit opportunity application:", err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const handleCloseModal = () => {
    setApplyingOpportunity(null);
    setIsSubmitted(false);
    setApplicantNotes("");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Banner */}
        <section className="bg-[#0F172A] text-white py-14 border-b border-slate-800">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#AF101A]/30 border border-[#AF101A]/50 text-red-200 text-xs font-mono font-bold tracking-widest uppercase">
                  <GraduationCap className="w-4 h-4 text-[#DC2626]" />
                  <span>NATIONAL BASKETBALL SCHOLARSHIPS &amp; TCAS QUOTA BOARD</span>
                </div>
                <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider font-normal text-white leading-tight">
                  กระดานคัดตัวนักกีฬาช้างเผือก <br />
                  <span className="text-[#DC2626]">และทุนการศึกษาบาสเกตบอล</span> ทั่วประเทศ
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  รวบรวมโควตากีฬา TCAS รอบที่ 1 Portfolio ของมหาวิทยาลัยชั้นนำ, 
                  ทุนการศึกษาระดับ ม.ปลาย และเวทีคัดตัวเยาวชนสโมสรกึ่งอาชีพ 
                  สมัครได้ทันทีด้วยพอร์ตสถิติและบัตรดิจิทัลที่ผ่านการรับรอง
                </p>
              </div>

              {/* Stats Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-6">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                    ทุนที่เปิดรับสมัครอยู่
                  </div>
                  <div className="text-3xl font-headline-xl text-white font-normal">
                    {opportunities.length} รายการ
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#DC2626]" />
                    <span>อัปเดตเกณฑ์ระเบียบการทางการ 2026/2570</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* Search input */}
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded px-3 py-1.5 w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาโครงการ, สถาบัน หรือจังหวัด..."
                  className="bg-transparent border-0 p-0 text-xs font-medium text-slate-800 placeholder:text-slate-400 w-full outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
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
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`px-3 py-1.5 rounded font-bold transition whitespace-nowrap ${
                      selectedLevel === lvl.id
                        ? "bg-[#AF101A] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                    onClick={() => setSelectedFunding(fund.id)}
                    className={`px-2.5 py-1 rounded font-bold transition ${
                      selectedFunding === fund.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-headline-lg uppercase text-lg text-slate-800">
                  ไม่พบประกาศรับสมัครตามเงื่อนไขที่เลือก
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  ลองเลือก "ทุกระดับชั้น" หรือล้างคำค้นหาเพื่อดูทุนการศึกษาทั้งหมด
                </p>
              </div>
            ) : (
              filteredList.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition space-y-4"
                >
                  {/* Top Bar: Institution Logo, Level & Deadline */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm tracking-tight shrink-0 shadow-xs">
                        {opp.institutionLogo}
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                          {opp.institution}
                        </span>
                        <h2 className="font-bold text-base sm:text-lg text-slate-900 hover:text-[#DC2626] transition">
                          {opp.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-red-50 border border-red-200 text-[#DC2626] font-mono font-bold text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ปิดรับสมัคร: {opp.deadline}</span>
                      </span>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono bg-[#F8F9FC] p-4 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 uppercase block text-[10px]">ระดับชั้น</span>
                      <span className="font-bold text-slate-900">{opp.levelDisplay}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase block text-[10px]">ประเภททุน</span>
                      <span className="font-bold text-[#DC2626]">{opp.scholarshipDisplay}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase block text-[10px]">จำนวนที่รับ</span>
                      <span className="font-bold text-slate-900">{opp.quotaCount} ตำแหน่ง</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase block text-[10px]">เกณฑ์ GPAX</span>
                      <span className="font-bold text-slate-900">
                        {opp.minGpax ? `ไม่ต่ำกว่า ${opp.minGpax.toFixed(2)}` : "ไม่กำหนดเกรดขั้นต่ำ"}
                      </span>
                    </div>
                  </div>

                  {/* Description & Requirements */}
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-600 leading-relaxed">
                      {opp.description}
                    </p>
                    <div className="space-y-1 pt-1 font-mono text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700 block uppercase">เกณฑ์การพิจารณาเบื้องต้น:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {opp.requirements.map((req, idx) => (
                          <li key={idx} className="text-slate-600">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="text-xs font-mono text-slate-400">
                      ติดต่อ: {opp.contactEmail} • โทร {opp.contactPhone}
                    </div>

                    <button
                      type="button"
                      onClick={() => setApplyingOpportunity(opp)}
                      className="px-6 py-2.5 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md shadow-red-950/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>สมัครด้วย StatCourt ID</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Application Modal */}
        {applyingOpportunity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#0F172A] border border-slate-700 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#AF101A] flex items-center justify-center text-white">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-headline-lg uppercase text-base sm:text-lg tracking-wide font-normal">
                      สมัครคัดตัวด้วย StatCourt ID
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      ระบบจะส่ง Digital Pass และสถิติที่ผ่านการรับรองตรงสู่กรรมการคัดเลือก
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-slate-200 text-xs font-mono">
                {isSubmitted ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#AF101A] flex items-center justify-center mx-auto text-white shadow-lg">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-headline-lg uppercase text-xl text-white font-normal">
                        ส่งใบสมัครและพอร์ตสำเร็จ!
                      </h4>
                      <p className="text-slate-300">
                        โครงการ: {applyingOpportunity.title}
                      </p>
                      <p className="text-[11px] text-slate-300 font-bold">
                        รหัสการสมัคร: APP-CU-2026-{(Math.random() * 9000 + 1000).toFixed(0)}
                      </p>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-left space-y-2 text-[11px]">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-[#DC2626]" />
                        <span>แนบเอกสาร Digital Player Pass &amp; QR Code ยืนยันตัวตน</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-[#DC2626]" />
                        <span>แนบประวัติสถิติ FIBA Box Score และวิดีโอคลิปการแข่งขัน</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-4 h-4 text-[#DC2626]" />
                        <span>แนบเกรดเฉลี่ยสะสม GPAX ({applicantGpax}) และใบ ปพ.1 ดิจิทัล</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="w-full py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase transition"
                    >
                      เสร็จสิ้น
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-4">
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">โครงการที่สมัคร</span>
                      <div className="font-bold text-white text-sm">
                        {applyingOpportunity.title}
                      </div>
                      <div className="text-red-400 text-[11px]">
                        {applyingOpportunity.institution} • {applyingOpportunity.scholarshipDisplay}
                      </div>
                    </div>

                    {/* Pre-filled Dossier Credentials */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-400 mb-1 uppercase font-bold">
                          ชื่อ-นามสกุล นักกีฬา (Verified Profile)
                        </label>
                        <input
                          type="text"
                          disabled
                          value={applicantName}
                          className="w-full px-3 py-2 rounded bg-slate-800/80 border border-slate-700 text-slate-300 cursor-not-allowed"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1 uppercase font-bold">
                            รหัส TCAS / StatCourt ID
                          </label>
                          <input
                            type="text"
                            disabled
                            value={applicantTcasCode}
                            className="w-full px-3 py-2 rounded bg-slate-800/80 border border-slate-700 text-slate-200 font-bold cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1 uppercase font-bold">
                            ผลการเรียนเฉลี่ยสะสม (GPAX)
                          </label>
                          <input
                            type="text"
                            disabled
                            value={applicantGpax}
                            className="w-full px-3 py-2 rounded bg-slate-800/80 border border-slate-700 text-slate-300 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 uppercase font-bold">
                          เบอร์โทรศัพท์สำหรับติดต่อกลับ *
                        </label>
                        <input
                          type="tel"
                          required
                          value={applicantPhone}
                          onChange={(e) => setApplicantPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 uppercase font-bold">
                          ข้อความเพิ่มเติมถึงสตาฟฟ์โค้ชผู้คัดเลือก
                        </label>
                        <textarea
                          rows={2}
                          value={applicantNotes}
                          onChange={(e) => setApplicantNotes(e.target.value)}
                          placeholder="ระบุประสบการณ์แข่งพิเศษ, เป้าหมายการเรียน, หรือตำแหน่งที่ถนัด"
                          className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start gap-2.5 text-[11px] text-red-200">
                      <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>
                        การกดส่งใบสมัครจะเป็นการยินยอมให้ระบบส่งรายงานสถิติ FIBA, ผลการเรียน GPAX และประวัติการแข่งขันให้แก่ทีมงานสเกาต์ของสถาบันเพื่อการพิจารณาคัดตัว
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-950/50 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>ยืนยันการส่งใบสมัครและพอร์ตโฟลิโอ</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
