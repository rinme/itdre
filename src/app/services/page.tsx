import React, { Suspense } from "react";
import type { Metadata } from "next";
import ServicesContent from "@/components/services/ServicesContent";

export const metadata: Metadata = {
  title: "บริการและดาวน์โหลด | คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. ITD KMUTNB",
  description:
    "ศูนย์รวมระบบสารสนเทศ E-Services สำหรับนักศึกษาและบุคลากร ดาวน์โหลดแบบฟอร์มคำร้อง ตารางสอน-สอบ และคู่มือการศึกษา คณะ ITD มจพ.",
  openGraph: {
    title: "บริการและดาวน์โหลด | ITD KMUTNB",
    description:
      "ระบบสารสนเทศ E-Services และศูนย์ดาวน์โหลดแบบฟอร์มคำร้อง คณะ ITD มจพ.",
    type: "website",
  },
};

function ServicesSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="h-44 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
      <Suspense fallback={<ServicesSkeleton />}>
        <ServicesContent />
      </Suspense>
    </div>
  );
}
