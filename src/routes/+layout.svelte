<script lang="ts">
  import "../app.css";
  import type { Snippet } from "svelte";
  import TopHeader from "$lib/components/layout/TopHeader.svelte";
  import MainNavbar from "$lib/components/layout/MainNavbar.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import DemoBanner from "$lib/components/demo/DemoBanner.svelte";
  import DemoFeedbackModal from "$lib/components/demo/DemoFeedbackModal.svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900 font-sans antialiased selection:bg-brand-orange selection:text-white">
  <DemoBanner />
  <TopHeader />
  <MainNavbar />
  <main class="flex-1 flex flex-col">
    {@render children()}
  </main>
  <Footer />
  <DemoFeedbackModal />
</div>
