"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Sparkles, AlertCircle } from "lucide-react";
import { NewsArticle, NewsCategory } from "@/lib/types";

interface CreateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleCreated: (newArticle: NewsArticle) => void;
}

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: "MATCH_RECAP", label: "สรุปผลการแข่งขัน (Match Recap)" },
  { value: "PLAYER_SPOTLIGHT", label: "ดาราประจำสัปดาห์ (Player Spotlight / POTW)" },
  { value: "POWER_RANKING", label: "จัดอันดับทีม (Power Rankings)" },
  { value: "TOURNAMENT_NEWS", label: "ข่าวสารทัวร์นาเมนต์ (Tournament News)" },
  { value: "SPORTS_SCIENCE", label: "วิทยาศาสตร์การกีฬาและทักษะ (Sports Science & Skills)" },
];

export default function CreateArticleModal({
  isOpen,
  onClose,
  onArticleCreated,
}: CreateArticleModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<NewsCategory>("MATCH_RECAP");
  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80"
  );
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("กองบรรณาธิการ StatCourt News");
  const [authorRole, setAuthorRole] = useState("Official Chief Editor");
  const [isFeatured, setIsFeatured] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setError("กรุณากรอกหัวข้อข่าว, คำโปรย และเนื้อหาข่าวให้ครบถ้วน");
      return;
    }

    const selectedCat = CATEGORIES.find((c) => c.value === category);

    const newArticle: NewsArticle = {
      id: `news-${Date.now()}`,
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "news-article",
      category,
      categoryDisplay: selectedCat ? selectedCat.label.split(" (")[0] : "NEWS",
      coverImage: coverImage.trim() || "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
      excerpt: excerpt.trim(),
      content: content.trim(),
      author: author.trim() || "StatCourt Admin",
      authorRole: authorRole.trim() || "Editor",
      publishedAt: "เมื่อสักครู่",
      readTime: "3 นาที",
      isFeatured,
      featuredHeroOrder: isFeatured ? 1 : undefined,
    };

    onArticleCreated(newArticle);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-article-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white border border-[#DFE2EB] rounded-lg shadow-xl overflow-hidden my-6 text-slate-900 font-sans flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DFE2EB] bg-[#F8F9FF] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#AF101A]/10 border border-[#AF101A]/30 flex items-center justify-center text-[#AF101A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="create-article-title"
                className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#0B1C30] flex items-center gap-2 font-mono"
              >
                <span>ระบบเผยแพร่ข่าวสาร (ADMIN PUBLISHING PORTAL)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#AF101A] text-white font-bold">
                  OFFICIAL
                </span>
              </h2>
              <p className="text-xs text-[#505A69]">
                สร้างข่าวสรุปผลการแข่งขัน บทความวิทยาศาสตร์การกีฬา หรือดาราเด่นประจำสัปดาห์
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างเขียนข่าว"
            className="p-1.5 rounded-sm text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-b border-red-200 text-[#AF101A] px-6 py-2.5 text-xs font-bold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-mono">
          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="article-title" className="text-slate-800 font-bold block">
              หัวข้อข่าว (Headline) <span className="text-[#AF101A]">*</span>
            </label>
            <input
              id="article-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น 'THIS TEAM IS SCARY' | RECAP: 2026 ROCKETS MEDIA DAY"
              className="w-full px-3 py-2 bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm text-slate-900 font-bold focus:outline-none focus:border-[#0B1C30] focus:bg-white text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1">
              <label htmlFor="article-category" className="text-slate-800 font-bold block">
                หมวดหมู่ข่าว (Category)
              </label>
              <select
                id="article-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as NewsCategory)}
                className="w-full px-3 py-2 bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm text-slate-900 text-xs font-bold focus:outline-none focus:border-[#0B1C30] focus:bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div className="space-y-1">
              <label htmlFor="article-author" className="text-slate-800 font-bold block">
                ผู้เขียน / สังกัด (Author)
              </label>
              <input
                id="article-author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm text-slate-900 text-xs focus:outline-none focus:border-[#0B1C30] focus:bg-white"
              />
            </div>
          </div>

          {/* Cover Image URL */}
          <div className="space-y-1">
            <label htmlFor="article-cover" className="text-slate-800 font-bold block">
              ลิงก์ภาพหน้าปก (Cover Image URL)
            </label>
            <div className="flex gap-2">
              <input
                id="article-cover"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm text-slate-900 text-xs focus:outline-none focus:border-[#0B1C30] focus:bg-white"
              />
              <button
                type="button"
                onClick={() =>
                  setCoverImage(
                    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80"
                  )
                }
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-sm border border-[#DFE2EB] text-slate-700 text-[11px] font-bold transition cursor-pointer"
              >
                ภาพตัวอย่าง
              </button>
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-1">
            <label htmlFor="article-excerpt" className="text-slate-800 font-bold block">
              คำโปรยสั้น (Excerpt) <span className="text-[#AF101A]">*</span>
            </label>
            <textarea
              id="article-excerpt"
              rows={2}
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="สรุป 1-2 ประโยคสำหรับแสดงใต้พาดหัวและบนฟีด..."
              className="w-full px-3 py-2 bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm text-slate-900 font-sans text-xs focus:outline-none focus:border-[#0B1C30] focus:bg-white resize-none"
            />
          </div>

          {/* Content */}
          <div className="space-y-1">
            <label htmlFor="article-content" className="text-slate-800 font-bold block">
              เนื้อหาข่าวเต็ม (Full Article Content) <span className="text-[#AF101A]">*</span>
            </label>
            <textarea
              id="article-content"
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="เขียนรายละเอียดการแข่งขัน สถิติเด่น บทวิเคราะห์แท็กติก หรือคำสัมภาษณ์..."
              className="w-full px-3 py-2 bg-[#F8F9FF] border border-[#DFE2EB] rounded-sm text-slate-900 font-sans text-xs focus:outline-none focus:border-[#0B1C30] focus:bg-white"
            />
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-2 p-3 bg-[#F8F9FF] rounded-sm border border-[#DFE2EB]">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-[#AF101A] rounded-sm border-[#DFE2EB] focus:ring-[#AF101A]"
            />
            <label htmlFor="isFeatured" className="text-slate-800 font-bold cursor-pointer font-sans">
              ปักหมุดเป็นข่าวพาดหัวหลักบนหน้าแรกของหมวดข่าว (Featured Hero Story)
            </label>
          </div>

          {/* MODAL ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DFE2EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-sm bg-white border border-[#DFE2EB] hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-sm bg-[#AF101A] hover:bg-[#8F0D15] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>เผยแพร่ข่าวสาร (Publish News)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
