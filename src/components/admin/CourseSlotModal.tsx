"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { DayOfWeek, CourseType } from "@prisma/client";
import {
  X,
  Clock,
  BookOpen,
  MapPin,
  User,
  Hash,
  Palette,
  Loader2,
  Calendar,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  DAYS_ORDER,
  DAY_METADATA,
  COLOR_THEMES,
  COLOR_TOKEN_KEYS,
  COURSE_TYPE_META,
  type ColorToken,
} from "@/lib/weekly-grid";
import {
  detectCourseSlotConflicts,
  type ExistingSlot,
  type ConflictResult,
} from "@/lib/schedule-conflict";
import ConflictBanner from "./ConflictBanner";

export interface CourseSlotData {
  id?: string;
  scheduleId?: string;
  courseCode: string;
  courseName: string;
  section?: string | null;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string | null;
  instructor?: string | null;
  courseType: CourseType;
  color?: string | null;
}

interface CourseSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  existingSlots: ExistingSlot[];
  slot?: CourseSlotData | null;
  initialSlot?: {
    dayOfWeek?: DayOfWeek;
    startTime?: string;
    endTime?: string;
  } | null;
  onSuccess: (savedSlot: CourseSlotData, conflicts: ConflictResult[]) => void;
}

const COMMON_TIME_PRESETS = [
  { label: "09:00 - 12:00 (3 ชม.)", start: "09:00", end: "12:00" },
  { label: "13:00 - 16:00 (3 ชม.)", start: "13:00", end: "16:00" },
  { label: "09:00 - 16:00 (ทั้งวัน)", start: "09:00", end: "16:00" },
  { label: "16:30 - 19:30 (ภาคค่ำ)", start: "16:30", end: "19:30" },
];

