<script module lang="ts">
  import type { DayOfWeek, CourseType } from '@prisma/client';

  export interface PublicCourseSlot {
    id: string;
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
    Clock,
    MapPin,
    User
  } from 'lucide-svelte';
  import {
    DAYS_ORDER,
    DAY_METADATA,
    GRID_START_HOUR,
    GRID_END_HOUR,
    GRID_TOTAL_HOURS,
    GRID_START_MINUTES,
    GRID_TOTAL_MINUTES,
    calculateSlotPosition,
    getPublicColorTheme,
    COURSE_TYPE_META
  } from '$lib/utils/weekly-grid';
  import { languageState, t } from '$lib/state/language.svelte';

  interface Props {
    slots: PublicCourseSlot[];
    class?: string;
    onSlotClick?: (slot: PublicCourseSlot) => void;
  }

  let {
    slots,
    class: className = '',
    onSlotClick
  }: Props = $props();

  const hourMarkers = Array.from(
    { length: GRID_TOTAL_HOURS },
    (_, i) => `${String(GRID_START_HOUR + i).padStart(2, '0')}:00`
  );

  const slotsByDay = $derived.by(() => {
    const map = new Map<DayOfWeek, PublicCourseSlot[]>();
    DAYS_ORDER.forEach((day) => map.set(day, []));

    slots.forEach((slot) => {
      const list = map.get(slot.dayOfWeek) || [];
      list.push(slot);
      map.set(slot.dayOfWeek, list);
    });

    return map;
  });
</script>

<div
  class={`w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden printable-grid-container ${className}`}
