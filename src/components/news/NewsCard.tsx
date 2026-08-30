"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { NewsItem } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, Eye, FileText, ArrowRight } from "lucide-react";

interface NewsCardProps {
  item: NewsItem;
  featured?: boolean;
  className?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "ข่าวทั่วไป": { bg: "bg-orange-50", text: "text-brand-orange", border: "border-orange-200" },
  "ข่าวคณะและมหาวิทยาลัย": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "ข่าวทุน/วิจัย": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "ข่าวกิจกรรม/ศิลปวัฒนธรรม": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "ข่าวประกันคุณภาพการศึกษา": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  "ข่าวการประชุมทางวิชาการ": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  "ข่าวประกาศ/คำสั่งมหาวิทยาลัย": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  "ข่าวรับสมัครงาน": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "ข่าวประกาศจัดซื้อจัดจ้าง": { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
};

export default function NewsCard({ item, featured = false, className = "" }: NewsCardProps) {
  const { t } = useLanguage();
  const [imgSrc, setImgSrc] = useState(item.thumbnail || "/assets/news/placeholder-news.svg");

  const badgeStyle = CATEGORY_COLORS[item.category] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  };

  return (
    <article
      className={`group bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-brand-orange/40 transition-all duration-300 flex flex-col overflow-hidden ${
        featured ? "md:flex-row md:col-span-2" : ""
      } ${className}`}
    >
      {/* Thumbnail Container */}
      <Link
        href={`/news/${item.id}`}
        className={`relative block overflow-hidden bg-gray-100 shrink-0 ${
          featured
            ? "w-full md:w-1/2 h-56 sm:h-64 md:h-full min-h-[220px]"
            : "w-full aspect-[16/10]"
        }`}
        aria-label={item.title}
      >
        <Image
          src={imgSrc}
          alt={item.title}
          fill
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 50vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          }
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={() => setImgSrc("/assets/news/placeholder-news.svg")}
        />

        {/* Category Pill Tag floating on top left */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border shadow-xs backdrop-blur-md ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            {item.category}
          </span>
        </div>

        {/* PDF indicator badge if item has attachment */}
        {item.pdfUrl && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] font-medium shadow-xs backdrop-blur-xs">
              <FileText className="w-3 h-3" />
              <span>PDF</span>
            </span>
          </div>
        )}
      </Link>

      {/* Content Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Metadata Row: Date & Views */}
          <div className="flex items-center justify-between text-xs text-gray-500 gap-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <time dateTime={item.date}>{item.date}</time>
            </div>

            {typeof item.views === "number" && (
              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                <Eye className="w-3.5 h-3.5" />
                <span>{item.views.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <Link href={`/news/${item.id}`} className="block group/title">
            <h3
              className={`font-bold text-gray-900 group-hover/title:text-brand-orange transition-colors leading-snug line-clamp-2 ${
                featured ? "text-base sm:text-lg" : "text-sm sm:text-base"
              }`}
            >
              {item.title}
            </h3>
          </Link>

          {/* Summary */}
          {item.summary && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {item.summary}
            </p>
          )}
        </div>

        {/* Read More Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <Link
            href={`/news/${item.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:text-brand-darkOrange group-hover:translate-x-0.5 transition-all"
          >
            <span>{t("อ่านรายละเอียด", "Read More")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <span className="text-[11px] text-gray-400 font-mono">
            #{item.id}
          </span>
        </div>
      </div>
    </article>
  );
}
