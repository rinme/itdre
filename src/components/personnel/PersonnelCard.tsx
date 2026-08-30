"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { PersonnelMember } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { 
  getDepartmentName, 
  getRoleName, 
  getPersonName, 
  getPersonEnglishName,
  getCategoryBadgeStyle 
} from "@/lib/personnel-utils";
import { Mail, Phone, Building2, Award } from "lucide-react";

interface PersonnelCardProps {
  person: PersonnelMember;
  featured?: boolean;
  className?: string;
  priority?: boolean;
}

export default function PersonnelCard({
  person,
  featured = false,
  className = "",
  priority = false,
}: PersonnelCardProps) {
  const { language, t } = useLanguage();
  const [imgSrc, setImgSrc] = useState<string>(person.image || "/assets/faculty/placeholder-avatar.svg");

  const badge = getCategoryBadgeStyle(person.category);
  const departmentName = getDepartmentName(person.department, language);
  const roleName = getRoleName(person.role, language);
  const displayName = getPersonName(person, language);
  const englishName = getPersonEnglishName(person);

  // Clean phone number for tel: link (taking main digits)
  const phoneClean = person.phone ? person.phone.replace(/[^0-9]/g, "").slice(0, 10) : "";

  if (featured) {
    return (
      <div
        className={`group relative bg-white rounded-3xl border-2 border-brand-orange/30 shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 hover:border-brand-orange transition-all duration-300 overflow-hidden flex flex-col md:flex-row ${className}`}
      >
        {/* Executive Ribbon Tag */}
        <div className="absolute top-4 right-4 z-20 hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-brand-orange to-brand-darkOrange text-white text-xs font-bold shadow-md shadow-orange-500/25">
          <Award className="w-3.5 h-3.5" />
          <span>{t("ผู้บริหารสูงสุด", "Faculty Leadership")}</span>
        </div>

        {/* Photo Container */}
        <div className="relative w-full md:w-5/12 lg:w-4/12 aspect-[3/4] sm:aspect-[4/5] md:aspect-auto md:min-h-[340px] bg-gradient-to-b from-orange-50/80 via-slate-100 to-slate-200 overflow-hidden shrink-0">
          <Image
            src={imgSrc}
            alt={person.nameTh}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 35vw"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={() => setImgSrc("/assets/faculty/placeholder-avatar.svg")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
          <div className="absolute bottom-3 left-3 z-10 md:hidden text-white">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-orange/90 backdrop-blur-xs shadow-md">
              {badge.labelTh}
            </span>
          </div>
        </div>

        {/* Info Container */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-3.5">
            {/* Category / Department Tag */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${badge.bg} ${badge.text} ${badge.border}`}
              >
                {language === "en" ? badge.labelEn : badge.labelTh}
              </span>
              {departmentName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{departmentName}</span>
                </span>
              )}
            </div>

            {/* Names */}
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-brand-orange transition-colors">
                {displayName}
              </h3>
              {language === "th" && englishName && (
                <p className="text-sm font-semibold text-slate-500 mt-0.5">{englishName}</p>
              )}
            </div>

            {/* Role */}
            <div className="p-3.5 rounded-2xl bg-brand-lightOrange/80 border border-orange-200/70">
              <p className="text-sm sm:text-base font-bold text-brand-darkOrange leading-snug">
                {roleName}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 text-xs sm:text-sm text-slate-600">
            {person.email && (
              <a
                href={`mailto:${person.email}`}
                className="inline-flex items-center gap-2 text-slate-700 hover:text-brand-orange transition-colors group/link truncate active:scale-95"
                title={person.email}
              >
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-orange group-hover/link:bg-brand-orange group-hover/link:text-white transition-colors shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="truncate font-medium">{person.email}</span>
              </a>
            )}

            {person.phone && (
              <a
                href={phoneClean ? `tel:${phoneClean}` : "#"}
                className="inline-flex items-center gap-2 text-slate-700 hover:text-brand-orange transition-colors group/link shrink-0 active:scale-95"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-orange group-hover/link:bg-brand-orange group-hover/link:text-white transition-colors shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-medium">{person.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 hover:border-brand-orange/40 transition-all duration-300 flex flex-col overflow-hidden ${className}`}
    >
      {/* Portrait Photo Container */}
      <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-slate-100 to-slate-200 overflow-hidden shrink-0">
        <Image
          src={imgSrc}
          alt={person.nameTh}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={() => setImgSrc("/assets/faculty/placeholder-avatar.svg")}
        />

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border shadow-xs backdrop-blur-md ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {language === "en" ? badge.labelEn : badge.labelTh}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Department badge */}
          {departmentName && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 font-medium max-w-full">
              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{departmentName}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-brand-orange transition-colors leading-snug text-sm sm:text-base line-clamp-2">
              {displayName}
            </h3>
            {language === "th" && englishName && (
              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                {englishName}
              </p>
            )}
          </div>

          {/* Role / Position */}
          <div className="pt-1">
            <p className="text-xs sm:text-sm font-semibold text-brand-darkOrange leading-tight line-clamp-2">
              {roleName}
            </p>
          </div>
        </div>

        {/* Contact Links */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-mono">
          {person.email && (
            <a
              href={`mailto:${person.email}`}
              className="flex items-center gap-2 text-slate-600 hover:text-brand-orange transition-colors truncate active:scale-95 font-medium"
              title={person.email}
            >
              <Mail className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span className="truncate">{person.email}</span>
            </a>
          )}

          {person.phone && (
            <a
              href={phoneClean ? `tel:${phoneClean}` : "#"}
              className="flex items-center gap-2 text-slate-600 hover:text-brand-orange transition-colors active:scale-95 font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span>{person.phone}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
