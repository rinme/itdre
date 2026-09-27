"use client";

import React, { useMemo } from "react";
import type { DegreeLevel } from "@prisma/client";
import { programs } from "@/data/programs";
import { useLanguage } from "@/context/LanguageContext";
import {
  Calendar,
  GraduationCap,
  BookOpen,
  Layers,
  Filter,
  Users,
} from "lucide-react";

export interface ScheduleFilterState {
  academicYear: number;
  semester: number;
  degreeLevel: DegreeLevel;
  programId: string;
  yearLevel: number;
  sectionGroup?: string;
}

export interface DegreeOption {
  key: DegreeLevel;
  th: string;
  en: string;
  shortTh: string;
  shortEn: string;
  maxYear: number;
}

export const DEGREE_OPTIONS: DegreeOption[] = [
  {
    key: "BACHELOR",
    th: "ปริญญาตรี",
    en: "Bachelor's",
    shortTh: "ป.ตรี",
    shortEn: "B.Sc./B.Eng.",
    maxYear: 4,
  },
  {
    key: "MASTER",
    th: "ปริญญาโท",
    en: "Master's",
    shortTh: "ป.โท",
    shortEn: "M.Sc.",
    maxYear: 2,
  },
  {
    key: "DOCTOR",
    th: "ปริญญาเอก",
    en: "Doctoral",
    shortTh: "ป.เอก",
    shortEn: "Ph.D.",
    maxYear: 3,
  },
];

export const SEMESTER_OPTIONS = [
  { value: 1, th: "ภาคการศึกษาที่ 1", en: "Semester 1", shortTh: "ภาค 1", shortEn: "Sem 1" },
  { value: 2, th: "ภาคการศึกษาที่ 2", en: "Semester 2", shortTh: "ภาค 2", shortEn: "Sem 2" },
  { value: 3, th: "ภาคฤดูร้อน", en: "Summer Term", shortTh: "ฤดูร้อน", shortEn: "Summer" },
];

/**
 * Pure helper function to handle cascading filter changes.
 * When degreeLevel changes, automatically picks a valid programId and clamps study year.
 */
export function cascadeFilterUpdate(
  current: ScheduleFilterState,
  change: Partial<ScheduleFilterState>,
  allPrograms = programs
): ScheduleFilterState {
  const next: ScheduleFilterState = { ...current, ...change };

  // If cohort (degreeLevel, programId, yearLevel) changed and sectionGroup was not explicitly provided in change,
  // reset sectionGroup to undefined to prevent orphaned section selections
  const cohortChanged =
    (change.degreeLevel && change.degreeLevel !== current.degreeLevel) ||
    (change.programId && change.programId !== current.programId) ||
    (change.yearLevel !== undefined && change.yearLevel !== current.yearLevel);

  if (cohortChanged && !("sectionGroup" in change)) {
    next.sectionGroup = undefined;
  }

  // If degree level changed, ensure programId matches degree level
  if (change.degreeLevel && change.degreeLevel !== current.degreeLevel) {
    const targetDegree = change.degreeLevel.toLowerCase();
    const matchingProgs = allPrograms.filter(
      (p) => p.degree.toLowerCase() === targetDegree
    );

    const isCurrentProgValid = matchingProgs.some((p) => p.id === next.programId);
    if (!isCurrentProgValid && matchingProgs.length > 0) {
      next.programId = matchingProgs[0].id;
    }

    // Also clamp yearLevel according to max degree year
    const degreeMeta = DEGREE_OPTIONS.find((d) => d.key === change.degreeLevel);
    const maxYear = degreeMeta ? degreeMeta.maxYear : 4;
    if (next.yearLevel > maxYear) {
      next.yearLevel = 1;
    }
  }

  return next;
}

interface ScheduleFilterBarProps {
  filters: ScheduleFilterState;
  onChange: (filters: ScheduleFilterState) => void;
  availableYears?: number[];
  availableSections?: string[];
  disabled?: boolean;
  className?: string;
}

