import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "./contexts/LocaleContext";
import { GeoLocationProvider } from "./contexts/GeoLocationContext";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { FullPageLoader } from "./_components/FullPageLoader";
import { headers } from "next/headers"; // this needs to be used from a server component

const montserrat = Montserrat({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secret Project 🌙", // TODO change to the proper title
  description: "Otrzymuj codzienne szepty, które ogrzewają serce.", // TODO translation
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const ipCountry = headersList.get("x-vercel-ip-country");
  const host = headersList.get("Host");

  const messages = await getMessages();
  const locale = await getLocale();

  return (
    <html lang={locale} className={montserrat.className}>
      <body>
        <Suspense fallback={<FullPageLoader />}>
          <LocaleProvider locale={locale}>
            <GeoLocationProvider ipCountry={ipCountry} host={host}>
              {/** NextIntlClientProvider used to provide configuration for Client Components */}
              {/**  */}
              <NextIntlClientProvider messages={messages} locale={locale}>
                {children}
              </NextIntlClientProvider>
            </GeoLocationProvider>
          </LocaleProvider>
        </Suspense>
      </body>
    </html>
  );
}
