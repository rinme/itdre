<script module lang="ts">
  import type { NavItem } from "$lib/types";

  export function isItemActive(item: NavItem, currentPath: string): boolean {
    if (item.href === "/" && currentPath === "/") return true;
    if (item.href === "/schedules") {
      return currentPath === "/schedules" || currentPath.startsWith("/schedules/");
    }
    if (item.href !== "/" && currentPath.startsWith(item.href.split("?")[0].split("#")[0])) {
      return true;
    }
    if (item.children) {
      return item.children.some((child) => {
        if (child.href === "/schedules") return false;
        return (
          child.href.startsWith("/") &&
          currentPath.startsWith(child.href.split("?")[0].split("#")[0])
        );
      });
    }
    return false;
  }
</script>

<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { mainNav, quickLinks } from "$lib/data/navigation";
  import { languageState } from "$lib/state/language.svelte";
  import {
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    Search,
    ExternalLink,
    Phone,
    Mail,
    GraduationCap,
    ArrowRight,
    CalendarDays
  } from "lucide-svelte";

  let mobileOpen = $state<boolean>(false);
  let openDropdown = $state<string | null>(null);
  let mobileExpanded = $state<Record<string, boolean>>({});
  let searchModalOpen = $state<boolean>(false);
  let searchQuery = $state<string>("");
  let searchInputElement = $state<HTMLInputElement | null>(null);

  const pathname = $derived(page.url.pathname);
  const isSchedulesActive = $derived(pathname === "/schedules" || pathname.startsWith("/schedules"));

  // Close mobile menu and dropdown on route change
  $effect(() => {
    const _current = page.url.pathname;
    mobileOpen = false;
    openDropdown = null;
  });

  // Lock body scroll when mobile drawer or search modal is open
  $effect(() => {
    if (typeof document !== "undefined") {
      if (mobileOpen || searchModalOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "unset";
      }
    };
  });

  // Focus input when search modal opens
  $effect(() => {
    if (searchModalOpen && searchInputElement) {
      const timer = setTimeout(() => {
        searchInputElement?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  });

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      searchModalOpen = false;
      mobileOpen = false;
      openDropdown = null;
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchModalOpen = !searchModalOpen;
    }
  }

  function toggleMobileAccordion(title: string) {
    mobileExpanded[title] = !mobileExpanded[title];
  }

  function handleSearchSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = encodeURIComponent(searchQuery.trim());
    searchModalOpen = false;
    searchQuery = "";
    goto(`/news?q=${query}`);
  }

  const quickSearchSuggestions = [
    { titleTh: "รับสมัครนักศึกษาใหม่", titleEn: "New Admissions", href: "https://www.admission.kmutnb.ac.th", external: true },
    { titleTh: "ตารางเรียน / ตารางสอน", titleEn: "Class Schedules", href: "/schedules" },
    { titleTh: "ปฏิทินการศึกษา", titleEn: "Academic Calendar", href: "http://acdserv.kmutnb.ac.th/academic-calendar", external: true },
    { titleTh: "คณาจารย์และบุคลากร", titleEn: "Faculty & Staff", href: "/personnel" },
    { titleTh: "ห้องเรียนและห้องปฏิบัติการ", titleEn: "Labs & Facilities", href: "/facilities" },
    { titleTh: "แบบฟอร์มและดาวน์โหลด", titleEn: "Forms & Downloads", href: "/services#downloads" },
    { titleTh: "ข่าวกิจกรรมและผลงาน", titleEn: "Events & News", href: "/news" },
  ];
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- Sticky Main Navigation Bar -->
<nav
  class="sticky top-0 z-40 w-full bg-[#121316]/95 backdrop-blur-xl text-white shadow-xl border-b border-white/10 transition-all"
  aria-label="Main Navigation"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-14">
      <!-- Desktop Navigation Links -->
      <div class="hidden lg:flex items-center gap-1 xl:gap-1.5">
        {#each mainNav as item (item.href + item.titleTh)}
          {@const hasChildren = item.children && item.children.length > 0}
          {@const active = isItemActive(item, pathname)}
          {@const isDropdownOpen = openDropdown === item.titleTh}

          {#if !hasChildren}
            <a
              href={item.href}
              class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all relative active:scale-95 {active
                ? 'text-brand-orange bg-white/10 font-semibold shadow-inner'
                : 'text-slate-200 hover:text-white hover:bg-white/5'}"
            >
              <span>{languageState.t(item.titleTh, item.titleEn)}</span>
              {#if active}
                <span class="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-brand-orange rounded-full shadow-[0_0_8px_#FF6B00]"></span>
              {/if}
            </a>
          {:else}
            <div
              class="relative group"
              role="none"
              onmouseenter={() => (openDropdown = item.titleTh)}
              onmouseleave={() => (openDropdown = null)}
            >
              <button
                type="button"
                onclick={() => (openDropdown = isDropdownOpen ? null : item.titleTh)}
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 {active || isDropdownOpen
                  ? 'text-brand-orange bg-white/10 font-semibold'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'}"
                aria-expanded={isDropdownOpen}
              >
                <span>{languageState.t(item.titleTh, item.titleEn)}</span>
                <ChevronDown
                  class="w-3.5 h-3.5 transition-transform duration-200 opacity-70 group-hover:opacity-100 {isDropdownOpen
                    ? 'rotate-180 text-brand-orange'
                    : ''}"
                />
              </button>

              <!-- Desktop Dropdown Menu -->
              <div
                class="absolute left-0 top-full pt-2 w-72 transition-all duration-200 {isDropdownOpen
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible -translate-y-2 pointer-events-none'}"
              >
                <div class="bg-[#1A1B20]/95 border border-white/10 rounded-2xl shadow-2xl p-2 backdrop-blur-2xl ring-1 ring-white/10 divide-y divide-white/5">
                  <div class="space-y-1">
                    {#each item.children || [] as child (child.href + child.titleTh)}
                      {#if child.external}
                        <a
                          href={child.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="group/item flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-brand-orange/15 rounded-xl transition-all"
                        >
                          <span>{languageState.t(child.titleTh, child.titleEn)}</span>
                          <ExternalLink class="w-3.5 h-3.5 text-slate-500 group-hover/item:text-brand-orange transition-colors" />
                        </a>
                      {:else}
                        {@const isChildActive =
                          pathname === child.href ||
                          (child.href !== "/" &&
                            pathname.startsWith(child.href.split("?")[0].split("#")[0]))}
                        <a
                          href={child.href}
                          class="group/item flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm rounded-xl transition-all {isChildActive
                            ? 'text-brand-orange bg-brand-orange/15 font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-brand-orange/15'}"
                        >
                          <span>{languageState.t(child.titleTh, child.titleEn)}</span>
                          <ChevronRight
                            class="w-3.5 h-3.5 transition-all {isChildActive
                              ? 'text-brand-orange translate-x-0.5'
                              : 'text-slate-500 group-hover/item:text-brand-orange group-hover/item:translate-x-0.5'}"
                          />
                        </a>
                      {/if}
                    {/each}
                  </div>
                </div>
              </div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- Mobile Brand / Title Indicator -->
      <div class="lg:hidden flex items-center gap-2">
        <a href="/" class="flex items-center gap-2.5 text-left active:scale-95 transition-transform">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-orange to-brand-dark-orange flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20">
            IT
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-white leading-tight">
              {languageState.t("คณะเทคโนโลยีสารสนเทศฯ", "Faculty of IT & DI")}
            </span>
            <span class="text-[10px] text-slate-400 leading-tight font-mono">
              KMUTNB
            </span>
          </div>
        </a>
      </div>

      <!-- Right Side Actions: Search Trigger & Mobile Menu Toggle -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Search Trigger Button -->
        <button
          type="button"
          onclick={() => (searchModalOpen = true)}
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs sm:text-sm transition-all border border-white/10 active:scale-95"
          title={languageState.t("ค้นหาข้อมูล (Ctrl+K)", "Search (Ctrl+K)")}
          aria-label="Search"
        >
          <Search class="w-4 h-4 text-brand-orange" />
          <span class="hidden sm:inline text-xs text-slate-400">
            {languageState.t("ค้นหา...", "Search...")}
          </span>
          <kbd class="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-black/40 border border-white/10 rounded-md text-slate-400">
            ⌘K
          </kbd>
        </button>

        <!-- Mobile Hamburger Toggle Button -->
        <button
          type="button"
          onclick={() => (mobileOpen = !mobileOpen)}
          class="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-all active:scale-90 border border-white/10"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {#if mobileOpen}
            <X class="w-5 h-5" />
          {:else}
            <Menu class="w-5 h-5" />
          {/if}
        </button>
      </div>
    </div>
  </div>
</nav>

<!-- Mobile Drawer Overlay & Slide-in Sidebar -->
<div
  class="fixed inset-0 z-50 lg:hidden transition-all duration-300 {mobileOpen
    ? 'opacity-100 visible'
    : 'opacity-0 invisible pointer-events-none'}"
>
  <!-- Backdrop -->
  <div
    role="presentation"
    class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
    onclick={() => (mobileOpen = false)}
  ></div>

  <!-- Slide-in Drawer Container -->
  <div
    class="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#141519] text-white shadow-2xl flex flex-col z-10 transform transition-transform duration-300 ease-out border-l border-white/10 {mobileOpen
      ? 'translate-x-0'
      : 'translate-x-full'}"
  >
    <!-- Drawer Header -->
    <div class="p-4 border-b border-white/10 flex items-center justify-between bg-[#1A1B20]">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-orange to-brand-dark-orange flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20">
          IT
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-bold text-white">ITD KMUTNB</span>
          <span class="text-[10px] text-slate-400">
            {languageState.t("คณะเทคโนโลยีสารสนเทศฯ", "Faculty of IT & DI")}
          </span>
        </div>
      </div>
      <button
        type="button"
        onclick={() => (mobileOpen = false)}
        class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-90"
        aria-label="Close drawer"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Quick Language Toggle in Mobile Drawer -->
    <div class="px-4 py-2.5 bg-[#0F1014] border-b border-white/10 flex items-center justify-between">
      <span class="text-xs text-slate-400 font-medium">{languageState.t("ภาษา / Language", "Language")}</span>
      <div class="flex items-center bg-black/50 p-0.5 rounded-full border border-white/10">
        <button
          type="button"
          onclick={() => languageState.setLanguage("th")}
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 {languageState.language === 'th'
            ? 'bg-brand-orange text-white shadow-xs'
            : 'text-slate-400 hover:text-slate-200'}"
        >
          <img
            src="/assets/logos/th-flag.png"
            alt="TH"
            width="12"
            height="12"
            class="w-3 h-3 rounded-full object-cover"
          />
          <span>TH</span>
        </button>
        <button
          type="button"
          onclick={() => languageState.setLanguage("en")}
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 {languageState.language === 'en'
            ? 'bg-brand-orange text-white shadow-xs'
            : 'text-slate-400 hover:text-slate-200'}"
        >
          <img
            src="/assets/logos/uk-flag.png"
            alt="EN"
            width="12"
            height="12"
            class="w-3 h-3 rounded-full object-cover"
          />
          <span>EN</span>
        </button>
      </div>
    </div>

    <!-- Mobile Accordion Nav List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-2 dark-scrollbar">
      {#each mainNav as item (item.href + item.titleTh)}
        {@const hasChildren = item.children && item.children.length > 0}
        {@const isExpanded = !!mobileExpanded[item.titleTh]}
        {@const active = isItemActive(item, pathname)}

        {#if !hasChildren}
          <a
            href={item.href}
            onclick={() => (mobileOpen = false)}
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-98 {active
              ? 'bg-brand-orange text-white font-semibold shadow-md'
              : 'text-slate-200 hover:bg-white/5 hover:text-white'}"
          >
            <span>{languageState.t(item.titleTh, item.titleEn)}</span>
            <ChevronRight class="w-4 h-4 opacity-50" />
          </a>
        {:else}
          <div class="rounded-xl overflow-hidden bg-white/5 border border-white/10">
            <button
              type="button"
              onclick={() => toggleMobileAccordion(item.titleTh)}
              class="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium transition-colors {active
                ? 'text-brand-orange font-semibold'
                : 'text-slate-200 hover:text-white'}"
            >
              <span>{languageState.t(item.titleTh, item.titleEn)}</span>
              <ChevronDown
                class="w-4 h-4 transition-transform duration-200 text-slate-400 {isExpanded
                  ? 'rotate-180 text-brand-orange'
                  : ''}"
              />
            </button>

            <!-- Accordion Submenu -->
            {#if isExpanded}
              <div class="pl-3 pr-2 pb-2 pt-1 space-y-1 border-t border-white/10 bg-black/20">
                {#each item.children || [] as child (child.href + child.titleTh)}
                  {#if child.external}
                    <a
                      href={child.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onclick={() => (mobileOpen = false)}
                      class="flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-brand-orange/20 transition-colors"
                    >
                      <span>{languageState.t(child.titleTh, child.titleEn)}</span>
                      <ExternalLink class="w-3.5 h-3.5 text-slate-500" />
                    </a>
                  {:else}
                    {@const isChildActive =
                      !child.external &&
                      (pathname === child.href ||
                        (child.href !== "/" &&
                          pathname.startsWith(child.href.split("?")[0].split("#")[0])))}
                    <a
                      href={child.href}
                      onclick={() => (mobileOpen = false)}
                      class="flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors {isChildActive
                        ? 'text-brand-orange bg-brand-orange/20 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-brand-orange/20'}"
                    >
                      <span>{languageState.t(child.titleTh, child.titleEn)}</span>
                      <ChevronRight
                        class="w-3.5 h-3.5 {isChildActive ? 'text-brand-orange' : 'text-slate-500'}"
                      />
                    </a>
                  {/if}
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      {/each}

      <!-- Quick Access Section in Mobile Drawer -->
      <div class="pt-4 mt-4 border-t border-white/10 space-y-2">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
          {languageState.t("บริการด่วน", "Quick Services")}
        </span>
        <a
          href="https://www.admission.kmutnb.ac.th"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-brand-orange/20 hover:bg-brand-orange/30 border border-brand-orange/40 text-orange-300 text-xs font-semibold transition-all active:scale-98"
        >
          <div class="flex items-center gap-2">
            <GraduationCap class="w-4 h-4 text-brand-orange" />
            <span>{languageState.t("สมัครเรียนออนไลน์ 2569", "Admissions 2026")}</span>
          </div>
          <ExternalLink class="w-3.5 h-3.5" />
        </a>

        <a
          href="/schedules"
          onclick={() => (mobileOpen = false)}
          class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors {isSchedulesActive
            ? 'bg-brand-orange text-white font-semibold shadow-md'
            : 'bg-white/5 hover:bg-white/10 text-slate-300'}"
        >
          <div class="flex items-center gap-2">
            <CalendarDays
              class="w-4 h-4 {isSchedulesActive ? 'text-white' : 'text-brand-orange'}"
            />
            <span>{languageState.t("ตารางเรียน", "Class Schedules")}</span>
          </div>
          <ChevronRight
            class="w-3.5 h-3.5 {isSchedulesActive ? 'text-white/80' : 'text-slate-500'}"
          />
        </a>

        <a
          href="/services#e-services"
          onclick={() => (mobileOpen = false)}
          class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
        >
          <span>{languageState.t("Student e-Services", "Student e-Services")}</span>
          <ChevronRight class="w-3.5 h-3.5 text-slate-500" />
        </a>

        <a
          href="/services#downloads"
          onclick={() => (mobileOpen = false)}
          class="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
        >
          <span>{languageState.t("ดาวน์โหลดแบบฟอร์ม", "Document Downloads")}</span>
          <ChevronRight class="w-3.5 h-3.5 text-slate-500" />
        </a>
      </div>
    </div>

    <!-- Mobile Drawer Footer -->
    <div class="p-4 bg-[#0F1014] border-t border-white/10 text-xs text-slate-400 space-y-2">
      <div class="flex items-center gap-2">
        <Phone class="w-3.5 h-3.5 text-brand-orange" />
        <span>02-555-2000 ต่อ 2701-2708</span>
      </div>
      <div class="flex items-center gap-2">
        <Mail class="w-3.5 h-3.5 text-brand-orange" />
        <span>itd@itd.kmutnb.ac.th</span>
      </div>
    </div>
  </div>
</div>

<!-- Interactive Search Modal / Overlay -->
{#if searchModalOpen}
  <div class="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
    <!-- Backdrop -->
    <div
      role="presentation"
      class="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
      onclick={() => (searchModalOpen = false)}
    ></div>

    <!-- Search Box Card -->
    <div class="relative w-full max-w-2xl bg-[#1A1B20] border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10 animate-scale-in">
      <!-- Input Header -->
      <form onsubmit={handleSearchSubmit} class="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3">
        <Search class="w-5 h-5 text-brand-orange shrink-0" />
        <input
          bind:this={searchInputElement}
          type="text"
          bind:value={searchQuery}
          placeholder={languageState.t(
            "ค้นหาข่าวสาร, หลักสูตร, บุคลากร, บริการ...",
            "Search news, curriculum, staff, services..."
          )}
          class="flex-1 bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
        />
        {#if searchQuery}
          <button
            type="button"
            onclick={() => (searchQuery = "")}
            class="p-1 text-slate-400 hover:text-white rounded"
          >
            <X class="w-4 h-4" />
          </button>
        {/if}
        <button
          type="submit"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-brand-dark-orange hover:opacity-90 text-white text-xs font-semibold shadow-md shadow-orange-500/25 transition-all shrink-0 active:scale-95"
        >
          {languageState.t("ค้นหา", "Search")}
        </button>
        <button
          type="button"
          onclick={() => (searchModalOpen = false)}
          class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
          aria-label="Close search"
        >
          <X class="w-5 h-5" />
        </button>
      </form>

      <!-- Quick Suggestions & Shortcuts -->
      <div class="p-4 sm:p-5 bg-[#141519] space-y-3 max-h-[60vh] overflow-y-auto dark-scrollbar">
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span class="font-semibold uppercase tracking-wider">
            {languageState.t("คำค้นหายอดนิยม / ทางลัด", "Popular Suggestions / Shortcuts")}
          </span>
          <span class="hidden sm:inline text-slate-500 font-mono text-[11px]">
            {languageState.t("กด Enter เพื่อค้นหา", "Press Enter to search")}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {#each quickSearchSuggestions as item (item.href + item.titleTh)}
            {#if item.external}
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onclick={() => (searchModalOpen = false)}
                class="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm text-slate-200 hover:text-white group transition-all active:scale-98"
              >
                <span class="truncate">{languageState.t(item.titleTh, item.titleEn)}</span>
                <ExternalLink class="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-orange shrink-0 ml-2" />
              </a>
            {:else}
              <a
                href={item.href}
                onclick={() => (searchModalOpen = false)}
                class="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm text-slate-200 hover:text-white group transition-all active:scale-98"
              >
                <span class="truncate">{languageState.t(item.titleTh, item.titleEn)}</span>
                <ArrowRight class="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-orange group-hover:translate-x-0.5 shrink-0 ml-2 transition-all" />
              </a>
            {/if}
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}
