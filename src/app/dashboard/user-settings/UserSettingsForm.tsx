"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import { useTranslations } from "next-intl";

interface UserSettingsFormProps {
  user: Pick<User, "email" | "phoneNumber">;
}

export default function UserSettingsForm({ user }: UserSettingsFormProps) {
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const t = useTranslations("UserSettingsPage");

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
          email,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: t("form-success-message"),
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || t("form-error-message"),
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: t("form-error-message"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl border ${message.type === "success"
              ? "bg-green-500/20 border-green-400/30 text-green-400"
              : "bg-red-500/20 border-red-400/30 text-red-400"
            }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-16">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-white text-left font-medium mb-2"
            >
              {t("email")}
            </label>
            <input
              type="email"
              id="email"
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
              placeholder={t("email-placeholder")}
              required
            />
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-white text-left font-medium mb-2"
            >
              {t("phone-number")}
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
              placeholder={t("phone-number-placeholder")}
              required
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-blue-500/10 text-blue-300 hover:text-blue-200 disabled:text-blue-400/50 font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-blue-400/30 hover:border-blue-400/50 disabled:border-blue-400/20 backdrop-blur-sm"
          >
            {isLoading ? t("form-loading") : t("form-save-changes")}
          </button>

          <a
            href="/dashboard"
            className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 hover:text-gray-200 font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-gray-400/30 hover:border-gray-400/50 backdrop-blur-sm flex items-center justify-center"
          >
            {t("form-cancel")}
          </a>
        </div>
      </form>
    </div>
  );
}
