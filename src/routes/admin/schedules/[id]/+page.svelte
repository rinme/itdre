<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
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
    ExternalLink,
    Loader2,
    Trash2,
    Eye,
    EyeOff,
    RefreshCw,
  } from "lucide-svelte";
  import WeeklyGridEditor from "$lib/components/admin/WeeklyGridEditor.svelte";
  import ScheduleTableView from "$lib/components/admin/ScheduleTableView.svelte";
  import CourseSlotModal, {
    type CourseSlotData,
  } from "$lib/components/admin/CourseSlotModal.svelte";
  import ConflictBanner from "$lib/components/admin/ConflictBanner.svelte";
  import {
    detectAllScheduleConflicts,
    type ExistingSlot,
    type ConflictResult,
  } from "$lib/weekly-grid";

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

  const scheduleId = $derived(page.params.id);

  let schedule = $state<ScheduleDetails | null>(null);
  let slots = $state<CourseSlotData[]>([]);
  let isLoading = $state<boolean>(true);
  let fetchError = $state<string | null>(null);

  let viewMode = $state<"grid" | "table">("grid");
  let isTogglingStatus = $state<boolean>(false);

  let isSlotModalOpen = $state<boolean>(false);
  let editingSlot = $state<CourseSlotData | null>(null);
  let initialSlotPrefill = $state<{
    dayOfWeek?: DayOfWeek;
    startTime?: string;
    endTime?: string;
  } | null>(null);

  let slotToDelete = $state<CourseSlotData | null>(null);
  let isDeletingSlot = $state<boolean>(false);

  let notification = $state<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  $effect(() => {
    if (notification) {
      const timer = setTimeout(() => (notification = null), 4000);
      return () => clearTimeout(timer);
    }
  });

  async function fetchScheduleData() {
    if (!scheduleId) return;
    isLoading = true;
    fetchError = null;

    try {
      const res = await fetch(`/api/admin/schedules/${scheduleId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("ไม่พบข้อมูลตารางเรียนที่ระบุ (Schedule not found)");
        }
        throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูลตารางเรียน");
      }

      const data = await res.json();
      schedule = data.schedule;
      slots = data.schedule.slots || [];
    } catch (err: any) {
      fetchError = err.message || "Failed to load schedule";
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    fetchScheduleData();
  });

  let existingSlotsForConflict = $derived.by<ExistingSlot[]>(() => {
    return slots.map((s) => ({
      id: s.id || "",
      courseCode: s.courseCode,
      courseName: s.courseName,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room || null,
    }));
  });

  let allConflicts = $derived.by<ConflictResult[]>(() => {
    return detectAllScheduleConflicts(existingSlotsForConflict);
  });

  async function handleToggleStatus() {
    if (!schedule || isTogglingStatus) return;

    const nextStatus: ScheduleStatus =
      schedule.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    isTogglingStatus = true;
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
      schedule = { ...schedule, status: data.schedule.status };

      notification = {
        type: "success",
        message:
          nextStatus === "PUBLISHED"
            ? "เผยแพร่ตารางเรียนแล้ว นักศึกษาและผู้ใช้ทั่วไปสามารถเข้าดูได้"
            : "เปลี่ยนสถานะเป็นฉบับร่าง (Draft) แล้ว ซ่อนจากการแสดงผลสาธารณะ",
      };
    } catch (err: any) {
      notification = {
        type: "error",
        message: err.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะ",
      };
    } finally {
      isTogglingStatus = false;
    }
  }

  function handleOpenAddSlot(prefill?: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  }) {
    editingSlot = null;
    initialSlotPrefill = prefill || null;
    isSlotModalOpen = true;
  }

  function handleOpenEditSlot(slot: CourseSlotData) {
    editingSlot = slot;
    initialSlotPrefill = null;
    isSlotModalOpen = true;
  }

  function handleSlotSaved(savedSlot: CourseSlotData, conflicts: ConflictResult[]) {
    const existsIndex = slots.findIndex((s) => s.id === savedSlot.id);
    if (existsIndex >= 0) {
      const next = [...slots];
      next[existsIndex] = savedSlot;
      slots = next;
    } else {
      slots = [...slots, savedSlot];
    }

    notification = {
      type: "success",
      message:
        conflicts.length > 0
          ? `บันทึกรายวิชา ${savedSlot.courseCode} สำเร็จ (มีคำเตือนข้อขัดแย้ง ${conflicts.length} รายการ)`
          : `บันทึกรายวิชา ${savedSlot.courseCode} เรียบร้อยแล้ว`,
    };
  }

  async function handleConfirmDeleteSlot() {
    if (!slotToDelete || !schedule) return;

    isDeletingSlot = true;
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

      slots = slots.filter((s) => s.id !== slotToDelete!.id);
      notification = {
        type: "success",
        message: `ลบรายวิชา ${slotToDelete.courseCode} (${slotToDelete.courseName}) เรียบร้อยแล้ว`,
      };
      slotToDelete = null;
    } catch (err: any) {
      notification = {
        type: "error",
        message: err.message || "ไม่สามารถลบรายวิชาได้",
      };
    } finally {
      isDeletingSlot = false;
    }
  }
</script>

<main class="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
  <!-- Breadcrumb Navigation -->
  <div class="flex items-center justify-between flex-wrap gap-3">
    <nav class="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
      <a
        href="/admin/schedules"
        class="inline-flex items-center gap-1.5 hover:text-white transition-colors"
      >
        <ChevronLeft class="w-4 h-4" />
        <span>จัดการตารางเรียน (Schedules)</span>
      </a>
      <span class="text-slate-600">/</span>
      <span class="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-md">
        {schedule?.programName || "แก้ไขตารางเรียน"}
      </span>
    </nav>

    <!-- Quick External Link to Public View if Published -->
    {#if schedule?.status === "PUBLISHED"}
      <a
        href="/api/schedules/{schedule.id}"
        target="_blank"
        rel="noreferrer"
        class="inline-flex items-center gap-1.5 text-xs text-brand-orange hover:text-orange-400 transition-colors"
      >
        <ExternalLink class="w-3.5 h-3.5" />
        <span>ดูข้อมูล Public API</span>
      </a>
    {/if}
  </div>

  <!-- Global Toast Notification -->
  {#if notification}
    <div
      class="p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm shadow-xl transition-all duration-200 animate-slide-up {notification.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border-red-500/30 text-red-300'}"
      role="status"
    >
      <div class="flex items-center gap-2.5">
        {#if notification.type === "success"}
          <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0" />
        {:else}
          <AlertCircle class="w-5 h-5 text-red-400 shrink-0" />
        {/if}
        <span class="font-medium">{notification.message}</span>
      </div>
      <button
        type="button"
        onclick={() => (notification = null)}
        class="text-xs opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
      >
        ปิด
      </button>
    </div>
  {/if}

  <!-- Loading State -->
  {#if isLoading}
    <div class="min-h-[400px] flex flex-col items-center justify-center rounded-3xl bg-[#1A1B20] border border-white/10 p-8 text-slate-400 gap-3">
      <Loader2 class="w-8 h-8 animate-spin text-brand-orange" />
      <p class="text-sm">กำลังโหลดข้อมูลตารางเรียนและรายวิชา...</p>
    </div>
  {:else if fetchError}
    <!-- Fetch Error State -->
    <div class="min-h-[300px] flex flex-col items-center justify-center rounded-3xl bg-[#1A1B20] border border-red-500/30 p-8 text-center gap-4">
      <AlertCircle class="w-12 h-12 text-red-400" />
      <div>
        <h3 class="text-lg font-bold text-white mb-1">
          ไม่สามารถโหลดข้อมูลได้
        </h3>
        <p class="text-sm text-slate-400">{fetchError}</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          onclick={fetchScheduleData}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <RefreshCw class="w-4 h-4" />
          ลองใหม่อีกครั้ง
        </button>
        <a
          href="/admin/schedules"
          class="px-4 py-2 rounded-xl bg-brand-orange text-white text-xs font-medium hover:bg-orange-600 transition-colors"
        >
          กลับหน้ารายการตารางเรียน
        </a>
      </div>
    </div>
  {:else if schedule}
    <!-- Main Schedule Content -->
    <!-- Schedule Header Card -->
    <div class="bg-[#1A1B20] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <!-- Metadata Details -->
        <div class="space-y-3">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-bold uppercase tracking-wider">
              {schedule.degreeLevel}
            </span>
            <span class="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
              ปีการศึกษา {schedule.academicYear} / ภาคการศึกษาที่ {schedule.semester}
            </span>
            <span class="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
              ชั้นปีที่ {schedule.yearLevel}
            </span>
            {#if schedule.sectionGroup}
              <span class="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-medium">
                {schedule.sectionGroup}
              </span>
            {/if}
          </div>

          <div>
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {schedule.programName}
            </h1>
            <div class="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
              <span>รหัสหลักสูตร: {schedule.programId}</span>
              <span>•</span>
              <span>รวม {slots.length} รายวิชา</span>
              {#if schedule.note}
                <span>•</span>
                <span class="text-slate-300 italic">
                  หมายเหตุ: {schedule.note}
                </span>
              {/if}
            </div>
          </div>
        </div>

        <!-- Header Action Controls -->
        <div class="flex items-center gap-3 flex-wrap lg:justify-end">
          <!-- Draft / Published Toggle -->
          <div class="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-2 px-3">
            <span class="text-xs text-slate-300 hidden sm:inline">
              สถานะ:
            </span>
            <button
              type="button"
              onclick={handleToggleStatus}
              disabled={isTogglingStatus}
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer {schedule.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'}"
              title={schedule.status === "PUBLISHED" ? "คลิกเพื่อเปลี่ยนเป็น ฉบับร่าง (Draft)" : "คลิกเพื่อ เผยแพร่ (Publish) สู่สาธารณะ"}
            >
              {#if isTogglingStatus}
                <Loader2 class="w-3.5 h-3.5 animate-spin" />
              {:else if schedule.status === "PUBLISHED"}
                <Eye class="w-3.5 h-3.5" />
              {:else}
                <EyeOff class="w-3.5 h-3.5" />
              {/if}
              <span>
                {schedule.status === "PUBLISHED" ? "เผยแพร่แล้ว (Published)" : "ฉบับร่าง (Draft)"}
              </span>
            </button>
          </div>

          <!-- Add Course Slot Button -->
          <button
            type="button"
            onclick={() => handleOpenAddSlot()}
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-orange hover:bg-orange-600 text-white font-medium text-xs sm:text-sm shadow-lg shadow-brand-orange/25 transition-all cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>เพิ่มรายวิชา (Add Course Slot)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Non-blocking Schedule-wide Conflict Banner -->
    {#if allConflicts.length > 0}
      <ConflictBanner
        conflicts={allConflicts}
        title={`ตรวจพบข้อขัดแย้งในตารางเรียน (${allConflicts.length} รายการ)`}
      />
    {/if}

    <!-- View Switcher Bar -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-1 bg-[#1A1B20] border border-white/10 rounded-2xl p-1 shadow-md">
        <button
          type="button"
          onclick={() => (viewMode = "grid")}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer {viewMode === 'grid' ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}"
        >
          <LayoutGrid class="w-4 h-4" />
          <span>ตารางสอนรายสัปดาห์ (Weekly Grid)</span>
        </button>
        <button
          type="button"
          onclick={() => (viewMode = "table")}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer {viewMode === 'table' ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}"
        >
          <TableIcon class="w-4 h-4" />
          <span>ตารางข้อมูลรายวิชา (Table View)</span>
        </button>
      </div>

      <div class="text-xs text-slate-400">
        คลิกที่วิชาเพื่อแก้ไข หรือชี้เพื่อลบ
      </div>
    </div>

    <!-- Active View: Weekly Grid or Table View -->
    {#if viewMode === "grid"}
      <WeeklyGridEditor
        slots={slots}
        conflicts={allConflicts}
        onEditSlot={handleOpenEditSlot}
        onDeleteSlot={(slot) => (slotToDelete = slot)}
        onAddSlot={(prefill) => handleOpenAddSlot(prefill)}
      />
    {:else}
      <ScheduleTableView
        slots={slots}
        conflicts={allConflicts}
        onEditSlot={handleOpenEditSlot}
        onDeleteSlot={(slot) => (slotToDelete = slot)}
        onAddSlot={() => handleOpenAddSlot()}
      />
    {/if}
  {/if}
</main>

<!-- Course Slot Modal (Create / Edit) -->
{#if schedule}
  <CourseSlotModal
    isOpen={isSlotModalOpen}
    onClose={() => {
      isSlotModalOpen = false;
      editingSlot = null;
      initialSlotPrefill = null;
    }}
    scheduleId={schedule.id}
    existingSlots={existingSlotsForConflict}
    slot={editingSlot}
    initialSlot={initialSlotPrefill}
    onSuccess={handleSlotSaved}
  />
{/if}

<!-- Delete Slot Confirmation Modal -->
{#if slotToDelete}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    role="dialog"
    aria-modal="true"
  >
    <div class="w-full max-w-md bg-[#1A1B20] text-white border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
      <div class="flex items-center gap-3 text-red-400">
        <div class="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
          <Trash2 class="w-5 h-5" />
        </div>
        <h3 class="text-lg font-bold text-white">
          ยืนยันการลบรายวิชา?
        </h3>
      </div>

      <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
        คุณต้องการลบรายวิชา{" "}
        <strong class="text-white font-mono font-bold">
          {slotToDelete.courseCode}
        </strong>{" "}
        - {slotToDelete.courseName} (วัน{slotToDelete.dayOfWeek} เวลา{" "}
        {slotToDelete.startTime} - {slotToDelete.endTime} น.) ออกจากตารางเรียนใช่หรือไม่?
      </p>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
        <button
          type="button"
          onclick={() => (slotToDelete = null)}
          disabled={isDeletingSlot}
          class="px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onclick={handleConfirmDeleteSlot}
          disabled={isDeletingSlot}
          class="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium transition-colors shadow-lg shadow-red-600/30 cursor-pointer"
        >
          {#if isDeletingSlot}
            <Loader2 class="w-4 h-4 animate-spin" />
            <span>กำลังลบ...</span>
          {:else}
            <span>ลบรายวิชา</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
