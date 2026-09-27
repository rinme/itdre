"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { personnel } from "@/data/personnel";
import PersonnelCard from "@/components/personnel/PersonnelCard";
import { useLanguage } from "@/context/LanguageContext";
import {
  getPersonName,
  getRoleName,
  getPersonEnglishName,
} from "@/lib/personnel-utils";
import {
  Award,
  Home,
  ChevronRight,
  Search,
  X,
  ShieldCheck,
  Building2,
  GraduationCap,
  Briefcase,
  Users,
  UserX,
} from "lucide-react";

export default function AdministratorsContent() {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // All administrators (person-1 to person-8)
  const administrators = useMemo(() => {
    return personnel.filter((p) => p.category === "administrator");
  }, []);

  // Filtered administrators
  const filteredAdmins = useMemo(() => {
    if (!searchQuery.trim()) return administrators;
    const query = searchQuery.trim().toLowerCase();

    return administrators.filter((person) => {
      const nameThMatch = person.nameTh.toLowerCase().includes(query);
      const nameEnMatch = getPersonEnglishName(person)?.toLowerCase().includes(query) ?? false;
      const roleThMatch = person.role.toLowerCase().includes(query);
      const roleEnMatch = getRoleName(person.role, "en").toLowerCase().includes(query);
      const emailMatch = person.email ? person.email.toLowerCase().includes(query) : false;
      const phoneMatch = person.phone ? person.phone.includes(query) : false;

      return nameThMatch || nameEnMatch || roleThMatch || roleEnMatch || emailMatch || phoneMatch;
    });
  }, [administrators, searchQuery]);

  // Hierarchy levels
  const dean = filteredAdmins.find((p) => p.id === "person-1");
  const associateDeans = filteredAdmins.filter((p) =>
    ["person-2", "person-3", "person-4"].includes(p.id)
  );
  const departmentHeads = filteredAdmins.filter((p) =>
    ["person-5", "person-6", "person-7", "person-8"].includes(p.id)
  );

  return (
    <div className="w-full flex flex-col">
      {/* Hero Header Banner */}
      <section className="relative w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-brand-orange transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t("หน้าหลัก", "Home")}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <Link
              href="/personnel"
              className="hover:text-brand-orange transition-colors"
            >
              {t("บุคลากร", "Personnel")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-brand-orange font-medium">
              {t("คณะผู้บริหาร", "Executive Leadership")}
            </span>
          </nav>

          {/* Title and Intro */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold tracking-wide">
              <Award className="w-3.5 h-3.5" />
              <span>EXECUTIVE BOARD & LEADERSHIP</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              {t("คณะผู้บริหาร", "Executive Leadership")}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              {t(
                "โครงสร้างการบริหารระดับคณะ คณบดี รองคณบดี หัวหน้าภาควิชา และหัวหน้าสำนักงานคณบดี คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
                "The executive leadership team of the Faculty of Information Technology and Digital Innovation, driving visionary academic and technological excellence."
              )}
            </p>
          </div>

          {/* Quick Subpage Navigation Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <Link
              href="/personnel"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-gray-200 transition-all"
            >
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>{t("บุคลากรทั้งหมด", "All Personnel")} (56)</span>
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-orange text-white font-semibold shadow-md">
              <Award className="w-3.5 h-3.5" />
              <span>{t("ผู้บริหารคณะ", "Administrators")} (8)</span>
            </div>
            <Link
              href="/personnel/lecturers"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-gray-200 transition-all"
            >
              <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
              <span>{t("คณาจารย์ประจำ", "Lecturers")} (26)</span>
            </Link>
            <Link
              href="/personnel/staff"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-gray-200 transition-all"
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t("เจ้าหน้าที่สายสนับสนุน", "Support Staff")} (22)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Hierarchy Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 w-full">
        {/* Search within Administrators */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("ค้นหาผู้บริหาร, ตำแหน่ง, หรืออีเมล...", "Search administrators by name, role...")}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-orange focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={t("ล้างคำค้นหา", "Clear search")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs sm:text-sm text-gray-500 font-medium self-start sm:self-center">
            {t(`ผู้บริหาร ${filteredAdmins.length} ท่าน`, `${filteredAdmins.length} Executive Members`)}
          </div>
        </div>

        {filteredAdmins.length > 0 ? (
          <div className="space-y-14">
            {/* Level 1: Dean (คณบดี) */}
            {dean && (
              <section className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-brand-orange/30">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {t("คณบดีคณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล", "Dean of the Faculty")}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {t("ผู้บริหารสูงสุดระดับคณะ", "Executive Dean of ITD KMUTNB")}
                    </p>
                  </div>
                </div>

                <div className="max-w-4xl mx-auto">
                  <PersonnelCard person={dean} featured priority />
                </div>
              </section>
            )}

            {/* Level 2: Associate Deans (รองคณบดี) */}
            {associateDeans.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-brand-orange/20">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {t("คณะรองคณบดี", "Associate Deans")}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {t(
                        "รองคณบดีฝ่ายบริหาร วิชาการและวิจัย กิจการนักศึกษาและประกันคุณภาพ",
                        "Associate Deans for Administrative, Academic & Research, and Student Affairs"
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {associateDeans.map((person) => (
                    <PersonnelCard key={person.id} person={person} />
                  ))}
                </div>
              </section>
            )}

            {/* Level 3: Department Heads & Head of Dean's Office */}
            {departmentHeads.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-brand-orange/20">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {t("หัวหน้าภาควิชาและหัวหน้าสำนักงานคณบดี", "Department Heads & Head of Office")}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {t(
                        "หัวหน้าภาควิชา IT, ITM, DNet และหัวหน้าสำนักงานคณบดี",
                        "Department Heads of IT, ITM, DNet and Head of Dean's Office"
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {departmentHeads.map((person) => (
                    <PersonnelCard key={person.id} person={person} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300 shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-brand-orange">
              <UserX className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-gray-900">
                {t("ไม่พบข้อมูลผู้บริหารที่ค้นหา", "No administrators found")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง", "Try adjusting your search keywords")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {t("ล้างคำค้นหา", "Clear search")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
