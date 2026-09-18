import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation as useTranslationI18n } from "react-i18next";
import i18n from "../i18n";
import { LanguageCode } from "../types";

interface LanguageContextType {
  currentLang: LanguageCode;
  changeLang: (lang: LanguageCode) => Promise<void>;
  token: string | null;
  setToken: (token: string | null) => void;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(
    () => (i18n.language as LanguageCode) || "uz"
  );
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("yukla_token"));

  useEffect(() => {
    const handleLangChange = (lng: string) => {
      setCurrentLang(lng as LanguageCode);
    };
    i18n.on("languageChanged", handleLangChange);
    return () => {
      i18n.off("languageChanged", handleLangChange);
    };
  }, []);

  const setToken = (tok: string | null) => {
    setTokenState(tok);
  };

  const changeLang = async (lang: LanguageCode) => {
    await i18n.changeLanguage(lang);
    setCurrentLang(lang);
    localStorage.setItem("yukla_lang", lang);
    sessionStorage.setItem("yukla_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;

    if (token) {
      try {
        await fetch("/api/users/language", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ language: lang })
        });
      } catch (err) {
        console.error("Failed to commit user language preference to API:", err);
      }
    }
  };

  const dir = currentLang === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ currentLang, changeLang, token, setToken, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  const { t, i18n: i18nInstance } = useTranslationI18n();

  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }

  return {
    t,
    currentLang: (i18nInstance.language as LanguageCode) || context.currentLang,
    changeLang: context.changeLang,
    token: context.token,
    setToken: context.setToken,
    dir: context.dir
  };
}

