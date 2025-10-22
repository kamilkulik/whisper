import { useState, useEffect } from "react";
/**
 * Custom hook to get the current locale from cookies
 * @returns The current locale string or null if not found
 */
export const useCurrentLocale = (): string | null => {
  const [currentLocale, setCurrentLocale] = useState<string | null>(null);

  useEffect(() => {
    if (currentLocale !== null) return;

    const getLocale = () => {
      const id = setTimeout(async () => {
        const v =
          document.cookie
            .split(";")
            .find((c) => c.trim().startsWith("locale="))
            ?.split("=")[1] ?? null;
        setCurrentLocale(v);
      }, 0);
      return () => clearTimeout(id);
    };
    getLocale();
  }, [currentLocale]);

  return currentLocale;
};
