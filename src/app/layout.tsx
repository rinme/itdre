import type { Metadata } from "next";
import { Mitr, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import DemoBanner from "@/components/demo/DemoBanner";
import TopHeader from "@/components/layout/TopHeader";
import MainNavbar from "@/components/layout/MainNavbar";
import Footer from "@/components/layout/Footer";

const mitr = Mitr({
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-mitr",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://itd.kmutnb.ac.th"),
  title: "คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. | ITD KMUTNB (Renovation Demo)",
  description: "Faculty of Information Technology and Digital Innovation, King Mongkut's University of Technology North Bangkok — Website Renovation Prototype",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  openGraph: {
    title: "คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. | ITD KMUTNB (Renovation Demo)",
    description: "Website Modernization & Renovation Concept Showcase for ITD KMUTNB",
    images: [
      {
        url: "/assets/banners/banner-1.png",
        width: 1200,
        height: 630,
        alt: "ITD KMUTNB Renovation Prototype",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ITD KMUTNB - Renovation Concept Demo",
    description: "Modernized Faculty Website Showcase for ITD KMUTNB",
    images: ["/assets/banners/banner-1.png"],
  },
  icons: {
    icon: "/assets/logos/logo-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${mitr.variable} ${plusJakarta.variable}`}>
      <body className="font-sans antialiased bg-[#F8F9FA] text-slate-900 min-h-screen flex flex-col selection:bg-brand-orange selection:text-white">
        <LanguageProvider>
          <DemoBanner />
          <TopHeader />
          <MainNavbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
