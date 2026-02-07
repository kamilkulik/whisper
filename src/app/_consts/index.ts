import { SupportedLanguagesEnum } from "@prisma/client";

export const GB_DOMAIN = "eveningwhisper.co.uk";
export const GB_CONTACT_EMAIL = "contact@eveningwhisper.co.uk";
export const PL_DOMAIN = "wieczornyszept.pl";
export const PL_CONTACT_EMAIL = "contact@eveningwhisper.app";
export const DEFAULT_COUNTRY_DOMAIN = "eveningwhisper.app";
export const DEFAULT_COUNTRY_CONTACT_EMAIL = "contact@eveningwhisper.app";
export const PL_COUNTRY_CODE = "PL";
export const GB_COUNTRY_CODE = "GB";
export const DEFAULT_COUNTRY_CODE = "DEFAULT";

export const supportedPhoneCountryCodes = [
  { "country": "United States, Canada", "phoneCountryCode": "+1" },
  { "country": "Australia", "phoneCountryCode": "+61" },
  { "country": "Austria", "phoneCountryCode": "+43" },
  { "country": "Belgium", "phoneCountryCode": "+32" },
  { "country": "Czech Republic", "phoneCountryCode": "+420" },
  { "country": "Denmark", "phoneCountryCode": "+45" },
  { "country": "Estonia", "phoneCountryCode": "+372" },
  { "country": "Finland", "phoneCountryCode": "+358" },
  { "country": "France", "phoneCountryCode": "+33" },
  { "country": "Germany", "phoneCountryCode": "+49" },
  { "country": "Ireland", "phoneCountryCode": "+353" },
  { "country": "Italy", "phoneCountryCode": "+39" },
  { "country": "Netherlands", "phoneCountryCode": "+31" },
  { "country": "New Zealand", "phoneCountryCode": "+64" },
  { "country": "Poland", "phoneCountryCode": "+48" },
  { "country": "Portugal", "phoneCountryCode": "+351" },
  { "country": "Spain", "phoneCountryCode": "+34" },
  { "country": "Sweden", "phoneCountryCode": "+46" },
  { "country": "Switzerland", "phoneCountryCode": "+41" },
  { "country": "United Kingdom", "phoneCountryCode": "+44" },
];

export const GEO_CONTEXT = [
  {
    domain: GB_DOMAIN,
    country: GB_COUNTRY_CODE,
    countryCodes: supportedPhoneCountryCodes,
  },
  {
    domain: PL_DOMAIN,
    country: PL_COUNTRY_CODE,
    countryCodes: supportedPhoneCountryCodes,
  },
  {
    domain: PL_DOMAIN,
    country: DEFAULT_COUNTRY_CODE,
    countryCodes: supportedPhoneCountryCodes,
  },
];

export interface PricingContextData {
  country: string;
  oneTimePrice: string;
  subscriptionPrice: string;
  currency: string;
  currencySign: string;
}

export const PRICING_CONTEXT: PricingContextData[] = [
  {
    country: GB_COUNTRY_CODE,
    oneTimePrice: "9",
    subscriptionPrice: "8",
    currency: "GBP",
    currencySign: "£",
  },
  {
    country: PL_COUNTRY_CODE,
    oneTimePrice: "24",
    subscriptionPrice: "19",
    currency: "PLN",
    currencySign: "zł",
  },
  {
    country: "DEFAULT",
    oneTimePrice: "11",
    subscriptionPrice: "9",
    currency: "USD",
    currencySign: "$",
  },
];

export function getPricingContext(country: string) {
  return (
    PRICING_CONTEXT.find((context) => context.country === country) ||
    PRICING_CONTEXT[2]
  );
}

export const languageOptions = [
  { value: SupportedLanguagesEnum.PL, label: "Polski", locale: "pl" },
  { value: SupportedLanguagesEnum.EN, label: "English", locale: "en" },
  // { value: SupportedLanguagesEnum.ES, label: "Español" },
  // { value: SupportedLanguagesEnum.IT, label: "Italiano" },
];
