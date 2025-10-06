"use client";

import { SubscriptionType } from "@prisma/client";
import { useEffect, useState, useContext } from "react";
import { shouldShowTrial } from "../_actions/showTrial";
import { navigateToCheckout } from "../_actions/navigateToCheckout";
import { useRouter } from "next/navigation";
import { userEmailFromCookie } from "../_actions/userEmailFromCookie";
import { useTranslations, useLocale } from "next-intl";
import { GeoLocationContext } from "../contexts/GeoLocationContext";
import { triangulateLocationOnFe } from "./utils/triangulateLocation";
import { getPricingContext, PricingContextData } from "../_consts";
import Spinner from "./Spinner";

interface PricingSectionProps {
  onGetStarted?: (product: SubscriptionType) => () => Promise<void>;
  showTrial?: boolean;
}

export default function PricingSection(props: PricingSectionProps) {
  const [showTrial, setShowTrial] = useState(false);
  const router = useRouter();
  const t = useTranslations("LandingPage");
  const locale = useLocale();
  const { isLoaded, ipCountry, host, browserGeo } =
    useContext(GeoLocationContext);
  const [triangulatedCountry, setTriangulatedCountry] = useState<string | null>(
    null
  );
  const [pricingData, setPricingData] = useState<PricingContextData | null>(
    null
  );

  // Helper function to format currency based on locale
  const formatCurrency = (amount: string, currency: string) => {
    if (locale === "en") {
      // English: currency before number (e.g., £19)
      return (
        <>
          <span className="text-2xl text-gray-300">{currency}</span>
          <span className="text-8xl font-bold text-white">{amount}</span>
        </>
      );
    } else {
      // Polish: currency after number (e.g., 19 zł)
      return (
        <>
          <span className="text-8xl font-bold text-white">{amount}</span>
          <span className="text-2xl text-gray-300">{currency}</span>
        </>
      );
    }
  };

  useEffect(() => {
    if (isLoaded) {
      const triangulateLocationCallback = async () => {
        console.log("PricingSection useEffect");
        console.log("isLoaded", isLoaded);
        console.log("GEO DATA: ", ipCountry, host, browserGeo);
        const triangulatedCountry = await triangulateLocationOnFe(
          ipCountry,
          host,
          {
            latitude: browserGeo?.latitude,
            longitude: browserGeo?.longitude,
          }
        );

        setTriangulatedCountry(triangulatedCountry);
        setPricingData(getPricingContext(triangulatedCountry || "DEFAULT"));
      };
      triangulateLocationCallback();
    }
  }, [isLoaded, ipCountry, host, browserGeo]);

  useEffect(() => {
    const fetchShowTrial = async () => {
      const showTrial = await shouldShowTrial();
      setShowTrial(showTrial);
    };
    fetchShowTrial();
  }, []);

  const handleClickWithoutOnGetStarted =
    (product: SubscriptionType) => async () => {
      const userEmailFromSessionCookie = await userEmailFromCookie();
      console.log("userEmailFromSessionCookie", userEmailFromSessionCookie);

      if (userEmailFromSessionCookie) {
        const result = await navigateToCheckout(
          product,
          userEmailFromSessionCookie
        );
        if (result?.success) {
          router.push("/trial-success");
        }
      } else {
        router.push(`/?modal=phone`, { scroll: false });
      }
    };

  return (
    <div className="relative py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            {t("pricing-section.title")}
          </h2>
          <p className="text-xl text-blue-200 mb-2">
            {t("pricing-section.subtitle-1")}
          </p>
          <p className="text-2xl text-green-400 font-semibold">
            {`${t("pricing-section.subtitle-2")} ${
              new Date() > new Date("20:59")
                ? t("pricing-section.subtitle-3")
                : t("pricing-section.subtitle-4")
            } ${t("pricing-section.subtitle-5")}`}
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          className={`grid gap-8 mb-12 ${
            showTrial
              ? "md:grid-cols-3"
              : "md:grid-cols-2 md:max-w-4xl md:mx-auto"
          }`}
        >
          {showTrial && (
            <>
              {/* Free Trial */}
              <div className="bg-gray-700/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-600/50 transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 overflow-hidden flex flex-col h-full">
                {/* Header Section */}
                <div className="bg-gray-600/70 px-8 py-6 text-center">
                  <h3 className="text-3xl md:text-2xl font-extrabold text-white mb-2">
                    {t("pricing-section.trial-card.title")}
                  </h3>
                  <p className="text-gray-200 text-lg md:text-sm font-medium">
                    {t("pricing-section.trial-card.duration")}
                  </p>
                </div>

                {/* Content Section */}
                <div className="grid place-content-center grow py-8">
                  <div className="flex items-baseline justify-center">
                    {isLoaded && pricingData ? (
                      formatCurrency("0", pricingData.currency)
                    ) : (
                      <Spinner size="lg" />
                    )}
                  </div>
                  <p className="text-gray-400 text-lg text-center">
                    {t("pricing-section.trial-card.period")}
                  </p>
                </div>

                {/* Button Section */}
                <div className="px-8 pb-8">
                  <button
                    onClick={
                      props.onGetStarted
                        ? props.onGetStarted(SubscriptionType.TRIAL)
                        : handleClickWithoutOnGetStarted(SubscriptionType.TRIAL)
                    }
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-2xl md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {t("pricing-section.trial-card.CTA-button")}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="relative hover:shadow-3xl hover:-translate-y-2 transition-all">
            {/* Subscription */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-red-500 text-white px-4 py-2 rounded-full text-base font-bold whitespace-nowrap">
                {t("pricing-section.subscription-card.tooltip")}
              </div>
            </div>
            <div className="relative bg-blue-900/30 backdrop-blur-sm rounded-2xl shadow-3xl border border-blue-500/30 transition-all duration-300 hover:shadow-3xl overflow-hidden flex flex-col h-full ring-2 ring-blue-400/80 ring-opacity-90 shadow-[0_0_60px_rgba(59,130,246,0.8)]">
              {/* Header Section */}
              <div className="bg-blue-700/50 px-8 py-6 text-center">
                <h3 className="text-3xl md:text-2xl font-extrabold text-white mb-2">
                  {t("pricing-section.subscription-card.title")}
                </h3>
                <p className="text-blue-100 text-lg md:text-sm font-medium">
                  {t("pricing-section.subscription-card.duration")}
                </p>
              </div>

              {/* Content Section */}
              <div className="grid place-content-center grow py-8">
                {isLoaded && pricingData ? (
                  <>
                    <div className="flex items-baseline justify-center">
                      {formatCurrency(
                        pricingData.subscriptionPrice,
                        pricingData.currency
                      )}
                      <span className="text-gray-400">
                        {t("pricing-section.subscription-card.period")}
                      </span>
                    </div>
                    <p className="text-gray-400 text-lg">
                      {t("pricing-section.subscription-card.price1")}
                      {`${+pricingData.subscriptionPrice * 12} ${pricingData.currency}`}
                      {t("pricing-section.subscription-card.price2")}
                    </p>
                  </>
                ) : (
                  <Spinner size="xl" />
                )}
              </div>

              {/* Button Section */}
              <div className="px-8 pb-8">
                <button
                  onClick={
                    props.onGetStarted
                      ? props.onGetStarted(SubscriptionType.MONTHLY)
                      : handleClickWithoutOnGetStarted(SubscriptionType.MONTHLY)
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-2xl md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t("pricing-section.subscription-card.CTA-button")}
                </button>
              </div>
            </div>
          </div>

          {/* One-time Payment - Most Popular */}
          <div className="relative hover:shadow-3xl hover:-translate-y-2 transition-all ">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full text-base font-bold whitespace-nowrap">
                {t("pricing-section.one-time-purchase-card.tooltip")}
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-400/30 duration-300 hover:shadow-3xl overflow-hidden flex flex-col h-full">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-yellow-400/40 to-orange-400/40 px-8 py-6 text-center">
                <h3 className="text-3xl md:text-2xl font-extrabold text-white mb-2">
                  {t("pricing-section.one-time-purchase-card.title")}
                </h3>
                <p className="text-yellow-100 text-lg md:text-sm font-medium">
                  {t("pricing-section.one-time-purchase-card.duration")}
                </p>
              </div>

              {/* Content Section */}
              <div className="grid place-content-center grow py-8">
                <div className="flex items-baseline justify-center">
                  {isLoaded && pricingData ? (
                    formatCurrency(
                      pricingData.oneTimePrice,
                      pricingData.currency
                    )
                  ) : (
                    <Spinner size="xl" />
                  )}
                </div>
                <p className="text-gray-400 text-lg">
                  {t("pricing-section.one-time-purchase-card.period")}
                </p>
              </div>

              {/* Button Section */}
              <div className="px-8 pb-8">
                {isLoaded && pricingData ? (
                  <button
                    onClick={
                      props.onGetStarted
                        ? props.onGetStarted(SubscriptionType.ONE_TIME)
                        : handleClickWithoutOnGetStarted(
                            SubscriptionType.ONE_TIME
                          )
                    }
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-2xl md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {t("pricing-section.one-time-purchase-card.CTA-button") +
                      new Intl.NumberFormat(locale, {
                        style: "currency",
                        currency: pricingData.currency,
                        notation: "compact",
                      }).format(+pricingData.oneTimePrice)}
                  </button>
                ) : (
                  <Spinner size="lg" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
