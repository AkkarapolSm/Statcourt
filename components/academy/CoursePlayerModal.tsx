"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AcademyVideoCourse, CourseLesson } from "@/lib/types";

interface CoursePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: AcademyVideoCourse | null;
}

// ฟังก์ชันแปลง YouTube URL ให้เป็น Embed Format ที่ถูกต้องเสมอ
function getEmbedUrl(url: string | undefined): string {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  
  // แปลงจาก youtube.com/watch?v=ID
  const matchWatch = url.match(/[?&]v=([^&]+)/);
  if (matchWatch) return `https://www.youtube.com/embed/${matchWatch[1]}`;
  
  // แปลงจาก youtu.be/ID
  const matchShort = url.match(/youtu\.be\/([^?]+)/);
  if (matchShort) return `https://www.youtube.com/embed/${matchShort[1]}`;
  
  return url;
}

export default function CoursePlayerModal({
  isOpen,
  onClose,
  course,
}: CoursePlayerModalProps) {
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [videoError, setVideoError] = useState(false);

  if (!isOpen || !course) return null;

  const currentLesson: CourseLesson =
    course.syllabus[activeLessonIndex] || course.syllabus[0];
  const embedUrl = getEmbedUrl(currentLesson?.videoUrl);
  const isLessonUnlocked = currentLesson?.isFreePreview || isEnrolled || course.isFree;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#0B1C30] border border-[#213145] rounded-2xl shadow-2xl overflow-hidden my-4 text-white font-thai flex flex-col max-h-[94vh]">
        
        {/* MODAL CONTROL HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#213145] bg-[#071322]/90 shrink-0">
          <div className="flex items-center gap-3 truncate">
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.08] text-slate-200 border border-[#213145] text-[11px] font-medium shrink-0">
              {course.categoryDisplay}
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-white truncate font-thai">
              {course.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN BODY: VIDEO PLAYER (LEFT) + SYLLABUS (RIGHT) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-[#071322]">
          
          {/* Left Column: Video Player & Description (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-[#213145]">
            
            {/* Interactive Video Container */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-[#213145] shadow-2xl flex items-center justify-center">
              {embedUrl && isLessonUnlocked && !videoError ? (
                <iframe
                  src={embedUrl}
                  title={currentLesson?.title || course.title}
                  onError={() => setVideoError(true)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isLessonUnlocked ? (
                /* Video Poster Preview Fallback */
                <div className="relative w-full h-full">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col items-center justify-center p-6 text-center">
                    <a
                      href={currentLesson?.videoUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-16 h-16 rounded-full bg-[#AF101A] hover:bg-[#8E0D15] text-white flex items-center justify-center shadow-xl transition-transform hover:scale-110 mb-2 cursor-pointer"
                    >
                      <Play className="w-7 h-7 fill-white translate-x-0.5" />
                    </a>
                    <span className="text-xs text-slate-200 font-medium">
                      คลิกเพื่อเปิดดูวิดีโอคลิปการสอนบทเรียนนี้
                    </span>
                  </div>
                </div>
              ) : (
                /* Locked Lesson Overlay */
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-radial from-slate-900 via-[#0B1C30] to-black p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#AF101A]/15 text-[#FF7A7A] flex items-center justify-center border border-[#FF7A7A]/30 mb-3 shadow-lg">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-base text-white font-thai">
                    บทเรียนนี้สำหรับผู้ลงทะเบียนเรียน
                  </div>
                  <p className="text-xs text-slate-300 font-thai mt-1 max-w-sm">
                    {course.isFree
                      ? "กดปุ่มด้านล่างเพื่อเริ่มเรียนบทเรียนทั้งหมดได้ทันที"
                      : `ลงทะเบียนเพียง ${course.priceThb.toLocaleString()} บาท เพื่อปลดล็อกวิดีโอสอนจริงครบทุกบท`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEnrolled(true)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#AF101A] to-[#8E0D15] hover:from-[#C71520] hover:to-[#9F1018] text-white font-semibold text-xs transition-all shadow-lg hover:shadow-red-900/30 cursor-pointer"
                  >
                    {course.isFree ? "ลงทะเบียนเรียนฟรีทันที" : `ชำระเงิน ${course.priceThb.toLocaleString()} บาท`}
                  </button>
                </div>
              )}
            </div>

            {/* Currently Playing Lesson Title */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-thai">
                <span>
                  บทที่ {activeLessonIndex + 1} จาก {course.syllabus.length}
                </span>
                <span className="text-[#FF7A7A] font-semibold flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {currentLesson?.duration || "15:00"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1 font-thai leading-snug">
                {currentLesson?.title}
              </h2>
            </div>

            {/* Course Summary & Instructor Profile */}
            <div className="p-4 bg-white/[0.03] border border-[#213145] rounded-xl space-y-3 font-thai text-xs">
              <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
                <img
                  src={course.instructorAvatar}
                  alt={course.instructorName}
                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                />
                <div>
                  <div className="font-bold text-sm text-white">
                    {course.instructorName}
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center gap-1.5 flex-wrap">
                    <span>{course.instructorTitle}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300 font-medium">{course.instructorBadge}</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed">
                {course.subtitle}
              </p>

              {/* Key Outcomes */}
              <div className="space-y-1.5 pt-1">
                <span className="font-semibold text-slate-200 text-xs block">
                  สิ่งที่คุณจะได้เรียนรู้จากคอร์สนี้:
                </span>
                <div className="space-y-1.5 text-slate-300">
                  {course.keyOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Syllabus Curriculum (5 Cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-[#0B1C30] font-thai">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#213145] pb-2">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#FF7A7A]" />
                  <span className="font-bold text-xs text-slate-200">
                    หลักสูตรบทเรียน
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {course.syllabus.length} บทเรียน
                </span>
              </div>

              {/* Lessons List */}
              <div className="space-y-2">
                {course.syllabus.map((lesson, idx) => {
                  const isActive = activeLessonIndex === idx;
                  const isUnlocked = lesson.isFreePreview || isEnrolled || course.isFree;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        setActiveLessonIndex(idx);
                        setVideoError(false);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                        isActive
                          ? "bg-white/[0.08] border-[#AF101A] text-white shadow-md"
                          : "bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                            isActive
                              ? "bg-[#AF101A] text-white"
                              : "bg-white/10 text-slate-400"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className={`line-clamp-2 leading-snug font-thai ${isActive ? "font-bold text-white" : "font-medium text-slate-200"}`}>
                            {lesson.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {lesson.duration}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isUnlocked ? (
                          <Play className={`w-3.5 h-3.5 ${isActive ? "text-[#FF7A7A] fill-current" : "text-slate-400"}`} />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Enrollment Action */}
            <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">ค่าลงทะเบียน:</span>
                <span className="text-xl font-bold text-white">
                  {course.isFree ? "ฟรี ไม่มีค่าใช้จ่าย" : `${course.priceThb.toLocaleString()} บาท`}
                </span>
              </div>

              {!isEnrolled ? (
                <button
                  type="button"
                  onClick={() => setIsEnrolled(true)}
                  className="group w-full py-3 rounded-xl bg-gradient-to-r from-[#AF101A] to-[#8E0D15] hover:from-[#C71520] hover:to-[#9F1018] text-white font-semibold text-xs transition-all shadow-md hover:shadow-red-900/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{course.isFree ? "เข้าชมบทเรียนทันที" : "ชำระเงินเพื่อเริ่มเรียน"}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                <div className="py-2.5 text-center text-xs text-emerald-400 font-medium bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>คุณได้ลงทะเบียนเรียนคอร์สนี้แล้ว</span>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
