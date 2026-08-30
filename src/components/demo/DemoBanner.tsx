"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import DemoFeedbackModal from "./DemoFeedbackModal";
import {
  Sparkles,
  ExternalLink,
  MessageSquareHeart,
  X,
  Layers,
  Info,
} from "lucide-react";

export default function DemoBanner() {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const isDismissed = sessionStorage.getItem("itd_demo_banner_dismissed");
    if (isDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("itd_demo_banner_dismissed", "true");
    } catch {
      // ignore storage errors
    }
  };

  const handleReopen = () => {
    setDismissed(false);
    try {
      sessionStorage.removeItem("itd_demo_banner_dismissed");
    } catch {
      // ignore storage errors
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Top Banner */}
      {!dismissed ? (
        <aside
          aria-label="Demo Prototype Notice"
          className="relative z-50 w-full bg-gradient-to-r from-[#111217] via-[#1c140d] to-[#111217] text-white border-b border-orange-500/30 text-xs py-2 px-3 sm:px-6 shadow-sm transition-all"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4">
            {/* Left: Info Badge & Description */}
            <div className="flex items-center gap-2.5 text-center md:text-left flex-wrap justify-center md:justify-start">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-orange/20 border border-brand-orange/40 text-orange-300 font-bold text-[11px] uppercase tracking-wider animate-pulse">
                <Sparkles className="w-3 h-3 text-brand-orange" />
                <span>{t("ต้นแบบปรับปรุงเว็บไซต์", "Renovation Concept Demo")}</span>
              </span>

              <span className="text-slate-300 text-[11px] sm:text-xs">
                {t(
                  "นี่คือเว็บไซต์ต้นแบบการปรับปรุงใหม่ของคณะ ITD มจพ. สำหรับทดสอบและสาธิตการใช้งาน",
                  "This is a modernization prototype showcase for ITD KMUTNB for preview & testing."
                )}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Feedback Button */}
              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-brand-orange text-white text-[11px] font-semibold border border-white/15 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <MessageSquareHeart className="w-3.5 h-3.5 text-orange-400 group-hover:text-white" />
                <span>{t("ให้ข้อเสนอแนะ", "Feedback")}</span>
              </button>

              {/* Official Site Link */}
              <a
                href="https://itd.kmutnb.ac.th"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/70 text-slate-300 hover:text-white text-[11px] font-medium border border-white/10 transition-colors"
                title="ไปยังเว็บไซต์ทางการของคณะ"
              >
                <span>{t("เว็บทางการ", "Official Site")}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
                aria-label="Dismiss banner"
                title={t("ซ่อนแถบแจ้งเตือน", "Dismiss banner")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      ) : (
        /* Floating mini badge when dismissed */
        <div className="fixed bottom-4 right-4 z-40 animate-fade-in">
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#18191E]/95 hover:bg-brand-orange text-white border border-white/15 shadow-xl backdrop-blur-md transition-all active:scale-95 text-xs font-semibold"
            title="ให้ข้อเสนอแนะเว็บไซต์ต้นแบบ"
          >
            <span className="w-2 h-2 rounded-full bg-brand-orange group-hover:bg-white animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-orange-400 group-hover:text-white" />
            <span>{t("Renovation Demo Feedback", "Demo Feedback")}</span>
          </button>
        </div>
      )}

      {/* Feedback Modal */}
      <DemoFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </>
  );
}
