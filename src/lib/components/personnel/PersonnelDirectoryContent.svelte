<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { personnel } from "$lib/data/personnel";
  import type { PersonnelMember } from "$lib/types";
  import PersonnelCard from "$lib/components/personnel/PersonnelCard.svelte";
  import { languageState } from "$lib/state/language.svelte";
  import {
    PERSONNEL_CATEGORIES,
    getDepartmentName,
    getPersonName,
    getRoleName,
    getPersonEnglishName
  } from "$lib/personnel-utils";
  import {
    Users,
    Award,
    GraduationCap,
    Briefcase,
    Home,
    ChevronRight,
    Search,
    X,
    Building2,
    SlidersHorizontal,
    LayoutGrid,
    ListFilter,
    UserX,
    Sparkles,
    ArrowUpRight
  } from "lucide-svelte";

  let selectedCategory = $state("all");
  let searchQuery = $state("");
  let selectedDepartment = $state("all");
  let groupByDepartment = $state(false);

  onMount(() => {
    const cat = page.url.searchParams.get("category") || "all";
    const q = page.url.searchParams.get("q") || page.url.searchParams.get("search") || "";
    const dept = page.url.searchParams.get("dept") || "all";

    selectedCategory = cat;
    searchQuery = q;
    selectedDepartment = dept;
  });

  function updateUrlParams(cat: string, search: string, dept: string) {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (cat && cat !== "all") params.set("category", cat);
    if (search && search.trim() !== "") params.set("q", search.trim());
    if (dept && dept !== "all") params.set("dept", dept);

    const queryStr = params.toString();
    const newUrl = queryStr ? `${page.url.pathname}?${queryStr}` : page.url.pathname;
    window.history.replaceState(null, "", newUrl);
  }

  const categoryCounts = {
    all: personnel.length,
    administrator: personnel.filter((p) => p.category === "administrator").length,
    lecturer: personnel.filter((p) => p.category === "lecturer").length,
    staff: personnel.filter((p) => p.category === "staff").length
  };

  const departmentCounts: Record<string, number> = {};
  personnel.forEach((p) => {
    if (p.department) {
      departmentCounts[p.department] = (departmentCounts[p.department] || 0) + 1;
    }
  });

  let filteredPersonnel = $derived(
    personnel.filter((person) => {
      if (selectedCategory !== "all" && person.category !== selectedCategory) {
        return false;
      }
      if (selectedDepartment !== "all" && person.department !== selectedDepartment) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const nameThMatch = person.nameTh.toLowerCase().includes(query);
        const nameEnMatch = getPersonEnglishName(person)?.toLowerCase().includes(query) ?? false;
        const roleThMatch = person.role.toLowerCase().includes(query);
        const roleEnMatch = getRoleName(person.role, "en").toLowerCase().includes(query);
        const deptThMatch = person.department ? person.department.toLowerCase().includes(query) : false;
        const deptEnMatch = person.department ? getDepartmentName(person.department, "en").toLowerCase().includes(query) : false;
        const emailMatch = person.email ? person.email.toLowerCase().includes(query) : false;
        const phoneMatch = person.phone ? person.phone.includes(query) : false;

        return (
          nameThMatch ||
          nameEnMatch ||
          roleThMatch ||
          roleEnMatch ||
          deptThMatch ||
          deptEnMatch ||
          emailMatch ||
          phoneMatch
        );
      }
      return true;
    })
  );

  let groupedPersonnel = $derived.by(() => {
    const map = new Map<string, PersonnelMember[]>();
    filteredPersonnel.forEach((person) => {
      const dept = person.department || "คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล";
      if (!map.has(dept)) {
        map.set(dept, []);
      }
      map.get(dept)!.push(person);
    });
    return Array.from(map.entries()).map(([deptName, members]) => ({
      departmentName: deptName,
      members
    }));
  });

  function handleCategoryChange(catId: string) {
    selectedCategory = catId;
    updateUrlParams(catId, searchQuery, selectedDepartment);
  }

  function handleDepartmentChange(dept: string) {
    selectedDepartment = dept;
    updateUrlParams(selectedCategory, searchQuery, dept);
  }

  function handleSearchChange(query: string) {
    searchQuery = query;
    updateUrlParams(selectedCategory, query, selectedDepartment);
  }

  function handleResetFilters() {
    selectedCategory = "all";
    selectedDepartment = "all";
    searchQuery = "";
    updateUrlParams("all", "", "all");
  }
