"use client";

import React, { useMemo } from "react";
import type { DayOfWeek, CourseType } from "@prisma/client";
import {
  Clock,
  MapPin,
  User,
  BookOpen,
  Calendar,
} from "lucide-react";
import {
  DAYS_ORDER,
  DAY_METADATA,
  GRID_START_HOUR,
  GRID_END_HOUR,
  GRID_TOTAL_HOURS,
  GRID_START_MINUTES,
  GRID_TOTAL_MINUTES,
  calculateSlotPosition,
  getPublicColorTheme,
  COURSE_TYPE_META,
} from "@/lib/weekly-grid";
import { useLanguage } from "@/context/LanguageContext";

export interface PublicCourseSlot {
  id: string;
  courseCode: string;
  courseName: string;
  section?: string | null;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string | null;
  instructors?: string[] | null;
  courseType: CourseType;
  color?: string | null;
}

interface WeeklyTimetableGridProps {
  slots: PublicCourseSlot[];
  className?: string;
  onSlotClick?: (slot: PublicCourseSlot) => void;
}

export default function WeeklyTimetableGrid({
  slots,
  className = "",
  onSlotClick,
}: WeeklyTimetableGridProps) {
  const { language, t } = useLanguage();

  // Generate hour markers for the 12 hourly intervals (08:00 to 19:00)
  const hourMarkers = useMemo(() => {
    const list: string[] = [];
    for (let h = GRID_START_HOUR; h < GRID_END_HOUR; h++) {
      list.push(`${String(h).padStart(2, "0")}:00`);
    }
    return list;
  }, []);

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

  return (
    <div
      className={`w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden printable-grid-container ${className}`}
    >
      {/* Top Info Bar */}
      <div className="no-print flex items-center justify-between px-5 py-3.5 border-b border-slate-200/90 bg-slate-50/80 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-orange" />
          <span className="font-medium">
            {t(
              "ตารางเรียนรายสัปดาห์ (08:00 - 20:00 น.)",
              "Weekly Class Schedule (08:00 - 20:00)"
            )}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-mono">
            {t(`รวมทั้งหมด ${slots.length} รายวิชา`, `Total ${slots.length} Courses`)}
          </span>
        </div>
      </div>

      {/* Grid Canvas with Horizontal Scroll for Tablet/Smaller Desktop */}
      <div className="overflow-x-auto">
        <div className="min-w-[1050px] select-none">
          {/* Day Headers (7 Days + Time Axis) */}
          <div className="grid grid-cols-[76px_repeat(7,1fr)] border-b border-slate-200 bg-slate-100/90 text-slate-700">
            {/* Time Axis Header */}
            <div className="flex items-center justify-center p-3 text-[11px] font-bold text-slate-500 border-r border-slate-200 uppercase tracking-wider">
              {t("เวลา", "Time")}
            </div>

            {/* 7 Day Columns */}
            {DAYS_ORDER.map((day) => {
              const meta = DAY_METADATA[day];
              const daySlots = slotsByDay.get(day) || [];

              return (
                <div
                  key={day}
                  className="p-3 border-r border-slate-200 last:border-r-0 text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: meta.colorHex }}
                    />
                    <span className="text-xs font-bold text-slate-900">
                      {language === "en" ? meta.en : meta.th}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ({language === "en" ? meta.shortTh : meta.shortEn})
                    </span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                    {daySlots.length > 0
                      ? t(`${daySlots.length} วิชา`, `${daySlots.length} Courses`)
                      : t("ไม่มีเรียน", "No class")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid Rows Canvas */}
          <div className="relative grid grid-cols-[76px_repeat(7,1fr)] bg-white">
            {/* Left Time Column (Exactly 12 hourly rows matching 12 rows of 60px = 720px total) */}
            <div className="relative border-r border-slate-200 bg-slate-50/70 select-none">
              {hourMarkers.map((time) => (
                <div
                  key={time}
                  className="h-[60px] flex items-start justify-center pr-1.5 pt-1.5 border-b border-slate-200/70 text-[11px] font-mono text-slate-500 font-medium"
                >
                  <span>{time}</span>
                </div>
              ))}
              {/* Bottom 20:00 marker aligned with the bottom edge (720px) */}
              <div className="absolute bottom-0.5 left-0 right-0 flex justify-center pr-1.5 text-[10px] font-mono text-slate-400 pointer-events-none">
                <span>{`${String(GRID_END_HOUR).padStart(2, "0")}:00`}</span>
              </div>
            </div>

            {/* 7 Day Matrix Columns */}
            {DAYS_ORDER.map((day) => {
              const daySlots = slotsByDay.get(day) || [];

              return (
                <div
                  key={day}
                  className="relative border-r border-slate-200 last:border-r-0"
                >
                  {/* Background Hourly Rows and 30-min subtle lines */}
                  {Array.from({ length: GRID_TOTAL_HOURS }).map((_, hIdx) => {
                    const hour = GRID_START_HOUR + hIdx;
                    return (
                      <div
                        key={hour}
                        className="relative h-[60px] border-b border-slate-200/60 transition-colors"
                      >
                        {/* 30-minute subtle dashed divider line */}
                        <div className="absolute top-[30px] left-0 right-0 border-b border-dashed border-slate-200/40 pointer-events-none" />
                      </div>
                    );
                  })}

                  {/* Absolute Course Slot Cards */}
                  <div className="absolute inset-0 pointer-events-none p-1">
                    {daySlots.map((slot) => {
                      const pos = calculateSlotPosition(
                        slot.startTime,
                        slot.endTime,
                        GRID_START_MINUTES,
                        GRID_TOTAL_MINUTES
                      );

                      const theme = getPublicColorTheme(slot.color);
                      const typeMeta =
                        COURSE_TYPE_META[slot.courseType] ||
                        COURSE_TYPE_META.LECTURE;

                      return (
                        <div
                          key={slot.id}
                          style={{
                            top: `${pos.topPercent}%`,
                            height: `${pos.heightPercent}%`,
                          }}
                          onClick={() => onSlotClick && onSlotClick(slot)}
                          className={`group absolute left-1 right-1 rounded-xl border p-2 text-left transition-all duration-150 pointer-events-auto hover:z-20 hover:shadow-lg overflow-hidden flex flex-col justify-between break-inside-avoid print-break-inside-avoid ${
                            theme.cardBg
                          } ${theme.cardBorder} ${
                            onSlotClick ? "cursor-pointer" : "cursor-default"
                          }`}
                        >
                          {/* Left Accent Bar */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accentBar}`}
                          />

                          {/* Top: Course Code, Section, Type Badge */}
                          <div className="pl-1">
                            <div className="flex items-start justify-between gap-1 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[11px] font-extrabold text-slate-900 tracking-tight">
                                  {slot.courseCode}
                                </span>
                                {slot.section && (
                                  <span className="rounded-md bg-white/80 border border-slate-300/80 px-1.5 py-0.2 text-[9px] font-bold text-slate-700">
                                    {slot.section}
                                  </span>
                                )}
                              </div>

                              <span
                                className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                                  slot.courseType === "LAB"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : slot.courseType === "BOTH"
                                    ? "bg-purple-100 text-purple-800 border border-purple-300"
                                    : "bg-blue-100 text-blue-800 border border-blue-300"
                                }`}
                              >
                                {language === "en" ? typeMeta.en : typeMeta.th}
                              </span>
                            </div>

                            {/* Course Title */}
                            <h4
                              className="font-bold text-xs text-slate-900 leading-tight line-clamp-2 mt-1"
                              title={slot.courseName}
                            >
                              {slot.courseName}
                            </h4>
                          </div>

                          {/* Bottom: Time, Room, Instructor */}
                          <div className="pl-1 mt-1 space-y-1">
                            {/* Time Badge */}
                            <div className="flex items-center gap-1 font-mono text-[10px] font-semibold text-slate-700">
                              <Clock className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                              <span>
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>

                            {/* Room & Instructor Badges */}
                            <div className="flex items-center justify-between text-[10px] text-slate-600 gap-1 flex-wrap">
                              {slot.room ? (
                                <span
                                  className="flex items-center gap-0.5 font-medium text-slate-800 truncate"
                                  title={`ห้อง: ${slot.room}`}
                                >
                                  <MapPin className="w-2.5 h-2.5 text-brand-orange shrink-0" />
                                  <span className="truncate">{slot.room}</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 italic text-[9px]">
                                  {t("ไม่ระบุห้อง", "No room")}
                                </span>
                              )}

                              {slot.instructors && slot.instructors.length > 0 && (
                                <span
                                  className="flex items-center gap-0.5 text-slate-700 truncate max-w-[130px]"
                                  title={`อาจารย์ผู้สอน: ${slot.instructors.join(", ")}`}
                                >
                                  <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                  <span className="truncate">
                                    {slot.instructors.join(", ")}
                                  </span>
                                </span>
                              )}
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
        </div>
      </div>
    </div>
  );
}
