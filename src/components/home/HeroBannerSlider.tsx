"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, Keyboard } from "swiper/modules";
import { banners } from "@/data/banners";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function HeroBannerSlider() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const totalSlides = banners.length;
  const currentFormatted = String(activeIndex + 1).padStart(2, "0");
  const totalFormatted = String(totalSlides).padStart(2, "0");

  return (
    <section className="w-full bg-gradient-to-b from-slate-100/90 via-white to-slate-50/50 py-4 sm:py-6 lg:py-8 border-b border-slate-200/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner Frame */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/10 border border-slate-200/80 bg-[#121316] group">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, Keyboard]}
            loop={banners.length > 1}
            speed={750}
            autoplay={{
              delay: 5500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            keyboard={{ enabled: true }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            pagination={{
              el: ".hero-custom-pagination",
              clickable: true,
              bulletClass: "hero-bullet",
              bulletActiveClass: "hero-bullet-active",
            }}
            navigation={{
              prevEl: ".hero-custom-prev",
              nextEl: ".hero-custom-next",
            }}
            className="w-full"
          >
            {banners.map((slide, index) => {
              const isGif = slide.image.endsWith(".gif");
              const isFirst = index === 0;

              const content = (
                <div className="relative w-full h-[230px] sm:h-[360px] md:h-[450px] lg:h-[520px] xl:h-[560px] bg-[#121316] overflow-hidden select-none">
                  {/* High Quality Banner Image */}
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={isFirst}
                    unoptimized={isGif}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1280px"
                    className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.015]"
                  />

                  {/* Multi-layer Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Top Badges: Brand & Live Slide Counter */}
                  <div className="absolute top-3 sm:top-5 left-4 sm:left-6 right-4 sm:right-6 z-10 flex items-center justify-between pointer-events-none">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-semibold tracking-wide shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse shadow-[0_0_8px_#FF6B00]" />
                      <span>ITD KMUTNB</span>
                    </div>

                    {/* Numeric Slide Indicator */}
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-mono tabular-nums shadow-lg">
                      <span className="text-brand-orange font-bold">{currentFormatted}</span>
                      <span className="opacity-40">/</span>
                      <span className="opacity-70">{totalFormatted}</span>
                    </div>
                  </div>

                  {/* Bottom Title & Action Bar */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 lg:p-8 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="max-w-3xl space-y-2">
                      <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-lg line-clamp-2">
                        {slide.title}
                      </h2>
                    </div>

                    {slide.link && (
                      <div className="shrink-0 pt-1 sm:pt-0">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-orange to-brand-dark-orange hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95">
                          <span>{t("อ่านรายละเอียด", "Learn More")}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );

              return (
                <SwiperSlide key={slide.id}>
                  {slide.link ? (
                    <a
                      href={slide.link}
                      target={slide.link.startsWith("http") ? "_blank" : "_self"}
                      rel={slide.link.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="block w-full h-full cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-orange rounded-3xl"
                      title={slide.title}
                    >
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Navigation Arrows */}
          <button
            type="button"
            className="hero-custom-prev absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-xl backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-90 disabled:opacity-0"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-brand-orange" />
          </button>

          <button
            type="button"
            className="hero-custom-next absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-xl backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-90 disabled:opacity-0"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-brand-orange" />
          </button>

          {/* Custom Dynamic Pagination Bullets */}
          <div className="hero-custom-pagination absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-auto" />
        </div>
      </div>
    </section>
  );
}
