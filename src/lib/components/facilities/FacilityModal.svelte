<script lang="ts">
  import type { FacilityItem } from "$lib/types";
  import { languageState } from "$lib/state/language.svelte";
  import { getCategoryBadge, getRoomFloor } from "$lib/utils/facility-utils";
  import {
    X,
    Users,
    Building2,
    CheckCircle2,
    ZoomIn,
    ZoomOut,
    CalendarDays,
    ShieldCheck,
    Cpu,
    Sparkles
  } from "lucide-svelte";

  interface Props {
    facility: FacilityItem | null;
    onClose: () => void;
  }

  let { facility, onClose }: Props = $props();
  let isZoomed = $state(false);

  $effect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (facility && typeof window !== "undefined") {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      }
    };
  });

  let floor = $derived(facility ? getRoomFloor(facility.titleTh) || getRoomFloor(facility.titleEn) : "");
  let badge = $derived(facility ? getCategoryBadge(facility.category, languageState.language) : { label: "", color: "" });
  let isPearsonVue = $derived(
    facility
      ? facility.id === "facility-14" ||
        facility.capacity?.includes("Pearson VUE") ||
        facility.titleTh.includes("5A02")
      : false
  );
  let isServerRoom = $derived(
    facility
      ? facility.id === "facility-13" || facility.capacity?.includes("เซิร์ฟเวอร์")
      : false
  );
</script>

{#if facility}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
    onclick={onClose}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 animate-scale-up"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Top Header Bar -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
        <div class="flex items-center gap-2.5">
          <span class="px-3 py-1 rounded-full text-xs font-semibold border {badge.color}">
            {badge.label}
          </span>
          {#if floor}
            <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
              {languageState.t(`ชั้น ${floor}`, `Floor ${floor}`)}
            </span>
          {/if}
          {#if isPearsonVue}
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              Pearson VUE
            </span>
          {/if}
        </div>
        <button
          type="button"
          onclick={onClose}
          aria-label={languageState.t("ปิดหน้าต่าง", "Close modal")}
          class="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Scrollable Content Body -->
      <div class="overflow-y-auto p-6 space-y-6">
        <!-- Main Photo with Zoom Toggle -->
        <div class="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-900 group">
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <img
            src={facility.image}
            alt={languageState.language === "en" ? facility.titleEn : facility.titleTh}
            class="w-full h-full object-cover transition-transform duration-300 {isZoomed
              ? 'scale-150 cursor-zoom-out'
              : 'scale-100 cursor-zoom-in'}"
            onclick={() => isZoomed = !isZoomed}
          />
          <!-- Zoom Button Floating -->
          <div class="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs">
            <button
              type="button"
              onclick={() => isZoomed = !isZoomed}
              class="flex items-center gap-1.5 hover:text-brand-orange transition-colors cursor-pointer"
            >
              {#if isZoomed}
                <ZoomOut class="w-4 h-4" />
                <span>{languageState.t("ย่อภาพ", "Zoom Out")}</span>
              {:else}
                <ZoomIn class="w-4 h-4" />
                <span>{languageState.t("ขยายภาพ", "Zoom In")}</span>
              {/if}
            </button>
          </div>
        </div>

        <!-- Title & Capacity Summary -->
        <div class="space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
                {languageState.language === "en" ? facility.titleEn : facility.titleTh}
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                {languageState.t(
                  "อาคารนวมินทรราชินี (อาคาร 79) คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
                  "Navamindra Rajini Building (Bldg 79), ITD KMUTNB"
                )}
              </p>
            </div>

            {#if facility.capacity}
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-50 border border-orange-200 text-brand-orange shrink-0">
                <Users class="w-5 h-5 text-brand-orange" />
                <div>
                  <div class="text-[11px] uppercase font-semibold text-gray-500">
                    {languageState.t("ความจุห้อง", "Capacity")}
                  </div>
                  <div class="text-sm font-bold text-gray-900">
                    {facility.capacity}
                  </div>
                </div>
              </div>
            {/if}
          </div>

          <p class="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
            {facility.description}
          </p>
        </div>

        <!-- Key Feature Specs Grid -->
        <div class="space-y-3">
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <Sparkles class="w-4 h-4 text-brand-orange" />
            <span>{languageState.t("สิ่งอำนวยความสะดวกและอุปกรณ์ประจำห้อง", "Room Amenities & Equipment")}</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {#if facility.features && facility.features.length > 0}
              {#each facility.features as feature, idx (idx)}
                <div class="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              {/each}
            {:else}
              <div class="col-span-2 text-xs text-gray-500 py-2">
                {languageState.t("ติดตั้งอุปกรณ์โสตทัศนูปกรณ์ครบครัน", "Fully equipped AV and air conditioning systems")}
              </div>
            {/if}
          </div>
        </div>

        <!-- Special Center Info if Pearson VUE or Server NOC -->
        {#if isPearsonVue}
          <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs sm:text-sm text-gray-800 space-y-2">
            <div class="flex items-center gap-2 font-bold text-amber-900">
              <ShieldCheck class="w-5 h-5 text-amber-600" />
              <span>{languageState.t("ศูนย์ทดสอบมาตรฐานสากล Pearson VUE Authorized Test Center", "Pearson VUE Authorized Testing Facility")}</span>
            </div>
            <p class="text-xs text-gray-700">
              {languageState.t(
                "ห้อง 5A02 ผ่านการรับรองมาตรฐานระดับโลก รองรับการจัดสอบใบประกาศนียบัตรวิชาชีพด้านไอที เช่น Cisco CCNA/CCNP, CompTIA Security+, Microsoft Certified, AWS Certified, Oracle, Linux LPI",
                "Room 5A02 is certified to deliver high-stakes IT professional certification exams with proctored surveillance and dedicated testing workstations."
              )}
            </p>
          </div>
        {/if}

        {#if isServerRoom}
          <div class="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-xs sm:text-sm text-gray-800 space-y-2">
            <div class="flex items-center gap-2 font-bold text-blue-900">
              <Cpu class="w-5 h-5 text-blue-600" />
              <span>{languageState.t("ศูนย์ควบคุมระบบเครือข่ายและแม่ข่าย (ITD NOC & Cloud Server)", "Network Operations Center & Cloud Computing")}</span>
            </div>
            <p class="text-xs text-gray-700">
              {languageState.t(
                "ห้อง 5A01 เป็นศูนย์กลางระบบเครือข่ายและเซิร์ฟเวอร์เสมือนสำหรับการเรียนการสอน การวิจัย Big Data และบริการโครงสร้างพื้นฐานดิจิทัลของคณะ",
                "Room 5A01 serves as the nerve center for virtualization, high-performance compute clusters, and faculty network infrastructure."
              )}
            </p>
          </div>
        {/if}
      </div>

      <!-- Modal Footer Controls -->
      <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-xs text-gray-500 flex items-center gap-2">
          <Building2 class="w-4 h-4 text-gray-400" />
          <span>
            {languageState.t(
              "ติดต่อขอใช้ห้อง: สำนักงานคณบดี ชั้น 4 อาคาร 79 (โทร. 02-555-2000 ต่อ 2740)",
              "For reservations: Dean Office Fl 4, Bldg 79 (Tel. 02-555-2000 ext 2740)"
            )}
          </span>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <a
            href="/contact"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <CalendarDays class="w-4 h-4" />
            <span>{languageState.t("ติดต่อสอบถาม / จองห้อง", "Inquire / Book Room")}</span>
          </a>
          <button
            type="button"
            onclick={onClose}
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            {languageState.t("ปิด", "Close")}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
