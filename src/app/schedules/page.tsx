import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Home, Calendar } from "lucide-react";
import PublicScheduleViewer from "@/components/schedules/PublicScheduleViewer";

export const metadata: Metadata = {
  title: "ตารางเรียนและตารางสอน | คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
  description:
    "ค้นหาและดูตารางเรียน ตารางสอน ตารางการใช้ห้องเรียน คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (ITD KMUTNB)",
  openGraph: {
    title: "ตารางเรียนและตารางสอน | คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
    description:
      "ระบบตรวจสอบตารางเรียน ตารางสอน และการใช้ห้องเรียน คณะ ITD มจพ. ทุกหลักสูตร",
    type: "website",
  },
};

function ScheduleViewerSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-10 w-64 bg-slate-200 rounded-xl" />
      {/* Filter bar skeleton */}
      <div className="h-44 bg-slate-200 rounded-3xl" />
      {/* Banner skeleton */}
      <div className="h-28 bg-slate-200 rounded-3xl" />
      {/* Grid skeleton */}
      <div className="h-[500px] bg-slate-200 rounded-3xl" />
    </div>
  );
}

export default function SchedulesPage() {
  return (
    <div className="w-full flex flex-col bg-[#F8F9FA] min-h-screen">
      {/* Main Content Area */}
      <main className="flex-1">
        <Suspense fallback={<ScheduleViewerSkeleton />}>
          <PublicScheduleViewer />
        </Suspense>
      </main>
    </div>
  );
}
