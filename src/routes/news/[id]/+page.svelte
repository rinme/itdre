<script lang="ts">
  import NewsDetailContent from "$lib/components/news/NewsDetailContent.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.article.title} | ข่าวสาร ITD KMUTNB</title>
  <meta name="description" content={data.article.summary || data.article.title} />
  <meta property="og:title" content="{data.article.title} | ITD KMUTNB" />
  <meta property="og:description" content={data.article.summary || data.article.title} />
  <meta property="og:type" content="article" />
  {#if data.article.thumbnail}
    <meta property="og:image" content={data.article.thumbnail} />
  {/if}
</svelte:head>

<NewsDetailContent article={data.article} relatedArticles={data.relatedArticles} />
