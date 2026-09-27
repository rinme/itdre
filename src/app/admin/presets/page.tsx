"use client";

import React, { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import CoursePresetsTab from "@/components/admin/presets/CoursePresetsTab";
import InstructorsTab from "@/components/admin/presets/InstructorsTab";
import { BookOpen, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "courses", labelTh: "รายวิชา", labelEn: "Courses", icon: BookOpen },
  { id: "instructors", labelTh: "ผู้สอน", labelEn: "Instructors", icon: Users },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPresetsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("courses");

  return (
    <div className="min-h-screen bg-[#0E0F12]">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white font-mitr mb-1">
            จัดการ Presets
          </h1>
          <p className="text-slate-400 text-sm">
            เพิ่ม แก้ไข หรือลบ presets ที่ใช้เติมข้อมูลอัตโนมัติในตารางเรียน
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 w-fit border border-white/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-brand-orange text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.labelTh}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-[#1A1B20] border border-white/10 rounded-2xl p-6">
          {activeTab === "courses" ? <CoursePresetsTab /> : <InstructorsTab />}
        </div>
      </main>
    </div>
  );
}
