"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import ScheduleModal from "@/components/admin/ScheduleModal";
import CloneScheduleModal, {
  SourceScheduleInfo,
} from "@/components/admin/CloneScheduleModal";
import type { DegreeLevel, ScheduleStatus } from "@prisma/client";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Copy,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  GraduationCap,
  Eye,
  EyeOff,
  RotateCcw,
  Loader2,
  Table as TableIcon,
  LayoutGrid,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface ScheduleWithCount {
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
  _count?: {
    slots: number;
  };
}

export default function AdminSchedulesDashboardPage() {
  const [schedules, setSchedules] = useState<ScheduleWithCount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filters
  const [filterYear, setFilterYear] = useState<string>("ALL");
  const [filterSemester, setFilterSemester] = useState<string>("ALL");
  const [filterDegree, setFilterDegree] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // View mode: "table" | "grid"
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cloneSourceSchedule, setCloneSourceSchedule] =
    useState<SourceScheduleInfo | null>(null);

  // Action in-progress states
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(
    null
  );

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch schedules
  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterYear !== "ALL") params.set("academicYear", filterYear);
      if (filterSemester !== "ALL") params.set("semester", filterSemester);
      if (filterDegree !== "ALL") params.set("degreeLevel", filterDegree);
      if (filterStatus !== "ALL") params.set("status", filterStatus);

      const res = await fetch(`/api/admin/schedules?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load schedules");
      }
      const data = await res.json();
      setSchedules(data.schedules || []);
    } catch (err: any) {
      console.error("Fetch schedules error:", err);
      setError("ไม่สามารถโหลดข้อมูลตารางเรียนได้ โปรดตรวจสอบการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  }, [filterYear, filterSemester, filterDegree, filterStatus]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Distinct academic years for filter dropdown
  const availableYears = useMemo(() => {
    const defaultYears = [2569, 2568, 2567, 2566];
    const fromData = schedules.map((s) => s.academicYear);
    const combined = Array.from(new Set([...defaultYears, ...fromData]));
    return combined.sort((a, b) => b - a);
  }, [schedules]);

  // Client-side text search filter
  const displayedSchedules = useMemo(() => {
    if (!searchQuery.trim()) return schedules;
    const query = searchQuery.toLowerCase().trim();
    return schedules.filter(
      (s) =>
        s.programName.toLowerCase().includes(query) ||
        (s.sectionGroup && s.sectionGroup.toLowerCase().includes(query)) ||
        (s.note && s.note.toLowerCase().includes(query)) ||
        `ปี ${s.yearLevel}`.includes(query)
    );
  }, [schedules, searchQuery]);

  // Toggle Publish / Draft
  const handleToggleStatus = async (schedule: ScheduleWithCount) => {
    const newStatus: ScheduleStatus =
      schedule.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setActionInProgressId(schedule.id);

    try {
      const res = await fetch(`/api/admin/schedules/${schedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update schedule status");
      }

      const statusText =
        newStatus === "PUBLISHED" ? "เผยแพร่แล้ว" : "เปลี่ยนเป็นแบบร่างแล้ว";
      setNotification({
        type: "success",
        message: `${schedule.programName} (ชั้นปีที่ ${schedule.yearLevel}) ${statusText}`,
      });

      // Update locally
      setSchedules((prev) =>
        prev.map((s) => (s.id === schedule.id ? { ...s, status: newStatus } : s))
      );
    } catch (err: any) {
      console.error("Toggle status error:", err);
      setNotification({
        type: "error",
        message: "ไม่สามารถเปลี่ยนสถานะตารางเรียนได้ โปรดลองอีกครั้ง",
      });
    } finally {
      setActionInProgressId(null);
    }
  };

  // Delete Schedule
  const handleDeleteSchedule = async (schedule: ScheduleWithCount) => {
    const confirmed = window.confirm(
      `คุณต้องการลบตารางเรียน "${schedule.programName} ชั้นปีที่ ${schedule.yearLevel} (${schedule.sectionGroup || "Sec 1"})" หรือไม่?\n\nคำเตือน: การลบนี้จะลบรายวิชาทั้งหมดในตารางเรียนนี้อย่างถาวร!`
    );

    if (!confirmed) return;

    setActionInProgressId(schedule.id);

    try {
      const res = await fetch(`/api/admin/schedules/${schedule.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete schedule");
      }

      setNotification({
        type: "success",
        message: `ลบตารางเรียนเรียบร้อยแล้ว`,
      });

      // Remove locally
      setSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
    } catch (err: any) {
      console.error("Delete schedule error:", err);
      setNotification({
        type: "error",
        message: "ไม่สามารถลบตารางเรียนได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setActionInProgressId(null);
    }
  };

  // Degree badge helper
  const renderDegreeBadge = (degree: DegreeLevel) => {
    switch (degree) {
      case "BACHELOR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            ปริญญาตรี
          </span>
        );
      case "MASTER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            ปริญญาโท
          </span>
        );
      case "DOCTOR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            ปริญญาเอก
          </span>
        );
      default:
        return null;
    }
  };

  // Status badge helper
  const renderStatusBadge = (status: ScheduleStatus) => {
    if (status === "PUBLISHED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>เผยแพร่แล้ว (Published)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span>แบบร่าง (Draft)</span>
      </span>
    );
  };

  // Stats calculation
  const totalSlotsCount = schedules.reduce(
    (acc, curr) => acc + (curr._count?.slots || 0),
    0
  );
  const publishedCount = schedules.filter((s) => s.status === "PUBLISHED").length;
  const draftCount = schedules.filter((s) => s.status === "DRAFT").length;

  return (
    <div className="min-h-screen bg-[#0D0E11] text-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <AdminHeader currentTab="schedules" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-xl animate-fade-in ${
              notification.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200"
                : "bg-red-500/15 border-red-500/30 text-red-200"
            }`}
          >
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs opacity-75 hover:opacity-100 px-2 py-1"
            >
              ปิด
            </button>
          </div>
        )}

        {/* Page Title & Top Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-brand-orange text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              จัดการตารางเรียน (Schedule Management)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              สร้าง แก้ไข คัดลอกภาคการศึกษา และจัดการสถานะการเผยแพร่ตารางเรียน
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-darkOrange hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ สร้างตารางเรียนใหม่</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#18191E] border border-white/10 rounded-2xl p-4 flex flex-col">
            <span className="text-xs text-slate-400">ตารางเรียนทั้งหมด</span>
            <span className="text-2xl font-bold text-white mt-1">
              {schedules.length}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">ทุกระดับการศึกษา</span>
          </div>

          <div className="bg-[#18191E] border border-white/10 rounded-2xl p-4 flex flex-col">
            <span className="text-xs text-emerald-400">เผยแพร่แล้ว (Published)</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1">
              {publishedCount}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">นักศึกษาเข้าดูได้</span>
          </div>

          <div className="bg-[#18191E] border border-white/10 rounded-2xl p-4 flex flex-col">
            <span className="text-xs text-amber-400">แบบร่าง (Draft)</span>
            <span className="text-2xl font-bold text-amber-400 mt-1">
              {draftCount}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">อยู่ระหว่างจัดทำ</span>
          </div>

          <div className="bg-[#18191E] border border-white/10 rounded-2xl p-4 flex flex-col">
            <span className="text-xs text-blue-400">รายวิชาทั้งหมด</span>
            <span className="text-2xl font-bold text-blue-400 mt-1">
              {totalSlotsCount}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">คาบเรียนในระบบ</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#18191E] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อหลักสูตร, กลุ่มเรียน, หมายเหตุ..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ล้าง
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-white/15 text-white shadow-xs font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="ตาราง (Table View)"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>ตาราง</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-white/15 text-white shadow-xs font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="การ์ด (Card View)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>การ์ด</span>
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5">
            {/* Year Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                ปีการศึกษา
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#23242B] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange cursor-pointer"
              >
                <option value="ALL">ทุกปีการศึกษา (All Years)</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    ปีการศึกษา {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                ภาคการศึกษา
              </label>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#23242B] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange cursor-pointer"
              >
                <option value="ALL">ทุกภาคเรียน (All Terms)</option>
                <option value="1">ภาคเรียนที่ 1</option>
                <option value="2">ภาคเรียนที่ 2</option>
                <option value="3">ภาคฤดูร้อน (Summer)</option>
              </select>
            </div>

            {/* Degree Level Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                ระดับการศึกษา
              </label>
              <select
                value={filterDegree}
                onChange={(e) => setFilterDegree(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#23242B] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange cursor-pointer"
              >
                <option value="ALL">ทุกระดับ (All Degrees)</option>
                <option value="BACHELOR">ปริญญาตรี (Bachelor)</option>
                <option value="MASTER">ปริญญาโท (Master)</option>
                <option value="DOCTOR">ปริญญาเอก (Doctor)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                สถานะการเผยแพร่
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#23242B] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange cursor-pointer"
              >
                <option value="ALL">ทุกสถานะ (All Status)</option>
                <option value="PUBLISHED">เผยแพร่แล้ว (Published)</option>
                <option value="DRAFT">แบบร่าง (Draft)</option>
              </select>
            </div>
          </div>

          {/* Reset Filters Shortcut */}
          {(filterYear !== "ALL" ||
            filterSemester !== "ALL" ||
            filterDegree !== "ALL" ||
            filterStatus !== "ALL" ||
            searchQuery) && (
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
              <span>กำลังแสดงผลแบบกรองข้อมูล ({displayedSchedules.length} ตารางเรียน)</span>
              <button
                type="button"
                onClick={() => {
                  setFilterYear("ALL");
                  setFilterSemester("ALL");
                  setFilterDegree("ALL");
                  setFilterStatus("ALL");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1 text-brand-orange hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตตัวกรองทั้งหมด</span>
              </button>
            </div>
          )}
        </div>

        {/* Schedules Content */}
        {isLoading ? (
          <div className="p-16 rounded-3xl bg-[#18191E] border border-white/10 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
            <span className="text-sm text-slate-300">
              กำลังโหลดข้อมูลตารางเรียน...
            </span>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/30 text-center flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <div className="text-red-300 text-sm font-semibold">{error}</div>
            <button
              type="button"
              onClick={fetchSchedules}
              className="mt-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        ) : displayedSchedules.length === 0 ? (
          <div className="p-16 rounded-3xl bg-[#18191E] border border-white/10 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                ไม่พบตารางเรียนตามเงื่อนไขที่เลือก
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                ยังไม่มีการสร้างตารางเรียนสำหรับตัวกรองนี้ หรือคำค้นหาไม่ตรงกับตารางใดๆ
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-darkOrange text-white text-xs font-semibold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ สร้างตารางเรียนใหม่</span>
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="bg-[#18191E] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-[#141518] text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">หลักสูตร / สาขาวิชา</th>
                    <th className="py-3.5 px-4">ระดับ</th>
                    <th className="py-3.5 px-4">ชั้นปี / กลุ่มเรียน</th>
                    <th className="py-3.5 px-4">ภาค / ปีการศึกษา</th>
                    <th className="py-3.5 px-4">จำนวนวิชา</th>
                    <th className="py-3.5 px-4">สถานะ</th>
                    <th className="py-3.5 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayedSchedules.map((schedule) => {
                    const isBusy = actionInProgressId === schedule.id;
                    return (
                      <tr
                        key={schedule.id}
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        {/* Program Name */}
                        <td className="py-4 px-4 font-semibold text-white max-w-xs sm:max-w-sm">
                          <Link
                            href={`/admin/schedules/${schedule.id}`}
                            className="hover:text-brand-orange transition-colors flex flex-col"
                          >
                            <span className="leading-snug">{schedule.programName}</span>
                            {schedule.note && (
                              <span className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                                {schedule.note}
                              </span>
                            )}
                          </Link>
                        </td>

                        {/* Degree Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {renderDegreeBadge(schedule.degreeLevel)}
                        </td>

                        {/* Year & Section */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-slate-200">
                            <span>ปี {schedule.yearLevel}</span>
                            {schedule.sectionGroup && (
                              <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 text-[11px]">
                                {schedule.sectionGroup}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Term & Year */}
                        <td className="py-4 px-4 whitespace-nowrap text-slate-300">
                          {schedule.semester === 3 ? "ฤดูร้อน" : `ภาค ${schedule.semester}`}
                          /{schedule.academicYear}
                        </td>

                        {/* Slots Count */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs">
                            <Clock className="w-3.5 h-3.5 text-brand-orange" />
                            <span>{schedule._count?.slots ?? 0} วิชา</span>
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {renderStatusBadge(schedule.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Edit Timetable */}
                            <Link
                              href={`/admin/schedules/${schedule.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-orange/20 hover:bg-brand-orange text-orange-300 hover:text-white border border-brand-orange/40 text-xs font-semibold transition-all active:scale-95"
                              title="จัดการตารางเรียน (Edit Timetable)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>จัดการตาราง</span>
                            </Link>

                            {/* Duplicate / Clone */}
                            <button
                              type="button"
                              onClick={() => setCloneSourceSchedule(schedule)}
                              className="p-1.5 rounded-xl bg-white/5 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-white/10 transition-colors"
                              title="คัดลอกตารางเรียน (Duplicate)"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            {/* Toggle Publish / Draft */}
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleToggleStatus(schedule)}
                              className={`p-1.5 rounded-xl border transition-colors ${
                                schedule.status === "PUBLISHED"
                                  ? "bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border-white/10"
                                  : "bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border-white/10"
                              }`}
                              title={
                                schedule.status === "PUBLISHED"
                                  ? "เปลี่ยนเป็นแบบร่าง (Set Draft)"
                                  : "เผยแพร่ตารางเรียน (Publish)"
                              }
                            >
                              {isBusy ? (
                                <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                              ) : schedule.status === "PUBLISHED" ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDeleteSchedule(schedule)}
                              className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 transition-colors"
                              title="ลบตารางเรียน (Delete)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Card Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedSchedules.map((schedule) => {
              const isBusy = actionInProgressId === schedule.id;
              return (
                <div
                  key={schedule.id}
                  className="bg-[#18191E] border border-white/10 hover:border-white/20 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all group relative"
                >
                  {/* Top Row: Degree & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {renderDegreeBadge(schedule.degreeLevel)}
                    {renderStatusBadge(schedule.status)}
                  </div>

                  {/* Program Title */}
                  <Link
                    href={`/admin/schedules/${schedule.id}`}
                    className="block group-hover:text-brand-orange transition-colors"
                  >
                    <h3 className="font-bold text-white text-base leading-snug">
                      {schedule.programName}
                    </h3>
                  </Link>

                  {/* Meta Specs */}
                  <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-white/5 text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">
                        ชั้นปี / กลุ่ม
                      </span>
                      <span className="font-semibold text-white">
                        ปี {schedule.yearLevel}{" "}
                        {schedule.sectionGroup ? `(${schedule.sectionGroup})` : ""}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">
                        ภาค / ปีการศึกษา
                      </span>
                      <span className="font-semibold text-white">
                        {schedule.semester === 3 ? "ฤดูร้อน" : `ภาค ${schedule.semester}`}
                        /{schedule.academicYear}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">
                        จำนวนวิชา
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-brand-orange">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{schedule._count?.slots ?? 0} วิชา</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">
                        อัปเดตล่าสุด
                      </span>
                      <span className="text-slate-400">
                        {new Date(schedule.updatedAt).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/schedules/${schedule.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-orange/20 hover:bg-brand-orange text-orange-300 hover:text-white border border-brand-orange/40 text-xs font-semibold transition-all active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>จัดการตาราง</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setCloneSourceSchedule(schedule)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-white/10 transition-colors"
                      title="คัดลอกตารางเรียน"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggleStatus(schedule)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                      title={
                        schedule.status === "PUBLISHED"
                          ? "เปลี่ยนเป็นแบบร่าง"
                          : "เผยแพร่ตารางเรียน"
                      }
                    >
                      {isBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                      ) : schedule.status === "PUBLISHED" ? (
                        <EyeOff className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDeleteSchedule(schedule)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 transition-colors"
                      title="ลบตารางเรียน"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Schedule Creation Modal */}
      <ScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newSchedule) => {
          setNotification({
            type: "success",
            message: `สร้างตารางเรียน ${newSchedule.programName} เรียบร้อยแล้ว`,
          });
          fetchSchedules();
        }}
      />

      {/* Schedule Clone Modal */}
      <CloneScheduleModal
        isOpen={cloneSourceSchedule !== null}
        sourceSchedule={cloneSourceSchedule}
        onClose={() => setCloneSourceSchedule(null)}
        onSuccess={(clonedSchedule) => {
          setNotification({
            type: "success",
            message: `คัดลอกตารางเรียนไปยังปีการศึกษา ${clonedSchedule.academicYear}/${clonedSchedule.semester} สำเร็จ`,
          });
          fetchSchedules();
        }}
      />
    </div>
  );
}
