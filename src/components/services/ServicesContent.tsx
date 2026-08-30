"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  eServices,
  serviceCategories,
  downloadDocuments,
  downloadCategories,
  type EServiceItem,
  type DownloadItem,
} from "@/data/services";
import { useLanguage } from "@/context/LanguageContext";
import {
  GraduationCap,
  UserPlus,
  KeyRound,
  Layers,
  Mail,
  ShieldCheck,
  BookOpen,
  Award,
  FileText,
  CheckCircle2,
  CalendarDays,
  Headphones,
  Download,
  Search,
  ExternalLink,
  File,
  FolderDown,
  Clock,
  Sparkles,
  Home,
  ChevronRight,
  X,
  ArrowUpRight,
  Check,
  Server,
  FileCheck,
  HelpCircle,
} from "lucide-react";

// Icon mapping helper
function renderServiceIcon(iconName: string) {
  const props = { className: "w-6 h-6" };
  switch (iconName) {
    case "GraduationCap":
      return <GraduationCap {...props} />;
    case "UserPlus":
      return <UserPlus {...props} />;
    case "KeyRound":
      return <KeyRound {...props} />;
    case "Layers":
      return <Layers {...props} />;
    case "Mail":
      return <Mail {...props} />;
    case "ShieldCheck":
      return <ShieldCheck {...props} />;
    case "BookOpen":
      return <BookOpen {...props} />;
    case "Award":
      return <Award {...props} />;
    case "FileText":
      return <FileText {...props} />;
    case "CheckCircle2":
      return <CheckCircle2 {...props} />;
    case "CalendarDays":
      return <CalendarDays {...props} />;
    case "Headphones":
      return <Headphones {...props} />;
    default:
      return <Server {...props} />;
  }
}

