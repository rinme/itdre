<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { newsItems } from "$lib/data/news";
  import type { NewsItem } from "$lib/types";
  import NewsCard from "$lib/components/news/NewsCard.svelte";
  import NewsFilter, { type NewsSortOption } from "$lib/components/news/NewsFilter.svelte";
  import { languageState } from "$lib/state/language.svelte";
  import {
    parseThaiDateToTimestamp,
    getCategoryById,
    getCategoryByName
  } from "$lib/utils/news-utils";
  import {
    Newspaper,
    Home,
    ChevronRight,
    SearchX,
    Sparkles,
    Layers,
    Clock,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight
  } from "lucide-svelte";

  const ITEMS_PER_PAGE = 12;

  let selectedCategory = $state("all");
  let searchQuery = $state("");
  let sortBy = $state<NewsSortOption>("newest");
  let currentPage = $state(1);

  let listTopRef: HTMLDivElement | null = $state(null);

  onMount(() => {
    const cat = page.url.searchParams.get("category") || "all";
    const s = page.url.searchParams.get("q") || page.url.searchParams.get("search") || "";
    const sort = (page.url.searchParams.get("sort") as NewsSortOption) || "newest";
    const p = parseInt(page.url.searchParams.get("page") || "1", 10) || 1;

    selectedCategory = cat;
    searchQuery = s;
    sortBy = sort;
    currentPage = p;
  });

  function updateUrlParams(cat: string, search: string, sort: NewsSortOption, p: number) {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (cat && cat !== "all") params.set("category", cat);
    if (search && search.trim() !== "") params.set("search", search.trim());
    if (sort && sort !== "newest") params.set("sort", sort);
    if (p && p > 1) params.set("page", p.toString());

    const queryStr = params.toString();
    const newUrl = queryStr ? `${page.url.pathname}?${queryStr}` : page.url.pathname;
    window.history.replaceState(null, "", newUrl);
  }

  function handleCategoryChange(catId: string) {
    selectedCategory = catId;
    currentPage = 1;
    updateUrlParams(catId, searchQuery, sortBy, 1);
  }

  function handleSearchChange(query: string) {
    searchQuery = query;
    currentPage = 1;
    updateUrlParams(selectedCategory, query, sortBy, 1);
  }

  function handleSortChange(sort: NewsSortOption) {
    sortBy = sort;
    currentPage = 1;
    updateUrlParams(selectedCategory, searchQuery, sort, 1);
  }

  function handlePageChange(p: number) {
    currentPage = p;
    updateUrlParams(selectedCategory, searchQuery, sortBy, p);
    if (listTopRef) {
      listTopRef.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const categoryCounts = (() => {
    const counts: Record<string, number> = { all: newsItems.length };
    newsItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  })();

  let filteredItems = $derived.by(() => {
    let result = [...newsItems];

    if (selectedCategory && selectedCategory !== "all") {
      const catObj = getCategoryById(selectedCategory) || getCategoryByName(selectedCategory);
      if (catObj) {
        result = result.filter(
          (item) => item.category === catObj.nameTh || item.category === catObj.id
        );
      } else {
        result = result.filter((item) => item.category === selectedCategory);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(q);
        const summaryMatch = item.summary ? item.summary.toLowerCase().includes(q) : false;
        const categoryMatch = item.category.toLowerCase().includes(q);
        const idMatch = item.id.includes(q);
        return titleMatch || summaryMatch || categoryMatch || idMatch;
      });
    }

    if (sortBy === "popular") {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => {
        const timeA = parseThaiDateToTimestamp(a.date);
        const timeB = parseThaiDateToTimestamp(b.date);
        if (timeA && timeB) return timeA - timeB;
        return parseInt(a.id, 10) - parseInt(b.id, 10);
      });
    } else {
      result.sort((a, b) => {
        const timeA = parseThaiDateToTimestamp(a.date);
        const timeB = parseThaiDateToTimestamp(b.date);
        if (timeA && timeB) return timeB - timeA;
        return parseInt(b.id, 10) - parseInt(a.id, 10);
      });
    }

    return result;
  });

  let totalItems = $derived(filteredItems.length);
  let totalPages = $derived(Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE)));
  let validCurrentPage = $derived(Math.min(Math.max(1, currentPage), totalPages));

  let paginatedItems = $derived.by(() => {
    const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  });

  let pageNumbers = $derived.by(() => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= validCurrentPage - delta && i <= validCurrentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (typeof i === "number") {
        if (l !== undefined) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push("...");
          }
        }
        rangeWithDots.push(i);
        l = i;
      }
    });

    return rangeWithDots;
  });

  let startItemNumber = $derived(totalItems === 0 ? 0 : (validCurrentPage - 1) * ITEMS_PER_PAGE + 1);
  let endItemNumber = $derived(Math.min(validCurrentPage * ITEMS_PER_PAGE, totalItems));
</script>

