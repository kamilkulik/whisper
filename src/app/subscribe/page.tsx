// server component
import { getUserFromSessionId } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PricingSection from "../_components/PricingSection";
import { SubscriptionType } from "@prisma/client";

export default async function SubscribePage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId");

  if (!sessionId) {
    redirect("/?modal=login");
  }

  const userFromSession = await getUserFromSessionId(sessionId.value);

  if (!userFromSession) {
    redirect("/?modal=login");
  }

  const handleStartJourney = (productType?: SubscriptionType) => {
    // This will be handled by the PricingSection component
    console.log("Start Journey clicked!", productType);
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl p-8 backdrop-blur-sm relative z-50">
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <a
              href="/dashboard"
              className="flex items-center text-white/80 hover:text-white transition-colors duration-200 mr-6"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Powrót do panelu
            </a>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Wybierz Plan Subskrypcji
          </h1>
          <p className="text-white/80">
            Wybierz plan, który najlepiej pasuje do Twoich potrzeb
          </p>
        </div>

        <div className="bg-transparent">
          <PricingSection onGetStarted={handleStartJourney} />
        </div>
      </div>
    </div>
  );
}
