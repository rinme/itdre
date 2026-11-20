<script lang="ts">
  import type { DayOfWeek } from '@prisma/client';
  import {
    Clock,
    MapPin,
    User,
    Search,
    BookOpen
  } from 'lucide-svelte';
  import {
    DAYS_ORDER,
    DAY_METADATA,
    sortCourseSlots,
    getPublicColorTheme,
    COURSE_TYPE_META,
    timeToMinutes,
    calculateTotalHours
  } from '$lib/utils/weekly-grid';
  import { languageState, t } from '$lib/state/language.svelte';
  import type { PublicCourseSlot } from '$lib/components/schedules/WeeklyTimetableGrid.svelte';

  interface Props {
    slots: PublicCourseSlot[];
    class?: string;
  }

  let { slots, class: className = '' }: Props = $props();

  let searchQuery = $state('');
  let dayFilter = $state<string>('ALL');

  const filteredSlots = $derived.by(() => {
    let result = sortCourseSlots(slots);

    if (dayFilter !== 'ALL') {
      result = result.filter((s) => s.dayOfWeek === dayFilter);
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

  const groupedByDay = $derived.by(() => {
    const map = new Map<DayOfWeek, PublicCourseSlot[]>();
    DAYS_ORDER.forEach((day) => map.set(day, []));

    filteredSlots.forEach((slot) => {
      const list = map.get(slot.dayOfWeek) || [];
      list.push(slot);
      map.set(slot.dayOfWeek, list);
    });

    return map;
  });

  const activeDays = $derived(
    DAYS_ORDER.filter((day) => {
      const daySlots = groupedByDay.get(day) || [];
      return daySlots.length > 0;
    })
  );

  const totalHours = $derived(calculateTotalHours(slots));
  const lectureCount = $derived(slots.filter((s) => s.courseType === 'LECTURE').length);
  const labCount = $derived(slots.filter((s) => s.courseType === 'LAB' || s.courseType === 'BOTH').length);
</script>

<div class={`space-y-4 ${className}`}>
  <!-- Search and Day Filter Toolbar -->
  <div class="no-print bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
    <!-- Search Input -->
    <div class="relative flex-1 max-w-md">
      <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder={languageState.language === 'en'
          ? 'Search course code, name, instructor, room...'
          : 'ค้นหารหัสวิชา, ชื่อวิชา, อาจารย์ผู้สอน, ห้องเรียน...'}
        bind:value={searchQuery}
        class="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
      />
    </div>

    <!-- Day Filter Pills -->
    <div class="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
      <button
        type="button"
        onclick={() => (dayFilter = 'ALL')}
        class={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
          dayFilter === 'ALL'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {languageState.language === 'en' ? 'All Days' : 'ทุกวัน'} ({slots.length})
      </button>
      {#each DAYS_ORDER as day}
        {@const meta = DAY_METADATA[day]}
        {@const daySlots = slots.filter((s) => s.dayOfWeek === day)}
        {#if daySlots.length > 0}
          <button
            type="button"
            onclick={() => (dayFilter = day)}
            class={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              dayFilter === day
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span
              class="w-2 h-2 rounded-full shrink-0"
              style={`background-color: ${meta.colorHex}`}
            ></span>
            <span>{languageState.language === 'en' ? meta.shortEn : meta.shortTh}</span>
            <span class="text-[10px] opacity-75">({daySlots.length})</span>
          </button>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Course Groups by Day -->
  {#if activeDays.length > 0}
    <div class="space-y-4">
      {#each activeDays as day}
        {@const meta = DAY_METADATA[day]}
        {@const daySlots = groupedByDay.get(day) || []}
        {@const dayHours = calculateTotalHours(daySlots)}
        <div
          class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden break-inside-avoid print-break-inside-avoid"
        >
          <!-- Day Section Header -->
          <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2.5">
              <span
                class="w-3 h-3 rounded-full shadow-xs shrink-0"
                style={`background-color: ${meta.colorHex}`}
              ></span>
              <h3 class="text-sm sm:text-base font-bold text-slate-900">
                {languageState.language === 'en' ? meta.en : meta.th}
              </h3>
              <span class="text-xs text-slate-500 font-medium">
                ({languageState.language === 'en' ? meta.shortTh : meta.shortEn})
              </span>
            </div>

            <div class="flex items-center gap-3 text-xs text-slate-500">
              <span class="font-semibold text-slate-700">
                {languageState.language === 'en' ? `${daySlots.length} Courses` : `${daySlots.length} รายวิชา`}
              </span>
              <span>•</span>
              <span class="font-mono">
                {dayHours} {languageState.language === 'en' ? 'Hours' : 'ชั่วโมง'}
              </span>
            </div>
          </div>

          <!-- Day Courses List -->
          <div class="divide-y divide-slate-100">
            {#each daySlots as slot}
              {@const theme = getPublicColorTheme(slot.color)}
              {@const typeMeta = COURSE_TYPE_META[slot.courseType] || COURSE_TYPE_META.LECTURE}
              {@const startMin = timeToMinutes(slot.startTime)}
              {@const endMin = timeToMinutes(slot.endTime)}
              {@const durationH = ((endMin - startMin) / 60).toFixed(1)}
              <div
                class="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <!-- Left: Time & Course Info -->
                <div class="flex items-start gap-3 sm:gap-4 flex-1">
                  <!-- Left Color Swatch -->
                  <div
                    class={`w-1 self-stretch rounded-full shrink-0 ${theme.accentBar}`}
                  ></div>

                  <!-- Time Column -->
                  <div class="shrink-0 min-w-[110px] sm:min-w-[130px]">
                    <div class="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold text-slate-900 bg-slate-100/90 px-2.5 py-1 rounded-lg">
                      <Clock class="w-3.5 h-3.5 text-brand-orange" />
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <div class="text-[10px] text-slate-500 mt-1 pl-1">
                      {durationH} {languageState.language === 'en' ? 'hrs' : 'ชม.'}
                    </div>
                  </div>

                  <!-- Details Column -->
                  <div class="space-y-1 flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-mono text-xs sm:text-sm font-extrabold text-slate-900">
                        {slot.courseCode}
                      </span>
                      {#if slot.section}
                        <span class="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                          {slot.section}
                        </span>
                      {/if}
                      <span
                        class={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${
                          slot.courseType === 'LAB'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : slot.courseType === 'BOTH'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}
                      >
                        {languageState.language === 'en' ? typeMeta.en : typeMeta.th}
                      </span>
                    </div>

                    <h4 class="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {slot.courseName}
                    </h4>
                  </div>
                </div>

                <!-- Right: Room & Instructor -->
                <div class="flex items-center gap-4 sm:gap-6 text-xs text-slate-600 pl-4 md:pl-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <!-- Room Badge -->
                  <div class="flex items-center gap-1.5 min-w-[100px]">
                    <MapPin class="w-3.5 h-3.5 text-brand-orange shrink-0" />
                    {#if slot.room}
                      <span class="font-semibold text-slate-900">
                        {slot.room}
                      </span>
                    {:else}
                      <span class="text-slate-400 italic">
                        {languageState.language === 'en' ? 'No room' : 'ไม่ระบุห้อง'}
                      </span>
                    {/if}
                  </div>

                  <!-- Instructor -->
                  <div class="flex items-center gap-1.5 min-w-[120px] max-w-[200px]">
                    <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span class="truncate text-slate-700 font-medium">
                      {slot.instructors && slot.instructors.length > 0
                        ? slot.instructors.join(', ')
                        : (languageState.language === 'en' ? 'No lecturer' : 'ไม่ระบุผู้สอน')}
                    </span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <!-- Empty Search / Filter State -->
    <div class="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center">
      <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
        <Search class="w-6 h-6" />
      </div>
      <h4 class="text-sm font-bold text-slate-800">
        {languageState.language === 'en' ? 'No courses match your search' : 'ไม่พบรายวิชาตามคำค้นหา'}
      </h4>
      <p class="text-xs text-slate-500 mt-1">
        {languageState.language === 'en'
          ? "Try adjusting your search terms or select 'All Days' to see all courses."
          : "ลองเปลี่ยนคำค้นหา หรือกดเลือก 'ทุกวัน' เพื่อดูวิชาทั้งหมด"}
      </p>
    </div>
  {/if}

  <!-- Summary Footer Statistics -->
  {#if slots.length > 0}
    <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 shadow-xs">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-1.5">
          <BookOpen class="w-4 h-4 text-brand-orange" />
          <span>
            {languageState.language === 'en' ? 'Total Courses' : 'วิชาทั้งหมด'}:{' '}
            <strong class="text-slate-900 font-bold">
              {slots.length}
            </strong>
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>
            {languageState.language === 'en' ? 'Lecture' : 'ทฤษฎี'}:{' '}
            <strong class="text-slate-900 font-bold">
              {lectureCount}
            </strong>
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            {languageState.language === 'en' ? 'Lab' : 'ปฏิบัติ'}:{' '}
            <strong class="text-slate-900 font-bold">{labCount}</strong>
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1.5 font-mono text-slate-700">
        <Clock class="w-4 h-4 text-brand-orange" />
        <span>
          {languageState.language === 'en' ? 'Total Hours' : 'เวลารวมในตาราง'}:{' '}
          <strong class="text-slate-900 font-bold text-sm">
            {totalHours}
          </strong>{' '}
          {languageState.language === 'en' ? 'hrs/week' : 'ชั่วโมง/สัปดาห์'}
        </span>
      </div>
    </div>
  {/if}
</div>
