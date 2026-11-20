<script lang="ts">
  import type { DayOfWeek } from '@prisma/client';
  import {
    Clock,
    MapPin,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight
  } from 'lucide-svelte';
  import {
    DAYS_ORDER,
    DAY_METADATA,
    sortCourseSlots,
    getPublicColorTheme,
    COURSE_TYPE_META,
    timeToMinutes
  } from '$lib/utils/weekly-grid';
  import { languageStore } from '$lib/stores/language';
  import type { PublicCourseSlot } from '$lib/components/schedules/WeeklyTimetableGrid.svelte';

  interface Props {
    slots: PublicCourseSlot[];
    selectedDay: DayOfWeek;
    onSelectDay: (day: DayOfWeek) => void;
    class?: string;
  }

  let {
    slots,
    selectedDay,
    onSelectDay,
    class: className = ''
  }: Props = $props();

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

  const currentDaySlots = $derived(
    sortCourseSlots(slotsByDay.get(selectedDay) || [])
  );

  const activeDayMeta = $derived(
    DAY_METADATA[selectedDay] || DAY_METADATA.MONDAY
  );

  const currentDayIndex = $derived(DAYS_ORDER.indexOf(selectedDay));

  function handlePrevDay() {
    const nextIdx = (currentDayIndex - 1 + DAYS_ORDER.length) % DAYS_ORDER.length;
    onSelectDay(DAYS_ORDER[nextIdx]);
  }

  function handleNextDay() {
    const nextIdx = (currentDayIndex + 1) % DAYS_ORDER.length;
    onSelectDay(DAYS_ORDER[nextIdx]);
  }
</script>

