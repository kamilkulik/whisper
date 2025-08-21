"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "../contexts/LocaleContext";
import { z } from "zod";
import DOMPurify from "dompurify";
import { SupportedLanguagesEnum } from "@prisma/client";
import { CheckoutSessionsPayload } from "../api/checkout-sessions/route";

// Validation schema
const formSchema = z.object({
  numerTelefonu: z
    .string()
    .min(6, "Numer telefonu musi mieć co najmniej 6 cyfr")
    .max(15, "Numer telefonu nie może być dłuższy niż 15 cyfr")
    .regex(
      /^[0-9\s\-]+$/,
      "Numer telefonu może zawierać tylko cyfry, spacje, myślniki"
    ),
  imie: z
    .string()
    .min(2, "Imię musi mieć co najmniej 2 znaki")
    .max(50, "Imię nie może być dłuższe niż 50 znaków")
    .regex(
      /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s'-]+$/,
      "Imię może zawierać tylko litery, spacje, myślniki i apostrofy"
    ),
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .max(254, "Email jest za długi")
    .email("Nieprawidłowy format email"),
});

type ValidationErrors = {
  imie?: string;
  email?: string;
};

export default function ContactForm({
  verifiedPhoneNumber = "",
  selectedProduct = null,
}: {
  verifiedPhoneNumber?: string;
  selectedProduct?: "trial" | "one-time" | "subscription" | null;
}) {
  const { language, countryCode, isLoaded } = useLocale();

  const [formData, setFormData] = useState({
    email: "",
    imie: "",
    jezykWiadomosci: "Polski", // Default fallback
    acceptTerms: false,
    numerTelefonu: verifiedPhoneNumber,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const languageOptions = [
    { code: SupportedLanguagesEnum.PL, name: "Polski" },
    { code: SupportedLanguagesEnum.EN, name: "English" },
    { code: SupportedLanguagesEnum.ES, name: "Español" },
    { code: SupportedLanguagesEnum.IT, name: "Italiano" },
  ];

  // Update form data when locale context is loaded
  useEffect(() => {
    if (isLoaded) {
      setFormData((prev) => ({
        ...prev,
        countryCode: countryCode,
        jezykWiadomosci: language,
      }));
    }
  }, [isLoaded, countryCode, language]);

  const handleLanguageSelect = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      jezykWiadomosci: language,
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
      const fieldSchema = formSchema.shape[fieldName];
      fieldSchema.parse(value);
      return undefined; // No error
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message;
      }
      return "Błąd walidacji";
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
      setMessage("Musisz zaakceptować regulamin usługi, aby kontynuować.");
      return;
    }

    // Validate all input fields
    const sanitizedData = {
      imie: sanitizeInput(formData.imie),
      email: sanitizeInput(formData.email.toLowerCase()),
      numerTelefonu: sanitizeInput(formData.numerTelefonu || ""),
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
      setMessage("Proszę poprawić błędy w formularzu.");
      console.log(errors);
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
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imie: sanitizedData.imie,
          email: sanitizedData.email,
          numerTelefonu: sanitizedData.numerTelefonu,
          messageLanguage: formData.jezykWiadomosci,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear the form
        setFormData({
          email: "",
          imie: "",
          jezykWiadomosci: language,
          acceptTerms: false,
          numerTelefonu: verifiedPhoneNumber,
        });

        // If it's a trial, redirect to trial success page
        if (selectedProduct === "trial") {
          setMessage("Informacje zapisane! Przekierowywanie...");
          setTimeout(() => {
            window.location.href = `/trial-success?email=${encodeURIComponent(
              sanitizedData.email
            )}`;
          }, 1500);
        } else {
          // For other products, redirect to Stripe checkout
          setMessage("Informacje zapisane! Przekierowywanie do kasy...");
          const checkoutSessionsPayload: CheckoutSessionsPayload = {
            productType: selectedProduct || "trial",
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
                setMessage("Wystąpił błąd podczas tworzenia sesji płatności.");
              }
            } catch (error) {
              setMessage("Wystąpił błąd podczas tworzenia sesji płatności.");
            }
          }, 1500);
        }
      } else {
        setMessage(data.error || "Wystąpił błąd podczas wysyłania wiadomości.");
      }
    } catch (error) {
      setMessage("Wystąpił błąd podczas wysyłania wiadomości.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="max-w-md mx-auto bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl p-8 backdrop-blur-sm relative z-50"
      data-oid="tb00.87"
    >
      <div className="mb-8" data-oid="fv3gut-">
        <h3
          className="text-3xl text-center font-bold text-white mb-2"
          data-oid="8cie_js"
        >
          Potrzebujemy jeszcze kilku informacji
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" data-oid="d937n0b">
        <div data-oid="1x7_v4l">
          <label
            htmlFor="imie"
            className="block text-white font-medium mb-2 text-xl"
            data-oid="er2p-26"
          >
            Imię *
          </label>
          <input
            type="text"
            id="imie"
            name="imie"
            value={formData.imie}
            onChange={(e) => {
              handleChange(e);
              clearValidationError("imie");
            }}
            onBlur={(e) => handleInputBlur("imie", e.target.value)}
            required
            className={`w-full h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 backdrop-blur-sm placeholder:text-2xl ${
              validationErrors.imie
                ? "focus:ring-red-500/50 ring-2 ring-red-500/30"
                : "focus:ring-white/30"
            }`}
            placeholder="Wpisz swoje imię"
            data-oid="6qn7m1j"
          />

          {validationErrors.imie && (
            <p className="mt-1 text-sm text-red-300" data-oid="669b2e6">
              {validationErrors.imie}
            </p>
          )}
        </div>

        <div data-oid="u4p0sqc">
          <label
            htmlFor="email"
            className="block text-white font-medium mb-2 text-xl"
            data-oid="cvsh.:4"
          >
            Adres email *
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
            className={`w-full h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 backdrop-blur-sm placeholder:text-2xl ${
              validationErrors.email
                ? "focus:ring-red-500/50 ring-2 ring-red-500/30"
                : "focus:ring-white/30"
            }`}
            placeholder="np. jan.kowalski@email.com"
            data-oid="253.e9u"
          />

          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-300" data-oid="k51k.9b">
              {validationErrors.email}
            </p>
          )}
        </div>

        <div data-oid="isekqo7">
          <label
            htmlFor="jezykWiadomosci"
            className="block text-white font-medium mb-2 text-xl"
            data-oid="2ox.qfi"
          >
            Język wiadomości *
          </label>
          <div
            className="relative"
            ref={languageDropdownRef}
            data-oid="h.ueg:n"
          >
            <button
              type="button"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="w-full h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm pr-10 text-left"
              data-oid="c3lmv88"
            >
              {formData.jezykWiadomosci}
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
                    key={option.code}
                    type="button"
                    onClick={() => handleLanguageSelect(option.code)}
                    className={`w-full px-6 py-3 text-left text-white hover:bg-gray-700 first:rounded-t-2xl last:rounded-b-2xl transition-colors ${
                      formData.jezykWiadomosci === option.code
                        ? "bg-gray-700"
                        : ""
                    }`}
                    data-oid=":i4l0zm"
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center" data-oid=".8bq7bo">
          <div
            className="flex-1 border-t border-gray-300 dark:border-gray-600"
            data-oid="-w4krbe"
          ></div>
          {/* <span className="px-3 text-sm text-gray-500 dark:text-gray-400">lub</span> */}
          <div
            className="flex-1 border-t border-gray-300 dark:border-gray-600"
            data-oid="121n8te"
          ></div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div
          className={`flex items-center space-x-3 ${
            !formData.acceptTerms && message.includes("regulamin")
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
              !formData.acceptTerms && message.includes("regulamin")
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
            Akceptuję{" "}
            <a
              href="/regulamin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline hover:text-white/80"
              data-oid="3mi774b"
            >
              regulamin usługi
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-lg shadow-lg"
          data-oid="yomb8ur"
        >
          {isSubmitting ? "WYSYŁANIE..." : "WYŚLIJ"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-4 rounded-2xl text-sm backdrop-blur-sm ${
            message.includes("zapisane")
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
