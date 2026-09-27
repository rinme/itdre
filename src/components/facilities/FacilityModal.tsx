"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { FacilityItem } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryBadge, getRoomFloor } from "@/lib/facility-utils";
import {
  X,
  Users,
  Building2,
  CheckCircle2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  CalendarDays,
  ShieldCheck,
  Cpu,
  Tv,
  Wifi,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface FacilityModalProps {
  facility: FacilityItem | null;
  onClose: () => void;
}

export default function FacilityModal({ facility, onClose }: FacilityModalProps) {
  const { language, t } = useLanguage();
  const [isZoomed, setIsZoomed] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (facility) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [facility, onClose]);

  if (!facility) return null;

  const floor = getRoomFloor(facility.titleTh) || getRoomFloor(facility.titleEn);
  const badge = getCategoryBadge(facility.category, language);
  const isPearsonVue =
    facility.id === "facility-14" ||
    facility.capacity?.includes("Pearson VUE") ||
    facility.titleTh.includes("5A02");
  const isServerRoom =
    facility.id === "facility-13" || facility.capacity?.includes("เซิร์ฟเวอร์");

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
            >
              {badge.label}
            </span>
            {floor && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                {t(`ชั้น ${floor}`, `Floor ${floor}`)}
              </span>
            )}
            {isPearsonVue && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                Pearson VUE
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("ปิดหน้าต่าง", "Close modal")}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main Photo with Zoom Toggle */}
          <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-900 group">
            <Image
              src={facility.image}
              alt={language === "en" ? facility.titleEn : facility.titleTh}
              fill
              className={`object-cover transition-transform duration-300 ${
                isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
            {/* Zoom Button Floating */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs">
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="flex items-center gap-1.5 hover:text-brand-orange transition-colors cursor-pointer"
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="w-4 h-4" />
                    <span>{t("ย่อภาพ", "Zoom Out")}</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-4 h-4" />
                    <span>{t("ขยายภาพ", "Zoom In")}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Title & Capacity Summary */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {language === "en" ? facility.titleEn : facility.titleTh}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t(
                    "อาคารนวมินทรราชินี (อาคาร 79) คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
                    "Navamindra Rajini Building (Bldg 79), ITD KMUTNB"
                  )}
                </p>
              </div>

              {facility.capacity && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-50 border border-orange-200 text-brand-orange shrink-0">
                  <Users className="w-5 h-5 text-brand-orange" />
                  <div>
                    <div className="text-[11px] uppercase font-semibold text-gray-500">
                      {t("ความจุห้อง", "Capacity")}
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {facility.capacity}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
              {facility.description}
            </p>
          </div>

          {/* Key Feature Specs Grid */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-orange" />
              <span>{t("สิ่งอำนวยความสะดวกและอุปกรณ์ประจำห้อง", "Room Amenities & Equipment")}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {facility.features && facility.features.length > 0 ? (
                facility.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-gray-200 text-xs sm:text-sm text-gray-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-xs text-gray-500 py-2">
                  {t("ติดตั้งอุปกรณ์โสตทัศนูปกรณ์ครบครัน", "Fully equipped AV and air conditioning systems")}
                </div>
              )}
            </div>
          </div>

          {/* Special Center Info if Pearson VUE or Server NOC */}
          {isPearsonVue && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs sm:text-sm text-gray-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>{t("ศูนย์ทดสอบมาตรฐานสากล Pearson VUE Authorized Test Center", "Pearson VUE Authorized Testing Facility")}</span>
              </div>
              <p className="text-xs text-gray-700">
                {t(
                  "ห้อง 5A02 ผ่านการรับรองมาตรฐานระดับโลก รองรับการจัดสอบใบประกาศนียบัตรวิชาชีพด้านไอที เช่น Cisco CCNA/CCNP, CompTIA Security+, Microsoft Certified, AWS Certified, Oracle, Linux LPI",
                  "Room 5A02 is certified to deliver high-stakes IT professional certification exams with proctored surveillance and dedicated testing workstations."
                )}
              </p>
            </div>
          )}

          {isServerRoom && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-xs sm:text-sm text-gray-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <Cpu className="w-5 h-5 text-blue-600" />
                <span>{t("ศูนย์ควบคุมระบบเครือข่ายและแม่ข่าย (ITD NOC & Cloud Server)", "Network Operations Center & Cloud Computing")}</span>
              </div>
              <p className="text-xs text-gray-700">
                {t(
                  "ห้อง 5A01 เป็นศูนย์กลางระบบเครือข่ายและเซิร์ฟเวอร์เสมือนสำหรับการเรียนการสอน การวิจัย Big Data และบริการโครงสร้างพื้นฐานดิจิทัลของคณะ",
                  "Room 5A01 serves as the nerve center for virtualization, high-performance compute clusters, and faculty network infrastructure."
                )}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span>
              {t(
                "ติดต่อขอใช้ห้อง: สำนักงานคณบดี ชั้น 4 อาคาร 79 (โทร. 02-555-2000 ต่อ 2740)",
                "For reservations: Dean Office Fl 4, Bldg 79 (Tel. 02-555-2000 ext 2740)"
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <CalendarDays className="w-4 h-4" />
              <span>{t("ติดต่อสอบถาม / จองห้อง", "Inquire / Book Room")}</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              {t("ปิด", "Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
