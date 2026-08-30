"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { facilities } from "@/data/facilities";
import type { FacilityItem } from "@/types";
import FacilityCard from "@/components/facilities/FacilityCard";
import FacilityModal from "@/components/facilities/FacilityModal";
import { useLanguage } from "@/context/LanguageContext";
import {
  FACILITY_CATEGORIES,
  FACILITY_FLOORS,
  filterFacilities,
  getRoomFloor,
} from "@/lib/facility-utils";
import {
  Building2,
  Monitor,
  Presentation,
  Home,
  ChevronRight,
  Search,
  X,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  CalendarDays,
  Info,
} from "lucide-react";

interface FacilitiesExplorerProps {
  initialCategoryFilter?: "all" | "classroom" | "computer-room";
  pageTitleTh?: string;
  pageTitleEn?: string;
  pageSubtitleTh?: string;
  pageSubtitleEn?: string;
}

export default function FacilitiesExplorer({
  initialCategoryFilter = "all",
  pageTitleTh,
  pageTitleEn,
  pageSubtitleTh,
  pageSubtitleEn,
}: FacilitiesExplorerProps) {
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL params
  const urlCategory = searchParams.get("category");
  const urlFloor = searchParams.get("floor") || "all";
  const urlQuery = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(
    urlCategory || initialCategoryFilter
  );
  const [selectedFloor, setSelectedFloor] = useState<string>(urlFloor);
  const [searchQuery, setSearchQuery] = useState<string>(urlQuery);
  const [activeModalFacility, setActiveModalFacility] = useState<FacilityItem | null>(null);

  // Sync state if search params change
  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlFloor) setSelectedFloor(urlFloor);
    if (urlQuery) setSearchQuery(urlQuery);
  }, [urlCategory, urlFloor, urlQuery]);

  // Update URL params
  const updateUrlParams = useCallback(
    (cat: string, fl: string, q: string) => {
      const params = new URLSearchParams();
      if (cat && cat !== "all") params.set("category", cat);
      if (fl && fl !== "all") params.set("floor", fl);
      if (q && q.trim() !== "") params.set("q", q.trim());

      const queryStr = params.toString();
      const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
      window.history.replaceState(null, "", newUrl);
    },
    [pathname]
  );

  // Filter facilities
  const filteredList = useMemo(() => {
    return filterFacilities(facilities, {
      category: selectedCategory,
      floor: selectedFloor,
      searchQuery: searchQuery,
    });
  }, [selectedCategory, selectedFloor, searchQuery]);

  // Count stats
  const stats = useMemo(() => {
    return {
      total: facilities.length,
      classrooms: facilities.filter((f) => f.category === "classroom").length,
      computerRooms: facilities.filter((f) => f.category === "computer-room").length,
    };
  }, []);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    updateUrlParams(catId, selectedFloor, searchQuery);
  };

  const handleFloorChange = (floorId: string) => {
    setSelectedFloor(floorId);
    updateUrlParams(selectedCategory, floorId, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateUrlParams(selectedCategory, selectedFloor, query);
  };

  const handleResetFilters = () => {
    setSelectedCategory(initialCategoryFilter);
    setSelectedFloor("all");
    setSearchQuery("");
    updateUrlParams(initialCategoryFilter, "all", "");
  };

  const titleText =
    (language === "en" ? pageTitleEn : pageTitleTh) ||
    t("ห้องเรียนและห้องปฏิบัติการ", "Facilities & Laboratories");

  const subtitleText =
    (language === "en" ? pageSubtitleEn : pageSubtitleTh) ||
    t(
      "ศูนย์กลางการเรียนรู้และวิจัยดิจิทัล อาคารนวมินทรราชินี (อาคาร 79) คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
      "World-class smart classrooms, high-performance computer laboratories, and specialized certification testing facilities at Navamindra Rajini Building (Bldg 79), ITD KMUTNB."
    );

  return (
    <div className="w-full flex flex-col">
      {/* Hero Header Banner */}
      <section className="relative w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
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
            <Link
              href="/about"
              className="hover:text-brand-orange transition-colors"
            >
              {t("แนะนำคณะ", "About ITD")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-brand-orange font-medium">
              {titleText}
            </span>
          </nav>

          {/* Title & Description */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold tracking-wide">
              <Building2 className="w-3.5 h-3.5" />
              <span>ITD KMUTNB SMART CAMPUS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              {titleText}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              {subtitleText}
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              <span>
                <strong className="text-white font-semibold">{stats.total}</strong>{" "}
                {t("ห้องปฏิบัติการและห้องบรรยายทั้งหมด", "Total Facilities")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Presentation className="w-4 h-4 text-sky-400" />
              <span>
                <strong className="text-white font-semibold">{stats.classrooms}</strong>{" "}
                {t("ห้องบรรยาย Smart Classrooms", "Smart Classrooms")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Monitor className="w-4 h-4 text-orange-400" />
              <span>
                <strong className="text-white font-semibold">{stats.computerRooms}</strong>{" "}
                {t("ห้องปฏิบัติการคอมพิวเตอร์ & NOC", "Computer & NOC Labs")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Explorer Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
        {/* Subpage Switcher Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/facilities"
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              pathname === "/facilities"
                ? "bg-orange-50/70 border-brand-orange shadow-sm text-brand-orange"
                : "bg-white border-gray-200/80 hover:border-brand-orange/40 text-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  pathname === "/facilities"
                    ? "bg-brand-orange text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  {t("ห้องปฏิบัติการทั้งหมด", "All Facilities")}
                </h3>
                <p className="text-xs text-gray-500">
                  {stats.total} {t("ห้อง", "Rooms")}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>

          <Link
            href="/facilities/classrooms"
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              pathname === "/facilities/classrooms"
                ? "bg-blue-50/70 border-blue-500 shadow-sm text-blue-700"
                : "bg-white border-gray-200/80 hover:border-blue-300 text-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  pathname === "/facilities/classrooms"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  {t("ห้องเรียนและห้องบรรยาย", "Smart Classrooms")}
                </h3>
                <p className="text-xs text-gray-500">
                  {stats.classrooms} {t("ห้อง (ชั้น 3, 4, 5)", "Rooms (Fl 3, 4, 5)")}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>

          <Link
            href="/facilities/computer-rooms"
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              pathname === "/facilities/computer-rooms"
                ? "bg-orange-50/70 border-orange-500 shadow-sm text-brand-orange"
                : "bg-white border-gray-200/80 hover:border-orange-300 text-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  pathname === "/facilities/computer-rooms"
                    ? "bg-orange-600 text-white"
                    : "bg-orange-50 text-orange-600"
                }`}
              >
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  {t("ห้องคอมพิวเตอร์ & ศูนย์สอบ", "Computer & Test Labs")}
                </h3>
                <p className="text-xs text-gray-500">
                  {stats.computerRooms} {t("ห้องปฏิบัติการ & Pearson VUE", "Rooms & Pearson VUE")}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>

        {/* Spotlight Highlights: Pearson VUE & Data Center NOC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pearson VUE Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border border-amber-200 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>PEARSON VUE AUTHORIZED TEST CENTER</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {t(
                  "ศูนย์ทดสอบมาตรฐานวิชาชีพสากล (ห้อง 5A02 อาคาร 79)",
                  "Pearson VUE International Certification Center (Room 5A02)"
                )}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {t(
                  "ศูนย์สอบมาตรฐานสากลที่ได้รับอนุญาตอย่างเป็นทางการ รองรับการสอบ Cisco, CompTIA, AWS, Microsoft, Oracle สำหรับนักศึกษา บุคลากร และบุคคลทั่วไป",
                  "Fully certified testing environment for international IT certifications with secure proctoring stations."
                )}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-amber-800">
                {t("30 ที่นั่งสอบมาตรฐาน", "30 Proctored Testing Seats")}
              </span>
              <button
                type="button"
                onClick={() => {
                  const vueRoom = facilities.find((f) => f.id === "facility-14");
                  if (vueRoom) setActiveModalFacility(vueRoom);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span>{t("ดูห้องสอบ 5A02", "View Room 5A02")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ITD Server NOC Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white border border-blue-200 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200">
                <Cpu className="w-4 h-4 text-blue-700" />
                <span>ITD DATA CENTER & HIGH PERFORMANCE COMPUTING</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {t(
                  "ศูนย์ควบคุมเครือข่ายและเซิร์ฟเวอร์ (ห้อง 5A01 อาคาร 79)",
                  "Network Operations Center & Cloud Computing (Room 5A01)"
                )}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {t(
                  "ระบบคลัสเตอร์เซิร์ฟเวอร์เสมือนและคลาวด์สำหรับการวิจัย AI, Big Data Analytics, Cyber Range และงานบริการสารสนเทศประจำคณะ",
                  "High-performance compute clusters and virtualization servers powering AI research, cyber range, and digital infrastructure."
                )}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-blue-800">
                {t("โครงสร้างพื้นฐานระดับองค์กร", "Enterprise Cloud Infrastructure")}
              </span>
              <button
                type="button"
                onClick={() => {
                  const nocRoom = facilities.find((f) => f.id === "facility-13");
                  if (nocRoom) setActiveModalFacility(nocRoom);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span>{t("ดูศูนย์ NOC 5A01", "View Room 5A01")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t(
                  "ค้นหาชื่อห้อง (เช่น 3A02, 5A01), ความจุ, หรืออุปกรณ์...",
                  "Search room (e.g. 3A02, 5A01), capacity, or specs..."
                )}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-orange focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  aria-label={t("ล้างคำค้นหา", "Clear search")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Floor Filter Selector */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-[150px]">
                <select
                  value={selectedFloor}
                  onChange={(e) => handleFloorChange(e.target.value)}
                  aria-label={t("เลือกชั้น", "Select Floor")}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-700 font-medium focus:bg-white focus:border-brand-orange focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 cursor-pointer transition-all"
                >
                  {FACILITY_FLOORS.map((fl) => (
                    <option key={fl.id} value={fl.id}>
                      {language === "en" ? fl.nameEn : fl.nameTh}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 border-t border-gray-100 scrollbar-none">
            {FACILITY_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count =
                cat.id === "all"
                  ? stats.total
                  : cat.id === "classroom"
                  ? stats.classrooms
                  : stats.computerRooms;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-brand-orange text-white shadow-sm shadow-orange-500/20"
                      : "bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900"
                  }`}
                >
                  <span>{language === "en" ? cat.nameEn : cat.nameTh}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-white/25 text-white" : "bg-white text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-600">
          <div>
            <span>
              {t(
                `แสดงห้องปฏิบัติการและห้องเรียนทั้งหมด ${filteredList.length} ห้อง`,
                `Showing ${filteredList.length} facility rooms`
              )}
            </span>
            {(selectedCategory !== "all" || selectedFloor !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-3 text-brand-orange hover:underline font-semibold cursor-pointer"
              >
                {t("ล้างตัวกรองทั้งหมด", "Clear all filters")}
              </button>
            )}
          </div>
        </div>

        {/* Facilities Grid */}
        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredList.map((item, index) => (
              <FacilityCard
                key={item.id}
                facility={item}
                onSelect={(facility) => setActiveModalFacility(facility)}
                priority={index < 6}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-brand-orange">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-900">
                {t("ไม่พบข้อมูลห้องที่ตรงกับเงื่อนไขการค้นหา", "No facilities found matching your criteria")}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {t(
                  "ลองปรับเปลี่ยนคำค้นหา หรือเลือกตัวกรองชั้นอื่นเพื่อดูห้องเรียนและห้องปฏิบัติการ",
                  "Try changing your search terms or selecting another floor filter."
                )}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-darkOrange text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
              >
                <span>{t("ล้างตัวกรองและดูห้องทั้งหมด", "Reset Filters & View All")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Building 79 Guide Info Footer */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-brand-orange shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                {t(
                  "ต้องการใช้ห้องสำหรับการจัดอบรม สัมมนา หรือสอบมาตรฐานสากล?",
                  "Need to reserve a laboratory or seminar room?"
                )}
              </h4>
              <p className="text-xs sm:text-sm text-gray-600">
                {t(
                  "สามารถติดต่อเจ้าหน้าที่ดูแลห้องปฏิบัติการ สำนักงานคณบดี ชั้น 4 อาคารนวมินทรราชินี โทร. 02-555-2000 ต่อ 2740 หรือ 2708",
                  "Contact our lab support team at Dean's Office Fl 4, Navamindra Rajini Building, Tel: 02-555-2000 ext 2740."
                )}
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-brand-orange text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-xs"
          >
            <CalendarDays className="w-4 h-4" />
            <span>{t("ติดต่อสำนักงานคณบดี", "Contact Dean's Office")}</span>
          </Link>
        </div>
      </div>

      {/* Lightbox Detail Modal */}
      <FacilityModal
        facility={activeModalFacility}
        onClose={() => setActiveModalFacility(null)}
      />
    </div>
  );
}
