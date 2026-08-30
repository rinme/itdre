import React, { Suspense } from "react";
import type { Metadata } from "next";
import FacilitiesExplorer from "@/components/facilities/FacilitiesExplorer";

export const metadata: Metadata = {
  title: "ห้องปฏิบัติการคอมพิวเตอร์ & ศูนย์สอบ Pearson VUE | ITD KMUTNB",
  description:
    "ห้องปฏิบัติการคอมพิวเตอร์ประสิทธิภาพสูง ศูนย์สอบมาตรฐานสากล Pearson VUE และศูนย์ควบคุมระบบเครือข่าย NOC คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
  openGraph: {
    title: "ห้องปฏิบัติการคอมพิวเตอร์ & ศูนย์สอบ Pearson VUE | ITD KMUTNB",
    description:
      "ห้องปฏิบัติการคอมพิวเตอร์ประสิทธิภาพสูงและศูนย์สอบ Pearson VUE อาคาร 79 มจพ.",
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

export default function ComputerRoomsPage() {
  return (
    <div className="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
      <Suspense fallback={<FacilitiesSkeleton />}>
        <FacilitiesExplorer
          initialCategoryFilter="computer-room"
          pageTitleTh="ห้องปฏิบัติการคอมพิวเตอร์ และศูนย์ทดสอบ Pearson VUE"
          pageTitleEn="Computer Laboratories & Pearson VUE Test Center"
          pageSubtitleTh="ห้องปฏิบัติการคอมพิวเตอร์สมรรถนะสูง ศูนย์ทดสอบใบประกาศนียบัตรวิชาชีพไอทีระดับสากล Pearson VUE (ห้อง 5A02) และศูนย์ควบคุมเครือข่าย NOC (ห้อง 5A01)"
          pageSubtitleEn="High-performance computing laboratories, official Pearson VUE international certification test center (Room 5A02), and Enterprise Network Operations Center (Room 5A01)."
        />
      </Suspense>
    </div>
  );
}
