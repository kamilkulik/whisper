"use client";

import { SubscriptionType } from "@prisma/client";
import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { shouldShowTrial } from "../_actions/showTrial";
import { navigateToCheckout } from "../_actions/navigateToCheckout";
import { useRouter } from "next/navigation";
import { userIdFromCookie } from "../_actions/userFromCookie";
import { useTranslations, useLocale } from "next-intl";
import Spinner from "./Spinner";
import { trackEvent, Event } from "@/lib/fbq";
import { generateEventId } from "@/lib/eventId";
import { getMetaCookies } from "@/lib/metaCookies";
import { getPricingContext } from "../_consts";
import { useUserContext } from "../_contexts/UserContext";


interface PricingSectionProps {
  onGetStarted?: (product: SubscriptionType) => () => Promise<void>;
  userId?: number; // userId will ONLY be passed from /subscribe page
}

const PricingSection = forwardRef<any, PricingSectionProps>(({ onGetStarted, userId }, ref) => {
  const [showTrial, setShowTrial] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );
  // Determine the time-based subtitle on the client only to avoid hydration mismatch.
  // Default to "subtitle-4" (tomorrow) for the initial server/client render,
  // then update on the client after mount if needed.
  const [isAfterCutoff, setIsAfterCutoff] = useState(false);
  const router = useRouter();
  const { phoneNumber: userPhoneNumber } = useUserContext();

  // Expose clearAllLoadingStates to parent component
  useImperativeHandle(ref, () => ({
    clearAllLoadingStates: () => setLoadingStates({}),
  }));

  const t = useTranslations("LandingPage");
  const locale = useLocale();
  const pricingData = getPricingContext("DEFAULT");

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
    const fetchShowTrial = async () => {
      const showTrial = await shouldShowTrial();
      setShowTrial(showTrial);
    };
    fetchShowTrial();
  }, []);

  // Check time on the client after hydration to avoid server/client mismatch
  useEffect(() => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(20, 59, 0, 0);
    setIsAfterCutoff(now > cutoff);
  }, []);

  /**
   * This function is used when onGetStarted is not provided
   * This happens when the user is in their Dashboard and wants to upgrade
   */
  const handleClickWithoutOnGetStarted =
    (product: SubscriptionType) => async () => {
      try {
        const cookieUserId = await userIdFromCookie();
        const retrievedUserId = userId ?? cookieUserId;

        console.log("[ PricingSection ] [ handleClickWithoutOnGetStarted ] retrievedUserId: ", retrievedUserId);

        if (retrievedUserId) {
          const meta =
            product !== SubscriptionType.TRIAL
              ? {
                ...getMetaCookies(),
                eventId: generateEventId("InitiateCheckout"),
                eventSourceUrl: window.location.href,
              }
              : undefined;
          const result = await navigateToCheckout(
            product,
            undefined,
            undefined,
            meta,
            userPhoneNumber ?? undefined,
            retrievedUserId,
          );

          if (result?.success) {
            if (result?.checkoutUrl) {
              window.location.href = result.checkoutUrl;
              return;
            }
            router.push("/trial-success");
          }
        } else {
          router.push(`/?modal=phone`, { scroll: false });
        }
      } catch (error) {
        console.error("Error in handleClickWithoutOnGetStarted:", error);
      }
    };

  // Wrapper function that handles loading state for both onGetStarted and handleClickWithoutOnGetStarted
  const handleButtonClick = (product: SubscriptionType) => async () => {
    if (product !== SubscriptionType.TRIAL) {
      trackEvent(
        Event.InitiateCheckout,
        {},
        { eventID: generateEventId(Event.InitiateCheckout) },
      );
    }
    const productKey = product.toString();

    // Set loading state
    setLoadingStates((prev) => ({ ...prev, [productKey]: true }));

    /**
     * At this point the user is not available from the sessionCookie
     * Because it would not have been saved to the database yet
     * Need to get the user from cookie AFTER they were saved to db
     */
    try {
      if (onGetStarted) {
        // Use the provided onGetStarted callback
        await onGetStarted(product)();
      } else {
        // Use the default handler
        await handleClickWithoutOnGetStarted(product)();
      }

      // Loading state will be cleared by parent component when modal opens
      // via the ref and useImperativeHandle
    } catch (error) {
      console.error("Error in handleButtonClick:", error);
      // Clear loading state on error
      setLoadingStates((prev) => ({ ...prev, [productKey]: false }));
    }
  };

  const subtitleTimeVariant = isAfterCutoff
    ? t("pricing-section.subtitle-3")
    : t("pricing-section.subtitle-4");

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
            {`${t("pricing-section.subtitle-2")} ${subtitleTimeVariant} ${t("pricing-section.subtitle-5")}`}
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          className={`grid gap-8 mb-12 ${showTrial
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
                    {pricingData ? (
                      formatCurrency("0", pricingData.currency)
                    ) : (
                      <Spinner size="xl" />
                    )}
                  </div>
                  <p className="text-gray-400 text-lg text-center">
                    {t("pricing-section.trial-card.period")}
                  </p>
                </div>

                {/* Button Section */}
                <div className="px-8 pb-8">
                  <button
                    onClick={handleButtonClick(SubscriptionType.TRIAL)}
                    disabled={loadingStates[SubscriptionType.TRIAL]}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-2xl md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingStates[SubscriptionType.TRIAL] ? (
                      <>
                        <Spinner size="sm" />
                        {t("pricing-section.trial-card.CTA-button")}
                      </>
                    ) : (
                      t("pricing-section.trial-card.CTA-button")
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="relative hover:shadow-3xl hover:-translate-y-2 transition-all">
            {/* Subscription */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-[2]">
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
                {pricingData ? (
                  <>
                    <div className="flex items-baseline justify-center">
                      {formatCurrency(
                        pricingData.subscriptionPrice,
                        pricingData.currency,
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
              <div className="px-8 pb-8 flex justify-center">
                {pricingData ? (
                  <button
                    onClick={handleButtonClick(SubscriptionType.MONTHLY)}
                    disabled={loadingStates[SubscriptionType.MONTHLY]}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-2xl md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingStates[SubscriptionType.MONTHLY] ? (
                      <>
                        <Spinner size="sm" />
                        {t("pricing-section.subscription-card.CTA-button")}
                      </>
                    ) : (
                      t("pricing-section.subscription-card.CTA-button")
                    )}
                  </button>
                ) : (
                  <Spinner size="lg" />
                )}
              </div>
            </div>
          </div>

          {/* One-time Payment - Most Popular */}
          <div className="relative hover:shadow-3xl hover:-translate-y-2 transition-all ">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-[2]">
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
                  {pricingData ? (
                    formatCurrency(
                      pricingData.oneTimePrice,
                      pricingData.currency,
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
              <div className="px-8 pb-8 flex justify-center">
                {pricingData ? (
                  <button
                    onClick={handleButtonClick(SubscriptionType.ONE_TIME)}
                    disabled={loadingStates[SubscriptionType.ONE_TIME]}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 disabled:from-gray-400 disabled:to-gray-500 text-gray-900 disabled:text-gray-500 font-bold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-2xl md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingStates[SubscriptionType.ONE_TIME] ? (
                      <>
                        <Spinner size="sm" />
                        {t(
                          "pricing-section.one-time-purchase-card.CTA-button",
                        ) +
                          new Intl.NumberFormat(locale, {
                            style: "currency",
                            currency: pricingData.currency,
                            notation: "compact",
                          }).format(+pricingData.oneTimePrice)}
                      </>
                    ) : (
                      t("pricing-section.one-time-purchase-card.CTA-button") +
                      new Intl.NumberFormat(locale, {
                        style: "currency",
                        currency: pricingData.currency,
                        notation: "compact",
                      }).format(+pricingData.oneTimePrice)
                    )}
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
});

PricingSection.displayName = "PricingSection";

export default PricingSection;
