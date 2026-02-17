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
import Script from "next/script";

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
  const lcpImageSrc = `/${locale}/szept_1_1080.jpg`;
  const lcpImageSrcset = `/${locale}/szept_1_480.jpg 640w, /${locale}/szept_1_640.jpg 1080w, /${locale}/szept_1_1080.jpg 1280w`;

  return (
    <html lang={locale} className={montserrat.className}>
      <head>
        <link
          rel="preload"
          as="image"
          href={lcpImageSrc}
          {...{
            imageSrcSet: lcpImageSrcset,
            imageSizes:
              "(max-width: 640px) 640px, (max-width: 1080px) 1080px, 1280px",
            fetchPriority: "high",
          }}
        />
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '667324763110874');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=667324763110874&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
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
