"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { personnel } from "@/data/personnel";
import type { PersonnelMember } from "@/types";
import PersonnelCard from "@/components/personnel/PersonnelCard";
import { useLanguage } from "@/context/LanguageContext";
import {
  getDepartmentName,
  getPersonName,
  getRoleName,
  getPersonEnglishName,
} from "@/lib/personnel-utils";
import {
  Briefcase,
  Home,
  ChevronRight,
  Search,
  X,
  Building2,
  Users,
  Award,
  GraduationCap,
  UserX,
  Sparkles,
  Phone,
  Layers,
  FileCheck,
} from "lucide-react";

const STAFF_DIVISIONS = [
  {
    id: "all",
    nameTh: "ทุกหน่วยงาน",
    nameEn: "All Divisions",
  },
  {
    id: "admin",
    nameTh: "งานบริหารและธุรการ",
    nameEn: "Administration & General Affairs",
    descriptionTh: "งานธุรการ สารบรรณ การบริหารงานทั่วไป และบริการประสานงานคณะ",
    descriptionEn: "General administration, official correspondence, and faculty operational support.",
  },
  {
    id: "finance",
    nameTh: "งานคลังและพัสดุ",
    nameEn: "Finance & Procurement",
    descriptionTh: "งานการเงิน บัญชี งบประมาณ การเบิกจ่าย และการจัดซื้อจัดจ้างพัสดุ",
    descriptionEn: "Financial accounting, budget disbursement, and procurement inventory management.",
  },
  {
    id: "policy",
    nameTh: "งานนโยบายและแผน",
    nameEn: "Policy & Planning",
    descriptionTh: "งานยุทธศาสตร์ แผนงบประมาณ และการติดตามประเมินผลการดำเนินงาน",
    descriptionEn: "Strategic planning, faculty budgeting, and key performance metric monitoring.",
  },
  {
    id: "academic-services",
    nameTh: "งานบริการการศึกษา",
    nameEn: "Academic Services",
    descriptionTh: "งานหลักสูตร ทะเบียน กิจการนักศึกษา ตารางสอนตารางสอบ และงานวิเทศสัมพันธ์",
    descriptionEn: "Curriculum administration, student records, exam scheduling, and international exchange.",
  },
  {
    id: "computer-network",
    nameTh: "งานสารสนเทศและระบบเครือข่ายคอมพิวเตอร์",
    nameEn: "Information & Network Systems",
    descriptionTh: "งานแม่ข่าย เครือข่ายสารสนเทศ ห้องปฏิบัติการคอมพิวเตอร์ และบริการดิจิทัล",
    descriptionEn: "Server systems, campus network infrastructure, computer labs, and digital platforms.",
  },
  {
    id: "research",
    nameTh: "งานวิจัยและพัฒนา",
    nameEn: "Research & Development",
    descriptionTh: "งานส่งเสริมทุนวิจัย นวัตกรรม การตีพิมพ์ และความร่วมมือทางวิชาการ",
    descriptionEn: "Research grants facilitation, technological innovation, and academic publications.",
  },
  {
    id: "student-affairs",
    nameTh: "งานกิจการนักศึกษา",
    nameEn: "Student Affairs",
    descriptionTh: "งานพัฒนานักศึกษา ทุนการศึกษา กิจกรรมเสริมหลักสูตร และศิษย์เก่าสัมพันธ์",
    descriptionEn: "Student development, scholarship coordination, student activities, and alumni network.",
  },
];

