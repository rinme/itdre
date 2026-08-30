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

  return (
    <section className="w-full bg-gradient-to-b from-gray-100/80 via-white to-gray-50/50 py-4 sm:py-6 lg:py-8 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner Frame */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-black/5 border border-gray-200/80 bg-neutral-900 group">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, Keyboard]}
            loop={banners.length > 1}
            speed={700}
            autoplay={{
              delay: 5000,
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
                <div className="relative w-full h-[220px] sm:h-[340px] md:h-[440px] lg:h-[500px] xl:h-[540px] bg-neutral-900 overflow-hidden select-none">
                  {/* High Quality Banner Image */}
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={isFirst}
                    unoptimized={isGif}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1280px"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                  />

                  {/* Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Badge: KMUTNB ITD */}
                  <div className="absolute top-3 sm:top-5 left-4 sm:left-6 z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-medium tracking-wide">
                      <Sparkles className="w-3 h-3 text-brand-orange" />
                      <span>ITD KMUTNB</span>
                    </div>
                  </div>

                  {/* Bottom Title & Action Bar */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 lg:p-8 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div className="max-w-3xl space-y-1.5">
                      <h2 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight drop-shadow-md line-clamp-2">
                        {slide.title}
                      </h2>
                    </div>

                    {slide.link && (
                      <div className="shrink-0 pt-1 sm:pt-0">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-orange hover:bg-brand-darkOrange text-white text-xs font-semibold shadow-md transition-all">
                          <span>{t("อ่านรายละเอียด", "Learn More")}</span>
                          <ExternalLink className="w-3 h-3" />
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
                      className="block w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-orange"
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

          {/* Navigation Arrows (Visible on hover on desktop, always accessible) */}
          <button
            type="button"
            className="hero-custom-prev absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-brand-dark shadow-lg backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 disabled:opacity-0"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-brand-orange" />
          </button>

          <button
            type="button"
            className="hero-custom-next absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-brand-dark shadow-lg backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 disabled:opacity-0"
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
