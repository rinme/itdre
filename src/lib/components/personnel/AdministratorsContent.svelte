<script lang="ts">
  import { personnel } from "$lib/data/personnel";
  import PersonnelCard from "$lib/components/personnel/PersonnelCard.svelte";
  import { languageState } from "$lib/state/language.svelte";
  import {
    getRoleName,
    getPersonEnglishName
  } from "$lib/personnel-utils";
  import {
    Award,
    Home,
    ChevronRight,
    Search,
    X,
    ShieldCheck,
    Building2,
    GraduationCap,
    Briefcase,
    Users,
    UserX
  } from "lucide-svelte";

  let searchQuery = $state("");

  const administrators = personnel.filter((p) => p.category === "administrator");

  let filteredAdmins = $derived.by(() => {
    if (!searchQuery.trim()) return administrators;
    const query = searchQuery.trim().toLowerCase();

    return administrators.filter((person) => {
      const nameThMatch = person.nameTh.toLowerCase().includes(query);
      const nameEnMatch = getPersonEnglishName(person)?.toLowerCase().includes(query) ?? false;
      const roleThMatch = person.role.toLowerCase().includes(query);
      const roleEnMatch = getRoleName(person.role, "en").toLowerCase().includes(query);
      const emailMatch = person.email ? person.email.toLowerCase().includes(query) : false;
      const phoneMatch = person.phone ? person.phone.includes(query) : false;

      return nameThMatch || nameEnMatch || roleThMatch || roleEnMatch || emailMatch || phoneMatch;
    });
  });

  let dean = $derived(filteredAdmins.find((p) => p.id === "person-1"));
  let associateDeans = $derived(
    filteredAdmins.filter((p) => ["person-2", "person-3", "person-4"].includes(p.id))
  );
  let departmentHeads = $derived(
    filteredAdmins.filter((p) => ["person-5", "person-6", "person-7", "person-8"].includes(p.id))
  );
</script>

