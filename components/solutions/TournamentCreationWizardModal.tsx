"use client";

import React, { useState } from "react";
import {
  X,
  Trophy,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Radio,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface TournamentCreationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdTournament: any) => void;
}

export default function TournamentCreationWizardModal({
  isOpen,
  onClose,
  onSuccess,
}: TournamentCreationWizardModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdData, setCreatedData] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [category, setCategory] = useState<"U14" | "U16" | "U18" | "Open">("U18");
  const [region, setRegion] = useState("กรุงเทพฯ และปริมณฑล");
  const [province, setProvince] = useState("กรุงเทพมหานคร");
  const [venue, setVenue] = useState("");
  const [startDate, setStartDate] = useState("2026-11-01");
  const [endDate, setEndDate] = useState("2026-11-15");
  const [maxTeams, setMaxTeams] = useState<number>(16);
  const [entryFeeThb, setEntryFeeThb] = useState<number>(8500);
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim()) {
        setErrorMsg("กรุณาระบุชื่อทัวร์นาเมนต์");
        return;
      }
      if (!venue.trim()) {
        setErrorMsg("กรุณาระบุสถานที่จัดการแข่งขัน");
        return;
      }
      setErrorMsg(null);
      setStep(2);
    } else if (step === 2) {
      if (!contactPerson.trim() || !contactPhone.trim()) {
        setErrorMsg("กรุณาระบุชื่อผู้ประสานงานและเบอร์โทรศัพท์");
        return;
      }
      setErrorMsg(null);
      setStep(3);
    }
  };

  const handleCreateTournament = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        name,
        organizer: organizer || "ฝ่ายจัดการแข่งขันอิสระ",
        category,
        region,
        province,
        venue,
        location: venue,
        startDate,
        endDate,
        maxTeams: Number(maxTeams) || 16,
        entryFeeThb: Number(entryFeeThb) || 0,
        contactPerson,
        contactPhone,
        rulesPdfUrl: "#official-rules",
      };

      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการสร้างทัวร์นาเมนต์");
      }

      setCreatedData(data.data);
      if (onSuccess) {
        onSuccess(data.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create tournament");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setCreatedData(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#AF101A] flex items-center justify-center text-white shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B1C30] tracking-wide">
                เปิดระบบทัวร์นาเมนต์ใหม่ (Tournament Onboarding)
              </h2>
              <p className="text-xs text-slate-500">
                ติดตั้งระบบ Table Official Console &amp; Live SSE Broadcasting ใน 3 ขั้นตอน
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        {!createdData && (
          <div className="px-6 pt-4 pb-3 bg-white border-b border-slate-100 flex items-center justify-between font-mono text-xs">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-[#AF101A] font-bold" : "text-slate-400"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? "bg-[#AF101A] text-white" : "bg-slate-100 text-slate-500"}`}>
                1
              </span>
              <span>ข้อมูลการแข่งขัน</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-slate-200">
              <div className={`h-full bg-[#AF101A] transition-all duration-300 ${step === 1 ? "w-0" : step === 2 ? "w-1/2" : "w-full"}`} />
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-[#AF101A] font-bold" : "text-slate-400"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? "bg-[#AF101A] text-white" : "bg-slate-100 text-slate-500"}`}>
                2
              </span>
              <span>ระเบียบ &amp; การรับสมัคร</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-slate-200">
              <div className={`h-full bg-[#AF101A] transition-all duration-300 ${step === 3 ? "w-full" : "w-0"}`} />
            </div>
            <div className={`flex items-center gap-2 ${step === 3 ? "text-[#AF101A] font-bold" : "text-slate-400"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? "bg-[#AF101A] text-white" : "bg-slate-100 text-slate-500"}`}>
                3
              </span>
              <span>ยืนยันเปิดระบบ</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-sans text-sm space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Success Screen */}
          {createdData ? (
            <div className="text-center py-6 space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0B1C30]">เปิดระบบทัวร์นาเมนต์สำเร็จ!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  ระบบได้สร้างฐานข้อมูลการแข่งขัน ติดตั้งโต๊ะเทคนิคดิจิทัล และเปิดสัญญาณสตรีมมิ่งสดเรียบร้อยแล้ว
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left font-mono text-xs space-y-2 max-w-md mx-auto">
                <div className="text-[#0B1C30] font-bold text-sm">{createdData.name}</div>
                <div className="text-slate-600 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#AF101A]" />
                  <span>{createdData.venue}, {createdData.province}</span>
                </div>
                <div className="text-slate-600 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>รุ่น {createdData.category} • รับสูงสุด {createdData.maxTeams} ทีม</span>
                </div>
                <div className="text-slate-600 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ค่าสมัคร {createdData.entryFeeThb.toLocaleString()} บาท/ทีม</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
                <Link
                  href="/tournaments"
                  onClick={resetAndClose}
                  className="px-5 py-2.5 rounded-xl bg-[#AF101A] hover:bg-[#8F0D15] text-white font-bold transition flex items-center gap-2 shadow-md"
                >
                  <Trophy className="w-4 h-4" />
                  <span>ดูหน้ารายการแข่งขัน</span>
                </Link>
                <Link
                  href="/official/console/match-bcc-ds-01"
                  onClick={resetAndClose}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-2 border border-slate-200"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>เปิด Table Official Console</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-700 mb-1.5 font-bold">
                      ชื่อรายการแข่งขัน (Tournament Name) *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="เช่น Singha Bangkok Youth Super League 2026"
                      className="w-full bg-[#F8F9FC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#AF101A] focus:bg-white transition text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1.5 font-bold">
                        หน่วยงาน / ผู้จัดการแข่งขัน (Organizer)
                      </label>
                      <input
                        type="text"
                        value={organizer}
                        onChange={(e) => setOrganizer(e.target.value)}
                        placeholder="เช่น ชมรมบาสเกตบอลเยาวชนไทย"
                        className="w-full bg-[#F8F9FC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#AF101A] focus:bg-white transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1.5 font-bold">
                        รุ่นอายุการแข่งขัน (Category)
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full bg-[#F8F9FC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#AF101A] focus:bg-white transition text-sm"
                      >
                        <option value="U14">รุ่นอายุไม่เกิน 14 ปี (U14)</option>
                        <option value="U16">รุ่นอายุไม่เกิน 16 ปี (U16)</option>
                        <option value="U18">รุ่นอายุไม่เกิน 18 ปี (U18 - High School)</option>
                        <option value="Open">รุ่นประชาชนทั่วไป (Open Division)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1.5 font-bold">
                        ภูมิภาค (Region)
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full bg-[#F8F9FC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#AF101A] focus:bg-white transition text-sm"
                      >
                        <option value="กรุงเทพฯ และปริมณฑล">กรุงเทพฯ และปริมณฑล</option>
                        <option value="ภาคกลาง">ภาคกลาง</option>
                        <option value="ภาคเหนือ">ภาคเหนือ</option>
                        <option value="ภาคอีสาน">ภาคอีสาน</option>
                        <option value="ภาคใต้">ภาคใต้</option>
                        <option value="ภาคตะวันออก">ภาคตะวันออก</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1.5 font-bold">
                        จังหวัด (Province)
                      </label>
                      <input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        placeholder="เช่น กรุงเทพมหานคร, เชียงใหม่"
                        className="w-full bg-[#F8F9FC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#AF101A] focus:bg-white transition text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-700 mb-1.5 font-bold">
                      สถานที่แข่งขัน / ยิมเนเซียม (Venue) *
                    </label>
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="เช่น อาคารยิมเนเซียม 1 สนามกีฬาแห่งชาติ"
                      className="w-full bg-[#F8F9FC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#AF101A] focus:bg-white transition text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1.5 font-bold">
                        วันที่เริ่มแข่งขัน (Start Date)
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-[#F8F9FC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#AF101A] focus:bg-white transition text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1.5 font-bold">
                        วันที่สิ้นสุด (End Date)
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-[#F8F9FC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#AF101A] focus:bg-white transition text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Regulations & Registration */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1.5 font-bold">
                        จำนวนทีมสูงสุด (Max Teams)
                      </label>
                      <select
                        value={maxTeams}
                        onChange={(e) => setMaxTeams(Number(e.target.value))}
                        className="w-full bg-[#F8F9FC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#AF101A] focus:bg-white transition text-sm font-mono"
                      >
                        <option value={8}>8 ทีม (Quarterfinals)</option>
                        <option value={16}>16 ทีม (Round of 16)</option>
                        <option value={24}>24 ทีม (Group Stage + Knockout)</option>
                        <option value={32}>32 ทีม (National Bracket)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1.5 font-bold">
                        ค่าสมัครต่อทีม (THB)
                      </label>
                      <input
                        type="number"
                        value={entryFeeThb}
                        onChange={(e) => setEntryFeeThb(Number(e.target.value))}
                        placeholder="8500"
                        className="w-full bg-[#F8F9FC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#AF101A] focus:bg-white transition text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1.5 font-bold">
                        ชื่อผู้ประสานงานหลัก (Contact Person) *
                      </label>
                      <input
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="เช่น โค้ชชาญวิทย์ พูลสวัสดิ์"
                        className="w-full bg-[#F8F9FC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#AF101A] focus:bg-white transition text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1.5 font-bold">
                        เบอร์โทรศัพท์ติดต่อ (Phone) *
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="เช่น 081-888-9999"
                        className="w-full bg-[#F8F9FC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:border-[#AF101A] focus:bg-white transition text-sm font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Included SaaS Features */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-mono text-[#AF101A] font-bold block uppercase tracking-wider">
                      ฟีเจอร์ระดับองค์กรที่ติดตั้งให้อัตโนมัติ:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-sans">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>ระบบ Table Official Console FIBA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>สตรีมคะแนนสดผ่าน SSE สู่หน้า /live</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>ตรวจสอบบัตรนักกีฬา Digital Pass</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>ออกใบบันทึกคะแนน FIBA Scoresheet PDF</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Confirmation Summary */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-[#AF101A] text-white font-bold px-2 py-0.5 rounded uppercase">
                          {category} TOURNAMENT
                        </span>
                        <h4 className="text-base font-bold text-[#0B1C30] mt-1.5">{name}</h4>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          จัดโดย: {organizer || "ฝ่ายจัดการแข่งขันอิสระ"}
                        </div>
                      </div>
                      <span className="text-emerald-700 font-bold text-sm">
                        {entryFeeThb.toLocaleString()} THB
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div>
                        <span className="text-slate-400 block">สถานที่:</span>
                        <span className="font-bold text-[#0B1C30]">{venue}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">จังหวัด:</span>
                        <span className="font-bold text-[#0B1C30]">{province} ({region})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">ช่วงเวลา:</span>
                        <span className="font-bold text-amber-700">{startDate} ถึง {endDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">ผู้ประสานงาน:</span>
                        <span className="font-bold text-[#0B1C30]">{contactPerson} ({contactPhone})</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                      <span>สถานะระบบถ่ายทอดสด:</span>
                    </div>
                    <span className="text-emerald-700 font-bold">พร้อมเชื่อมต่อ Multi-Court SSE</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Buttons */}
        {!createdData && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between font-mono text-xs">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ย้อนกลับ</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 font-bold transition"
              >
                ยกเลิก
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-[#AF101A] hover:bg-[#8F0D15] text-white font-bold transition flex items-center gap-1.5 shadow-md"
              >
                <span>ถัดไป</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateTournament}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#AF101A] hover:bg-[#8F0D15] text-white font-bold transition flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>กำลังเปิดระบบ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>ยืนยันเปิดระบบทัวร์นาเมนต์</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
