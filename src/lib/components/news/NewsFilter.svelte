<script lang="ts">
  import { languageState } from "$lib/state/language.svelte";
  import { CATEGORY_LIST } from "$lib/news-utils";
  import {
    Search,
    X,
    ArrowDownWideNarrow,
    ChevronLeft,
    ChevronRight,
    RotateCcw
  } from "lucide-svelte";

  export type NewsSortOption = "newest" | "popular" | "oldest";

  interface Props {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (categoryId: string) => void;
    sortBy: NewsSortOption;
    onSortChange: (sort: NewsSortOption) => void;
    totalResults: number;
    categoryCounts: Record<string, number>;
  }

  let {
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    sortBy,
    onSortChange,
    totalResults,
    categoryCounts
  }: Props = $props();

  let scrollContainer: HTMLDivElement | null = $state(null);

  function scrollPills(direction: "left" | "right") {
    if (scrollContainer) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }

  let isFiltered = $derived(
    searchQuery.trim().length > 0 || (selectedCategory !== "all" && selectedCategory !== "")
  );

  function handleResetFilters() {
    onSearchChange("");
    onCategoryChange("all");
    onSortChange("newest");
  }
</script>

<div class="w-full bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-4 sm:p-6 space-y-5">
  <!-- Top Row: Search Input & Sort Dropdown -->
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
    <!-- Search Bar -->
    <div class="relative flex-1">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
        <Search class="w-4 h-4" />
      </div>
      <input
        type="text"
        value={searchQuery}
        oninput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
        placeholder={languageState.t(
          "ค้นหาหัวข้อข่าวสาร, ประกาศ, หรือคำสำคัญ...",
          "Search news titles, announcements, or keywords..."
        )}
        class="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-brand-orange rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 transition-all duration-200"
      />
      {#if searchQuery}
        <button
          type="button"
          onclick={() => onSearchChange("")}
          aria-label={languageState.t("ล้างคำค้นหา", "Clear search")}
          class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      {/if}
    </div>

    <!-- Sort Select -->
    <div class="flex items-center gap-2 shrink-0">
      <div class="relative w-full sm:w-auto">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
          <ArrowDownWideNarrow class="w-4 h-4 text-brand-orange" />
        </div>
        <select
          value={sortBy}
          onchange={(e) => onSortChange((e.target as HTMLSelectElement).value as NewsSortOption)}
          aria-label={languageState.t("เรียงลำดับข่าว", "Sort news by")}
          class="w-full sm:w-48 pl-9 pr-8 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-brand-orange rounded-xl text-sm font-medium text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 transition-all duration-200 cursor-pointer appearance-none"
        >
          <option value="newest">{languageState.t("ล่าสุด (Newest First)", "Newest First")}</option>
          <option value="popular">{languageState.t("ยอดนิยม (Most Popular)", "Most Popular")}</option>
          <option value="oldest">{languageState.t("เก่าที่สุด (Oldest First)", "Oldest First")}</option>
        </select>
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Category Pills Bar -->
  <div class="relative">
    <!-- Left Scroll Arrow for Desktop -->
    <button
      type="button"
      onclick={() => scrollPills("left")}
      aria-label="Scroll left"
      class="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-600 hover:text-brand-orange hover:border-brand-orange transition-all cursor-pointer"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>

    <!-- Scrollable Container -->
    <div
      bind:this={scrollContainer}
      class="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar scroll-smooth no-scrollbar"
    >
      {#each CATEGORY_LIST as cat (cat.id)}
        {@const isSelected = selectedCategory === cat.id || (cat.id !== "all" && selectedCategory === cat.nameTh)}
        {@const count = cat.id === "all" ? categoryCounts["all"] || 0 : categoryCounts[cat.nameTh] || 0}
        <button
          type="button"
          onclick={() => onCategoryChange(cat.id)}
          class="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 select-none cursor-pointer {isSelected
            ? 'bg-brand-orange text-white shadow-md shadow-orange-500/20 scale-[1.02] border border-transparent font-semibold'
            : 'bg-gray-100/90 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200/70'}"
        >
          <span>{languageState.t(cat.nameTh, cat.nameEn)}</span>
          <span
            class="text-[11px] px-1.5 py-0.5 rounded-md font-mono {isSelected
              ? 'bg-white/20 text-white'
              : 'bg-gray-200 text-gray-600'}"
          >
            {count}
          </span>
        </button>
      {/each}
    </div>

    <!-- Right Scroll Arrow for Desktop -->
    <button
      type="button"
      onclick={() => scrollPills("right")}
      aria-label="Scroll right"
      class="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-600 hover:text-brand-orange hover:border-brand-orange transition-all cursor-pointer"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
  </div>

  <!-- Results Bar / Active Filters Info -->
  <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
    <div class="flex items-center gap-2">
      <span>
        {languageState.t("พบข่าวสารทั้งหมด:", "Total news found:")}{" "}
        <strong class="text-gray-900 font-semibold">{totalResults}</strong>{" "}
        {languageState.t("รายการ", "items")}
      </span>
      {#if searchQuery}
        <span class="hidden sm:inline text-gray-400">
          | {languageState.t("คำค้น:", "Query:")} &ldquo;<span class="text-brand-orange font-medium">{searchQuery}</span>&rdquo;
        </span>
      {/if}
    </div>

    {#if isFiltered}
      <button
        type="button"
        onclick={handleResetFilters}
        class="inline-flex items-center gap-1 text-xs text-brand-orange hover:text-brand-dark-orange font-medium hover:underline cursor-pointer"
      >
        <RotateCcw class="w-3 h-3" />
        <span>{languageState.t("ล้างตัวกรองทั้งหมด", "Reset all filters")}</span>
      </button>
    {/if}
  </div>
</div>
