"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "th" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (th: string, en?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "th",
  setLanguage: () => {},
  t: (th) => th,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("th");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("itd_lang") as Language;
    if (saved === "th" || saved === "en") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("itd_lang", lang);
      document.documentElement.lang = lang;
    }
  };

  const t = (th: string, en?: string): string => {
    if (mounted && language === "en" && en) {
      return en;
    }
    return th;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
