<script lang="ts">
  import type { FacilityItem } from "$lib/types";
  import { languageState } from "$lib/state/language.svelte";
  import { getCategoryBadge, getRoomFloor } from "$lib/facility-utils";
  import {
    Users,
    Eye,
    CheckCircle2,
    Cpu,
    ShieldCheck
  } from "lucide-svelte";

  interface Props {
    facility: FacilityItem;
    onSelect: (facility: FacilityItem) => void;
    priority?: boolean;
  }

  let { facility, onSelect, priority = false }: Props = $props();
  let imgError = $state(false);

  let floor = $derived(getRoomFloor(facility.titleTh) || getRoomFloor(facility.titleEn));
  let badge = $derived(getCategoryBadge(facility.category, languageState.language));
  let isPearsonVue = $derived(
    facility.id === "facility-14" ||
    facility.capacity?.includes("Pearson VUE") ||
    facility.titleTh.includes("5A02")
  );
  let isServerRoom = $derived(
    facility.id === "facility-13" || facility.capacity?.includes("เซิร์ฟเวอร์")
  );
  let imageSrc = $derived(imgError ? "/assets/facilities/placeholder-facility.svg" : facility.image);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  onclick={() => onSelect(facility)}
  class="group flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-2xl hover:shadow-orange-500/10 hover:border-brand-orange/40 transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.99]"
>
  <!-- Thumbnail Image Container -->
  <div class="relative w-full aspect-16/10 bg-slate-900 overflow-hidden">
    <img
      src={imageSrc}
      alt={languageState.language === "en" ? facility.titleEn : facility.titleTh}
      loading={priority ? "eager" : "lazy"}
      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      onerror={() => (imgError = true)}
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-75 transition-opacity"></div>

    <!-- Top Badges -->
    <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
      <span
        class="px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-2xs {facility.category === 'computer-room'
          ? 'bg-brand-orange/90 text-white border-orange-400'
          : 'bg-blue-600/90 text-white border-blue-400'}"
      >
        {badge.label}
      </span>

      {#if floor}
        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-slate-900 shadow-xs backdrop-blur-md font-mono">
          {languageState.t(`ชั้น ${floor}`, `Fl ${floor}`)}
        </span>
      {/if}
    </div>

    <!-- Bottom Floating Room Name -->
    <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
      <h3 class="text-base sm:text-lg font-bold text-white tracking-wide drop-shadow-md leading-tight">
        {languageState.language === "en" ? facility.titleEn : facility.titleTh}
      </h3>

      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-semibold group-hover:bg-brand-orange transition-colors shrink-0">
        <Eye class="w-3.5 h-3.5" />
        <span class="text-[11px]">{languageState.t("ดูภาพ", "View")}</span>
      </span>
    </div>
  </div>

  <!-- Card Content Details -->
  <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
    <div class="space-y-2.5">
      <!-- Capacity and Special Tag -->
      <div class="flex flex-wrap items-center gap-2">
        {#if facility.capacity}
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
            <Users class="w-3.5 h-3.5 text-slate-400" />
            <span>{facility.capacity}</span>
          </span>
        {/if}
        {#if isPearsonVue}
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <ShieldCheck class="w-3.5 h-3.5 text-amber-600" />
            <span>Pearson VUE</span>
          </span>
        {/if}
        {#if isServerRoom}
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
            <Cpu class="w-3.5 h-3.5 text-blue-600" />
            <span>NOC Server</span>
          </span>
        {/if}
      </div>

      <!-- Description -->
      <p class="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
        {facility.description}
      </p>

      <!-- Feature Highlights (Up to 3) -->
      {#if facility.features && facility.features.length > 0}
        <div class="pt-2 border-t border-slate-100 space-y-1">
          {#each facility.features.slice(0, 3) as feat, idx (idx)}
            <div class="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span class="truncate">{feat}</span>
            </div>
          {/each}
          {#if facility.features.length > 3}
            <div class="text-[10px] text-slate-400 font-medium pl-5">
              +{facility.features.length - 3} {languageState.t("รายการเพิ่มเติม", "more features")}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Action Button -->
    <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-orange group-hover:text-brand-dark-orange">
      <span>{languageState.t("ดูข้อมูลห้องและอุปกรณ์", "Room specs & details")}</span>
      <span class="transform group-hover:translate-x-1 transition-transform">→</span>
    </div>
  </div>
</div>
