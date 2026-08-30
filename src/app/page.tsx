import React from "react";
import HeroBannerSlider from "@/components/home/HeroBannerSlider";
import QuickNavGrid from "@/components/home/QuickNavGrid";
import NewsSection from "@/components/home/NewsSection";
import ProgramsOverview from "@/components/home/ProgramsOverview";
import VideoHighlight from "@/components/home/VideoHighlight";

export default function HomePage() {
  return (
    <div className="w-full flex flex-col flex-1">
      {/* Hero Banner Swiper Slider */}
      <HeroBannerSlider />

      {/* Quick Navigation Action Grid */}
      <QuickNavGrid />

      {/* Latest News & Interactive Category Filtering */}
      <NewsSection />

      {/* Degree Programs Overview (Bachelor, Master, Doctor) */}
      <ProgramsOverview />

      {/* Faculty Video Presentation & Highlights Stats */}
      <VideoHighlight />
    </div>
  );
}
