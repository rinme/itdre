<script lang="ts">
  import { onMount } from "svelte";
  import type { DegreeLevel, ScheduleStatus } from "@prisma/client";
  import {
    Calendar,
    Plus,
    Search,
    Copy,
    Trash2,
    Edit3,
    CheckCircle2,
    AlertCircle,
    Clock,
    Eye,
    EyeOff,
    RotateCcw,
    Loader2,
    Table as TableIcon,
    LayoutGrid,
  } from "lucide-svelte";
  import ScheduleModal from "$lib/components/admin/ScheduleModal.svelte";
  import CloneScheduleModal, {
    type SourceScheduleInfo,
  } from "$lib/components/admin/CloneScheduleModal.svelte";

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

  let schedules = $state<ScheduleWithCount[]>([]);
  let isLoading = $state<boolean>(true);
  let error = $state<string | null>(null);
  let notification = $state<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filters
  let filterYear = $state<string>("ALL");
  let filterSemester = $state<string>("ALL");
  let filterDegree = $state<string>("ALL");
  let filterStatus = $state<string>("ALL");
  let searchQuery = $state<string>(" ");

  // View mode
  let viewMode = $state<"table" | "grid">("table");

  // Modals state
  let isCreateModalOpen = $state(false);
  let cloneSourceSchedule = $state<SourceScheduleInfo | null>(null);

  // Action in-progress state
  let actionInProgressId = $state<string | null>(null);

  $effect(() => {
    if (notification) {
      const timer = setTimeout(() => (notification = null), 4000);
      return () => clearTimeout(timer);
    }
  });

  async function fetchSchedules() {
    isLoading = true;
    error = null;
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
      schedules = data.schedules || [];
    } catch (err: any) {
      console.error("Fetch schedules error:", err);
      error = "ไม่สามารถโหลดข้อมูลตารางเรียนได้ โปรดตรวจสอบการเชื่อมต่อ";
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    searchQuery = "";
    fetchSchedules();
  });

  $effect(() => {
    // Re-fetch when server filters change
    const _ = [filterYear, filterSemester, filterDegree, filterStatus];
    fetchSchedules();
  });

  let availableYears = $derived.by(() => {
    const defaultYears = [2569, 2568, 2567, 2566];
    const fromData = schedules.map((s) => s.academicYear);
    const combined = Array.from(new Set([...defaultYears, ...fromData]));
    return combined.sort((a, b) => b - a);
  });

  let displayedSchedules = $derived.by(() => {
    if (!searchQuery.trim()) return schedules;
    const q = searchQuery.toLowerCase().trim();
    return schedules.filter(
      (s) =>
        s.programName.toLowerCase().includes(q) ||
        (s.sectionGroup && s.sectionGroup.toLowerCase().includes(q)) ||
        (s.note && s.note.toLowerCase().includes(q)) ||
        `ปี ${s.yearLevel}`.includes(q)
    );
  });

  let totalSlotsCount = $derived(
    schedules.reduce((acc, curr) => acc + (curr._count?.slots || 0), 0)
  );
  let publishedCount = $derived(
    schedules.filter((s) => s.status === "PUBLISHED").length
  );
  let draftCount = $derived(
    schedules.filter((s) => s.status === "DRAFT").length
  );

  async function handleToggleStatus(schedule: ScheduleWithCount) {
    const newStatus: ScheduleStatus =
      schedule.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    actionInProgressId = schedule.id;

    try {
      const res = await fetch(`/api/admin/schedules/${schedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setSchedules((prev) =>
        prev.map((s) => (s.id === schedule.id ? { ...s, status: newStatus } : s))
      );

      notification = {
        type: "success",
        message: `เปลี่ยนสถานะเป็น ${newStatus === "PUBLISHED" ? "เผยแพร่แล้ว (Published)" : "แบบร่าง (Draft)"} สำเร็จ`,
      };
    } catch (err: any) {
      console.error("Toggle status error:", err);
      notification = {
        type: "error",
        message: "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ โปรดลองใหม่อีกครั้ง",
      };
    } finally {
      actionInProgressId = null;
    }
  }

  function setSchedules(fn: (prev: ScheduleWithCount[]) => ScheduleWithCount[]) {
    schedules = fn(schedules);
  }

  async function handleDeleteSchedule(schedule: ScheduleWithCount) {
    if (
      !confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบตารางเรียน ${schedule.programName} ภาค ${schedule.semester}/${schedule.academicYear}? (การลบนี้จะรวมถึงรายวิชาทั้งหมดในตารางและไม่สามารถกู้คืนได้)`
      )
    ) {
      return;
    }

    actionInProgressId = schedule.id;

    try {
      const res = await fetch(`/api/admin/schedules/${schedule.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete schedule");
      }

      notification = {
        type: "success",
        message: "ลบตารางเรียนเรียบร้อยแล้ว",
      };

      setSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
    } catch (err: any) {
      console.error("Delete schedule error:", err);
      notification = {
        type: "error",
        message: "ไม่สามารถลบตารางเรียนได้ กรุณาลองใหม่อีกครั้ง",
      };
    } finally {
      actionInProgressId = null;
    }
  }
</script>

<main class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
  <!-- Notification Toast -->
  {#if notification}
    <div
      class="p-4 rounded-2xl border flex items-center justify-between shadow-xl animate-fade-in {notification.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200' : 'bg-red-500/15 border-red-500/30 text-red-200'}"
    >
      <div class="flex items-center gap-3">
        {#if notification.type === "success"}
          <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0" />
        {:else}
          <AlertCircle class="w-5 h-5 text-red-400 shrink-0" />
        {/if}
        <span class="text-xs sm:text-sm font-medium">{notification.message}</span>
      </div>
      <button
        type="button"
        onclick={() => (notification = null)}
        class="text-xs text-white/60 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer"
      >
        ปิด
      </button>
    </div>
  {/if}

  <!-- Page Title & Top Action Bar -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
    <div>
      <div class="flex items-center gap-2 text-brand-orange text-xs font-semibold uppercase tracking-wider">
        <Calendar class="w-4 h-4" />
        <span>Admin Dashboard</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
        จัดการตารางเรียน (Schedule Management)
      </h1>
      <p class="text-xs sm:text-sm text-slate-400 mt-1">
        สร้าง แก้ไข คัดลอกภาคการศึกษา และจัดการสถานะการเผยแพร่ตารางเรียน
      </p>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="button"
        onclick={() => (isCreateModalOpen = true)}
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-dark-orange hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>+ สร้างตารางเรียนใหม่</span>
      </button>
    </div>
  </div>

  <!-- Quick Stats Grid -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
    <div class="bg-[#18191E] border border-white/10 rounded-2xl p-4 flex flex-col">
      <span class="text-xs text-slate-400">ตารางเรียนทั้งหมด</span>
      <span class="text-2xl font-bold text-white mt-1">
        {schedules.length}
      </span>
      <span class="text-[10px] text-slate-500 mt-1">ทุกระดับการศึกษา</span>
    </div>

    <div class="bg-[#18191E] border border-white/10 rounded-2xl p-4 flex flex-col">
      <span class="text-xs text-emerald-400">เผยแพร่แล้ว (Published)</span>
      <span class="text-2xl font-bold text-emerald-400 mt-1">
        {publishedCount}
      </span>
      <span class="text-[10px] text-slate-500 mt-1">นักศึกษาเข้าดูได้</span>
    </div>

    <div class="bg-[#18191E] border border-white/10 rounded-2xl p-4 flex flex-col">
      <span class="text-xs text-amber-400">แบบร่าง (Draft)</span>
      <span class="text-2xl font-bold text-amber-400 mt-1">
        {draftCount}
      </span>
      <span class="text-[10px] text-slate-500 mt-1">อยู่ระหว่างจัดทำ</span>
    </div>

    <div class="bg-[#18191E] border border-white/10 rounded-2xl p-4 flex flex-col">
      <span class="text-xs text-blue-400">รายวิชาทั้งหมด</span>
      <span class="text-2xl font-bold text-blue-400 mt-1">
        {totalSlotsCount}
      </span>
      <span class="text-[10px] text-slate-500 mt-1">คาบเรียนในระบบ</span>
    </div>
  </div>

  <!-- Filter & Search Bar -->
  <div class="bg-[#18191E] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="ค้นหาชื่อหลักสูตร, กลุ่มเรียน, หมายเหตุ..."
          class="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
        />
        {#if searchQuery}
          <button
            type="button"
            onclick={() => (searchQuery = "")}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            ล้าง
          </button>
        {/if}
      </div>

      <!-- View Mode Switcher -->
      <div class="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start lg:self-auto">
        <button
          type="button"
          onclick={() => (viewMode = "table")}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer {viewMode === 'table' ? 'bg-white/15 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-white'}"
          title="ตาราง (Table View)"
        >
          <TableIcon class="w-3.5 h-3.5" />
          <span>ตาราง</span>
        </button>
        <button
          type="button"
          onclick={() => (viewMode = "grid")}
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer {viewMode === 'grid' ? 'bg-white/15 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-white'}"
          title="การ์ด (Card View)"
        >
          <LayoutGrid class="w-3.5 h-3.5" />
          <span>การ์ด</span>
        </button>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5">
      <!-- Year Filter -->
      <div>
        <label for="filter-year-select" class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          ปีการศึกษา
        </label>
        <select
          id="filter-year-select"
          bind:value={filterYear}
          class="w-full px-3 py-2 rounded-xl bg-[#23242B] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange cursor-pointer"
        >
          <option value="ALL">ทุกปีการศึกษา (All Years)</option>
          {#each availableYears as yr (yr)}
            <option value={String(yr)}>
              ปีการศึกษา {yr}
            </option>
          {/each}
        </select>
      </div>

      <!-- Semester Filter -->
      <div>
        <label for="filter-semester-select" class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          ภาคการศึกษา
        </label>
        <select
          id="filter-semester-select"
          bind:value={filterSemester}
          class="w-full px-3 py-2 rounded-xl bg-[#23242B] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange cursor-pointer"
        >
          <option value="ALL">ทุกภาคเรียน (All Terms)</option>
          <option value="1">ภาคเรียนที่ 1</option>
          <option value="2">ภาคเรียนที่ 2</option>
          <option value="3">ภาคฤดูร้อน (Summer)</option>
        </select>
      </div>

      <!-- Degree Level Filter -->
      <div>
        <label for="filter-degree-select" class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          ระดับการศึกษา
        </label>
        <select
          id="filter-degree-select"
          bind:value={filterDegree}
          class="w-full px-3 py-2 rounded-xl bg-[#23242B] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange cursor-pointer"
        >
          <option value="ALL">ทุกระดับ (All Degrees)</option>
          <option value="BACHELOR">ปริญญาตรี (Bachelor)</option>
          <option value="MASTER">ปริญญาโท (Master)</option>
          <option value="DOCTOR">ปริญญาเอก (Doctor)</option>
        </select>
      </div>

      <!-- Status Filter -->
      <div>
        <label for="filter-status-select" class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          สถานะการเผยแพร่
        </label>
        <select
          id="filter-status-select"
          bind:value={filterStatus}
          class="w-full px-3 py-2 rounded-xl bg-[#23242B] border border-white/10 text-white text-xs focus:outline-none focus:border-brand-orange cursor-pointer"
        >
          <option value="ALL">ทุกสถานะ (All Status)</option>
          <option value="PUBLISHED">เผยแพร่แล้ว (Published)</option>
          <option value="DRAFT">แบบร่าง (Draft)</option>
        </select>
      </div>
    </div>

    <!-- Reset Filters Shortcut -->
    {#if filterYear !== "ALL" || filterSemester !== "ALL" || filterDegree !== "ALL" || filterStatus !== "ALL" || searchQuery}
      <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
        <span>กำลังแสดงผลแบบกรองข้อมูล ({displayedSchedules.length} ตารางเรียน)</span>
        <button
          type="button"
          onclick={() => {
            filterYear = "ALL";
            filterSemester = "ALL";
            filterDegree = "ALL";
            filterStatus = "ALL";
            searchQuery = "";
          }}
          class="inline-flex items-center gap-1 text-brand-orange hover:underline cursor-pointer"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>รีเซ็ตตัวกรองทั้งหมด</span>
        </button>
      </div>
    {/if}
  </div>

  <!-- Schedules Content -->
  {#if isLoading}
    <div class="p-16 rounded-3xl bg-[#18191E] border border-white/10 text-center flex flex-col items-center justify-center gap-3">
      <Loader2 class="w-8 h-8 text-brand-orange animate-spin" />
      <span class="text-sm text-slate-300">
        กำลังโหลดข้อมูลตารางเรียน...
      </span>
    </div>
  {:else if error}
    <div class="p-8 rounded-3xl bg-red-500/10 border border-red-500/30 text-center flex flex-col items-center justify-center gap-3">
      <AlertCircle class="w-8 h-8 text-red-400" />
      <div class="text-red-300 text-sm font-semibold">{error}</div>
      <button
        type="button"
        onclick={fetchSchedules}
        class="mt-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
      >
        ลองใหม่อีกครั้ง
      </button>
    </div>
  {:else if displayedSchedules.length === 0}
    <div class="p-16 rounded-3xl bg-[#18191E] border border-white/10 text-center flex flex-col items-center justify-center gap-4">
      <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
        <Calendar class="w-7 h-7" />
      </div>
      <div>
        <h3 class="text-base font-bold text-white">
          ไม่พบตารางเรียนตามเงื่อนไขที่เลือก
        </h3>
        <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          ยังไม่มีการสร้างตารางเรียนสำหรับตัวกรองนี้ หรือคำค้นหาไม่ตรงกับตารางใดๆ
        </p>
      </div>
      <button
        type="button"
        onclick={() => (isCreateModalOpen = true)}
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs font-semibold shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>+ สร้างตารางเรียนใหม่</span>
      </button>
    </div>
  {:else if viewMode === "table"}
    <!-- Table View -->
    <div class="bg-[#18191E] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="border-b border-white/10 bg-[#141518] text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <th scope="col" class="py-3.5 px-4">หลักสูตร / สาขาวิชา</th>
              <th scope="col" class="py-3.5 px-4">ระดับ</th>
              <th scope="col" class="py-3.5 px-4">ชั้นปี / กลุ่มเรียน</th>
              <th scope="col" class="py-3.5 px-4">ภาค / ปีการศึกษา</th>
              <th scope="col" class="py-3.5 px-4">จำนวนวิชา</th>
              <th scope="col" class="py-3.5 px-4">สถานะ</th>
              <th scope="col" class="py-3.5 px-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            {#each displayedSchedules as schedule (schedule.id)}
              {@const isBusy = actionInProgressId === schedule.id}
              <tr class="hover:bg-white/[0.03] transition-colors group">
                <!-- Program Name -->
                <td class="py-4 px-4 font-semibold text-white max-w-xs sm:max-w-sm">
                  <a
                    href="/admin/schedules/{schedule.id}"
                    class="hover:text-brand-orange transition-colors flex flex-col"
                  >
                    <span class="leading-snug">{schedule.programName}</span>
                    {#if schedule.note}
                      <span class="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                        {schedule.note}
                      </span>
                    {/if}
                  </a>
                </td>

                <!-- Degree Badge -->
                <td class="py-4 px-4 whitespace-nowrap">
                  {#if schedule.degreeLevel === "BACHELOR"}
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      ปริญญาตรี
                    </span>
                  {:else if schedule.degreeLevel === "MASTER"}
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      ปริญญาโท
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      ปริญญาเอก
                    </span>
                  {/if}
                </td>

                <!-- Year & Section -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <div class="flex items-center gap-1.5 font-medium text-slate-200">
                    <span>ปี {schedule.yearLevel}</span>
                    {#if schedule.sectionGroup}
                      <span class="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 text-[11px]">
                        {schedule.sectionGroup}
                      </span>
                    {/if}
                  </div>
                </td>

                <!-- Term & Year -->
                <td class="py-4 px-4 whitespace-nowrap text-slate-300">
                  {schedule.semester === 3 ? "ฤดูร้อน" : `ภาค ${schedule.semester}`}/{schedule.academicYear}
                </td>

                <!-- Slots Count -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs">
                    <Clock class="w-3.5 h-3.5 text-brand-orange" />
                    <span>{schedule._count?.slots ?? 0} วิชา</span>
                  </span>
                </td>

                <!-- Status Badge -->
                <td class="py-4 px-4 whitespace-nowrap">
                  {#if schedule.status === "PUBLISHED"}
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>เผยแพร่แล้ว (Published)</span>
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>แบบร่าง (Draft)</span>
                    </span>
                  {/if}
                </td>

                <!-- Actions -->
                <td class="py-4 px-4 whitespace-nowrap text-right">
                  <div class="inline-flex items-center gap-1.5">
                    <!-- Edit Timetable -->
                    <a
                      href="/admin/schedules/{schedule.id}"
                      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-orange/20 hover:bg-brand-orange text-orange-300 hover:text-white border border-brand-orange/40 text-xs font-semibold transition-all active:scale-95"
                      title="จัดการตารางเรียน (Edit Timetable)"
                    >
                      <Edit3 class="w-3.5 h-3.5" />
                      <span>จัดการตาราง</span>
                    </a>

                    <!-- Duplicate / Clone -->
                    <button
                      type="button"
                      onclick={() => (cloneSourceSchedule = schedule)}
                      class="p-1.5 rounded-xl bg-white/5 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-white/10 transition-colors cursor-pointer"
                      title="คัดลอกตารางเรียน (Duplicate)"
                    >
                      <Copy class="w-4 h-4" />
                    </button>

                    <!-- Toggle Publish / Draft -->
                    <button
                      type="button"
                      disabled={isBusy}
                      onclick={() => handleToggleStatus(schedule)}
                      class="p-1.5 rounded-xl border transition-colors cursor-pointer {schedule.status === 'PUBLISHED' ? 'bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border-white/10' : 'bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border-white/10'}"
                      title={schedule.status === "PUBLISHED" ? "เปลี่ยนเป็นแบบร่าง (Set Draft)" : "เผยแพร่ตารางเรียน (Publish)"}
                    >
                      {#if isBusy}
                        <Loader2 class="w-4 h-4 animate-spin text-brand-orange" />
                      {:else if schedule.status === "PUBLISHED"}
                        <EyeOff class="w-4 h-4" />
                      {:else}
                        <Eye class="w-4 h-4" />
                      {/if}
                    </button>

                    <!-- Delete -->
                    <button
                      type="button"
                      disabled={isBusy}
                      onclick={() => handleDeleteSchedule(schedule)}
                      class="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
                      title="ลบตารางเรียน (Delete)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {:else}
    <!-- Card Grid View -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each displayedSchedules as schedule (schedule.id)}
        {@const isBusy = actionInProgressId === schedule.id}
        <div
          class="bg-[#18191E] border border-white/10 hover:border-white/20 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all group relative"
        >
          <!-- Top Row: Degree & Status -->
          <div class="flex items-center justify-between gap-2 mb-3">
            {#if schedule.degreeLevel === "BACHELOR"}
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                ปริญญาตรี
              </span>
            {:else if schedule.degreeLevel === "MASTER"}
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                ปริญญาโท
              </span>
            {:else}
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ปริญญาเอก
              </span>
            {/if}

            {#if schedule.status === "PUBLISHED"}
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>เผยแพร่แล้ว</span>
              </span>
            {:else}
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>แบบร่าง</span>
              </span>
            {/if}
          </div>

          <!-- Program Title -->
          <a
            href="/admin/schedules/{schedule.id}"
            class="block group-hover:text-brand-orange transition-colors"
          >
            <h3 class="font-bold text-white text-base leading-snug">
              {schedule.programName}
            </h3>
          </a>

          <!-- Meta Specs -->
          <div class="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-white/5 text-xs text-slate-300">
            <div>
              <span class="text-[10px] text-slate-500 block uppercase">
                ชั้นปี / กลุ่ม
              </span>
              <span class="font-medium text-white">
                ปี {schedule.yearLevel} {schedule.sectionGroup || "Sec 1"}
              </span>
            </div>

            <div>
              <span class="text-[10px] text-slate-500 block uppercase">
                ภาค / ปีการศึกษา
              </span>
              <span class="font-medium text-white">
                {schedule.semester === 3 ? "ฤดูร้อน" : `ภาค ${schedule.semester}`}/{schedule.academicYear}
              </span>
            </div>

            <div>
              <span class="text-[10px] text-slate-500 block uppercase">
                จำนวนวิชา
              </span>
              <span class="inline-flex items-center gap-1 font-semibold text-brand-orange">
                <Clock class="w-3.5 h-3.5" />
                <span>{schedule._count?.slots ?? 0} วิชา</span>
              </span>
            </div>

            <div>
              <span class="text-[10px] text-slate-500 block uppercase">
                อัปเดตล่าสุด
              </span>
              <span class="text-slate-400">
                {new Date(schedule.updatedAt).toLocaleDateString("th-TH")}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
            <a
              href="/admin/schedules/{schedule.id}"
              class="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-orange/20 hover:bg-brand-orange text-orange-300 hover:text-white border border-brand-orange/40 text-xs font-semibold transition-all active:scale-95"
            >
              <Edit3 class="w-3.5 h-3.5" />
              <span>จัดการตาราง</span>
            </a>

            <button
              type="button"
              onclick={() => (cloneSourceSchedule = schedule)}
              class="p-2 rounded-xl bg-white/5 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-white/10 transition-colors cursor-pointer"
              title="คัดลอกตารางเรียน"
            >
              <Copy class="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={isBusy}
              onclick={() => handleToggleStatus(schedule)}
              class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
              title={schedule.status === "PUBLISHED" ? "เปลี่ยนเป็นแบบร่าง" : "เผยแพร่ตารางเรียน"}
            >
              {#if isBusy}
                <Loader2 class="w-4 h-4 animate-spin text-brand-orange" />
              {:else if schedule.status === "PUBLISHED"}
                <EyeOff class="w-4 h-4 text-amber-400" />
              {:else}
                <Eye class="w-4 h-4 text-emerald-400" />
              {/if}
            </button>

            <button
              type="button"
              disabled={isBusy}
              onclick={() => handleDeleteSchedule(schedule)}
              class="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
              title="ลบตารางเรียน"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</main>

<!-- Schedule Creation Modal -->
<ScheduleModal
  isOpen={isCreateModalOpen}
  onClose={() => (isCreateModalOpen = false)}
  onSuccess={(newSchedule) => {
    notification = {
      type: "success",
      message: `สร้างตารางเรียน ${newSchedule.programName} เรียบร้อยแล้ว`,
    };
    fetchSchedules();
  }}
/>

<!-- Schedule Clone Modal -->
<CloneScheduleModal
  isOpen={cloneSourceSchedule !== null}
  sourceSchedule={cloneSourceSchedule}
  onClose={() => (cloneSourceSchedule = null)}
  onSuccess={(clonedSchedule) => {
    notification = {
      type: "success",
      message: `คัดลอกตารางเรียนไปยังปีการศึกษา ${clonedSchedule.academicYear}/${clonedSchedule.semester} สำเร็จ`,
    };
    fetchSchedules();
  }}
/>
