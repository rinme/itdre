<script lang="ts">
  import type { PersonnelMember } from "$lib/types";
  import { languageState } from "$lib/state/language.svelte";
  import {
    getDepartmentName,
    getRoleName,
    getPersonName,
    getPersonEnglishName,
    getCategoryBadgeStyle
  } from "$lib/utils/personnel-utils";
  import { Mail, Phone, Building2, Award } from "lucide-svelte";

  interface Props {
    person: PersonnelMember;
    featured?: boolean;
    className?: string;
    priority?: boolean;
  }

  let {
    person,
    featured = false,
    className = "",
    priority = false
  }: Props = $props();

  let fallbackImg = "/assets/faculty/placeholder-avatar.svg";
  let hasImgError = $state(false);
  let imgSrc = $derived(hasImgError ? fallbackImg : (person.image || fallbackImg));

  $effect(() => {
    // reset error flag if person image changes
    if (person.image) {
      hasImgError = false;
    }
  });

  let badge = $derived(getCategoryBadgeStyle(person.category));
  let departmentName = $derived(getDepartmentName(person.department, languageState.language));
  let roleName = $derived(getRoleName(person.role, languageState.language));
  let displayName = $derived(getPersonName(person, languageState.language));
  let englishName = $derived(getPersonEnglishName(person));
  let phoneClean = $derived(person.phone ? person.phone.replace(/[^0-9]/g, "").slice(0, 10) : "");
</script>

{#if featured}
  <div
    class="group relative bg-white rounded-3xl border-2 border-brand-orange/30 shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 hover:border-brand-orange transition-all duration-300 overflow-hidden flex flex-col md:flex-row {className}"
  >
    <!-- Executive Ribbon Tag -->
    <div class="absolute top-4 right-4 z-20 hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-brand-orange to-brand-dark-orange text-white text-xs font-bold shadow-md shadow-orange-500/25">
      <Award class="w-3.5 h-3.5" />
      <span>{languageState.t("ผู้บริหารสูงสุด", "Faculty Leadership")}</span>
    </div>

    <!-- Photo Container -->
    <div class="relative w-full md:w-5/12 lg:w-4/12 aspect-3/4 sm:aspect-4/5 md:aspect-auto md:min-h-[340px] bg-gradient-to-b from-orange-50/80 via-slate-100 to-slate-200 overflow-hidden shrink-0">
      <img
        src={imgSrc}
        alt={person.nameTh}
        loading={priority ? "eager" : "lazy"}
        class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
        onerror={() => (hasImgError = true)}
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden"></div>
      <div class="absolute bottom-3 left-3 z-10 md:hidden text-white">
        <span class="text-xs font-bold px-3 py-1 rounded-full bg-brand-orange/90 backdrop-blur-2xs shadow-md">
          {badge.labelTh}
        </span>
      </div>
    </div>

    <!-- Info Container -->
    <div class="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
      <div class="space-y-3.5">
        <!-- Category / Department Tag -->
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-2xs {badge.bg} {badge.text} {badge.border}"
          >
            {languageState.language === "en" ? badge.labelEn : badge.labelTh}
          </span>
          {#if departmentName}
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Building2 class="w-3.5 h-3.5 text-slate-400" />
              <span>{departmentName}</span>
            </span>
          {/if}
        </div>

        <!-- Names -->
        <div>
          <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-brand-orange transition-colors">
            {displayName}
          </h3>
          {#if languageState.language === "th" && englishName}
            <p class="text-sm font-semibold text-slate-500 mt-0.5">{englishName}</p>
          {/if}
        </div>

        <!-- Role -->
        <div class="p-3.5 rounded-2xl bg-brand-light-orange/80 border border-orange-200/70">
          <p class="text-sm sm:text-base font-bold text-brand-dark-orange leading-snug">
            {roleName}
          </p>
        </div>
      </div>

      <!-- Contact Details -->
      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 text-xs sm:text-sm text-slate-600">
        {#if person.email}
          <a
            href="mailto:{person.email}"
            class="inline-flex items-center gap-2 text-slate-700 hover:text-brand-orange transition-colors group/link truncate active:scale-95"
            title={person.email}
          >
            <div class="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-orange group-hover/link:bg-brand-orange group-hover/link:text-white transition-colors shrink-0">
              <Mail class="w-4 h-4" />
            </div>
            <span class="truncate font-medium">{person.email}</span>
          </a>
        {/if}

        {#if person.phone}
          <a
            href={phoneClean ? `tel:${phoneClean}` : "#"}
            class="inline-flex items-center gap-2 text-slate-700 hover:text-brand-orange transition-colors group/link shrink-0 active:scale-95"
          >
            <div class="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-orange group-hover/link:bg-brand-orange group-hover/link:text-white transition-colors shrink-0">
              <Phone class="w-4 h-4" />
            </div>
            <span class="font-medium">{person.phone}</span>
          </a>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div
    class="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-2xl hover:shadow-orange-500/10 hover:border-brand-orange/40 transition-all duration-300 flex flex-col overflow-hidden {className}"
  >
    <!-- Portrait Photo Container -->
    <div class="relative w-full aspect-4/5 bg-gradient-to-b from-slate-100 to-slate-200 overflow-hidden shrink-0">
      <img
        src={imgSrc}
        alt={person.nameTh}
        loading={priority ? "eager" : "lazy"}
        class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
        onerror={() => (hasImgError = true)}
      />

      <!-- Category Pill Tag -->
      <div class="absolute top-3 left-3 z-10">
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border shadow-2xs backdrop-blur-md {badge.bg} {badge.text} {badge.border}"
        >
          {languageState.language === "en" ? badge.labelEn : badge.labelTh}
        </span>
      </div>
    </div>

    <!-- Content Container -->
    <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
      <div class="space-y-2">
        <!-- Department badge -->
        {#if departmentName}
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 font-medium max-w-full">
            <Building2 class="w-3 h-3 text-slate-400 shrink-0" />
            <span class="truncate">{departmentName}</span>
          </div>
        {/if}

        <!-- Name -->
        <div>
          <h3 class="font-bold text-slate-900 group-hover:text-brand-orange transition-colors leading-snug text-sm sm:text-base line-clamp-2">
            {displayName}
          </h3>
          {#if languageState.language === "th" && englishName}
            <p class="text-xs text-slate-500 font-medium mt-0.5 truncate">
              {englishName}
            </p>
          {/if}
        </div>

        <!-- Role / Position -->
        <div class="pt-1">
          <p class="text-xs sm:text-sm font-semibold text-brand-dark-orange leading-tight line-clamp-2">
            {roleName}
          </p>
        </div>
      </div>

      <!-- Contact Links -->
      <div class="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-mono">
        {#if person.email}
          <a
            href="mailto:{person.email}"
            class="flex items-center gap-2 text-slate-600 hover:text-brand-orange transition-colors truncate active:scale-95 font-medium"
            title={person.email}
          >
            <Mail class="w-3.5 h-3.5 text-brand-orange shrink-0" />
            <span class="truncate">{person.email}</span>
          </a>
        {/if}

        {#if person.phone}
          <a
            href={phoneClean ? `tel:${phoneClean}` : "#"}
            class="flex items-center gap-2 text-slate-600 hover:text-brand-orange transition-colors active:scale-95 font-medium"
          >
            <Phone class="w-3.5 h-3.5 text-brand-orange shrink-0" />
            <span>{person.phone}</span>
          </a>
        {/if}
      </div>
    </div>
  </div>
{/if}
