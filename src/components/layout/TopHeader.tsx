"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { quickLinks } from "@/data/navigation";
import { 
  Phone, 
  GraduationCap, 
  FileText, 
  ExternalLink,
  Laptop,
  HelpCircle
} from "lucide-react";

export default function TopHeader() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="w-full bg-white border-b border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] relative z-40">
      {/* Top Bar on larger screens / container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
        {/* Faculty Brand Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 shrink-0 group focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 rounded-lg"
          title="คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ"
        >
          <div className="relative h-10 sm:h-12 w-[180px] sm:w-[260px]">
            <Image
              src="/assets/logos/Logo-Header.png"
              alt="Faculty of Information Technology and Digital Innovation, KMUTNB"
              fill
              priority
              sizes="(max-width: 640px) 180px, 260px"
              className="object-contain object-left transition-transform duration-200 group-hover:scale-[1.01]"
            />
          </div>
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Quick Access Action Bar - Desktop & Large Tablets */}
          <div className="hidden xl:flex items-center gap-2 text-xs">
            <a
              href="https://www.admission.kmutnb.ac.th"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 text-brand-orange font-medium border border-orange-200 transition-colors shadow-xs"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{t("สมัครเรียนออนไลน์", "Admissions")}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>

            <Link
              href="/services#e-services"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-700 hover:text-brand-orange hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
            >
              <Laptop className="w-3.5 h-3.5 text-gray-500" />
              <span>{t("Student e-Services", "e-Services")}</span>
            </Link>

            <Link
              href="/services#downloads"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-700 hover:text-brand-orange hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              <span>{t("ดาวน์โหลดเอกสาร", "Downloads")}</span>
            </Link>
          </div>

          {/* Social Channels & Contact - Tablet/Desktop */}
          <div className="hidden sm:flex items-center gap-2 border-l border-gray-200 pl-3 sm:pl-4">
            <a
              href="https://www.facebook.com/IT.KMUTNB"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:text-[#1877F2] hover:bg-blue-50 transition-all p-1"
              title="Facebook Fanpage"
              aria-label="Facebook"
            >
              <Image
                src="/assets/logos/facebook.png"
                alt="Facebook"
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
            </a>

            <a
              href="https://line.me/ti/p/~@it.kmutnb"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:text-[#00B900] hover:bg-green-50 transition-all p-1"
              title="LINE Official Account"
              aria-label="Line"
            >
              <Image
                src="/assets/logos/line.png"
                alt="Line OA"
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
            </a>

            <Link
              href="/contact"
              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-brand-orange transition-colors px-2 py-1 rounded hover:bg-gray-50"
              title={t("ติดต่อคณะ", "Contact Us")}
            >
              <Phone className="w-3.5 h-3.5 text-brand-orange" />
              <span className="hidden md:inline font-medium">{t("ติดต่อเรา", "Contact")}</span>
            </Link>
          </div>

          {/* Bilingual Language Switcher Toggle */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-full border border-gray-200 shadow-inner">
            <button
              type="button"
              onClick={() => setLanguage("th")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                language === "th"
                  ? "bg-brand-orange text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              aria-label="ภาษาไทย"
            >
              <Image
                src="/assets/logos/th-flag.png"
                alt="TH"
                width={14}
                height={14}
                className="w-3.5 h-3.5 rounded-full object-cover shadow-2xs"
              />
              <span>TH</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                language === "en"
                  ? "bg-brand-orange text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              aria-label="English"
            >
              <Image
                src="/assets/logos/uk-flag.png"
                alt="EN"
                width={14}
                height={14}
                className="w-3.5 h-3.5 rounded-full object-cover shadow-2xs"
              />
              <span>EN</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
