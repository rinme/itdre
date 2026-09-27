"use client";

import React, { useMemo } from "react";
import type { DayOfWeek } from "@prisma/client";
import {
  Clock,
  MapPin,
  User,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
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
  getColorTheme,
  COURSE_TYPE_META,
} from "@/lib/weekly-grid";
import type { CourseSlotData } from "./CourseSlotModal";
import type { ConflictResult } from "@/lib/schedule-conflict";

interface WeeklyGridEditorProps {
  slots: CourseSlotData[];
  conflicts?: ConflictResult[];
  onEditSlot: (slot: CourseSlotData) => void;
  onDeleteSlot: (slot: CourseSlotData) => void;
  onAddSlot: (prefill: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  }) => void;
  className?: string;
}

export default function WeeklyGridEditor({
  slots,
  conflicts = [],
  onEditSlot,
  onDeleteSlot,
  onAddSlot,
  className = "",
}: WeeklyGridEditorProps) {
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
    const map = new Map<DayOfWeek, CourseSlotData[]>();
    DAYS_ORDER.forEach((day) => map.set(day, []));

    slots.forEach((slot) => {
      const list = map.get(slot.dayOfWeek) || [];
      list.push(slot);
      map.set(slot.dayOfWeek, list);
    });

    return map;
  }, [slots]);

  // Set of slot IDs that have conflicts
  const conflictingSlotIds = useMemo(() => {
    const ids = new Set<string>();
    conflicts.forEach((c) => {
      if (c.conflictingSlot.id) ids.add(c.conflictingSlot.id);
    });
    return ids;
  }, [conflicts]);

  // Compute default end time (3 hours after start, or up to 20:00)
  const getDefaultEndTime = (startHour: number): string => {
    const endH = Math.min(GRID_END_HOUR, startHour + 3);
    return `${String(endH).padStart(2, "0")}:00`;
  };

  return (
    <div
      className={`w-full bg-[#1A1B20] border border-white/10 rounded-3xl shadow-xl overflow-hidden ${className}`}
    >
      {/* Top Banner Info */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#141518]/90 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-orange" />
          <span>
            ตารางเวลาเรียนรายสัปดาห์ (08:00 - 20:00 น.) — คลิกช่องว่างเพื่อเพิ่มวิชา
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="hidden sm:inline">
            ทั้งหมด {slots.length} รายวิชา
          </span>
          {conflicts.length > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {conflicts.length} ข้อขัดแย้ง
            </span>
          )}
        </div>
      </div>

      {/* Grid Container (Horizontal scroll on smaller screens) */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px] select-none">
          {/* Day Headers */}
          <div className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-white/10 bg-[#17181C]">
            {/* Time Axis Header */}
            <div className="flex items-center justify-center p-3 text-[11px] font-semibold text-slate-400 border-r border-white/10 uppercase tracking-wider">
              เวลา
            </div>

            {/* 7 Days Headers */}
            {DAYS_ORDER.map((day) => {
              const info = DAY_METADATA[day];
              const daySlots = slotsByDay.get(day) || [];
              return (
                <div
                  key={day}
                  className="p-3 border-r border-white/10 last:border-r-0 text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: info.colorHex }}
                    />
                    <span className="text-xs font-bold text-white">
                      {info.th}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({info.shortEn})
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {daySlots.length > 0
                      ? `${daySlots.length} วิชา`
                      : "ไม่มีการเรียนการสอน"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid Canvas */}
          <div className="relative grid grid-cols-[72px_repeat(7,1fr)] bg-[#141518]">
            {/* Left Time Column (Exactly 12 hourly rows matching the 12 rows of 60px = 720px total) */}
            <div className="relative border-r border-white/10 bg-[#17181C]/70">
              {hourMarkers.map((time) => (
                <div
                  key={time}
                  className="h-[60px] flex items-start justify-center pr-1.5 pt-1 border-b border-white/5 text-[11px] font-mono text-slate-400"
                >
                  <span>{time}</span>
                </div>
              ))}
              {/* Bottom 20:00 marker aligned with the bottom edge (720px) */}
              <div className="absolute bottom-0.5 left-0 right-0 flex justify-center pr-1.5 text-[10px] font-mono text-slate-500 pointer-events-none">
                <span>{`${String(GRID_END_HOUR).padStart(2, "0")}:00`}</span>
              </div>
            </div>

            {/* 7 Day Columns */}
            {DAYS_ORDER.map((day) => {
              const daySlots = slotsByDay.get(day) || [];

              return (
                <div
                  key={day}
                  className="relative border-r border-white/10 last:border-r-0"
                >
                  {/* Background Hourly Click Targets & Lines */}
                  {Array.from({ length: GRID_TOTAL_HOURS }).map((_, hIdx) => {
                    const hour = GRID_START_HOUR + hIdx;
                    const startHStr = `${String(hour).padStart(2, "0")}:00`;
                    const defaultEndStr = getDefaultEndTime(hour);

                    return (
                      <div
                        key={hour}
                        onClick={() =>
                          onAddSlot({
                            dayOfWeek: day,
                            startTime: startHStr,
                            endTime: defaultEndStr,
                          })
                        }
                        className="group relative h-[60px] border-b border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors"
                        title={`คลิกเพื่อเพิ่มรายวิชา ${DAY_METADATA[day].th} ${startHStr} - ${defaultEndStr}`}
                      >
                        {/* 30-minute subtle dashed divider line */}
                        <div className="absolute top-[30px] left-0 right-0 border-b border-white/[0.02]" />

                        {/* Subtle + button on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-orange/20 border border-brand-orange/40 text-[10px] text-brand-orange font-medium shadow-sm">
                            <Plus className="w-3 h-3" />
                            เพิ่มวิชา
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Absolute Slot Cards Layer */}
                  <div className="absolute inset-0 pointer-events-none p-1">
                    {daySlots.map((slot) => {
                      const pos = calculateSlotPosition(
                        slot.startTime,
                        slot.endTime,
                        GRID_START_MINUTES,
                        GRID_TOTAL_MINUTES
                      );

                      const theme = getColorTheme(slot.color);
                      const typeMeta =
                        COURSE_TYPE_META[slot.courseType] ||
                        COURSE_TYPE_META.LECTURE;
                      const hasConflict =
                        slot.id && conflictingSlotIds.has(slot.id);

                      return (
                        <div
                          key={slot.id || `${slot.courseCode}-${slot.startTime}`}
                          style={{
                            top: `${pos.topPercent}%`,
                            height: `${pos.heightPercent}%`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditSlot(slot);
                          }}
                          className={`group absolute left-1 right-1 rounded-xl border p-2 text-left cursor-pointer transition-all duration-150 pointer-events-auto hover:z-20 hover:shadow-2xl overflow-hidden flex flex-col justify-between ${
                            theme.cardBg
                          } ${theme.cardBorder} ${
                            hasConflict
                              ? "ring-2 ring-amber-500 shadow-amber-500/20"
                              : ""
                          }`}
                        >
                          {/* Left Accent Color Strip */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accentBar}`}
                          />

                          {/* Card Content Top */}
                          <div className="pl-1">
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="font-mono text-[11px] font-bold text-white tracking-tight">
                                  {slot.courseCode}
                                </span>
                                {slot.section && (
                                  <span className="rounded bg-black/40 px-1 py-0.2 text-[9px] font-medium text-slate-300">
                                    {slot.section}
                                  </span>
                                )}
                              </div>

                              {/* Hover Quick Action Buttons */}
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded-lg p-0.5 shadow-md">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditSlot(slot);
                                  }}
                                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
                                  title="แก้ไข (Edit)"
                                  aria-label="Edit course slot"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSlot(slot);
                                  }}
                                  className="p-1 rounded text-red-400 hover:text-red-200 hover:bg-red-500/30 transition-colors"
                                  title="ลบ (Delete)"
                                  aria-label="Delete course slot"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Course Name */}
                            <h4
                              className="font-medium text-xs text-white/95 leading-tight line-clamp-2 mt-0.5"
                              title={slot.courseName}
                            >
                              {slot.courseName}
                            </h4>
                          </div>

                          {/* Card Content Bottom: Time, Room, Instructor, Type */}
                          <div className="pl-1 mt-1 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-300 gap-1">
                              <span className="font-mono flex items-center gap-1 font-semibold text-white/90">
                                <Clock className="w-2.5 h-2.5 text-slate-400" />
                                {slot.startTime} - {slot.endTime}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[9px] border font-medium ${typeMeta.badgeClass}`}
                              >
                                {typeMeta.th}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-300 gap-1 flex-wrap">
                              {slot.room ? (
                                <span
                                  className="flex items-center gap-0.5 text-slate-200 font-medium truncate"
                                  title={`ห้อง: ${slot.room}`}
                                >
                                  <MapPin className="w-2.5 h-2.5 text-brand-orange shrink-0" />
                                  <span className="truncate">{slot.room}</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">
                                  ไม่ระบุห้อง
                                </span>
                              )}

                              {slot.instructor && (
                                <span
                                  className="flex items-center gap-0.5 text-slate-300 truncate max-w-[120px]"
                                  title={`ผู้สอน: ${slot.instructor}`}
                                >
                                  <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                  <span className="truncate">
                                    {slot.instructor}
                                  </span>
                                </span>
                              )}
                            </div>

                            {/* Conflict Warning Badge if slot collides */}
                            {hasConflict && (
                              <div className="flex items-center gap-1 rounded bg-amber-500/25 border border-amber-500/40 px-1.5 py-0.5 text-[9px] font-bold text-amber-200">
                                <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-amber-400" />
                                <span className="truncate">มีข้อขัดแย้ง</span>
                              </div>
                            )}
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
