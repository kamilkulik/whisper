"use client";

import { useState } from "react";
import { ModalWrapper } from "./ModalWrapper";
import { Subscription, SubscriptionType } from "@prisma/client";
import { useTranslations } from "next-intl";

interface CancelSubscriptionButtonProps {
  subscription: Subscription;
}

export default function CancelSubscriptionButton({
  subscription,
}: CancelSubscriptionButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Components.CancelSubscriptionButton");

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
        }, 400);
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
        className="bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-red-100 font-medium px-6 py-3 rounded-lg text-sm transition-all duration-300 inline-block border border-red-400/30 hover:border-red-400/50 cursor-pointer"
      >
        {t("CTA-button")}
      </button>

      {showConfirmation && (
        <ModalWrapper
          description={t("confirm-modal.description")}
          isOpen={showConfirmation}
          modalId="cancel-confirmation"
          onClose={handleCloseModal}
          title={t("confirm-modal.title")}
        >
          <div className="bg-gray-800/80 rounded-2xl shadow-xl p-12 backdrop-blur-sm max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-white/80 mb-6 text-center">
              {t("confirm-modal.title")}
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleConfirmCancel}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? t("confirm-modal.loading")
                  : t("confirm-modal.CTA-button")}
              </button>

              <button
                onClick={handleCloseModal}
                disabled={isLoading}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
              >
                {t("confirm-modal.cancel-button")}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </>
  );
}
