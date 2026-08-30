import React, { Suspense } from "react";
import type { Metadata } from "next";
import FacilitiesExplorer from "@/components/facilities/FacilitiesExplorer";

export const metadata: Metadata = {
  title: "ห้องเรียนและห้องปฏิบัติการ | คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. ITD KMUTNB",
  description:
    "สำรวจห้องเรียน Smart Classrooms ห้องปฏิบัติการคอมพิวเตอร์ ศูนย์ควบคุมระบบเครือข่าย NOC และศูนย์ทดสอบมาตรฐานสากล Pearson VUE อาคารนวมินทรราชินี คณะ ITD มจพ.",
  openGraph: {
    title: "ห้องเรียนและห้องปฏิบัติการ | ITD KMUTNB",
    description:
      "ห้องเรียน Smart Classrooms และห้องปฏิบัติการคอมพิวเตอร์ อาคารนวมินทรราชินี มจพ.",
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

export default function FacilitiesPage() {
  return (
    <div className="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
      <Suspense fallback={<FacilitiesSkeleton />}>
        <FacilitiesExplorer initialCategoryFilter="all" />
      </Suspense>
    </div>
  );
}
