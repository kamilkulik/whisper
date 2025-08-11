"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface LocaleContextType {
  language: string;
  countryCode: string;
  isLoaded: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [language, setLanguage] = useState("Polski");
  const [countryCode, setCountryCode] = useState("+48");
  const [isLoaded, setIsLoaded] = useState(false);

  // Browser language detection
  const detectBrowserLanguage = (browserLang: string) => {
    const lang = browserLang.toLowerCase();
    if (lang.startsWith("pl")) return "Polski";
    if (lang.startsWith("en")) return "Angielski";
    if (lang.startsWith("es")) return "Hiszpański";
    if (lang.startsWith("it")) return "Włoski";
    return "Polski"; // Default fallback
  };

  // Browser country detection for phone country code
  const detectBrowserCountryCode = (browserLang: string) => {
    const lang = browserLang.toLowerCase();

    // Extract country code (part after the dash)
    const countryCodePart = lang.split("-")[1];

    // Check for specific country codes
    if (countryCodePart === "pl") return "+48"; // Poland
    if (countryCodePart === "gb" || countryCodePart === "uk") return "+44"; // United Kingdom
    if (countryCodePart === "us") return "+1"; // United States
    if (countryCodePart === "es") return "+34"; // Spain
    if (countryCodePart === "it") return "+39"; // Italy
    if (countryCodePart === "mx") return "+52"; // Mexico
    if (countryCodePart === "cl") return "+56"; // Chile

    // Fallback based on language prefix (first part before dash)
    const languageCode = lang.split("-")[0];
    if (languageCode === "pl") return "+48";
    if (languageCode === "en") return "+44"; // Default to UK for English
    if (languageCode === "es") return "+34"; // Default to Spain for Spanish
    if (languageCode === "it") return "+39";

    return "+48"; // Default fallback to Poland
  };

  useEffect(() => {
    // Detect browser language and country when component mounts
    const browserLanguage = navigator.language;

    const detectedLanguage = detectBrowserLanguage(browserLanguage);
    const detectedCountryCode = detectBrowserCountryCode(browserLanguage);

    setLanguage(detectedLanguage);
    setCountryCode(detectedCountryCode);
    setIsLoaded(true);
  }, []);

  const value: LocaleContextType = {
    language,
    countryCode,
    isLoaded,
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
