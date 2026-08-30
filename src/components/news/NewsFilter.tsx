"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORY_LIST } from "@/lib/news-utils";
import { 
  Search, 
  X, 
  ArrowDownWideNarrow, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from "lucide-react";

export type NewsSortOption = "newest" | "popular" | "oldest";

interface NewsFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string; // "all" or category id / nameTh
  onCategoryChange: (categoryId: string) => void;
  sortBy: NewsSortOption;
  onSortChange: (sort: NewsSortOption) => void;
  totalResults: number;
  categoryCounts: Record<string, number>;
}

export default function NewsFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  totalResults,
  categoryCounts,
}: NewsFilterProps) {
  const { t, language } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollPills = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const isFiltered = searchQuery.trim().length > 0 || (selectedCategory !== "all" && selectedCategory !== "");

  const handleResetFilters = () => {
    onSearchChange("");
    onCategoryChange("all");
    onSortChange("newest");
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-6 space-y-5">
      {/* Top Row: Search Input & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t(
              "ค้นหาหัวข้อข่าวสาร, ประกาศ, หรือคำสำคัญ...",
              "Search news titles, announcements, or keywords..."
            )}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-brand-orange rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 transition-all duration-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label={t("ล้างคำค้นหา", "Clear search")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <ArrowDownWideNarrow className="w-4 h-4 text-brand-orange" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as NewsSortOption)}
              aria-label={t("เรียงลำดับข่าว", "Sort news by")}
              className="w-full sm:w-48 pl-9 pr-8 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-brand-orange rounded-xl text-sm font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 transition-all duration-200 cursor-pointer appearance-none"
            >
              <option value="newest">{t("ล่าสุด (Newest First)", "Newest First")}</option>
              <option value="popular">{t("ยอดนิยม (Most Popular)", "Most Popular")}</option>
              <option value="oldest">{t("เก่าที่สุด (Oldest First)", "Oldest First")}</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="relative">
        {/* Left Scroll Arrow for Desktop */}
        <button
          type="button"
          onClick={() => scrollPills("left")}
          aria-label="Scroll left"
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-600 hover:text-brand-orange hover:border-brand-orange transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar scroll-smooth no-scrollbar"
        >
          {CATEGORY_LIST.map((cat) => {
            const isSelected = selectedCategory === cat.id || (cat.id !== "all" && selectedCategory === cat.nameTh);
            const count = cat.id === "all" ? categoryCounts["all"] || 0 : categoryCounts[cat.nameTh] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 select-none ${
                  isSelected
                    ? "bg-brand-orange text-white shadow-md shadow-orange-500/20 scale-[1.02] border border-transparent font-semibold"
                    : "bg-gray-100/90 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200/70"
                }`}
              >
                <span>{t(cat.nameTh, cat.nameEn)}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow for Desktop */}
        <button
          type="button"
          onClick={() => scrollPills("right")}
          aria-label="Scroll right"
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-600 hover:text-brand-orange hover:border-brand-orange transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Results Bar / Active Filters Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span>
            {t("พบข่าวสารทั้งหมด:", "Total news found:")}{" "}
            <strong className="text-gray-900 font-semibold">{totalResults}</strong>{" "}
            {t("รายการ", "items")}
          </span>
          {searchQuery && (
            <span className="hidden sm:inline text-gray-400">
              | {t("คำค้น:", "Query:")} &ldquo;<span className="text-brand-orange font-medium">{searchQuery}</span>&rdquo;
            </span>
          )}
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-xs text-brand-orange hover:text-brand-darkOrange font-medium hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t("ล้างตัวกรองทั้งหมด", "Reset all filters")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
