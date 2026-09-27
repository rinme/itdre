"use client";

import React, { useState, useMemo } from "react";
import type { DayOfWeek } from "@prisma/client";
import {
  Search,
  Clock,
  MapPin,
  User,
  Edit2,
  Trash2,
  AlertTriangle,
  Plus,
  BookOpen,
} from "lucide-react";
import {
  DAYS_ORDER,
  DAY_METADATA,
  sortCourseSlots,
  getColorTheme,
  COURSE_TYPE_META,
} from "@/lib/weekly-grid";
import type { CourseSlotData } from "./CourseSlotModal";
import type { ConflictResult } from "@/lib/schedule-conflict";

interface ScheduleTableViewProps {
  slots: CourseSlotData[];
  conflicts?: ConflictResult[];
  onEditSlot: (slot: CourseSlotData) => void;
  onDeleteSlot: (slot: CourseSlotData) => void;
  onAddSlot?: () => void;
  className?: string;
}

export default function ScheduleTableView({
  slots,
  conflicts = [],
  onEditSlot,
  onDeleteSlot,
  onAddSlot,
  className = "",
}: ScheduleTableViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("ALL");

  // Conflicting slot IDs set
  const conflictingSlotIds = useMemo(() => {
    const ids = new Set<string>();
    conflicts.forEach((c) => {
      if (c.conflictingSlot.id) ids.add(c.conflictingSlot.id);
    });
    return ids;
  }, [conflicts]);

  // Filtered and sorted slots
  const filteredSlots = useMemo(() => {
    let result = sortCourseSlots(slots);

    if (selectedDay !== "ALL") {
      result = result.filter((s) => s.dayOfWeek === selectedDay);
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
  }, [slots, selectedDay, searchQuery]);

  return (
    <div
      className={`bg-[#1A1B20] border border-white/10 rounded-3xl shadow-xl overflow-hidden ${className}`}
    >
      {/* Top Filter and Search Bar */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-[#141518]/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหารหัสวิชา, ชื่อวิชา, ผู้สอน, ห้องเรียน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-brand-orange transition-colors"
          />
        </div>

        {/* Day Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedDay("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedDay === "ALL"
                ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20"
                : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            ทุกวัน ({slots.length})
          </button>
          {DAYS_ORDER.map((day) => {
            const count = slots.filter((s) => s.dayOfWeek === day).length;
            const info = DAY_METADATA[day];
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-white/20 border border-white/30 text-white shadow-md"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: info.colorHex }}
                />
                <span>{info.shortTh}</span>
                {count > 0 && (
                  <span className="text-[10px] text-slate-400">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-[#17181C] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">วัน</th>
              <th className="py-3 px-4">เวลา</th>
              <th className="py-3 px-4">รหัสวิชา</th>
              <th className="py-3 px-4">ชื่อรายวิชา</th>
              <th className="py-3 px-3">กลุ่ม</th>
              <th className="py-3 px-3">ประเภท</th>
              <th className="py-3 px-4">ห้องเรียน</th>
              <th className="py-3 px-4">ผู้สอน</th>
              <th className="py-3 px-4 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {filteredSlots.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BookOpen className="w-8 h-8 text-slate-600" />
                    <p className="text-sm">
                      {searchQuery || selectedDay !== "ALL"
                        ? "ไม่พบรายวิชาที่ตรงกับเงื่อนไขการค้นหา"
                        : "ยังไม่มีรายวิชาในตารางเรียนนี้"}
                    </p>
                    {onAddSlot && !searchQuery && selectedDay === "ALL" && (
                      <button
                        type="button"
                        onClick={onAddSlot}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-orange text-white text-xs font-medium hover:bg-orange-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        เพิ่มรายวิชาแรก
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredSlots.map((slot) => {
                const dayInfo = DAY_METADATA[slot.dayOfWeek];
                const typeMeta =
                  COURSE_TYPE_META[slot.courseType] || COURSE_TYPE_META.LECTURE;
                const theme = getColorTheme(slot.color);
                const hasConflict =
                  slot.id && conflictingSlotIds.has(slot.id);

                return (
                  <tr
                    key={slot.id || `${slot.courseCode}-${slot.startTime}`}
                    className={`hover:bg-white/[0.03] transition-colors ${
                      hasConflict ? "bg-amber-500/5" : ""
                    }`}
                  >
                    {/* Day */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${dayInfo.badgeBg} ${dayInfo.badgeText} ${dayInfo.borderClass}`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: dayInfo.colorHex }}
                        />
                        {dayInfo.th}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                      <div className="flex items-center gap-1.5 text-white">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${theme.swatchBg}`}
                        />
                        <span className="font-mono font-bold text-white">
                          {slot.courseCode}
                        </span>
                        {hasConflict && (
                          <span
                            className="inline-flex items-center text-amber-400"
                            title="มีข้อขัดแย้งเวลาหรือห้องเรียน"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Course Name */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-white line-clamp-2">
                        {slot.courseName}
                      </div>
                    </td>

                    {/* Section */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {slot.section ? (
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-xs">
                          {slot.section}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-medium ${typeMeta.badgeClass}`}
                      >
                        {typeMeta.th}
                      </span>
                    </td>

                    {/* Room */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {slot.room ? (
                        <span className="inline-flex items-center gap-1 text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                          <span>{slot.room}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">ไม่ระบุ</span>
                      )}
                    </td>

                    {/* Instructor */}
                    <td className="py-3.5 px-4 max-w-[180px] truncate">
                      {slot.instructors && slot.instructors.length > 0 ? (
                        <span
                          className="inline-flex items-center gap-1 text-slate-300 truncate"
                          title={slot.instructors.join(", ")}
                        >
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{slot.instructors.join(", ")}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditSlot(slot)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                          title="แก้ไขรายวิชา"
                          aria-label="Edit course slot"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSlot(slot)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-200 hover:bg-red-500/20 transition-colors"
                          title="ลบรายวิชา"
                          aria-label="Delete course slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