</script>

<div class="w-full flex flex-col">
  <!-- Hero Header Banner -->
  <section class="relative w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <!-- Breadcrumbs -->
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
        <a
          href="/"
          class="inline-flex items-center gap-1.5 hover:text-brand-orange transition-colors"
        >
          <Home class="w-3.5 h-3.5" />
          <span>{languageState.t("หน้าหลัก", "Home")}</span>
        </a>
        <ChevronRight class="w-3.5 h-3.5 text-gray-600" />
        <span class="text-brand-orange font-medium">
          {languageState.t("บุคลากร", "Personnel")}
        </span>
      </nav>

      <!-- Title & Description -->
      <div class="max-w-3xl space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold tracking-wide">
          <Users class="w-3.5 h-3.5" />
          <span>ITD KMUTNB DIRECTORY</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          {languageState.t("บุคลากรและคณาจารย์", "Personnel & Faculty Directory")}
        </h1>
        <p class="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
          {languageState.t(
            "ทำเนียบคณาจารย์ นักวิจัย ผู้บริหาร และบุคลากรสายสนับสนุน คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
            "Explore our distinguished faculty members, executive leadership, academic researchers, and professional support staff at ITD KMUTNB."
          )}
        </p>
      </div>

      <!-- Stats Badges -->
      <div class="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Sparkles class="w-4 h-4 text-brand-orange" />
          <span>
            <strong class="text-white font-semibold">{personnel.length}</strong>{" "}
            {languageState.t("บุคลากรทั้งหมด", "Total Personnel")}
          </span>
        </div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Award class="w-4 h-4 text-amber-400" />
          <span>
            <strong class="text-white font-semibold">{categoryCounts.administrator}</strong>{" "}
            {languageState.t("ผู้บริหาร", "Administrators")}
          </span>
        </div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <GraduationCap class="w-4 h-4 text-sky-400" />
          <span>
            <strong class="text-white font-semibold">{categoryCounts.lecturer}</strong>{" "}
            {languageState.t("อาจารย์ประจำ", "Lecturers")}
          </span>
        </div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Briefcase class="w-4 h-4 text-emerald-400" />
          <span>
            <strong class="text-white font-semibold">{categoryCounts.staff}</strong>{" "}
            {languageState.t("สายสนับสนุน", "Support Staff")}
          </span>
        </div>
      </div>
    </div>
  </section>

  <!-- Main Content Area -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
    <!-- Quick Subpage Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <a
        href="/personnel/administrators"
        class="group relative bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-lg hover:border-brand-orange/40 transition-all flex items-start justify-between"
      >
        <div class="flex items-start gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-brand-orange shrink-0 group-hover:bg-brand-orange group-hover:text-white transition-colors">
            <Award class="w-5 h-5" />
          </div>
          <div class="space-y-1">
            <h3 class="font-bold text-gray-900 group-hover:text-brand-orange transition-colors text-sm sm:text-base">
              {languageState.t("ผู้บริหารคณะ", "Executive Leadership")}
            </h3>
            <p class="text-xs text-gray-500 line-clamp-1">
              {languageState.t("โครงสร้างการบริหารระดับคณะและหัวหน้าภาควิชา", "Dean, Associate Deans & Dept Heads")}
            </p>
            <span class="inline-block text-[11px] font-semibold text-brand-orange">
              8 {languageState.t("ท่าน", "Members")}
            </span>
          </div>
        </div>
        <ArrowUpRight class="w-4 h-4 text-gray-400 group-hover:text-brand-orange group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </a>

      <a
        href="/personnel/lecturers"
        class="group relative bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-lg hover:border-brand-orange/40 transition-all flex items-start justify-between"
      >
        <div class="flex items-start gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <GraduationCap class="w-5 h-5" />
          </div>
          <div class="space-y-1">
            <h3 class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
              {languageState.t("คณาจารย์ประจำ", "Lecturers & Faculty")}
            </h3>
            <p class="text-xs text-gray-500 line-clamp-1">
              {languageState.t("คณาจารย์แยกตาม 3 ภาควิชาการเรียนการสอน", "Faculty across 3 academic departments")}
            </p>
            <span class="inline-block text-[11px] font-semibold text-blue-600">
              26 {languageState.t("ท่าน", "Members")}
            </span>
          </div>
        </div>
        <ArrowUpRight class="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </a>

      <a
        href="/personnel/staff"
        class="group relative bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-lg hover:border-brand-orange/40 transition-all flex items-start justify-between"
      >
        <div class="flex items-start gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Briefcase class="w-5 h-5" />
          </div>
          <div class="space-y-1">
            <h3 class="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors text-sm sm:text-base">
              {languageState.t("เจ้าหน้าที่สายสนับสนุน", "Support Staff")}
            </h3>
            <p class="text-xs text-gray-500 line-clamp-1">
              {languageState.t("บุคลากรสนับสนุนแยกตาม 7 หน่วยงานบริการ", "Support staff across 7 divisions")}
            </p>
            <span class="inline-block text-[11px] font-semibold text-emerald-600">
              22 {languageState.t("ท่าน", "Members")}
            </span>
          </div>
        </div>
        <ArrowUpRight class="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </a>
    </div>

    <!-- Filter & Search Bar -->
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-6 space-y-4">
      <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <!-- Search Input -->
        <div class="relative flex-1">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            oninput={(e) => handleSearchChange((e.target as HTMLInputElement).value)}
            placeholder={languageState.t(
              "ค้นหาชื่ออาจารย์, ตำแหน่ง, ภาควิชา, หรืออีเมล...",
              "Search by name, role, department, or email..."
            )}
            class="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-orange focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 transition-all"
          />
          {#if searchQuery}
            <button
              type="button"
              onclick={() => handleSearchChange("")}
              aria-label={languageState.t("ล้างคำค้นหา", "Clear search")}
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors cursor-pointer"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          {/if}
        </div>

        <!-- Department Dropdown Selector -->
        <div class="flex items-center gap-2">
          <div class="relative min-w-[200px]">
            <select
              value={selectedDepartment}
              onchange={(e) => handleDepartmentChange((e.target as HTMLSelectElement).value)}
              aria-label={languageState.t("เลือกภาควิชา/หน่วยงาน", "Select Department/Division")}
              class="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-700 font-medium focus:bg-white focus:border-brand-orange focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 cursor-pointer transition-all"
            >
              <option value="all">
                {languageState.t("ทุกภาควิชา / ทุกหน่วยงาน", "All Departments & Units")}
              </option>
              {#each Object.keys(departmentCounts) as dept}
                <option value={dept}>
                  {getDepartmentName(dept, languageState.language)} ({departmentCounts[dept]})
                </option>
              {/each}
            </select>
            <SlidersHorizontal class="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          <!-- Grouping Toggle -->
          <button
            type="button"
            onclick={() => groupByDepartment = !groupByDepartment}
            title={languageState.t("สลับการจัดกลุ่มตามภาควิชา", "Toggle grouping by department")}
            class="p-2.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer {groupByDepartment
              ? 'bg-brand-orange text-white border-brand-orange shadow-2xs'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}"
          >
            {#if groupByDepartment}
              <ListFilter class="w-4 h-4" />
              <span class="hidden sm:inline">{languageState.t("จัดกลุ่ม", "Grouped")}</span>
            {:else}
              <LayoutGrid class="w-4 h-4" />
              <span class="hidden sm:inline">{languageState.t("ตารางรวม", "Grid")}</span>
            {/if}
          </button>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="pt-2 flex items-center gap-2 overflow-x-auto pb-1 border-t border-gray-100 scrollbar-none">
        {#each PERSONNEL_CATEGORIES as cat}
          {@const isActive = selectedCategory === cat.id}
          {@const count = categoryCounts[cat.id as keyof typeof categoryCounts]}
          <button
            type="button"
            onclick={() => handleCategoryChange(cat.id)}
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer {isActive
              ? 'bg-brand-orange text-white shadow-xs shadow-orange-500/20'
              : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'}"
          >
            <span>{languageState.language === "en" ? cat.nameEn : cat.nameTh}</span>
            <span
              class="text-[11px] px-1.5 py-0.2 rounded-full font-bold {isActive ? 'bg-white/25 text-white' : 'bg-white text-gray-600'}"
            >
              {count}
            </span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Results Counter & Active Filter Summary -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-600">
      <div>
        <span>
          {languageState.t(
            `แสดงบุคลากรทั้งหมด ${filteredPersonnel.length} ท่าน`,
            `Showing ${filteredPersonnel.length} personnel members`
          )}
        </span>
        {#if selectedCategory !== "all" || selectedDepartment !== "all" || searchQuery}
          <button
            type="button"
            onclick={handleResetFilters}
            class="ml-3 text-brand-orange hover:underline font-semibold cursor-pointer"
          >
            {languageState.t("ล้างตัวกรองทั้งหมด", "Clear all filters")}
          </button>
        {/if}
      </div>
    </div>

    <!-- Personnel Content Grid / Department Groups -->
    {#if filteredPersonnel.length > 0}
      {#if groupByDepartment}
        <!-- Grouped by Department -->
        <div class="space-y-10 animate-fade-in">
          {#each groupedPersonnel as { departmentName, members } (departmentName)}
            <div class="space-y-4">
              <!-- Department Section Header -->
              <div class="flex items-center justify-between pb-3 border-b-2 border-brand-orange/20">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-orange-100 text-brand-orange flex items-center justify-center">
                    <Building2 class="w-4 h-4" />
                  </div>
                  <h2 class="text-lg sm:text-xl font-bold text-gray-900">
                    {getDepartmentName(departmentName, languageState.language)}
                  </h2>
                </div>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                  {members.length} {languageState.t("ท่าน", "Members")}
                </span>
              </div>

              <!-- Members Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {#each members as person (person.id)}
                  <PersonnelCard {person} />
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- Flat Grid View -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {#each filteredPersonnel as person, index (person.id)}
            <PersonnelCard
              {person}
              priority={index < 8}
            />
          {/each}
        </div>
      {/if}
    {:else}
      <!-- Empty State -->
      <div class="py-20 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs space-y-4">
        <div class="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-brand-orange">
          <UserX class="w-8 h-8" />
        </div>
        <div class="space-y-1.5 max-w-md mx-auto">
          <h3 class="text-lg font-bold text-gray-900">
            {languageState.t("ไม่พบบุคลากรที่ตรงกับเงื่อนไขการค้นหา", "No personnel found matching criteria")}
          </h3>
          <p class="text-xs sm:text-sm text-gray-500">
            {languageState.t(
              "ลองปรับเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อค้นหาข้อมูลบุคลากรที่ต้องการ",
              "Try adjusting your search keywords or switching category filters."
            )}
          </p>
        </div>
        <div class="pt-2">
          <button
            type="button"
            onclick={handleResetFilters}
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
          >
            <span>{languageState.t("ล้างตัวกรองและดูบุคลากรทั้งหมด", "Reset Filters & View All")}</span>
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
