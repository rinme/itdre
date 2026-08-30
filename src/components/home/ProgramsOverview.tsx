"use client";

import React, { useState, useMemo } from "react";
import { programs } from "@/data/programs";
import { useLanguage } from "@/context/LanguageContext";
import { 
  GraduationCap, 
  Clock, 
  Coins, 
  ExternalLink, 
  BookOpen, 
  Award,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";

type DegreeFilter = "all" | "bachelor" | "master" | "doctor";

export default function ProgramsOverview() {
  const { t, language } = useLanguage();
  const [selectedDegree, setSelectedDegree] = useState<DegreeFilter>("all");

  const degreeTabs: { id: DegreeFilter; titleTh: string; titleEn: string; icon: React.ElementType }[] = [
    { id: "all", titleTh: "ทุกระดับการศึกษา", titleEn: "All Programs", icon: GraduationCap },
    { id: "bachelor", titleTh: "ระดับปริญญาตรี (วท.บ. / วศ.บ.)", titleEn: "Bachelor's Degrees", icon: BookOpen },
    { id: "master", titleTh: "ระดับปริญญาโท (วท.ม.)", titleEn: "Master's Degrees", icon: Award },
    { id: "doctor", titleTh: "ระดับปริญญาเอก (ปร.ด.)", titleEn: "Doctoral Degrees", icon: Sparkles },
  ];

  const filteredPrograms = useMemo(() => {
    if (selectedDegree === "all") return programs;
    return programs.filter((p) => p.degree === selectedDegree);
  }, [selectedDegree]);

  const getDegreeBadge = (degree: string) => {
    switch (degree) {
      case "bachelor":
        return {
          label: t("ระดับปริญญาตรี", "Bachelor's Degree"),
          tag: "Undergraduate",
          color: "bg-orange-100 text-brand-darkOrange border-orange-200",
          gradient: "from-orange-500 to-amber-500",
        };
      case "master":
        return {
          label: t("ระดับปริญญาโท", "Master's Degree"),
          tag: "Graduate",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          gradient: "from-blue-600 to-indigo-600",
        };
      case "doctor":
        return {
          label: t("ระดับปริญญาเอก", "Doctoral Degree"),
          tag: "Ph.D.",
          color: "bg-purple-100 text-purple-800 border-purple-200",
          gradient: "from-purple-600 to-pink-600",
        };
      default:
        return {
          label: t("หลักสูตร", "Program"),
          tag: "Academic",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          gradient: "from-gray-600 to-gray-800",
        };
    }
  };

  return (
    <section id="programs" className="w-full py-14 sm:py-20 bg-gray-50/80 border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-brand-orange text-xs font-semibold tracking-wide">
            <GraduationCap className="w-4 h-4" />
            <span>{t("หลักสูตรการศึกษาที่เปิดสอน", "ACADEMIC PROGRAMS")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
            {t("หลักสูตรระดับปริญญาตรี ปริญญาโท และปริญญาเอก", "Undergraduate & Graduate Programs")}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {t(
              "หลักสูตรทันสมัยที่ได้รับการรับรองมาตรฐานสากล มุ่งเน้นการปฏิบัติจริง ตอบสนองความต้องการของอุตสาหกรรมดิจิทัล ปัญญาประดิษฐ์ และความมั่นคงไซเบอร์",
              "World-class curricula designed for hands-on expertise in software engineering, AI, cybersecurity, and digital business innovation."
            )}
          </p>
        </div>

        {/* Degree Filter Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-200/80 shadow-sm max-w-full">
            {degreeTabs.map((tab) => {
              const isActive = selectedDegree === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedDegree(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-brand-orange text-white shadow-md font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{t(tab.titleTh, tab.titleEn)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
          {filteredPrograms.map((program) => {
            const badge = getDegreeBadge(program.degree);

            return (
              <div
                key={program.id}
                className="group bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-xl hover:border-brand-orange/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header & Content */}
                <div className="p-6 space-y-4">
                  {/* Degree Badge Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                    >
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 uppercase">
                      {badge.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-brand-orange transition-colors leading-snug">
                      {language === "en" && program.titleEn ? program.titleEn : program.titleTh}
                    </h3>
                    {language === "th" && program.titleEn && (
                      <p className="text-xs text-gray-500 line-clamp-1 italic">
                        {program.titleEn}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {program.shortDescription}
                  </p>

                  {/* Program Metadata Specs */}
                  <div className="pt-2 space-y-2 border-t border-gray-100 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                      <span className="font-medium text-gray-800">{t("ระยะเวลา:", "Duration:")}</span>
                      <span>{program.duration}</span>
                    </div>

                    {program.tuition && (
                      <div className="flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                        <span className="font-medium text-gray-800">{t("ค่าธรรมเนียม:", "Tuition:")}</span>
                        <span>{program.tuition}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-0 mt-auto">
                  <a
                    href={program.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-brand-orange text-gray-700 hover:text-white border border-gray-200 hover:border-transparent text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs group/btn"
                  >
                    <span>{t("ดูรายละเอียด & สมัครเรียน", "Program Details & Apply")}</span>
                    <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Admissions Call to Action Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#222222] via-[#2A2B30] to-[#1E1E22] p-8 sm:p-10 text-white shadow-xl overflow-hidden border border-neutral-700">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 text-center lg:text-left">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t("เปิดรับสมัครนักศึกษาใหม่ 2569", "Admissions Open for Academic Year 2026")}</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                {t(
                  "พร้อมก้าวสู่อนาคตสายไอทีและนวัตกรรมดิจิทัลกับเรา",
                  "Ready to Shape the Future of IT & Digital Innovation?"
                )}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {t(
                  "สมัครเรียนออนไลน์ผ่านระบบกลาง มจพ. ทั้งระดับปริญญาตรี (TCAS / โควตา / รับตรง) และระดับบัณฑิตศึกษา",
                  "Apply online via the central KMUTNB admissions portal for undergraduate and graduate programs."
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href="https://www.admission.kmutnb.ac.th"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-orange hover:bg-brand-darkOrange text-white text-sm font-semibold shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                <span>{t("สมัครระดับปริญญาตรี (TCAS)", "Undergraduate Admissions")}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href="https://grad.admission.kmutnb.ac.th"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold border border-neutral-600 transition-all"
              >
                <span>{t("สมัครระดับ ป.โท - ป.เอก", "Graduate Admissions")}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
