"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export interface SourceScheduleInfo {
  id: string;
  academicYear: number;
  semester: number;
  degreeLevel: string;
  programName: string;
  yearLevel: number;
  sectionGroup: string | null;
  _count?: { slots: number };
}

interface CloneScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceSchedule: SourceScheduleInfo | null;
  onSuccess?: (clonedSchedule: any) => void;
}

export default function CloneScheduleModal({
  isOpen,
  onClose,
  sourceSchedule,
  onSuccess,
}: CloneScheduleModalProps) {
  const [targetAcademicYear, setTargetAcademicYear] = useState<number>(2568);
  const [targetSemester, setTargetSemester] = useState<number>(1);
  const [targetSectionGroup, setTargetSectionGroup] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize target form fields based on source schedule
  useEffect(() => {
    if (sourceSchedule) {
      // Default to next academic year or next semester
      const nextSem = sourceSchedule.semester === 1 ? 2 : 1;
      const nextYear =
        sourceSchedule.semester === 2
          ? sourceSchedule.academicYear + 1
          : sourceSchedule.academicYear;

      setTargetAcademicYear(nextYear);
      setTargetSemester(nextSem);
      setTargetSectionGroup(sourceSchedule.sectionGroup || "Sec 1");
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [sourceSchedule, isOpen]);

  if (!isOpen || !sourceSchedule) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!targetAcademicYear || isNaN(Number(targetAcademicYear))) {
      setErrorMessage("กรุณาระบุปีการศึกษาเป้าหมายให้ถูกต้อง (Invalid academic year)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/schedules/${sourceSchedule.id}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetAcademicYear: Number(targetAcademicYear),
          targetSemester: Number(targetSemester),
          targetSectionGroup: targetSectionGroup.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 || data.error === "TARGET_SCHEDULE_ALREADY_EXISTS") {
          setErrorMessage(
            "ตารางเรียนเป้าหมายมีอยู่แล้วสำหรับรุ่นนี้ (Target schedule already exists) โปรดเปลี่ยนปีการศึกษา ภาคการศึกษา หรือกลุ่มเรียน"
          );
        } else {
          setErrorMessage(data.error || "ไม่สามารถคัดลอกตารางเรียนได้ กรุณาลองใหม่อีกครั้ง");
        }
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(data.schedule);
      }
      onClose();
    } catch (err: any) {
      console.error("Clone schedule error:", err);
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="clone-modal-title"
    >
      <div className="relative w-full max-w-xl bg-[#1A1B20] text-white border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-[#141518]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h2 id="clone-modal-title" className="text-lg sm:text-xl font-bold text-white leading-tight">
                คัดลอกตารางเรียน (Duplicate Schedule)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ทำสำเนาตารางเรียนพร้อมรายวิชาทั้งหมดไปยังภาคการศึกษาหรือกลุ่มเรียนใหม่
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

        {/* Source Schedule Preview */}
        <div className="p-5 mx-6 mt-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            ตารางเรียนต้นฉบับ (Source Schedule)
          </div>
          <div className="text-sm font-bold text-white leading-snug">
            {sourceSchedule.programName}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-medium">
              ชั้นปีที่ {sourceSchedule.yearLevel}
            </span>
            {sourceSchedule.sectionGroup && (
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-medium">
                {sourceSchedule.sectionGroup}
              </span>
            )}
            <span className="text-slate-400">
              ภาค {sourceSchedule.semester}/{sourceSchedule.academicYear}
            </span>
            {sourceSchedule._count?.slots !== undefined && (
              <span className="px-2 py-0.5 rounded-md bg-brand-orange/20 text-orange-300 border border-brand-orange/30">
                {sourceSchedule._count.slots} รายวิชาที่จะถูกคัดลอก
              </span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs sm:text-sm animate-scale-in">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Target Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>กำหนดข้อมูลเป้าหมายใหม่ (Target Settings)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ปีการศึกษาเป้าหมาย (Target Academic Year) <span className="text-brand-orange">*</span>
              </label>
              <input
                type="number"
                min={2560}
                max={2600}
                value={targetAcademicYear}
                onChange={(e) => setTargetAcademicYear(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ภาคการศึกษาเป้าหมาย (Target Semester) <span className="text-brand-orange">*</span>
              </label>
              <select
                value={targetSemester}
                onChange={(e) => setTargetSemester(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#23242B] border border-white/10 text-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm cursor-pointer"
              >
                <option value={1}>ภาคการศึกษาที่ 1 (Semester 1)</option>
                <option value={2}>ภาคการศึกษาที่ 2 (Semester 2)</option>
                <option value={3}>ภาคฤดูร้อน (Summer)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              กลุ่มเรียน / ตอนเรียนเป้าหมาย (Target Section Group)
            </label>
            <input
              type="text"
              value={targetSectionGroup}
              onChange={(e) => setTargetSectionGroup(e.target.value)}
              placeholder="เช่น Sec 1, Sec 2, ภาคปกติ"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              ตารางเรียนที่คัดลอกจะถูกตั้งค่าเป็น <strong>แบบร่าง (DRAFT)</strong> โดยอัตโนมัติ เพื่อให้ท่านตรวจสอบก่อนเผยแพร่
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs sm:text-sm font-medium transition-all"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังคัดลอก...</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>คัดลอกตารางเรียน</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
