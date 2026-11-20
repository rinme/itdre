<script lang="ts">
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
  } from "lucide-svelte";
  import {
    DAYS_ORDER,
    DAY_METADATA,
    sortCourseSlots,
    getColorTheme,
    COURSE_TYPE_META,
    type ColorToken,
  } from "$lib/utils/weekly-grid";
  import type { CourseSlotData } from "./CourseSlotModal.svelte";
  import type { ConflictResult } from "$lib/utils/schedule-conflict";

  interface Props {
    slots: CourseSlotData[];
    conflicts?: ConflictResult[];
    onEditSlot: (slot: CourseSlotData) => void;
    onDeleteSlot: (slot: CourseSlotData) => void;
    onAddSlot?: () => void;
    class?: string;
  }

  let {
    slots,
    conflicts = [],
    onEditSlot,
    onDeleteSlot,
    onAddSlot,
    class: className = "",
  }: Props = $props();

  let searchQuery = $state<string>("");
  let selectedDay = $state<string>("ALL");

  let conflictingSlotIds = $derived.by(() => {
    const ids = new Set<string>();
    conflicts.forEach((c) => {
      if (c.conflictingSlot.id) ids.add(c.conflictingSlot.id);
    });
    return ids;
  });

  let filteredSlots = $derived.by(() => {
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
  });
</script>

<div
  class="bg-[#1A1B20] border border-white/10 rounded-3xl shadow-xl overflow-hidden {className}"
