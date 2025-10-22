"use client";

import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { z } from "zod";
import { useLocale } from "../contexts/LocaleContext";
import { useRouter } from "next/navigation";
import { ConfirmationCodeGrid } from "./ConfirmationCodeGrid";
import { SuccessMessage } from "./SuccessMessage";
import { ValidationErrors } from "../_types";
import { PhoneForm } from "./PhoneForm";
import { useTranslations } from "next-intl";
import { useTriangulatedLocation } from "../_hooks/useTriangulatedLocation";
import { GEO_CONTEXT } from "../_consts";
// ContactForm is switched at the parent level; no import/render here

// Validation schemas
const localisedPhoneSchema = (
  t: Awaited<ReturnType<typeof useTranslations>>
) => {
  return z.object({
    phoneNumber: z
      .string()
      .min(6, t("form-validation-errors.phone-number.min"))
      .max(15, t("form-validation-errors.phone-number.max"))
      .regex(/^[0-9\s\-]+$/, t("form-validation-errors.phone-number.regex")),
  });
};

const localisedEmailSchema = (
  t: Awaited<ReturnType<typeof useTranslations>>
) => {
  return z.object({
    email: z
      .string()
      .min(1, t("form-validation-errors.email.min"))
      .email(t("form-validation-errors.email.email")),
  });
};

