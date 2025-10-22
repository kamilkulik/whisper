import { useTranslations } from "next-intl";
import { ValidationErrors } from "../_types";
import { useTriangulatedLocation } from "../_hooks/useTriangulatedLocation";
import { GEO_CONTEXT } from "../_consts";
import { useEffect, useState } from "react";

type PhoneFormProps = {
  formData: { phoneNumber: string; email: string; countryCode: string };
  isCountryDropdownOpen: boolean;
  countryDropdownRef: React.RefObject<HTMLDivElement | null>;
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

export function PhoneForm({
  formData,
  isCountryDropdownOpen,
  countryDropdownRef,
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
  const t = useTranslations("Components.PhoneForm");
  const sharedMessages = useTranslations("Shared.countries");
  const { isLoaded, triangulatedCountry } = useTriangulatedLocation();
  const [phoneCountryCodeOptions, setPhoneCountryCodeOptions] =
    useState<typeof GEO_CONTEXT>(GEO_CONTEXT);

  useEffect(() => {
    if (isLoaded) {
      const phoneCountryCodeOptions = GEO_CONTEXT.find(
        (option) => option.country === triangulatedCountry
      )
        ? GEO_CONTEXT.filter((option) => option.country === triangulatedCountry)
        : GEO_CONTEXT;
      setPhoneCountryCodeOptions(phoneCountryCodeOptions);
    }
  }, [isLoaded, triangulatedCountry]);

  return (
    <>
      <div className="mb-8" data-oid="fv3gut-">
        <h3
          className="text-2xl font-bold text-center text-white"
          data-oid="8cie_js"
        >
          {isLoginMode ? t("form-title.login") : t("form-title.signup")}
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
                  className="block text-white font-medium mb-2 text-xl whitespace-nowrap"
                  data-oid="lotbw.t"
                >
                  {t("form-label-country")}
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
                      {phoneCountryCodeOptions.map((option) => (
                        <button
                          key={option.countryCode}
                          type="button"
                          onClick={() =>
                            handleCountrySelect(option.countryCode)
                          }
                          className={`w-full px-6 py-3 text-left text-white hover:bg-gray-700 first:rounded-t-2xl last:rounded-b-2xl transition-colors text-2xl ${
                            formData.countryCode === option.countryCode
                              ? "bg-gray-700"
                              : ""
                          }`}
                          data-oid="jp414j."
                        >
                          {option.countryCode} {sharedMessages(option.country)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="h-full ml-4" data-oid="go9nv0c">
                <label
                  htmlFor="phoneNumber"
                  className="block text-white font-medium mb-2 text-xl"
                  data-oid="jits35v"
                >
                  {t("form-label-phone-number")}
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    handleChange(e);
                    clearValidationError("phoneNumber");
                  }}
                  onBlur={(e) => handleInputBlur("phoneNumber", e.target.value)}
                  required
                  className={`w-full h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white text-xl placeholder-white/60 focus:outline-none focus:ring-2 backdrop-blur-sm placeholder:text-2xl ${
                    validationErrors.phoneNumber
                      ? "focus:ring-red-500/50 ring-2 ring-red-500/30"
                      : "focus:ring-white/30"
                  }`}
                  placeholder={t("form-label-phone-number-placeholder")}
                  data-oid="6a6jkxb"
                />
              </div>
            </div>
            {validationErrors.phoneNumber && (
              <p className="mt-1 text-sm text-red-300" data-oid="880w9:6">
                {validationErrors.phoneNumber}
              </p>
            )}
          </>
        ) : (
          <div>
            <label
              htmlFor="email"
              className="block text-white font-medium mb-2 text-xl"
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
              className={`w-full h-12 px-6 py-3 bg-white/20 border-0 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 backdrop-blur-sm placeholder:text-xl ${
                validationErrors.email
                  ? "focus:ring-red-500/50 ring-2 ring-red-500/30"
                  : "focus:ring-white/30"
              }`}
              placeholder={t("form-label-email-placeholder")}
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
            ? t("form-submit-button-loading")
            : isLoginMode
              ? t("form-submit-button")
              : t("form-submit-button-signup")}
        </button>
      </form>
    </>
  );
}