>
  <!-- Top Info Bar -->
  <div class="no-print flex items-center justify-between px-5 py-3.5 border-b border-slate-200/90 bg-slate-50/80 text-xs text-slate-600">
    <div class="flex items-center gap-2">
      <Clock class="w-4 h-4 text-brand-orange" />
      <span class="font-medium">
        {languageState.language === 'en'
          ? 'Weekly Class Schedule (08:00 - 20:00)'
          : 'ตารางเรียนรายสัปดาห์ (08:00 - 20:00 น.)'}
      </span>
    </div>
    <div class="flex items-center gap-3">
      <span class="text-slate-500 font-mono">
        {languageState.language === 'en' ? `Total ${slots.length} Courses` : `รวมทั้งหมด ${slots.length} รายวิชา`}
      </span>
    </div>
  </div>

  <!-- Grid Canvas with Horizontal Scroll for Tablet/Smaller Desktop -->
  <div class="overflow-x-auto">
    <div class="min-w-[1050px] select-none">
      <!-- Day Headers (7 Days + Time Axis) -->
      <div class="grid grid-cols-[76px_repeat(7,1fr)] border-b border-slate-200 bg-slate-100/90 text-slate-700">
        <!-- Time Axis Header -->
        <div class="flex items-center justify-center p-3 text-[11px] font-bold text-slate-500 border-r border-slate-200 uppercase tracking-wider">
          {languageState.language === 'en' ? 'Time' : 'เวลา'}
        </div>

        <!-- 7 Day Columns -->
        {#each DAYS_ORDER as day}
          {@const meta = DAY_METADATA[day]}
          {@const daySlots = slotsByDay.get(day) || []}
          <div class="p-3 border-r border-slate-200 last:border-r-0 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <span
                class="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                style={`background-color: ${meta.colorHex}`}
              ></span>
              <span class="text-xs font-bold text-slate-900">
                {languageState.language === 'en' ? meta.en : meta.th}
              </span>
              <span class="text-[10px] text-slate-500 font-medium">
                ({languageState.language === 'en' ? meta.shortTh : meta.shortEn})
              </span>
            </div>
            <div class="text-[10px] font-medium text-slate-500 mt-0.5">
              {#if daySlots.length > 0}
                {languageState.language === 'en' ? `${daySlots.length} Courses` : `${daySlots.length} วิชา`}
              {:else}
                {languageState.language === 'en' ? 'No class' : 'ไม่มีเรียน'}
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <!-- Grid Rows Canvas -->
      <div class="relative grid grid-cols-[76px_repeat(7,1fr)] bg-white">
        <!-- Left Time Column (Exactly 12 hourly rows matching 12 rows of 60px = 720px total) -->
        <div class="relative border-r border-slate-200 bg-slate-50/70 select-none">
          {#each hourMarkers as time}
            <div
              class="h-[60px] flex items-start justify-center pr-1.5 pt-1.5 border-b border-slate-200/70 text-[11px] font-mono text-slate-500 font-medium"
            >
              <span>{time}</span>
            </div>
          {/each}
          <!-- Bottom 20:00 marker aligned with the bottom edge (720px) -->
          <div class="absolute bottom-0.5 left-0 right-0 flex justify-center pr-1.5 text-[10px] font-mono text-slate-400 pointer-events-none">
            <span>{`${String(GRID_END_HOUR).padStart(2, '0')}:00`}</span>
          </div>
        </div>

        <!-- 7 Day Matrix Columns -->
        {#each DAYS_ORDER as day}
          {@const daySlots = slotsByDay.get(day) || []}
          <div class="relative border-r border-slate-200 last:border-r-0">
            <!-- Background Hourly Rows and 30-min subtle lines -->
            {#each Array.from({ length: GRID_TOTAL_HOURS }) as _, hIdx}
              <div class="relative h-[60px] border-b border-slate-200/60 transition-colors">
                <!-- 30-minute subtle dashed divider line -->
                <div class="absolute top-[30px] left-0 right-0 border-b border-dashed border-slate-200/40 pointer-events-none"></div>
              </div>
            {/each}

            <!-- Absolute Course Slot Cards -->
            <div class="absolute inset-0 pointer-events-none p-1">
              {#each daySlots as slot}
                {@const pos = calculateSlotPosition(
                  slot.startTime,
                  slot.endTime,
                  GRID_START_MINUTES,
                  GRID_TOTAL_MINUTES
                )}
                {@const theme = getPublicColorTheme(slot.color)}
                {@const typeMeta = COURSE_TYPE_META[slot.courseType] || COURSE_TYPE_META.LECTURE}
                <div
                  style={`top: ${pos.topPercent}%; height: ${pos.heightPercent}%;`}
                  onclick={() => onSlotClick?.(slot)}
                  role="button"
                  tabindex="0"
                  onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSlotClick?.(slot);
                    }
                  }}
                  class={`group absolute left-1 right-1 rounded-xl border p-2 text-left transition-all duration-150 pointer-events-auto hover:z-20 hover:shadow-lg overflow-hidden flex flex-col justify-between break-inside-avoid print-break-inside-avoid ${
                    theme.cardBg
                  } ${theme.cardBorder} ${
                    onSlotClick ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <!-- Left Accent Bar -->
                  <div class={`absolute left-0 top-0 bottom-0 w-1 ${theme.accentBar}`}></div>

                  <!-- Top: Course Code, Section, Type Badge -->
                  <div class="pl-1">
                    <div class="flex items-start justify-between gap-1 flex-wrap">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="font-mono text-[11px] font-extrabold text-slate-900 tracking-tight">
                          {slot.courseCode}
                        </span>
                        {#if slot.section}
                          <span class="rounded-md bg-white/80 border border-slate-300/80 px-1.5 py-0.2 text-[9px] font-bold text-slate-700">
                            {slot.section}
                          </span>
                        {/if}
                      </div>

                      <span
                        class={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                          slot.courseType === 'LAB'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : slot.courseType === 'BOTH'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {languageState.language === 'en' ? typeMeta.en : typeMeta.th}
                      </span>
                    </div>

                    <!-- Course Title -->
                    <h4
                      class="font-bold text-xs text-slate-900 leading-tight line-clamp-2 mt-1"
                      title={slot.courseName}
                    >
                      {slot.courseName}
                    </h4>
                  </div>

                  <!-- Bottom: Time, Room, Instructor -->
                  <div class="pl-1 mt-1 space-y-1">
                    <!-- Time Badge -->
                    <div class="flex items-center gap-1 font-mono text-[10px] font-semibold text-slate-700">
                      <Clock class="w-2.5 h-2.5 text-slate-500 shrink-0" />
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    <!-- Room & Instructor Badges -->
                    <div class="flex items-center justify-between text-[10px] text-slate-600 gap-1 flex-wrap">
                      {#if slot.room}
                        <span
                          class="flex items-center gap-0.5 font-medium text-slate-800 truncate"
                          title={`ห้อง: ${slot.room}`}
                        >
                          <MapPin class="w-2.5 h-2.5 text-brand-orange shrink-0" />
                          <span class="truncate">{slot.room}</span>
                        </span>
                      {:else}
                        <span class="text-slate-400 italic text-[9px]">
                          {languageState.language === 'en' ? 'No room' : 'ไม่ระบุห้อง'}
                        </span>
                      {/if}

                      {#if slot.instructors && slot.instructors.length > 0}
                        <span
                          class="flex items-center gap-0.5 text-slate-700 truncate max-w-[130px]"
                          title={`อาจารย์ผู้สอน: ${slot.instructors.join(', ')}`}
                        >
                          <User class="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span class="truncate">
                            {slot.instructors.join(', ')}
                          </span>
                        </span>
                      {/if}
                    </div>
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
