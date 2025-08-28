"use client";

import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { z } from "zod";
import { useLocale } from "../contexts/LocaleContext";
import { useRouter } from "next/navigation";
// ContactForm is switched at the parent level; no import/render here

type ValidationErrors = {
  numerTelefonu?: string;
  email?: string;
};

// Validation schemas
const phoneSchema = z.object({
  numerTelefonu: z
    .string()
    .min(6, "Numer telefonu musi mieć co najmniej 6 cyfr")
    .max(15, "Numer telefonu nie może być dłuższy niż 15 cyfr")
    .regex(
      /^[0-9\s\-]+$/,
      "Numer telefonu może zawierać tylko cyfry, spacje, myślniki"
    ),
});

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .email("Nieprawidłowy format email"),
});

// Confirmation Code Grid Component
function ConfirmationCodeGrid({
  onCodeComplete,
  isSubmitting,
}: {
  onCodeComplete: (code: string) => void;
  isSubmitting: boolean;
}) {
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Countdown timer effect
  useEffect(() => {
    const expiresAt = localStorage.getItem("confirmationCodeExpires");
    // const expiresAt = "2025-09-21T17:46:01.187Z";
    if (!expiresAt) {
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      // Parse the Date string from localStorage
      const expirationTime = new Date(expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expirationTime - now) / 1000));

      if (remaining <= 0) {
        // Code expired - clear localStorage and reset form
        localStorage.removeItem("confirmationSessionId");
        localStorage.removeItem("confirmationCodeExpires");
        window.location.reload(); // Simple way to reset to phone input
        return;
      }

      setTimeLeft(remaining);
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all digits are filled
    if (
      newCode.every((digit) => digit !== "") &&
      newCode.join("").length === 6
    ) {
      onCodeComplete(newCode.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6).split("");

    if (digits.length === 6) {
      const newCode = [...code];
      digits.forEach((digit, index) => {
        newCode[index] = digit;
      });
      setCode(newCode);
      onCodeComplete(newCode.join(""));
    }
  };

  return (
    <div className="space-y-6">
      {/* Countdown Timer */}
      <div className="text-center mb-4">
        <p className="text-white/80 text-xl mb-2">Kod wygaśnie za:</p>
        <p className="text-white font-bold text-2xl">{formatTime(timeLeft)}</p>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          Wprowadź 6-cyfrowy kod
        </h3>
        <p className="text-white/80 text-lg">Wysłany na Twój numer telefonu</p>
      </div>

      <div className="flex justify-center gap-3">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isSubmitting}
            className="w-12 h-12 text-center bg-white/20 border-0 rounded-xl text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm disabled:opacity-50"
            autoFocus={index === 0}
          />
        ))}
      </div>

      {isSubmitting && (
        <div className="text-center">
          <p className="text-white/80 text-lg">Weryfikowanie kodu...</p>
        </div>
      )}
    </div>
  );
}

// Success message component (moved outside to avoid remounts on each render)
function SuccessMessage({ isLoginMode = false }: { isLoginMode?: boolean }) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {isLoginMode ? "Logowanie udane!" : "Numer potwierdzony!"}
        </h3>
        <p className="text-white/80 text-lg">
          {isLoginMode
            ? "Zostałeś pomyślnie zalogowany do swojego konta."
            : "Twój numer telefonu został pomyślnie zweryfikowany."}
        </p>
      </div>
    </div>
  );
}

type PhoneFormProps = {
  formData: { numerTelefonu: string; email: string; countryCode: string };
  isCountryDropdownOpen: boolean;
  countryDropdownRef: React.RefObject<HTMLDivElement | null>;
  countryOptions: { code: string; name: string }[];
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
  isLoginMode: boolean;
  isEmailMode: boolean;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  clearValidationError: (fieldName: keyof ValidationErrors) => void;
  handleInputBlur: (fieldName: keyof ValidationErrors, value: string) => void;
  handleCountrySelect: (countryCode: string) => void;
  handlePhoneSubmit: (e: React.FormEvent) => void;
  onToggleCountryDropdown: () => void;
};

