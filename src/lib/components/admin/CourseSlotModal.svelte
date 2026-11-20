<script module lang="ts">
  import type { DayOfWeek, CourseType } from "@prisma/client";

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
    instructors?: string[] | null;
    courseType: CourseType;
    color?: string | null;
  }
</script>

<script lang="ts">
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
    ChevronDown,
    ChevronUp,
    Users,
  } from "lucide-svelte";
  import {
    DAYS_ORDER,
    DAY_METADATA,
    COLOR_THEMES,
    COLOR_TOKEN_KEYS,
    COURSE_TYPE_META,
    type ColorToken,
  } from "$lib/weekly-grid";
  import {
    detectCourseSlotConflicts,
    type ExistingSlot,
    type ConflictResult,
  } from "$lib/schedule-conflict";
  import ConflictBanner from "./ConflictBanner.svelte";
  import { adminPresetsState } from "$lib/state/admin-presets.svelte";

  interface Props {
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

  let {
    isOpen,
    onClose,
    scheduleId,
    existingSlots,
    slot = null,
    initialSlot = null,
    onSuccess,
  }: Props = $props();

  const isEditMode = $derived(Boolean(slot?.id));

  // Form State
  let courseCode = $state<string>("");
  let courseName = $state<string>("");
  let section = $state<string>("");
  let dayOfWeek = $state<DayOfWeek>("MONDAY");
  let startTime = $state<string>("09:00");
  let endTime = $state<string>("12:00");
  let room = $state<string>("");
  let instructors = $state<string>("");
  let courseType = $state<CourseType>("LECTURE");
  let color = $state<ColorToken>("orange");

  // Presets State
  let showCoursePresets = $state(false);
  let showInstructorPresets = $state(false);
  let coursePresetQuery = $state("");
  let instructorQuery = $state("");

  let filteredCoursePresets = $derived(
    adminPresetsState.coursePresets.filter(
      (p) =>
        p.courseCode.toLowerCase().includes(coursePresetQuery.toLowerCase()) ||
        p.courseName.toLowerCase().includes(coursePresetQuery.toLowerCase())
    )
  );

  let filteredInstructors = $derived(
    adminPresetsState.instructors.filter(
      (i) =>
        i.nameTh.toLowerCase().includes(instructorQuery.toLowerCase()) ||
        (i.nameEn?.toLowerCase().includes(instructorQuery.toLowerCase()) ?? false)
    )
  );

  // Status state
  let isSubmitting = $state<boolean>(false);
  let formError = $state<string | null>(null);

  const COMMON_TIME_PRESETS = [
    { label: "09:00 - 12:00 (3 ชม.)", start: "09:00", end: "12:00" },
    { label: "13:00 - 16:00 (3 ชม.)", start: "13:00", end: "16:00" },
    { label: "09:00 - 16:00 (ทั้งวัน)", start: "09:00", end: "16:00" },
    { label: "16:30 - 19:30 (ภาคค่ำ)", start: "16:30", end: "19:30" },
  ];

  // Initialize or reset form values when opening modal
  $effect(() => {
    if (!isOpen) return;

    showCoursePresets = false;
    showInstructorPresets = false;
    coursePresetQuery = "";
    instructorQuery = "";

    if (slot) {
      courseCode = slot.courseCode || "";
      courseName = slot.courseName || "";
      section = slot.section || "";
      dayOfWeek = slot.dayOfWeek || "MONDAY";
      startTime = slot.startTime || "09:00";
      endTime = slot.endTime || "12:00";
      room = slot.room || "";
      instructors = (slot.instructors ?? []).join(", ");
      courseType = slot.courseType || "LECTURE";
      color = (slot.color as ColorToken) || "orange";
    } else {
      courseCode = "";
      courseName = "";
      section = "";
      dayOfWeek = initialSlot?.dayOfWeek || "MONDAY";
      startTime = initialSlot?.startTime || "09:00";
      endTime = initialSlot?.endTime || "12:00";
      room = "";
      instructors = "";
      courseType = "LECTURE";
      color = "orange";
    }
    formError = null;
  });

  // Live Conflict Detection
  let liveConflicts = $derived.by<ConflictResult[]>(() => {
    if (!startTime || !endTime || startTime >= endTime) return [];

    const candidate = {
      id: slot?.id,
      dayOfWeek,
      startTime,
      endTime,
      room: room.trim() || null,
    };

    return detectCourseSlotConflicts(candidate, existingSlots);
  });

  let isTimeRangeValid = $derived(Boolean(startTime && endTime && startTime < endTime));

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    formError = null;

    if (!courseCode.trim()) {
      formError = "กรุณาระบุรหัสวิชา (Course code is required)";
      return;
    }
    if (!courseName.trim()) {
      formError = "กรุณาระบุชื่อวิชา (Course name is required)";
      return;
    }
    if (!isTimeRangeValid) {
      formError = "ช่วงเวลาไม่ถูกต้อง: เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด";
      return;
    }

    isSubmitting = true;

    try {
      const payload = {
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        section: section.trim() || null,
        dayOfWeek,
        startTime,
        endTime,
        room: room.trim() || null,
        instructors: instructors.trim()
          ? instructors.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
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
      formError = err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
    role="dialog"
    aria-modal="true"
    aria-labelledby="course-slot-modal-title"
  >
    <div
      class="relative w-full max-w-2xl bg-[#1A1B20] text-white border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-6"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-[#141518]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
            <Calendar class="w-5 h-5" />
          </div>
          <div>
            <h2
              id="course-slot-modal-title"
              class="text-lg sm:text-xl font-bold text-white leading-tight"
            >
              {isEditMode
                ? "แก้ไขข้อมูลรายวิชา (Edit Course Slot)"
                : "เพิ่มรายวิชาในตารางเรียน (Add Course Slot)"}
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              กำหนดวัน เวลา ห้องเรียน และรายละเอียดรายวิชา
            </p>
          </div>
        </div>
        <button
          type="button"
          onclick={onClose}
          class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Live Conflict Warning Banner inside modal -->
      {#if liveConflicts.length > 0}
        <div class="mx-5 sm:mx-6 mt-5">
          <ConflictBanner
            conflicts={liveConflicts}
            compact
            title={`พบข้อขัดแย้งกับวิชาอื่น (${liveConflicts.length} จุด)`}
          />
        </div>
      {/if}

      <!-- Form Error alert -->
      {#if formError}
        <div class="mx-5 sm:mx-6 mt-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs sm:text-sm">
          <AlertCircle class="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div class="flex-1">{formError}</div>
        </div>
      {/if}

      <!-- Form -->
      <form onsubmit={handleSubmit} class="p-5 sm:p-6 space-y-4 sm:space-y-5">
        <!-- ── Course Preset Picker ── -->
        <div class="border border-white/10 rounded-xl overflow-hidden">
          <button
            type="button"
            onclick={() => (showCoursePresets = !showCoursePresets)}
            class="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/8 text-sm text-slate-300 transition-colors cursor-pointer"
          >
            <span class="flex items-center gap-2">
              <BookOpen class="w-4 h-4 text-brand-orange" />
              เลือกรายวิชาจาก Presets ({adminPresetsState.coursePresets.length})
            </span>
            {#if showCoursePresets}
              <ChevronUp class="w-4 h-4" />
            {:else}
              <ChevronDown class="w-4 h-4" />
            {/if}
          </button>
          {#if showCoursePresets}
            <div class="p-3 space-y-2 border-t border-white/10">
              <input
                type="text"
                bind:value={coursePresetQuery}
                placeholder="ค้นหารหัส/ชื่อวิชา..."
                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange/50"
              />
              <div class="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                {#if filteredCoursePresets.length === 0}
                  <p class="text-xs text-slate-500 py-2">ไม่พบ preset</p>
                {/if}
                {#each filteredCoursePresets as p (p.id)}
                  {@const theme = COLOR_THEMES[(p.color as ColorToken) ?? "orange"] ?? COLOR_THEMES["orange"]}
                  <button
                    type="button"
                    onclick={() => {
                      courseCode = p.courseCode;
                      courseName = p.courseName;
                      courseType = p.courseType as CourseType;
                      color = (p.color as ColorToken) ?? "orange";
                      showCoursePresets = false;
                      coursePresetQuery = "";
                    }}
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:scale-105 cursor-pointer {theme.cardBg} {theme.cardBorder} {theme.cardText}"
                  >
                    <span class="w-2 h-2 rounded-full {theme.swatchBg} shrink-0"></span>
                    <span class="font-mono">{p.courseCode}</span>
                    <span class="text-slate-400">—</span>
                    <span class="truncate max-w-[100px]">{p.courseName}</span>
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- ── Instructor Preset Picker ── -->
        <div class="border border-white/10 rounded-xl overflow-hidden">
          <button
            type="button"
            onclick={() => (showInstructorPresets = !showInstructorPresets)}
            class="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/8 text-sm text-slate-300 transition-colors cursor-pointer"
          >
            <span class="flex items-center gap-2">
              <Users class="w-4 h-4 text-blue-400" />
              เลือกผู้สอนจาก Presets ({adminPresetsState.instructors.length})
            </span>
            {#if showInstructorPresets}
              <ChevronUp class="w-4 h-4" />
            {:else}
              <ChevronDown class="w-4 h-4" />
            {/if}
          </button>
          {#if showInstructorPresets}
            <div class="p-3 space-y-2 border-t border-white/10">
              <input
                type="text"
                bind:value={instructorQuery}
                placeholder="ค้นหาชื่ออาจารย์..."
                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange/50"
              />
              <div class="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                {#if filteredInstructors.length === 0}
                  <p class="text-xs text-slate-500 py-2">ไม่พบผู้สอน</p>
                {/if}
                {#each filteredInstructors as inst (inst.id)}
                  <button
                    type="button"
                    onclick={() => {
                      const current = instructors.trim();
                      if (!current) {
                        instructors = inst.nameTh;
                      } else {
                        const list = current.split(",").map((s) => s.trim()).filter(Boolean);
                        if (!list.includes(inst.nameTh)) {
                          instructors = `${current}, ${inst.nameTh}`;
                        }
                      }
                      instructorQuery = "";
                    }}
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-300 text-xs font-medium hover:bg-blue-500/20 transition-all hover:scale-105 cursor-pointer"
                  >
                    {inst.nameTh}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Day of Week Selector -->
        <div>
          <span class="block text-xs font-semibold text-slate-300 mb-2">
            วันในสัปดาห์ (Day of Week) <span class="text-brand-orange">*</span>
          </span>
          <div class="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {#each DAYS_ORDER as day (day)}
              {@const info = DAY_METADATA[day]}
              {@const isSelected = dayOfWeek === day}
              <button
                type="button"
                onclick={() => (dayOfWeek = day)}
                class="flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all cursor-pointer {isSelected ? 'bg-white/15 border-brand-orange text-white ring-2 ring-brand-orange/40 font-bold shadow-md' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'}"
              >
                <span
                  class="w-2.5 h-2.5 rounded-full mb-1"
                  style="background-color: {info.colorHex};"
                ></span>
                <span class="text-[11px] leading-tight font-semibold">
                  {info.shortTh}
                </span>
                <span class="text-[10px] text-slate-400 font-normal">
                  {info.shortEn}
                </span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Time pickers: Start Time & End Time -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock class="w-4 h-4 text-brand-orange" />
              เวลาเรียน (Start & End Time) <span class="text-brand-orange">*</span>
            </span>
            {#if !isTimeRangeValid}
              <span class="text-[11px] text-red-400">
                เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด
              </span>
            {/if}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label for="slot-start-time" class="block text-[11px] text-slate-400 mb-1">
                เวลาเริ่มต้น (Start Time)
              </label>
              <input
                id="slot-start-time"
                type="time"
                required
                step="900"
                bind:value={startTime}
                class="w-full px-3 py-2 rounded-xl bg-[#141518] border border-white/15 text-white text-sm focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>
            <div>
              <label for="slot-end-time" class="block text-[11px] text-slate-400 mb-1">
                เวลาสิ้นสุด (End Time)
              </label>
              <input
                id="slot-end-time"
                type="time"
                required
                step="900"
                bind:value={endTime}
                class="w-full px-3 py-2 rounded-xl bg-[#141518] border text-white text-sm focus:outline-none transition-colors {!isTimeRangeValid ? 'border-red-500 focus:border-red-500' : 'border-white/15 focus:border-brand-orange'}"
              />
            </div>
          </div>

          <!-- Quick time presets -->
          <div class="flex items-center gap-1.5 flex-wrap pt-1">
            <span class="text-[11px] text-slate-400 mr-1">ทางลัดช่วงเวลา:</span>
            {#each COMMON_TIME_PRESETS as preset (preset.label)}
              <button
                type="button"
                onclick={() => {
                  startTime = preset.start;
                  endTime = preset.end;
                }}
                class="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Course Code & Name -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-1">
            <label for="slot-course-code" class="block text-xs font-semibold text-slate-300 mb-1.5">
              รหัสวิชา (Course Code) <span class="text-brand-orange">*</span>
            </label>
            <div class="relative">
              <Hash class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="slot-course-code"
                type="text"
                required
                placeholder="เช่น 060133101"
                bind:value={courseCode}
                class="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors font-mono"
              />
            </div>
          </div>

          <div class="sm:col-span-2">
            <label for="slot-course-name" class="block text-xs font-semibold text-slate-300 mb-1.5">
              ชื่อวิชา (Course Name) <span class="text-brand-orange">*</span>
            </label>
            <div class="relative">
              <BookOpen class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="slot-course-name"
                type="text"
                required
                placeholder="เช่น Web Application Development"
                bind:value={courseName}
                class="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>
          </div>
        </div>

        <!-- Section & Room & Instructor -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label for="slot-section" class="block text-xs font-semibold text-slate-300 mb-1.5">
              กลุ่มเรียน (Section)
            </label>
            <input
              id="slot-section"
              type="text"
              placeholder="เช่น Sec 1 หรือ กลุ่ม 1"
              bind:value={section}
              class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors"
            />
          </div>

          <div>
            <label for="slot-room" class="block text-xs font-semibold text-slate-300 mb-1.5">
              ห้องเรียน (Room)
            </label>
            <div class="relative">
              <MapPin class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="slot-room"
                type="text"
                placeholder="เช่น 78-601"
                bind:value={room}
                class="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>
          </div>

          <div>
            <label for="slot-instructors" class="block text-xs font-semibold text-slate-300 mb-1.5">
              ผู้สอน (Instructors)
            </label>
            <div class="relative">
              <User class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="slot-instructors"
                type="text"
                placeholder="เช่น ดร. อานนท์ วงศ์สมบูรณ์, อ.สมชาย"
                bind:value={instructors}
                class="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>
          </div>
        </div>

        <!-- Course Type (LECTURE, LAB, BOTH) -->
        <div>
          <span class="block text-xs font-semibold text-slate-300 mb-1.5">
            ประเภทการเรียนการสอน (Course Type)
          </span>
          <div class="grid grid-cols-3 gap-2">
            {#each (["LECTURE", "LAB", "BOTH"] as CourseType[]) as type (type)}
              {@const meta = COURSE_TYPE_META[type]}
              {@const isSelected = courseType === type}
              <button
                type="button"
                onclick={() => (courseType = type)}
                class="px-3 py-2 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer {isSelected ? `${meta.badgeClass} ring-2 ring-brand-orange/40 font-bold bg-white/15` : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}"
              >
                <div>{meta.th}</div>
                <div class="text-[10px] text-slate-400 font-normal">
                  {meta.en}
                </div>
              </button>
            {/each}
          </div>
        </div>

        <!-- Color Theme Selector -->
        <div>
          <span class="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Palette class="w-3.5 h-3.5 text-brand-orange" />
            โทนสีการแสดงผล (Color Theme Token)
          </span>
          <div class="flex items-center gap-2 flex-wrap">
            {#each COLOR_TOKEN_KEYS as token (token)}
              {@const theme = COLOR_THEMES[token]}
              {@const isSelected = color === token}
              <button
                type="button"
                onclick={() => (color = token)}
                title={theme.label}
                class="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer {isSelected ? 'bg-white/15 border-white/40 ring-2 ring-white/30 text-white font-semibold' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}"
              >
                <span
                  class="w-3.5 h-3.5 rounded-full {theme.swatchBg} flex items-center justify-center"
                >
                  {#if isSelected}
                    <Check class="w-2.5 h-2.5 text-white" />
                  {/if}
                </span>
                <span class="capitalize">{token}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onclick={onClose}
            disabled={isSubmitting}
            class="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            ยกเลิก (Cancel)
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isTimeRangeValid}
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-medium text-sm shadow-lg shadow-brand-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {#if isSubmitting}
              <Loader2 class="w-4 h-4 animate-spin" />
              <span>กำลังบันทึก...</span>
            {:else if isEditMode}
              บันทึกการแก้ไข (Update Slot)
            {:else}
              เพิ่มรายวิชา (Add Slot)
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
