"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "../_contexts/LocaleContext";
import { SubscriptionType, SupportedLanguagesEnum } from "@prisma/client";
import { CheckoutSessionsPayload } from "../api/checkout-sessions/route";
import { getMetaCookies } from "@/lib/metaCookies";
import { generateEventId } from "@/lib/eventId";
import { GatheredUserData, prepSaveUserBody } from "./utils/saveUserBodyPrep";
import { useTranslations } from "next-intl";
import { languageOptions, deliveryHourOptions, DEFAULT_DELIVERY_HOUR } from "../_consts";
import { UserData } from "../api/users/route";
import { useUserContext } from "../_contexts/UserContext";

export default function ContactForm({
  isEmailVerified,
  selectedProduct,
  verifiedPhoneNumber = "",
}: {
  isEmailVerified?: {
    isEmailVerified: boolean;
    email: string;
  };
  selectedProduct: SubscriptionType | null;
  verifiedPhoneNumber?: string;
}) {
  const { language, countryCode, isLoaded } = useLocale();
  const { setPhoneNumber } = useUserContext();
  const t = useTranslations("Components.ContactForm");

  const [formData, setFormData] = useState<GatheredUserData>({

    deliveryHour: DEFAULT_DELIVERY_HOUR,
    email:
      isEmailVerified?.isEmailVerified && isEmailVerified.email
        ? isEmailVerified.email
        : undefined,
    messageLanguage: SupportedLanguagesEnum.PL, // Default fallback
    phoneNumber: verifiedPhoneNumber,
    product: SubscriptionType.TRIAL,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Update form data when locale context is loaded
  useEffect(() => {
    if (isLoaded) {
      setFormData((prev) => ({
        ...prev,
        countryCode,
        messageLanguage:
          languageOptions.find((o) => o.label === language)?.value ||
          SupportedLanguagesEnum.PL,
      }));
    }
  }, [isLoaded, countryCode, language]);

  const handleLanguageSelect = (language: SupportedLanguagesEnum) => {
    setFormData((prev) => ({
      ...prev,
      messageLanguage: language,
    }));
    setIsLanguageDropdownOpen(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    setIsSubmitting(true);

    try {
      // First, save the contact information
      const body = prepSaveUserBody({
        deliveryHour: formData.deliveryHour,
        email: isEmailVerified?.isEmailVerified
          ? isEmailVerified.email
          : undefined,
        emailVerified: isEmailVerified?.isEmailVerified,
        messageLanguage: formData.messageLanguage,
        phoneNumber: formData.phoneNumber,
        product: selectedProduct,
      });
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        // Store verified phone number in user context for downstream use
        if (formData.phoneNumber) {
          setPhoneNumber(formData.phoneNumber);
        }

        // Clear the form
        setFormData({
          deliveryHour: DEFAULT_DELIVERY_HOUR,
          messageLanguage: SupportedLanguagesEnum.EN,
          phoneNumber: verifiedPhoneNumber,
          product: SubscriptionType.TRIAL,
        });

        // redirect to the pricing page
        if (selectedProduct === null) {
          setMessage(t("form-submit-success"));
          setTimeout(() => {
            window.location.href = `/ritual/${verifiedPhoneNumber}`;
          }, 1500);
          // If it's a trial, redirect to trial success page
        } else if (selectedProduct === SubscriptionType.TRIAL) {
          setMessage(t("form-submit-success"));
          setTimeout(() => {
            window.location.href = `/trial-success?eventId=${data.fbEventId}`;
          }, 1500);
        } else {
          // For other products, redirect to Stripe checkout
          setMessage(t("form-submit-checkout"));

          const cookies = getMetaCookies();
          const checkoutSessionsPayload: CheckoutSessionsPayload = {
            clientReferenceId: verifiedPhoneNumber,
            productType: selectedProduct || SubscriptionType.TRIAL,
            email: isEmailVerified?.email || "",
            fbp: cookies.fbp,
            fbc: cookies.fbc,
            eventId: generateEventId("Purchase"),
            eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
          };

          console.log("[ ContactForm ] [ handleSubmit ] checkoutSessionsPayload: ", checkoutSessionsPayload);

          setTimeout(async () => {
            try {
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
                setMessage(t("form-submit-checkout-error"));
              }
            } catch (error) {
              setMessage(t("form-submit-checkout-error"));
            }
          }, 1500);
        }
      } else {
        if (response.status === 401) {
          setMessage("Your secure session has expired. Please verify your phone number again to save these changes");
        } else {
          // Display the error message from the API response
          setMessage(data.error || t("form-submit-error"));
        }
      }
    } catch (error) {
      setMessage(t("form-submit-error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="max-w-md mx-auto bg-gray-800/60 rounded-2xl shadow-xl p-8 backdrop-blur-sm relative z-50"
      data-oid="tb00.87"
    >
      <div className="mb-8 lg:mb-4" data-oid="fv3gut-">
        <h3
          className="text-3xl lg:text-2xl text-center font-bold text-white mb-2"
          data-oid="8cie_js"
        >
          {t("form-title")}
        </h3>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 md:max-lg:space-y-8 lg:space-y-4"
        data-oid="d937n0b"
      >

        {/* Delivery Hour */}
        <div>
          <label
            htmlFor="deliveryHour"
            className="block text-white font-medium mb-2 text-xl lg:text-base"
          >
            {t("form-label-delivery-hour")}
          </label>
          <select
            id="deliveryHour"
            value={formData.deliveryHour}
            onChange={(e) => setFormData((prev) => ({ ...prev, deliveryHour: parseInt(e.target.value, 10) }))}
            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
            required
          >
            {deliveryHourOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-gray-800 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div data-oid="isekqo7">
          <label
            htmlFor="messageLanguage"
            className="block text-white font-medium mb-2 text-xl lg:text-base"
            data-oid="2ox.qfi"
          >
            {t("form-label-message-language")}
          </label>
          <div
            className="relative"
            ref={languageDropdownRef}
            data-oid="h.ueg:n"
          >
            <button
              type="button"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="w-full px-6 py-1 md:py-3 bg-white/20 border-0 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm pr-10 text-left lg:text-base"
              data-oid="c3lmv88"
            >
              {languageOptions.find(
                (option) => option.value === formData.messageLanguage
              )?.label || formData.messageLanguage}
            </button>
            <div
              className="absolute inset-y-0 right-3 flex items-center pointer-events-none"
              data-oid="inff.oj"
            >
              <svg
                className={`w-4 h-4 text-white transition-transform ${isLanguageDropdownOpen ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-oid="a.h8uxr"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                  data-oid="ql5uhso"
                />
              </svg>
            </div>
            {isLanguageDropdownOpen && (
              <div
                className="absolute top-full mt-1 bg-gray-800 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto w-full"
                data-oid="80si7nt"
              >
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleLanguageSelect(option.value)}
                    className={`w-full px-6 py-3 text-2xl md:text-lg text-left text-white hover:bg-gray-700 first:rounded-t-2xl last:rounded-b-2xl transition-colors ${formData.messageLanguage === option.value
                      ? "bg-gray-700"
                      : ""
                      }`}
                    data-oid=":i4l0zm"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center" data-oid=".8bq7bo">
          <div
            className="flex-1 border-t border-gray-600"
            data-oid="-w4krbe"
          ></div>
          <div
            className="flex-1 border-t border-gray-600"
            data-oid="121n8te"
          ></div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-xl shadow-lg"
          data-oid="yomb8ur"
        >
          {isSubmitting
            ? t("form-submit-button-loading")
            : t("form-submit-button")}
        </button>

        <p className="text-center text-sm text-white/50 mt-3">
          {t("form-terms-of-service-1")}{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/70 transition-colors"
          >
            {t("form-terms-of-service-2")}
          </a>
        </p>
      </form>

      {message && (
        <div
          className={`mt-4 p-4 rounded-2xl text-sm backdrop-blur-sm ${t("form-submit-success").includes(message) ||
            t("form-submit-checkout").includes(message)
            ? "bg-green-500/20 text-green-100 border border-green-400/30"
            : "bg-red-500/20 text-red-100 border border-red-400/30"
            }`}
          data-oid="5_mxp_h"
        >
          {message}
        </div>
      )}
    </div>
  );
}
