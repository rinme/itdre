<script lang="ts">
  import type { DayOfWeek } from "@prisma/client";
  import {
    Clock,
    MapPin,
    User,
    Plus,
    Edit2,
    Trash2,
    AlertTriangle,
  } from "lucide-svelte";
  import {
    DAYS_ORDER,
    DAY_METADATA,
    GRID_START_HOUR,
    GRID_END_HOUR,
    GRID_TOTAL_HOURS,
    GRID_START_MINUTES,
    GRID_TOTAL_MINUTES,
    calculateSlotPosition,
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
    onAddSlot: (prefill: {
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
    }) => void;
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

  const hourMarkers = Array.from(
    { length: GRID_END_HOUR - GRID_START_HOUR },
    (_, i) => `${String(GRID_START_HOUR + i).padStart(2, "0")}:00`
  );

  let slotsByDay = $derived.by(() => {
    const map = new Map<DayOfWeek, CourseSlotData[]>();
    DAYS_ORDER.forEach((day) => map.set(day, []));

    slots.forEach((slot) => {
      const list = map.get(slot.dayOfWeek) || [];
      list.push(slot);
      map.set(slot.dayOfWeek, list);
    });

    return map;
  });

  let conflictingSlotIds = $derived.by(() => {
    const ids = new Set<string>();
    conflicts.forEach((c) => {
      if (c.conflictingSlot.id) ids.add(c.conflictingSlot.id);
    });
    return ids;
  });

  function getDefaultEndTime(startHour: number): string {
    const endH = Math.min(GRID_END_HOUR, startHour + 3);
    return `${String(endH).padStart(2, "0")}:00`;
  }
</script>

<div
  class="w-full bg-[#1A1B20] border border-white/10 rounded-3xl shadow-xl overflow-hidden {className}"
>
  <!-- Top Banner Info -->
  <div class="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#141518]/90 text-xs text-slate-400">
    <div class="flex items-center gap-2">
      <Clock class="w-4 h-4 text-brand-orange" />
      <span>
        ตารางเวลาเรียนรายสัปดาห์ (08:00 - 20:00 น.) — คลิกช่องว่างเพื่อเพิ่มวิชา
      </span>
    </div>
    <div class="flex items-center gap-4 text-slate-400">
      <span class="hidden sm:inline">
        ทั้งหมด {slots.length} รายวิชา
      </span>
      {#if conflicts.length > 0}
        <span class="inline-flex items-center gap-1 text-amber-400 font-medium">
          <AlertTriangle class="w-3.5 h-3.5" />
          {conflicts.length} ข้อขัดแย้ง
        </span>
      {/if}
    </div>
  </div>

  <!-- Grid Container (Horizontal scroll on smaller screens) -->
  <div class="overflow-x-auto">
    <div class="min-w-[1000px] select-none">
      <!-- Day Headers -->
      <div class="grid grid-cols-[72px_repeat(7,1fr)] border-b border-white/10 bg-[#17181C]">
        <!-- Time Axis Header -->
        <div class="flex items-center justify-center p-3 text-[11px] font-semibold text-slate-400 border-r border-white/10 uppercase tracking-wider">
          เวลา
        </div>

        <!-- 7 Days Headers -->
        {#each DAYS_ORDER as day (day)}
          {@const info = DAY_METADATA[day]}
          {@const daySlots = slotsByDay.get(day) || []}
          <div
            class="p-3 border-r border-white/10 last:border-r-0 text-center"
          >
            <div class="flex items-center justify-center gap-1.5">
              <span
                class="w-2.5 h-2.5 rounded-full"
                style="background-color: {info.colorHex};"
              ></span>
              <span class="text-xs font-bold text-white">
                {info.th}
              </span>
              <span class="text-[10px] text-slate-400">
                ({info.shortEn})
              </span>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">
              {daySlots.length > 0
                ? `${daySlots.length} วิชา`
                : "ไม่มีการเรียนการสอน"}
            </div>
          </div>
        {/each}
      </div>

      <!-- Grid Canvas -->
      <div class="relative grid grid-cols-[72px_repeat(7,1fr)] bg-[#141518]">
        <!-- Left Time Column (Exactly 12 hourly rows matching the 12 rows of 60px = 720px total) -->
        <div class="relative border-r border-white/10 bg-[#17181C]/70">
          {#each hourMarkers as time (time)}
            <div
              class="h-[60px] flex items-start justify-center pr-1.5 pt-1 border-b border-white/5 text-[11px] font-mono text-slate-400"
            >
              <span>{time}</span>
            </div>
          {/each}
          <!-- Bottom 20:00 marker aligned with the bottom edge (720px) -->
          <div class="absolute bottom-0.5 left-0 right-0 flex justify-center pr-1.5 text-[10px] font-mono text-slate-500 pointer-events-none">
            <span>{`${String(GRID_END_HOUR).padStart(2, "0")}:00`}</span>
          </div>
        </div>

        <!-- 7 Day Columns -->
        {#each DAYS_ORDER as day (day)}
          {@const daySlots = slotsByDay.get(day) || []}
          <div
            class="relative border-r border-white/10 last:border-r-0"
          >
            <!-- Background Hourly Click Targets & Lines -->
            {#each Array.from({ length: GRID_TOTAL_HOURS }) as _, hIdx}
              {@const hour = GRID_START_HOUR + hIdx}
              {@const startHStr = `${String(hour).padStart(2, "0")}:00`}
              {@const defaultEndStr = getDefaultEndTime(hour)}
              <div
                onclick={() =>
                  onAddSlot({
                    dayOfWeek: day,
                    startTime: startHStr,
                    endTime: defaultEndStr,
                  })
                }
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onAddSlot({
                      dayOfWeek: day,
                      startTime: startHStr,
                      endTime: defaultEndStr,
                    });
                  }
                }}
                role="button"
                tabindex="0"
                class="group relative h-[60px] border-b border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors"
                title={`คลิกเพื่อเพิ่มรายวิชา ${DAY_METADATA[day].th} ${startHStr} - ${defaultEndStr}`}
              >
                <!-- 30-minute subtle dashed divider line -->
                <div class="absolute top-[30px] left-0 right-0 border-b border-white/[0.02]"></div>

                <!-- Subtle + button on hover -->
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-orange/20 border border-brand-orange/40 text-[10px] text-brand-orange font-medium shadow-sm">
                    <Plus class="w-3 h-3" />
                    เพิ่มวิชา
                  </span>
                </div>
              </div>
            {/each}

            <!-- Absolute Slot Cards Layer -->
            <div class="absolute inset-0 pointer-events-none p-1">
              {#each daySlots as slot (slot.id || `${slot.courseCode}-${slot.startTime}`)}
                {@const pos = calculateSlotPosition(
                  slot.startTime,
                  slot.endTime,
                  GRID_START_MINUTES,
                  GRID_TOTAL_MINUTES
                )}
                {@const theme = getColorTheme(slot.color as ColorToken | null)}
                {@const typeMeta = COURSE_TYPE_META[slot.courseType] || COURSE_TYPE_META.LECTURE}
                {@const hasConflict = slot.id ? conflictingSlotIds.has(slot.id) : false}

                <div
                  style="top: {pos.topPercent}%; height: {pos.heightPercent}%;"
                  onclick={(e) => {
                    e.stopPropagation();
                    onEditSlot(slot);
                  }}
                  onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onEditSlot(slot);
                    }
                  }}
                  role="button"
                  tabindex="0"
                  class="group absolute left-1 right-1 rounded-xl border p-2 text-left cursor-pointer transition-all duration-150 pointer-events-auto hover:z-20 hover:shadow-2xl overflow-hidden flex flex-col justify-between {theme.cardBg} {theme.cardBorder} {hasConflict ? 'ring-2 ring-amber-500 shadow-amber-500/20' : ''}"
                >
                  <!-- Left Accent Color Strip -->
                  <div
                    class="absolute left-0 top-0 bottom-0 w-1 {theme.accentBar}"
                  ></div>

                  <!-- Card Content Top -->
                  <div class="pl-1">
                    <div class="flex items-start justify-between gap-1">
                      <div class="flex items-center gap-1 flex-wrap">
                        <span class="font-mono text-[11px] font-bold text-white tracking-tight">
                          {slot.courseCode}
                        </span>
                        {#if slot.section}
                          <span class="rounded bg-black/40 px-1 py-0.2 text-[9px] font-medium text-slate-300">
                            {slot.section}
                          </span>
                        {/if}
                      </div>

                      <!-- Hover Quick Action Buttons -->
                      <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded-lg p-0.5 shadow-md">
                        <button
                          type="button"
                          onclick={(e) => {
                            e.stopPropagation();
                            onEditSlot(slot);
                          }}
                          class="p-1 rounded text-slate-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                          title="แก้ไข (Edit)"
                          aria-label="Edit course slot"
                        >
                          <Edit2 class="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onclick={(e) => {
                            e.stopPropagation();
                            onDeleteSlot(slot);
                          }}
                          class="p-1 rounded text-red-400 hover:text-red-200 hover:bg-red-500/30 transition-colors cursor-pointer"
                          title="ลบ (Delete)"
                          aria-label="Delete course slot"
                        >
                          <Trash2 class="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <!-- Course Name -->
                    <h4
                      class="font-medium text-xs text-white/95 leading-tight line-clamp-2 mt-0.5"
                      title={slot.courseName}
                    >
                      {slot.courseName}
                    </h4>
                  </div>

                  <!-- Card Content Bottom: Time, Room, Instructor, Type -->
                  <div class="pl-1 mt-1 space-y-1">
                    <div class="flex items-center justify-between text-[10px] text-slate-300 gap-1">
                      <span class="font-mono flex items-center gap-1 font-semibold text-white/90">
                        <Clock class="w-2.5 h-2.5 text-slate-400" />
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span
                        class="rounded px-1.5 py-0.2 text-[9px] border font-medium {typeMeta.badgeClass}"
                      >
                        {typeMeta.th}
                      </span>
                    </div>

                    <div class="flex items-center justify-between text-[10px] text-slate-300 gap-1 flex-wrap">
                      {#if slot.room}
                        <span
                          class="flex items-center gap-0.5 text-slate-200 font-medium truncate"
                          title={`ห้อง: ${slot.room}`}
                        >
                          <MapPin class="w-2.5 h-2.5 text-brand-orange shrink-0" />
                          <span class="truncate">{slot.room}</span>
                        </span>
                      {:else}
                        <span class="text-slate-400 italic">
                          ไม่ระบุห้อง
                        </span>
                      {/if}

                      {#if slot.instructors && slot.instructors.length > 0}
                        <span
                          class="flex items-center gap-0.5 text-slate-300 truncate max-w-[120px]"
                          title={`ผู้สอน: ${slot.instructors.join(", ")}`}
                        >
                          <User class="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span class="truncate">
                            {slot.instructors.join(", ")}
                          </span>
                        </span>
                      {/if}
                    </div>

                    <!-- Conflict Warning Badge if slot collides -->
                    {#if hasConflict}
                      <div class="flex items-center gap-1 rounded bg-amber-500/25 border border-amber-500/40 px-1.5 py-0.5 text-[9px] font-bold text-amber-200">
                        <AlertTriangle class="w-2.5 h-2.5 shrink-0 text-amber-400" />
                        <span class="truncate">มีข้อขัดแย้ง</span>
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