export default function CourseSlotModal({
  isOpen,
  onClose,
  scheduleId,
  existingSlots,
  slot,
  initialSlot,
  onSuccess,
}: CourseSlotModalProps) {
  const isEditMode = Boolean(slot?.id);

  // Form State
  const [courseCode, setCourseCode] = useState<string>("");
  const [courseName, setCourseName] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("MONDAY");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("12:00");
  const [room, setRoom] = useState<string>("");
  const [instructor, setInstructor] = useState<string>("");
  const [courseType, setCourseType] = useState<CourseType>("LECTURE");
  const [color, setColor] = useState<ColorToken>("orange");

  // Status state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize or reset form values when opening modal
  useEffect(() => {
    if (!isOpen) return;

    if (slot) {
      setCourseCode(slot.courseCode || "");
      setCourseName(slot.courseName || "");
      setSection(slot.section || "");
      setDayOfWeek(slot.dayOfWeek || "MONDAY");
      setStartTime(slot.startTime || "09:00");
      setEndTime(slot.endTime || "12:00");
      setRoom(slot.room || "");
      setInstructor(slot.instructor || "");
      setCourseType(slot.courseType || "LECTURE");
      setColor((slot.color as ColorToken) || "orange");
    } else {
      setCourseCode("");
      setCourseName("");
      setSection("");
      setDayOfWeek(initialSlot?.dayOfWeek || "MONDAY");
      setStartTime(initialSlot?.startTime || "09:00");
      setEndTime(initialSlot?.endTime || "12:00");
      setRoom("");
      setInstructor("");
      setCourseType("LECTURE");
      setColor("orange");
    }
    setFormError(null);
  }, [isOpen, slot, initialSlot]);

  // Live Conflict Detection
  const liveConflicts = useMemo<ConflictResult[]>(() => {
    if (!startTime || !endTime || startTime >= endTime) return [];

    const candidate = {
      id: slot?.id,
      dayOfWeek,
      startTime,
      endTime,
      room: room.trim() || null,
    };

    return detectCourseSlotConflicts(candidate, existingSlots);
  }, [slot?.id, dayOfWeek, startTime, endTime, room, existingSlots]);

  // Time validity check
  const isTimeRangeValid = Boolean(
    startTime && endTime && startTime < endTime
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!courseCode.trim()) {
      setFormError("กรุณาระบุรหัสวิชา (Course code is required)");
      return;
    }
    if (!courseName.trim()) {
      setFormError("กรุณาระบุชื่อวิชา (Course name is required)");
      return;
    }
    if (!isTimeRangeValid) {
      setFormError("ช่วงเวลาไม่ถูกต้อง: เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        section: section.trim() || null,
        dayOfWeek,
        startTime,
        endTime,
        room: room.trim() || null,
        instructor: instructor.trim() || null,
        courseType,
        color,
      };

      const url = isEditMode
        ? `/api/admin/schedules/${scheduleId}/slots/${slot!.id}`
        : `/api/admin/schedules/${scheduleId}/slots`;

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูลรายวิชา");
      }

      onSuccess(data.slot, data.conflicts || []);
      onClose();
    } catch (err: any) {
      setFormError(err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-slot-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#1A1B20] text-white border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-[#141518]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="course-slot-modal-title"
                className="text-lg sm:text-xl font-bold text-white leading-tight"
              >
                {isEditMode
                  ? "แก้ไขข้อมูลรายวิชา (Edit Course Slot)"
                  : "เพิ่มรายวิชาในตารางเรียน (Add Course Slot)"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                กำหนดวัน เวลา ห้องเรียน และรายละเอียดรายวิชา
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Conflict Warning Banner inside modal */}
        {liveConflicts.length > 0 && (
          <div className="mx-5 sm:mx-6 mt-5">
            <ConflictBanner
              conflicts={liveConflicts}
              compact
              title={`พบข้อขัดแย้งกับวิชาอื่น (${liveConflicts.length} จุด)`}
            />
          </div>
        )}

        {/* Form Error alert */}
        {formError && (
          <div className="mx-5 sm:mx-6 mt-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{formError}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Day of Week Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              วันในสัปดาห์ (Day of Week) <span className="text-brand-orange">*</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {DAYS_ORDER.map((day) => {
                const info = DAY_METADATA[day];
                const isSelected = dayOfWeek === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setDayOfWeek(day)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? "bg-white/15 border-brand-orange text-white ring-2 ring-brand-orange/40 font-bold shadow-md"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full mb-1"
                      style={{ backgroundColor: info.colorHex }}
                    />
                    <span className="text-[11px] leading-tight font-semibold">
                      {info.shortTh}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {info.shortEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time pickers: Start Time & End Time */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-orange" />
                เวลาเรียน (Start & End Time) <span className="text-brand-orange">*</span>
              </span>
              {!isTimeRangeValid && (
                <span className="text-[11px] text-red-400">
                  เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  เวลาเริ่มต้น (Start Time)
                </label>
                <input
                  type="time"
                  required
                  step="900"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141518] border border-white/15 text-white text-sm focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  เวลาสิ้นสุด (End Time)
                </label>
                <input
                  type="time"
                  required
                  step="900"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl bg-[#141518] border text-white text-sm focus:outline-none transition-colors ${
                    !isTimeRangeValid
                      ? "border-red-500 focus:border-red-500"
                      : "border-white/15 focus:border-brand-orange"
                  }`}
                />
              </div>
            </div>

            {/* Quick time presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 mr-1">ทางลัดช่วงเวลา:</span>
              {COMMON_TIME_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setStartTime(preset.start);
                    setEndTime(preset.end);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Course Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                รหัสวิชา (Course Code) <span className="text-brand-orange">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="เช่น 060133101"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ชื่อวิชา (Course Name) <span className="text-brand-orange">*</span>
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="เช่น Web Application Development"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section & Room & Instructor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                กลุ่มเรียน (Section)
              </label>
              <input
                type="text"
                placeholder="เช่น Sec 1 หรือ กลุ่ม 1"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ห้องเรียน (Room)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="เช่น 79-5A02"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ผู้สอน (Instructor)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="เช่น ดร. อานนท์ วงศ์สมบูรณ์"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Course Type (LECTURE, LAB, BOTH) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ประเภทการเรียนการสอน (Course Type)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["LECTURE", "LAB", "BOTH"] as CourseType[]).map((type) => {
                const meta = COURSE_TYPE_META[type];
                const isSelected = courseType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCourseType(type)}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium text-center transition-all ${
                      isSelected
                        ? `${meta.badgeClass} ring-2 ring-brand-orange/40 font-bold bg-white/15`
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <div>{meta.th}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {meta.en}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Theme Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-brand-orange" />
              โทนสีการแสดงผล (Color Theme Token)
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_TOKEN_KEYS.map((token) => {
                const theme = COLOR_THEMES[token];
                const isSelected = color === token;
                return (
                  <button
                    key={token}
                    type="button"
                    onClick={() => setColor(token)}
                    title={theme.label}
                    className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? "bg-white/15 border-white/40 ring-2 ring-white/30 text-white font-semibold"
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full ${theme.swatchBg} flex items-center justify-center`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span className="capitalize">{token}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            >
              ยกเลิก (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isTimeRangeValid}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-medium text-sm shadow-lg shadow-brand-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : isEditMode ? (
                "บันทึกการแก้ไข (Update Slot)"
              ) : (
                "เพิ่มรายวิชา (Add Slot)"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
