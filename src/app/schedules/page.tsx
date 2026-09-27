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
      {/* Breadcrumb Navigation (Screen Only) */}
      <div className="no-print w-full bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-500"
          >
            <Link
              href="/"
              className="hover:text-brand-orange transition-colors flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>หน้าหลัก</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href="/services"
              className="hover:text-brand-orange transition-colors"
            >
              บริการและดาวน์โหลด
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900">
              ตารางเรียนและตารางสอน
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        <Suspense fallback={<ScheduleViewerSkeleton />}>
          <PublicScheduleViewer />
        </Suspense>
      </main>
    </div>
  );
}
