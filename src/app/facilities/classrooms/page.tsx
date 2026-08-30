import React, { Suspense } from "react";
import type { Metadata } from "next";
import FacilitiesExplorer from "@/components/facilities/FacilitiesExplorer";

export const metadata: Metadata = {
  title: "ห้องเรียนและห้องบรรยาย Smart Classrooms | ITD KMUTNB",
  description:
    "ห้องบรรยายและห้องเรียนอัจฉริยะ Smart Classrooms ชั้น 3, 4, 5 อาคารนวมินทรราชินี คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
  openGraph: {
    title: "ห้องเรียนและห้องบรรยาย Smart Classrooms | ITD KMUTNB",
    description:
      "ห้องบรรยายและห้องเรียนอัจฉริยะ Smart Classrooms อาคารนวมินทรราชินี มจพ.",
    type: "website",
  },
};

function FacilitiesSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="h-44 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function ClassroomsPage() {
  return (
    <div className="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
      <Suspense fallback={<FacilitiesSkeleton />}>
        <FacilitiesExplorer
          initialCategoryFilter="classroom"
          pageTitleTh="ห้องเรียนและห้องบรรยาย Smart Classrooms"
          pageTitleEn="Smart Lecture Classrooms"
          pageSubtitleTh="ห้องบรรยายมาตรฐานสากล พร้อมระบบโสตทัศนูปกรณ์ 4K ระบบไมโครโฟนไร้สาย เครื่องปรับอากาศ และ Wi-Fi ครอบคลุมทุกพื้นที่ อาคารนวมินทรราชินี (ชั้น 3, 4, 5)"
          pageSubtitleEn="Modern smart lecture rooms equipped with 4K interactive displays, sound systems, high-speed Wi-Fi, and ergonomic seating on Floors 3, 4, and 5 of Navamindra Rajini Building."
        />
      </Suspense>
    </div>
  );
}
