import React, { Suspense } from "react";
import type { Metadata } from "next";
import ContactContent from "@/components/contact/ContactContent";

export const metadata: Metadata = {
  title: "ติดต่อเราและแผนที่การเดินทาง | คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. ITD KMUTNB",
  description:
    "ที่ตั้งคณะอาคารนวมินทรราชินี มจพ., แผนที่ Google Map, สมุดโทรศัพท์และเบอร์ต่อภายใน, เส้นทางการเดินทาง MRT/รถเมล์, และแบบฟอร์มติดต่อสอบถาม",
  openGraph: {
    title: "ติดต่อเราและแผนที่การเดินทาง | ITD KMUTNB",
    description:
      "ที่ตั้งคณะ แผนที่ สมุดโทรศัพท์ และแบบฟอร์มติดต่อ คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
    type: "website",
  },
};

function ContactSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="h-44 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 h-96 bg-gray-200 rounded-3xl" />
        <div className="lg:col-span-7 h-96 bg-gray-200 rounded-3xl" />
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
      <Suspense fallback={<ContactSkeleton />}>
        <ContactContent />
      </Suspense>
    </div>
  );
}
