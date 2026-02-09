"use client";

import { useState } from "react";
import { User, SupportedLanguagesEnum } from "@prisma/client";
import { useTranslations } from "next-intl";
import { languageOptions, timezoneOptions, deliveryHourOptions } from "@/app/_consts";

interface MessageSettingsFormProps {
  user: Pick<User, "messageLanguage" | "timezone" | "deliveryHour">;
}

export default function MessageSettingsForm({
  user,
}: MessageSettingsFormProps) {
  const [messageLanguage, setMessageLanguage] = useState(user.messageLanguage);
  const [timezone, setTimezone] = useState(user.timezone);
  const [deliveryHour, setDeliveryHour] = useState(user.deliveryHour);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const t = useTranslations("DashboardPage.settings.message-settings");

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
          timezone,
          deliveryHour,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: t("settings-saved-success"),
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || t("settings-saved-error"),
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: t("settings-saved-error"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Group timezones by region for better UX
  const groupedTimezones = timezoneOptions.reduce((acc, tz) => {
    if (!acc[tz.region]) {
      acc[tz.region] = [];
    }
    acc[tz.region].push(tz);
    return acc;
  }, {} as Record<string, (typeof timezoneOptions)[number][]>);

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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Message Language */}
        <div>
          <label
            htmlFor="messageLanguage"
            className="block text-white text-left font-medium mb-2"
          >
            {t("message-language")}
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
        </div>

        {/* Timezone */}
        <div>
          <label
            htmlFor="timezone"
            className="block text-white text-left font-medium mb-2"
          >
            {t("timezone")}
          </label>
          <p className="text-gray-400 text-sm mb-2">
            {t("timezone-description")}
          </p>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
            required
          >
            {Object.entries(groupedTimezones).map(([region, tzs]) => (
              <optgroup key={region} label={region} className="bg-gray-800 text-gray-400">
                {tzs.map((tz) => (
                  <option
                    key={tz.value}
                    value={tz.value}
                    className="bg-gray-800 text-white"
                  >
                    {tz.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Delivery Hour */}
        <div>
          <label
            htmlFor="deliveryHour"
            className="block text-white text-left font-medium mb-2"
          >
            {t("delivery-hour")}
          </label>
          <p className="text-gray-400 text-sm mb-2">
            {t("delivery-hour-description")}
          </p>
          <select
            id="deliveryHour"
            value={deliveryHour}
            onChange={(e) => setDeliveryHour(parseInt(e.target.value, 10))}
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

        <div className="flex gap-4 pt-4">
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
            {t("cancel")}
          </a>
        </div>
      </form>
    </div>
  );
}