<div class="w-full flex flex-col">
  <!-- Hero Header Banner -->
  <section class="relative w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none"></div>
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
          {languageState.t("คณะผู้บริหาร", "Executive Leadership")}
        </span>
      </nav>

      <!-- Title and Intro -->
      <div class="max-w-3xl space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold tracking-wide">
          <Award class="w-3.5 h-3.5" />
          <span>EXECUTIVE BOARD & LEADERSHIP</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          {languageState.t("คณะผู้บริหาร", "Executive Leadership")}
        </h1>
        <p class="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
          {languageState.t(
            "โครงสร้างการบริหารระดับคณะ คณบดี รองคณบดี หัวหน้าภาควิชา และหัวหน้าสำนักงานคณบดี คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
            "The executive leadership team of the Faculty of Information Technology and Digital Innovation, driving visionary academic and technological excellence."
          )}
        </p>
      </div>

      <!-- Quick Subpage Navigation Pills -->
      <div class="pt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <a
          href="/personnel"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-gray-200 transition-all"
        >
          <Users class="w-3.5 h-3.5 text-gray-400" />
          <span>{languageState.t("บุคลากรทั้งหมด", "All Personnel")} (56)</span>
        </a>
        <div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-orange text-white font-semibold shadow-md">
          <Award class="w-3.5 h-3.5" />
          <span>{languageState.t("ผู้บริหารคณะ", "Administrators")} (8)</span>
        </div>
        <a
          href="/personnel/lecturers"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-gray-200 transition-all"
        >
          <GraduationCap class="w-3.5 h-3.5 text-sky-400" />
          <span>{languageState.t("คณาจารย์ประจำ", "Lecturers")} (26)</span>
        </a>
        <a
          href="/personnel/staff"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-gray-200 transition-all"
        >
          <Briefcase class="w-3.5 h-3.5 text-emerald-400" />
          <span>{languageState.t("เจ้าหน้าที่สายสนับสนุน", "Support Staff")} (22)</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Main Hierarchy Container -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 w-full">
    <!-- Search within Administrators -->
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full sm:max-w-md">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          oninput={(e) => searchQuery = (e.target as HTMLInputElement).value}
          placeholder={languageState.t("ค้นหาผู้บริหาร, ตำแหน่ง, หรืออีเมล...", "Search administrators by name, role...")}
          class="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-orange focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 transition-all"
        />
        {#if searchQuery}
          <button
            type="button"
            onclick={() => searchQuery = ""}
            aria-label={languageState.t("ล้างคำค้นหา", "Clear search")}
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        {/if}
      </div>

      <div class="text-xs sm:text-sm text-gray-500 font-medium self-start sm:self-center">
        {languageState.t(`ผู้บริหาร ${filteredAdmins.length} ท่าน`, `${filteredAdmins.length} Executive Members`)}
      </div>
    </div>

    {#if filteredAdmins.length > 0}
      <div class="space-y-14">
        <!-- Level 1: Dean (คณบดี) -->
        {#if dean}
          <section class="space-y-6">
            <div class="flex items-center gap-3 pb-3 border-b-2 border-brand-orange/30">
              <div class="w-9 h-9 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center font-bold">
                <ShieldCheck class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
                  {languageState.t("คณบดีคณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล", "Dean of the Faculty")}
                </h2>
                <p class="text-xs sm:text-sm text-gray-500">
                  {languageState.t("ผู้บริหารสูงสุดระดับคณะ", "Executive Dean of ITD KMUTNB")}
                </p>
              </div>
            </div>

            <div class="max-w-4xl mx-auto">
              <PersonnelCard person={dean} featured priority />
            </div>
          </section>
        {/if}

        <!-- Level 2: Associate Deans (รองคณบดี) -->
        {#if associateDeans.length > 0}
          <section class="space-y-6">
            <div class="flex items-center gap-3 pb-3 border-b-2 border-brand-orange/20">
              <div class="w-9 h-9 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center font-bold">
                <Award class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-lg sm:text-xl font-bold text-gray-900">
                  {languageState.t("คณะรองคณบดี", "Associate Deans")}
                </h2>
                <p class="text-xs sm:text-sm text-gray-500">
                  {languageState.t(
                    "รองคณบดีฝ่ายบริหาร วิชาการและวิจัย กิจการนักศึกษาและประกันคุณภาพ",
                    "Associate Deans for Administrative, Academic & Research, and Student Affairs"
                  )}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each associateDeans as person (person.id)}
                <PersonnelCard {person} />
              {/each}
            </div>
          </section>
        {/if}

        <!-- Level 3: Department Heads & Head of Dean's Office -->
        {#if departmentHeads.length > 0}
          <section class="space-y-6">
            <div class="flex items-center gap-3 pb-3 border-b-2 border-brand-orange/20">
              <div class="w-9 h-9 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center font-bold">
                <Building2 class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-lg sm:text-xl font-bold text-gray-900">
                  {languageState.t("หัวหน้าภาควิชาและหัวหน้าสำนักงานคณบดี", "Department Heads & Head of Office")}
                </h2>
                <p class="text-xs sm:text-sm text-gray-500">
                  {languageState.t(
                    "หัวหน้าภาควิชา IT, ITM, DNet และหัวหน้าสำนักงานคณบดี",
                    "Department Heads of IT, ITM, DNet and Head of Dean's Office"
                  )}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {#each departmentHeads as person (person.id)}
                <PersonnelCard {person} />
              {/each}
            </div>
          </section>
        {/if}
      </div>
    {:else}
      <!-- Empty state -->
      <div class="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs space-y-4">
        <div class="w-14 h-14 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-brand-orange">
          <UserX class="w-7 h-7" />
        </div>
        <div class="space-y-1 max-w-sm mx-auto">
          <h3 class="text-base font-bold text-gray-900">
            {languageState.t("ไม่พบข้อมูลผู้บริหารที่ค้นหา", "No administrators found")}
          </h3>
          <p class="text-xs text-gray-500">
            {languageState.t("ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง", "Try adjusting your search keywords")}
          </p>
        </div>
        <button
          type="button"
          onclick={() => searchQuery = ""}
          class="px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          {languageState.t("ล้างคำค้นหา", "Clear search")}
        </button>
      </div>
    {/if}
  </div>
</div>
