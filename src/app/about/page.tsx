import React, { Suspense } from "react";
import type { Metadata } from "next";
import AboutOverviewContent from "@/components/about/AboutOverviewContent";

export const metadata: Metadata = {
  title: "แนะนำคณะ วิสัยทัศน์ และพันธกิจ | คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. ITD KMUTNB",
  description:
    "วิสัยทัศน์ พันธกิจ ค่านิยมองค์กร I-T-D สารจากคณบดี และโครงสร้างคณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
  openGraph: {
    title: "แนะนำคณะ วิสัยทัศน์ และพันธกิจ | ITD KMUTNB",
    description:
      "วิสัยทัศน์ พันธกิจ สารจากคณบดี คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
    type: "website",
  },
};

function AboutSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="h-44 bg-gray-200 rounded-2xl" />
      <div className="h-96 bg-gray-200 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 rounded-3xl" />
        <div className="h-64 bg-gray-200 rounded-3xl" />
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
      <Suspense fallback={<AboutSkeleton />}>
        <AboutOverviewContent />
      </Suspense>
    </div>
  );
}
