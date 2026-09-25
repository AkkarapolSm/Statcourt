"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Clock,
  Video,
  ExternalLink,
  ChevronRight,
  Camera,
  Search,
  Sparkles,
  DollarSign,
  Calendar,
  X,
  PlusCircle,
  Video as VideoIcon,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EdgeCameraSimulatorModal from "@/components/camera/EdgeCameraSimulatorModal";
import AcademyCourseCard from "@/components/academy/AcademyCourseCard";
import CoursePlayerModal from "@/components/academy/CoursePlayerModal";
import CreateCourseModal from "@/components/academy/CreateCourseModal";
import {
  mockAcademyCourses,
  mockOfficialsRoster,
} from "@/lib/db/phase4-data";
import { mockAcademyVideoCourses } from "@/lib/db/academy-courses-data";
import {
  AcademyCourse,
  OfficialHireProfile,
  AcademyVideoCourse,
  CourseCategory,
} from "@/lib/types";

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState<
    "COURSES" | "OFFICIALS_MARKET"
  >("COURSES");

  // Video Courses State (Image 3)
  const [videoCourses, setVideoCourses] = useState<AcademyVideoCourse[]>(mockAcademyVideoCourses);
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | CourseCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<AcademyVideoCourse | null>(null);
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);

  // Edge Camera Simulator
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Section */}
        <section className="bg-[#0F172A] text-white py-14 border-b border-slate-800">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#AF101A]/30 border border-[#AF101A]/50 text-red-200 text-xs font-mono font-bold tracking-widest uppercase">
                  <GraduationCap className="w-4 h-4 text-[#DC2626]" />
                  <span>FIBA OFFICIAL CERTIFICATION &amp; TECHNICAL ACADEMY</span>
                </div>
                <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider font-normal text-white leading-tight">
                  สถาบันพัฒนาผู้ตัดสินโต๊ะเทคนิค <br />
                  <span className="text-[#DC2626]">และระบบรับรองมาตรฐาน FIBA</span>
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  หลักสูตรพัฒนาศักยภาพผู้ฝึกสอนและผู้ตัดสินโต๊ะเทคนิคครบวงจร 
                  พร้อมทำเนียบว่าจ้างกรรมการเทคนิคที่ผ่านการรับรองมาตรฐานสากล
                </p>
              </div>

              {/* Edge AI Camera Launcher Button */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="space-y-1 font-mono">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">
                    STATCOURT FOCUS MOBILE
                  </span>
                  <div className="text-sm font-bold text-white">
                    กล้อง AI ติดตามอัตโนมัติบนมือถือ
                  </div>
                  <div className="text-[11px] text-slate-400">
                    ลดต้นทุนทีมตากล้องด้วย Edge Computer Vision
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="px-4 py-2.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-lg shadow-red-950/50 shrink-0"
                >
                  <Camera className="w-4 h-4" />
                  <span>ทดสอบ AI Camera</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="bg-white border-b border-slate-200 sticky top-14 z-30 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-2 overflow-x-auto font-mono text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("COURSES")}
                className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "COURSES"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>หลักสูตรอบรม (COURSES)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("OFFICIALS_MARKET")}
                className={`px-4 py-2.5 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "OFFICIALS_MARKET"
                    ? "bg-[#AF101A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>ทำเนียบและว่าจ้างผู้ตัดสิน (OFFICIALS DIRECTORY)</span>
              </button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* TAB 1: COURSES CATALOG (Image 3 Style) */}
          {activeTab === "COURSES" && (
            <div className="space-y-8">
              {/* Category selector & Action Bar */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>StatCourt Masterclass & Video Academy</span>
                    </div>
                    <h2 className="text-2xl font-bold font-headline tracking-wide uppercase text-white">
                      คอร์สอบรมออนไลน์และคลินิกวิดีโอ (Video Courses)
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      เรียนรู้จากคลิปผู้สอนจริง ครอบคลุมทั้งโต๊ะเทคนิค, แท็กติกโค้ช, ทักษะเยาวชน และวิทยาศาสตร์การกีฬา
                    </p>
                  </div>

                  {/* Coach / Admin Add Course Action */}
                  <button
                    type="button"
                    onClick={() => setIsCreateCourseModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#AF101A] hover:bg-[#8F0D15] text-white font-mono text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-red-950/40 shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ สร้างคอร์สใหม่ (Coach / Admin)</span>
                  </button>
                </div>

                {/* Filter Pills & Search */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4 border-t border-slate-800">
                  {/* Category Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
                    {[
                      { id: "ALL" as const, label: "ทั้งหมด" },
                      { id: "TABLE_OFFICIALS" as const, label: "1. โต๊ะกรรมการ & สถิติ" },
                      { id: "COACHING_TACTICS" as const, label: "2. โค้ชและแท็กติก" },
                      { id: "ATHLETE_DEVELOPMENT" as const, label: "3. คลินิกเยาวชน" },
                      { id: "SPORTS_SCIENCE" as const, label: "4. วิทยาศาสตร์การกีฬา" },
                    ].map((cat) => {
                      const count =
                        cat.id === "ALL"
                          ? videoCourses.length
                          : videoCourses.filter((c) => c.category === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
                            selectedCategory === cat.id
                              ? "bg-[#AF101A] text-white shadow-md shadow-red-950/40"
                              : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white"
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              selectedCategory === cat.id
                                ? "bg-red-950/80 text-white font-black border border-red-700/60"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Box */}
                  <div className="relative shrink-0 md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหาชื่อคอร์ส หรือผู้สอน..."
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Video Course List (Image 3 card design) */}
              <div className="space-y-4">
                {videoCourses
                  .filter((course) => {
                    const matchCat =
                      selectedCategory === "ALL" || course.category === selectedCategory;
                    const matchSearch =
                      searchQuery.trim() === "" ||
                      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      course.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      course.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      course.instructorTitle.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchCat && matchSearch;
                  })
                  .map((course) => (
                    <AcademyCourseCard
                      key={course.id}
                      course={course}
                      onSelectCourse={(c) => setSelectedCourse(c)}
                    />
                  ))}

                {videoCourses.filter((course) => {
                  const matchCat =
                    selectedCategory === "ALL" || course.category === selectedCategory;
                  const matchSearch =
                    searchQuery.trim() === "" ||
                    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    course.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    course.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    course.instructorTitle.toLowerCase().includes(searchQuery.toLowerCase());
                  return matchCat && matchSearch;
                }).length === 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                    <div className="text-base font-bold text-white mb-1">
                      ไม่พบคอร์สที่ตรงกับเงื่อนไขการค้นหา
                    </div>
                    <div className="text-xs">
                      ลองเลือกหมวดหมู่อื่น หรือพิมพ์คำค้นหาใหม่อีกครั้ง
                    </div>
                  </div>
                )}
              </div>

              {/* Officials Marketplace Callout */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-black text-white p-6 rounded-2xl border border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider text-red-300">
                      ต้องการทีมงานกรรมการโต๊ะเทคนิคสำหรับทัวร์นาเมนต์ของคุณ?
                    </h3>
                    <p className="text-slate-300 text-xs mt-1">
                      เข้าสู่ทำเนียบผู้ตัดสินที่ผ่านการรับรอง FIBA LiveStats เพื่อจัดหาและว่าจ้างเจ้าหน้าที่โต๊ะบันทึกคะแนนมืออาชีพ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("OFFICIALS_MARKET")}
                  className="px-6 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-mono text-xs font-bold uppercase tracking-wider transition shrink-0 shadow-lg shadow-red-950/40 cursor-pointer"
                >
                  ดูทำเนียบผู้ตัดสิน &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIALS MARKETPLACE & BOOKING */}
          {activeTab === "OFFICIALS_MARKET" && (
            <div className="space-y-6">
              <div className="bg-[#0F172A] text-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
                <div>
                  <span className="text-red-400 font-bold uppercase text-[10px] block">
                    TOURNAMENT ORGANIZER RECRUITMENT MARKETPLACE
                  </span>
                  <div className="font-bold text-white text-base sm:text-lg mt-0.5">
                    ว่าจ้างทีมงานกรรมการโต๊ะเทคนิคที่ผ่านการรับรอง FIBA
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">
                    การันตีความถูกต้องของสถิติสดและอุปกรณ์โต๊ะเทคนิคพร้อมใช้งานในทุกแมตช์
                  </p>
                </div>

                <div className="text-slate-300 font-bold text-sm bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
                  มีกรรมการพร้อมปฏิบัติหน้าที่ 40+ คนทั่วประเทศ
                </div>
              </div>

              {/* Officials Roster Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                {mockOfficialsRoster.map((off) => (
                  <div
                    key={off.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold uppercase">
                          {off.tier.replace("_", " ")}
                        </span>
                        <span className="text-slate-900 font-bold flex items-center gap-1 font-mono">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#AF101A]" />
                          <span>{off.rating} / 5.0 Rating</span>
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900 text-base">
                          {off.name}
                        </h4>
                        <div className="text-slate-500 text-[11px]">
                          {off.licenseNumber} • {off.province}
                        </div>
                      </div>

                      <p className="text-slate-600 text-[11px] font-sans">
                        ความเชี่ยวชาญ: {off.specialization}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 uppercase text-[10px] block">อัตราค่าเหนื่อย</span>
                        <span className="font-bold text-slate-900 text-sm">{off.dailyRateThb} THB / วัน</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert(`ส่งคำขอว่าจ้าง ${off.name} เรียบร้อยแล้ว ทีมงานจะประสานงานกลับใน 2 ชั่วโมง`)}
                        className="px-4 py-2 rounded bg-slate-900 hover:bg-[#AF101A] text-white font-bold uppercase transition"
                      >
                        ว่าจ้างลงแมตช์
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Edge Camera Simulator Modal */}
        <EdgeCameraSimulatorModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
        />

        {/* Video Course Player Modal (Image 3) */}
        <CoursePlayerModal
          isOpen={Boolean(selectedCourse)}
          onClose={() => setSelectedCourse(null)}
          course={selectedCourse}
        />

        {/* Create Course Modal for Coaches & Admins */}
        <CreateCourseModal
          isOpen={isCreateCourseModalOpen}
          onClose={() => setIsCreateCourseModalOpen(false)}
          onCourseCreated={(newCourse) => {
            setVideoCourses([newCourse, ...videoCourses]);
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
