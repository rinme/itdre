<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { personnel } from "$lib/data/personnel";
  import type { PersonnelMember } from "$lib/types";
  import PersonnelCard from "$lib/components/personnel/PersonnelCard.svelte";
  import { languageState } from "$lib/state/language.svelte";
  import {
    getRoleName,
    getPersonEnglishName
  } from "$lib/personnel-utils";
  import {
    GraduationCap,
    Home,
    ChevronRight,
    Search,
    X,
    Building2,
    Users,
    Award,
    Briefcase,
    UserX,
    Sparkles,
    BookOpen,
    CheckCircle2
  } from "lucide-svelte";

  const ACADEMIC_DEPARTMENTS = [
    {
      id: "all",
      nameTh: "ทุกภาควิชา",
      nameEn: "All Departments",
      code: "ALL"
    },
    {
      id: "it",
      nameTh: "ภาควิชาเทคโนโลยีสารสนเทศ",
      nameEn: "Department of Information Technology",
      code: "IT",
      descriptionTh: "มุ่งเน้นการผลิตบัณฑิตและผลงานวิจัยด้านการพัฒนาซอฟต์แวร์ วิทยาการข้อมูล ปัญญาประดิษฐ์ และเทคโนโลยีสารสนเทศประยุกต์",
      descriptionEn: "Focusing on software development, data science, artificial intelligence, and applied information technology."
    },
    {
      id: "itm",
      nameTh: "ภาควิชาการจัดการเทคโนโลยีสารสนเทศ",
      nameEn: "Department of Information Technology Management",
      code: "ITM",
      descriptionTh: "มุ่งเน้นการบริหารจัดการเทคโนโลยีดิจิทัล นวัตกรรมธุรกิจเทคโนโลยี การวิเคราะห์ข้อมูลองค์กร และการบริหารโครงการไอที",
      descriptionEn: "Focusing on digital technology management, business innovation, enterprise data analytics, and IT project governance."
    },
    {
      id: "dnet",
      nameTh: "ภาควิชาการบริหารเครือข่ายดิจิทัลและความมั่นคงปลอดภัยสารสนเทศ",
      nameEn: "Department of Digital Network and Information Security Management",
      code: "DNet",
      descriptionTh: "มุ่งเน้นระบบเครือข่ายคอมพิวเตอร์ สถาปัตยกรรมคลาวด์ ความมั่นคงปลอดภัยไซเบอร์ และโครงสร้างพื้นฐานดิจิทัล",
      descriptionEn: "Focusing on computer networking, cloud architecture, cybersecurity, and digital infrastructure resilience."
    }
  ];

  let selectedDeptId = $state("all");
  let searchQuery = $state("");

  onMount(() => {
    const dept = page.url.searchParams.get("dept") || "all";
    const q = page.url.searchParams.get("q") || page.url.searchParams.get("search") || "";
    selectedDeptId = dept;
    searchQuery = q;
  });

  function updateUrlParams(dept: string, query: string) {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (dept && dept !== "all") params.set("dept", dept);
    if (query && query.trim() !== "") params.set("q", query.trim());

    const queryStr = params.toString();
    const newUrl = queryStr ? `${page.url.pathname}?${queryStr}` : page.url.pathname;
    window.history.replaceState(null, "", newUrl);
  }

  const allLecturers = personnel.filter((p) => p.category === "lecturer");

  const deptCounts = (() => {
    const counts: Record<string, number> = { all: allLecturers.length };
    ACADEMIC_DEPARTMENTS.slice(1).forEach((dept) => {
      counts[dept.id] = allLecturers.filter((p) => p.department === dept.nameTh).length;
    });
    return counts;
  })();

  const titleCounts = (() => {
    let professors = 0;
    let assocProfessors = 0;
    let asstProfessors = 0;
    let lecturers = 0;

    allLecturers.forEach((p) => {
      if (p.nameTh.includes("ศ.ดร.") || p.nameTh.includes("ศาสตราจารย์")) professors++;
      else if (p.nameTh.includes("รศ.ดร.") || p.nameTh.includes("รองศาสตราจารย์")) assocProfessors++;
      else if (p.nameTh.includes("ผศ.ดร.") || p.nameTh.includes("ผู้ช่วยศาสตราจารย์")) asstProfessors++;
      else lecturers++;
    });

    return { professors, assocProfessors, asstProfessors, lecturers };
  })();

  let filteredLecturers = $derived(
    allLecturers.filter((person) => {
      if (selectedDeptId !== "all") {
        const deptObj = ACADEMIC_DEPARTMENTS.find((d) => d.id === selectedDeptId);
        if (deptObj && person.department !== deptObj.nameTh) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const nameThMatch = person.nameTh.toLowerCase().includes(query);
        const nameEnMatch = getPersonEnglishName(person)?.toLowerCase().includes(query) ?? false;
        const roleThMatch = person.role.toLowerCase().includes(query);
        const roleEnMatch = getRoleName(person.role, "en").toLowerCase().includes(query);
        const deptThMatch = person.department ? person.department.toLowerCase().includes(query) : false;
        const emailMatch = person.email ? person.email.toLowerCase().includes(query) : false;
        const phoneMatch = person.phone ? person.phone.includes(query) : false;

        return nameThMatch || nameEnMatch || roleThMatch || roleEnMatch || deptThMatch || emailMatch || phoneMatch;
      }

      return true;
    })
  );

  let groupedDepartments = $derived.by(() => {
    const activeDepts =
      selectedDeptId === "all"
        ? ACADEMIC_DEPARTMENTS.slice(1)
        : ACADEMIC_DEPARTMENTS.filter((d) => d.id === selectedDeptId);

    return activeDepts
      .map((dept) => {
        const members = filteredLecturers.filter((p) => p.department === dept.nameTh);
        return {
          deptInfo: dept,
          members
        };
      })
      .filter((group) => group.members.length > 0);
  });

  function handleDeptChange(deptId: string) {
    selectedDeptId = deptId;
    updateUrlParams(deptId, searchQuery);
  }

  function handleSearchChange(query: string) {
    searchQuery = query;
    updateUrlParams(selectedDeptId, query);
  }

  function handleResetFilters() {
    selectedDeptId = "all";
    searchQuery = "";
    updateUrlParams("all", "");
  }
