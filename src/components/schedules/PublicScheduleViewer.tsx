"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { DegreeLevel, DayOfWeek } from "@prisma/client";
import {
  Calendar,
  Grid3X3,
  List,
  Printer,
  Loader2,
  CalendarX2,
  GraduationCap,
  BookOpen,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  MapPin,
  User,
  Info,
  Home,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { programs } from "@/data/programs";
import {
  DAYS_ORDER,
  DAY_METADATA,
  getCurrentDayOfWeek,
  calculateTotalHours,
} from "@/lib/weekly-grid";
import ScheduleFilterBar, {
  type ScheduleFilterState,
  DEGREE_OPTIONS,
  SEMESTER_OPTIONS,
} from "./ScheduleFilterBar";
import WeeklyTimetableGrid, {
  type PublicCourseSlot,
} from "./WeeklyTimetableGrid";
import MobileDayView from "./MobileDayView";
import ScheduleListView from "./ScheduleListView";

export interface ScheduleItem {
  id: string;
  academicYear: number;
  semester: number;
  degreeLevel: DegreeLevel;
  programId: string;
  programName: string;
  yearLevel: number;
  sectionGroup: string | null;
  status: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  slots: PublicCourseSlot[];
}

interface ApiResponse {
  schedules: ScheduleItem[];
  availableYears: number[];
  error?: string;
}

export default function PublicScheduleViewer() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse initial state from URL params if present
  const initialYear = Number(searchParams.get("year")) || 2567;
  const initialSemester = Number(searchParams.get("sem")) || 1;
  const initialDegree =
    (searchParams.get("degree")?.toUpperCase() as DegreeLevel) || "BACHELOR";
  const initialProgram = searchParams.get("program") || "bachelor-itd";
  const initialYearLevel = Number(searchParams.get("yearLevel")) || 1;
  const initialSection = searchParams.get("sec") || undefined;
  const initialViewMode =
    searchParams.get("view") === "list" ? "list" : "grid";

  const [filters, setFilters] = useState<ScheduleFilterState>({
    academicYear: initialYear,
    semester: initialSemester,
    degreeLevel: initialDegree,
    programId: initialProgram,
    yearLevel: initialYearLevel,
    sectionGroup: initialSection,
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() =>
    getCurrentDayOfWeek()
  );

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([2567]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Sync state to URL search parameters without page reload
  const updateUrlParams = useCallback(
    (currentFilters: ScheduleFilterState, currentView: "grid" | "list") => {
      const params = new URLSearchParams();
      params.set("year", String(currentFilters.academicYear));
      params.set("sem", String(currentFilters.semester));
      params.set("degree", currentFilters.degreeLevel);
      params.set("program", currentFilters.programId);
      params.set("yearLevel", String(currentFilters.yearLevel));
      if (currentFilters.sectionGroup) {
        params.set("sec", currentFilters.sectionGroup);
      }
      if (currentView !== "grid") {
        params.set("view", currentView);
      }
      const newQuery = params.toString();
      const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
      window.history.replaceState(null, "", newUrl);
    },
    [pathname]
  );

  // Fetch published schedules based on filters
  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const params = new URLSearchParams({
        academicYear: String(filters.academicYear),
        semester: String(filters.semester),
        degreeLevel: filters.degreeLevel,
        programId: filters.programId,
        yearLevel: String(filters.yearLevel),
      });

      const response = await fetch(`/api/schedules?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load schedules");
      }

      const data: ApiResponse = await response.json();
      setSchedules(data.schedules || []);

      if (data.availableYears && data.availableYears.length > 0) {
        setAvailableYears(data.availableYears);
      }
    } catch (err: any) {
      setFetchError(
        t(
          "ไม่สามารถโหลดข้อมูลตารางเรียนได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
          "Unable to load class schedules. Please check your internet connection."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Handle filter changes from ScheduleFilterBar
  const handleFilterChange = (newFilters: ScheduleFilterState) => {
    setFilters(newFilters);
    updateUrlParams(newFilters, viewMode);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    updateUrlParams(filters, mode);
  };

  // Extract distinct available sections from returned schedules
  const availableSections = useMemo(() => {
    const sections = new Set<string>();
    schedules.forEach((s) => {
      if (s.sectionGroup && s.sectionGroup.trim()) {
        sections.add(s.sectionGroup.trim());
      }
    });
    return Array.from(sections).sort();
  }, [schedules]);

  // Active check: if filters.sectionGroup is set but not present in availableSections, reset filters.sectionGroup = undefined
  useEffect(() => {
    if (filters.sectionGroup && !isLoading) {
      if (!availableSections.includes(filters.sectionGroup)) {
        setFilters((prev) => {
          const updated = { ...prev, sectionGroup: undefined };
          updateUrlParams(updated, viewMode);
          return updated;
        });
      }
    }
  }, [availableSections, filters.sectionGroup, isLoading, updateUrlParams, viewMode]);

  // Selected schedule(s)
  const activeSchedules = useMemo(() => {
    if (!filters.sectionGroup) {
      return schedules;
    }
    return schedules.filter((s) => s.sectionGroup === filters.sectionGroup);
  }, [schedules, filters.sectionGroup]);

  // Primary active schedule (for header information)
  const primarySchedule = activeSchedules[0] || schedules[0] || null;

  // Flattened all slots from active schedule(s)
  const activeSlots = useMemo(() => {
    const list: PublicCourseSlot[] = [];
    activeSchedules.forEach((s) => {
      if (s.slots) {
        list.push(...s.slots);
      }
    });
    return list;
  }, [activeSchedules]);

  // Total weekly contact hours
  const totalWeeklyHours = useMemo(
    () => calculateTotalHours(activeSlots),
    [activeSlots]
  );

  // Program details
  const currentProgram = useMemo(() => {
    return (
      programs.find((p) => p.id === filters.programId) || {
        id: filters.programId,
        titleTh: primarySchedule?.programName || "หลักสูตร",
        titleEn: primarySchedule?.programName || "Curriculum",
      }
    );
  }, [filters.programId, primarySchedule]);

  const currentSemesterMeta = useMemo(() => {
    return (
      SEMESTER_OPTIONS.find((s) => s.value === filters.semester) ||
      SEMESTER_OPTIONS[0]
    );
  }, [filters.semester]);

  const currentDegreeMeta = useMemo(() => {
    return (
      DEGREE_OPTIONS.find((d) => d.key === filters.degreeLevel) ||
      DEGREE_OPTIONS[0]
    );
  }, [filters.degreeLevel]);

  // Print timetable handler
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 printable-schedule">
      {/* =========================================================================
          PRINT ONLY HEADER
          Appears exclusively when printed via window.print() or Ctrl+P
          ========================================================================= */}
      <div className="print-only border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ
            </h1>
            <p className="text-sm text-slate-600">
              Faculty of Information Technology and Digital Innovation, KMUTNB
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            พิมพ์เมื่อ: {new Date().toLocaleDateString("th-TH")}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-slate-500">ปีการศึกษา:</span>{" "}
            <strong>{filters.academicYear}</strong> (ภาค {filters.semester})
          </div>
          <div>
            <span className="text-slate-500">ระดับ:</span>{" "}
            <strong>{currentDegreeMeta.th}</strong> (ชั้นปีที่ {filters.yearLevel})
          </div>
          <div className="col-span-2">
            <span className="text-slate-500">หลักสูตร:</span>{" "}
            <strong>{currentProgram.titleTh}</strong>
            {filters.sectionGroup && (
              <span className="ml-2 font-mono">({filters.sectionGroup})</span>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          BREADCRUMB (Screen Only, Bilingual)
          ========================================================================= */}
      <nav
        aria-label="Breadcrumb"
        className="no-print flex items-center gap-1.5 text-xs text-slate-500 pb-1"
      >
        <Link
          href="/"
          className="hover:text-brand-orange transition-colors flex items-center gap-1"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{t("หน้าหลัก", "Home")}</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          href="/services"
          className="hover:text-brand-orange transition-colors"
        >
          {t("บริการและดาวน์โหลด", "Services & Downloads")}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900">
          {t("ตารางเรียนและตารางสอน", "Class Timetable")}
        </span>
      </nav>

      {/* =========================================================================
          PAGE HEADER & CONTROLS (Screen Only)
          ========================================================================= */}
      <div className="no-print flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{t("ระบบตารางเรียนตารางสอน", "Class Timetable System")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("ตารางเรียนและตารางสอน", "Class & Teaching Schedules")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            {t(
              "ตรวจสอบตารางเวลาเรียน รายวิชา ห้องเรียน และอาจารย์ผู้สอน คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
              "Search and view course schedules, classrooms, and instructors for ITD KMUTNB."
            )}
          </p>
        </div>

        {/* Action Controls: View Switcher & Print Button */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* View Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200/80 flex items-center gap-1 shadow-xs">
            <button
              type="button"
              onClick={() => handleViewModeChange("grid")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title={t("มุมมองตารางรายสัปดาห์", "Weekly Grid View")}
            >
              <Grid3X3 className="w-3.5 h-3.5 text-brand-orange" />
              <span>{t("ตารางรายสัปดาห์", "Weekly Grid")}</span>
            </button>

            <button
              type="button"
              onClick={() => handleViewModeChange("list")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title={t("มุมมองรายการวิชา", "Course List View")}
            >
              <List className="w-3.5 h-3.5 text-brand-orange" />
              <span>{t("รายการรายวิชา", "List View")}</span>
            </button>
          </div>

          {/* Print / Save PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={activeSlots.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title={t("พิมพ์หรือบันทึกเป็น PDF", "Print or Save as PDF")}
          >
            <Printer className="w-4 h-4 text-brand-orange" />
            <span className="hidden sm:inline">
              {t("พิมพ์ / บันทึก PDF", "Print / PDF")}
            </span>
            <span className="sm:hidden">{t("พิมพ์", "Print")}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          CASCADING FILTER BAR
          ========================================================================= */}
      <ScheduleFilterBar
        filters={filters}
        onChange={handleFilterChange}
        availableYears={availableYears}
        availableSections={availableSections}
        disabled={isLoading}
      />

      {/* =========================================================================
          ACTIVE COHORT SUMMARY BANNER
          ========================================================================= */}
      {!isLoading && schedules.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-orange text-white text-[11px] font-bold">
                {language === "en"
                  ? currentDegreeMeta.en
                  : currentDegreeMeta.th}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-[11px] font-semibold">
                {t(`ชั้นปีที่ ${filters.yearLevel}`, `Year ${filters.yearLevel}`)}
              </span>
              {filters.sectionGroup && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-mono font-bold">
                  {filters.sectionGroup}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-xl font-bold tracking-tight text-white">
              {language === "en" ? currentProgram.titleEn : currentProgram.titleTh}
            </h2>

            <p className="text-xs text-slate-300">
              {t(
                `ตารางเรียนภาคการศึกษาที่ ${filters.semester} ปีการศึกษา ${filters.academicYear}`,
                `Class Schedule for Semester ${filters.semester}, Academic Year ${filters.academicYear}`
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6 shrink-0">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {t("จำนวนวิชา", "Courses")}
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                {activeSlots.length}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {t("ชั่วโมง/สัปดาห์", "Hrs/Week")}
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-brand-orange font-mono">
                {totalWeeklyHours}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LOADING STATE
          ========================================================================= */}
      {isLoading && (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 sm:p-20 text-center shadow-xs">
          <Loader2 className="w-8 h-8 text-brand-orange animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            {t("กำลังค้นหาตารางเรียน...", "Loading schedule details...")}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("โปรดรอสักครู่ ระบบกำลังดึงข้อมูลรายวิชาและห้องเรียน", "Please wait while fetching classes and rooms.")}
          </p>
        </div>
      )}

      {/* =========================================================================
          ERROR STATE
          ========================================================================= */}
      {!isLoading && fetchError && (
        <div className="bg-red-50 rounded-3xl border border-red-200 p-8 sm:p-10 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-3 text-red-600">
            <Info className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-red-900">
            {t("เกิดข้อผิดพลาดในการโหลดข้อมูล", "Unable to load schedule data")}
          </h3>
          <p className="text-xs sm:text-sm text-red-700 mt-1 max-w-md mx-auto">
            {fetchError}
          </p>
          <button
            type="button"
            onClick={fetchSchedules}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t("ลองใหม่อีกครั้ง", "Try again")}</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          EMPTY STATE (NO PUBLISHED SCHEDULE FOR CRITERIA)
          ========================================================================= */}
      {!isLoading && !fetchError && schedules.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 sm:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto mb-4 text-brand-orange">
            <CalendarX2 className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {t(
              "ไม่พบตารางเรียนที่เผยแพร่สำหรับเงื่อนไขที่เลือก",
              "No Published Timetable Found"
            )}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
            {t(
              `ยังไม่มีการเผยแพร่ตารางเรียนสำหรับหลักสูตรนี้ ในภาคการศึกษาที่ ${filters.semester}/${filters.academicYear} (ชั้นปีที่ ${filters.yearLevel}) โปรดลองเลือกปีการศึกษาอื่น หรือตรวจสอบภาคเรียนถัดไป`,
              `No timetable has been published for this program in Semester ${filters.semester}/${filters.academicYear} (Year ${filters.yearLevel}) yet. Please try selecting a different semester or academic year.`
            )}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                handleFilterChange({
                  ...filters,
                  semester: filters.semester === 1 ? 2 : 1,
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>
                {t(
                  `สลับเป็นภาคการศึกษาที่ ${filters.semester === 1 ? 2 : 1}`,
                  `Switch to Semester ${filters.semester === 1 ? 2 : 1}`
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleFilterChange({
                  ...filters,
                  yearLevel: 1,
                  degreeLevel: "BACHELOR",
                  programId: "bachelor-itd",
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <span>{t("รีเซ็ตเป็น ป.ตรี ปี 1", "Reset to Bachelor Yr 1")}</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCHEDULE VIEW CONTENT (GRID / MOBILE / LIST)
          ========================================================================= */}
      {!isLoading && !fetchError && schedules.length > 0 && (
        <div>
          {viewMode === "grid" ? (
            <>
              {/* Desktop / Tablet Matrix Grid View */}
              <div className="hidden md:block">
                <WeeklyTimetableGrid slots={activeSlots} />
              </div>

              {/* Mobile Thumb-Friendly Day View */}
              <div className="block md:hidden">
                <MobileDayView
                  slots={activeSlots}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                />
              </div>
            </>
          ) : (
            /* Tabular List View (Both Desktop and Mobile) */
            <ScheduleListView slots={activeSlots} />
          )}
        </div>
      )}
    </div>
  );
}
