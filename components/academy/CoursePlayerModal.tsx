"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  ShieldCheck,
  Share2,
  Lock,
  ChevronRight,
  Star,
} from "lucide-react";
import { AcademyVideoCourse, CourseLesson } from "@/lib/types";

interface CoursePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: AcademyVideoCourse | null;
}

export default function CoursePlayerModal({
  isOpen,
  onClose,
  course,
}: CoursePlayerModalProps) {
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);

  if (!isOpen || !course) return null;

  const currentLesson: CourseLesson =
    course.syllabus[activeLessonIndex] || course.syllabus[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-4 text-white font-mono flex flex-col max-h-[94vh]">
        {/* MODAL CONTROL HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#1E293B]/80 shrink-0">
          <div className="flex items-center gap-2.5 truncate">
            <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider shrink-0">
              {course.categoryDisplay}
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-white truncate">
              {course.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN BODY: VIDEO PLAYER (LEFT) + SYLLABUS & LESSONS (RIGHT) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-950">
          
          {/* Left Column: Video Player & Description (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-800">
            {/* Interactive Video Container */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center">
              {currentLesson?.videoUrl && (currentLesson.isFreePreview || isEnrolled || course.isFree) ? (
                <iframe
                  src={currentLesson.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-radial from-slate-900 to-black p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 mb-3">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div className="font-bold text-base text-white">
                    บทเรียนนี้สำหรับผู้ลงทะเบียนเรียน
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-1 max-w-sm">
                    {course.isFree
                      ? "กดปุ่มด้านล่างเพื่อเริ่มเรียนบทเรียนทั้งหมดได้ทันที"
                      : `ชำระเงินเพียง ${course.priceThb.toLocaleString()} บาท เพื่อปลดล็อกคอร์สฉบับเต็ม`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEnrolled(true)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition"
                  >
                    {course.isFree ? "ลงทะเบียนเรียนฟรีทันที" : `ชำระเงิน ${course.priceThb.toLocaleString()} บาท`}
                  </button>
                </div>
              )}
            </div>

            {/* Currently Playing Lesson Title */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>
                  บทที่ {activeLessonIndex + 1} จาก {course.syllabus.length}
                </span>
                <span className="text-amber-400 font-bold">
                  {currentLesson?.duration || "15:00"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                {currentLesson?.title}
              </h2>
            </div>

            {/* Course Summary & Instructor Profile */}
            <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-xl space-y-3 font-sans text-xs">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <img
                  src={course.instructorAvatar}
                  alt={course.instructorName}
                  className="w-10 h-10 rounded-full object-cover border border-amber-400"
                />
                <div>
                  <div className="font-bold text-sm text-white font-mono">
                    {course.instructorName}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {course.instructorTitle} • <span className="text-amber-400">{course.instructorBadge}</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed">
                {course.subtitle}
              </p>

              {/* Key Outcomes */}
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-slate-200 uppercase font-mono text-[11px] block">
                  สิ่งที่คุณจะได้เรียนรู้จากคอร์สนี้:
                </span>
                <div className="space-y-1 text-slate-300">
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
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-[#0B0F19]">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    หลักสูตรบทเรียน (Syllabus)
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
                      onClick={() => setActiveLessonIndex(idx)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 text-xs ${
                        isActive
                          ? "bg-[#AF101A]/30 border-red-500 text-white font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                            isActive
                              ? "bg-red-600 text-white"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="line-clamp-2 leading-snug font-sans text-xs">
                            {lesson.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {lesson.duration}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isUnlocked ? (
                          <Play className={`w-3.5 h-3.5 ${isActive ? "text-red-400 fill-current" : "text-slate-400"}`} />
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
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 font-mono">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">ค่าลงทะเบียน:</span>
                <span className="text-xl font-bold text-white">
                  {course.isFree ? "ฟรีไม่มีค่าใช้จ่าย" : `${course.priceThb.toLocaleString()} บาท`}
                </span>
              </div>

              {!isEnrolled ? (
                <button
                  type="button"
                  onClick={() => setIsEnrolled(true)}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
                >
                  {course.isFree ? "เข้าชมบทเรียนทันที" : "ชำระเงินเพื่อเริ่มเรียน"}
                </button>
              ) : (
                <div className="py-2 text-center text-xs text-emerald-400 font-bold bg-emerald-950/60 rounded border border-emerald-800 flex items-center justify-center gap-1.5">
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
