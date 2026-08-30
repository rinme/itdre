"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Play, 
  TrendingUp, 
  Cpu, 
  Users, 
  Award, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  ExternalLink
} from "lucide-react";

export default function VideoHighlight() {
  const { t } = useLanguage();

  const stats = [
    {
      id: "employment",
      value: "98.5%",
      labelTh: "อัตราการได้งานทำของบัณฑิต",
      labelEn: "Graduate Employment Rate",
      descTh: "ได้รับการยอมรับจากองค์กรชั้นนำทั้งภาครัฐและเอกชน",
      descEn: "Recognized by leading tech enterprises nationwide",
      icon: TrendingUp,
      color: "text-amber-400",
    },
    {
      id: "labs",
      value: "15+",
      labelTh: "ห้องปฏิบัติการ & ศูนย์ทดสอบสากล",
      labelEn: "Specialized Labs & Pearson VUE",
      descTh: "ศูนย์ทดสอบ Pearson VUE และแล็บไซเบอร์ซิเคียวริตี้",
      descEn: "Pearson VUE test center & cybersecurity research labs",
      icon: Cpu,
      color: "text-brand-orange",
    },
    {
      id: "alumni",
      value: "3,500+",
      labelTh: "เครือข่ายศิษย์เก่าสายดิจิทัล",
      labelEn: "Digital Industry Alumni",
      descTh: "บุคลากรคุณภาพในวงการไอทีและนวัตกรรม",
      descEn: "Professional network across software & cloud industries",
      icon: Users,
      color: "text-emerald-400",
    },
    {
      id: "experience",
      value: "30+",
      labelTh: "ปีแห่งความเป็นเลิศทางวิชาการ",
      labelEn: "Years of Academic Excellence",
      descTh: "พัฒนาหลักสูตรและผลิตบัณฑิตคุณภาพอย่างต่อเนื่อง",
      descEn: "Continuously advancing IT higher education standards",
      icon: Award,
      color: "text-blue-400",
    },
  ];

  const pillars = [
    {
      titleTh: "ศูนย์ทดสอบมาตรฐานสากล Pearson VUE",
      titleEn: "Pearson VUE Authorized Test Center",
      descTh: "รองรับการสอบวัดระดับมาตรฐานวิชาชีพไอทีระดับสากล เช่น Cisco, AWS, Microsoft, CompTIA",
      descEn: "Certified testing facility for global IT professional certificates.",
    },
    {
      titleTh: "ระบบนิเวศการเรียนรู้และแล็บทันสมัย",
      titleEn: "Modern Learning Ecosystem & Labs",
      descTh: "ห้องปฏิบัติการ AI, IoT, Data Science, High Performance Computing และ Cyber Security",
      descEn: "Advanced labs for AI, IoT, Data Science, HPC, and Cyber Security.",
    },
    {
      titleTh: "ความร่วมมือกับภาคอุตสาหกรรม (CWIE)",
      titleEn: "Industry Partnership & Cooperative Education",
      descTh: "หลักสูตรสหกิจศึกษาและการฝึกงานกับบริษัทเทคโนโลยีชั้นนำทั้งในและต่างประเทศ",
      descEn: "Work-integrated learning and internships with premier global tech firms.",
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 bg-[#1a1b1e] text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12 sm:space-y-16">
        {/* Top Header & Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-800/90 border border-neutral-700 text-brand-orange text-xs font-semibold tracking-wide">
            <Building2 className="w-3.5 h-3.5" />
            <span>{t("แนะนำคณะ ITD KMUTNB", "ABOUT ITD FACULTY")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            {t(
              "ก้าวสู่ยุคดิจิทัลด้วยศักยภาพและความพร้อมระดับสากล",
              "Pioneering Digital Future with Global Excellence"
            )}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
            {t(
              "คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. มุ่งมั่นสร้างสรรค์นวัตกรรม บ่มเพาะบุคลากรที่มีความเชี่ยวชาญเพื่อขับเคลื่อนสังคมและเศรษฐกิจดิจิทัล",
              "Faculty of Information Technology and Digital Innovation KMUTNB empowers future innovators and leaders through hands-on education and high-impact research."
            )}
          </p>
        </div>

        {/* Video & Core Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Video Embed Frame (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-700 shadow-2xl group">
              {/* Responsive 16:9 Video Container */}
              <div className="relative w-full aspect-video">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/kUGd_VzS_a4?rel=0&modestbranding=1"
                  title="คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. | ITD KMUTNB"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>

              {/* Video Caption Bar */}
              <div className="p-4 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <Play className="w-4 h-4 text-brand-orange shrink-0 fill-brand-orange" />
                  <span className="font-medium truncate">
                    {t(
                      "วิดีทัศน์แนะนำคณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.",
                      "ITD KMUTNB Faculty Introductory Video"
                    )}
                  </span>
                </div>
                <a
                  href="https://www.youtube.com/@ITKMUTNB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs text-brand-orange hover:text-orange-400 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Key Pillars / Advantages (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-3">
              {pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-neutral-800/60 hover:bg-neutral-800/90 border border-neutral-700/80 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-brand-orange flex items-center justify-center shrink-0 mt-0.5 border border-orange-500/20 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-orange transition-colors">
                        {t(pillar.titleTh, pillar.titleEn)}
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {t(pillar.descTh, pillar.descEn)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand-orange hover:text-orange-400 hover:translate-x-1 transition-all"
              >
                <span>{t("ศึกษาข้อมูลเพิ่มเติมเกี่ยวกับคณะ ITD", "Discover More About ITD Faculty")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Key Stats Counter Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-neutral-800">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.id}
                className="p-5 sm:p-6 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 flex flex-col justify-between space-y-3 hover:border-brand-orange/40 hover:bg-neutral-800/70 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                    {stat.value}
                  </span>
                  <div className={`p-2 rounded-lg bg-neutral-900/80 ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-200">
                    {t(stat.labelTh, stat.labelEn)}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-400 leading-tight">
                    {t(stat.descTh, stat.descEn)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
