"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "../_contexts/LocaleContext";
import { z } from "zod";
import DOMPurify from "dompurify";
import { SubscriptionType, SupportedLanguagesEnum } from "@prisma/client";
import { CheckoutSessionsPayload } from "../api/checkout-sessions/route";
import { GatheredUserData, prepSaveUserBody } from "./utils/saveUserBodyPrep";
import { useTranslations } from "next-intl";
import { languageOptions } from "../_consts";

// Validation schema
const localisedFormSchema = (
  t: Awaited<ReturnType<typeof useTranslations>>
) => {
  return z.object({
    // E.164 format: +[country code][number], e.g., +48791321431
    phoneNumber: z
      .string()
      .min(8, t("form-validation-errors.phone-number.min"))
      .max(16, t("form-validation-errors.phone-number.max"))
      .regex(/^\+[1-9]\d{6,14}$/, t("form-validation-errors.phone-number.regex")),
    name: z
      .string()
      .min(2, t("form-validation-errors.name.min"))
      .max(50, t("form-validation-errors.name.max"))
      .regex(
        /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s'-]+$/,
        t("form-validation-errors.name.regex")
      ),
    email: z
      .string()
      .min(1, t("form-validation-errors.email.min"))
      .max(254, t("form-validation-errors.email.max"))
      .email(t("form-validation-errors.email.email")),
  });
};

