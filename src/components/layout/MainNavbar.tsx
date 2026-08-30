"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { mainNav, quickLinks } from "@/data/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { NavItem } from "@/types";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  ExternalLink,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  Info,
  Layers,
  FileText
} from "lucide-react";

export default function MainNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  // State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<{ [key: string]: boolean }>({});
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Lock body scroll when mobile drawer or search modal is open
  useEffect(() => {
    if (mobileOpen || searchModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen, searchModalOpen]);

  // Focus input when search modal opens
  useEffect(() => {
    if (searchModalOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchModalOpen]);

  // Keyboard shortcut: Escape to close modal/drawer, / or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchModalOpen(false);
        setMobileOpen(false);
        setOpenDropdown(null);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleMobileAccordion = (title: string) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = encodeURIComponent(searchQuery.trim());
    setSearchModalOpen(false);
    setSearchQuery("");
    router.push(`/news?q=${query}`);
  };

  // Helper to determine if a nav item is active
  const isItemActive = (item: NavItem) => {
    if (item.href === "/" && pathname === "/") return true;
    if (item.href !== "/" && pathname.startsWith(item.href.split("?")[0].split("#")[0])) {
      return true;
    }
    if (item.children) {
      return item.children.some((child) =>
        child.href.startsWith("/") && pathname.startsWith(child.href.split("?")[0].split("#")[0])
      );
    }
    return false;
  };

  const quickSearchSuggestions = [
    { titleTh: "รับสมัครนักศึกษาใหม่", titleEn: "New Admissions", href: "https://www.admission.kmutnb.ac.th", external: true },
    { titleTh: "ปฏิทินการศึกษา", titleEn: "Academic Calendar", href: "http://acdserv.kmutnb.ac.th/academic-calendar", external: true },
    { titleTh: "คณาจารย์และบุคลากร", titleEn: "Faculty & Staff", href: "/personnel" },
    { titleTh: "ห้องเรียนและห้องปฏิบัติการ", titleEn: "Labs & Facilities", href: "/facilities" },
    { titleTh: "แบบฟอร์มและดาวน์โหลด", titleEn: "Forms & Downloads", href: "/services#downloads" },
    { titleTh: "ข่าวกิจกรรมและผลงาน", titleEn: "Events & News", href: "/news" },
  ];

  return (
    <>
      {/* Sticky Main Navigation Bar */}
      <nav
        className="sticky top-0 z-40 w-full bg-[#121316]/95 backdrop-blur-xl text-white shadow-xl border-b border-white/10 transition-all"
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {mainNav.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const active = isItemActive(item);
                const isDropdownOpen = openDropdown === item.titleTh;

                if (!hasChildren) {
                  return (
                    <Link
                      key={item.href + item.titleTh}
                      href={item.href}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all relative active:scale-95 ${
                        active
                          ? "text-brand-orange bg-white/10 font-semibold shadow-inner"
                          : "text-slate-200 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span>{t(item.titleTh, item.titleEn)}</span>
                      {active && (
                        <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-brand-orange rounded-full shadow-[0_0_8px_#FF6B00]" />
                      )}
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.titleTh}
                    className="relative group"
                    onMouseEnter={() => setOpenDropdown(item.titleTh)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(isDropdownOpen ? null : item.titleTh)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                        active || isDropdownOpen
                          ? "text-brand-orange bg-white/10 font-semibold"
                          : "text-slate-200 hover:text-white hover:bg-white/5"
                      }`}
                      aria-expanded={isDropdownOpen}
                    >
                      <span>{t(item.titleTh, item.titleEn)}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 opacity-70 group-hover:opacity-100 ${
                          isDropdownOpen ? "rotate-180 text-brand-orange" : ""
                        }`}
                      />
                    </button>

                    {/* Desktop Dropdown Menu */}
                    <div
                      className={`absolute left-0 top-full pt-2 w-72 transition-all duration-200 ${
                        isDropdownOpen
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2 pointer-events-none"
                      }`}
                    >
                      <div className="bg-[#1A1B20]/95 border border-white/10 rounded-2xl shadow-2xl p-2 backdrop-blur-2xl ring-1 ring-white/10 divide-y divide-white/5">
                        <div className="space-y-1">
                          {item.children?.map((child) => {
                            if (child.external) {
                              return (
                                <a
                                  key={child.href + child.titleTh}
                                  href={child.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group/item flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-brand-orange/15 rounded-xl transition-all"
                                >
                                  <span>{t(child.titleTh, child.titleEn)}</span>
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover/item:text-brand-orange transition-colors" />
                                </a>
                              );
                            }

                            return (
                              <Link
                                key={child.href + child.titleTh}
                                href={child.href}
                                className="group/item flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-brand-orange/15 rounded-xl transition-all"
                              >
                                <span>{t(child.titleTh, child.titleEn)}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover/item:text-brand-orange group-hover/item:translate-x-0.5 transition-all" />
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Brand / Title Indicator */}
            <div className="lg:hidden flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2.5 text-left active:scale-95 transition-transform">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-orange to-brand-darkOrange flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20">
                  IT
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-tight">
                    {t("คณะเทคโนโลยีสารสนเทศฯ", "Faculty of IT & DI")}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight font-mono">
                    KMUTNB
                  </span>
                </div>
              </Link>
            </div>

            {/* Right Side Actions: Search Trigger & Mobile Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Trigger Button */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs sm:text-sm transition-all border border-white/10 active:scale-95"
                title={t("ค้นหาข้อมูล (Ctrl+K)", "Search (Ctrl+K)")}
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-brand-orange" />
                <span className="hidden sm:inline text-xs text-slate-400">
                  {t("ค้นหา...", "Search...")}
                </span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-black/40 border border-white/10 rounded-md text-slate-400">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-all active:scale-90 border border-white/10"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay & Slide-in Sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />

        {/* Slide-in Drawer Container */}
        <div
          className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#141519] text-white shadow-2xl flex flex-col z-10 transform transition-transform duration-300 ease-out border-l border-white/10 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1A1B20]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-orange to-brand-darkOrange flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20">
                IT
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">ITD KMUTNB</span>
                <span className="text-[10px] text-slate-400">
                  {t("คณะเทคโนโลยีสารสนเทศฯ", "Faculty of IT & DI")}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-90"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Language Toggle in Mobile Drawer */}
          <div className="px-4 py-2.5 bg-[#0F1014] border-b border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{t("ภาษา / Language", "Language")}</span>
            <div className="flex items-center bg-black/50 p-0.5 rounded-full border border-white/10">
              <button
                type="button"
                onClick={() => setLanguage("th")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  language === "th"
                    ? "bg-brand-orange text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Image
                  src="/assets/logos/th-flag.png"
                  alt="TH"
                  width={12}
                  height={12}
                  className="w-3 h-3 rounded-full object-cover"
                />
                <span>TH</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  language === "en"
                    ? "bg-brand-orange text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Image
                  src="/assets/logos/uk-flag.png"
                  alt="EN"
                  width={12}
                  height={12}
                  className="w-3 h-3 rounded-full object-cover"
                />
                <span>EN</span>
              </button>
            </div>
          </div>

          {/* Mobile Accordion Nav List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 dark-scrollbar">
            {mainNav.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = !!mobileExpanded[item.titleTh];
              const active = isItemActive(item);

              if (!hasChildren) {
                return (
                  <Link
                    key={item.href + item.titleTh}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-98 ${
                      active
                        ? "bg-brand-orange text-white font-semibold shadow-md"
                        : "text-slate-200 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{t(item.titleTh, item.titleEn)}</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </Link>
                );
              }

              return (
                <div key={item.titleTh} className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => toggleMobileAccordion(item.titleTh)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      active ? "text-brand-orange font-semibold" : "text-slate-200 hover:text-white"
                    }`}
                  >
                    <span>{t(item.titleTh, item.titleEn)}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${
                        isExpanded ? "rotate-180 text-brand-orange" : ""
                      }`}
                    />
                  </button>

                  {/* Accordion Submenu */}
                  {isExpanded && (
                    <div className="pl-3 pr-2 pb-2 pt-1 space-y-1 border-t border-white/10 bg-black/20">
                      {item.children?.map((child) => {
                        if (child.external) {
                          return (
                            <a
                              key={child.href + child.titleTh}
                              href={child.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-brand-orange/20 transition-colors"
                            >
                              <span>{t(child.titleTh, child.titleEn)}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={child.href + child.titleTh}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-brand-orange/20 transition-colors"
                          >
                            <span>{t(child.titleTh, child.titleEn)}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick Access Section in Mobile Drawer */}
            <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                {t("บริการด่วน", "Quick Services")}
              </span>
              <a
                href="https://www.admission.kmutnb.ac.th"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-brand-orange/20 hover:bg-brand-orange/30 border border-brand-orange/40 text-orange-300 text-xs font-semibold transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-brand-orange" />
                  <span>{t("สมัครเรียนออนไลน์ 2569", "Admissions 2026")}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/services#e-services"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
              >
                <span>{t("Student e-Services", "Student e-Services")}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>

              <Link
                href="/services#downloads"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
              >
                <span>{t("ดาวน์โหลดแบบฟอร์ม", "Document Downloads")}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>
          </div>

          {/* Mobile Drawer Footer */}
          <div className="p-4 bg-[#0F1014] border-t border-white/10 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-brand-orange" />
              <span>02-555-2000 ต่อ 2701-2708</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-brand-orange" />
              <span>itd@itd.kmutnb.ac.th</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Search Modal / Overlay */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setSearchModalOpen(false)}
          />

          {/* Search Box Card */}
          <div className="relative w-full max-w-2xl bg-[#1A1B20] border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10 animate-scale-in">
            {/* Input Header */}
            <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3">
              <Search className="w-5 h-5 text-brand-orange shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  "ค้นหาข่าวสาร, หลักสูตร, บุคลากร, บริการ...",
                  "Search news, curriculum, staff, services..."
                )}
                className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-brand-darkOrange hover:opacity-90 text-white text-xs font-semibold shadow-md shadow-orange-500/25 transition-all shrink-0 active:scale-95"
              >
                {t("ค้นหา", "Search")}
              </button>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Quick Suggestions & Shortcuts */}
            <div className="p-4 sm:p-5 bg-[#141519] space-y-3 max-h-[60vh] overflow-y-auto dark-scrollbar">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">
                  {t("คำค้นหายอดนิยม / ทางลัด", "Popular Suggestions / Shortcuts")}
                </span>
                <span className="hidden sm:inline text-slate-500 font-mono text-[11px]">
                  {t("กด Enter เพื่อค้นหา", "Press Enter to search")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickSearchSuggestions.map((item) => {
                  if (item.external) {
                    return (
                      <a
                        key={item.href + item.titleTh}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setSearchModalOpen(false)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm text-slate-200 hover:text-white group transition-all active:scale-98"
                      >
                        <span className="truncate">{t(item.titleTh, item.titleEn)}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-orange shrink-0 ml-2" />
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={item.href + item.titleTh}
                      href={item.href}
                      onClick={() => setSearchModalOpen(false)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm text-slate-200 hover:text-white group transition-all active:scale-98"
                    >
                      <span className="truncate">{t(item.titleTh, item.titleEn)}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-orange group-hover:translate-x-0.5 shrink-0 ml-2 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
