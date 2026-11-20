<script module lang="ts">
  import type { DegreeLevel } from '@prisma/client';
  import { programs } from '$lib/data/programs';

  export interface ScheduleFilterState {
    academicYear: number;
    semester: number;
    degreeLevel: DegreeLevel;
    programId: string;
    yearLevel: number;
    sectionGroup?: string;
  }

  export interface DegreeOption {
    key: DegreeLevel;
    th: string;
    en: string;
    shortTh: string;
    shortEn: string;
    maxYear: number;
  }

  export const DEGREE_OPTIONS: DegreeOption[] = [
    {
      key: 'BACHELOR',
      th: 'ปริญญาตรี',
      en: "Bachelor's",
      shortTh: 'ป.ตรี',
      shortEn: 'B.Sc./B.Eng.',
      maxYear: 4
    },
    {
      key: 'MASTER',
      th: 'ปริญญาโท',
      en: "Master's",
      shortTh: 'ป.โท',
      shortEn: 'M.Sc.',
      maxYear: 2
    },
    {
      key: 'DOCTOR',
      th: 'ปริญญาเอก',
      en: 'Doctoral',
      shortTh: 'ป.เอก',
      shortEn: 'Ph.D.',
      maxYear: 3
    }
  ];

  export const SEMESTER_OPTIONS = [
    { value: 1, th: 'ภาคการศึกษาที่ 1', en: 'Semester 1', shortTh: 'ภาค 1', shortEn: 'Sem 1' },
    { value: 2, th: 'ภาคการศึกษาที่ 2', en: 'Semester 2', shortTh: 'ภาค 2', shortEn: 'Sem 2' },
    { value: 3, th: 'ภาคฤดูร้อน', en: 'Summer Term', shortTh: 'ฤดูร้อน', shortEn: 'Summer' }
  ];

  /**
   * Pure helper function to handle cascading filter changes.
   * When degreeLevel changes, automatically picks a valid programId and clamps study year.
   */
  export function cascadeFilterUpdate(
    current: ScheduleFilterState,
    change: Partial<ScheduleFilterState>,
    allPrograms = programs
  ): ScheduleFilterState {
    const next: ScheduleFilterState = { ...current, ...change };

    const cohortChanged =
      (change.degreeLevel && change.degreeLevel !== current.degreeLevel) ||
      (change.programId && change.programId !== current.programId) ||
      (change.yearLevel !== undefined && change.yearLevel !== current.yearLevel);

    if (cohortChanged && !('sectionGroup' in change)) {
      next.sectionGroup = undefined;
    }

    if (change.degreeLevel && change.degreeLevel !== current.degreeLevel) {
      const targetDegree = change.degreeLevel.toLowerCase();
      const matchingProgs = allPrograms.filter(
        (p) => p.degree.toLowerCase() === targetDegree
      );

      const isCurrentProgValid = matchingProgs.some((p) => p.id === next.programId);
      if (!isCurrentProgValid && matchingProgs.length > 0) {
        next.programId = matchingProgs[0].id;
      }

      const degreeMeta = DEGREE_OPTIONS.find((d) => d.key === change.degreeLevel);
      const maxYear = degreeMeta ? degreeMeta.maxYear : 4;
      if (next.yearLevel > maxYear) {
        next.yearLevel = 1;
      }
    }

    return next;
  }
</script>

<script lang="ts">
  import { languageState, t } from '$lib/state/language.svelte';
  import {
    Calendar,
    GraduationCap,
    BookOpen,
    Layers,
    Filter,
    Users
  } from 'lucide-svelte';

  interface Props {
    filters: ScheduleFilterState;
    onChange: (filters: ScheduleFilterState) => void;
    availableYears?: number[];
    availableSections?: string[];
    disabled?: boolean;
    class?: string;
  }

  let {
    filters,
    onChange,
    availableYears = [2567],
    availableSections = [],
    disabled = false,
    class: className = ''
  }: Props = $props();

  const filteredPrograms = $derived(
    programs.filter((p) => p.degree.toLowerCase() === filters.degreeLevel.toLowerCase())
  );

  const currentDegreeMeta = $derived(
    DEGREE_OPTIONS.find((d) => d.key === filters.degreeLevel) || DEGREE_OPTIONS[0]
  );

  const studyYearOptions = $derived(
    Array.from({ length: currentDegreeMeta.maxYear }, (_, i) => i + 1)
  );

  const yearsList = $derived(
    Array.from(new Set([...availableYears, filters.academicYear, 2567])).sort((a, b) => b - a)
  );

  function handleUpdate(change: Partial<ScheduleFilterState>) {
    const nextFilters = cascadeFilterUpdate(filters, change, programs);
    onChange(nextFilters);
  }
</script>

<div
  class={`no-print bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 transition-all ${className}`}