type ValidationErrors = {
  name?: string;
  email?: string;
};

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
  const t = useTranslations("Components.ContactForm");

  const [formData, setFormData] = useState<
    GatheredUserData & { acceptTerms: boolean }
  >({
    acceptTerms: false,
    email:
      isEmailVerified?.isEmailVerified && isEmailVerified.email
        ? isEmailVerified.email
        : "",
    messageLanguage: SupportedLanguagesEnum.PL, // Default fallback
    name: "",
    phoneNumber: verifiedPhoneNumber,
    product: SubscriptionType.TRIAL,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // const languageOptions = [
  //   { code: SupportedLanguagesEnum.PL, name: "Polski" },
  //   // { code: SupportedLanguagesEnum.EN, name: "English" },
  //   //   { code: SupportedLanguagesEnum.ES, name: "Español" },
  //   //   { code: SupportedLanguagesEnum.IT, name: "Italiano" },
  // ];

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

  // Sanitize input function
  const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input.trim());
  };

  // Validate single field
  const validateField = (
    fieldName: keyof ValidationErrors,
    value: string
  ): string | undefined => {
    try {
      const fieldSchema = localisedFormSchema(t).shape[fieldName];
      fieldSchema.parse(value);
      return undefined; // No error
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message;
      }
      return t("form-validation-errors.validation-error");
    }
  };

  // Handle input blur with validation and sanitization
  const handleInputBlur = (
    fieldName: keyof ValidationErrors,
    value: string
  ) => {
    const sanitizedValue = sanitizeInput(value);
    const error = validateField(fieldName, sanitizedValue);

    // Update form data with sanitized value
    setFormData((prev) => ({
      ...prev,
      [fieldName]: sanitizedValue,
    }));

    // Update validation errors
    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  // Clear validation error when user starts typing
  const clearValidationError = (fieldName: keyof ValidationErrors) => {
    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => ({
        ...prev,
        [fieldName]: undefined,
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Validate terms and conditions acceptance
    if (!formData.acceptTerms) {
      setMessage(t("form-submit-terms-of-service"));
      return;
    }

    // Validate all input fields
    const sanitizedData = {
      name: sanitizeInput(formData.name),
      email: sanitizeInput(formData.email.toLowerCase()),
      phoneNumber: sanitizeInput(formData.phoneNumber || ""),
    };

    const errors: ValidationErrors = {};
    Object.entries(sanitizedData).forEach(([key, value]) => {
      const error = validateField(
        key as keyof ValidationErrors,
        value as string
      );
      if (error) {
        errors[key as keyof ValidationErrors] = error;
      }
    });

    // If there are validation errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setMessage(t("form-validation-errors.form-submit"));
      return;
    }

    // Update form data with sanitized values
    setFormData((prev) => ({
      ...prev,
      ...sanitizedData,
    }));

    setIsSubmitting(true);

    try {
      // First, save the contact information
      const body = prepSaveUserBody({
        email: sanitizedData.email,
        emailVerified: isEmailVerified?.isEmailVerified,
        messageLanguage: formData.messageLanguage,
        name: sanitizedData.name,
        phoneNumber: sanitizedData.phoneNumber,
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
        // Clear the form
        setFormData({
          email: "",
          name: "",
          messageLanguage: SupportedLanguagesEnum.PL,
          acceptTerms: false,
          phoneNumber: verifiedPhoneNumber,
          product: SubscriptionType.TRIAL,
        });

        // redirect to the pricing page
        if (selectedProduct === null) {
          setMessage(t("form-submit-success"));
          setTimeout(() => {
            window.location.href = "/subscribe";
          }, 1500);
          // If it's a trial, redirect to trial success page
        } else if (selectedProduct === SubscriptionType.TRIAL) {
          setMessage(t("form-submit-success"));
          setTimeout(() => {
            window.location.href = "/trial-success";
          }, 1500);
        } else {
          // For other products, redirect to Stripe checkout
          setMessage(t("form-submit-checkout"));
          const checkoutSessionsPayload: CheckoutSessionsPayload = {
            productType: selectedProduct || SubscriptionType.TRIAL,
            email: sanitizedData.email,
          };
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
        setMessage(data.error || t("form-submit-error"));
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
        <div data-oid="1x7_v4l">
          <label
            htmlFor="name"
            className="block text-white font-medium mb-2 text-xl lg:text-base"
            data-oid="er2p-26"
          >
            {t("form-label-name")}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => {
              handleChange(e);
              clearValidationError("name");
            }}
            onBlur={(e) => handleInputBlur("name", e.target.value)}
            required
            className={`w-full px-6 py-1 md:py-3 bg-white/20 border-0 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 backdrop-blur-sm placeholder:text-xl lg:text-base ${
              validationErrors.name
                ? "focus:ring-red-500/50 ring-2 ring-red-500/30"
                : "focus:ring-white/30"
            }`}
            placeholder={t("form-placeholder-name")}
            data-oid="6qn7m1j"
          />

          {validationErrors.name && (
            <p className="mt-1 text-lg text-red-300" data-oid="669b2e6">
              {validationErrors.name}
            </p>
          )}
        </div>

        {!isEmailVerified?.isEmailVerified && (
          <div data-oid="u4p0sqc">
            <label
              htmlFor="email"
              className="block text-white font-medium mb-2 text-xl lg:text-base"
              data-oid="cvsh.:4"
            >
              {t("form-label-email")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                handleChange(e);
                clearValidationError("email");
              }}
              onBlur={(e) => handleInputBlur("email", e.target.value)}
              required
              className={`w-full px-6 py-1 md:py-3 bg-white/20 border-0 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 backdrop-blur-sm placeholder:text-2xl lg:text-base ${
                validationErrors.email
                  ? "focus:ring-red-500/50 ring-2 ring-red-500/30"
                  : "focus:ring-white/30"
              }`}
              placeholder={t("form-placeholder-email")}
              data-oid="253.e9u"
            />

            {validationErrors.email && (
              <p className="mt-1 text-lg text-red-300" data-oid="k51k.9b">
                {validationErrors.email}
              </p>
            )}
          </div>
        )}

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
                className={`w-4 h-4 text-white transition-transform ${
                  isLanguageDropdownOpen ? "rotate-180" : ""
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
                    className={`w-full px-6 py-3 text-2xl md:text-lg text-left text-white hover:bg-gray-700 first:rounded-t-2xl last:rounded-b-2xl transition-colors ${
                      formData.messageLanguage === option.value
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
          {/* <span className="px-3 text-sm text-gray-400">lub</span> */}
          <div
            className="flex-1 border-t border-gray-600"
            data-oid="121n8te"
          ></div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div
          className={`flex items-center space-x-3 ${
            !formData.acceptTerms &&
            (message.includes("regulamin") || message.includes("terms"))
              ? "p-3 border border-red-300 rounded-2xl bg-red-500/20"
              : ""
          }`}
          data-oid="jl32i:-"
        >
          <input
            type="checkbox"
            id="acceptTerms"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            required
            className={`h-5 w-5 text-white focus:ring-white/30 rounded ${
              !formData.acceptTerms &&
              (message.includes("regulamin") || message.includes("terms"))
                ? "border-red-500 focus:ring-red-500"
                : "border-white/30 bg-white/20"
            }`}
            data-oid="5lzh77p"
          />

          <label
            htmlFor="acceptTerms"
            className="text-lg text-white/90"
            data-oid="qbo8wve"
          >
            {t("form-terms-of-service-1")}{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline hover:text-white/80"
              data-oid="3mi774b"
            >
              {t("form-terms-of-service-2")}
            </a>
          </label>
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
      </form>

      {message && (
        <div
          className={`mt-4 p-4 rounded-2xl text-sm backdrop-blur-sm ${
            t("form-submit-success").includes(message) ||
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