export default function StaffContent() {
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialDept = searchParams.get("dept") || "all";
  const initialSearch = searchParams.get("q") || searchParams.get("search") || "";

  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(initialDept);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  // Sync on searchParams change
  useEffect(() => {
    const dept = searchParams.get("dept") || "all";
    const q = searchParams.get("q") || searchParams.get("search") || "";
    setSelectedDivisionId(dept);
    setSearchQuery(q);
  }, [searchParams]);

  // Update URL params
  const updateUrlParams = useCallback(
    (dept: string, query: string) => {
      const params = new URLSearchParams();
      if (dept && dept !== "all") params.set("dept", dept);
      if (query && query.trim() !== "") params.set("q", query.trim());

      const queryStr = params.toString();
      const newUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
      window.history.replaceState(null, "", newUrl);
    },
    [pathname]
  );

  // Filter only staff
  const allStaff = useMemo(() => {
    return personnel.filter((p) => p.category === "staff");
  }, []);

  // Division counts
  const divisionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allStaff.length };
    STAFF_DIVISIONS.slice(1).forEach((div) => {
      counts[div.id] = allStaff.filter((p) => p.department === div.nameTh).length;
    });
    return counts;
  }, [allStaff]);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return allStaff.filter((person) => {
      // Division filter
      if (selectedDivisionId !== "all") {
        const divObj = STAFF_DIVISIONS.find((d) => d.id === selectedDivisionId);
        if (divObj && person.department !== divObj.nameTh) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const nameThMatch = person.nameTh.toLowerCase().includes(query);
        const nameEnMatch = getPersonEnglishName(person)?.toLowerCase().includes(query) ?? false;
        const roleThMatch = person.role.toLowerCase().includes(query);
        const roleEnMatch = getRoleName(person.role, "en").toLowerCase().includes(query);
        const deptThMatch = person.department ? person.department.toLowerCase().includes(query) : false;
        const emailMatch = person.email ? person.email.toLowerCase().includes(query) : false;
        const phoneMatch = person.phone ? person.phone.includes(query) : false;

        return nameThMatch || nameEnMatch || roleThMatch || roleEnMatch || deptThMatch || emailMatch || phoneMatch;
      }

      return true;
    });
  }, [allStaff, selectedDivisionId, searchQuery]);

  // Grouped by division
  const groupedDivisions = useMemo(() => {
    const activeDivs =
      selectedDivisionId === "all"
        ? STAFF_DIVISIONS.slice(1)
        : STAFF_DIVISIONS.filter((d) => d.id === selectedDivisionId);

    return activeDivs
      .map((div) => {
        const members = filteredStaff.filter((p) => p.department === div.nameTh);
        return {
          divInfo: div,
          members,
        };
      })
      .filter((group) => group.members.length > 0);
  }, [selectedDivisionId, filteredStaff]);

  const handleDivisionChange = (divId: string) => {
    setSelectedDivisionId(divId);
    updateUrlParams(divId, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateUrlParams(selectedDivisionId, query);
  };

  const handleResetFilters = () => {
    setSelectedDivisionId("all");
    setSearchQuery("");
    updateUrlParams("all", "");
  };

  return (
    <div className="w-full flex flex-col">
      {/* Hero Header Banner */}
      <section className="relative w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
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
              href="/personnel"
              className="hover:text-brand-orange transition-colors"
            >
              {t("บุคลากร", "Personnel")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-brand-orange font-medium">
              {t("เจ้าหน้าที่สายสนับสนุน", "Support Staff")}
            </span>
          </nav>

          {/* Title and Intro */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-xs font-semibold tracking-wide">
              <Briefcase className="w-3.5 h-3.5" />
              <span>ADMINISTRATIVE & SUPPORT STAFF</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              {t("เจ้าหน้าที่สายสนับสนุนวิชาการ", "Administrative & Support Staff")}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              {t(
                "ทำเนียบเจ้าหน้าที่และบุคลากรสายสนับสนุนประจำ 7 หน่วยงาน คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. พร้อมให้บริการและสนับสนุนการจัดการศึกษา",
                "Meet our dedicated professional support staff across 7 administrative and operational units at ITD KMUTNB."
              )}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              <span>
                <strong className="text-white font-semibold">{allStaff.length}</strong>{" "}
                {t("เจ้าหน้าที่ทั้งหมด", "Total Support Staff")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>
                <strong className="text-white font-semibold">7</strong>{" "}
                {t("หน่วยงานสนับสนุน", "Support Divisions")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Phone className="w-4 h-4 text-sky-400" />
              <span>{t("เบอร์ต่อตรงประจำหน่วยงาน", "Direct Extension Lines")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
        {/* Navigation Switcher Pills to other subpages */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <Link
            href="/personnel"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 shadow-2xs transition-all"
          >
            <Users className="w-3.5 h-3.5 text-gray-500" />
            <span>{t("บุคลากรทั้งหมด", "All Personnel")} (56)</span>
          </Link>
          <Link
            href="/personnel/administrators"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 shadow-2xs transition-all"
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>{t("ผู้บริหารคณะ", "Administrators")} (8)</span>
          </Link>
          <Link
            href="/personnel/lecturers"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 shadow-2xs transition-all"
          >
            <GraduationCap className="w-3.5 h-3.5 text-sky-500" />
            <span>{t("คณาจารย์ประจำ", "Lecturers")} (26)</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-md">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{t("เจ้าหน้าที่สายสนับสนุน", "Support Staff")} (22)</span>
          </div>
        </div>

        {/* Filter and Search Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t(
                "ค้นหาชื่อเจ้าหน้าที่, ตำแหน่ง, หน่วยงาน, เบอร์ต่อ, หรืออีเมล...",
                "Search staff by name, position, division, phone extension, or email..."
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

          {/* Division Filter Tabs */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 border-t border-gray-100 scrollbar-none">
            {STAFF_DIVISIONS.map((div) => {
              const isActive = selectedDivisionId === div.id;
              const count = divisionCounts[div.id] || 0;

              return (
                <button
                  key={div.id}
                  type="button"
                  onClick={() => handleDivisionChange(div.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900"
                  }`}
                >
                  <span>{language === "en" ? div.nameEn : div.nameTh}</span>
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
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
          <span>
            {t(
              `พบเจ้าหน้าที่สายสนับสนุนทั้งหมด ${filteredStaff.length} ท่าน`,
              `Showing ${filteredStaff.length} support staff members`
            )}
          </span>
          {(selectedDivisionId !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-brand-orange hover:underline font-semibold cursor-pointer"
            >
              {t("ล้างตัวกรองทั้งหมด", "Clear all filters")}
            </button>
          )}
        </div>

        {/* Division Sections */}
        {groupedDivisions.length > 0 ? (
          <div className="space-y-12 animate-fade-in">
            {groupedDivisions.map(({ divInfo, members }) => (
              <section key={divInfo.id} className="space-y-6">
                {/* Division Header Card */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                          {language === "en" ? divInfo.nameEn : divInfo.nameTh}
                        </h2>
                        <span className="text-xs font-semibold text-emerald-600">
                          {t("สำนักงานคณบดี คณะ ITD", "Dean's Office, ITD KMUTNB")}
                        </span>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold self-start sm:self-center">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {members.length} {t("ท่าน", "Staff")}
                      </span>
                    </div>
                  </div>

                  {divInfo.descriptionTh && (
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
                      {language === "en" && divInfo.descriptionEn
                        ? divInfo.descriptionEn
                        : divInfo.descriptionTh}
                    </p>
                  )}
                </div>

                {/* Staff Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {members.map((person, idx) => (
                    <PersonnelCard
                      key={person.id}
                      person={person}
                      priority={idx < 4}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <UserX className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-900">
                {t("ไม่พบเจ้าหน้าที่ที่ตรงกับเงื่อนไข", "No staff members found")}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {t(
                  "ลองเปลี่ยนคำค้นหา หรือเลือกหน่วยงานอื่นเพื่อค้นหาข้อมูลเจ้าหน้าที่ที่ต้องการ",
                  "Try adjusting your search query or selecting a different division."
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <span>{t("ล้างตัวกรองและดูทั้งหมด", "Reset Filters & View All")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
