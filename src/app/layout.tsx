import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "./contexts/LocaleContext";
import { Suspense } from "react";
import { NextIntlClientProvider, useLocale } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wieczorny Szept 🌙",
  description: "Otrzymuj codzienne szepty, które ogrzewają serce.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const messages = await getMessages();
  const locale = await getLocale();
  return (
    <html>
      <body className={`${montserrat.variable} antialiased font-montserrat`}>
        <Suspense fallback={<div>Loading...</div>}>
          <LocaleProvider locale={locale}>
            {/** NextIntlClientProvider used to provide configuration for Client Components */}
            {/**  */}
            <NextIntlClientProvider messages={messages} locale={locale}>
              {children}
            </NextIntlClientProvider>
          </LocaleProvider>
        </Suspense>
      </body>
    </html>
  );
}
