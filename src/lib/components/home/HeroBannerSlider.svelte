<script lang="ts">
  import { onMount } from "svelte";
  import { register } from "swiper/element/bundle";
  import { banners } from "$lib/data/banners";
  import { languageState } from "$lib/state/language.svelte";
  import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-svelte";

  let activeIndex = $state(0);
  let swiperEl: any = $state(null);
  let paginationEl: HTMLElement | null = $state(null);

  const totalSlides = banners.length;
  let currentFormatted = $derived(String(activeIndex + 1).padStart(2, "0"));
  let totalFormatted = $derived(String(totalSlides).padStart(2, "0"));

  onMount(() => {
    register();
    if (swiperEl) {
      const params = {
        loop: banners.length > 1,
        speed: 750,
        autoplay: {
          delay: 5500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },
        keyboard: { enabled: true },
        pagination: {
          el: paginationEl,
          clickable: true,
          bulletClass: "hero-bullet",
          bulletActiveClass: "hero-bullet-active"
        }
      };

      Object.assign(swiperEl, params);
      swiperEl.initialize();

      const handleSlideChange = () => {
        if (swiperEl?.swiper) {
          activeIndex = swiperEl.swiper.realIndex;
        }
      };

      swiperEl.addEventListener("swiperslidechange", handleSlideChange);

      return () => {
        swiperEl?.removeEventListener("swiperslidechange", handleSlideChange);
      };
    }
  });

  function goPrev() {
    swiperEl?.swiper?.slidePrev();
  }

  function goNext() {
    swiperEl?.swiper?.slideNext();
  }
</script>

<section class="w-full bg-gradient-to-b from-slate-100/90 via-white to-slate-50/50 py-4 sm:py-6 lg:py-8 border-b border-slate-200/60 relative">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Banner Frame -->
    <div class="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/10 border border-slate-200/80 bg-[#121316] group">
      <swiper-container
        bind:this={swiperEl}
        init="false"
        class="w-full"
      >
        {#each banners as slide, index (slide.id)}
          <swiper-slide>
            {#if slide.link}
              <a
                href={slide.link}
                target={slide.link.startsWith("http") ? "_blank" : "_self"}
                rel={slide.link.startsWith("http") ? "noopener noreferrer" : undefined}
                class="block w-full h-full cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-orange rounded-3xl"
                title={slide.title}
              >
                <div class="relative w-full h-[230px] sm:h-[360px] md:h-[450px] lg:h-[520px] xl:h-[560px] bg-[#121316] overflow-hidden select-none">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    class="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.015]"
                  />
                  <!-- Multi-layer Gradient Overlay for Readability -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
                  <div class="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none"></div>

                  <!-- Top Badges: Brand & Live Slide Counter -->
                  <div class="absolute top-3 sm:top-5 left-4 sm:left-6 right-4 sm:right-6 z-10 flex items-center justify-between pointer-events-none">
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-semibold tracking-wide shadow-lg">
                      <span class="w-2 h-2 rounded-full bg-brand-orange animate-pulse shadow-[0_0_8px_#FF6B00]"></span>
                      <span>ITD KMUTNB</span>
                    </div>

                    <!-- Numeric Slide Indicator -->
                    <div class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-mono tabular-nums shadow-lg">
                      <span class="text-brand-orange font-bold">{currentFormatted}</span>
                      <span class="opacity-40">/</span>
                      <span class="opacity-70">{totalFormatted}</span>
                    </div>
                  </div>

                  <!-- Bottom Title & Action Bar -->
                  <div class="absolute bottom-0 inset-x-0 p-4 sm:p-6 lg:p-8 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div class="max-w-3xl space-y-2">
                      <h2 class="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-lg line-clamp-2">
                        {slide.title}
                      </h2>
                    </div>

                    <div class="shrink-0 pt-1 sm:pt-0">
                      <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-orange to-brand-dark-orange hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95">
                        <span>{languageState.t("อ่านรายละเอียด", "Learn More")}</span>
                        <ExternalLink class="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            {:else}
              <div class="relative w-full h-[230px] sm:h-[360px] md:h-[450px] lg:h-[520px] xl:h-[560px] bg-[#121316] overflow-hidden select-none">
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading={index === 0 ? "eager" : "lazy"}
                  class="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.015]"
                />
                <!-- Multi-layer Gradient Overlay for Readability -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
                <div class="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none"></div>

                <!-- Top Badges: Brand & Live Slide Counter -->
                <div class="absolute top-3 sm:top-5 left-4 sm:left-6 right-4 sm:right-6 z-10 flex items-center justify-between pointer-events-none">
                  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-semibold tracking-wide shadow-lg">
                    <span class="w-2 h-2 rounded-full bg-brand-orange animate-pulse shadow-[0_0_8px_#FF6B00]"></span>
                    <span>ITD KMUTNB</span>
                  </div>

                  <!-- Numeric Slide Indicator -->
                  <div class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-mono tabular-nums shadow-lg">
                    <span class="text-brand-orange font-bold">{currentFormatted}</span>
                    <span class="opacity-40">/</span>
                    <span class="opacity-70">{totalFormatted}</span>
                  </div>
                </div>

                <!-- Bottom Title & Action Bar -->
                <div class="absolute bottom-0 inset-x-0 p-4 sm:p-6 lg:p-8 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div class="max-w-3xl space-y-2">
                    <h2 class="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-lg line-clamp-2">
                      {slide.title}
                    </h2>
                  </div>
                </div>
              </div>
            {/if}
          </swiper-slide>
        {/each}
      </swiper-container>

      <!-- Navigation Arrows -->
      <button
        type="button"
        onclick={goPrev}
        class="hero-custom-prev absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-xl backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-90 disabled:opacity-0 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft class="w-6 h-6 text-brand-orange" />
      </button>

      <button
        type="button"
        onclick={goNext}
        class="hero-custom-next absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-xl backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-90 disabled:opacity-0 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight class="w-6 h-6 text-brand-orange" />
      </button>

      <!-- Custom Dynamic Pagination Bullets -->
      <div
        bind:this={paginationEl}
        class="hero-custom-pagination absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-auto"
      ></div>
    </div>
  </div>
</section>
