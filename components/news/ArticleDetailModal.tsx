"use client";

import React, { useEffect } from "react";
import { X, User, Clock, Sparkles } from "lucide-react";
import { NewsArticle } from "@/lib/types";

interface ArticleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
}

export default function ArticleDetailModal({
  isOpen,
  onClose,
  article,
}: ArticleDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !article) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white border border-[#DFE2EB] rounded-lg shadow-xl overflow-hidden my-6 text-slate-900 font-sans flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DFE2EB] bg-[#F8F9FF] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-sm bg-[#AF101A] text-white font-mono text-[10px] font-bold uppercase tracking-wider">
              {article.categoryDisplay}
            </span>
            <span className="text-[#505A69] text-xs font-mono">• {article.readTime}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างข่าว"
            className="p-1.5 rounded-sm text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Headline */}
          <div>
            <h2
              id="article-detail-title"
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0B1C30] uppercase tracking-wide leading-tight font-headline-lg"
            >
              {article.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#505A69] mt-3 pt-3 border-t border-[#DFE2EB]">
              <span className="flex items-center gap-1.5 font-bold text-slate-800">
                <User className="w-3.5 h-3.5 text-[#AF101A]" />
                <span>{article.author}</span>
                <span className="text-[#505A69] font-normal">({article.authorRole})</span>
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{article.publishedAt}</span>
              </span>
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[#DFE2EB] bg-slate-900">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Excerpt Lead Paragraph */}
          <p className="text-sm font-medium text-slate-800 leading-relaxed border-l-4 border-[#AF101A] pl-4 py-2 italic bg-[#F8F9FF] rounded-r-sm">
            {article.excerpt}
          </p>

          {/* Article Body */}
          <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-4 whitespace-pre-line">
            {article.content}
          </div>

          {/* POTW Card embed if available */}
          {article.potwData && (
            <div className="bg-[#F8F9FF] border border-[#DFE2EB] rounded-lg p-5">
              <span className="text-[10px] text-[#AF101A] font-mono uppercase font-bold tracking-widest flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#AF101A]" />
                <span>STATCOURT PLAYER OF THE WEEK RECOGNITION</span>
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={article.potwData.avatarUrl}
                  alt={article.potwData.athleteName}
                  className="w-20 h-24 rounded-sm object-cover border border-[#DFE2EB] shrink-0"
                />
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <div className="text-base font-bold text-[#0B1C30]">
                    {article.potwData.athleteName}
                  </div>
                  <div className="text-xs text-[#505A69]">
                    {article.potwData.athleteSchool} • รุ่น {article.potwData.ageCategory}
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2 text-xs font-mono font-bold text-slate-800">
                    <span className="bg-white px-2 py-0.5 rounded-sm border border-[#DFE2EB]">
                      {article.potwData.effPerGame.toFixed(1)} EFF/G
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-sm border border-[#DFE2EB]">
                      {article.potwData.ppg.toFixed(1)} PPG
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-sm border border-[#DFE2EB]">
                      {article.potwData.rpg.toFixed(1)} RPG
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-sm border border-[#DFE2EB]">
                      {article.potwData.apg.toFixed(1)} APG
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 border-t border-[#DFE2EB] bg-[#F8F9FF] shrink-0 flex items-center justify-between">
          <span className="text-xs text-[#505A69] font-mono">
            StatCourt Thailand • Basketball Journalism
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-sm bg-white border border-[#DFE2EB] hover:bg-slate-100 text-slate-800 text-xs font-mono font-bold transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
