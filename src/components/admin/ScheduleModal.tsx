"use client";

import React, { useState, useEffect, useMemo } from "react";
import { programs } from "@/data/programs";
import type { DegreeLevel, ScheduleStatus } from "@prisma/client";
import {
  X,
  Calendar,
  AlertCircle,
  Loader2,
  BookOpen,
  GraduationCap,
  Layers,
  FileText,
  CheckCircle2,
} from "lucide-react";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newSchedule: any) => void;
  defaultAcademicYear?: number;
  defaultSemester?: number;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSuccess,
  defaultAcademicYear = 2567,
  defaultSemester = 1,
}: ScheduleModalProps) {
  const [academicYear, setAcademicYear] = useState<number>(defaultAcademicYear);
  const [semester, setSemester] = useState<number>(defaultSemester);
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>("BACHELOR");
  const [programId, setProgramId] = useState<string>("");
  const [yearLevel, setYearLevel] = useState<number>(1);
  const [sectionGroup, setSectionGroup] = useState<string>("Sec 1");
  const [status, setStatus] = useState<ScheduleStatus>("DRAFT");
  const [note, setNote] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter programs dynamically according to selected degree level
  const filteredPrograms = useMemo(() => {
    const degreeStr = degreeLevel.toLowerCase();
    return programs.filter((p) => p.degree.toLowerCase() === degreeStr);
  }, [degreeLevel]);

  // When filtered programs change, ensure selected programId is valid
  useEffect(() => {
    if (filteredPrograms.length > 0) {
      const match = filteredPrograms.find((p) => p.id === programId);
      if (!match) {
        setProgramId(filteredPrograms[0].id);
      }
    }
  }, [filteredPrograms, programId]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const selectedProg = programs.find((p) => p.id === programId);
    if (!selectedProg) {
      setErrorMessage("กรุณาเลือกหลักสูตรการศึกษา (Please select a program)");
      return;
    }

    if (!academicYear || isNaN(Number(academicYear))) {
      setErrorMessage("กรุณาระบุปีการศึกษาให้ถูกต้อง (Invalid academic year)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: Number(academicYear),
          semester: Number(semester),
          degreeLevel,
          programId: selectedProg.id,
          programName: selectedProg.titleTh,
          yearLevel: Number(yearLevel),
          sectionGroup: sectionGroup.trim() || null,
          status,
          note: note.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 || data.error === "SCHEDULE_ALREADY_EXISTS") {
          setErrorMessage(
            "มีตารางเรียนสำหรับรุ่นนี้อยู่แล้ว (Schedule already exists for this cohort): โปรดตรวจสอบปีการศึกษา ภาคการศึกษา หลักสูตร ชั้นปี และกลุ่มเรียน"
          );
        } else {
          setErrorMessage(data.error || "ไม่สามารถสร้างตารางเรียนได้ กรุณาลองใหม่อีกครั้ง");
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
      console.error("Create schedule error:", err);
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#1A1B20] text-white border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-[#141518]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 id="schedule-modal-title" className="text-lg sm:text-xl font-bold text-white leading-tight">
                สร้างตารางเรียนใหม่ (Create Schedule)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                กำหนดข้อมูลหลักสูตร ปีการศึกษา และรุ่นนักศึกษาสำหรับตารางเรียน
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs sm:text-sm animate-scale-in">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Academic Year & Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ปีการศึกษา (Academic Year) <span className="text-brand-orange">*</span>
              </label>
              <input
                type="number"
                min={2560}
                max={2600}
                value={academicYear}
                onChange={(e) => setAcademicYear(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm"
                placeholder="เช่น 2567, 2568"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ภาคการศึกษา (Semester) <span className="text-brand-orange">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#23242B] border border-white/10 text-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm cursor-pointer"
              >
                <option value={1}>ภาคการศึกษาที่ 1 (Semester 1)</option>
                <option value={2}>ภาคการศึกษาที่ 2 (Semester 2)</option>
                <option value={3}>ภาคฤดูร้อน (Summer Session)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Degree Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ระดับการศึกษา (Degree Level) <span className="text-brand-orange">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "BACHELOR", labelTh: "ปริญญาตรี", labelEn: "Bachelor" },
                  { value: "MASTER", labelTh: "ปริญญาโท", labelEn: "Master" },
                  { value: "DOCTOR", labelTh: "ปริญญาเอก", labelEn: "Doctor" },
                ] as const
              ).map((deg) => (
                <button
                  key={deg.value}
                  type="button"
                  onClick={() => setDegreeLevel(deg.value)}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-medium border text-center transition-all ${
                    degreeLevel === deg.value
                      ? "bg-brand-orange text-white border-brand-orange shadow-md shadow-orange-500/20 font-semibold"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div>{deg.labelTh}</div>
                  <div className="text-[10px] opacity-80">{deg.labelEn}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Program Selector (Filtered from programs.ts) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              หลักสูตร / สาขาวิชา (Program) <span className="text-brand-orange">*</span>
            </label>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#23242B] border border-white/10 text-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm cursor-pointer"
            >
              {filteredPrograms.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.titleTh} ({prog.duration})
                </option>
              ))}
            </select>
          </div>

          {/* Row 4: Year Level & Section Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ชั้นปีที่ (Study Year) <span className="text-brand-orange">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setYearLevel(yr)}
                    className={`py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      yearLevel === yr
                        ? "bg-brand-orange text-white border-brand-orange shadow-sm"
                        : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    ปี {yr}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                กลุ่มเรียน / ตอนเรียน (Section Group)
              </label>
              <input
                type="text"
                value={sectionGroup}
                onChange={(e) => setSectionGroup(e.target.value)}
                placeholder="เช่น Sec 1, ภาคปกติ, เสาร์-อาทิตย์"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm"
              />
            </div>
          </div>

          {/* Row 5: Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              สถานะตารางเรียนเริ่มต้น (Initial Status)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("DRAFT")}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  status === "DRAFT"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs"
                    : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>แบบร่าง (Draft)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("PUBLISHED")}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                  status === "PUBLISHED"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs"
                    : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>เผยแพร่ทันที (Published)</span>
              </button>
            </div>
          </div>

          {/* Row 6: Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              หมายเหตุ / ข้อมูลเพิ่มเติม (Note - Optional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ระบุข้อความเพิ่มเติมหรือบันทึกภายในสำหรับตารางเรียนนี้..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all text-sm resize-none"
            />
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
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-darkOrange hover:opacity-90 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>สร้างตารางเรียน</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
