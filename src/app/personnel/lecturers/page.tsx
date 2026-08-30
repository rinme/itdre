import React, { Suspense } from "react";
import type { Metadata } from "next";
import LecturersContent from "@/components/personnel/LecturersContent";

export const metadata: Metadata = {
  title: "คณาจารย์ประจำคณะ | คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. ITD KMUTNB",
  description:
    "ทำเนียบคณาจารย์ประจำภาควิชาเทคโนโลยีสารสนเทศ ภาควิชาการจัดการเทคโนโลยีสารสนเทศ และภาควิชาการบริหารเครือข่ายดิจิทัลและความมั่นคงปลอดภัยสารสนเทศ คณะ ITD มจพ.",
  openGraph: {
    title: "คณาจารย์ประจำคณะ | ITD KMUTNB",
    description:
      "ทำเนียบคณาจารย์ผู้ทรงคุณวุฒิและนักวิจัยประจำ 3 ภาควิชา คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
    type: "website",
  },
};

function LecturersSkeleton() {
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

export default function LecturersPage() {
  return (
    <div className="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
      <Suspense fallback={<LecturersSkeleton />}>
        <LecturersContent />
      </Suspense>
    </div>
  );
}
