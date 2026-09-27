"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { DegreeLevel, ScheduleStatus, DayOfWeek } from "@prisma/client";
import {
  Calendar,
  ChevronLeft,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  GraduationCap,
  Layers,
  FileText,
  ExternalLink,
  Loader2,
  Trash2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import WeeklyGridEditor from "@/components/admin/WeeklyGridEditor";
import ScheduleTableView from "@/components/admin/ScheduleTableView";
import CourseSlotModal, {
  type CourseSlotData,
} from "@/components/admin/CourseSlotModal";
import ConflictBanner from "@/components/admin/ConflictBanner";
import {
  detectAllScheduleConflicts,
  type ExistingSlot,
  type ConflictResult,
} from "@/lib/weekly-grid";

interface ScheduleDetails {
  id: string;
  academicYear: number;
  semester: number;
  degreeLevel: DegreeLevel;
  programId: string;
  programName: string;
  yearLevel: number;
  sectionGroup: string | null;
  status: ScheduleStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  slots: CourseSlotData[];
}

export default function AdminScheduleEditorPage() {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params?.id as string;

  // Schedule and slots state
  const [schedule, setSchedule] = useState<ScheduleDetails | null>(null);
  const [slots, setSlots] = useState<CourseSlotData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // View mode: "grid" | "table"
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Status toggle loading state
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);

  // Modal states
  const [isSlotModalOpen, setIsSlotModalOpen] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<CourseSlotData | null>(null);
  const [initialSlotPrefill, setInitialSlotPrefill] = useState<{
    dayOfWeek?: DayOfWeek;
    startTime?: string;
    endTime?: string;
  } | null>(null);

  // Delete slot confirmation modal
  const [slotToDelete, setSlotToDelete] = useState<CourseSlotData | null>(null);
  const [isDeletingSlot, setIsDeletingSlot] = useState<boolean>(false);

  // Notification toast
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-dismiss notification after 4s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch schedule details & slots
  const fetchScheduleData = useCallback(async () => {
    if (!scheduleId) return;
    setIsLoading(true);
    setFetchError(null);

    try {
      const res = await fetch(`/api/admin/schedules/${scheduleId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("ไม่พบข้อมูลตารางเรียนที่ระบุ (Schedule not found)");
        }
        throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูลตารางเรียน");
      }

      const data = await res.json();
      setSchedule(data.schedule);
      setSlots(data.schedule.slots || []);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load schedule");
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId]);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  // Format existing slots for conflict detector
  const existingSlotsForConflict = useMemo<ExistingSlot[]>(() => {
    return slots.map((s) => ({
      id: s.id || "",
      courseCode: s.courseCode,
      courseName: s.courseName,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room || null,
    }));
  }, [slots]);

  // Detect all conflicts across all slots in this schedule
  const allConflicts = useMemo<ConflictResult[]>(() => {
    return detectAllScheduleConflicts(existingSlotsForConflict);
  }, [existingSlotsForConflict]);

  // Toggle Draft / Published Status
  const handleToggleStatus = async () => {
    if (!schedule || isTogglingStatus) return;

    const nextStatus: ScheduleStatus =
      schedule.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    setIsTogglingStatus(true);
    try {
      const res = await fetch(`/api/admin/schedules/${schedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        throw new Error("ไม่สามารถเปลี่ยนสถานะตารางเรียนได้");
      }

      const data = await res.json();
      setSchedule((prev) => (prev ? { ...prev, status: data.schedule.status } : null));

      setNotification({
        type: "success",
        message:
          nextStatus === "PUBLISHED"
            ? "เผยแพร่ตารางเรียนแล้ว นักศึกษาและผู้ใช้ทั่วไปสามารถเข้าดูได้"
            : "เปลี่ยนสถานะเป็นฉบับร่าง (Draft) แล้ว ซ่อนจากการแสดงผลสาธารณะ",
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะ",
      });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Open modal for new slot
  const handleOpenAddSlot = (prefill?: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  }) => {
    setEditingSlot(null);
    setInitialSlotPrefill(prefill || null);
    setIsSlotModalOpen(true);
  };

  // Open modal for editing slot
  const handleOpenEditSlot = (slot: CourseSlotData) => {
    setEditingSlot(slot);
    setInitialSlotPrefill(null);
    setIsSlotModalOpen(true);
  };

  // Callback when slot is saved (created or updated)
  const handleSlotSaved = (savedSlot: CourseSlotData, conflicts: ConflictResult[]) => {
    setSlots((prev) => {
      const existsIndex = prev.findIndex((s) => s.id === savedSlot.id);
      if (existsIndex >= 0) {
        const next = [...prev];
        next[existsIndex] = savedSlot;
        return next;
      }
      return [...prev, savedSlot];
    });

    setNotification({
      type: "success",
      message:
        conflicts.length > 0
          ? `บันทึกรายวิชา ${savedSlot.courseCode} สำเร็จ (มีคำเตือนข้อขัดแย้ง ${conflicts.length} รายการ)`
          : `บันทึกรายวิชา ${savedSlot.courseCode} เรียบร้อยแล้ว`,
    });
  };

  // Confirm delete slot
  const handleConfirmDeleteSlot = async () => {
    if (!slotToDelete || !schedule) return;

    setIsDeletingSlot(true);
    try {
      const res = await fetch(
        `/api/admin/schedules/${schedule.id}/slots/${slotToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("เกิดข้อผิดพลาดในการลบรายวิชา");
      }

      setSlots((prev) => prev.filter((s) => s.id !== slotToDelete.id));
      setNotification({
        type: "success",
        message: `ลบรายวิชา ${slotToDelete.courseCode} (${slotToDelete.courseName}) เรียบร้อยแล้ว`,
      });
      setSlotToDelete(null);
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "ไม่สามารถลบรายวิชาได้",
      });
    } finally {
      setIsDeletingSlot(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141518] text-white flex flex-col font-sans selection:bg-brand-orange selection:text-white">
      {/* Top Admin Navigation Header */}
      <AdminHeader currentTab="schedules" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
            <Link
              href="/admin/schedules"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>จัดการตารางเรียน (Schedules)</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-md">
              {schedule?.programName || "แก้ไขตารางเรียน"}
            </span>
          </nav>

          {/* Quick External Link to Public View if Published */}
          {schedule?.status === "PUBLISHED" && (
            <Link
              href={`/api/schedules/${schedule.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-brand-orange hover:text-orange-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ดูข้อมูล Public API</span>
            </Link>
          )}
        </div>

        {/* Global Toast Notification */}
        {notification && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm shadow-xl transition-all duration-200 animate-slide-up ${
              notification.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/15 border-red-500/30 text-red-300"
            }`}
            role="status"
          >
            <div className="flex items-center gap-2.5">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs opacity-75 hover:opacity-100 transition-opacity"
            >
              ปิด
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="min-h-[400px] flex flex-col items-center justify-center rounded-3xl bg-[#1A1B20] border border-white/10 p-8 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
            <p className="text-sm">กำลังโหลดข้อมูลตารางเรียนและรายวิชา...</p>
          </div>
        )}

        {/* Fetch Error State */}
        {!isLoading && fetchError && (
          <div className="min-h-[300px] flex flex-col items-center justify-center rounded-3xl bg-[#1A1B20] border border-red-500/30 p-8 text-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                ไม่สามารถโหลดข้อมูลได้
              </h3>
              <p className="text-sm text-slate-400">{fetchError}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchScheduleData}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                ลองใหม่อีกครั้ง
              </button>
              <Link
                href="/admin/schedules"
                className="px-4 py-2 rounded-xl bg-brand-orange text-white text-xs font-medium hover:bg-orange-600 transition-colors"
              >
                กลับหน้ารายการตารางเรียน
              </Link>
            </div>
          </div>
        )}

        {/* Main Schedule Content */}
        {!isLoading && schedule && (
          <>
            {/* Schedule Header Card */}
            <div className="bg-[#1A1B20] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Metadata Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-bold uppercase tracking-wider">
                      {schedule.degreeLevel}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                      ปีการศึกษา {schedule.academicYear} / ภาคการศึกษาที่{" "}
                      {schedule.semester}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
                      ชั้นปีที่ {schedule.yearLevel}
                    </span>
                    {schedule.sectionGroup && (
                      <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-medium">
                        {schedule.sectionGroup}
                      </span>
                    )}
                  </div>

                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                      {schedule.programName}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span>รหัสหลักสูตร: {schedule.programId}</span>
                      <span>•</span>
                      <span>รวม {slots.length} รายวิชา</span>
                      {schedule.note && (
                        <>
                          <span>•</span>
                          <span className="text-slate-300 italic">
                            หมายเหตุ: {schedule.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Header Action Controls */}
                <div className="flex items-center gap-3 flex-wrap lg:justify-end">
                  {/* Draft / Published Toggle */}
                  <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-2 px-3">
                    <span className="text-xs text-slate-300 hidden sm:inline">
                      สถานะ:
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleStatus}
                      disabled={isTogglingStatus}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        schedule.status === "PUBLISHED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                      }`}
                      title={
                        schedule.status === "PUBLISHED"
                          ? "คลิกเพื่อเปลี่ยนเป็น ฉบับร่าง (Draft)"
                          : "คลิกเพื่อ เผยแพร่ (Publish) สู่สาธารณะ"
                      }
                    >
                      {isTogglingStatus ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : schedule.status === "PUBLISHED" ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {schedule.status === "PUBLISHED"
                          ? "เผยแพร่แล้ว (Published)"
                          : "ฉบับร่าง (Draft)"}
                      </span>
                    </button>
                  </div>

                  {/* Add Course Slot Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenAddSlot()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-orange hover:bg-orange-600 text-white font-medium text-xs sm:text-sm shadow-lg shadow-brand-orange/25 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มรายวิชา (Add Course Slot)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Non-blocking Schedule-wide Conflict Banner */}
            {allConflicts.length > 0 && (
              <ConflictBanner
                conflicts={allConflicts}
                title={`ตรวจพบข้อขัดแย้งในตารางเรียน (${allConflicts.length} รายการ)`}
              />
            )}

            {/* View Switcher Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 bg-[#1A1B20] border border-white/10 rounded-2xl p-1 shadow-md">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    viewMode === "grid"
                      ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>ตารางสอนรายสัปดาห์ (Weekly Grid)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    viewMode === "table"
                      ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <TableIcon className="w-4 h-4" />
                  <span>ตารางข้อมูลรายวิชา (Table View)</span>
                </button>
              </div>

              <div className="text-xs text-slate-400">
                คลิกที่วิชาเพื่อแก้ไข หรือชี้เพื่อลบ
              </div>
            </div>

            {/* Active View: Weekly Grid or Table View */}
            {viewMode === "grid" ? (
              <WeeklyGridEditor
                slots={slots}
                conflicts={allConflicts}
                onEditSlot={handleOpenEditSlot}
                onDeleteSlot={(slot) => setSlotToDelete(slot)}
                onAddSlot={(prefill) => handleOpenAddSlot(prefill)}
              />
            ) : (
              <ScheduleTableView
                slots={slots}
                conflicts={allConflicts}
                onEditSlot={handleOpenEditSlot}
                onDeleteSlot={(slot) => setSlotToDelete(slot)}
                onAddSlot={() => handleOpenAddSlot()}
              />
            )}
          </>
        )}
      </main>

      {/* Course Slot Modal (Create / Edit) */}
      {schedule && (
        <CourseSlotModal
          isOpen={isSlotModalOpen}
          onClose={() => {
            setIsSlotModalOpen(false);
            setEditingSlot(null);
            setInitialSlotPrefill(null);
          }}
          scheduleId={schedule.id}
          existingSlots={existingSlotsForConflict}
          slot={editingSlot}
          initialSlot={initialSlotPrefill}
          onSuccess={handleSlotSaved}
        />
      )}

      {/* Delete Slot Confirmation Modal */}
      {slotToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#1A1B20] text-white border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">
                ยืนยันการลบรายวิชา?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              คุณต้องการลบรายวิชา{" "}
              <strong className="text-white font-mono font-bold">
                {slotToDelete.courseCode}
              </strong>{" "}
              - {slotToDelete.courseName} (วัน{slotToDelete.dayOfWeek} เวลา{" "}
              {slotToDelete.startTime} - {slotToDelete.endTime} น.) ออกจากตารางเรียนใช่หรือไม่?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSlotToDelete(null)}
                disabled={isDeletingSlot}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSlot}
                disabled={isDeletingSlot}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium transition-colors shadow-lg shadow-red-600/30"
              >
                {isDeletingSlot ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังลบ...
                  </>
                ) : (
                  "ลบรายวิชา"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
