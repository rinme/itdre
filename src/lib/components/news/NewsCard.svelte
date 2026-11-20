<script lang="ts">
  import type { NewsItem } from "$lib/types";
  import { languageState } from "$lib/state/language.svelte";
  import { Calendar, Eye, FileText, ArrowRight } from "lucide-svelte";

  interface Props {
    item: NewsItem;
    featured?: boolean;
    className?: string;
  }

  let { item, featured = false, className = "" }: Props = $props();

  let fallbackImg = "/assets/news/placeholder-news.svg";
  let hasImgError = $state(false);
  let imgSrc = $derived(hasImgError ? fallbackImg : (item.thumbnail || fallbackImg));

  $effect(() => {
    if (item.thumbnail) {
      hasImgError = false;
    }
  });

  const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    "ข่าวทั่วไป": { bg: "bg-orange-50", text: "text-brand-orange", border: "border-orange-200" },
    "ข่าวคณะและมหาวิทยาลัย": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    "ข่าวทุน/วิจัย": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    "ข่าวกิจกรรม/ศิลปวัฒนธรรม": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    "ข่าวประกันคุณภาพการศึกษา": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
    "ข่าวการประชุมทางวิชาการ": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
    "ข่าวประกาศ/คำสั่งมหาวิทยาลัย": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
    "ข่าวรับสมัครงาน": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    "ข่าวประกาศจัดซื้อจัดจ้าง": { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" }
  };

  let badgeStyle = $derived(
    CATEGORY_COLORS[item.category] || {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200"
    }
  );
</script>

<article
  class="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-2xl hover:shadow-orange-500/10 hover:border-brand-orange/40 transition-all duration-300 flex flex-col overflow-hidden {featured
    ? 'md:flex-row md:col-span-2'
    : ''} {className}"
>
  <!-- Thumbnail Container -->
  <a
    href="/news/{item.id}"
    class="relative block overflow-hidden bg-slate-900 shrink-0 focus-visible:ring-2 focus-visible:ring-brand-orange {featured
      ? 'w-full md:w-1/2 h-56 sm:h-64 md:h-full min-h-[220px]'
      : 'w-full aspect-16/10'}"
    aria-label={item.title}
  >
    <img
      src={imgSrc}
      alt={item.title}
      loading="lazy"
      class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
      onerror={() => (hasImgError = true)}
    />

    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

    <!-- Category Pill Tag floating on top left -->
    <div class="absolute top-3 left-3 z-10">
      <span
        class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border shadow-2xs backdrop-blur-md {badgeStyle.bg} {badgeStyle.text} {badgeStyle.border}"
      >
        {item.category}
      </span>
    </div>

    <!-- PDF indicator badge if item has attachment -->
    {#if item.pdfUrl}
      <div class="absolute bottom-3 right-3 z-10">
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/90 text-white text-[10px] font-semibold shadow-md backdrop-blur-xs">
          <FileText class="w-3 h-3" />
          <span>PDF</span>
        </span>
      </div>
    {/if}
  </a>

  <!-- Content Container -->
  <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
    <div class="space-y-2.5">
      <!-- Metadata Row: Date & Views -->
      <div class="flex items-center justify-between text-xs text-slate-500 gap-2 font-mono">
        <div class="flex items-center gap-1.5">
          <Calendar class="w-3.5 h-3.5 text-brand-orange shrink-0" />
          <time datetime={item.date} class="tabular-nums font-medium text-slate-500">{item.date}</time>
        </div>

        {#if typeof item.views === "number"}
          <div class="flex items-center gap-1 text-[11px] text-slate-400 tabular-nums">
            <Eye class="w-3.5 h-3.5 text-slate-400" />
            <span>{item.views.toLocaleString()}</span>
          </div>
        {/if}
      </div>

      <!-- Title -->
      <a href="/news/{item.id}" class="block group/title focus-visible:ring-2 focus-visible:ring-brand-orange rounded-lg">
        <h3
          class="font-bold text-slate-900 group-hover/title:text-brand-orange transition-colors leading-snug line-clamp-2 {featured
            ? 'text-base sm:text-lg'
            : 'text-sm sm:text-base'}"
        >
          {item.title}
        </h3>
      </a>

      <!-- Summary -->
      {#if item.summary}
        <p class="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {item.summary}
        </p>
      {/if}
    </div>

    <!-- Read More Footer -->
    <div class="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
      <a
        href="/news/{item.id}"
        class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-brand-dark-orange transition-all group-hover:translate-x-0.5 active:scale-95"
      >
        <span>{languageState.t("อ่านรายละเอียด", "Read More")}</span>
        <ArrowRight class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </a>

      <span class="text-[10px] text-slate-400 font-mono">
        #{item.id}
      </span>
    </div>
  </div>
</article>
