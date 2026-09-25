"use client";

import React, { useState } from "react";
import { X, Send, Video, Sparkles, AlertCircle, Plus } from "lucide-react";
import { AcademyVideoCourse, CourseCategory } from "@/lib/types";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (newCourse: AcademyVideoCourse) => void;
}

const CATEGORIES: { value: CourseCategory; label: string }[] = [
  {
    value: "ATHLETE_DEVELOPMENT",
    label: "3. หลักสูตรและคลินิกสำหรับนักกีฬาเยาวชน (Athlete Development)",
  },
  {
    value: "TABLE_OFFICIALS",
    label: "1. หลักสูตรสำหรับโต๊ะกรรมการ & สถิติ (Table Officials & Statisticians)",
  },
  {
    value: "COACHING_TACTICS",
    label: "2. หลักสูตรโค้ชและแท็กติก (Coaching & Tactical Essentials)",
  },
  {
    value: "SPORTS_SCIENCE",
    label: "4. หมวดวิทยาศาสตร์การกีฬาและการแพทย์ (Sports Science & Athletic Performance)",
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
      setError("กรุณากรอกข้อมูลชื่อคอร์ส คำโปรย และผู้สอนให้ครบถ้วน");
      return;
    }

    const selectedCat = CATEGORIES.find((c) => c.value === category);
    const categoryDisplay = selectedCat ? selectedCat.label.split(". ")[1]?.split(" (")[0] || "ACADEMY" : "ACADEMY";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 text-white font-mono flex flex-col max-h-[92vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#1E293B]/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>สร้างคอร์สสอนออนไลน์ / วิดีโอคลินิก</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  COACH &amp; ADMIN
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                ลงทะเบียนคอร์สเรียนพร้อมคลิปสอนจริงสำหรับโต๊ะกรรมการ, โค้ช, นักกีฬา และเวชศาสตร์การกีฬา
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-950/80 border-b border-red-800 text-red-300 px-6 py-2.5 text-xs font-bold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">
              หมวดหมู่หลักสูตร (Category) <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CourseCategory)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-amber-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">
              ชื่อคอร์สเรียน (Course Title) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น Basketball Fundamental Skills ทักษะบาสเกตบอลระดับพื้นฐาน"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">
              คำโปรยคอร์ส (Course Subtitle) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="เช่น ฝึกทักษะบาสเกตบอลด้วยตัวเอง ตั้งแต่การเลี้ยงบอล การยิง และฟุตเวิร์ก"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Instructor Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">ชื่อผู้สอน (Instructor Name)</label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">ตำแหน่ง / สังกัดผู้สอน</label>
              <input
                type="text"
                value={instructorTitle}
                onChange={(e) => setInstructorTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">ราคาคอร์ส (บาท)</label>
              <input
                type="number"
                disabled={isFree}
                value={priceThb}
                onChange={(e) => setPriceThb(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">ราคาเต็ม / ส่วนลด (บาท)</label>
              <input
                type="number"
                disabled={isFree}
                value={originalPriceThb}
                onChange={(e) => setOriginalPriceThb(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
            </div>
            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-800 border-slate-700"
                />
                <span className="text-slate-300 font-bold">คอร์สนี้เรียนฟรี</span>
              </label>
            </div>
          </div>

          {/* Video URL & Thumbnail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">
                ลิงก์วิดีโอคลิปสอนจริง (YouTube Embed หรือ Video URL)
              </label>
              <input
                type="url"
                value={videoPreviewUrl}
                onChange={(e) => setVideoPreviewUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">
                ภาพหน้าปกคอร์ส (Thumbnail URL)
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Key Outcomes */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">
              สิ่งที่ผู้เรียนจะได้รับ (Key Outcomes, คั่นด้วยเครื่องหมายจุลภาค ,)
            </label>
            <textarea
              rows={2}
              value={outcomesText}
              onChange={(e) => setOutcomesText(e.target.value)}
              placeholder="ทักษะการชูต, การเลี้ยงบอล, การวิเคราะห์แผน..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-sans focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950/50 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>สร้างและเผยแพร่คอร์สเรียน</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