// Phone form moved outside to keep a stable component identity (prevents focus loss)
function PhoneForm({
  formData,
  isCountryDropdownOpen,
  countryDropdownRef,
  countryOptions,
  validationErrors,
  isSubmitting,
  isLoginMode,
  isEmailMode,
  handleChange,
  clearValidationError,
  handleInputBlur,
  handleCountrySelect,
  handlePhoneSubmit,
  onToggleCountryDropdown,
}: PhoneFormProps) {
  return (
    <>
      <div className="mb-8" data-oid="fv3gut-">
        <h3
          className="text-2xl font-bold text-center text-white"
          data-oid="8cie_js"
        >
          {isLoginMode
            ? "Zaloguj się do swojego konta"
            : "Zacznijmy od potwierdzenia Twojego numeru telefonu"}
        </h3>
      </div>
      <form
        onSubmit={handlePhoneSubmit}
        className="space-y-8"
        data-oid="d937n0b"
      >
        {!isEmailMode ? (
          <>
            <div className="flex" data-oid="mk2pw2b">
              <div className="flex flex-col h-full" data-oid="xbk7dq-">
                <label
                  htmlFor="countryCode"
                  className="block text-white font-medium mb-2 text-xl"
                  data-oid="lotbw.t"
                >
                  Kod kraju *
                </label>
                <div
                  className="relative flex items-center"
                  ref={countryDropdownRef}
                  data-oid="5z3y56l"
                >
                  <button
                    type="button"
                    onClick={onToggleCountryDropdown}
                    className="w-20 h-12 pl-6 pr-20 py-3 bg-white/20 border-0 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm text-left text-xl"
                    data-oid="c7tii0."
                  >
                    {formData.countryCode}
                  </button>
                  <div
                    className="relative right-8 pointer-events-none "
                    data-oid="f6znpna"
                  >
                    <svg
                      className={`w-4 h-4 text-white transition-transform ${
                        isCountryDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      data-oid="y1g8mzi"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                        data-oid="ie97yww"
                      />
                    </svg>
                  </div>
                  {isCountryDropdownOpen && (
                    <div
                      className="absolute top-full left-0 mt-2 bg-gray-800 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto w-80"
                      data-oid="u76tc5h"
                    >
                      {countryOptions.map((option) => (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => handleCountrySelect(option.code)}
                          className={`w-full px-6 py-3 text-left text-white hover:bg-gray-700 first:rounded-t-2xl last:rounded-b-2xl transition-colors text-2xl ${
                            formData.countryCode === option.code
                              ? "bg-gray-700"
                              : ""
                          }`}
                          data-oid="jp414j."
                        >
                          {option.code} {option.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="h-full ml-4" data-oid="go9nv0c">
                <label
                  htmlFor="numerTelefonu"
                  className="block text-white font-medium mb-2 text-xl"
                  data-oid="jits35v"
                >
                  Numer telefonu *
                </label>
                <input
                  type="tel"
                  id="numerTelefonu"
                  name="numerTelefonu"
                  value={formData.numerTelefonu}
                  onChange={(e) => {
                    handleChange(e);
                    clearValidationError("numerTelefonu");
                  }}
                  onBlur={(e) =>
                    handleInputBlur("numerTelefonu", e.target.value)
                  }
                  required
                  className={`w-full h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white text-xl placeholder-white/60 focus:outline-none focus:ring-2 backdrop-blur-sm placeholder:text-2xl ${
                    validationErrors.numerTelefonu
                      ? "focus:ring-red-500/50 ring-2 ring-red-500/30"
                      : "focus:ring-white/30"
                  }`}
                  placeholder="np. 123 456 789"
                  data-oid="6a6jkxb"
                />
              </div>
            </div>
            {validationErrors.numerTelefonu && (
              <p className="mt-1 text-sm text-red-300" data-oid="880w9:6">
                {validationErrors.numerTelefonu}
              </p>
            )}
          </>
        ) : (
          <div>
            <label
              htmlFor="email"
              className="block text-white font-medium mb-2 text-xl"
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
              className={`w-full h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 backdrop-blur-sm placeholder:text-xl ${
                validationErrors.email
                  ? "focus:ring-red-500/50 ring-2 ring-red-500/30"
                  : "focus:ring-white/30"
              }`}
              placeholder="np. jan.kowalski@email.com"
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-300">
                {validationErrors.email}
              </p>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-xl shadow-lg"
          data-oid="yomb8ur"
        >
          {isSubmitting
            ? "WYSYŁANIE..."
            : isLoginMode
            ? "WYŚLIJ KOD LOGOWANIA"
            : "WYŚLIJ KOD WERYFIKACYJNY"}
        </button>
      </form>
    </>
  );
}

export default function ConfirmationCodeForm({
  onShowContactForm,
  onLoginSuccess,
  isLoginMode = false,
  isEmailMode = false,
}: {
  onShowContactForm?: (verifiedPhoneNumber: string) => void;
  onLoginSuccess?: (userId: string) => void;
  isLoginMode?: boolean;
  isEmailMode?: boolean;
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
    numerTelefonu: "",
    email: "",
    countryCode: "+48",
  });

  // New state for confirmation code flow
  const [showConfirmationCode, setShowConfirmationCode] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  const stateKey = showSuccessMessage
    ? "success"
    : showConfirmationCode
    ? "code"
    : "phone";

  const countryOptions = [
    { code: "+48", name: "Polska" },
    { code: "+44", name: "Wielka Brytania" },
    { code: "+1", name: "Stany Zjednoczone" },
    { code: "+34", name: "Hiszpania" },
    { code: "+52", name: "Meksyk" },
    { code: "+56", name: "Chile" },
    { code: "+39", name: "Włochy" },
  ];

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
    console.log("validateField called:", { fieldName, value, isEmailMode });
    try {
      let fieldSchema;
      if (isEmailMode && fieldName === "email") {
        fieldSchema = emailSchema.shape.email;
        console.log("Using email schema");
      } else if (!isEmailMode && fieldName === "numerTelefonu") {
        fieldSchema = phoneSchema.shape.numerTelefonu;
        console.log("Using phone schema");
      } else {
        console.log("Unknown field or mode mismatch");
        return "Nieznane pole";
      }
      fieldSchema.parse(value);
      return undefined; // No error
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation error:", error.issues[0]?.message);
        return error.issues[0]?.message;
      }
      return "Błąd walidacji";
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

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Validate all input fields based on mode
    const sanitizedData = isEmailMode
      ? { email: sanitizeInput(formData.email) }
      : { numerTelefonu: sanitizeInput(formData.numerTelefonu) };

    console.log("Form submission - isEmailMode:", isEmailMode);
    console.log("Sanitized data:", sanitizedData);

    const errors: ValidationErrors = {};
    Object.entries(sanitizedData).forEach(([key, value]) => {
      console.log("Validating field:", key, "with value:", value);
      const error = validateField(
        key as keyof ValidationErrors,
        value,
        isEmailMode
      );
      if (error) {
        console.log("Validation error for", key, ":", error);
        errors[key as keyof ValidationErrors] = error;
      }
    });

    // If there are validation errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setMessage("Proszę poprawić błędy w formularzu.");
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
        params.append("phoneNumber", formData.numerTelefonu);
      }

      const response = await fetch(
        `/api/confirmation-code?${params.toString()}`,
        {
          method: "GET",
        }
      );

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
        setMessage(
          isEmailMode
            ? "Kod weryfikacyjny został wysłany na Twój adres email."
            : "Kod weryfikacyjny został wysłany na Twój numer telefonu."
        );
      } else {
        setMessage(
          data.error || "Wystąpił błąd podczas wysyłania kodu weryfikacyjnego."
        );
      }
    } catch (error) {
      setMessage("Wystąpił błąd podczas wysyłania kodu weryfikacyjnego.");
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
        setMessage("Błąd sesji. Proszę spróbować ponownie.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/confirmation-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmationCode: parseInt(confirmationCode, 10),
          sessionId: storedSessionId,
          ...(isEmailMode
            ? { email: formData.email }
            : { phoneNumber: formData.numerTelefonu }),
          isLoginMode,
        }),
      });

      const responseData = await response.json();
      // Handle 307 redirect for non-existing users FIRST
      if (responseData.status == 307) {
        const redirectUrl = responseData.redirectUrl;
        if (redirectUrl) {
          // Use router to navigate to the new modal
          // This will properly close the current modal and open the new one
          router.push(redirectUrl);
          return;
        }
      }

      // Only try to parse JSON if it's not a redirect
      const data = await response.json();
      console.log("responseData", JSON.stringify(data, null, 2));

      if (response.ok) {
        if (isLoginMode) {
          // Handle login success
          setMessage("Logowanie udane!");
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
          setMessage("Numer telefonu potwierdzony!");
          setShowConfirmationCode(false);
          setShowSuccessMessage(true);

          // Clear localStorage and form state
          localStorage.removeItem("confirmationSessionId");
          localStorage.removeItem("confirmationCodeExpires");
          setFormData({
            numerTelefonu: "",
            email: "",
            countryCode: countryCode,
          });
          setSessionId("");

          // Show success message for 2 seconds, then show contact form
          setTimeout(() => {
            setShowSuccessMessage(false);
            if (onShowContactForm) {
              const sanitizedPhone = (formData.numerTelefonu || "").trim();
              onShowContactForm(sanitizedPhone);
            }
          }, 2000);
        }
      } else {
        setMessage(
          data.error || "Nieprawidłowy kod weryfikacyjny. Spróbuj ponownie."
        );
        // Clear localStorage on error to force new session
        localStorage.removeItem("confirmationSessionId");
      }
    } catch (error) {
      setMessage("Wystąpił błąd podczas weryfikacji kodu.");
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
      className="max-w-lg mx-auto bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl p-12 backdrop-blur-sm relative z-50"
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
            countryOptions={countryOptions}
            validationErrors={validationErrors}
            isSubmitting={isSubmitting}
            isLoginMode={isLoginMode}
            isEmailMode={isEmailMode}
            handleChange={handleChange}
            clearValidationError={clearValidationError}
            handleInputBlur={handleInputBlur}
            handleCountrySelect={handleCountrySelect}
            handlePhoneSubmit={handlePhoneSubmit}
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
                message.toLowerCase().includes("błąd")
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
