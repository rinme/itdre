"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { newsItems } from "@/data/news";
import type { NewsItem } from "@/types";
import NewsCard from "@/components/news/NewsCard";
import NewsFilter, { NewsSortOption } from "@/components/news/NewsFilter";
import { useLanguage } from "@/context/LanguageContext";
import { 
  parseThaiDateToTimestamp, 
  CATEGORY_LIST,
  getCategoryById,
  getCategoryByName 
} from "@/lib/news-utils";
import { 
  Newspaper, 
  Home, 
  ChevronRight, 
  SearchX, 
  Sparkles, 
  Layers, 
  Clock,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp
} from "lucide-react";

const ITEMS_PER_PAGE = 12;

export default function NewsArchiveContent() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listTopRef = useRef<HTMLDivElement>(null);

  // Read initial parameters from URL
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("q") || searchParams.get("search") || "";
  const initialSort = (searchParams.get("sort") as NewsSortOption) || "newest";
  const initialPage = parseInt(searchParams.get("page") || "1", 10) || 1;

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<NewsSortOption>(initialSort);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  // Sync state when URL params change from external navigation
  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    const s = searchParams.get("q") || searchParams.get("search") || "";
    const sort = (searchParams.get("sort") as NewsSortOption) || "newest";
    const p = parseInt(searchParams.get("page") || "1", 10) || 1;

    setSelectedCategory(cat);
    setSearchQuery(s);
    setSortBy(sort);
    setCurrentPage(p);
  }, [searchParams]);

  // Update URL search parameters
  const updateUrlParams = useCallback(
    (cat: string, search: string, sort: NewsSortOption, page: number) => {
      const params = new URLSearchParams();
      if (cat && cat !== "all") params.set("category", cat);
      if (search && search.trim() !== "") params.set("search", search.trim());
      if (sort && sort !== "newest") params.set("sort", sort);
      if (page && page > 1) params.set("page", page.toString());

      const queryStr = params.toString();
      const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
      window.history.replaceState(null, "", newUrl);
    },
    [pathname]
  );

  // Handler for category change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
    updateUrlParams(catId, searchQuery, sortBy, 1);
  };

  // Handler for search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateUrlParams(selectedCategory, query, sortBy, 1);
  };

  // Handler for sort change
  const handleSortChange = (sort: NewsSortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
    updateUrlParams(selectedCategory, searchQuery, sort, 1);
  };

  // Handler for page change with smooth scroll
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams(selectedCategory, searchQuery, sortBy, page);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: newsItems.length };
    newsItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...newsItems];

    // Filter by Category
    if (selectedCategory && selectedCategory !== "all") {
      const catObj = getCategoryById(selectedCategory) || getCategoryByName(selectedCategory);
      if (catObj) {
        result = result.filter(
          (item) => item.category === catObj.nameTh || item.category === catObj.id
        );
      } else {
        result = result.filter((item) => item.category === selectedCategory);
      }
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(q);
        const summaryMatch = item.summary ? item.summary.toLowerCase().includes(q) : false;
        const categoryMatch = item.category.toLowerCase().includes(q);
        const idMatch = item.id.includes(q);
        return titleMatch || summaryMatch || categoryMatch || idMatch;
      });
    }

    // Sort
    if (sortBy === "popular") {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => {
        const timeA = parseThaiDateToTimestamp(a.date);
        const timeB = parseThaiDateToTimestamp(b.date);
        if (timeA && timeB) return timeA - timeB;
        return parseInt(a.id, 10) - parseInt(b.id, 10);
      });
    } else {
      // newest
      result.sort((a, b) => {
        const timeA = parseThaiDateToTimestamp(a.date);
        const timeB = parseThaiDateToTimestamp(b.date);
        if (timeA && timeB) return timeB - timeA;
        return parseInt(b.id, 10) - parseInt(a.id, 10);
      });
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  // Pagination calculation
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, validCurrentPage]);

  // Generate page numbers array with ellipsis
  const getPageNumbers = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= validCurrentPage - delta && i <= validCurrentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (typeof i === "number") {
        if (l !== undefined) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push("...");
          }
        }
        rangeWithDots.push(i);
        l = i;
      }
    });

    return rangeWithDots;
  };

  const startItemNumber = totalItems === 0 ? 0 : (validCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItemNumber = Math.min(validCurrentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div className="w-full flex flex-col">
      {/* Hero Header Banner */}
      <section className="relative w-full bg-linear-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
        {/* Background glow & subtle ambient shapes */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-brand-orange transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t("หน้าหลัก", "Home")}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-brand-orange font-medium">
              {t("ข่าวสารและกิจกรรม", "News & Announcements")}
            </span>
          </nav>

          {/* Title and Subtitle */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold tracking-wide">
              <Newspaper className="w-3.5 h-3.5" />
              <span>ITD KMUTNB ARCHIVE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              {t("ข่าวสารและกิจกรรม", "News & Announcements")}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              {t(
                "ศูนย์รวมข้อมูลข่าวสาร ประชาสัมพันธ์ กิจกรรมวิชาการ ทุนการศึกษา และประกาศสำคัญ คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
                "Explore the latest news updates, academic symposiums, scholarship announcements, and official directives from ITD KMUTNB."
              )}
            </p>
          </div>

          {/* Stat Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              <span>
                <strong className="text-white font-semibold">{newsItems.length}</strong>{" "}
                {t("บทความข่าวสาร", "Articles")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>
                <strong className="text-white font-semibold">9</strong>{" "}
                {t("หมวดหมู่ข่าว", "Categories")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{t("อัปเดตล่าสุด 2569", "Updated 2026")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div ref={listTopRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
        {/* Filter Bar Component */}
        <NewsFilter
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          totalResults={totalItems}
          categoryCounts={categoryCounts}
        />

        {/* Results Counter & Pagination Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-600">
          <div>
            {totalItems > 0 ? (
              <span>
                {t(
                  `แสดงรายการที่ ${startItemNumber} - ${endItemNumber} จากทั้งหมด ${totalItems} รายการ`,
                  `Showing ${startItemNumber} - ${endItemNumber} of ${totalItems} items`
                )}
              </span>
            ) : (
              <span>{t("ไม่พบรายการข่าว", "No items found")}</span>
            )}
          </div>
          {totalPages > 1 && (
            <div className="text-gray-500">
              {t(
                `หน้า ${validCurrentPage} จากทั้งหมด ${totalPages} หน้า`,
                `Page ${validCurrentPage} of ${totalPages}`
              )}
            </div>
          )}
        </div>

        {/* News Grid */}
        {paginatedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {paginatedItems.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-brand-orange">
              <SearchX className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-900">
                {t("ไม่พบข่าวสารที่ตรงกับเงื่อนไข", "No matching news articles found")}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {t(
                  "ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อค้นหาข่าวสารที่ต้องการ",
                  "Try changing your search terms or selecting a different category to discover news."
                )}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSortBy("newest");
                  setCurrentPage(1);
                  updateUrlParams("all", "", "newest", 1);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
              >
                <span>{t("ล้างตัวกรองและดูข่าวทั้งหมด", "Reset Filters & View All")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Pagination Navigation */}
        {totalPages > 1 && (
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200">
            {/* Previous Page Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={validCurrentPage === 1}
                aria-label={t("หน้าแรก", "First page")}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-brand-orange hover:border-brand-orange disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(validCurrentPage - 1)}
                disabled={validCurrentPage === 1}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-brand-orange hover:border-brand-orange disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t("ก่อนหน้า", "Previous")}</span>
              </button>
            </div>

            {/* Numeric Page Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
              {getPageNumbers().map((num, idx) => {
                if (num === "...") {
                  return (
                    <span
                      key={`dots-${idx}`}
                      className="px-2 py-1 text-xs text-gray-400 font-bold select-none"
                    >
                      …
                    </span>
                  );
                }
                const pageNum = num as number;
                const isActive = pageNum === validCurrentPage;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[36px] h-9 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
                      isActive
                        ? "bg-brand-orange text-white shadow-md shadow-orange-500/25 scale-105"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80 shadow-xs"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(validCurrentPage + 1)}
                disabled={validCurrentPage === totalPages}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-brand-orange hover:border-brand-orange disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
              >
                <span>{t("ถัดไป", "Next")}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                disabled={validCurrentPage === totalPages}
                aria-label={t("หน้าสุดท้าย", "Last page")}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-brand-orange hover:border-brand-orange disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
