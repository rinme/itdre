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
          color: "bg-orange-100 text-brand-dark-orange border-orange-200",
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
    <section id="programs" className="w-full py-16 sm:py-24 bg-[#FAFAFC] border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-light-orange border border-orange-200/80 text-brand-dark-orange text-xs font-bold tracking-wide">
            <GraduationCap className="w-4 h-4 text-brand-orange" />
            <span>{t("หลักสูตรการศึกษาที่เปิดสอน", "ACADEMIC PROGRAMS")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t("หลักสูตรระดับปริญญาตรี ปริญญาโท และปริญญาเอก", "Undergraduate & Graduate Programs")}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {t(
              "หลักสูตรทันสมัยที่ได้รับการรับรองมาตรฐานสากล มุ่งเน้นการปฏิบัติจริง ตอบสนองความต้องการของอุตสาหกรรมดิจิทัล ปัญญาประดิษฐ์ และความมั่นคงไซเบอร์",
              "World-class curricula designed for hands-on expertise in software engineering, AI, cybersecurity, and digital business innovation."
            )}
          </p>
        </div>

        {/* Degree Filter Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-sm max-w-full">
            {degreeTabs.map((tab) => {
              const isActive = selectedDegree === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedDegree(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-brand-orange text-white shadow-md shadow-orange-500/25"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
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
                className="group bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 hover:border-brand-orange/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header & Content */}
                <div className="p-6 sm:p-7 space-y-4">
                  {/* Degree Badge Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}
                    >
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                      {badge.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-orange transition-colors leading-snug">
                      {language === "en" && program.titleEn ? program.titleEn : program.titleTh}
                    </h3>
                    {language === "th" && program.titleEn && (
                      <p className="text-xs text-slate-500 line-clamp-1 italic font-medium">
                        {program.titleEn}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {program.shortDescription}
                  </p>

                  {/* Program Metadata Specs */}
                  <div className="pt-3 space-y-2 border-t border-slate-100 text-xs text-slate-600 font-mono">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                      <span className="font-semibold text-slate-800 font-sans">{t("ระยะเวลา:", "Duration:")}</span>
                      <span className="tabular-nums font-medium">{program.duration}</span>
                    </div>

                    {program.tuition && (
                      <div className="flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                        <span className="font-semibold text-slate-800 font-sans">{t("ค่าธรรมเนียม:", "Tuition:")}</span>
                        <span className="tabular-nums font-medium">{program.tuition}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 sm:p-7 pt-0 mt-auto">
                  <a
                    href={program.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-50 hover:bg-gradient-to-r hover:from-brand-orange hover:to-brand-dark-orange text-slate-700 hover:text-white border border-slate-200 hover:border-transparent text-xs sm:text-sm font-bold transition-all duration-300 shadow-xs hover:shadow-md hover:shadow-orange-500/20 active:scale-95 group/btn"
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
        <div className="relative rounded-3xl bg-gradient-to-r from-[#141519] via-[#1C1E24] to-[#121316] p-8 sm:p-12 text-white shadow-2xl overflow-hidden border border-white/10">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3 animate-pulse-glow" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/40 text-orange-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                <span>{t("เปิดรับสมัครนักศึกษาใหม่ 2569", "Admissions Open for Academic Year 2026")}</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                {t(
                  "พร้อมก้าวสู่อนาคตสายไอทีและนวัตกรรมดิจิทัลกับเรา",
                  "Ready to Shape the Future of IT & Digital Innovation?"
                )}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
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
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-dark-orange hover:opacity-95 text-white text-sm font-bold shadow-xl shadow-orange-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <span>{t("สมัครระดับปริญญาตรี (TCAS)", "Undergraduate Admissions")}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href="https://grad.admission.kmutnb.ac.th"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold border border-white/15 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
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
