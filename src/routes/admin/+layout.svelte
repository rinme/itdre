<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { page } from "$app/state";
  import AdminHeader from "$lib/components/admin/AdminHeader.svelte";
  import { adminPresetsState } from "$lib/state/admin-presets.svelte";
  import type { LayoutData } from "./$types";

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  let isLoginPage = $derived(page.url.pathname === "/admin/login");

  onMount(() => {
    if (!isLoginPage) {
      adminPresetsState.refreshPresets();
    }
  });
</script>

<div class="min-h-screen bg-[#0E0F12] text-slate-100 flex flex-col">
  {#if !isLoginPage}
    <AdminHeader adminUsername={data.admin?.username} />
  {/if}
  <div class="flex-1">
    {@render children()}
  </div>
</div>