<div class="w-full flex flex-col">
  <!-- Hero Header Banner -->
  <section class="relative w-full bg-linear-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
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
          {languageState.t("ข่าวสารและกิจกรรม", "News & Announcements")}
        </span>
      </nav>

      <!-- Title and Subtitle -->
      <div class="max-w-3xl space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold tracking-wide">
          <Newspaper class="w-3.5 h-3.5" />
          <span>ITD KMUTNB ARCHIVE</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          {languageState.t("ข่าวสารและกิจกรรม", "News & Announcements")}
        </h1>
        <p class="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
          {languageState.t(
            "ศูนย์รวมข้อมูลข่าวสาร ประชาสัมพันธ์ กิจกรรมวิชาการ ทุนการศึกษา และประกาศสำคัญ คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
            "Explore the latest news updates, academic symposiums, scholarship announcements, and official directives from ITD KMUTNB."
          )}
        </p>
      </div>

      <!-- Stat Badges -->
      <div class="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Sparkles class="w-4 h-4 text-brand-orange" />
          <span>
            <strong class="text-white font-semibold">{newsItems.length}</strong>{" "}
            {languageState.t("บทความข่าวสาร", "Articles")}
          </span>
        </div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Layers class="w-4 h-4 text-sky-400" />
          <span>
            <strong class="text-white font-semibold">9</strong>{" "}
            {languageState.t("หมวดหมู่ข่าว", "Categories")}
          </span>
        </div>
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
          <Clock class="w-4 h-4 text-emerald-400" />
          <span>{languageState.t("อัปเดตล่าสุด 2569", "Updated 2026")}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Main Content Area -->
  <div bind:this={listTopRef} class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
    <!-- Filter Bar Component -->
    <NewsFilter
      {searchQuery}
      onSearchChange={handleSearchChange}
      {selectedCategory}
      onCategoryChange={handleCategoryChange}
      {sortBy}
      onSortChange={handleSortChange}
      totalResults={totalItems}
      {categoryCounts}
    />

    <!-- Results Counter & Pagination Status -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-600">
      <div>
        {#if totalItems > 0}
          <span>
            {languageState.t(
              `แสดงรายการที่ ${startItemNumber} - ${endItemNumber} จากทั้งหมด ${totalItems} รายการ`,
              `Showing ${startItemNumber} - ${endItemNumber} of ${totalItems} items`
            )}
          </span>
        {:else}
          <span>{languageState.t("ไม่พบรายการข่าว", "No items found")}</span>
        {/if}
      </div>
      {#if totalPages > 1}
        <div class="text-gray-500">
          {languageState.t(
            `หน้า ${validCurrentPage} จากทั้งหมด ${totalPages} หน้า`,
            `Page ${validCurrentPage} of ${totalPages}`
          )}
        </div>
      {/if}
    </div>

    <!-- News Grid -->
    {#if paginatedItems.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
        {#each paginatedItems as item (item.id)}
          <NewsCard {item} />
        {/each}
      </div>
    {:else}
      <!-- Empty State -->
      <div class="py-20 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-300 shadow-2xs space-y-4">
        <div class="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-brand-orange">
          <SearchX class="w-8 h-8" />
        </div>
        <div class="space-y-1.5 max-w-md mx-auto">
          <h3 class="text-lg font-bold text-gray-900">
            {languageState.t("ไม่พบข่าวสารที่ตรงกับเงื่อนไข", "No matching news articles found")}
          </h3>
          <p class="text-xs sm:text-sm text-gray-500">
            {languageState.t(
              "ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อค้นหาข่าวสารที่ต้องการ",
              "Try changing your search terms or selecting a different category to discover news."
            )}
          </p>
        </div>
        <div class="pt-2">
          <button
            type="button"
            onclick={() => {
              searchQuery = "";
              selectedCategory = "all";
              sortBy = "newest";
              currentPage = 1;
              updateUrlParams("all", "", "newest", 1);
            }}
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
          >
            <span>{languageState.t("ล้างตัวกรองและดูข่าวทั้งหมด", "Reset Filters & View All")}</span>
          </button>
        </div>
      </div>
    {/if}

    <!-- Pagination Navigation -->
    {#if totalPages > 1}
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200">
        <!-- Previous Page Button -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick={() => handlePageChange(1)}
            disabled={validCurrentPage === 1}
            aria-label={languageState.t("หน้าแรก", "First page")}
            class="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-brand-orange hover:border-brand-orange disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
          >
            <ChevronsLeft class="w-4 h-4" />
          </button>
          <button
            type="button"
            onclick={() => handlePageChange(validCurrentPage - 1)}
            disabled={validCurrentPage === 1}
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-brand-orange hover:border-brand-orange disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>{languageState.t("ก่อนหน้า", "Previous")}</span>
          </button>
        </div>

        <!-- Numeric Page Buttons -->
        <div class="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
          {#each pageNumbers as num, idx (idx)}
            {#if num === "..."}
              <span class="px-2 py-1 text-xs text-gray-400 font-bold select-none">
                …
              </span>
            {:else}
              {@const pageNum = num as number}
              {@const isActive = pageNum === validCurrentPage}
              <button
                type="button"
                onclick={() => handlePageChange(pageNum)}
                class="min-w-[36px] h-9 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 select-none cursor-pointer {isActive
                  ? 'bg-brand-orange text-white shadow-md shadow-orange-500/25 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80 shadow-2xs'}"
              >
                {pageNum}
              </button>
            {/if}
          {/each}
        </div>

        <!-- Next Page Button -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick={() => handlePageChange(validCurrentPage + 1)}
            disabled={validCurrentPage === totalPages}
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-brand-orange hover:border-brand-orange disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
          >
            <span>{languageState.t("ถัดไป", "Next")}</span>
            <ChevronRight class="w-4 h-4" />
          </button>
          <button
            type="button"
            onclick={() => handlePageChange(totalPages)}
            disabled={validCurrentPage === totalPages}
            aria-label={languageState.t("หน้าสุดท้าย", "Last page")}
            class="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-brand-orange hover:border-brand-orange disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
          >
            <ChevronsRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
