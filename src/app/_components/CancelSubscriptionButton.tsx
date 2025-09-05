"use client";

import { useState } from "react";
import { ModalWrapper } from "./ModalWrapper";
import { Subscription, SubscriptionType } from "@prisma/client";

interface CancelSubscriptionButtonProps {
  subscription: Subscription;
}

export default function CancelSubscriptionButton({
  subscription,
}: CancelSubscriptionButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmCancel = async () => {
    setIsLoading(true);
    try {
      const url =
        subscription.type === SubscriptionType.ONE_TIME
          ? "/api/payments/refund"
          : "/api/subscriptions";
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (response.ok) {
        setTimeout(() => {
          setIsLoading(false);
          setShowConfirmation(false);
          window.location.reload();
        }, 300);
      } else {
        console.error("Failed to cancel subscription");
        setIsLoading(false);
        setShowConfirmation(false);
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <button
        onClick={handleCancelClick}
        className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
      >
        Anuluj subskrypcję
      </button>

      {showConfirmation && (
        <ModalWrapper
          isOpen={showConfirmation}
          onClose={handleCloseModal}
          modalId="cancel-confirmation"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl p-12 backdrop-blur-sm max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-white/80 mb-6 text-center">
              Czy na pewno chcesz wstrzymać otrzymywanie wiadomości?
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleConfirmCancel}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Anulowanie..." : "TAK"}
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