>
  <div class="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 text-slate-700">
    <Filter class="w-4 h-4 text-brand-orange" />
    <h3 class="text-sm font-bold tracking-tight">
      {languageState.language === 'en' ? 'Filter Timetable' : 'ค้นหาและกรองตารางเรียน'}
    </h3>
    <span class="text-xs text-slate-400 ml-auto hidden sm:inline">
      {languageState.language === 'en' ? 'Select criteria to view schedules' : 'เลือกเงื่อนไขเพื่อแสดงตารางเรียนที่เกี่ยวข้อง'}
    </span>
  </div>

  <div class="space-y-4">
    <!-- Row 1: Academic Year & Semester -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
      <!-- Academic Year Dropdown -->
      <div class="md:col-span-4">
        <label class="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
          <Calendar class="w-3.5 h-3.5 text-brand-orange" />
          <span>{languageState.language === 'en' ? 'Academic Year' : 'ปีการศึกษา'}</span>
        </label>
        <select
          value={filters.academicYear}
          {disabled}
          onchange={(e) =>
            handleUpdate({ academicYear: Number((e.target as HTMLSelectElement).value) })
          }
          class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all cursor-pointer disabled:opacity-50"
        >
          {#each yearsList as year}
            <option value={year}>
              {languageState.language === 'en' ? `Academic Year ${year}` : `ปีการศึกษา ${year}`}
            </option>
          {/each}
        </select>
      </div>

      <!-- Semester Segmented Buttons -->
      <div class="md:col-span-8">
        <label class="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
          <Layers class="w-3.5 h-3.5 text-brand-orange" />
          <span>{languageState.language === 'en' ? 'Semester' : 'ภาคการศึกษา'}</span>
        </label>
        <div class="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {#each SEMESTER_OPTIONS as sem}
            {@const isActive = filters.semester === sem.value}
            <button
              type="button"
              {disabled}
              onclick={() => handleUpdate({ semester: sem.value })}
              class={`h-8 sm:h-9 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                isActive
                  ? 'bg-white text-brand-orange shadow-xs border border-orange-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              } disabled:opacity-50 cursor-pointer`}
            >
              <span>{languageState.language === 'en' ? sem.shortEn : sem.shortTh}</span>
              <span class="hidden sm:inline text-[11px] opacity-75">
                ({languageState.language === 'en' ? sem.en : sem.th})
              </span>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Row 2: Degree Level Tabs -->
    <div>
      <label class="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
        <GraduationCap class="w-3.5 h-3.5 text-brand-orange" />
        <span>{languageState.language === 'en' ? 'Degree Level' : 'ระดับการศึกษา'}</span>
      </label>
      <div class="grid grid-cols-3 gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
        {#each DEGREE_OPTIONS as deg}
          {@const isActive = filters.degreeLevel === deg.key}
          <button
            type="button"
            {disabled}
            onclick={() => handleUpdate({ degreeLevel: deg.key })}
            class={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
              isActive
                ? 'bg-white text-brand-orange shadow-sm border border-orange-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            } disabled:opacity-50 cursor-pointer`}
          >
            <span>{languageState.language === 'en' ? deg.en : deg.th}</span>
            <span
              class={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isActive
                  ? 'bg-brand-orange/10 text-brand-orange font-bold'
                  : 'bg-slate-200/70 text-slate-500'
              }`}
            >
              {deg.shortEn}
            </span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Row 3: Program Selector & Study Year & Section -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
      <!-- Program Selector -->
      <div class="md:col-span-7">
        <label class="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
          <BookOpen class="w-3.5 h-3.5 text-brand-orange" />
          <span>{languageState.language === 'en' ? 'Curriculum / Program' : 'หลักสูตรการศึกษา'}</span>
        </label>
        <select
          value={filters.programId}
          disabled={disabled || filteredPrograms.length === 0}
          onchange={(e) => handleUpdate({ programId: (e.target as HTMLSelectElement).value })}
          class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all cursor-pointer disabled:opacity-50"
        >
          {#each filteredPrograms as prog}
            <option value={prog.id}>
              {languageState.language === 'en' ? prog.titleEn : prog.titleTh}
            </option>
          {/each}
        </select>
      </div>

      <!-- Study Year Tabs -->
      <div class={availableSections.length > 0 ? 'md:col-span-3' : 'md:col-span-5'}>
        <label class="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
          <Users class="w-3.5 h-3.5 text-brand-orange" />
          <span>{languageState.language === 'en' ? 'Study Year' : 'ชั้นปี'}</span>
        </label>
        <div class="flex items-center gap-1 sm:gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {#each studyYearOptions as yearNum}
            {@const isActive = filters.yearLevel === yearNum}
            <button
              type="button"
              {disabled}
              onclick={() => handleUpdate({ yearLevel: yearNum })}
              class={`flex-1 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                isActive
                  ? 'bg-white text-brand-orange shadow-xs border border-orange-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              } disabled:opacity-50`}
            >
              <span>{languageState.language === 'en' ? `Yr ${yearNum}` : `ปี ${yearNum}`}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Section Selector (if multiple cohorts exist) -->
      {#if availableSections.length > 0}
        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Layers class="w-3.5 h-3.5 text-brand-orange" />
            <span>{languageState.language === 'en' ? 'Section' : 'กลุ่มเรียน'}</span>
          </label>
          <select
            value={filters.sectionGroup || ''}
            {disabled}
            onchange={(e) =>
              handleUpdate({ sectionGroup: (e.target as HTMLSelectElement).value || undefined })
            }
            class="w-full h-10 px-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all cursor-pointer disabled:opacity-50"
          >
            <option value="">{languageState.language === 'en' ? 'All Sec' : 'ทุกกลุ่ม'}</option>
            {#each availableSections as sec}
              <option value={sec}>
                {sec}
              </option>
            {/each}
          </select>
        </div>
      {/if}
    </div>
  </div>
</div>
