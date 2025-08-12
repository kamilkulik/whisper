import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { z } from "zod";
import { useLocale } from "../contexts/LocaleContext";

type ValidationErrors = {
  numerTelefonu?: string;
};

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
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          Wprowadź kod weryfikacyjny
        </h3>
        <p className="text-white/80 text-sm">
          Wprowadź 6-cyfrowy kod wysłany na Twój numer telefonu
        </p>
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
            className="w-12 h-12 text-center bg-white/20 border-0 rounded-xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm disabled:opacity-50"
            autoFocus={index === 0}
          />
        ))}
      </div>

      {isSubmitting && (
        <div className="text-center">
          <p className="text-white/80 text-sm">Weryfikowanie kodu...</p>
        </div>
      )}
    </div>
  );
}

export default function ConfirmationCodeForm() {
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
    countryCode: "+48",
  });

  // New state for confirmation code flow
  const [showConfirmationCode, setShowConfirmationCode] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

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

    // Validate all input fields
    const sanitizedData = {
      numerTelefonu: sanitizeInput(formData.numerTelefonu),
    };

    const errors: ValidationErrors = {};
    Object.entries(sanitizedData).forEach(([key, value]) => {
      const error = validateField(key as keyof ValidationErrors, value);
      if (error) {
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
      const params = new URLSearchParams({
        phoneNumber: formData.numerTelefonu,
      });
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
        setSessionId(data.sessionId);
        setShowConfirmationCode(true);
        setMessage("Kod weryfikacyjny został wysłany na Twój numer telefonu.");
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
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Numer telefonu potwierdzony! Przekierowywanie do kasy...");

        // Clear localStorage and form state
        localStorage.removeItem("confirmationSessionId");
        setFormData({
          numerTelefonu: "",
          countryCode: countryCode,
        });
        setShowConfirmationCode(false);
        setSessionId("");

        // Redirect to Stripe checkout after a short delay
        setTimeout(() => {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = "/api/checkout-sessions";
          document.body.appendChild(form);
          form.submit();
        }, 1500);
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

  // If showing confirmation code, render the grid component
  if (showConfirmationCode) {
    return (
      <div
        className="max-w-md mx-auto bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl p-8 backdrop-blur-sm relative z-50"
        data-oid="tb00.87"
      >
        <ConfirmationCodeGrid
          onCodeComplete={handleConfirmationCodeComplete}
          isSubmitting={isSubmitting}
        />
        {message && (
          <div className="mt-4 text-center">
            <p
              className={`text-sm ${
                message.includes("błąd") ? "text-red-300" : "text-green-300"
              }`}
            >
              {message}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="max-w-md mx-auto bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl p-8 backdrop-blur-sm relative z-50"
      data-oid="tb00.87"
    >
      <div className="mb-8" data-oid="fv3gut-">
        <h3 className="text-2xl font-bold text-white mb-2" data-oid="8cie_js">
          Zacznij otrzymywać wiadomości!
        </h3>
      </div>
      <form
        onSubmit={handlePhoneSubmit}
        className="space-y-4"
        data-oid="d937n0b"
      >
        <div className="grid grid-cols-[80px_1fr] gap-2" data-oid="mk2pw2b">
          <div className="h-full" data-oid="xbk7dq-">
            <label
              htmlFor="countryCode"
              className="block text-white font-medium mb-2 text-sm"
              data-oid="lotbw.t"
            >
              Kod kraju *
            </label>
            <div
              className="relative"
              ref={countryDropdownRef}
              data-oid="5z3y56l"
            >
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="w-20 h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm pr-8 text-left text-sm"
                data-oid="c7tii0."
              >
                {formData.countryCode}
              </button>
              <div
                className="absolute inset-y-0 right-3 flex items-center pointer-events-none"
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
                  className="absolute top-full mt-1 bg-gray-800 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto w-60"
                  data-oid="u76tc5h"
                >
                  {countryOptions.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => handleCountrySelect(option.code)}
                      className={`w-full px-6 py-3 text-left text-white hover:bg-gray-700 first:rounded-t-2xl last:rounded-b-2xl transition-colors text-sm ${
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
          <div className="h-full" data-oid="go9nv0c">
            <label
              htmlFor="numerTelefonu"
              className="block text-white font-medium mb-2 text-sm"
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
              onBlur={(e) => handleInputBlur("numerTelefonu", e.target.value)}
              required
              className={`h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 backdrop-blur-sm ${
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
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-lg shadow-lg"
          data-oid="yomb8ur"
        >
          {isSubmitting ? "WYSYŁANIE..." : "WYŚLIJ KOD WERYFIKACYJNY"}
        </button>
      </form>
      {message && (
        <div className="mt-4 text-center">
          <p
            className={`text-sm ${
              message.includes("błąd") ? "text-red-300" : "text-green-300"
            }`}
          >
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
