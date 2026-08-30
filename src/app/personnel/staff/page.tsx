import React, { Suspense } from "react";
import type { Metadata } from "next";
import StaffContent from "@/components/personnel/StaffContent";

export const metadata: Metadata = {
  title: "เจ้าหน้าที่สายสนับสนุน | คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. ITD KMUTNB",
  description:
    "ทำเนียบเจ้าหน้าที่และบุคลากรสายสนับสนุนประจำ 7 หน่วยงาน คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
  openGraph: {
    title: "เจ้าหน้าที่สายสนับสนุน | ITD KMUTNB",
    description:
      "ทำเนียบเจ้าหน้าที่และบุคลากรสายสนับสนุนประจำ 7 หน่วยงาน คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
    type: "website",
  },
};

function StaffSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="h-44 bg-gray-200 rounded-2xl" />
      <div className="h-28 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-96 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function StaffPage() {
  return (
    <div className="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
      <Suspense fallback={<StaffSkeleton />}>
        <StaffContent />
      </Suspense>
    </div>
  );
}
