"use client";

import React, { useState, useMemo } from "react";
import type { DayOfWeek } from "@prisma/client";
import {
  Clock,
  MapPin,
  User,
  Search,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  DAYS_ORDER,
  DAY_METADATA,
  sortCourseSlots,
  getPublicColorTheme,
  COURSE_TYPE_META,
  timeToMinutes,
  calculateTotalHours,
} from "@/lib/weekly-grid";
import { useLanguage } from "@/context/LanguageContext";
import type { PublicCourseSlot } from "./WeeklyTimetableGrid";

interface ScheduleListViewProps {
  slots: PublicCourseSlot[];
  className?: string;
}

export default function ScheduleListView({
  slots,
  className = "",
}: ScheduleListViewProps) {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [dayFilter, setDayFilter] = useState<string>("ALL");

  // Filtered slots by search query and day
  const filteredSlots = useMemo(() => {
    let result = sortCourseSlots(slots);

    if (dayFilter !== "ALL") {
      result = result.filter((s) => s.dayOfWeek === dayFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.courseCode.toLowerCase().includes(q) ||
          s.courseName.toLowerCase().includes(q) ||
          (s.room && s.room.toLowerCase().includes(q)) ||
          (s.instructors && s.instructors.some((i) => i.toLowerCase().includes(q))) ||
          (s.section && s.section.toLowerCase().includes(q))
      );
    }

    return result;
  }, [slots, dayFilter, searchQuery]);

  // Group filtered slots by day
  const groupedByDay = useMemo(() => {
    const map = new Map<DayOfWeek, PublicCourseSlot[]>();
    DAYS_ORDER.forEach((day) => map.set(day, []));

    filteredSlots.forEach((slot) => {
      const list = map.get(slot.dayOfWeek) || [];
      list.push(slot);
      map.set(slot.dayOfWeek, list);
    });

    return map;
  }, [filteredSlots]);

  // Days that actually have matching courses
  const activeDays = useMemo(() => {
    return DAYS_ORDER.filter((day) => {
      const daySlots = groupedByDay.get(day) || [];
      return daySlots.length > 0;
    });
  }, [groupedByDay]);

  // Overall Statistics
  const totalHours = useMemo(() => calculateTotalHours(slots), [slots]);
  const lectureCount = useMemo(
    () => slots.filter((s) => s.courseType === "LECTURE").length,
    [slots]
  );
  const labCount = useMemo(
    () => slots.filter((s) => s.courseType === "LAB" || s.courseType === "BOTH").length,
    [slots]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Day Filter Toolbar */}
      <div className="no-print bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t(
              "ค้นหารหัสวิชา, ชื่อวิชา, อาจารย์ผู้สอน, ห้องเรียน...",
              "Search course code, name, instructor, room..."
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
          />
        </div>

        {/* Day Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setDayFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              dayFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t("ทุกวัน", "All Days")} ({slots.length})
          </button>
          {DAYS_ORDER.map((day) => {
            const meta = DAY_METADATA[day];
            const daySlots = slots.filter((s) => s.dayOfWeek === day);
            if (daySlots.length === 0) return null;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setDayFilter(day)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  dayFilter === day
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: meta.colorHex }}
                />
                <span>{language === "en" ? meta.shortEn : meta.shortTh}</span>
                <span className="text-[10px] opacity-75">({daySlots.length})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Groups by Day */}
      {activeDays.length > 0 ? (
        <div className="space-y-4">
          {activeDays.map((day) => {
            const meta = DAY_METADATA[day];
            const daySlots = groupedByDay.get(day) || [];
            const dayHours = calculateTotalHours(daySlots);

            return (
              <div
                key={day}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden break-inside-avoid print-break-inside-avoid"
              >
                {/* Day Section Header */}
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shadow-xs shrink-0"
                      style={{ backgroundColor: meta.colorHex }}
                    />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {language === "en" ? meta.en : meta.th}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      ({language === "en" ? meta.shortTh : meta.shortEn})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {t(`${daySlots.length} รายวิชา`, `${daySlots.length} Courses`)}
                    </span>
                    <span>•</span>
                    <span className="font-mono">
                      {dayHours} {t("ชั่วโมง", "Hours")}
                    </span>
                  </div>
                </div>

                {/* Day Courses Table (Desktop) / Cards (Mobile) */}
                <div className="divide-y divide-slate-100">
                  {daySlots.map((slot) => {
                    const theme = getPublicColorTheme(slot.color);
                    const typeMeta =
                      COURSE_TYPE_META[slot.courseType] ||
                      COURSE_TYPE_META.LECTURE;

                    const startMin = timeToMinutes(slot.startTime);
                    const endMin = timeToMinutes(slot.endTime);
                    const durationH = ((endMin - startMin) / 60).toFixed(1);

                    return (
                      <div
                        key={slot.id}
                        className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Left: Time & Course Info */}
                        <div className="flex items-start gap-3 sm:gap-4 flex-1">
                          {/* Left Color Swatch */}
                          <div
                            className={`w-1 self-stretch rounded-full shrink-0 ${theme.accentBar}`}
                          />

                          {/* Time Column */}
                          <div className="shrink-0 min-w-[110px] sm:min-w-[130px]">
                            <div className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold text-slate-900 bg-slate-100/90 px-2.5 py-1 rounded-lg">
                              <Clock className="w-3.5 h-3.5 text-brand-orange" />
                              <span>
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 pl-1">
                              {durationH} {t("ชม.", "hrs")}
                            </div>
                          </div>

                          {/* Details Column */}
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs sm:text-sm font-extrabold text-slate-900">
                                {slot.courseCode}
                              </span>
                              {slot.section && (
                                <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                                  {slot.section}
                                </span>
                              )}
                              <span
                                className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${
                                  slot.courseType === "LAB"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : slot.courseType === "BOTH"
                                    ? "bg-purple-50 text-purple-800 border-purple-300"
                                    : "bg-blue-50 text-blue-800 border-blue-300"
                                }`}
                              >
                                {language === "en" ? typeMeta.en : typeMeta.th}
                              </span>
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                              {slot.courseName}
                            </h4>
                          </div>
                        </div>

                        {/* Right: Room & Instructor */}
                        <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-600 pl-4 md:pl-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                          {/* Room Badge */}
                          <div className="flex items-center gap-1.5 min-w-[100px]">
                            <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                            {slot.room ? (
                              <span className="font-semibold text-slate-900">
                                {slot.room}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">
                                {t("ไม่ระบุห้อง", "No room")}
                              </span>
                            )}
                          </div>

                          {/* Instructor */}
                          <div className="flex items-center gap-1.5 min-w-[120px] max-w-[200px]">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate text-slate-700 font-medium">
                              {slot.instructors && slot.instructors.length > 0
                                ? slot.instructors.join(", ")
                                : t("ไม่ระบุผู้สอน", "No lecturer")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Search / Filter State */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            {t("ไม่พบรายวิชาตามคำค้นหา", "No courses match your search")}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              "ลองเปลี่ยนคำค้นหา หรือกดเลือก 'ทุกวัน' เพื่อดูวิชาทั้งหมด",
              "Try adjusting your search terms or select 'All Days' to see all courses."
            )}
          </p>
        </div>
      )}

      {/* Summary Footer Statistics */}
      {slots.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 shadow-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-brand-orange" />
              <span>
                {t("วิชาทั้งหมด", "Total Courses")}:{" "}
                <strong className="text-slate-900 font-bold">
                  {slots.length}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>
                {t("ทฤษฎี", "Lecture")}:{" "}
                <strong className="text-slate-900 font-bold">
                  {lectureCount}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                {t("ปฏิบัติ", "Lab")}:{" "}
                <strong className="text-slate-900 font-bold">{labCount}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-slate-700">
            <Clock className="w-4 h-4 text-brand-orange" />
            <span>
              {t("เวลารวมในตาราง", "Total Hours")}:{" "}
              <strong className="text-slate-900 font-bold text-sm">
                {totalHours}
              </strong>{" "}
              {t("ชั่วโมง/สัปดาห์", "hrs/week")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
