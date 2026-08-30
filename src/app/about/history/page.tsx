import React, { Suspense } from "react";
import type { Metadata } from "next";
import AboutHistoryContent from "@/components/about/AboutHistoryContent";

export const metadata: Metadata = {
  title: "ประวัติและความเป็นมา | คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. ITD KMUTNB",
  description:
    "ประวัติความเป็นมาและไทม์ไลน์พัฒนาการของคณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. ตั้งแต่ก่อตั้ง พ.ศ. 2539 จนถึงยุคปัจจุบัน",
  openGraph: {
    title: "ประวัติและความเป็นมา | ITD KMUTNB",
    description:
      "ประวัติความเป็นมาและวิวัฒนาการของคณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
    type: "website",
  },
};

function HistorySkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="h-44 bg-gray-200 rounded-2xl" />
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <div className="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
      <Suspense fallback={<HistorySkeleton />}>
        <AboutHistoryContent />
      </Suspense>
    </div>
  );
}
