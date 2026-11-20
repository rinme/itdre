<script lang="ts">
  import { onMount } from "svelte";
  import type { NewsItem } from "$lib/types";
  import NewsCard from "$lib/components/news/NewsCard.svelte";
  import { languageState } from "$lib/state/language.svelte";
  import {
    formatNewsDate,
    getCategoryIdByName,
    getCategoryStyle,
    getCategoryByName
  } from "$lib/news-utils";
  import {
    Calendar,
    Eye,
    Building2,
    Share2,
    FileText,
    Download,
    ExternalLink,
    Copy,
    Check,
    Printer,
    ArrowLeft,
    ChevronRight,
    Home,
    Sparkles,
    ArrowUpRight
  } from "lucide-svelte";

  interface Props {
    article: NewsItem;
    relatedArticles: NewsItem[];
  }

  let { article, relatedArticles }: Props = $props();

  let imgSrc = $state(article.thumbnail || "/assets/news/placeholder-news.svg");
  let copied = $state(false);
  let currentUrl = $state("");

  onMount(() => {
    if (typeof window !== "undefined") {
      currentUrl = window.location.href;
    }
  });

  let categoryId = $derived(getCategoryIdByName(article.category));
  let categoryObj = $derived(getCategoryByName(article.category));
  let categoryColor = $derived(getCategoryStyle(article.category));
  let formattedDate = $derived(formatNewsDate(article.date, languageState.language));

  async function handleCopyLink() {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        copied = true;
        setTimeout(() => (copied = false), 3000);
      }
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  }

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  let shareUrls = $derived({
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(article.title)}`
  });
</script>

<div class="w-full flex flex-col min-h-screen bg-[#F8F9FA]">
  <!-- Toast Notification for Copied Link -->
  {#if copied}
    <div class="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 animate-scale-in">
      <div class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
        <Check class="w-3.5 h-3.5" />
      </div>
      <span class="text-xs sm:text-sm font-medium">
        {languageState.t("คัดลอกลิงก์บทความเรียบร้อยแล้ว!", "Link copied to clipboard!")}
      </span>
    </div>
  {/if}

  <!-- Top Breadcrumb & Navigation Bar -->
  <section class="w-full bg-white border-b border-gray-200/80 sticky top-0 sm:static z-20 backdrop-blur-md">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
      <!-- Breadcrumbs -->
      <nav aria-label="Breadcrumb" class="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto no-scrollbar">
        <a
          href="/"
          class="inline-flex items-center gap-1 hover:text-brand-orange transition-colors shrink-0"
        >
          <Home class="w-3.5 h-3.5" />
          <span>{languageState.t("หน้าหลัก", "Home")}</span>
        </a>
        <ChevronRight class="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <a
          href="/news"
          class="hover:text-brand-orange transition-colors shrink-0"
        >
          {languageState.t("ข่าวสาร", "News")}
        </a>
        <ChevronRight class="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <a
          href="/news?category={categoryId}"
          class="hover:text-brand-orange transition-colors font-medium text-gray-700 shrink-0"
        >
          {languageState.t(article.category, categoryObj?.nameEn || article.category)}
        </a>
        <ChevronRight class="w-3.5 h-3.5 text-gray-400 shrink-0 hidden sm:inline" />
        <span class="text-gray-400 truncate max-w-[200px] hidden sm:inline">
          {article.title}
        </span>
      </nav>

      <!-- Back to archive link -->
      <a
        href="/news?category={categoryId}"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:text-brand-dark-orange transition-colors shrink-0"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>{languageState.t("กลับหน้ารวมข่าว", "Back to News")}</span>
      </a>
    </div>
  </section>

  <!-- Main Article Container -->
  <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
    <article class="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden p-6 sm:p-10 lg:p-12 space-y-8">
      <!-- Article Header -->
      <header class="space-y-4 pb-6 border-b border-gray-100">
        <!-- Category & ID badge -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <a
            href="/news?category={categoryId}"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-transform hover:scale-105 {categoryColor.bg} {categoryColor.text} {categoryColor.border}"
          >
            <span class="w-2 h-2 rounded-full {categoryColor.dot}"></span>
            <span>{languageState.t(article.category, categoryObj?.nameEn || article.category)}</span>
          </a>

          <span class="text-xs font-mono text-gray-400 bg-gray-100/80 px-2.5 py-1 rounded-md">
            Ref ID: #{article.id}
          </span>
        </div>

        <!-- Main Title -->
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
          {article.title}
        </h1>

        <!-- Metadata bar -->
        <div class="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-gray-500 pt-2">
          <!-- Date -->
          <div class="flex items-center gap-1.5">
            <Calendar class="w-4 h-4 text-brand-orange shrink-0" />
            <time datetime={article.date} class="font-medium text-gray-700">
              {formattedDate}
            </time>
          </div>

          <!-- Department -->
          <div class="flex items-center gap-1.5">
            <Building2 class="w-4 h-4 text-gray-400 shrink-0" />
            <span>{languageState.t("คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.", "Faculty of IT & Digital Innovation, KMUTNB")}</span>
          </div>

          <!-- Views -->
          {#if typeof article.views === "number"}
            <div class="flex items-center gap-1.5">
              <Eye class="w-4 h-4 text-gray-400 shrink-0" />
              <span>
                {article.views.toLocaleString()} {languageState.t("ครั้ง", "views")}
              </span>
            </div>
          {/if}
        </div>
      </header>

      <!-- Social Share & Action Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200/60">
        <div class="flex items-center gap-2 text-xs font-semibold text-gray-600">
          <Share2 class="w-4 h-4 text-brand-orange" />
          <span>{languageState.t("แชร์ข่าวสารนี้:", "Share this article:")}</span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Facebook Share -->
          <a
            href={shareUrls.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
            class="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity text-xs font-bold shadow-2xs"
          >
            f
          </a>

          <!-- LINE Share -->
          <a
            href={shareUrls.line}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LINE"
            class="w-8 h-8 rounded-lg bg-[#00C300] text-white flex items-center justify-center hover:opacity-90 transition-opacity text-[11px] font-bold shadow-2xs"
          >
            LINE
          </a>

          <!-- Twitter / X Share -->
          <a
            href={shareUrls.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
            class="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center hover:opacity-90 transition-opacity text-xs font-bold shadow-2xs"
          >
            ✕
          </a>

          <!-- Copy Link -->
          <button
            type="button"
            onclick={handleCopyLink}
            aria-label="Copy link"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-2xs cursor-pointer {copied
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'}"
          >
            {#if copied}
              <Check class="w-3.5 h-3.5 text-emerald-600" />
            {:else}
              <Copy class="w-3.5 h-3.5 text-gray-500" />
            {/if}
            <span>{copied ? languageState.t("คัดลอกแล้ว", "Copied") : languageState.t("คัดลอกลิงก์", "Copy Link")}</span>
          </button>

          <!-- Print -->
          <button
            type="button"
            onclick={handlePrint}
            aria-label="Print article"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-medium transition-all shadow-2xs cursor-pointer"
          >
            <Printer class="w-3.5 h-3.5 text-gray-500" />
            <span>{languageState.t("พิมพ์", "Print")}</span>
          </button>
        </div>
      </div>

      <!-- High-Resolution Hero Image -->
      {#if article.thumbnail}
        <div class="relative w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs max-h-[520px] aspect-video flex items-center justify-center">
          <img
            src={imgSrc}
            alt={article.title}
            class="w-full h-full object-contain sm:object-cover"
            onerror={() => (imgSrc = "/assets/news/placeholder-news.svg")}
          />
        </div>
      {/if}

      <!-- Article Summary Lead Box -->
      {#if article.summary}
        <div class="p-4 sm:p-5 rounded-2xl bg-orange-50/60 border-l-4 border-brand-orange text-gray-800 text-sm sm:text-base leading-relaxed">
          <span class="font-bold text-brand-dark-orange block mb-1 text-xs uppercase tracking-wider">
            {languageState.t("สรุปเนื้อหาข่าว", "Article Summary")}
          </span>
          {article.summary}
        </div>
      {/if}

      <!-- Article Content / HTML Body -->
      <div class="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-4 pt-2">
        {#if article.content}
          <div
            class="article-content-body text-sm sm:text-base text-gray-800 leading-relaxed [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_a]:text-brand-orange [&_a]:underline hover:[&_a]:text-brand-dark-orange [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-4"
          >
            {@html article.content}
          </div>
        {:else}
          <p class="text-gray-600 italic">
            {languageState.t(
              "สามารถอ่านรายละเอียดเพิ่มเติมและประกาศฉบับเต็มได้จากเอกสารแนบด้านล่าง",
              "Please refer to the attached document below for full details and official instructions."
            )}
          </p>
        {/if}
      </div>

      <!-- PDF Attachment Download Card -->
      {#if article.pdfUrl}
        <div class="mt-8 p-5 sm:p-6 rounded-2xl bg-linear-to-r from-red-50/70 via-orange-50/50 to-white border border-red-200/80 shadow-2xs space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-start gap-3.5">
              <div class="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/20">
                <FileText class="w-6 h-6" />
              </div>
              <div class="space-y-1">
                <h3 class="text-base font-bold text-gray-900">
                  {languageState.t("เอกสารแนบประกาศฉบับเต็ม (PDF)", "Attached Official Document (PDF)")}
                </h3>
                <p class="text-xs text-gray-500">
                  {languageState.t(
                    "คลิกเพื่อดาวน์โหลดหรือเปิดดูเอกสารทางการประกอบข่าวสาร",
                    "Click to download or view the official document attachment"
                  )}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2.5 self-start sm:self-center">
              <a
                href={article.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-red-600/20 hover:shadow-lg transition-all"
              >
                <Download class="w-4 h-4" />
                <span>{languageState.t("ดาวน์โหลด PDF", "Download PDF")}</span>
              </a>
              <a
                href={article.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open PDF in new tab"
                class="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <ExternalLink class="w-4 h-4" />
              </a>
            </div>
          </div>

          <!-- PDF URL Display -->
          <div class="text-[11px] text-gray-400 font-mono truncate bg-white/70 px-3 py-1.5 rounded-lg border border-gray-200/60">
            URL: {article.pdfUrl}
          </div>
        </div>
      {/if}

      <!-- Article Footer & Tags -->
      <footer class="pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Tags -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-gray-400 font-medium">Tags:</span>
          <a
            href="/news?category={categoryId}"
            class="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
          >
            #{article.category}
          </a>
          <a
            href="/news"
            class="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
          >
            #ITD_KMUTNB
          </a>
          <a
            href="/news"
            class="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
          >
            #ข่าวประชาสัมพันธ์
          </a>
        </div>

        <!-- Bottom Back Button -->
        <a
          href="/news?category={categoryId}"
          class="inline-flex items-center gap-2 text-xs font-semibold text-brand-orange hover:text-brand-dark-orange transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>{languageState.t("กลับไปยังข่าวสารหมวดหมู่นี้", "Back to this category")}</span>
        </a>
      </footer>
    </article>

    <!-- Related News Section -->
    {#if relatedArticles.length > 0}
      <section class="space-y-6 pt-4">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange tracking-wide uppercase">
              <Sparkles class="w-3.5 h-3.5" />
              <span>{languageState.t("บทความที่เกี่ยวข้อง", "Related Updates")}</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
              {languageState.t("ข่าวสารอื่นๆ ในหมวดหมู่นี้", "More News in this Category")}
            </h2>
          </div>

          <a
            href="/news?category={categoryId}"
            class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-orange hover:text-brand-dark-orange transition-colors"
          >
            <span>{languageState.t("ดูทั้งหมดในหมวดนี้", "View all in category")}</span>
            <ArrowUpRight class="w-4 h-4" />
          </a>
        </div>

        <!-- Related News Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each relatedArticles.slice(0, 3) as item (item.id)}
            <NewsCard {item} />
          {/each}
        </div>
      </section>
    {/if}
  </main>
</div>
