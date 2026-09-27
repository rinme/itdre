"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  contactInfo,
  phoneDirectory,
  transportGuide,
  type PhoneDirectoryItem,
  type TransportGuideItem,
} from "@/data/contact";
import { useLanguage } from "@/context/LanguageContext";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Building2,
  Train,
  Bus,
  Ship,
  Car,
  CheckCircle2,
  ExternalLink,
  Search,
  MessageSquare,
  Sparkles,
  Home,
  ChevronRight,
  User,
  HelpCircle,
  X,
  PhoneCall,
  Share2,
  ArrowUpRight,
  Check,
} from "lucide-react";

// Transportation icon helper
function renderTransportIcon(iconName: string) {
  const props = { className: "w-5 h-5" };
  switch (iconName) {
    case "Train":
      return <Train {...props} />;
    case "Bus":
      return <Bus {...props} />;
    case "Ship":
      return <Ship {...props} />;
    case "Car":
      return <Car {...props} />;
    default:
      return <MapPin {...props} />;
  }
}

export default function ContactContent() {
  const { language, t } = useLanguage();

  // Search filter for telephone directory
  const [phoneSearch, setPhoneSearch] = useState("");

  // Contact Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "general",
    subject: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filtered phone directory
  const filteredDirectory = phoneDirectory.filter((item) => {
    if (!phoneSearch.trim()) return true;
    const q = phoneSearch.toLowerCase();
    return (
      item.unitTh.toLowerCase().includes(q) ||
      item.unitEn.toLowerCase().includes(q) ||
      item.extension.includes(q) ||
      item.email.toLowerCase().includes(q) ||
      (item.headNameTh && item.headNameTh.toLowerCase().includes(q))
    );
  });

  // Handle Form Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate Form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = t("กรุณากรอกชื่อ-นามสกุล", "Please enter your full name");
    }
    if (!formData.email.trim()) {
      errors.email = t("กรุณากรอกอีเมล", "Please enter your email");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = t("รูปแบบอีเมลไม่ถูกต้อง", "Please enter a valid email address");
    }
    if (!formData.subject.trim()) {
      errors.subject = t("กรุณากรอกหัวข้อเรื่อง", "Please enter a subject");
    }
    if (!formData.message.trim()) {
      errors.message = t("กรุณากรอกข้อความที่ต้องการติดต่อ", "Please enter your message");
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate API network latency
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        category: "general",
        subject: "",
        message: "",
      });
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Hero Header Banner */}
      <section className="relative w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden py-14 sm:py-20 border-b border-gray-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-brand-orange transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t("หน้าหลัก", "Home")}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-brand-orange font-medium">
              {t("ติดต่อเรา", "Contact Us")}
            </span>
          </nav>

          {/* Title & Description */}
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/30 text-brand-orange text-xs font-semibold tracking-wide">
              <Building2 className="w-3.5 h-3.5" />
              <span>FACULTY CONTACT & LOCATION</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              {t("ติดต่อคณะและช่องทางการสื่อสาร", "Contact & Campus Location")}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              {t(
                "ที่ตั้งอาคารนวมินทรราชินี (อาคาร 79) มจพ., แผนที่การเดินทาง, หมายเลขโทรศัพท์ภายในทุกหน่วยงาน และแบบฟอร์มส่งข้อความสอบถาม",
                "Find our campus address at Navamindra Rajini Building (Bldg 79), interactive map directions, departmental extension directory, and inquiry form."
              )}
            </p>
          </div>

          {/* Quick Contact Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Phone className="w-4 h-4 text-brand-orange" />
              <span>{contactInfo.phoneMain} (ต่อ 2708)</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>{contactInfo.emailGeneral}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>{t("อาคาร 79 ชั้น 3, 4, 5, 7", "Bldg 79 Fl 3, 4, 5, 7")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 w-full">
        {/* Section 1: Contact Form & Main Contact Info Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Contact Info & Socials (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-orange text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t("ข้อมูลที่ตั้งและสำนักงาน", "LOCATION & OFFICE")}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {language === "en" ? contactInfo.facultyNameEn : contactInfo.facultyNameTh}
                </h2>
                <p className="text-xs sm:text-sm text-brand-orange font-semibold">
                  {language === "en" ? contactInfo.universityNameEn : contactInfo.universityNameTh}
                </p>
              </div>

              {/* Info Items List */}
              <div className="space-y-4 text-xs sm:text-sm text-gray-700">
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <strong className="text-gray-900 block font-semibold">
                      {language === "en" ? contactInfo.buildingEn : contactInfo.buildingTh}
                    </strong>
                    <p className="text-gray-600 text-xs">
                      {language === "en" ? contactInfo.addressEn : contactInfo.addressTh}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <strong className="text-gray-900 block font-semibold">
                      {t("หมายเลขโทรศัพท์หลัก", "Main Telephone")}
                    </strong>
                    <p className="text-gray-600 text-xs">
                      {contactInfo.phoneMain} ({t("เบอร์กลาง มจพ.", "KMUTNB Switchboard")})
                    </p>
                    <p className="text-brand-orange text-xs font-semibold">
                      {t("โทรตรงสำนักงานคณบดี:", "Direct Line:")} {contactInfo.phoneDirect}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <strong className="text-gray-900 block font-semibold">
                      {t("ไปรษณีย์อิเล็กทรอนิกส์ (Email)", "Official Emails")}
                    </strong>
                    <p className="text-gray-600 text-xs">
                      {t("ติดต่อทั่วไป:", "General:")} <span className="text-brand-orange font-medium">{contactInfo.emailGeneral}</span>
                    </p>
                    <p className="text-gray-600 text-xs">
                      {t("บริการการศึกษา:", "Academic:")} <span className="text-brand-orange font-medium">{contactInfo.emailAcademic}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <strong className="text-gray-900 block font-semibold">
                      {t("เวลาทำการ (Office Hours)", "Operating Hours")}
                    </strong>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {language === "en" ? contactInfo.officeHoursEn : contactInfo.officeHoursTh}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Channels Connection Cards */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {t("ช่องทางการติดตามโซเชียลมีเดีย", "Official Social Media")}
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={contactInfo.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/20 transition-all flex flex-col items-center justify-center text-center gap-1.5 group"
                  >
                    <div className="relative w-6 h-6">
                      <Image
                        src="/assets/logos/facebook.png"
                        alt="Facebook"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-bold">Facebook</span>
                  </a>

                  <a
                    href={contactInfo.socialLinks.line}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-[#06C755]/10 hover:bg-[#06C755] text-[#06C755] hover:text-white border border-[#06C755]/20 transition-all flex flex-col items-center justify-center text-center gap-1.5 group"
                  >
                    <div className="relative w-6 h-6">
                      <Image
                        src="/assets/logos/line.png"
                        alt="LINE OA"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-bold">LINE OA</span>
                  </a>

                  <a
                    href={contactInfo.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-[#FF0000]/10 hover:bg-[#FF0000] text-[#FF0000] hover:text-white border border-[#FF0000]/20 transition-all flex flex-col items-center justify-center text-center gap-1.5 group"
                  >
                    <div className="relative w-6 h-6">
                      <Image
                        src="/assets/logos/footer-youtube.png"
                        alt="YouTube"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-bold">YouTube</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Inquiry Contact Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-orange text-xs font-semibold">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t("แบบฟอร์มติดต่อสอบถาม", "ONLINE INQUIRY FORM")}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t("ส่งข้อความถึงคณะ ITD", "Send Us a Message")}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {t(
                  "กรอกข้อมูลและข้อความที่ต้องการสอบถาม เจ้าหน้าที่ฝ่ายที่เกี่ยวข้องจะติดต่อกลับโดยเร็วที่สุด",
                  "Fill out the form below and our administrative team will get back to you promptly."
                )}
              </p>
            </div>

            {/* Success Feedback Alert */}
            {submitSuccess && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{t("ส่งข้อความสำเร็จเรียบร้อยแล้ว!", "Message Sent Successfully!")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="text-emerald-700 hover:text-emerald-900 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  {t(
                    "ทางคณะได้รับข้อความสอบถามของท่านแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบและติดต่อกลับผ่านทางอีเมลหรือเบอร์โทรศัพท์ที่ท่านระบุไว้",
                    "We have received your inquiry. Our team will review and respond via your provided email or phone shortly."
                  )}
                </p>
              </div>
            )}

            {/* Contact Form Element */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    {t("ชื่อ-นามสกุล", "Full Name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("เช่น สมชาย ใจดี", "e.g. John Doe")}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                      formErrors.name
                        ? "border-red-400 bg-red-50/30 focus:ring-red-300"
                        : "border-gray-200 bg-gray-50/50 focus:border-brand-orange focus:bg-white focus:ring-brand-orange/20"
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-red-500 font-medium">{formErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    {t("อีเมลติดต่อ", "Email Address")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("เช่น email@example.com", "e.g. user@example.com")}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                      formErrors.email
                        ? "border-red-400 bg-red-50/30 focus:ring-red-300"
                        : "border-gray-200 bg-gray-50/50 focus:border-brand-orange focus:bg-white focus:ring-brand-orange/20"
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-red-500 font-medium">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    {t("หมายเลขโทรศัพท์", "Phone Number")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t("เช่น 081-234-5678", "e.g. 081-234-5678")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:border-brand-orange focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 transition-all"
                  />
                </div>

                {/* Inquiry Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    {t("เรื่องที่ต้องการติดต่อ", "Inquiry Department")}
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:border-brand-orange focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-orange/20 transition-all cursor-pointer"
                  >
                    <option value="general">{t("สอบถามข้อมูลทั่วไป / ประชาสัมพันธ์", "General Inquiries")}</option>
                    <option value="admission">{t("การรับสมัครเข้าศึกษาต่อ (Admissions)", "Student Admissions")}</option>
                    <option value="academic">{t("งานบริการการศึกษาและวิชาการ", "Academic & Registrar Support")}</option>
                    <option value="pearson-vue">{t("ศูนย์ทดสอบสากล Pearson VUE", "Pearson VUE Certification")}</option>
                    <option value="lab-booking">{t("ขอใช้ห้องปฏิบัติการ / สัมมนา", "Facility & Lab Reservation")}</option>
                    <option value="research">{t("ความร่วมมือทางวิจัยและอุตสาหกรรม", "Research & Collaboration")}</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  {t("หัวข้อเรื่อง", "Subject")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t("ระบุหัวข้อที่ต้องการสอบถาม", "Enter message subject")}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                    formErrors.subject
                      ? "border-red-400 bg-red-50/30 focus:ring-red-300"
                      : "border-gray-200 bg-gray-50/50 focus:border-brand-orange focus:bg-white focus:ring-brand-orange/20"
                  }`}
                />
                {formErrors.subject && (
                  <p className="text-[11px] text-red-500 font-medium">{formErrors.subject}</p>
                )}
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  {t("รายละเอียดข้อความ", "Message Details")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t("พิมพ์ข้อความคำถามหรือรายละเอียดที่ต้องการติดต่อที่นี่...", "Type your message or inquiry here...")}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                    formErrors.message
                      ? "border-red-400 bg-red-50/30 focus:ring-red-300"
                      : "border-gray-200 bg-gray-50/50 focus:border-brand-orange focus:bg-white focus:ring-brand-orange/20"
                  }`}
                />
                {formErrors.message && (
                  <p className="text-[11px] text-red-500 font-medium">{formErrors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <p className="text-[11px] text-gray-400">
                  * {t("ข้อมูลของท่านจะถูกเก็บเป็นความลับเพื่อการให้บริการเท่านั้น", "Your data is kept confidential")}
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-dark-orange text-white text-xs sm:text-sm font-semibold shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t("กำลังส่งข้อความ...", "Sending message...")}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t("ส่งข้อความ", "Submit Inquiry")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Section 2: Department Internal Telephone Extension Directory */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b-2 border-brand-orange/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-brand-orange flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {t("สมุดโทรศัพท์และเบอร์ต่อภายในคณะ", "Departmental Extension Directory")}
                </h2>
                <p className="text-xs text-gray-500">
                  {t("โทร. 02-555-2000 ตามด้วยหมายเลขต่อภายใน 4 หลัก", "Call 02-555-2000 followed by the 4-digit extension")}
                </p>
              </div>
            </div>

            {/* Quick Extension Search */}
            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                placeholder={t("ค้นหาหน่วยงาน, ห้อง, หรือเบอร์ต่อ...", "Search unit, room, ext...")}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm focus:bg-white focus:border-brand-orange focus:outline-hidden"
              />
              {phoneSearch && (
                <button
                  type="button"
                  onClick={() => setPhoneSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Phone Directory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirectory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md hover:border-brand-orange/30 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                      {language === "en" ? item.roomEn : item.roomTh}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-brand-orange border border-orange-200">
                      {t(`ชั้น ${item.floor}`, `Fl ${item.floor}`)}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-gray-900">
                    {language === "en" ? item.unitEn : item.unitTh}
                  </h3>

                  {item.headNameTh && (
                    <p className="text-xs text-gray-500">
                      {language === "en" ? item.headNameEn : item.headNameTh}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-brand-orange font-bold text-sm">
                    <Phone className="w-3.5 h-3.5 text-brand-orange" />
                    <span>{t("ต่อ", "Ext.")} {item.extension}</span>
                  </div>

                  <a
                    href={`tel:${item.phone.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-brand-orange"
                  >
                    <span>{item.phone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Embedded Google Map & Directions */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b-2 border-brand-orange/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {t("แผนที่และการเดินทางมายังคณะ ITD", "Campus Map & Getting Here")}
                </h2>
                <p className="text-xs text-gray-500">
                  {t("อาคารนวมินทรราชินี (อาคาร 79) ถนนประชาราษฎร์ 1 เขตบางซื่อ กรุงเทพฯ", "Navamindra Rajini Building, Pracharat 1 Rd, Bang Sue, Bangkok")}
                </p>
              </div>
            </div>

            <a
              href={contactInfo.googleMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 hover:bg-brand-orange text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs shrink-0"
            >
              <span>{t("เปิดใน Google Maps", "Open in Google Maps")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Map Frame */}
          <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100">
            <iframe
              src={contactInfo.googleMapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="ITD KMUTNB Location Map"
              className="w-full h-full"
            />
          </div>

          {/* Transportation Guide Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {transportGuide.map((guide) => (
              <div
                key={guide.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-brand-orange flex items-center justify-center">
                    {renderTransportIcon(guide.iconName)}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900">
                    {language === "en" ? guide.titleEn : guide.titleTh}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {language === "en" ? guide.descriptionEn : guide.descriptionTh}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-1 text-[11px] text-gray-500">
                  {(language === "en" ? guide.detailsEn : guide.detailsTh).map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-1.5">
                      <span className="text-brand-orange font-bold">•</span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
