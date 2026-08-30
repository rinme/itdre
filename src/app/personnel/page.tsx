import React, { Suspense } from "react";
import type { Metadata } from "next";
import PersonnelDirectoryContent from "@/components/personnel/PersonnelDirectoryContent";

export const metadata: Metadata = {
  title: "บุคลากรและคณาจารย์ | คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. ITD KMUTNB",
  description:
    "ทำเนียบคณาจารย์ ผู้บริหาร และบุคลากรสายสนับสนุน คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
  openGraph: {
    title: "บุคลากรและคณาจารย์ | ITD KMUTNB",
    description:
      "ทำเนียบคณาจารย์ ผู้บริหาร และบุคลากรสายสนับสนุน คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
    type: "website",
  },
};

function PersonnelSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="h-44 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-96 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function PersonnelPage() {
  return (
    <div className="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
      <Suspense fallback={<PersonnelSkeleton />}>
        <PersonnelDirectoryContent />
      </Suspense>
    </div>
  );
}
