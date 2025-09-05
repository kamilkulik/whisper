"use client";

import { useState } from "react";
import { ModalWrapper } from "./ModalWrapper";
import { useRouter } from "next/navigation";
import { Subscription } from "@prisma/client";

interface ResumeSubscriptionButtonProps {
  subscription: Subscription;
}

export default function ResumeSubscriptionButton({
  subscription,
}: ResumeSubscriptionButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResumeClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmResume = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API endpoint when ready
      const response = await fetch("/api/subscriptions/resume", {
        method: "POST",
      });

      if (response.ok) {
        setIsLoading(false);
        setShowConfirmation(false);
        router.push("/dashboard");
      } else {
        console.error("Failed to resume subscription");
        setIsLoading(false);
        setShowConfirmation(false);
      }
    } catch (error) {
      console.error("Error resuming subscription:", error);
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmation(false);
  };

  // Calculate next billing date (one month from current expiration date)
  const getNextBillingDate = () => {
    if (!subscription.dateExpires) return null;

    const nextBillingDate = new Date(subscription.dateExpires);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    return nextBillingDate.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const nextBillingDate = getNextBillingDate();

  return (
    <>
      <button
        onClick={handleResumeClick}
        className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-semibold px-8 py-4 rounded-lg text-2xl transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
      >
        Wznów teraz
      </button>

      {showConfirmation && (
        <ModalWrapper
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          modalId="resume-confirmation"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl p-12 backdrop-blur-sm max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-white/80 mb-6 text-center">
              Wznów subskrypcję
            </h3>

            <div className="text-white/70 mb-6 text-center space-y-3">
              <p>
                Kontynuując, wznawiasz automatyczne pobieranie opłat z Twojej
                metody płatności.
              </p>
              {nextBillingDate && (
                <p className="font-semibold text-orange-400">
                  Następna płatność: {nextBillingDate}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleConfirmResume}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Wznawianie..." : "Wznów"}
              </button>

              <button
                onClick={handleCloseModal}
                disabled={isLoading}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
              >
                Anuluj
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </>
  );
}
