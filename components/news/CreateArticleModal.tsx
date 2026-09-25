"use client";

import React, { useState } from "react";
import { X, Send, Image as ImageIcon, Sparkles, AlertCircle } from "lucide-react";
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
  const [author, setAuthor] = useState("กองบรรณาธิการ StatCourt News (Admin)");
  const [authorRole, setAuthorRole] = useState("Official Chief Editor");
  const [isFeatured, setIsFeatured] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 text-white font-mono flex flex-col max-h-[92vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#1E293B]/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>ระบบเผยแพร่ข่าวสาร (ADMIN PUBLISHING PORTAL)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-bold">
                  ADMIN ONLY
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                สร้างข่าวสรุปผลการแข่งขัน บทความวิทยาศาสตร์การกีฬา หรือดาราเด่นประจำสัปดาห์
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
          {/* Title */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">
              หัวข้อข่าว (Headline) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น 'THIS TEAM IS SCARY' | RECAP: 2026 ROCKETS MEDIA DAY"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">
                หมวดหมู่ข่าว (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NewsCategory)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-red-500"
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
              <label className="text-slate-300 font-bold block">ผู้เขียน / สังกัด (Author)</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Cover Image URL */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">
              ลิงก์ภาพหน้าปก (Cover Image URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={() =>
                  setCoverImage(
                    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80"
                  )
                }
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 text-[11px]"
              >
                ภาพตัวอย่าง
              </button>
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">
              คำโปรยสั้น (Excerpt) <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="สรุป 1-2 ประโยคสำหรับแสดงใต้พาดหัวและบนฟีด..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-sans text-xs focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          {/* Content */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">
              เนื้อหาข่าวเต็ม (Full Article Content) <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="เขียนรายละเอียดการแข่งขัน สถิติเด่น บทวิเคราะห์แท็กติก หรือคำสัมภาษณ์..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-sans text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded bg-slate-800 border-slate-700 focus:ring-red-500"
            />
            <label htmlFor="isFeatured" className="text-slate-300 font-bold cursor-pointer">
              ปักหมุดเป็นข่าวพาดหัวหลักบนหน้าแรกของหมวดข่าว (Featured Hero Story)
            </label>
          </div>

          {/* MODAL ACTIONS */}
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
              className="px-5 py-2.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950/50 transition cursor-pointer"
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
