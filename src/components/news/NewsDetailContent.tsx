"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { NewsItem } from "@/types";
import NewsCard from "@/components/news/NewsCard";
import { useLanguage } from "@/context/LanguageContext";
import { 
  formatNewsDate, 
  getCategoryIdByName, 
  getCategoryStyle,
  getCategoryByName 
} from "@/lib/news-utils";
import {
  Calendar,
  Eye,
  Building2,
  Share2,
  FileText,
  Download,
  ExternalLink,
  Copy,
  Check,
  Printer,
  ArrowLeft,
  ChevronRight,
  Home,
  Newspaper,
  Layers,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

interface NewsDetailContentProps {
  article: NewsItem;
  relatedArticles: NewsItem[];
}

export default function NewsDetailContent({
  article,
  relatedArticles,
}: NewsDetailContentProps) {
  const { t, language } = useLanguage();
  const [imgSrc, setImgSrc] = useState(article.thumbnail || "/assets/news/placeholder-news.svg");
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const categoryId = getCategoryIdByName(article.category);
  const categoryObj = getCategoryByName(article.category);
  const categoryColor = getCategoryStyle(article.category);
  const formattedDate = formatNewsDate(article.date, language);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(article.title)}`,
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#F8F9FA]">
      {/* Toast Notification for Copied Link */}
      {copied && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 animate-scale-in">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-medium">
            {t("คัดลอกลิงก์บทความเรียบร้อยแล้ว!", "Link copied to clipboard!")}
          </span>
        </div>
      )}

      {/* Top Breadcrumb & Navigation Bar */}
      <section className="w-full bg-white border-b border-gray-200/80 sticky top-0 sm:static z-20 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto no-scrollbar">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-brand-orange transition-colors shrink-0"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t("หน้าหลัก", "Home")}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link
              href="/news"
              className="hover:text-brand-orange transition-colors shrink-0"
            >
              {t("ข่าวสาร", "News")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link
              href={`/news?category=${categoryId}`}
              className="hover:text-brand-orange transition-colors font-medium text-gray-700 shrink-0"
            >
              {t(article.category, categoryObj?.nameEn || article.category)}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 hidden sm:inline" />
            <span className="text-gray-400 truncate max-w-[200px] hidden sm:inline">
              {article.title}
            </span>
          </nav>

          {/* Back to archive link */}
          <Link
            href={`/news?category=${categoryId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:text-brand-dark-orange transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("กลับหน้ารวมข่าว", "Back to News")}</span>
          </Link>
        </div>
      </section>

      {/* Main Article Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        <article className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden p-6 sm:p-10 lg:p-12 space-y-8">
          {/* Article Header */}
          <header className="space-y-4 pb-6 border-b border-gray-100">
            {/* Category & ID badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/news?category=${categoryId}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-transform hover:scale-105 ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${categoryColor.dot}`} />
                <span>{t(article.category, categoryObj?.nameEn || article.category)}</span>
              </Link>

              <span className="text-xs font-mono text-gray-400 bg-gray-100/80 px-2.5 py-1 rounded-md">
                Ref ID: #{article.id}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              {article.title}
            </h1>

            {/* Metadata bar */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-gray-500 pt-2">
              {/* Date */}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-orange shrink-0" />
                <time dateTime={article.date} className="font-medium text-gray-700">
                  {formattedDate}
                </time>
              </div>

              {/* Department */}
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{t("คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ.", "Faculty of IT & Digital Innovation, KMUTNB")}</span>
              </div>

              {/* Views */}
              {typeof article.views === "number" && (
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    {article.views.toLocaleString()}{" "}
                    {t("ครั้ง", "views")}
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* Social Share & Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <Share2 className="w-4 h-4 text-brand-orange" />
              <span>{t("แชร์ข่าวสารนี้:", "Share this article:")}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Facebook Share */}
              <a
                href={shareUrls.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
                className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity text-xs font-bold shadow-xs"
              >
                f
              </a>

              {/* LINE Share */}
              <a
                href={shareUrls.line}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LINE"
                className="w-8 h-8 rounded-lg bg-[#00C300] text-white flex items-center justify-center hover:opacity-90 transition-opacity text-[11px] font-bold shadow-xs"
              >
                LINE
              </a>

              {/* Twitter / X Share */}
              <a
                href={shareUrls.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X"
                className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center hover:opacity-90 transition-opacity text-xs font-bold shadow-xs"
              >
                ✕
              </a>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label="Copy link"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-xs ${
                  copied
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                <span>{copied ? t("คัดลอกแล้ว", "Copied") : t("คัดลอกลิงก์", "Copy Link")}</span>
              </button>

              {/* Print */}
              <button
                type="button"
                onClick={handlePrint}
                aria-label="Print article"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-medium transition-all shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-gray-500" />
                <span>{t("พิมพ์", "Print")}</span>
              </button>
            </div>
          </div>

          {/* High-Resolution Hero Image */}
          {article.thumbnail && (
            <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm max-h-[520px] aspect-video flex items-center justify-center">
              <Image
                src={imgSrc}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1000px"
                className="object-contain sm:object-cover"
                onError={() => setImgSrc("/assets/news/placeholder-news.svg")}
              />
            </div>
          )}

          {/* Article Summary Lead Box */}
          {article.summary && (
            <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/60 border-l-4 border-brand-orange text-gray-800 text-sm sm:text-base leading-relaxed">
              <span className="font-bold text-brand-dark-orange block mb-1 text-xs uppercase tracking-wider">
                {t("สรุปเนื้อหาข่าว", "Article Summary")}
              </span>
              {article.summary}
            </div>
          )}

          {/* Article Content / HTML Body */}
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-4 pt-2">
            {article.content ? (
              <div
                className="article-content-body text-sm sm:text-base text-gray-800 leading-relaxed [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_a]:text-brand-orange [&_a]:underline hover:[&_a]:text-brand-dark-orange [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-4"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <p className="text-gray-600 italic">
                {t(
                  "สามารถอ่านรายละเอียดเพิ่มเติมและประกาศฉบับเต็มได้จากเอกสารแนบด้านล่าง",
                  "Please refer to the attached document below for full details and official instructions."
                )}
              </p>
            )}
          </div>

          {/* PDF Attachment Download Card */}
          {article.pdfUrl && (
            <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-linear-to-r from-red-50/70 via-orange-50/50 to-white border border-red-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-gray-900">
                      {t("เอกสารแนบประกาศฉบับเต็ม (PDF)", "Attached Official Document (PDF)")}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {t(
                        "คลิกเพื่อดาวน์โหลดหรือเปิดดูเอกสารทางการประกอบข่าวสาร",
                        "Click to download or view the official document attachment"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-center">
                  <a
                    href={article.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-red-600/20 hover:shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t("ดาวน์โหลด PDF", "Download PDF")}</span>
                  </a>
                  <a
                    href={article.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open PDF in new tab"
                    className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* PDF URL Display */}
              <div className="text-[11px] text-gray-400 font-mono truncate bg-white/70 px-3 py-1.5 rounded-lg border border-gray-200/60">
                URL: {article.pdfUrl}
              </div>
            </div>
          )}

          {/* Article Footer & Tags */}
          <footer className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Tags:</span>
              <Link
                href={`/news?category=${categoryId}`}
                className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
              >
                #{article.category}
              </Link>
              <Link
                href="/news"
                className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
              >
                #ITD_KMUTNB
              </Link>
              <Link
                href="/news"
                className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
              >
                #ข่าวประชาสัมพันธ์
              </Link>
            </div>

            {/* Bottom Back Button */}
            <Link
              href={`/news?category=${categoryId}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-orange hover:text-brand-dark-orange transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("กลับไปยังข่าวสารหมวดหมู่นี้", "Back to this category")}</span>
            </Link>
          </footer>
        </article>

        {/* Related News Section */}
        {relatedArticles.length > 0 && (
          <section className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t("บทความที่เกี่ยวข้อง", "Related Updates")}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {t("ข่าวสารอื่นๆ ในหมวดหมู่นี้", "More News in this Category")}
                </h2>
              </div>

              <Link
                href={`/news?category=${categoryId}`}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-orange hover:text-brand-dark-orange transition-colors"
              >
                <span>{t("ดูทั้งหมดในหมวดนี้", "View all in category")}</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Related News Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
