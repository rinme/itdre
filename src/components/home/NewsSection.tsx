"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { newsItems } from "@/data/news";
import NewsCard from "@/components/news/NewsCard";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Newspaper, 
  ArrowRight, 
  Sparkles,
  Layers,
  SearchX
} from "lucide-react";

interface CategoryTab {
  id: string;
  nameTh: string;
  nameEn: string;
  categoryMatch?: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: "all", nameTh: "ทั้งหมด", nameEn: "All News" },
  { id: "general", nameTh: "ข่าวทั่วไป", nameEn: "General", categoryMatch: "ข่าวทั่วไป" },
  { id: "faculty", nameTh: "ข่าวคณะและมหาวิทยาลัย", nameEn: "Faculty & KMUTNB", categoryMatch: "ข่าวคณะและมหาวิทยาลัย" },
  { id: "scholarship", nameTh: "ข่าวทุน/วิจัย", nameEn: "Scholarships", categoryMatch: "ข่าวทุน/วิจัย" },
  { id: "event", nameTh: "ข่าวกิจกรรม", nameEn: "Events", categoryMatch: "ข่าวกิจกรรม/ศิลปวัฒนธรรม" },
  { id: "quality", nameTh: "ประกันคุณภาพ", nameEn: "Quality Assurance", categoryMatch: "ข่าวประกันคุณภาพการศึกษา" },
  { id: "conference", nameTh: "ประชุมวิชาการ", nameEn: "Conferences", categoryMatch: "ข่าวการประชุมทางวิชาการ" },
  { id: "university", nameTh: "ประกาศมหาวิทยาลัย", nameEn: "Announcements", categoryMatch: "ข่าวประกาศ/คำสั่งมหาวิทยาลัย" },
  { id: "recruit", nameTh: "รับสมัครงาน", nameEn: "Recruitment", categoryMatch: "ข่าวรับสมัครงาน" },
  { id: "pcma", nameTh: "จัดซื้อจัดจ้าง", nameEn: "Procurement", categoryMatch: "ข่าวประกาศจัดซื้อจัดจ้าง" },
];

export default function NewsSection() {
  const { t } = useLanguage();
  const [activeTabId, setActiveTabId] = useState("all");

  // Calculate count for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: newsItems.length };
    newsItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter items
  const filteredNews = useMemo(() => {
    const activeTab = CATEGORY_TABS.find((tab) => tab.id === activeTabId);
    if (!activeTab || activeTab.id === "all") {
      return newsItems.slice(0, 8);
    }
    return newsItems
      .filter((item) => item.category === activeTab.categoryMatch)
      .slice(0, 8);
  }, [activeTabId]);

  return (
    <section className="w-full py-14 sm:py-20 bg-white border-b border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-lightOrange border border-orange-200/80 text-brand-darkOrange text-xs font-bold tracking-wide">
              <Newspaper className="w-3.5 h-3.5 text-brand-orange" />
              <span>{t("ข่าวสารและประชาสัมพันธ์", "NEWS & UPDATES")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t("ข่าวสารและกิจกรรมล่าสุด", "Latest News & Announcements")}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              {t(
                "ติดตามข้อมูลข่าวสาร ความเคลื่อนไหว กิจกรรมวิชาการ และประกาศสำคัญของคณะ ITD KMUTNB",
                "Stay informed with the latest updates, academic activities, events, and official faculty notices."
              )}
            </p>
          </div>

          {/* Top CTA Link on Desktop */}
          <div className="hidden md:block shrink-0">
            <Link
              href={activeTabId === "all" ? "/news" : `/news?category=${activeTabId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-darkOrange hover:opacity-95 text-white font-semibold text-sm shadow-md shadow-orange-500/20 hover:shadow-lg transition-all active:scale-95 group"
            >
              <span>{t("ดูข่าวทั้งหมด", "View All News")}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar scroll-smooth">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTabId === tab.id;
              const count = tab.id === "all" 
                ? categoryCounts["all"] 
                : (categoryCounts[tab.categoryMatch || ""] || 0);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-brand-orange text-white shadow-md shadow-orange-500/25 scale-[1.02]"
                      : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200/60"
                  }`}
                >
                  <span>{t(tab.nameTh, tab.nameEn)}</span>
                  {count > 0 && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-mono tabular-nums ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {filteredNews.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                featured={false}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-3">
            <SearchX className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {t("ไม่พบข่าวสารในหมวดหมู่นี้", "No news items in this category")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              {t(
                "ขณะนี้ยังไม่มีข้อมูลข่าวสารในหมวดหมู่ที่เลือก สามารถเลือกหมวดหมู่อื่นเพื่อดูข่าวสารเพิ่มเติม",
                "There are currently no articles in this category. Select another category or browse all news."
              )}
            </p>
            <button
              type="button"
              onClick={() => setActiveTabId("all")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs active:scale-95"
            >
              <span>{t("ดูข่าวทั้งหมด", "Show All News")}</span>
            </button>
          </div>
        )}

        {/* Bottom CTA on Mobile */}
        <div className="block md:hidden text-center pt-2">
          <Link
            href={activeTabId === "all" ? "/news" : `/news?category=${activeTabId}`}
            className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-darkOrange text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all gap-2 active:scale-98"
          >
            <span>{t("ดูข่าวทั้งหมด", "View All News")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
