"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, t } from "@/lib/translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  dir: "ltr" | "rtl";
  trans: typeof t["en"];
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  dir: "ltr",
  trans: t.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Load persisted language preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("autorent_lang") as Lang | null;
      if (saved === "ar" || saved === "en") {
        setLangState(saved);
        document.documentElement.lang = saved;
        document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem("autorent_lang", newLang);
    } catch {}
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const dir = lang === "ar" ? "rtl" : "ltr";
  const trans = t[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir, trans }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
