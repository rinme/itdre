"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { FacilityItem } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryBadge, getRoomFloor } from "@/lib/facility-utils";
import {
  Users,
  Eye,
  CheckCircle2,
  Tv,
  Wifi,
  Cpu,
  ShieldCheck,
  Building2,
  Sparkles,
} from "lucide-react";

interface FacilityCardProps {
  facility: FacilityItem;
  onSelect: (facility: FacilityItem) => void;
  priority?: boolean;
}

export default function FacilityCard({
  facility,
  onSelect,
  priority = false,
}: FacilityCardProps) {
  const { language, t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  const floor = getRoomFloor(facility.titleTh) || getRoomFloor(facility.titleEn);
  const badge = getCategoryBadge(facility.category, language);
  const isPearsonVue =
    facility.id === "facility-14" ||
    facility.capacity?.includes("Pearson VUE") ||
    facility.titleTh.includes("5A02");
  const isServerRoom =
    facility.id === "facility-13" || facility.capacity?.includes("เซิร์ฟเวอร์");

  // Fallback image path
  const imageSrc = imgError
    ? "/assets/facilities/placeholder-facility.svg"
    : facility.image;

  return (
    <div
      onClick={() => onSelect(facility)}
      className="group flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 hover:border-brand-orange/40 transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.99]"
    >
      {/* Thumbnail Image Container */}
      <div className="relative w-full aspect-16/10 bg-slate-900 overflow-hidden">
        <Image
          src={imageSrc}
          alt={language === "en" ? facility.titleEn : facility.titleTh}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-xs ${
              facility.category === "computer-room"
                ? "bg-brand-orange/90 text-white border-orange-400"
                : "bg-blue-600/90 text-white border-blue-400"
            }`}
          >
            {badge.label}
          </span>

          {floor && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-slate-900 shadow-sm backdrop-blur-md font-mono">
              {t(`ชั้น ${floor}`, `Fl ${floor}`)}
            </span>
          )}
        </div>

        {/* Bottom Floating Room Name */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-wide drop-shadow-md leading-tight">
            {language === "en" ? facility.titleEn : facility.titleTh}
          </h3>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-semibold group-hover:bg-brand-orange transition-colors shrink-0">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[11px]">{t("ดูภาพ", "View")}</span>
          </span>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Capacity and Special Tag */}
          <div className="flex flex-wrap items-center gap-2">
            {facility.capacity && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{facility.capacity}</span>
              </span>
            )}
            {isPearsonVue && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Pearson VUE</span>
              </span>
            )}
            {isServerRoom && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>NOC Server</span>
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {facility.description}
          </p>

          {/* Feature Highlights (Up to 3) */}
          {facility.features && facility.features.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              {facility.features.slice(0, 3).map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
              {facility.features.length > 3 && (
                <div className="text-[10px] text-slate-400 font-medium pl-5">
                  +{facility.features.length - 3} {t("รายการเพิ่มเติม", "more features")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-orange group-hover:text-brand-dark-orange">
          <span>{t("ดูข้อมูลห้องและอุปกรณ์", "Room specs & details")}</span>
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </div>
  );
}
