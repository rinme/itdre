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
    <section className="w-full py-16 sm:py-24 bg-[#0D0E12] text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-brand-dark-orange/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12 sm:space-y-16">
        {/* Top Header & Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-brand-orange text-xs font-bold tracking-wide backdrop-blur-md">
            <Building2 className="w-3.5 h-3.5" />
            <span>{t("แนะนำคณะ ITD KMUTNB", "ABOUT ITD FACULTY")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            {t(
              "ก้าวสู่ยุคดิจิทัลด้วยศักยภาพและความพร้อมระดับสากล",
              "Pioneering Digital Future with Global Excellence"
            )}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
            {t(
              "คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. มุ่งมั่นสร้างสรรค์นวัตกรรม บ่มเพาะบุคลากรที่มีความเชี่ยวชาญเพื่อขับเคลื่อนสังคมและเศรษฐกิจดิจิทัล",
              "Faculty of Information Technology and Digital Innovation KMUTNB empowers future innovators and leaders through hands-on education and high-impact research."
            )}
          </p>
        </div>

        {/* Video & Core Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left: Video Embed Frame (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden bg-[#141519] border border-white/10 shadow-2xl shadow-black/50 group">
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
              <div className="p-4 sm:p-5 bg-[#141519]/95 border-t border-white/10 flex items-center justify-between gap-4 backdrop-blur-md">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                  <Play className="w-4 h-4 text-brand-orange shrink-0 fill-brand-orange" />
                  <span className="font-semibold truncate">
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
                  className="shrink-0 text-xs font-bold text-brand-orange hover:text-orange-400 inline-flex items-center gap-1.5 transition-colors active:scale-95"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
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
                  className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-orange/40 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-brand-orange/15 text-brand-orange flex items-center justify-center shrink-0 mt-0.5 border border-brand-orange/30 group-hover:bg-brand-orange group-hover:text-white transition-all shadow-sm">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-orange transition-colors leading-snug">
                        {t(pillar.titleTh, pillar.titleEn)}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
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
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-orange hover:text-orange-400 hover:translate-x-1 transition-all group"
              >
                <span>{t("ศึกษาข้อมูลเพิ่มเติมเกี่ยวกับคณะ ITD", "Discover More About ITD Faculty")}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Key Stats Counter Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-white/10">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.id}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-3 hover:border-brand-orange/40 hover:bg-white/10 transition-all group shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-mono tabular-nums group-hover:text-brand-orange transition-colors">
                    {stat.value}
                  </span>
                  <div className={`p-2.5 rounded-xl bg-black/40 border border-white/10 ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200 leading-snug">
                    {t(stat.labelTh, stat.labelEn)}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-normal">
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
