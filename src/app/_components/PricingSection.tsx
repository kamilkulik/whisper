"use client";

import { SubscriptionType } from "@prisma/client";
import { CheckoutSessionsPayload } from "../api/checkout-sessions/route";

interface PricingSectionProps {
  onGetStarted?: (productType?: SubscriptionType) => void;
  showTrial?: boolean;
}

async function navigateToCheckout(productType: SubscriptionType) {
  const sessionIdCookie = { value: "123" };
  // const user = await getUserFromSessionId(sessionIdCookie.value);
  const userEmail = "test@test.com";
  try {
    const checkoutSessionsPayload: CheckoutSessionsPayload = {
      productType: productType || SubscriptionType.TRIAL,
      email: userEmail,
    };
    const checkoutResponse = await fetch("/api/checkout-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutSessionsPayload),
    });

    if (checkoutResponse.ok) {
      const { url } = await checkoutResponse.json();
      if (url) {
        window.location.href = url;
      }
    } else {
      console.error("Wystąpił błąd podczas tworzenia sesji płatności.");
    }
  } catch (error) {
    console.error("Wystąpił błąd podczas tworzenia sesji płatności.");
  }
}

export default function PricingSection({
  onGetStarted,
  showTrial = false,
}: PricingSectionProps) {
  let handleGetStarter;

  if (onGetStarted) {
    handleGetStarter = onGetStarted;
  } else {
    handleGetStarter = navigateToCheckout;
  }

  return (
    <div className="relative py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Chwila ciepła i dobrych słów
          </h2>
          <p className="text-xl text-blue-200 mb-2">
            Wybierz najbardziej dogodną opcję
          </p>
          <p className="text-2xl text-green-400 font-semibold">
            aby otrzymać swój pierwszy szept już dziś wieczorem
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
                    Okres Próbny
                  </h3>
                  <p className="text-gray-200 text-lg md:text-sm font-medium">
                    7 DNI
                  </p>
                </div>

                {/* Content Section */}
                <div className="grid place-content-center grow py-8">
                  <div className="flex items-baseline">
                    <span className="text-8xl font-bold text-white">0</span>
                    <span className="text-2xl text-gray-300">zł</span>
                  </div>
                  <p className="text-gray-400 text-lg text-center">
                    przez 7 dni
                  </p>
                </div>

                {/* Button Section */}
                <div className="px-8 pb-8">
                  <button
                    onClick={() => handleGetStarter(SubscriptionType.TRIAL)}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-2xl md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Rozpocznij okres próbny
                  </button>
                </div>
              </div>
            </>
          )}

          {/* One-time Payment - Most Popular */}
          <div className="relative hover:shadow-3xl hover:-translate-y-2 transition-all ">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full text-base font-bold whitespace-nowrap">
                najczęściej wybierany
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-400/30 duration-300 hover:shadow-3xl overflow-hidden flex flex-col h-full">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-yellow-400/40 to-orange-400/40 px-8 py-6 text-center">
                <h3 className="text-3xl md:text-2xl font-extrabold text-white mb-2">
                  Jednorazowa Płatność
                </h3>
                <p className="text-yellow-100 text-lg md:text-sm font-medium">
                  30 DNI WIECZORNYCH SZEPTÓW
                </p>
              </div>

              {/* Content Section */}
              <div className="grid place-content-center grow py-8">
                <div className="flex items-baseline">
                  <span className="text-8xl font-bold text-white">19</span>
                  <span className="text-2xl text-gray-300">zł</span>
                </div>
                <p className="text-gray-400 text-lg">jednorazowo</p>
              </div>

              {/* Button Section */}
              <div className="px-8 pb-8">
                <button
                  onClick={() => handleGetStarter(SubscriptionType.ONE_TIME)}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-2xl md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Kup za 19 zł
                </button>
              </div>
            </div>
          </div>

          <div className="relative hover:shadow-3xl hover:-translate-y-2 transition-all">
            {/* Subscription */}
            {/* Requires Card Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-red-500 text-white px-4 py-2 rounded-full text-base font-bold whitespace-nowrap">
                wymaga karty
              </div>
            </div>
            <div className="relative bg-blue-900/30 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-500/30 transition-all duration-300 hover:shadow-3xl overflow-hidden flex flex-col h-full">
              {/* Header Section */}
              <div className="bg-blue-700/50 px-8 py-6 text-center">
                <h3 className="text-3xl md:text-2xl font-extrabold text-white mb-2">
                  Subskrypcja
                </h3>
                <p className="text-blue-100 text-lg md:text-sm font-medium">
                  MIESIĘCZNA
                </p>
              </div>

              {/* Content Section */}
              <div className="grid place-content-center grow py-8">
                <div className="flex items-baseline">
                  <span className="text-8xl font-bold text-white">19</span>
                  <span className="text-2xl text-gray-300">zł</span>
                  <span className="text-gray-400">/ miesiąc</span>
                </div>
                <p className="text-gray-400 text-lg">równowartość 228 zł/rok</p>
              </div>

              {/* Button Section */}
              <div className="px-8 pb-8">
                <button
                  onClick={() => handleGetStarter(SubscriptionType.MONTHLY)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-2xl md:text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Rozpocznij subskrypcję
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
