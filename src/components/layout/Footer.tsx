"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { footerNav } from "@/data/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  ArrowUp,
  Globe,
  ShieldCheck,
  FileCheck
} from "lucide-react";

export default function Footer() {
  const { language, t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0C0D11] text-slate-300 relative z-30 mt-auto overflow-hidden">
      {/* Top Accent Gradient Border */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-orange via-amber-400 to-brand-darkOrange" />

      {/* Top Bar / Quick Accent Bar */}
      <div className="border-b border-white/10 bg-[#111217]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-orange animate-pulse shadow-[0_0_10px_#FF6B00]" />
            <span className="text-xs sm:text-sm text-slate-200 font-medium">
              {t(
                "คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
                "Faculty of Information Technology and Digital Innovation, KMUTNB"
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-white/10 shadow-xs active:scale-95 group"
            aria-label="Scroll back to top"
          >
            <ArrowUp className="w-3.5 h-3.5 text-brand-orange transition-transform group-hover:-translate-y-0.5" />
            <span>{t("กลับขึ้นด้านบน", "Back to top")}</span>
          </button>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Faculty Info & Contact (Span 4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block group active:scale-98 transition-transform">
              <div className="relative h-12 w-48 sm:w-56">
                <Image
                  src="/assets/logos/Logo-Footer.png"
                  alt="Faculty of Information Technology and Digital Innovation, KMUTNB"
                  fill
                  sizes="(max-width: 640px) 192px, 224px"
                  className="object-contain object-left invert brightness-200 contrast-200"
                />
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t(
                "มุ่งมั่นผลิตบัณฑิต วิจัย และพัฒนานวัตกรรมด้านเทคโนโลยีสารสนเทศและดิจิทัลที่มีคุณภาพสูง สอดคล้องกับความต้องการของสังคมและภาคอุตสาหกรรมในระดับสากล",
                "Dedicated to cultivating high-caliber graduates, research, and innovation in information technology and digital innovation meeting international standards and industry demands."
              )}
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                </div>
                <span className="leading-relaxed text-slate-300">
                  {t(
                    "1518 ถนนประชาราษฎร์ 1 แขวงวงศ์สว่าง เขตบางซื่อ กรุงเทพฯ 10800",
                    "1518 Pracharat 1 Rd., Wongsawang, Bangsue, Bangkok 10800, Thailand"
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
                  <Phone className="w-3.5 h-3.5 text-brand-orange" />
                </div>
                <a
                  href="tel:025552000"
                  className="hover:text-white hover:underline transition-colors text-slate-300"
                >
                  {t("02-555-2000 ต่อ 2701 - 2708", "+66 2 555 2000 Ext. 2701 - 2708")}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
                  <Mail className="w-3.5 h-3.5 text-brand-orange" />
                </div>
                <a
                  href="mailto:itd@itd.kmutnb.ac.th"
                  className="hover:text-white hover:underline transition-colors text-slate-300"
                >
                  itd@itd.kmutnb.ac.th
                </a>
              </div>
            </div>

            {/* Social Channels */}
            <div className="pt-2">
              <span className="block text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                {t("ช่องทางการติดตาม", "Follow Us")}
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.facebook.com/IT.KMUTNB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#1877F2] border border-white/10 hover:border-transparent flex items-center justify-center p-2 transition-all active:scale-90 group"
                  aria-label="Facebook Fanpage"
                >
                  <Image
                    src="/assets/logos/footer-facebook.png"
                    alt="Facebook"
                    width={20}
                    height={20}
                    className="w-4 h-4 object-contain"
                  />
                </a>

                <a
                  href="https://line.me/ti/p/~@it.kmutnb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#00B900] border border-white/10 hover:border-transparent flex items-center justify-center p-2 transition-all active:scale-90 group"
                  aria-label="Line Official Account"
                >
                  <Image
                    src="/assets/logos/footer-line.png"
                    alt="Line OA"
                    width={20}
                    height={20}
                    className="w-4 h-4 object-contain"
                  />
                </a>

                <a
                  href="https://www.youtube.com/@ITKMUTNB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#FF0000] border border-white/10 hover:border-transparent flex items-center justify-center p-2 transition-all active:scale-90 group"
                  aria-label="YouTube Channel"
                >
                  <Image
                    src="/assets/logos/footer-youtube.png"
                    alt="YouTube"
                    width={20}
                    height={20}
                    className="w-4 h-4 object-contain"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2, 3, 4: Structured Footer Navigation Groups */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {footerNav.map((group) => (
              <div key={group.titleTh} className="space-y-4">
                <h3 className="text-sm font-bold text-white tracking-wide border-l-2 border-brand-orange pl-3">
                  {t(group.titleTh, group.titleEn)}
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
                  {group.items.map((item) => {
                    if (item.external) {
                      return (
                        <li key={item.href + item.titleTh}>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 hover:text-brand-orange hover:translate-x-1 transition-all group"
                          >
                            <span>{t(item.titleTh, item.titleEn)}</span>
                            <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 shrink-0 ml-0.5" />
                          </a>
                        </li>
                      );
                    }

                    return (
                      <li key={item.href + item.titleTh}>
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-1.5 hover:text-brand-orange hover:translate-x-1 transition-all group"
                        >
                          <ChevronRight className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:text-brand-orange shrink-0" />
                          <span>{t(item.titleTh, item.titleEn)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright & Secondary Legal Bar */}
      <div className="border-t border-white/10 bg-[#08090C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left font-mono text-[11px] sm:text-xs">
            © {currentYear} ITD KMUTNB. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <Link href="/about" className="hover:text-brand-orange transition-colors">
              {t("เกี่ยวกับคณะ", "About Us")}
            </Link>
            <span>•</span>
            <Link href="/services#downloads" className="hover:text-brand-orange transition-colors">
              {t("แบบฟอร์มคำร้อง", "Downloads")}
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-brand-orange transition-colors">
              {t("ติดต่อเรา", "Contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
