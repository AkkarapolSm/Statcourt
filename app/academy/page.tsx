"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  BookOpen,
  Users,
  ShieldCheck,
  Camera,
  Search,
  PlusCircle,
  X,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EdgeCameraSimulatorModal from "@/components/camera/EdgeCameraSimulatorModal";
import AcademyCourseCard from "@/components/academy/AcademyCourseCard";
import CoursePlayerModal from "@/components/academy/CoursePlayerModal";
import CreateCourseModal from "@/components/academy/CreateCourseModal";
import {
  mockOfficialsRoster,
} from "@/lib/db/phase4-data";
import { mockAcademyVideoCourses } from "@/lib/db/academy-courses-data";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import {
  AcademyVideoCourse,
  CourseCategory,
} from "@/lib/types";

export default function AcademyPage() {
  const { currentUser } = useAuthStore();
  const canCreateCourse = currentUser?.role === "COACH" || currentUser?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState<"COURSES" | "OFFICIALS_MARKET">("COURSES");

  // Video Courses State
  const [videoCourses, setVideoCourses] = useState<AcademyVideoCourse[]>(mockAcademyVideoCourses);
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | CourseCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<AcademyVideoCourse | null>(null);
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);

  // Edge Camera Simulator
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const filteredCourses = useMemo(() => {
    return videoCourses.filter((course) => {
      const matchCat =
        selectedCategory === "ALL" || course.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructorTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [videoCourses, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Section (Courtside Editorial) */}
        <section className="bg-[#0B1C30] text-white py-12 border-b border-[#1E3A5F]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#AF101A]/20 border border-[#AF101A]/40 text-red-200 text-xs font-mono font-semibold tracking-wider uppercase">
                  <GraduationCap className="w-3.5 h-3.5 text-[#AF101A]" />
                  <span>FIBA OFFICIAL CERTIFICATION &amp; TECHNICAL ACADEMY</span>
                </div>
                <h1 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wide font-normal text-white leading-tight">
                  สถาบันพัฒนาผู้ตัดสินโต๊ะเทคนิค <br />
                  <span className="text-[#AF101A]">และระบบรับรองมาตรฐาน FIBA</span>
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  หลักสูตรพัฒนาศักยภาพผู้ฝึกสอนและผู้ตัดสินโต๊ะเทคนิคครบวงจร พร้อมทำเนียบว่าจ้างกรรมการเทคนิคที่ผ่านการรับรองมาตรฐานสากล
                </p>
              </div>

              {/* Edge AI Camera Launcher Card */}
              <div className="bg-[#142338] border border-[#223956] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="space-y-1 font-mono">
                  <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider block">
                    STATCOURT FOCUS MOBILE
                  </span>
                  <div className="text-sm font-bold text-white">
                    กล้อง AI ติดตามอัตโนมัติบนมือถือ
                  </div>
                  <div className="text-[11px] text-slate-300">
                    แบบจำลองระบบ Edge Computer Vision
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="px-3.5 py-2 rounded-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shrink-0"
                >
                  <Camera className="w-4 h-4 text-slate-200" />
                  <span>ทดสอบ AI Camera</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="bg-white border-b border-[#DFE2EB] sticky top-14 z-30 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("COURSES")}
                aria-pressed={activeTab === "COURSES"}
                className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "COURSES"
                    ? "bg-[#0B1C30] text-white shadow-xs"
                    : "bg-[#F8F9FF] border border-[#DFE2EB] text-[#505A69] hover:text-[#0B1C30] hover:bg-[#EEF1F8]"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>หลักสูตรอบรม (Courses)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("OFFICIALS_MARKET")}
                aria-pressed={activeTab === "OFFICIALS_MARKET"}
                className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "OFFICIALS_MARKET"
                    ? "bg-[#0B1C30] text-white shadow-xs"
                    : "bg-[#F8F9FF] border border-[#DFE2EB] text-[#505A69] hover:text-[#0B1C30] hover:bg-[#EEF1F8]"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>ทำเนียบและว่าจ้างผู้ตัดสิน</span>
              </button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* TAB 1: COURSES CATALOG */}
          {activeTab === "COURSES" && (
            <div className="space-y-6">
              {/* Category Selector & Action Bar */}
              <div className="bg-white text-[#0B1C30] rounded-xl p-5 border border-[#DFE2EB] shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#AF101A]/10 text-[#AF101A] border border-[#AF101A]/20 text-xs font-semibold mb-2">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>กฎกติกา &amp; วิดีโอหลักสูตรมาตรฐาน FIBA</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-wide text-[#0B1C30]">
                      คอร์สอบรมออนไลน์และคลินิกวิดีโอ (Video Courses)
                    </h2>
                    <p className="text-[#505A69] text-xs sm:text-sm mt-0.5">
                      เรียนรู้จากคลิปผู้สอนจริง ครอบคลุมทั้งโต๊ะเทคนิค, แท็กติกโค้ช, ทักษะเยาวชน และวิทยาศาสตร์การกีฬา
                    </p>
                  </div>

                  {/* Coach / Admin Add Course Action - Only visible to COACH or ADMIN */}
                  {canCreateCourse && (
                    <button
                      type="button"
                      onClick={() => setIsCreateCourseModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#AF101A] to-[#8E0D15] hover:from-[#C71520] hover:to-[#9F1018] text-white text-xs font-semibold transition-all shadow-md hover:shadow-red-900/20 cursor-pointer shrink-0"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ สร้างคอร์สใหม่</span>
                    </button>
                  )}
                </div>

                {/* Filter Pills & Search */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-[#DFE2EB]">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
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
                          aria-pressed={selectedCategory === cat.id}
                          className={`px-3 py-1.5 rounded-sm font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            selectedCategory === cat.id
                              ? "bg-[#0B1C30] text-white"
                              : "bg-[#F8F9FF] border border-[#DFE2EB] text-[#505A69] hover:text-[#0B1C30] hover:bg-[#EEF1F8]"
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-sm ${
                              selectedCategory === cat.id
                                ? "bg-white/20 text-white font-bold"
                                : "bg-white border border-[#DFE2EB] text-[#505A69]"
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
                    <label htmlFor="course-search-input" className="sr-only">
                      ค้นหาชื่อคอร์ส หรือผู้สอน
                    </label>
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#505A69]" />
                    <input
                      id="course-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหาชื่อคอร์ส หรือผู้สอน..."
                      className="w-full bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm pl-9 pr-8 py-1.5 text-xs text-[#0B1C30] placeholder:text-[#505A69] focus:outline-none focus:border-[#AF101A] focus:bg-white transition"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="ล้างคำค้นหา"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#505A69] hover:text-[#0B1C30]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Course List */}
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <AcademyCourseCard
                    key={course.id}
                    course={course}
                    onSelectCourse={(c) => setSelectedCourse(c)}
                  />
                ))}

                {filteredCourses.length === 0 && (
                  <div className="bg-white border border-[#DFE2EB] rounded-lg p-12 text-center text-[#505A69] shadow-xs">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <div className="text-base font-bold text-[#0B1C30] mb-1">
                      ไม่พบคอร์สที่ตรงกับเงื่อนไขการค้นหา
                    </div>
                    <div className="text-xs">
                      ลองเลือกหมวดหมู่อื่น หรือพิมพ์คำค้นหาใหม่อีกครั้ง
                    </div>
                  </div>
                )}
              </div>

              {/* Officials Marketplace Callout */}
              <div className="bg-[#0B1C30] text-white p-6 rounded-lg border border-[#1E3A5F] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-sm bg-[#AF101A] flex items-center justify-center text-white shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white">
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
                  className="px-5 py-2.5 rounded-sm bg-[#AF101A] hover:bg-[#8E0D15] text-white font-mono text-xs font-bold uppercase tracking-wider transition shrink-0 cursor-pointer shadow-xs"
                >
                  ดูทำเนียบผู้ตัดสิน &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIALS MARKETPLACE & BOOKING */}
          {activeTab === "OFFICIALS_MARKET" && (
            <div className="space-y-6">
              <div className="bg-white border border-[#DFE2EB] text-[#0B1C30] p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs shadow-xs">
                <div>
                  <span className="text-[#AF101A] font-bold uppercase text-[10px] block">
                    TOURNAMENT ORGANIZER RECRUITMENT MARKETPLACE
                  </span>
                  <div className="font-bold text-[#0B1C30] text-base sm:text-lg mt-0.5">
                    ว่าจ้างทีมงานกรรมการโต๊ะเทคนิคที่ผ่านการรับรอง FIBA
                  </div>
                  <p className="text-[#505A69] text-xs mt-0.5 font-sans">
                    การันตีความถูกต้องของสถิติสดและอุปกรณ์โต๊ะเทคนิคพร้อมใช้งานในทุกแมตช์
                  </p>
                </div>

                <div className="text-[#0B1C30] font-bold text-xs bg-[#F8F9FF] px-3 py-1.5 rounded-sm border border-[#DFE2EB] shrink-0">
                  มีกรรมการพร้อมปฏิบัติหน้าที่ 40+ คนทั่วประเทศ
                </div>
              </div>

              {/* Officials Roster Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                {mockOfficialsRoster.map((off) => (
                  <article
                    key={off.id}
                    className="bg-white border border-[#DFE2EB] rounded-lg p-5 hover:border-[#7F8A9E] transition-colors space-y-3 flex flex-col justify-between shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-sm bg-[#AF101A]/10 text-[#AF101A] border border-[#AF101A]/30 text-[10px] font-bold uppercase">
                          {off.tier.replace("_", " ")}
                        </span>
                        <span className="text-[#0B1C30] font-bold flex items-center gap-1 font-mono">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#AF101A]" />
                          <span>{off.rating} / 5.0 Rating</span>
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-bold text-[#0B1C30] text-base font-sans">
                          {off.name}
                        </h4>
                        <div className="text-[#505A69] text-[11px]">
                          {off.licenseNumber} • {off.province}
                        </div>
                      </div>

                      <p className="text-[#505A69] text-[11px] font-sans">
                        ความเชี่ยวชาญ: {off.specialization}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#DFE2EB] flex items-center justify-between">
                      <div>
                        <span className="text-[#505A69] uppercase text-[10px] font-semibold block">อัตราค่าเหนื่อย</span>
                        <span className="font-bold text-[#0B1C30] text-sm tabular-nums">{off.dailyRateThb} THB / วัน</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert(`ส่งคำขอว่าจ้าง ${off.name} เรียบร้อยแล้ว ทีมงานจะประสานงานกลับใน 2 ชั่วโมง`)}
                        className="px-4 py-2 rounded-sm bg-[#0B1C30] hover:bg-[#142338] text-white font-semibold uppercase transition cursor-pointer shadow-xs"
                      >
                        ว่าจ้างลงแมตช์
                      </button>
                    </div>
                  </article>
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

        {/* Video Course Player Modal */}
        <CoursePlayerModal
          isOpen={Boolean(selectedCourse)}
          onClose={() => setSelectedCourse(null)}
          course={selectedCourse}
        />

        {/* Create Course Modal for Coaches & Admins */}
        {canCreateCourse && (
          <CreateCourseModal
            isOpen={isCreateCourseModalOpen}
            onClose={() => setIsCreateCourseModalOpen(false)}
            onCourseCreated={(newCourse) => {
              setVideoCourses([newCourse, ...videoCourses]);
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
