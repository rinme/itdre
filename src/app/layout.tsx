import type { Metadata } from "next";
import { Mitr } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import TopHeader from "@/components/layout/TopHeader";
import MainNavbar from "@/components/layout/MainNavbar";
import Footer from "@/components/layout/Footer";

const mitr = Mitr({
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-mitr",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://itd.kmutnb.ac.th"),
  title: "คณะเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล มจพ. | ITD KMUTNB",
  description: "Faculty of Information Technology and Digital Innovation, King Mongkut's University of Technology North Bangkok",
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
    <html lang="th" className={mitr.variable}>
      <body className="font-sans antialiased bg-[#F8F9FA] text-gray-900 min-h-screen flex flex-col selection:bg-brand-orange selection:text-white">
        <LanguageProvider>
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