</script>

<div class="w-full flex flex-col">
  <!-- Hero Header Banner -->
  <section class="relative w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none"></div>
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
        <a
          href="/personnel"
          class="hover:text-brand-orange transition-colors"
        >
          {languageState.t("บุคลากร", "Personnel")}
        </a>
        <ChevronRight class="w-3.5 h-3.5 text-gray-600" />
        <span class="text-brand-orange font-medium">
          {languageState.t("คณาจารย์ประจำ", "Lecturers & Faculty")}
        </span>
      </nav>

      <!-- Title and Intro -->
      <div class="max-w-3xl space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-400 text-xs font-semibold tracking-wide">
          <GraduationCap class="w-3.5 h-3.5" />
          <span>ACADEMIC FACULTY DIRECTORY</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          {languageState.t("คณาจารย์ประจำคณะ", "Lecturers & Faculty Members")}
        </h1>
        <p class="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
          {languageState.t(
            "ทำเนียบคณาจารย์ผู้ทรงคุณวุฒิ นักวิจัย และผู้เชี่ยวชาญเฉพาะทางประจำ 3 ภาควิชา คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
            "Meet our distinguished professors, researchers, and academic specialists across our three core computing and digital technology departments."
          )}
        </p>
      </div>

      <!-- Academic Stats Badges -->
      <div class="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Sparkles class="w-4 h-4 text-brand-orange" />
          <span>
            <strong class="text-white font-semibold">{allLecturers.length}</strong>{" "}
            {languageState.t("อาจารย์ประจำทั้งหมด", "Faculty Members")}
          </span>
        </div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Award class="w-4 h-4 text-amber-400" />
          <span>
            <strong class="text-white font-semibold">{titleCounts.professors}</strong>{" "}
            {languageState.t("ศาสตราจารย์", "Professors")}
          </span>
        </div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <GraduationCap class="w-4 h-4 text-sky-400" />
          <span>
            <strong class="text-white font-semibold">{titleCounts.assocProfessors}</strong>{" "}
            {languageState.t("รองศาสตราจารย์", "Assoc. Profs")}
          </span>
        </div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <BookOpen class="w-4 h-4 text-emerald-400" />
          <span>
            <strong class="text-white font-semibold">{titleCounts.asstProfessors}</strong>{" "}
            {languageState.t("ผู้ช่วยศาสตราจารย์", "Asst. Profs")}
          </span>
        </div>
      </div>
    </div>
  </section>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
    <!-- Navigation Switcher Pills to other subpages -->
    <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
      <a
        href="/personnel"
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 shadow-2xs transition-all"
      >
        <Users class="w-3.5 h-3.5 text-gray-500" />
        <span>{languageState.t("บุคลากรทั้งหมด", "All Personnel")} (56)</span>
      </a>
      <a
        href="/personnel/administrators"
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 shadow-2xs transition-all"
      >
        <Award class="w-3.5 h-3.5 text-amber-500" />
        <span>{languageState.t("ผู้บริหารคณะ", "Administrators")} (8)</span>
      </a>
      <div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-semibold shadow-md">
        <GraduationCap class="w-3.5 h-3.5" />
        <span>{languageState.t("คณาจารย์ประจำ", "Lecturers")} (26)</span>
      </div>
      <a
        href="/personnel/staff"
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 shadow-2xs transition-all"
      >
        <Briefcase class="w-3.5 h-3.5 text-emerald-500" />
        <span>{languageState.t("เจ้าหน้าที่สายสนับสนุน", "Support Staff")} (22)</span>
      </a>
    </div>

    <!-- Filter and Search Card -->
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-6 space-y-4">
      <!-- Search Input -->
      <div class="relative">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          oninput={(e) => handleSearchChange((e.target as HTMLInputElement).value)}
          placeholder={languageState.t(
            "ค้นหาชื่ออาจารย์, ตำแหน่งทางวิชาการ, สาขาวิชา, หรืออีเมล...",
            "Search faculty by name, academic title, department, or email..."
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

      <!-- Department Filter Tabs -->
      <div class="pt-2 flex items-center gap-2 overflow-x-auto pb-1 border-t border-gray-100 scrollbar-none">
        {#each ACADEMIC_DEPARTMENTS as dept}
          {@const isActive = selectedDeptId === dept.id}
          {@const count = deptCounts[dept.id] || 0}
          <button
            type="button"
            onclick={() => handleDeptChange(dept.id)}
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer {isActive
              ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
              : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'}"
          >
            <span>{languageState.language === "en" ? dept.nameEn : dept.nameTh}</span>
            <span
              class="text-[11px] px-1.5 py-0.2 rounded-full font-bold {isActive ? 'bg-white/25 text-white' : 'bg-white text-gray-600'}"
            >
              {count}
            </span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Results Counter -->
    <div class="flex items-center justify-between text-xs sm:text-sm text-gray-600">
      <span>
        {languageState.t(
          `พบคณาจารย์ทั้งหมด ${filteredLecturers.length} ท่าน`,
          `Showing ${filteredLecturers.length} faculty members`
        )}
      </span>
      {#if selectedDeptId !== "all" || searchQuery}
        <button
          type="button"
          onclick={handleResetFilters}
          class="text-brand-orange hover:underline font-semibold cursor-pointer"
        >
          {languageState.t("ล้างตัวกรองทั้งหมด", "Clear all filters")}
        </button>
      {/if}
    </div>

    <!-- Department Sections -->
    {#if groupedDepartments.length > 0}
      <div class="space-y-12 animate-fade-in">
        {#each groupedDepartments as { deptInfo, members } (deptInfo.id)}
          <section class="space-y-6">
            <!-- Department Header Card -->
            <div class="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0">
                    <Building2 class="w-5 h-5" />
                  </div>
                  <div>
                    <h2 class="text-lg sm:text-xl font-bold text-gray-900">
                      {languageState.language === "en" ? deptInfo.nameEn : deptInfo.nameTh}
                    </h2>
                    <span class="text-xs font-semibold text-blue-600">
                      {deptInfo.code} DEPARTMENT
                    </span>
                  </div>
                </div>

                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold self-start sm:self-center">
                  <CheckCircle2 class="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {members.length} {languageState.t("ท่าน", "Lecturers")}
                  </span>
                </div>
              </div>

              {#if deptInfo.descriptionTh}
                <p class="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
                  {languageState.language === "en" && deptInfo.descriptionEn
                    ? deptInfo.descriptionEn
                    : deptInfo.descriptionTh}
                </p>
              {/if}
            </div>

            <!-- Faculty Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {#each members as person, idx (person.id)}
                <PersonnelCard
                  {person}
                  priority={idx < 4}
                />
              {/each}
            </div>
          </section>
        {/each}
      </div>
    {:else}
      <!-- Empty State -->
      <div class="py-20 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs space-y-4">
        <div class="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
          <UserX class="w-8 h-8" />
        </div>
        <div class="space-y-1.5 max-w-md mx-auto">
          <h3 class="text-lg font-bold text-gray-900">
            {languageState.t("ไม่พบคณาจารย์ที่ตรงกับเงื่อนไข", "No faculty members found")}
          </h3>
          <p class="text-xs sm:text-sm text-gray-500">
            {languageState.t(
              "ลองเปลี่ยนคำค้นหา หรือเลือกภาควิชาอื่นเพื่อค้นหาข้อมูลอาจารย์ที่ต้องการ",
              "Try adjusting your search query or selecting a different department."
            )}
          </p>
        </div>
        <button
          type="button"
          onclick={handleResetFilters}
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
        >
          <span>{languageState.t("ล้างตัวกรองและดูทั้งหมด", "Reset Filters & View All")}</span>
        </button>
      </div>
    {/if}
  </div>
</div>
