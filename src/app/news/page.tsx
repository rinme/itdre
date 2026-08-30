import React, { Suspense } from "react";
import type { Metadata } from "next";
import NewsArchiveContent from "@/components/news/NewsArchiveContent";
import { Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "ข่าวสารและกิจกรรม | คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. ITD KMUTNB",
  description: "ศูนย์รวมข่าวสาร ประชาสัมพันธ์ กิจกรรมวิชาการ ทุนการศึกษา และประกาศสำคัญ คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
  openGraph: {
    title: "ข่าวสารและกิจกรรม | ITD KMUTNB",
    description: "ติดตามข่าวสาร กิจกรรมวิชาการ และประกาศสำคัญ คณะ ITD มจพ.",
    type: "website",
  },
};

function NewsArchiveSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function NewsArchivePage() {
  return (
    <div className="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
      {/* Suspense Boundary for Client Component using useSearchParams */}
      <Suspense fallback={<NewsArchiveSkeleton />}>
        <NewsArchiveContent />
      </Suspense>
    </div>
  );
}
