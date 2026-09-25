"use client";

import React, { useState } from "react";
import { Play, Star, Share2, Check, Clock, User, ShieldCheck } from "lucide-react";
import { AcademyVideoCourse } from "@/lib/types";

interface AcademyCourseCardProps {
  course: AcademyVideoCourse;
  onSelectCourse: (course: AcademyVideoCourse) => void;
}

export default function AcademyCourseCard({
  course,
  onSelectCourse,
}: AcademyCourseCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(
        `${window.location.origin}/academy?courseId=${course.id}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const discountPercent =
    course.originalPriceThb && course.originalPriceThb > course.priceThb
      ? Math.round(
          ((course.originalPriceThb - course.priceThb) /
            course.originalPriceThb) *
            100
        )
      : null;

  return (
    <div
      onClick={() => onSelectCourse(course)}
      className="bg-[#0F172A] hover:bg-[#1E293B] border border-slate-800 hover:border-red-600/60 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-red-950/20 transition-all duration-300 cursor-pointer flex flex-col md:flex-row gap-5 lg:gap-6 items-stretch group text-white relative overflow-hidden"
    >
      {/* Top accent bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#AF101A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* ============================================================== */}
      {/* LEFT: VIDEO THUMBNAIL WITH PLAY OVERLAY (MATCHING IMAGE 3)     */}
      {/* ============================================================== */}
      <div className="relative w-full md:w-[46%] aspect-[16/10] sm:aspect-video rounded-xl overflow-hidden bg-black shrink-0 shadow-lg border border-slate-800 flex items-center justify-center">
        {/* Course Thumbnail Image */}
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-85"
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/50" />

        {/* Center Play Button Overlay (FIBA Red Accent) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-11 rounded-xl bg-red-600/90 hover:bg-[#DC2626] backdrop-blur-md border border-red-500/60 flex items-center justify-center text-white shadow-2xl shadow-red-950/60 group-hover:scale-110 transition-all duration-300">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>

        {/* Top-Right Badge (BSAT / FIBA Certified Coach) */}
        <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur border border-red-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 text-[9px] font-mono text-red-300 font-bold shadow">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>{course.instructorBadge.split(" ")[0] || "BSAT"}</span>
        </div>

        {/* Bottom Banner Title Overlay */}
        <div className="absolute bottom-2.5 inset-x-3 text-center">
          <div className="font-bold text-white text-xs sm:text-sm drop-shadow-md tracking-wide">
            {course.subtitle.split(" ")[0]} {course.subtitle.split(" ")[1] || ""}
          </div>
          <div className="text-[10px] text-slate-300 font-mono font-medium drop-shadow flex items-center justify-center gap-1.5 mt-0.5">
            <Clock className="w-3 h-3 text-red-400" />
            <span>ความยาว {course.duration}</span>
            <span>•</span>
            <span>{course.lessonsCount} บทเรียน</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT: COURSE DETAILS, PRICING & CTA (MATCHING IMAGE 3)        */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          {/* Tag Pill: คอร์สออนไลน์ & หมวดหมู่ */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-950/60 text-red-400 border border-red-800/60 text-[11px] font-mono font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              คอร์สสอนออนไลน์ • {course.categoryDisplay}
            </span>
          </div>

          {/* Main Course Title */}
          <h3 className="text-lg sm:text-xl font-bold text-white leading-snug group-hover:text-red-400 transition-colors">
            {course.title}
          </h3>

          {/* Instructor Byline */}
          <div className="flex items-center gap-2.5 mt-2.5 text-xs text-slate-300">
            <img
              src={course.instructorAvatar}
              alt={course.instructorName}
              className="w-6 h-6 rounded-full object-cover border border-red-500/40"
            />
            <span className="font-bold text-white">{course.instructorName}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 truncate">{course.instructorTitle}</span>
          </div>
        </div>

        {/* Price & Rating Row (Matching Image 3) */}
        <div className="space-y-1.5 pt-1">
          {/* Price */}
          <div className="flex items-baseline gap-2.5">
            {course.isFree ? (
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                เรียนฟรี
              </span>
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {course.priceThb.toLocaleString()} บาท
                </span>
                {course.originalPriceThb && (
                  <span className="text-sm text-slate-400 line-through font-mono">
                    {course.originalPriceThb.toLocaleString()} บาท
                  </span>
                )}
                {discountPercent && (
                  <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 text-[11px] font-mono font-bold">
                    ลด {discountPercent}%
                  </span>
                )}
              </>
            )}
          </div>

          {/* Stars & Reviews */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
            <div className="flex items-center text-slate-300">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(course.rating)
                      ? "fill-current text-[#AF101A]"
                      : "text-slate-600"
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-white">
              {course.rating.toFixed(1)}
            </span>
            <span className="text-slate-400">({course.reviewCount} รีวิว)</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{course.enrolledCount} ผู้เรียน</span>
          </div>
        </div>

        {/* CTA Button & Share Icon (Matching Image 3 with StatCourt Tone) */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectCourse(course);
            }}
            className="flex-1 py-3 px-6 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm text-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-98"
          >
            {course.isFree ? "เข้าชมบทเรียนฟรี" : "ชำระเงินเพื่อเริ่มเรียน"}
          </button>

          {/* Share Button with Tooltip */}
          <button
            type="button"
            onClick={handleShare}
            className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700 shrink-0 cursor-pointer"
            title="แชร์คอร์สเรียนนี้"
          >
            {copied ? (
              <Check className="w-5 h-5 text-[#AF101A]" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
