import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export function ConfirmationCodeGrid({
  onCodeComplete,
  isSubmitting,
}: {
  onCodeComplete: (code: string) => void;
  isSubmitting: boolean;
}) {
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const t = useTranslations("Components.ConfirmationCodeGrid");

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
        <p className="text-white/80 text-xl mb-2">{t("countdown-timer")}</p>
        <p className="text-white font-bold text-2xl">{formatTime(timeLeft)}</p>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          {t("code-input-title")}
        </h3>
        <p className="text-white/80 text-lg">{t("code-input-description")}</p>
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
