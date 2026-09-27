"use client";

import React, { useMemo } from "react";
import type { DayOfWeek } from "@prisma/client";
import {
  Clock,
  MapPin,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  DAYS_ORDER,
  DAY_METADATA,
  sortCourseSlots,
  getPublicColorTheme,
  COURSE_TYPE_META,
  timeToMinutes,
} from "@/lib/weekly-grid";
import { useLanguage } from "@/context/LanguageContext";
import type { PublicCourseSlot } from "./WeeklyTimetableGrid";

interface MobileDayViewProps {
  slots: PublicCourseSlot[];
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  className?: string;
}

export default function MobileDayView({
  slots,
  selectedDay,
  onSelectDay,
  className = "",
}: MobileDayViewProps) {
  const { language, t } = useLanguage();

  // Map slots by day
  const slotsByDay = useMemo(() => {
    const map = new Map<DayOfWeek, PublicCourseSlot[]>();
    DAYS_ORDER.forEach((day) => map.set(day, []));

    slots.forEach((slot) => {
      const list = map.get(slot.dayOfWeek) || [];
      list.push(slot);
      map.set(slot.dayOfWeek, list);
    });

    return map;
  }, [slots]);

  // Current day slots sorted chronologically
  const currentDaySlots = useMemo(() => {
    const daySlots = slotsByDay.get(selectedDay) || [];
    return sortCourseSlots(daySlots);
  }, [slotsByDay, selectedDay]);

  const activeDayMeta = DAY_METADATA[selectedDay] || DAY_METADATA.MONDAY;
  const currentDayIndex = DAYS_ORDER.indexOf(selectedDay);

  const handlePrevDay = () => {
    const nextIdx = (currentDayIndex - 1 + DAYS_ORDER.length) % DAYS_ORDER.length;
    onSelectDay(DAYS_ORDER[nextIdx]);
  };

  const handleNextDay = () => {
    const nextIdx = (currentDayIndex + 1) % DAYS_ORDER.length;
    onSelectDay(DAYS_ORDER[nextIdx]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Day Selector Pills Bar */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/90 shadow-xs p-2">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {DAYS_ORDER.map((day) => {
            const meta = DAY_METADATA[day];
            const dayCount = (slotsByDay.get(day) || []).length;
            const isActive = selectedDay === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => onSelectDay(day)}
                className={`relative flex-1 min-w-[48px] py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md scale-102"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {/* Day Color Accent Indicator */}
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: meta.colorHex }}
                />

                {/* Day Short Name */}
                <span className="text-xs font-bold leading-tight">
                  {language === "en" ? meta.shortEn : meta.shortTh}
                </span>

                {/* Course Count Pill */}
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : dayCount > 0
                      ? "bg-orange-100 text-brand-orange"
                      : "text-slate-400"
                  }`}
                >
                  {dayCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Header & Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevDay}
          className="no-print p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title={t("วันก่อนหน้า", "Previous day")}
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shadow-xs"
              style={{ backgroundColor: activeDayMeta.colorHex }}
            />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {language === "en" ? activeDayMeta.en : activeDayMeta.th}
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-500 mt-0.5">
            {currentDaySlots.length > 0
              ? t(
                  `มีการเรียนการสอน ${currentDaySlots.length} รายวิชา`,
                  `${currentDaySlots.length} courses scheduled`
                )
              : t("ไม่มีการเรียนการสอนในวันนี้", "No classes scheduled")}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          className="no-print p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title={t("วันถัดไป", "Next day")}
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Chronological Course Cards for Selected Day */}
      {currentDaySlots.length > 0 ? (
        <div className="space-y-3">
          {currentDaySlots.map((slot) => {
            const theme = getPublicColorTheme(slot.color);
            const typeMeta =
              COURSE_TYPE_META[slot.courseType] || COURSE_TYPE_META.LECTURE;

            // Calculate duration in hours
            const startMin = timeToMinutes(slot.startTime);
            const endMin = timeToMinutes(slot.endTime);
            const durationH = ((endMin - startMin) / 60).toFixed(1);

            return (
              <div
                key={slot.id}
                className={`relative bg-white rounded-2xl border ${theme.cardBorder} p-4 sm:p-5 shadow-xs overflow-hidden transition-all hover:shadow-md break-inside-avoid print-break-inside-avoid`}
              >
                {/* Left Color Accent Bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.accentBar}`}
                />

                <div className="pl-1 sm:pl-2 space-y-2.5">
                  {/* Row 1: Time Badge & Course Type */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-mono font-bold">
                      <Clock className="w-3.5 h-3.5 text-brand-orange" />
                      <span>
                        {slot.startTime} - {slot.endTime} น.
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        ({durationH} {t("ชม.", "hrs")})
                      </span>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
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

                  {/* Row 2: Course Code & Section */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                      {slot.courseCode}
                    </span>
                    {slot.section && (
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                        {slot.section}
                      </span>
                    )}
                  </div>

                  {/* Row 3: Course Title */}
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {slot.courseName}
                  </h4>

                  {/* Row 4: Room & Instructor */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                    {slot.room ? (
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                        <span>
                          {t("ห้องเรียน", "Room")}:{" "}
                          <strong className="font-semibold text-slate-900">
                            {slot.room}
                          </strong>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400 italic">
                        <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>{t("ไม่ระบุห้องเรียน", "No room assigned")}</span>
                      </div>
                    )}

                    {slot.instructors && slot.instructors.length > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {t("ผู้สอน", "Lecturer")}: {slot.instructors.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Day State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-700">
            {t("ไม่มีตารางเรียนในวันนี้", "No classes on this day")}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {t(
              `ไม่มีรายวิชาที่ต้องเข้าเรียนใน${activeDayMeta.th} คุณสามารถเลือกดูวันอื่นๆ จากแถบด้านบน`,
              `There are no scheduled courses on ${activeDayMeta.en}. Select other days from the bar above.`
            )}
          </p>
        </div>
      )}
    </div>
  );
}