export default function ConfirmationCodeForm({
  onShowContactForm,
  onLoginSuccess,
  isLoginMode = false,
  isEmailMode = false,
  setIsEmailVerified,
}: {
  onShowContactForm?: (verifiedPhoneNumber: string) => void;
  onLoginSuccess?: (userId: string) => void;
  isLoginMode?: boolean;
  isEmailMode?: boolean;
  setIsEmailVerified?: (isEmailVerified: {
    isEmailVerified: boolean;
    email: string;
  }) => void;
}) {
  const router = useRouter();
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const { countryCode } = useLocale();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    email: "",
    countryCode: "",
  });

  // New state for confirmation code flow
  const [showConfirmationCode, setShowConfirmationCode] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const t = useTranslations("Components.ConfirmationCodeForm");
  const phoneSchema = localisedPhoneSchema(t);
  const emailSchema = localisedEmailSchema(t);
  const { triangulatedCountry } = useTriangulatedLocation();

  const stateKey = showSuccessMessage
    ? "success"
    : showConfirmationCode
      ? "code"
      : "phone";

  // Handle clicking outside the dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle input blur with validation and sanitization
  const handleInputBlur = (
    fieldName: keyof ValidationErrors,
    value: string
  ) => {
    const sanitizedValue = sanitizeInput(value);
    const error = validateField(fieldName, sanitizedValue, isEmailMode);

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

  // Sanitize input function
  const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input.trim());
  };

  const handleCountrySelect = (countryCode: string) => {
    setFormData((prev) => ({
      ...prev,
      countryCode,
    }));
    setIsCountryDropdownOpen(false);
  };

  const validateField = (
    fieldName: keyof ValidationErrors,
    value: string,
    isEmailMode: boolean
  ): string | undefined => {
    try {
      let fieldSchema;
      if (isEmailMode && fieldName === "email") {
        fieldSchema = emailSchema.shape.email;
      } else if (!isEmailMode && fieldName === "phoneNumber") {
        fieldSchema = phoneSchema.shape.phoneNumber;
      } else {
        return t("form-validation-errors.unknown-field");
      }
      fieldSchema.parse(value);
      return undefined; // No error
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message;
      }
      return t("form-validation-errors.validation-error");
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

  /**
   * HANDLES SENDING AND VERIFIYING CONFIRMATION CODE
   * BOTH PHONE AND EMAIL!
   */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const errors: ValidationErrors = {};

    // TODO make sure this shows up first
    // Start by verifying phone country code matches detected country
    if (!isEmailMode) {
      const phoneCountryCode = GEO_CONTEXT.find(
        (option) => option.countryCode === formData.countryCode
      )?.country!;

      if (phoneCountryCode !== triangulatedCountry) {
        errors.phoneNumber = t(
          "form-validation-errors.phone-number.country-mismatch"
        );
      }
    }

    // Validate all input fields based on mode
    const sanitizedData = isEmailMode
      ? { email: sanitizeInput(formData.email) }
      : { phoneNumber: sanitizeInput(formData.phoneNumber) };

    Object.entries(sanitizedData).forEach(([key, value]) => {
      const error = validateField(
        key as keyof ValidationErrors,
        value,
        isEmailMode
      );
      if (error) {
        errors[key as keyof ValidationErrors] = error;
      }
    });

    // If there are validation errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setMessage(t("form-validation-errors.validation-error"));
      return;
    }

    // Update form data with sanitized values
    setFormData((prev) => ({
      ...prev,
      ...sanitizedData,
    }));

    setIsSubmitting(true);

    try {
      // Request confirmation code
      const params = new URLSearchParams();
      if (isEmailMode) {
        params.append("email", formData.email);
      } else {
        params.append("phoneNumber", formData.phoneNumber);
      }

      const response = await fetch(`/api/confirm/otp?${params.toString()}`, {
        method: "GET",
      });

      const data = await response.json();

      if (response.ok) {
        // Save sessionId to localStorage
        localStorage.setItem("confirmationSessionId", data.sessionId);
        localStorage.setItem(
          "confirmationCodeExpires",
          data.confirmationCodeExpires
        );
        setSessionId(data.sessionId);
        setShowConfirmationCode(true);

        // In development mode, show the verification code
        let message = isEmailMode
          ? t("form-submit-message.email")
          : t("form-submit-message.phone");

        if (data.confirmationCode) {
          message = `\n\n🔑 Verification Code: ${data.confirmationCode}`;
        }

        setMessage(message);
      } else {
        setMessage(data.error || t("form-submit-message.submit-error"));
      }
    } catch (error) {
      setMessage(t("form-submit-message.submit-error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmationCodeComplete = async (confirmationCode: string) => {
    setIsSubmitting(true);
    setMessage("");

    try {
      // Get sessionId from localStorage
      const storedSessionId = localStorage.getItem("confirmationSessionId");
      if (!storedSessionId) {
        setMessage(t("form-submit-message.session-error"));
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/confirm/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmationCode: parseInt(confirmationCode, 10),
          sessionId: storedSessionId,
          ...(isEmailMode
            ? { email: formData.email }
            : { phoneNumber: formData.phoneNumber }),
          isLoginMode,
        }),
      });

      const responseData = await response.json();
      // Handle 307 redirect for non-existing users FIRST
      if (responseData.status == 307) {
        const redirectUrl = responseData.redirectUrl;

        if (setIsEmailVerified && responseData.isEmailVerified) {
          setIsEmailVerified({
            isEmailVerified: true,
            email: formData.email,
          });
        }

        if (redirectUrl) {
          // Use router to navigate to the new modal
          // This will properly close the current modal and open the new one
          router.push(redirectUrl);
          return;
        }
      }

      if (response.ok) {
        if (isLoginMode) {
          // Handle login success
          setMessage(t("form-submit-message.login-success"));
          setShowConfirmationCode(false);
          setShowSuccessMessage(true);

          // Clear localStorage
          localStorage.removeItem("confirmationSessionId");
          localStorage.removeItem("confirmationCodeExpires");

          // Show success message for 2 seconds, then redirect to dashboard
          setTimeout(() => {
            setShowSuccessMessage(false);
            // Redirect to dashboard - the session cookie will be set by the API
            window.location.href = "/dashboard";
          }, 2500);
        } else {
          // Handle signup success (existing flow)
          setMessage(t("form-submit-message.signup-success"));
          setShowConfirmationCode(false);
          setShowSuccessMessage(true);

          // Clear localStorage and form state
          localStorage.removeItem("confirmationSessionId");
          localStorage.removeItem("confirmationCodeExpires");
          setFormData({
            phoneNumber: "",
            email: "",
            countryCode: countryCode,
          });
          setSessionId("");

          // Show success message for 2 seconds, then show contact form
          setTimeout(() => {
            setShowSuccessMessage(false);
            if (onShowContactForm) {
              const sanitizedPhone = (formData.phoneNumber || "").trim();
              onShowContactForm(sanitizedPhone);
            }
          }, 2000);
        }
      } else {
        setMessage(
          responseData.error || t("form-submit-message.incorrect-code")
        );
        // Clear localStorage on error to force new session
        localStorage.removeItem("confirmationSessionId");
      }
    } catch (error) {
      setMessage(t("form-submit-message.code-verification-error"));
      console.error("ConfirmationCodeForm error:", error);
      // Clear localStorage on error to force new session
      localStorage.removeItem("confirmationSessionId");
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div
      className="max-w-lg mx-auto bg-gray-800/60 rounded-2xl shadow-xl p-12 backdrop-blur-sm relative z-50"
      data-oid="tb00.87"
    >
      <div
        key={stateKey}
        className="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        {!showConfirmationCode && !showSuccessMessage && (
          <PhoneForm
            formData={formData}
            isCountryDropdownOpen={isCountryDropdownOpen}
            countryDropdownRef={countryDropdownRef}
            validationErrors={validationErrors}
            isSubmitting={isSubmitting}
            isLoginMode={isLoginMode}
            isEmailMode={isEmailMode}
            handleChange={handleChange}
            clearValidationError={clearValidationError}
            handleInputBlur={handleInputBlur}
            handleCountrySelect={handleCountrySelect}
            handlePhoneSubmit={handleFormSubmit}
            onToggleCountryDropdown={() =>
              setIsCountryDropdownOpen(!isCountryDropdownOpen)
            }
          />
        )}
        {showConfirmationCode && (
          <ConfirmationCodeGrid
            onCodeComplete={handleConfirmationCodeComplete}
            isSubmitting={isSubmitting}
          />
        )}
        {showSuccessMessage && <SuccessMessage isLoginMode={isLoginMode} />}
        {message && (
          <div className="mt-4 text-center">
            <p
              className={`text-lg ${
                ["błąd", "error"].includes(message.toLowerCase())
                  ? "text-red-300"
                  : "text-green-300"
              }`}
            >
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