export default function ScheduleFilterBar({
  filters,
  onChange,
  availableYears = [2567],
  availableSections = [],
  disabled = false,
  className = "",
}: ScheduleFilterBarProps) {
  const { language, t } = useLanguage();

  // Programs filtered by selected degree level
  const filteredPrograms = useMemo(() => {
    const degreeStr = filters.degreeLevel.toLowerCase();
    return programs.filter((p) => p.degree.toLowerCase() === degreeStr);
  }, [filters.degreeLevel]);

  // Max study year for current degree
  const currentDegreeMeta = useMemo(() => {
    return (
      DEGREE_OPTIONS.find((d) => d.key === filters.degreeLevel) ||
      DEGREE_OPTIONS[0]
    );
  }, [filters.degreeLevel]);

  // Available year levels list (e.g. [1, 2, 3, 4])
  const studyYearOptions = useMemo(() => {
    const count = currentDegreeMeta.maxYear;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [currentDegreeMeta]);

  // Years list (ensure at least selected year and standard fallback exist)
  const yearsList = useMemo(() => {
    const set = new Set<number>(availableYears);
    set.add(filters.academicYear);
    if (set.size === 0) set.add(2567);
    return Array.from(set).sort((a, b) => b - a);
  }, [availableYears, filters.academicYear]);

  const handleUpdate = (change: Partial<ScheduleFilterState>) => {
    const nextFilters = cascadeFilterUpdate(filters, change, programs);
    onChange(nextFilters);
  };

  return (
    <div
      className={`no-print bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 transition-all ${className}`}
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 text-slate-700">
        <Filter className="w-4 h-4 text-brand-orange" />
        <h3 className="text-sm font-bold tracking-tight">
          {t("ค้นหาและกรองตารางเรียน", "Filter Timetable")}
        </h3>
        <span className="text-xs text-slate-400 ml-auto hidden sm:inline">
          {t("เลือกเงื่อนไขเพื่อแสดงตารางเรียนที่เกี่ยวข้อง", "Select criteria to view schedules")}
        </span>
      </div>

      <div className="space-y-4">
        {/* Row 1: Academic Year & Semester */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Academic Year Dropdown */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-orange" />
              <span>{t("ปีการศึกษา", "Academic Year")}</span>
            </label>
            <select
              value={filters.academicYear}
              disabled={disabled}
              onChange={(e) =>
                handleUpdate({ academicYear: Number(e.target.value) })
              }
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all cursor-pointer disabled:opacity-50"
            >
              {yearsList.map((year) => (
                <option key={year} value={year}>
                  {t(`ปีการศึกษา ${year}`, `Academic Year ${year}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Segmented Buttons */}
          <div className="md:col-span-8">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-orange" />
              <span>{t("ภาคการศึกษา", "Semester")}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
              {SEMESTER_OPTIONS.map((sem) => {
                const isActive = filters.semester === sem.value;
                return (
                  <button
                    key={sem.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleUpdate({ semester: sem.value })}
                    className={`h-8 sm:h-9 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                      isActive
                        ? "bg-white text-brand-orange shadow-xs border border-orange-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    } disabled:opacity-50 cursor-pointer`}
                  >
                    <span>{language === "en" ? sem.shortEn : sem.shortTh}</span>
                    <span className="hidden sm:inline text-[11px] opacity-75">
                      ({language === "en" ? sem.en : sem.th})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Degree Level Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-brand-orange" />
            <span>{t("ระดับการศึกษา", "Degree Level")}</span>
          </label>
          <div className="grid grid-cols-3 gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            {DEGREE_OPTIONS.map((deg) => {
              const isActive = filters.degreeLevel === deg.key;
              return (
                <button
                  key={deg.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleUpdate({ degreeLevel: deg.key })}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
                    isActive
                      ? "bg-white text-brand-orange shadow-sm border border-orange-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  } disabled:opacity-50 cursor-pointer`}
                >
                  <span>{language === "en" ? deg.en : deg.th}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? "bg-brand-orange/10 text-brand-orange font-bold"
                        : "bg-slate-200/70 text-slate-500"
                    }`}
                  >
                    {deg.shortEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Program Selector & Study Year & Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Program Selector */}
          <div className="md:col-span-7">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand-orange" />
              <span>{t("หลักสูตรการศึกษา", "Curriculum / Program")}</span>
            </label>
            <select
              value={filters.programId}
              disabled={disabled || filteredPrograms.length === 0}
              onChange={(e) => handleUpdate({ programId: e.target.value })}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all cursor-pointer disabled:opacity-50"
            >
              {filteredPrograms.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {language === "en" ? prog.titleEn : prog.titleTh}
                </option>
              ))}
            </select>
          </div>

          {/* Study Year Tabs */}
          <div className={`${availableSections.length > 0 ? "md:col-span-3" : "md:col-span-5"}`}>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-orange" />
              <span>{t("ชั้นปี", "Study Year")}</span>
            </label>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
              {studyYearOptions.map((yearNum) => {
                const isActive = filters.yearLevel === yearNum;
                return (
                  <button
                    key={yearNum}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleUpdate({ yearLevel: yearNum })}
                    className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isActive
                        ? "bg-white text-brand-orange shadow-xs border border-orange-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    } disabled:opacity-50`}
                  >
                    <span>{t(`ปี ${yearNum}`, `Yr ${yearNum}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Selector (if multiple cohorts exist) */}
          {availableSections.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-orange" />
                <span>{t("กลุ่มเรียน", "Section")}</span>
              </label>
              <select
                value={filters.sectionGroup || ""}
                disabled={disabled}
                onChange={(e) =>
                  handleUpdate({ sectionGroup: e.target.value || undefined })
                }
                className="w-full h-10 px-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">{t("ทุกกลุ่ม", "All Sec")}</option>
                {availableSections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