>
  <!-- Top Filter and Search Bar -->
  <div class="p-4 sm:p-5 border-b border-white/10 bg-[#141518]/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
    <!-- Search Input -->
    <div class="relative flex-1 max-w-md">
      <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder="ค้นหารหัสวิชา, ชื่อวิชา, ผู้สอน, ห้องเรียน..."
        bind:value={searchQuery}
        class="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-brand-orange transition-colors"
      />
    </div>

    <!-- Day Filter Pills -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
      <button
        type="button"
        onclick={() => (selectedDay = "ALL")}
        class="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer {selectedDay === 'ALL' ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20' : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'}"
      >
        ทุกวัน ({slots.length})
      </button>
      {#each DAYS_ORDER as day (day)}
        {@const count = slots.filter((s) => s.dayOfWeek === day).length}
        {@const info = DAY_METADATA[day]}
        {@const isSelected = selectedDay === day}
        <button
          type="button"
          onclick={() => (selectedDay = day)}
          class="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer {isSelected ? 'bg-white/20 border border-white/30 text-white shadow-md' : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'}"
        >
          <span
            class="w-2 h-2 rounded-full"
            style="background-color: {info.colorHex};"
          ></span>
          <span>{info.shortTh}</span>
          {#if count > 0}
            <span class="text-[10px] text-slate-400">({count})</span>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Add Slot Shortcut Button -->
    {#if onAddSlot}
      <button
        type="button"
        onclick={onAddSlot}
        class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-orange hover:bg-orange-600 text-white text-xs font-semibold shadow-md shadow-brand-orange/25 transition-all cursor-pointer shrink-0"
      >
        <Plus class="w-4 h-4" />
        <span>เพิ่มวิชา</span>
      </button>
    {/if}
  </div>

  <!-- Table Content -->
  <div class="overflow-x-auto">
    <table class="w-full text-left text-xs sm:text-sm text-slate-300">
      <thead class="bg-[#17181C] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10 font-semibold">
        <tr>
          <th scope="col" class="py-3 px-4">วัน</th>
          <th scope="col" class="py-3 px-4">เวลา</th>
          <th scope="col" class="py-3 px-4">รหัสวิชา</th>
          <th scope="col" class="py-3 px-4">ชื่อวิชา</th>
          <th scope="col" class="py-3 px-3">ตอนเรียน</th>
          <th scope="col" class="py-3 px-3">ประเภท</th>
          <th scope="col" class="py-3 px-4">ห้องเรียน</th>
          <th scope="col" class="py-3 px-4">ผู้สอน</th>
          <th scope="col" class="py-3 px-4 text-right">การจัดการ</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-white/5">
        {#if filteredSlots.length === 0}
          <tr>
            <td colspan="9" class="py-12 text-center text-slate-500">
              <div class="flex flex-col items-center justify-center gap-2">
                <BookOpen class="w-8 h-8 opacity-40" />
                <p class="text-sm">ไม่พบข้อมูลรายวิชาที่ตรงกับเงื่อนไข</p>
                {#if onAddSlot}
                  <button
                    type="button"
                    onclick={onAddSlot}
                    class="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-brand-orange text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    <span>เพิ่มรายวิชาแรก</span>
                  </button>
                {/if}
              </div>
            </td>
          </tr>
        {:else}
          {#each filteredSlots as slot (slot.id || `${slot.courseCode}-${slot.dayOfWeek}-${slot.startTime}`)}
            {@const dayInfo = DAY_METADATA[slot.dayOfWeek]}
            {@const theme = getColorTheme(slot.color as ColorToken | null)}
            {@const typeMeta = COURSE_TYPE_META[slot.courseType] || COURSE_TYPE_META.LECTURE}
            {@const hasConflict = slot.id ? conflictingSlotIds.has(slot.id) : false}
            <tr class="hover:bg-white/[0.02] transition-colors {hasConflict ? 'bg-amber-500/5' : ''}">
              <!-- Day -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <div class="flex items-center gap-1.5">
                  <span
                    class="w-2.5 h-2.5 rounded-full shrink-0"
                    style="background-color: {dayInfo.colorHex};"
                  ></span>
                  <span class="font-medium text-white">{dayInfo.th}</span>
                </div>
              </td>

              <!-- Time -->
              <td class="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                <div class="flex items-center gap-1 text-slate-300">
                  <Clock class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              </td>

              <!-- Code -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span
                    class="w-2.5 h-2.5 rounded-full shrink-0 {theme.swatchBg}"
                  ></span>
                  <span class="font-mono font-bold text-white">
                    {slot.courseCode}
                  </span>
                  {#if hasConflict}
                    <span
                      class="inline-flex items-center text-amber-400"
                      title="มีข้อขัดแย้งเวลาหรือห้องเรียน"
                    >
                      <AlertTriangle class="w-3.5 h-3.5" />
                    </span>
                  {/if}
                </div>
              </td>

              <!-- Course Name -->
              <td class="py-3.5 px-4 max-w-xs">
                <div class="font-medium text-white line-clamp-2">
                  {slot.courseName}
                </div>
              </td>

              <!-- Section -->
              <td class="py-3.5 px-3 whitespace-nowrap">
                {#if slot.section}
                  <span class="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-xs">
                    {slot.section}
                  </span>
                {:else}
                  <span class="text-slate-500">-</span>
                {/if}
              </td>

              <!-- Type -->
              <td class="py-3.5 px-3 whitespace-nowrap">
                <span
                  class="inline-block px-2 py-0.5 rounded-md border text-[11px] font-medium {typeMeta.badgeClass}"
                >
                  {typeMeta.th}
                </span>
              </td>

              <!-- Room -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                {#if slot.room}
                  <span class="inline-flex items-center gap-1 text-slate-200">
                    <MapPin class="w-3.5 h-3.5 text-brand-orange shrink-0" />
                    <span>{slot.room}</span>
                  </span>
                {:else}
                  <span class="text-slate-500 italic">ไม่ระบุ</span>
                {/if}
              </td>

              <!-- Instructor -->
              <td class="py-3.5 px-4 max-w-[180px] truncate">
                {#if slot.instructors && slot.instructors.length > 0}
                  <span
                    class="inline-flex items-center gap-1 text-slate-300 truncate"
                    title={slot.instructors.join(", ")}
                  >
                    <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span class="truncate">{slot.instructors.join(", ")}</span>
                  </span>
                {:else}
                  <span class="text-slate-500 italic">-</span>
                {/if}
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onclick={() => onEditSlot(slot)}
                    class="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="แก้ไขรายวิชา"
                    aria-label="Edit course slot"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onclick={() => onDeleteSlot(slot)}
                    class="p-1.5 rounded-lg text-red-400 hover:text-red-200 hover:bg-red-500/20 transition-colors cursor-pointer"
                    title="ลบรายวิชา"
                    aria-label="Delete course slot"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>
