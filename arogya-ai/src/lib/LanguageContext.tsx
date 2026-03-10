"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import kn from "../locales/kn.json";
import te from "../locales/te.json";
import ta from "../locales/ta.json";

type Language = "en" | "hi" | "kn" | "te" | "ta";

type Translations = typeof en;

const translations: Record<Language, Translations> = {
  en,
  hi: hi as Translations,
  kn: kn as Translations,
  te: te as Translations,
  ta: ta as Translations,
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Load persisted language from localStorage
    const saved = localStorage.getItem("arogya_language") as Language;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("arogya_language", lang);
  };

  const t = (key: keyof Translations): string => {
    return translations[language][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
