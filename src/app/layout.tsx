import type { Metadata } from "next";
import { Mitr } from "next/font/google";
import "./globals.css";

const mitr = Mitr({
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-mitr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ITD - Faculty of Information Technology and Digital Innovation, KMUTNB",
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
      <body className="font-sans antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
