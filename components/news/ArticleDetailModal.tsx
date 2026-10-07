"use client";

import React, { useEffect, useState } from "react";
import { X, User, Clock, Share2, Check, Sparkles } from "lucide-react";
import { NewsArticle } from "@/lib/types";

interface ArticleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
}

// ฟังก์ชันแปลงข้อความ Markdown ให้เป็น Editorial Elements ที่สวยงาม
function renderMarkdownContent(content: string) {
  const blocks = content.trim().split(/\n\s*\n/);

  return blocks.map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Heading 1 & 2
    if (trimmed.startsWith("# ")) {
      return (
        <h3 key={index} className="text-xl sm:text-2xl font-bold text-[#0B1C30] mt-6 mb-3 pt-3 border-t border-slate-100">
          {renderInline(trimmed.replace(/^#\s+/, ""))}
        </h3>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h4 key={index} className="text-lg sm:text-xl font-bold text-[#0B1C30] mt-5 mb-2">
          {renderInline(trimmed.replace(/^##\s+/, ""))}
        </h4>
      );
    }
    if (trimmed.startsWith("### ")) {
      return (
        <h5 key={index} className="text-base sm:text-lg font-bold text-[#0B1C30] mt-4 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-[#AF101A]" />
          <span>{renderInline(trimmed.replace(/^###\s+/, ""))}</span>
        </h5>
      );
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      return (
        <blockquote key={index} className="border-l-4 border-[#AF101A] pl-4 py-2 text-slate-700 bg-red-50/30 rounded-r-xl my-3">
          {renderInline(trimmed.replace(/^>\s+/, ""))}
        </blockquote>
      );
    }

    // Bulleted Lists
    if (trimmed.includes("\n- ") || trimmed.startsWith("- ")) {
      const items = trimmed.split("\n").filter((l) => l.trim().startsWith("- "));
      return (
        <ul key={index} className="space-y-2 my-3 pl-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#AF101A] mt-2.5 shrink-0" />
              <span>{renderInline(item.replace(/^-\s+/, ""))}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Standard Paragraph
    return (
      <p key={index} className="text-sm sm:text-base text-slate-700 leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  });
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-[#0B1C30]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="font-medium text-[#AF101A] not-italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export default function ArticleDetailModal({
  isOpen,
  onClose,
  article,
}: ArticleDetailModalProps) {
  const [copied, setCopied] = useState(false);

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

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/news#${article.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B1C30]/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 font-thai"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-6 text-slate-900 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8F9FF] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#AF101A] text-white text-[11px] font-semibold">
              {article.categoryDisplay}
            </span>
            <span className="text-[#505A69] text-xs font-medium">• ใช้เวลาอ่าน {article.readTime}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างข่าว"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Headline */}
          <div className="space-y-3">
            <h2
              id="article-detail-title"
              className="text-2xl sm:text-3xl font-extrabold text-[#0B1C30] leading-tight"
            >
              {article.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#505A69] pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <User className="w-3.5 h-3.5 text-[#AF101A]" />
                <span>{article.author}</span>
                <span className="text-slate-500 font-normal">({article.authorRole})</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{article.publishedAt}</span>
              </span>
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Excerpt Lead Paragraph (Pull-quote) */}
          <div className="relative p-4 rounded-xl bg-[#F8F9FF] border-l-4 border-[#AF101A] border-y border-r border-slate-200/70">
            <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Formatted Article Body */}
          <div className="space-y-4 pt-1">
            {renderMarkdownContent(article.content)}
          </div>

          {/* POTW Card embed if available */}
          {article.potwData && (
            <div className="bg-[#F8F9FF] border border-slate-200 rounded-2xl p-5 mt-6 shadow-xs">
              <span className="text-[11px] text-[#AF101A] uppercase font-bold tracking-wider flex items-center gap-1.5 mb-3 font-mono">
                <Sparkles className="w-4 h-4 text-[#AF101A]" />
                <span>STATCOURT PLAYER OF THE WEEK RECOGNITION</span>
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={article.potwData.avatarUrl}
                  alt={article.potwData.athleteName}
                  className="w-20 h-24 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <div className="text-base font-bold text-[#0B1C30]">
                    {article.potwData.athleteName}
                  </div>
                  <div className="text-xs text-[#505A69]">
                    {article.potwData.athleteSchool} • รุ่น {article.potwData.ageCategory}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 text-xs font-bold text-slate-800">
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs tabular-nums font-mono">
                      {article.potwData.effPerGame.toFixed(1)} EFF/G
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs tabular-nums font-mono">
                      {article.potwData.ppg.toFixed(1)} PPG
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs tabular-nums font-mono">
                      {article.potwData.rpg.toFixed(1)} RPG
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs tabular-nums font-mono">
                      {article.potwData.apg.toFixed(1)} APG
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 bg-[#F8F9FF] shrink-0 flex items-center justify-between">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">คัดลอกลิงก์แล้ว!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-500" />
                <span>แชร์บทความ</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0B1C30] hover:bg-[#142338] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
