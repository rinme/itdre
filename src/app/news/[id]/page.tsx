import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { newsItems } from "@/data/news";
import NewsDetailContent from "@/components/news/NewsDetailContent";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return newsItems.map((item) => ({
    id: item.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = newsItems.find((item) => item.id === params.id);

  if (!article) {
    return {
      title: "ไม่พบข่าวสาร | ITD KMUTNB",
      description: "ไม่พบข้อมูลข่าวสารที่คุณต้องการ",
    };
  }

  const cleanDescription = article.summary || article.title;

  return {
    title: `${article.title} | ข่าวสาร ITD KMUTNB`,
    description: cleanDescription,
    openGraph: {
      title: article.title,
      description: cleanDescription,
      type: "article",
      images: [
        {
          url: article.thumbnail || "/assets/logos/logo-favicon.png",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: cleanDescription,
      images: [article.thumbnail || "/assets/logos/logo-favicon.png"],
    },
  };
}

export default function NewsDetailPage({ params }: PageProps) {
  const article = newsItems.find((item) => item.id === params.id);

  if (!article) {
    notFound();
  }

  // Find related articles in the same category
  const sameCategory = newsItems.filter(
    (item) => item.category === article.category && item.id !== article.id
  );

  // If fewer than 3, fallback to other recent articles
  let relatedArticles = sameCategory.slice(0, 3);
  if (relatedArticles.length < 3) {
    const additional = newsItems.filter(
      (item) => item.id !== article.id && !relatedArticles.some((r) => r.id === item.id)
    );
    relatedArticles = [...relatedArticles, ...additional].slice(0, 3);
  }

  return (
    <NewsDetailContent
      article={article}
      relatedArticles={relatedArticles}
    />
  );
}
