<script lang="ts">
  import { onMount } from 'svelte';
  import type { DegreeLevel, DayOfWeek } from '@prisma/client';
  import {
    Calendar,
    Grid3X3,
    List,
    Printer,
    Loader2,
    CalendarX2,
    RefreshCw,
    Info,
    Home,
    ChevronRight
  } from 'lucide-svelte';
  import { languageState, t } from '$lib/state/language.svelte';
  import { programs } from '$lib/data/programs';
  import {
    getCurrentDayOfWeek,
    calculateTotalHours
  } from '$lib/utils/weekly-grid';
  import ScheduleFilterBar, {
    type ScheduleFilterState,
    DEGREE_OPTIONS,
    SEMESTER_OPTIONS
  } from '$lib/components/schedules/ScheduleFilterBar.svelte';
  import WeeklyTimetableGrid, {
    type PublicCourseSlot
  } from '$lib/components/schedules/WeeklyTimetableGrid.svelte';
  import MobileDayView from '$lib/components/schedules/MobileDayView.svelte';
  import ScheduleListView from '$lib/components/schedules/ScheduleListView.svelte';

  interface ScheduleItem {
    id: string;
    academicYear: number;
    semester: number;
    degreeLevel: DegreeLevel;
    programId: string;
    programName: string;
    yearLevel: number;
    sectionGroup: string | null;
    status: string;
    note: string | null;
    createdAt: string;
    updatedAt: string;
    slots: PublicCourseSlot[];
  }

  interface ApiResponse {
    schedules: ScheduleItem[];
    availableYears: number[];
    error?: string;
  }

  let filters = $state<ScheduleFilterState>({
    academicYear: 2567,
    semester: 1,
    degreeLevel: 'BACHELOR',
    programId: 'bachelor-itd',
    yearLevel: 1,
    sectionGroup: undefined
  });

  let viewMode = $state<'grid' | 'list'>('grid');
  let selectedDay = $state<DayOfWeek>(getCurrentDayOfWeek());
  let schedules = $state<ScheduleItem[]>([]);
  let availableYears = $state<number[]>([2567]);
  let isLoading = $state(true);
  let fetchError = $state<string | null>(null);

  onMount(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const year = Number(url.searchParams.get('year'));
      const sem = Number(url.searchParams.get('sem'));
      const degree = url.searchParams.get('degree')?.toUpperCase() as DegreeLevel;
      const program = url.searchParams.get('program');
      const yearLevel = Number(url.searchParams.get('yearLevel'));
      const sec = url.searchParams.get('sec') || undefined;
      const view = url.searchParams.get('view');

      if (year) filters.academicYear = year;
      if (sem) filters.semester = sem;
      if (degree) filters.degreeLevel = degree;
      if (program) filters.programId = program;
      if (yearLevel) filters.yearLevel = yearLevel;
      if (sec) filters.sectionGroup = sec;
      if (view === 'list') viewMode = 'list';
    }

    fetchSchedules();
  });

  function updateUrlParams(currentFilters: ScheduleFilterState, currentView: 'grid' | 'list') {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    params.set('year', String(currentFilters.academicYear));
    params.set('sem', String(currentFilters.semester));
    params.set('degree', currentFilters.degreeLevel);
    params.set('program', currentFilters.programId);
    params.set('yearLevel', String(currentFilters.yearLevel));
    if (currentFilters.sectionGroup) {
      params.set('sec', currentFilters.sectionGroup);
    }
    if (currentView !== 'grid') {
      params.set('view', currentView);
    }
    const newQuery = params.toString();
    const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }

  async function fetchSchedules() {
    isLoading = true;
    fetchError = null;

    try {
      const params = new URLSearchParams({
        academicYear: String(filters.academicYear),
        semester: String(filters.semester),
        degreeLevel: filters.degreeLevel,
        programId: filters.programId,
        yearLevel: String(filters.yearLevel)
      });

      const response = await fetch(`/api/schedules?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load schedules');
      }

      const data: ApiResponse = await response.json();
      schedules = data.schedules || [];

      if (data.availableYears && data.availableYears.length > 0) {
        availableYears = data.availableYears;
      }
    } catch {
      fetchError =
        languageState.language === 'en'
          ? 'Unable to load class schedules. Please check your internet connection.'
          : 'ไม่สามารถโหลดข้อมูลตารางเรียนได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    } finally {
      isLoading = false;
    }
  }

  function handleFilterChange(newFilters: ScheduleFilterState) {
    filters = newFilters;
    updateUrlParams(newFilters, viewMode);
    fetchSchedules();
  }

  function handleViewModeChange(mode: 'grid' | 'list') {
    viewMode = mode;
    updateUrlParams(filters, mode);
  }

  const availableSections = $derived.by(() => {
    const sections = new Set<string>();
    schedules.forEach((s) => {
      if (s.sectionGroup && s.sectionGroup.trim()) {
        sections.add(s.sectionGroup.trim());
      }
    });
    return Array.from(sections).sort();
  });

  $effect(() => {
    if (filters.sectionGroup && !isLoading) {
      if (!availableSections.includes(filters.sectionGroup)) {
        filters.sectionGroup = undefined;
        updateUrlParams(filters, viewMode);
      }
    }
  });

  const activeSchedules = $derived(
    !filters.sectionGroup ? schedules : schedules.filter((s) => s.sectionGroup === filters.sectionGroup)
  );

  const primarySchedule = $derived(activeSchedules[0] || schedules[0] || null);

  const activeSlots = $derived.by(() => {
    const list: PublicCourseSlot[] = [];
    activeSchedules.forEach((s) => {
      if (s.slots) {
        list.push(...s.slots);
      }
    });
    return list;
  });

  const totalWeeklyHours = $derived(calculateTotalHours(activeSlots));

  const currentProgram = $derived(
    programs.find((p) => p.id === filters.programId) || {
      id: filters.programId,
      titleTh: primarySchedule?.programName || 'หลักสูตร',
      titleEn: primarySchedule?.programName || 'Curriculum'
    }
  );

  const currentSemesterMeta = $derived(
    SEMESTER_OPTIONS.find((s) => s.value === filters.semester) || SEMESTER_OPTIONS[0]
  );

  const currentDegreeMeta = $derived(
    DEGREE_OPTIONS.find((d) => d.key === filters.degreeLevel) || DEGREE_OPTIONS[0]
  );

  function handlePrint() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
</script>

<div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 printable-schedule">
  <!-- Print Only Header -->
  <div class="print-only border-b-2 border-slate-900 pb-4 mb-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900">
          คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ
        </h1>
        <p class="text-sm text-slate-600">
          Faculty of Information Technology and Digital Innovation, KMUTNB
        </p>
      </div>
      <div class="text-right text-xs text-slate-500 font-mono">
        พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH')}
      </div>
    </div>

    <div class="mt-4 pt-3 border-t border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
      <div>
        <span class="text-slate-500">ปีการศึกษา:</span>{' '}
        <strong>{filters.academicYear}</strong> (ภาค {filters.semester})
      </div>
      <div>
        <span class="text-slate-500">ระดับ:</span>{' '}
        <strong>{currentDegreeMeta.th}</strong> (ชั้นปีที่ {filters.yearLevel})
      </div>
      <div class="col-span-2">
        <span class="text-slate-500">หลักสูตร:</span>{' '}
        <strong>{currentProgram.titleTh}</strong>
        {#if filters.sectionGroup}
          <span class="ml-2 font-mono">({filters.sectionGroup})</span>
        {/if}
      </div>
    </div>
  </div>

  <!-- Breadcrumb -->
  <nav
    aria-label="Breadcrumb"
    class="no-print flex items-center gap-1.5 text-xs text-slate-500 pb-1"
  >
    <a
      href="/"
      class="hover:text-brand-orange transition-colors flex items-center gap-1"
    >
      <Home class="w-3.5 h-3.5" />
      <span>{languageState.language === 'en' ? 'Home' : 'หน้าหลัก'}</span>
    </a>
    <ChevronRight class="w-3.5 h-3.5 text-slate-400" />
    <a
      href="/services"
      class="hover:text-brand-orange transition-colors"
    >
      {languageState.language === 'en' ? 'Services & Downloads' : 'บริการและดาวน์โหลด'}
    </a>
    <ChevronRight class="w-3.5 h-3.5 text-slate-400" />
    <span class="font-semibold text-slate-900">
      {languageState.language === 'en' ? 'Class Timetable' : 'ตารางเรียนและตารางสอน'}
    </span>
  </nav>

  <!-- Page Header & Controls -->
  <div class="no-print flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
    <div>
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold mb-2">
        <Calendar class="w-3.5 h-3.5" />
        <span>{languageState.language === 'en' ? 'Class Timetable System' : 'ระบบตารางเรียนตารางสอน'}</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {languageState.language === 'en' ? 'Class & Teaching Schedules' : 'ตารางเรียนและตารางสอน'}
      </h1>
      <p class="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
        {languageState.language === 'en'
          ? 'Search and view course schedules, classrooms, and instructors for ITD KMUTNB.'
          : 'ตรวจสอบตารางเวลาเรียน รายวิชา ห้องเรียน และอาจารย์ผู้สอน คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.'}
      </p>
    </div>

    <!-- View Mode Switcher & Print Button -->
    <div class="flex items-center gap-2.5 self-start md:self-auto">
      <div class="bg-slate-100 p-1 rounded-2xl border border-slate-200/80 flex items-center gap-1 shadow-xs">
        <button
          type="button"
          onclick={() => handleViewModeChange('grid')}
          class={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'grid'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title={languageState.language === 'en' ? 'Weekly Grid View' : 'มุมมองตารางรายสัปดาห์'}
        >
          <Grid3X3 class="w-3.5 h-3.5 text-brand-orange" />
          <span>{languageState.language === 'en' ? 'Weekly Grid' : 'ตารางรายสัปดาห์'}</span>
        </button>

        <button
          type="button"
          onclick={() => handleViewModeChange('list')}
          class={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewMode === 'list'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title={languageState.language === 'en' ? 'Course List View' : 'มุมมองรายการวิชา'}
        >
          <List class="w-3.5 h-3.5 text-brand-orange" />
          <span>{languageState.language === 'en' ? 'List View' : 'รายการรายวิชา'}</span>
        </button>
      </div>

      <button
        type="button"
        onclick={handlePrint}
        disabled={activeSlots.length === 0}
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        title={languageState.language === 'en' ? 'Print or Save as PDF' : 'พิมพ์หรือบันทึกเป็น PDF'}
      >
        <Printer class="w-4 h-4 text-brand-orange" />
        <span class="hidden sm:inline">
          {languageState.language === 'en' ? 'Print / PDF' : 'พิมพ์ / บันทึก PDF'}
        </span>
        <span class="sm:hidden">{languageState.language === 'en' ? 'Print' : 'พิมพ์'}</span>
      </button>
    </div>
  </div>

  <!-- Cascading Filter Bar -->
  <ScheduleFilterBar
    {filters}
    onChange={handleFilterChange}
    {availableYears}
    {availableSections}
    disabled={isLoading}
  />

  <!-- Active Cohort Summary Banner -->
  {#if !isLoading && schedules.length > 0}
    <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1.5">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2.5 py-0.5 rounded-full bg-brand-orange text-white text-[11px] font-bold">
            {languageState.language === 'en' ? currentDegreeMeta.en : currentDegreeMeta.th}
          </span>
          <span class="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-[11px] font-semibold">
            {languageState.language === 'en' ? `Year ${filters.yearLevel}` : `ชั้นปีที่ ${filters.yearLevel}`}
          </span>
          {#if filters.sectionGroup}
            <span class="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-mono font-bold">
              {filters.sectionGroup}
            </span>
          {/if}
        </div>

        <h2 class="text-base sm:text-xl font-bold tracking-tight text-white">
          {languageState.language === 'en' ? currentProgram.titleEn : currentProgram.titleTh}
        </h2>

        <p class="text-xs text-slate-300">
          {languageState.language === 'en'
            ? `Class Schedule for Semester ${filters.semester}, Academic Year ${filters.academicYear}`
            : `ตารางเรียนภาคการศึกษาที่ ${filters.semester} ปีการศึกษา ${filters.academicYear}`}
        </p>
      </div>

      <div class="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6 shrink-0">
        <div>
          <div class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {languageState.language === 'en' ? 'Courses' : 'จำนวนวิชา'}
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {activeSlots.length}
          </div>
        </div>

        <div>
          <div class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {languageState.language === 'en' ? 'Hrs/Week' : 'ชั่วโมง/สัปดาห์'}
          </div>
          <div class="text-xl sm:text-2xl font-extrabold text-brand-orange font-mono">
            {totalWeeklyHours}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Loading State -->
  {#if isLoading}
    <div class="bg-white rounded-3xl border border-slate-200 p-16 sm:p-20 text-center shadow-xs">
      <Loader2 class="w-8 h-8 text-brand-orange animate-spin mx-auto mb-3" />
      <h3 class="text-sm font-bold text-slate-800">
        {languageState.language === 'en' ? 'Loading schedule details...' : 'กำลังค้นหาตารางเรียน...'}
      </h3>
      <p class="text-xs text-slate-500 mt-1">
        {languageState.language === 'en'
          ? 'Please wait while fetching classes and rooms.'
          : 'โปรดรอสักครู่ ระบบกำลังดึงข้อมูลรายวิชาและห้องเรียน'}
      </p>
    </div>
  {/if}

  <!-- Error State -->
  {#if !isLoading && fetchError}
    <div class="bg-red-50 rounded-3xl border border-red-200 p-8 sm:p-10 text-center shadow-xs">
      <div class="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-3 text-red-600">
        <Info class="w-6 h-6" />
      </div>
      <h3 class="text-base font-bold text-red-900">
        {languageState.language === 'en' ? 'Unable to load schedule data' : 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}
      </h3>
      <p class="text-xs sm:text-sm text-red-700 mt-1 max-w-md mx-auto">
        {fetchError}
      </p>
      <button
        type="button"
        onclick={fetchSchedules}
        class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
      >
        <RefreshCw class="w-3.5 h-3.5" />
        <span>{languageState.language === 'en' ? 'Try again' : 'ลองใหม่อีกครั้ง'}</span>
      </button>
    </div>
  {/if}

  <!-- Empty State -->
  {#if !isLoading && !fetchError && schedules.length === 0}
    <div class="bg-white rounded-3xl border border-dashed border-slate-300 p-12 sm:p-16 text-center shadow-xs">
      <div class="w-16 h-16 rounded-3xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto mb-4 text-brand-orange">
        <CalendarX2 class="w-8 h-8" />
      </div>
      <h3 class="text-base sm:text-lg font-bold text-slate-900">
        {languageState.language === 'en'
          ? 'No Published Timetable Found'
          : 'ไม่พบตารางเรียนที่เผยแพร่สำหรับเงื่อนไขที่เลือก'}
      </h3>
      <p class="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
        {languageState.language === 'en'
          ? `No timetable has been published for this program in Semester ${filters.semester}/${filters.academicYear} (Year ${filters.yearLevel}) yet. Please try selecting a different semester or academic year.`
          : `ยังไม่มีการเผยแพร่ตารางเรียนสำหรับหลักสูตรนี้ ในภาคการศึกษาที่ ${filters.semester}/${filters.academicYear} (ชั้นปีที่ ${filters.yearLevel}) โปรดลองเลือกปีการศึกษาอื่น หรือตรวจสอบภาคเรียนถัดไป`}
      </p>

      <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onclick={() =>
            handleFilterChange({
              ...filters,
              semester: filters.semester === 1 ? 2 : 1
            })
          }
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <span>
            {languageState.language === 'en'
              ? `Switch to Semester ${filters.semester === 1 ? 2 : 1}`
              : `สลับเป็นภาคการศึกษาที่ ${filters.semester === 1 ? 2 : 1}`}
          </span>
        </button>

        <button
          type="button"
          onclick={() =>
            handleFilterChange({
              ...filters,
              yearLevel: 1,
              degreeLevel: 'BACHELOR',
              programId: 'bachelor-itd'
            })
          }
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <span>{languageState.language === 'en' ? 'Reset to Bachelor Yr 1' : 'รีเซ็ตเป็น ป.ตรี ปี 1'}</span>
        </button>
      </div>
    </div>
  {/if}

  <!-- Schedule View Content -->
  {#if !isLoading && !fetchError && schedules.length > 0}
    <div>
      {#if viewMode === 'grid'}
        <!-- Desktop / Tablet Matrix Grid View -->
        <div class="hidden md:block">
          <WeeklyTimetableGrid slots={activeSlots} />
        </div>

        <!-- Mobile Thumb-Friendly Day View -->
        <div class="block md:hidden">
          <MobileDayView
            slots={activeSlots}
            {selectedDay}
            onSelectDay={(day) => (selectedDay = day)}
          />
        </div>
      {:else}
        <!-- Tabular List View -->
        <ScheduleListView slots={activeSlots} />
      {/if}
    </div>
  {/if}
</div>
