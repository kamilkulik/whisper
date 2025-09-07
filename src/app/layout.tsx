import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "./contexts/LocaleContext";
import { Suspense } from "react";
import { NextIntlClientProvider, useLocale } from "next-intl";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wieczorny Szept 🌙",
  description: "Otrzymuj codzienne szepty, które ogrzewają serce.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = useLocale();
  return (
    <html>
      <body className={`${montserrat.variable} antialiased font-montserrat`}>
        <Suspense fallback={<div>Loading...</div>}>
          <LocaleProvider locale={locale}>
            {/** NextIntlClientProvider used to provide configuration for Client Components */}
            {/**  */}
            <NextIntlClientProvider>{children}</NextIntlClientProvider>
          </LocaleProvider>
        </Suspense>
      </body>
    </html>
  );
}
