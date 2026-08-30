"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { personnel } from "@/data/personnel";
import type { PersonnelMember } from "@/types";
import PersonnelCard from "@/components/personnel/PersonnelCard";
import { useLanguage } from "@/context/LanguageContext";
import {
  PERSONNEL_CATEGORIES,
  DEPARTMENTS,
  getDepartmentName,
  getPersonName,
  getRoleName,
  getPersonEnglishName,
} from "@/lib/personnel-utils";
import {
  Users,
  Award,
  GraduationCap,
  Briefcase,
  Home,
  ChevronRight,
  Search,
  X,
  Building2,
  SlidersHorizontal,
  LayoutGrid,
  ListFilter,
  UserX,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default function PersonnelDirectoryContent() {
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial query params
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("q") || searchParams.get("search") || "";
  const initialDept = searchParams.get("dept") || "all";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(initialDept);
  const [groupByDepartment, setGroupByDepartment] = useState<boolean>(false);

  // Sync state on URL param change
  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    const q = searchParams.get("q") || searchParams.get("search") || "";
    const dept = searchParams.get("dept") || "all";

    setSelectedCategory(cat);
    setSearchQuery(q);
    setSelectedDepartment(dept);
  }, [searchParams]);

  // Update URL search parameters
  const updateUrlParams = useCallback(
    (cat: string, search: string, dept: string) => {
      const params = new URLSearchParams();
      if (cat && cat !== "all") params.set("category", cat);
      if (search && search.trim() !== "") params.set("q", search.trim());
      if (dept && dept !== "all") params.set("dept", dept);

      const queryStr = params.toString();
      const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
      window.history.replaceState(null, "", newUrl);
    },
    [pathname]
  );

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: personnel.length,
      administrator: personnel.filter((p) => p.category === "administrator").length,
      lecturer: personnel.filter((p) => p.category === "lecturer").length,
      staff: personnel.filter((p) => p.category === "staff").length,
    };
  }, []);

  // Department counts
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    personnel.forEach((p) => {
      if (p.department) {
        counts[p.department] = (counts[p.department] || 0) + 1;
      }
    });
    return counts;
  }, []);

  // Filtered personnel list
  const filteredPersonnel = useMemo(() => {
    return personnel.filter((person) => {
      // Category filter
      if (selectedCategory !== "all" && person.category !== selectedCategory) {
        return false;
      }

      // Department filter
      if (selectedDepartment !== "all" && person.department !== selectedDepartment) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const nameThMatch = person.nameTh.toLowerCase().includes(query);
        const nameEnMatch = getPersonEnglishName(person)?.toLowerCase().includes(query) ?? false;
        const roleThMatch = person.role.toLowerCase().includes(query);
        const roleEnMatch = getRoleName(person.role, "en").toLowerCase().includes(query);
        const deptThMatch = person.department ? person.department.toLowerCase().includes(query) : false;
        const deptEnMatch = person.department ? getDepartmentName(person.department, "en").toLowerCase().includes(query) : false;
        const emailMatch = person.email ? person.email.toLowerCase().includes(query) : false;
        const phoneMatch = person.phone ? person.phone.includes(query) : false;

        return (
          nameThMatch ||
          nameEnMatch ||
          roleThMatch ||
          roleEnMatch ||
          deptThMatch ||
          deptEnMatch ||
          emailMatch ||
          phoneMatch
        );
      }

      return true;
    });
  }, [selectedCategory, selectedDepartment, searchQuery]);

  // Grouped by department
  const groupedPersonnel = useMemo(() => {
    const map = new Map<string, PersonnelMember[]>();

    filteredPersonnel.forEach((person) => {
      const dept = person.department || "คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล";
      if (!map.has(dept)) {
        map.set(dept, []);
      }
      map.get(dept)!.push(person);
    });

    return Array.from(map.entries()).map(([deptName, members]) => ({
      departmentName: deptName,
      members,
    }));
  }, [filteredPersonnel]);

  // Handlers
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    updateUrlParams(catId, searchQuery, selectedDepartment);
  };

  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept);
    updateUrlParams(selectedCategory, searchQuery, dept);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateUrlParams(selectedCategory, query, selectedDepartment);
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedDepartment("all");
    setSearchQuery("");
    updateUrlParams("all", "", "all");
  };

  return (
    <div className="w-full flex flex-col">
      {/* Hero Header Banner */}
      <section className="relative w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
        {/* Ambient background glows */}
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
              {t("บุคลากร", "Personnel")}
            </span>
          </nav>

          {/* Title & Description */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold tracking-wide">
              <Users className="w-3.5 h-3.5" />
              <span>ITD KMUTNB DIRECTORY</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              {t("บุคลากรและคณาจารย์", "Personnel & Faculty Directory")}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              {t(
                "ทำเนียบคณาจารย์ นักวิจัย ผู้บริหาร และบุคลากรสายสนับสนุน คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
                "Explore our distinguished faculty members, executive leadership, academic researchers, and professional support staff at ITD KMUTNB."
              )}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              <span>
                <strong className="text-white font-semibold">{personnel.length}</strong>{" "}
                {t("บุคลากรทั้งหมด", "Total Personnel")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Award className="w-4 h-4 text-amber-400" />
              <span>
                <strong className="text-white font-semibold">{categoryCounts.administrator}</strong>{" "}
                {t("ผู้บริหาร", "Administrators")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <GraduationCap className="w-4 h-4 text-sky-400" />
              <span>
                <strong className="text-white font-semibold">{categoryCounts.lecturer}</strong>{" "}
                {t("อาจารย์ประจำ", "Lecturers")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>
                <strong className="text-white font-semibold">{categoryCounts.staff}</strong>{" "}
                {t("สายสนับสนุน", "Support Staff")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
        {/* Quick Subpage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/personnel/administrators"
            className="group relative bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-brand-orange/40 transition-all flex items-start justify-between"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-brand-orange shrink-0 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 group-hover:text-brand-orange transition-colors text-sm sm:text-base">
                  {t("ผู้บริหารคณะ", "Executive Leadership")}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {t("โครงสร้างการบริหารระดับคณะและหัวหน้าภาควิชา", "Dean, Associate Deans & Dept Heads")}
                </p>
                <span className="inline-block text-[11px] font-semibold text-brand-orange">
                  8 {t("ท่าน", "Members")}
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-orange group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            href="/personnel/lecturers"
            className="group relative bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-brand-orange/40 transition-all flex items-start justify-between"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                  {t("คณาจารย์ประจำ", "Lecturers & Faculty")}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {t("คณาจารย์แยกตาม 3 ภาควิชาการเรียนการสอน", "Faculty across 3 academic departments")}
                </p>
                <span className="inline-block text-[11px] font-semibold text-blue-600">
                  26 {t("ท่าน", "Members")}
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>

          <Link
            href="/personnel/staff"
            className="group relative bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg hover:border-brand-orange/40 transition-all flex items-start justify-between"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors text-sm sm:text-base">
                  {t("เจ้าหน้าที่สายสนับสนุน", "Support Staff")}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {t("บุคลากรสนับสนุนแยกตาม 7 หน่วยงานบริการ", "Support staff across 7 divisions")}
                </p>
                <span className="inline-block text-[11px] font-semibold text-emerald-600">
                  22 {t("ท่าน", "Members")}
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-6 space-y-4">
          {/* Top Controls: Search Input + Grouping Switcher */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Real-time Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t(
                  "ค้นหาชื่ออาจารย์, ตำแหน่ง, ภาควิชา, หรืออีเมล...",
                  "Search by name, role, department, or email..."
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

            {/* Department Dropdown Selector */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-[200px]">
                <select
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  aria-label={t("เลือกภาควิชา/หน่วยงาน", "Select Department/Division")}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-700 font-medium focus:bg-white focus:border-brand-orange focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 cursor-pointer transition-all"
                >
                  <option value="all">
                    {t("ทุกภาควิชา / ทุกหน่วยงาน", "All Departments & Units")}
                  </option>
                  {Object.keys(departmentCounts).map((dept) => (
                    <option key={dept} value={dept}>
                      {getDepartmentName(dept, language)} ({departmentCounts[dept]})
                    </option>
                  ))}
                </select>
                <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Grouping Toggle */}
              <button
                type="button"
                onClick={() => setGroupByDepartment(!groupByDepartment)}
                title={t("สลับการจัดกลุ่มตามภาควิชา", "Toggle grouping by department")}
                className={`p-2.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  groupByDepartment
                    ? "bg-brand-orange text-white border-brand-orange shadow-xs"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {groupByDepartment ? (
                  <>
                    <ListFilter className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("จัดกลุ่ม", "Grouped")}</span>
                  </>
                ) : (
                  <>
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("ตารางรวม", "Grid")}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 border-t border-gray-100 scrollbar-none">
            {PERSONNEL_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count = categoryCounts[cat.id];

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

        {/* Results Counter & Active Filter Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-600">
          <div>
            <span>
              {t(
                `แสดงบุคลากรทั้งหมด ${filteredPersonnel.length} ท่าน`,
                `Showing ${filteredPersonnel.length} personnel members`
              )}
            </span>
            {(selectedCategory !== "all" || selectedDepartment !== "all" || searchQuery) && (
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

        {/* Personnel Content Grid / Department Groups */}
        {filteredPersonnel.length > 0 ? (
          groupByDepartment ? (
            /* Grouped by Department */
            <div className="space-y-10 animate-fade-in">
              {groupedPersonnel.map(({ departmentName, members }) => (
                <div key={departmentName} className="space-y-4">
                  {/* Department Section Header */}
                  <div className="flex items-center justify-between pb-3 border-b-2 border-brand-orange/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-brand-orange flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        {getDepartmentName(departmentName, language)}
                      </h2>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                      {members.length} {t("ท่าน", "Members")}
                    </span>
                  </div>

                  {/* Members Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {members.map((person) => (
                      <PersonnelCard key={person.id} person={person} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Flat Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {filteredPersonnel.map((person, index) => (
                <PersonnelCard
                  key={person.id}
                  person={person}
                  priority={index < 8}
                />
              ))}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="py-20 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-brand-orange">
              <UserX className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-900">
                {t("ไม่พบบุคลากรที่ตรงกับเงื่อนไขการค้นหา", "No personnel found matching criteria")}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {t(
                  "ลองปรับเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อค้นหาข้อมูลบุคลากรที่ต้องการ",
                  "Try adjusting your search keywords or switching category filters."
                )}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-darkOrange text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
              >
                <span>{t("ล้างตัวกรองและดูบุคลากรทั้งหมด", "Reset Filters & View All")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
