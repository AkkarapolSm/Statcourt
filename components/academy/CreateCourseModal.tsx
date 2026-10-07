"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  Video,
  Sparkles,
  AlertCircle,
  BookOpen,
  User,
  DollarSign,
  PlayCircle,
  GraduationCap,
} from "lucide-react";
import { AcademyVideoCourse, CourseCategory } from "@/lib/types";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (newCourse: AcademyVideoCourse) => void;
}

const CATEGORIES: { value: CourseCategory; label: string }[] = [
  {
    value: "ATHLETE_DEVELOPMENT",
    label: "หลักสูตรและคลินิกสำหรับนักกีฬาเยาวชน (Athlete Development)",
  },
  {
    value: "TABLE_OFFICIALS",
    label: "หลักสูตรสำหรับโต๊ะกรรมการ & สถิติ (Table Officials & Statisticians)",
  },
  {
    value: "COACHING_TACTICS",
    label: "หลักสูตรโค้ชและแท็กติกการเล่น (Coaching & Tactical Essentials)",
  },
  {
    value: "SPORTS_SCIENCE",
    label: "หมวดวิทยาศาสตร์การกีฬาและการแพทย์ (Sports Science & Athletic Performance)",
  },
];

export default function CreateCourseModal({
  isOpen,
  onClose,
  onCourseCreated,
}: CreateCourseModalProps) {
  const [category, setCategory] = useState<CourseCategory>("ATHLETE_DEVELOPMENT");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [instructorName, setInstructorName] = useState("โค้ชเอก กิตติศักดิ์");
  const [instructorTitle, setInstructorTitle] = useState("อดีตนักกีฬาทีมชาติไทย & ผู้ก่อตั้ง HuaRon Academy");
  const [instructorBadge, setInstructorBadge] = useState("BSAT CERTIFIED COACH A-LICENSE");
  const [priceThb, setPriceThb] = useState(690);
  const [originalPriceThb, setOriginalPriceThb] = useState(1290);
  const [isFree, setIsFree] = useState(false);
  const [duration, setDuration] = useState("4 ชั่วโมง 15 นาที");
  const [level, setLevel] = useState<AcademyVideoCourse["level"]>("ALL_LEVELS");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80"
  );
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(
    "https://www.youtube.com/embed/dQw4w9WgXcQ"
  );
  const [outcomesText, setOutcomesText] = useState(
    "การจัดระเบียบร่างกายและบาลานซ์, เทคนิคการชูตบาสที่ถูกต้อง, ฟุตเวิร์กการเลี้ยงเปลี่ยนทิศทาง"
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subtitle.trim() || !instructorName.trim()) {
      setError("กรุณากรอกข้อมูลชื่อคอร์ส คำโปรย และชื่อผู้สอนให้ครบถ้วน");
      return;
    }

    const selectedCat = CATEGORIES.find((c) => c.value === category);
    const categoryDisplay = selectedCat ? selectedCat.label.split(" (")[0] || "ACADEMY" : "ACADEMY";

    const keyOutcomes = outcomesText
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const newCourse: AcademyVideoCourse = {
      id: `course-${Date.now()}`,
      category,
      categoryDisplay,
      title: title.trim(),
      subtitle: subtitle.trim(),
      instructorName: instructorName.trim(),
      instructorTitle: instructorTitle.trim(),
      instructorAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      instructorBadge: instructorBadge.trim(),
      priceThb: isFree ? 0 : priceThb,
      originalPriceThb: isFree ? undefined : originalPriceThb,
      isFree,
      rating: 5.0,
      reviewCount: 1,
      duration: duration.trim() || "3 ชั่วโมง",
      level,
      thumbnailUrl:
        thumbnailUrl.trim() ||
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
      videoPreviewUrl: videoPreviewUrl.trim() || "https://www.youtube.com/embed/dQw4w9WgXcQ",
      lessonsCount: 8,
      enrolledCount: 1,
      createdByRole: "COACH",
      createdAt: new Date().toISOString().split("T")[0],
      keyOutcomes:
        keyOutcomes.length > 0
          ? keyOutcomes
          : ["ทักษะระดับพื้นฐานถึงขั้นสูง", "เทคนิคการฝึกซ้อมด้วยตัวเอง"],
      equipmentNeeded: ["ลูกบาสเกตบอล 1 ลูก", "พื้นที่ฝึกซ้อม"],
      syllabus: [
        {
          id: "s-1",
          title: "บทที่ 1: แนะนำโครงสร้างหลักสูตรและพื้นฐานการเตรียมตัว",
          duration: "15:20",
          videoUrl: videoPreviewUrl.trim(),
          isFreePreview: true,
        },
        {
          id: "s-2",
          title: "บทที่ 2: การสาธิตเทคนิคภาคปฏิบัติและข้อควรระวัง",
          duration: "25:40",
          videoUrl: videoPreviewUrl.trim(),
          isFreePreview: false,
        },
      ],
    };

    onCourseCreated(newCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0B1C30] border border-[#213145] rounded-2xl shadow-2xl overflow-hidden my-6 text-white font-thai flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#213145] bg-[#071322]/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AF101A]/15 border border-[#AF101A]/30 flex items-center justify-center text-[#FF7A7A] shadow-sm">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-thai">
                  สร้างคอร์สสอนออนไลน์ / วิดีโอคลินิก
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-950/80 text-[#FF7A7A] border border-red-800/60 font-mono font-medium">
                  COACH &amp; ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-300 font-thai mt-0.5">
                ลงทะเบียนคอร์สเรียนพร้อมคลิปสอนจริงสำหรับโต๊ะกรรมการ, โค้ช, นักกีฬา และเวชศาสตร์การกีฬา
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#0d223a] border border-transparent hover:border-[#213145] transition cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-950/80 border-b border-rose-800/60 text-rose-200 px-6 py-2.5 text-xs font-semibold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-thai">
          
          {/* Section 1: ข้อมูลหลักสูตร */}
          <div className="p-4 rounded-xl bg-[#0d223a] border border-[#213145] space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 pb-1 border-b border-[#213145]">
              <BookOpen className="w-3.5 h-3.5 text-[#FF7A7A]" />
              <span>ข้อมูลหลักสูตร (Course Details)</span>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                หมวดหมู่หลักสูตร <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CourseCategory)}
                className="w-full px-3.5 py-2.5 bg-[#071322] border border-[#213145] rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#AF101A] focus:border-[#AF101A] transition"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-[#071322] text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                ชื่อคอร์สเรียน <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น Basketball Fundamental Skills ทักษะบาสเกตบอลระดับพื้นฐาน"
                className="w-full px-3.5 py-2.5 bg-[#071322] border border-[#213145] rounded-xl text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#AF101A] focus:border-[#AF101A] text-sm transition placeholder:text-slate-500"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                คำโปรยคอร์ส (คำอธิบายสั้น) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="เช่น ฝึกทักษะบาสเกตบอลด้วยตัวเอง ตั้งแต่การเลี้ยงบอล การยิง และฟุตเวิร์ก"
                className="w-full px-3.5 py-2.5 bg-[#071322] border border-[#213145] rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#AF101A] focus:border-[#AF101A] transition placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Section 2: ผู้สอนและราคา */}
          <div className="p-4 rounded-xl bg-[#0d223a] border border-[#213145] space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 pb-1 border-b border-[#213145]">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>ผู้สอนและค่าลงทะเบียน (Instructor &amp; Pricing)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">ชื่อผู้สอน</label>
                <input
                  type="text"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071322] border border-[#213145] rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#AF101A] focus:border-[#AF101A] transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">ตำแหน่ง / สังกัดผู้สอน</label>
                <input
                  type="text"
                  value={instructorTitle}
                  onChange={(e) => setInstructorTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071322] border border-[#213145] rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#AF101A] focus:border-[#AF101A] transition"
                />
              </div>
            </div>

            {/* Pricing Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">ราคาคอร์ส (บาท)</label>
                <input
                  type="number"
                  disabled={isFree}
                  value={priceThb}
                  onChange={(e) => setPriceThb(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-[#071322] border border-[#213145] rounded-xl text-white text-xs font-bold font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-[#AF101A] focus:border-[#AF101A] disabled:opacity-40 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">ราคาเต็มก่อนลด (บาท)</label>
                <input
                  type="number"
                  disabled={isFree}
                  value={originalPriceThb}
                  onChange={(e) => setOriginalPriceThb(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-[#071322] border border-[#213145] rounded-xl text-white text-xs font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-[#AF101A] focus:border-[#AF101A] disabled:opacity-40 transition"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2.5 p-2.5 bg-[#071322] border border-[#213145] hover:border-slate-500 rounded-xl cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="w-4 h-4 text-[#AF101A] rounded bg-[#0B1C30] border-[#213145] focus:ring-0"
                  />
                  <span className="text-slate-200 font-semibold text-xs">คอร์สนี้เปิดเรียนฟรี</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: สื่อการสอนและผลลัพธ์ */}
          <div className="p-4 rounded-xl bg-[#0d223a] border border-[#213145] space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 pb-1 border-b border-[#213145]">
              <PlayCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>สื่อการเรียนและผลลัพธ์ (Media &amp; Outcomes)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">
                  ลิงก์วิดีโอคลิปสอนจริง (YouTube Embed หรือ URL)
                </label>
                <input
                  type="url"
                  value={videoPreviewUrl}
                  onChange={(e) => setVideoPreviewUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full px-3.5 py-2.5 bg-[#071322] border border-[#213145] rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#AF101A] focus:border-[#AF101A] transition placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">
                  ภาพหน้าปกคอร์ส (Thumbnail URL)
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#071322] border border-[#213145] rounded-xl text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#AF101A] focus:border-[#AF101A] transition"
                />
              </div>
            </div>

            {/* Key Outcomes */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">
                สิ่งที่ผู้เรียนจะได้รับ (คั่นด้วยเครื่องหมายจุลภาค ,)
              </label>
              <textarea
                rows={3}
                value={outcomesText}
                onChange={(e) => setOutcomesText(e.target.value)}
                placeholder="เช่น การจัดระเบียบร่างกาย, เทคนิคการชูตบาสที่ถูกต้อง, ฟุตเวิร์กการเลี้ยงเปลี่ยนทิศทาง"
                className="w-full px-3.5 py-2.5 bg-[#071322] border border-[#213145] rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#AF101A] focus:border-[#AF101A] transition resize-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#213145]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#071322] hover:bg-[#122842] text-slate-300 hover:text-white text-xs font-medium border border-[#213145] transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="group px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#AF101A] to-[#8E0D15] hover:from-[#C71520] hover:to-[#9F1018] text-white text-xs font-semibold flex items-center gap-2 shadow-lg hover:shadow-red-900/30 transition cursor-pointer"
            >
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              <span>สร้างและเผยแพร่คอร์สเรียน</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