<div class={`space-y-4 ${className}`}>
  <!-- Day Selector Pills Bar -->
  <div class="no-print bg-white rounded-2xl border border-slate-200/90 shadow-xs p-2">
    <div class="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 scrollbar-none">
      {#each DAYS_ORDER as day}
        {@const meta = DAY_METADATA[day]}
        {@const dayCount = (slotsByDay.get(day) || []).length}
        {@const isActive = selectedDay === day}
        <button
          type="button"
          onclick={() => onSelectDay(day)}
          class={`relative flex-1 min-w-[48px] py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
            isActive
              ? 'bg-slate-900 text-white shadow-md scale-102'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <!-- Day Color Accent Indicator -->
          <span
            class="w-2 h-2 rounded-full"
            style={`background-color: ${meta.colorHex}`}
          ></span>

          <!-- Day Short Name -->
          <span class="text-xs font-bold leading-tight">
            {$languageStore === 'en' ? meta.shortEn : meta.shortTh}
          </span>

          <!-- Course Count Pill -->
          <span
            class={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold ${
              isActive
                ? 'bg-white/20 text-white'
                : dayCount > 0
                ? 'bg-orange-100 text-brand-orange'
                : 'text-slate-400'
            }`}
          >
            {dayCount}
          </span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Active Day Header & Navigation -->
  <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex items-center justify-between">
    <button
      type="button"
      onclick={handlePrevDay}
      class="no-print p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
      title={$languageStore === 'en' ? 'Previous day' : 'วันก่อนหน้า'}
      aria-label="Previous day"
    >
      <ChevronLeft class="w-5 h-5" />
    </button>

    <div class="text-center flex flex-col items-center">
      <div class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full shadow-xs"
          style={`background-color: ${activeDayMeta.colorHex}`}
        ></span>
        <h3 class="text-base sm:text-lg font-bold text-slate-900">
          {$languageStore === 'en' ? activeDayMeta.en : activeDayMeta.th}
        </h3>
      </div>
      <span class="text-xs font-medium text-slate-500 mt-0.5">
        {#if currentDaySlots.length > 0}
          {$languageStore === 'en'
            ? `${currentDaySlots.length} courses scheduled`
            : `มีการเรียนการสอน ${currentDaySlots.length} รายวิชา`}
        {:else}
          {$languageStore === 'en' ? 'No classes scheduled' : 'ไม่มีการเรียนการสอนในวันนี้'}
        {/if}
      </span>
    </div>

    <button
      type="button"
      onclick={handleNextDay}
      class="no-print p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
      title={$languageStore === 'en' ? 'Next day' : 'วันถัดไป'}
      aria-label="Next day"
    >
      <ChevronRight class="w-5 h-5" />
    </button>
  </div>

  <!-- Chronological Course Cards for Selected Day -->
  {#if currentDaySlots.length > 0}
    <div class="space-y-3">
      {#each currentDaySlots as slot}
        {@const theme = getPublicColorTheme(slot.color)}
        {@const typeMeta = COURSE_TYPE_META[slot.courseType] || COURSE_TYPE_META.LECTURE}
        {@const startMin = timeToMinutes(slot.startTime)}
        {@const endMin = timeToMinutes(slot.endTime)}
        {@const durationH = ((endMin - startMin) / 60).toFixed(1)}
        <div
          class={`relative bg-white rounded-2xl border ${theme.cardBorder} p-4 sm:p-5 shadow-xs overflow-hidden transition-all hover:shadow-md break-inside-avoid print-break-inside-avoid`}
        >
          <!-- Left Color Accent Bar -->
          <div
            class={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.accentBar}`}
          ></div>

          <div class="pl-1 sm:pl-2 space-y-2.5">
            <!-- Row 1: Time Badge & Course Type -->
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-mono font-bold">
                <Clock class="w-3.5 h-3.5 text-brand-orange" />
                <span>
                  {slot.startTime} - {slot.endTime} น.
                </span>
                <span class="text-[10px] text-slate-500 font-normal">
                  ({durationH} {$languageStore === 'en' ? 'hrs' : 'ชม.'})
                </span>
              </div>

              <span
                class={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  slot.courseType === 'LAB'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : slot.courseType === 'BOTH'
                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                    : 'bg-blue-50 text-blue-800 border-blue-300'
                }`}
              >
                {$languageStore === 'en' ? typeMeta.en : typeMeta.th}
              </span>
            </div>

            <!-- Row 2: Course Code & Section -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                {slot.courseCode}
              </span>
              {#if slot.section}
                <span class="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                  {slot.section}
                </span>
              {/if}
            </div>

            <!-- Row 3: Course Title -->
            <h4 class="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {slot.courseName}
            </h4>

            <!-- Row 4: Room & Instructor -->
            <div class="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
              {#if slot.room}
                <div class="flex items-center gap-1.5 text-slate-800 font-medium">
                  <MapPin class="w-3.5 h-3.5 text-brand-orange shrink-0" />
                  <span>
                    {$languageStore === 'en' ? 'Room' : 'ห้องเรียน'}:{' '}
                    <strong class="font-semibold text-slate-900">
                      {slot.room}
                    </strong>
                  </span>
                </div>
              {:else}
                <div class="flex items-center gap-1.5 text-slate-400 italic">
                  <MapPin class="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span>{$languageStore === 'en' ? 'No room assigned' : 'ไม่ระบุห้องเรียน'}</span>
                </div>
              {/if}

              <div class="flex items-center gap-1.5 text-slate-700">
                <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {$languageStore === 'en' ? 'Lecturer' : 'ผู้สอน'}:{' '}
                  {(slot.instructors ?? []).join(', ') || ($languageStore === 'en' ? 'No lecturer' : 'ไม่ระบุผู้สอน')}
                </span>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <!-- Empty Day State -->
    <div class="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-10 text-center">
      <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
        <Calendar class="w-6 h-6" />
      </div>
      <h4 class="text-sm font-bold text-slate-700">
        {$languageStore === 'en' ? 'No classes on this day' : 'ไม่มีตารางเรียนในวันนี้'}
      </h4>
      <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        {$languageStore === 'en'
          ? `There are no scheduled courses on ${activeDayMeta.en}. Select other days from the bar above.`
          : `ไม่มีรายวิชาที่ต้องเข้าเรียนใน${activeDayMeta.th} คุณสามารถเลือกดูวันอื่นๆ จากแถบด้านบน`}
      </p>
    </div>
  {/if}
</div>
