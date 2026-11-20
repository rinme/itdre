<script lang="ts">
  import { Users, Search } from "lucide-svelte";
  import { adminPresetsState } from "$lib/state/admin-presets.svelte";

  let query = $state("");

  let filtered = $derived(
    adminPresetsState.instructors.filter(
      (i) =>
        i.nameTh.includes(query) ||
        (i.nameEn?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
        i.role.includes(query)
    )
  );
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <p class="text-slate-400 text-sm">
      {adminPresetsState.instructors.length} คน — รายชื่อดึงมาจากข้อมูลบุคลากรของคณะโดยอัตโนมัติ
    </p>
    <div class="relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        type="text"
        bind:value={query}
        placeholder="ค้นหาชื่ออาจารย์..."
        class="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange/60 w-56"
      />
    </div>
  </div>

  {#if adminPresetsState.loading}
    <div class="flex items-center justify-center h-48">
      <span class="text-slate-400 text-sm">กำลังโหลด...</span>
    </div>
  {:else if filtered.length === 0}
    <div class="flex flex-col items-center justify-center h-48 text-slate-500">
      <Users class="w-10 h-10 mb-3 opacity-40" />
      <p class="text-sm">ไม่พบผู้สอนที่ค้นหา</p>
    </div>
  {:else}
    <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {#each filtered as inst (inst.id)}
        <div
          class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
        >
          <div class="w-8 h-8 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange text-xs font-bold shrink-0">
            {inst.nameTh.charAt(0)}
          </div>
          <div class="min-w-0">
            <p class="text-white text-sm font-medium truncate font-mitr">{inst.nameTh}</p>
            {#if inst.nameEn}
              <p class="text-slate-500 text-xs truncate">{inst.nameEn}</p>
            {/if}
            <p class="text-slate-600 text-xs truncate">{inst.role}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
