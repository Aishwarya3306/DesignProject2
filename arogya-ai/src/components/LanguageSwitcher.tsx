"use client";

import React from "react";
import { useLanguage } from "../lib/LanguageContext";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as any)}
      className="bg-transparent text-[var(--zen-earth)] text-sm focus:outline-none cursor-pointer hover:opacity-80 transition-opacity font-medium mr-4 py-1"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code} className="text-gray-800">
          {lang.label}
        </option>
      ))}
    </select>
  );
}
