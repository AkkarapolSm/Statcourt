"use client";

import React from "react";
import { X, Calendar, User, Clock, Share2, Sparkles, ChevronLeft } from "lucide-react";
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
  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 text-white font-mono flex flex-col max-h-[92vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#1E293B]/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] font-bold uppercase tracking-widest">
              {article.categoryDisplay}
            </span>
            <span className="text-slate-400 text-xs">• {article.readTime}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Headline */}
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight leading-snug">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800 font-sans">
              <span className="flex items-center gap-1.5 font-bold text-slate-200">
                <User className="w-3.5 h-3.5 text-red-400" />
                <span>{article.author}</span>
                <span className="text-slate-500 font-normal">({article.authorRole})</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{article.publishedAt}</span>
              </span>
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-700 shadow-xl bg-black">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Excerpt Lead Paragraph */}
          <p className="text-sm font-sans text-slate-200 font-semibold leading-relaxed border-l-4 border-red-600 pl-4 py-1 italic bg-slate-900/60 rounded-r">
            {article.excerpt}
          </p>

          {/* Article Body */}
          <div className="text-xs sm:text-sm font-sans text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
            {article.content}
          </div>

          {/* POTW Card embed if available */}
          {article.potwData && (
            <div className="bg-gradient-to-r from-red-950/60 to-slate-900 border border-red-800/80 rounded-xl p-5 text-white">
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>STATCOURT PLAYER OF THE WEEK EMBED</span>
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={article.potwData.avatarUrl}
                  alt={article.potwData.athleteName}
                  className="w-20 h-24 rounded-lg object-cover border border-amber-400/60 shrink-0"
                />
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-base font-bold text-white">
                    {article.potwData.athleteName}
                  </div>
                  <div className="text-xs text-slate-300">
                    {article.potwData.athleteSchool} • {article.potwData.ageCategory}
                  </div>
                  <div className="inline-flex gap-3 pt-1 text-xs font-mono font-bold text-amber-300">
                    <span>{article.potwData.effPerGame.toFixed(1)} EFF/G</span>
                    <span>{article.potwData.ppg.toFixed(1)} PPG</span>
                    <span>{article.potwData.rpg.toFixed(1)} RPG</span>
                    <span>{article.potwData.apg.toFixed(1)} APG</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#0F172A] shrink-0 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-sans">
            StatCourt Thailand Sports News Feed
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
