"use client";

import React, { useState } from "react";
import { Play, Star, Share2, Check, Clock } from "lucide-react";
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
    <article
      onClick={() => onSelectCourse(course)}
      className="bg-white hover:border-[#7F8A9E] border border-[#DFE2EB] rounded-lg p-5 shadow-xs transition-colors cursor-pointer flex flex-col md:flex-row gap-5 lg:gap-6 items-stretch group text-[#0B1C30] relative overflow-hidden"
    >
      {/* Top subtle brand accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#AF101A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* LEFT: Video Thumbnail with Play Overlay */}
      <div className="relative w-full md:w-[44%] aspect-[16/10] sm:aspect-video rounded-sm overflow-hidden bg-black shrink-0 border border-[#DFE2EB] flex items-center justify-center">
        {/* Course Thumbnail Image */}
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/40" />

        {/* Center Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-10 rounded-sm bg-[#AF101A] hover:bg-[#8E0D15] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Top-Right Badge (BSAT / FIBA Certified Coach) */}
        <div className="absolute top-2.5 right-2.5 bg-[#0B1C30]/90 backdrop-blur-xs border border-white/20 px-2 py-0.5 rounded-sm flex items-center gap-1.5 text-[9px] font-mono text-white font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#AF101A]" />
          <span>{course.instructorBadge.split(" ")[0] || "BSAT"}</span>
        </div>

        {/* Bottom Banner Title Overlay */}
        <div className="absolute bottom-2 inset-x-3 text-center">
          <div className="font-bold text-white text-xs sm:text-sm drop-shadow-md truncate">
            {course.subtitle}
          </div>
          <div className="text-[10px] text-slate-300 font-mono font-medium drop-shadow flex items-center justify-center gap-1.5 mt-0.5">
            <Clock className="w-3 h-3 text-red-300" />
            <span>ความยาว {course.duration}</span>
            <span>•</span>
            <span>{course.lessonsCount} บทเรียน</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Course Details, Pricing & CTA */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Tag Pill: คอร์สสอนออนไลน์ & หมวดหมู่ */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#AF101A]/10 text-[#AF101A] border border-[#AF101A]/30 text-[11px] font-mono font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#AF101A]" />
              <span>{course.categoryDisplay}</span>
            </span>
          </div>

          {/* Main Course Title */}
          <h3 className="text-base sm:text-lg font-bold text-[#0B1C30] leading-snug group-hover:text-[#AF101A] transition-colors">
            {course.title}
          </h3>

          {/* Instructor Byline */}
          <div className="flex items-center gap-2.5 mt-2 text-xs text-[#505A69]">
            <img
              src={course.instructorAvatar}
              alt={course.instructorName}
              className="w-6 h-6 rounded-full object-cover border border-[#DFE2EB]"
            />
            <span className="font-semibold text-[#0B1C30]">{course.instructorName}</span>
            <span>•</span>
            <span className="truncate">{course.instructorTitle}</span>
          </div>
        </div>

        {/* Price & Rating Row */}
        <div className="space-y-1.5 pt-1">
          {/* Price */}
          <div className="flex items-baseline gap-2.5">
            {course.isFree ? (
              <span className="text-xl sm:text-2xl font-bold text-[#0B1C30] font-mono">
                เรียนฟรี
              </span>
            ) : (
              <>
                <span className="text-xl sm:text-2xl font-bold text-[#0B1C30] font-mono tabular-nums">
                  {course.priceThb.toLocaleString()} THB
                </span>
                {course.originalPriceThb && (
                  <span className="text-xs text-[#505A69] line-through font-mono tabular-nums">
                    {course.originalPriceThb.toLocaleString()} THB
                  </span>
                )}
                {discountPercent && (
                  <span className="px-1.5 py-0.5 rounded-sm bg-[#AF101A]/10 text-[#AF101A] border border-[#AF101A]/30 text-[10px] font-mono font-bold">
                    ลด {discountPercent}%
                  </span>
                )}
              </>
            )}
          </div>

          {/* Stars & Reviews */}
          <div className="flex items-center gap-1.5 text-xs text-[#505A69] font-mono">
            <div className="flex items-center text-[#AF101A]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(course.rating)
                      ? "fill-current text-[#AF101A]"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-[#0B1C30] tabular-nums">
              {course.rating.toFixed(1)}
            </span>
            <span>({course.reviewCount} รีวิว)</span>
            <span>•</span>
            <span className="tabular-nums">{course.enrolledCount} ผู้เรียน</span>
          </div>
        </div>

        {/* CTA Button & Share Icon */}
        <div className="flex items-center gap-2.5 pt-3 border-t border-[#DFE2EB]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectCourse(course);
            }}
            className="flex-1 py-2 px-4 rounded-sm bg-[#0B1C30] hover:bg-[#142338] text-white font-semibold text-xs uppercase tracking-wider text-center transition cursor-pointer shadow-xs"
          >
            {course.isFree ? "เข้าชมบทเรียนฟรี" : "ชำระเงินเพื่อเริ่มเรียน"}
          </button>

          {/* Share Button with Tooltip */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="แชร์ลิงก์คอร์สนี้"
            className="w-9 h-9 rounded-sm bg-[#F8F9FF] hover:bg-[#EEF1F8] text-[#505A69] hover:text-[#0B1C30] flex items-center justify-center transition border border-[#DFE2EB] shrink-0 cursor-pointer"
            title="แชร์คอร์สเรียนนี้"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[#AF101A]" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
