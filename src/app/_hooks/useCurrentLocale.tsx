import { useState, useEffect } from "react";

/**
 * Custom hook to get the current locale from cookies
 * @returns The current locale string or null if not found
 */
export const useCurrentLocale = (): string | null => {
  const [currentLocale, setCurrentLocale] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentLocale = () => {
      if (typeof window !== "undefined") {
        console.log("🔍 useCurrentLocale - document.cookie:", document.cookie);
        const cookieValue = document.cookie
          .split(";")
          .find((c) => c.trim().startsWith("locale="))
          ?.split("=")[1];
        console.log("🔍 useCurrentLocale - parsed cookie value:", cookieValue);
        return cookieValue || null;
      }
      return null;
    };

    const locale = getCurrentLocale();
    console.log("🔍 useCurrentLocale - final locale:", locale);
    setCurrentLocale(locale);
  }, []);

  return currentLocale;
};
