import React, { Suspense } from "react";
import type { Metadata } from "next";
import AdministratorsContent from "@/components/personnel/AdministratorsContent";

export const metadata: Metadata = {
  title: "คณะผู้บริหาร | คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. ITD KMUTNB",
  description:
    "โครงสร้างการบริหารระดับคณะ คณบดี รองคณบดี หัวหน้าภาควิชา และหัวหน้าสำนักงานคณบดี คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
  openGraph: {
    title: "คณะผู้บริหาร | ITD KMUTNB",
    description:
      "คณะผู้บริหาร คณบดี รองคณบดี หัวหน้าภาควิชา คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
    type: "website",
  },
};

function AdministratorsSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="h-44 bg-gray-200 rounded-2xl" />
      <div className="h-72 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-96 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function AdministratorsPage() {
  return (
    <div className="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
      <Suspense fallback={<AdministratorsSkeleton />}>
        <AdministratorsContent />
      </Suspense>
    </div>
  );
}