export default function ServicesContent() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();

  // Active section tab: 'all' | 'e-services' | 'downloads' | 'timetable'
  const [activeSection, setActiveSection] = useState<"all" | "e-services" | "downloads" | "timetable">("all");
  const [selectedServiceCat, setSelectedServiceCat] = useState<string>("all");
  const [selectedDownloadCat, setSelectedDownloadCat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [downloadToast, setDownloadToast] = useState<{ show: boolean; title: string } | null>(null);

  // Sync with URL hash / params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#e-services") {
        setActiveSection("e-services");
      } else if (hash === "#downloads") {
        setActiveSection("downloads");
      } else if (hash === "#timetable") {
        setActiveSection("timetable");
        setSelectedDownloadCat("timetable");
      }
    }
  }, []);

  // Filtered E-Services
  const filteredServices = useMemo(() => {
    return eServices.filter((srv) => {
      // Category filter
      if (selectedServiceCat !== "all" && srv.category !== selectedServiceCat) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTh = srv.titleTh.toLowerCase().includes(q) || srv.descriptionTh.toLowerCase().includes(q);
        const matchEn = srv.titleEn.toLowerCase().includes(q) || srv.descriptionEn.toLowerCase().includes(q);
        return matchTh || matchEn;
      }
      return true;
    });
  }, [selectedServiceCat, searchQuery]);

  // Filtered Downloads
  const filteredDownloads = useMemo(() => {
    return downloadDocuments.filter((doc) => {
      // Category filter
      if (activeSection === "timetable") {
        if (doc.category !== "timetable") return false;
      } else if (selectedDownloadCat !== "all" && doc.category !== selectedDownloadCat) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTh =
          doc.titleTh.toLowerCase().includes(q) ||
          (doc.descriptionTh && doc.descriptionTh.toLowerCase().includes(q));
        const matchEn =
          doc.titleEn.toLowerCase().includes(q) ||
          (doc.descriptionEn && doc.descriptionEn.toLowerCase().includes(q));
        return matchTh || matchEn;
      }
      return true;
    });
  }, [selectedDownloadCat, activeSection, searchQuery]);

  // Handle mock download toast
  const handleDownloadClick = (e: React.MouseEvent, doc: DownloadItem) => {
    // Show toast
    const title = language === "en" ? doc.titleEn : doc.titleTh;
    setDownloadToast({ show: true, title });
    setTimeout(() => {
      setDownloadToast(null);
    }, 4000);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Toast Notification for Download */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-gray-700 animate-slide-up">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm">
            <div className="font-semibold text-white">
              {t("กำลังดาวน์โหลดไฟล์", "Downloading file...")}
            </div>
            <div className="text-gray-300 line-clamp-1 max-w-xs sm:max-w-md">
              {downloadToast.title}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDownloadToast(null)}
            className="p-1 rounded-lg text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header Banner */}
      <section className="relative w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
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
            <span className="text-brand-orange font-medium">
              {t("บริการและดาวน์โหลด", "Services & Downloads")}
            </span>
          </nav>

          {/* Title & Description */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold tracking-wide">
              <FolderDown className="w-3.5 h-3.5" />
              <span>DIGITAL SERVICES & DOWNLOAD CENTER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              {t("ระบบบริการดิจิทัลและศูนย์ดาวน์โหลดเอกสาร", "E-Services & Download Center")}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              {t(
                "รวมลิงก์ระบบสารสนเทศสำหรับการศึกษา การลงทะเบียน บัญชีผู้ใช้ ซอฟต์แวร์ลิขสิทธิ์ ตารางสอน-สอบ และแบบฟอร์มคำร้องสำหรับนักศึกษาและบุคลากร",
                "Access student portals, registration systems, Microsoft 365, licensed software, semester timetables, and academic petition forms in one place."
              )}
            </p>
          </div>

          {/* Section Mode Switcher */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setActiveSection("all")}
              className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSection === "all"
                  ? "bg-brand-orange text-white shadow-md shadow-orange-500/20"
                  : "bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10"
              }`}
            >
              {t("แสดงทั้งหมด", "All Services & Downloads")}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("e-services")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSection === "e-services"
                  ? "bg-brand-orange text-white shadow-md shadow-orange-500/20"
                  : "bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t("ระบบสารสนเทศ E-Services", "E-Services Portal")} ({eServices.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("downloads")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSection === "downloads"
                  ? "bg-brand-orange text-white shadow-md shadow-orange-500/20"
                  : "bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10"
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{t("ศูนย์ดาวน์โหลดแบบฟอร์ม", "Document Downloads")} ({downloadDocuments.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSection("timetable");
                setSelectedDownloadCat("timetable");
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeSection === "timetable"
                  ? "bg-brand-orange text-white shadow-md shadow-orange-500/20"
                  : "bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>{t("ตารางสอน & ตารางสอบ", "Timetables & Schedules")}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 w-full">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                "ค้นหาระบบบริการ (เช่น REG, VPN, Teams) หรือเอกสารดาวน์โหลด (เช่น เพิ่ม-ถอน, ตารางสอน, คู่มือ)...",
                "Search e-services (REG, VPN, Teams) or downloadable files (Add/Drop, Timetable, Handbook)..."
              )}
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
        </div>

        {/* Section 1: E-Services Hub */}
        {(activeSection === "all" || activeSection === "e-services") && (
          <section id="e-services" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b-2 border-brand-orange/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-brand-orange flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {t("ระบบสารสนเทศและบริการดิจิทัล", "Student & Staff E-Services")}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {t("บริการออนไลน์สำหรับนักศึกษา อาจารย์ และบุคลากร มจพ.", "Online digital portals for students, faculty, and researchers")}
                  </p>
                </div>
              </div>

              {/* Service Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {serviceCategories.map((cat) => {
                  const isActive = selectedServiceCat === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedServiceCat(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? "bg-brand-orange text-white shadow-xs"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                      }`}
                    >
                      {language === "en" ? cat.nameEn : cat.nameTh}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* E-Services Cards Grid */}
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredServices.map((srv) => {
                  const isLinkExternal = srv.isExternal;
                  const TargetComponent = isLinkExternal ? "a" : Link;
                  const targetProps = isLinkExternal
                    ? { href: srv.url, target: "_blank", rel: "noopener noreferrer" }
                    : { href: srv.url };

                  return (
                    <TargetComponent
                      key={srv.id}
                      {...targetProps}
                      className="group flex flex-col justify-between bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:shadow-xl hover:border-brand-orange/40 transition-all duration-300 relative"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 text-brand-orange flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-colors shadow-xs">
                            {renderServiceIcon(srv.iconName)}
                          </div>
                          {srv.tagTh && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                srv.badgeColor || "bg-gray-50 text-gray-600 border-gray-200"
                              }`}
                            >
                              {language === "en" ? srv.tagEn : srv.tagTh}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-brand-orange transition-colors">
                            {language === "en" ? srv.titleEn : srv.titleTh}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {language === "en" ? srv.descriptionEn : srv.descriptionTh}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-brand-orange">
                        <span>{t("เข้าสู่ระบบบริการ", "Launch Service")}</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </TargetComponent>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500 text-xs sm:text-sm">
                {t("ไม่พบบริการดิจิทัลที่ตรงกับคำค้นหา", "No e-services matching your criteria")}
              </div>
            )}
          </section>
        )}

        {/* Section 2: Download Center & Forms */}
        {(activeSection === "all" || activeSection === "downloads" || activeSection === "timetable") && (
          <section id="downloads" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b-2 border-brand-orange/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {activeSection === "timetable"
                      ? t("ตารางสอนและตารางสอบ", "Timetables & Schedules")
                      : t("ศูนย์ดาวน์โหลดเอกสารและแบบฟอร์มคำร้อง", "Download Center & Forms")}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {t(
                      "แบบฟอร์มคำร้องปริญญาตรี บัณฑิตศึกษา ตารางสอน-ตารางสอบ และคู่มือนักศึกษา",
                      "Academic petitions, graduate request forms, semester timetables, and student handbooks"
                    )}
                  </p>
                </div>
              </div>

              {/* Download Category Filter Tabs (if not locked in timetable view) */}
              {activeSection !== "timetable" && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {downloadCategories.map((cat) => {
                    const isActive = selectedDownloadCat === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedDownloadCat(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                        }`}
                      >
                        {language === "en" ? cat.nameEn : cat.nameTh}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Downloads List Table / Cards */}
            {filteredDownloads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDownloads.map((doc) => {
                  const isPdf = doc.fileType === "PDF";
                  const isDocx = doc.fileType === "DOCX";

                  return (
                    <div
                      key={doc.id}
                      className="group bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:shadow-lg hover:border-blue-400/50 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start gap-4">
                        {/* File Format Badge */}
                        <div
                          className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                            isPdf
                              ? "bg-red-50 text-red-600 border border-red-200"
                              : isDocx
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                          <span className="text-[10px] leading-tight font-bold">{doc.fileType}</span>
                        </div>

                        {/* Title & Details */}
                        <div className="space-y-1 flex-1">
                          <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {language === "en" ? doc.titleEn : doc.titleTh}
                          </h3>
                          {doc.descriptionTh && (
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {language === "en" ? doc.descriptionEn : doc.descriptionTh}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-400">
                            <span>{t("ขนาด:", "Size:")} <strong className="text-gray-600">{doc.fileSize}</strong></span>
                            <span>•</span>
                            <span>{t("อัปเดต:", "Updated:")} <strong className="text-gray-600">{doc.updatedDate}</strong></span>
                            {doc.downloadsCount && (
                              <>
                                <span>•</span>
                                <span>{doc.downloadsCount.toLocaleString()} {t("ดาวน์โหลด", "downloads")}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Download Button */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">
                          {t("พร้อมดาวน์โหลด", "Ready for download")}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleDownloadClick(e, doc)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{t("ดาวน์โหลดไฟล์", "Download File")}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500 text-xs sm:text-sm">
                {t("ไม่พบเอกสารที่ตรงกับเงื่อนไขการค้นหา", "No documents found matching criteria")}
              </div>
            )}
          </section>
        )}

        {/* Academic Calendar External Link Banner */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold">
                {t("ปฏิทินการศึกษามหาวิทยาลัย มจพ. (Academic Calendar)", "KMUTNB University Academic Calendar")}
              </h3>
              <p className="text-xs sm:text-sm text-white/80">
                {t(
                  "ตรวจสอบกำหนดการลงทะเบียน วันเปิด-ปิดภาคเรียน วันสอบกลางภาค และวันสอบปลายภาค จากสำนักส่งเสริมวิชาการและงานทะเบียน",
                  "View official semester dates, enrollment periods, and graduation schedules from the KMUTNB Registrar Office."
                )}
              </p>
            </div>
          </div>

          <a
            href="http://acdserv.kmutnb.ac.th/academic-calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs sm:text-sm shadow-md hover:bg-gray-100 transition-colors shrink-0"
          >
            <span>{t("เปิดปฏิทินการศึกษา มจพ.", "Open Academic Calendar")}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </section>

        {/* Help & Support Footer Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-brand-orange shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-gray-900">
                {t("ต้องการความช่วยเหลือหรือแบบฟอร์มเฉพาะทาง?", "Need technical assistance or custom forms?")}
              </h4>
              <p className="text-xs text-gray-500">
                {t("ติดต่อสำนักงานคณบดี ชั้น 4 อาคาร 79 หรือโทร 02-555-2000 ต่อ 2708", "Contact Dean Office Floor 4, Building 79, Tel: 02-555-2000 ext 2708")}
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 hover:bg-brand-orange text-white text-xs sm:text-sm font-semibold transition-colors shrink-0"
          >
            <span>{t("ติดต่อศูนย์ช่วยเหลือ", "Contact Helpdesk")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
