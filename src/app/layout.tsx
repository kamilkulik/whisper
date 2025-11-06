import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "./_contexts/LocaleContext";
import { GeoLocationProvider } from "./_contexts/GeoLocationContext";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { FullPageLoader } from "./_components/FullPageLoader";
import { headers } from "next/headers"; // this needs to be used from a server component
import { createTranslatorFromLocale } from "@/i18n/utils";

const montserrat = Montserrat({
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await createTranslatorFromLocale(locale, "metadata");

  const metadata = {
    title: t("title"),
    description: t("description"),
  };

  return metadata;
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const ipCountry = headersList.get("x-vercel-ip-country");
  const host = headersList.get("Host");

  const messages = await getMessages();
  const locale = await getLocale();

  // Preload the first carousel image (LCP image) for the current locale
  const lcpImageSrc = `/${locale}/szept_1_1280.jpg`;
  const lcpImageSrcset = `/${locale}/szept_1_640.jpg 640w, /${locale}/szept_1_1080.jpg 1080w, /${locale}/szept_1_1280.jpg 1280w`;

  return (
    <html lang={locale} className={montserrat.className}>
      <head>
        <link
          rel="preload"
          as="image"
          href={lcpImageSrc}
          {...{
            imagesrcset: lcpImageSrcset,
            imagesizes:
              "(max-width: 640px) 640px, (max-width: 1080px) 1080px, 1280px",
            fetchpriority: "high",
          }}
        />
      </head>
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
