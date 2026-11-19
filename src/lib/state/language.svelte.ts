import { browser } from "$app/environment";

export type Language = "th" | "en";

function getStorage(): Storage | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== "undefined" && localStorage) {
      return localStorage;
    }
  } catch {
    // Ignore storage access errors
  }
  return null;
}

export class LanguageState {
  language = $state<Language>("th");

  constructor() {
    try {
      const storage = getStorage();
      if (storage) {
        const saved = storage.getItem("itd_lang") as Language | null;
        if (saved === "th" || saved === "en") {
          this.language = saved;
        }
      }
    } catch {
      // Storage access might throw in certain sandboxed environments
    }
  }

  setLanguage = (lang: Language): void => {
    this.language = lang;
    try {
      const storage = getStorage();
      if (storage) {
        storage.setItem("itd_lang", lang);
      }
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.lang = lang;
      }
    } catch {
      // Ignore write errors
    }
  };

  t = (th: string, en?: string): string => {
    if (this.language === "en" && en) {
      return en;
    }
    return th;
  };
}

export const languageState = new LanguageState();
export const setLanguage = languageState.setLanguage;
export const t = languageState.t;
