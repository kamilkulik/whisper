"use client";

import { useState } from "react";
import { User, SupportedLanguagesEnum } from "@prisma/client";

interface MessageSettingsFormProps {
  user: User;
}

const languageOptions = [
  { value: SupportedLanguagesEnum.PL, label: "Polski" },
  { value: SupportedLanguagesEnum.EN, label: "English" },
  { value: SupportedLanguagesEnum.ES, label: "Español" },
  { value: SupportedLanguagesEnum.IT, label: "Italiano" },
];

export default function MessageSettingsForm({
  user,
}: MessageSettingsFormProps) {
  const [messageLanguage, setMessageLanguage] = useState(user.messageLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageLanguage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Język wiadomości został zaktualizowany pomyślnie!",
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Wystąpił błąd podczas aktualizacji języka.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Wystąpił błąd podczas aktualizacji języka.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-green-500/20 border-green-400/30 text-green-400"
              : "bg-red-500/20 border-red-400/30 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="messageLanguage"
              className="block text-white font-medium mb-2"
            >
              Język wiadomości
            </label>
            <select
              id="messageLanguage"
              value={messageLanguage}
              onChange={(e) =>
                setMessageLanguage(e.target.value as SupportedLanguagesEnum)
              }
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
              required
            >
              {languageOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-gray-800 text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-white/60 text-sm mt-2">
              Wybierz język, w którym chcesz otrzymywać wiadomości
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-blue-500/10 text-blue-300 hover:text-blue-200 disabled:text-blue-400/50 font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-blue-400/30 hover:border-blue-400/50 disabled:border-blue-400/20 backdrop-blur-sm"
          >
            {isLoading ? "Aktualizuję..." : "Zapisz zmiany"}
          </button>

          <a
            href="/dashboard"
            className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 hover:text-gray-200 font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-gray-400/30 hover:border-gray-400/50 backdrop-blur-sm text-center"
          >
            Anuluj
          </a>
        </div>
      </form>
    </div>
  );
}
