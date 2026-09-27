"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  X,
  Sparkles,
  Send,
  Star,
  CheckCircle2,
  MessageSquareHeart,
  HelpCircle,
} from "lucide-react";

interface DemoFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoFeedbackModal({
  isOpen,
  onClose,
}: DemoFeedbackModalProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [aspect, setAspect] = useState<string>("design");
  const [feedback, setFeedback] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFeedback("");
        onClose();
      }, 2200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-[#18191E] border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10 animate-scale-in text-white">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#1f2027]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-dark-orange flex items-center justify-center text-white shadow-md shadow-orange-500/25">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {t("ข้อเสนอแนะเว็บไซต์ต้นแบบ", "Renovation Demo Feedback")}
              </h3>
              <p className="text-xs text-slate-400">
                {t(
                  "ความเห็นของท่านช่วยพัฒนาเว็บไซต์คณะ ITD มจพ. ให้ดียิ่งขึ้น",
                  "Help us shape the future of the ITD KMUTNB website"
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">
              {t("ขอบคุณสำหรับข้อเสนอแนะ!", "Thank you for your feedback!")}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              {t(
                "ข้อมูลความคิดเห็นของท่านถูกบันทึกเรียบร้อยแล้ว ทีมงานจะนำไปปรับปรุงโครงสร้างและการออกแบบเว็บไซต์ต่อไป",
                "Your valuable feedback has been recorded and will be used to enhance the final release."
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {/* Rating Stars */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                {t("ความพึงพอใจต่อดีไซน์และฟังก์ชันต้นแบบ", "Overall Prototype Experience")}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating ?? rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-600 transition-transform active:scale-90"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          active
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-600 hover:text-slate-500"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 text-xs font-semibold text-amber-400">
                  {rating === 5 && t("ยอดเยี่ยมมาก (5/5)", "Excellent (5/5)")}
                  {rating === 4 && t("ดีมาก (4/5)", "Very Good (4/5)")}
                  {rating === 3 && t("ปานกลาง (3/5)", "Good (3/5)")}
                  {rating === 2 && t("ควรปรับปรุง (2/5)", "Needs Work (2/5)")}
                  {rating === 1 && t("ต้องแก้ไข (1/5)", "Poor (1/5)")}
                </span>
              </div>
            </div>

            {/* Category / Aspect */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                {t("หัวข้อที่ต้องการเน้น", "Feedback Area")}
              </label>
              <select
                value={aspect}
                onChange={(e) => setAspect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#121316] text-white text-xs sm:text-sm focus:border-brand-orange focus:outline-none"
              >
                <option value="design">{t("การออกแบบและสีสัน (Visual Design & UI)", "Visual Design & UI")}</option>
                <option value="navigation">{t("ความสะดวกในการค้นหาข้อมูล (Navigation & Search)", "Navigation & Search")}</option>
                <option value="mobile">{t("การใช้งานบนมือถือ (Mobile Responsiveness)", "Mobile Responsiveness")}</option>
                <option value="content">{t("เนื้อหาและข้อมูลหลักสูตร (Content Accuracy)", "Content & Curriculum")}</option>
                <option value="other">{t("ข้อเสนอแนะทั่วไป / อื่นๆ (Other Suggestions)", "Other Suggestions")}</option>
              </select>
            </div>

            {/* Comments */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                {t("ข้อเสนอแนะและสิ่งที่อยากให้เพิ่มเติม", "Your Comments & Ideas")} <span className="text-brand-orange">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t(
                  "ระบุความประทับใจ หรือจุดที่ควรปรับปรุงเพิ่มเติม...",
                  "Tell us what you like or what could be improved in this redesign..."
                )}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#121316] placeholder-slate-500 text-white text-xs sm:text-sm focus:border-brand-orange focus:outline-none"
              />
            </div>

            {/* Optional Contact */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">
                {t("ชื่อหรืออีเมลผู้ติดต่อ (ไม่บังคับ)", "Name or Email (Optional)")}
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t("เช่น อาจารย์ / นักศึกษา / email@example.com", "e.g., Student / Faculty member / email@example.com")}
                className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-[#121316] placeholder-slate-500 text-white text-xs focus:border-brand-orange focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {t("ยกเลิก", "Cancel")}
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !feedback.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-dark-orange hover:opacity-90 text-white text-xs sm:text-sm font-semibold shadow-md shadow-orange-500/25 transition-all disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t("กำลังส่ง...", "Submitting...")}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{t("ส่งข้อเสนอแนะ", "Send Feedback")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
