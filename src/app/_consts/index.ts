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
] as const;

// Map IANA timezone identifiers to phone country codes
// This enables auto-detecting the user's country from their browser timezone
export const timezoneToPhoneCountryCode: Record<string, string> = {
  // United States & Canada (+1)
  "America/New_York": "+1",
  "America/Chicago": "+1",
  "America/Denver": "+1",
  "America/Los_Angeles": "+1",
  "America/Anchorage": "+1",
  "America/Phoenix": "+1",
  "America/Detroit": "+1",
  "America/Indiana/Indianapolis": "+1",
  "America/Indiana/Knox": "+1",
  "America/Indiana/Marengo": "+1",
  "America/Indiana/Petersburg": "+1",
  "America/Indiana/Tell_City": "+1",
  "America/Indiana/Vevay": "+1",
  "America/Indiana/Vincennes": "+1",
  "America/Indiana/Winamac": "+1",
  "America/Kentucky/Louisville": "+1",
  "America/Kentucky/Monticello": "+1",
  "America/North_Dakota/Beulah": "+1",
  "America/North_Dakota/Center": "+1",
  "America/North_Dakota/New_Salem": "+1",
  "America/Boise": "+1",
  "America/Juneau": "+1",
  "America/Sitka": "+1",
  "America/Yakutat": "+1",
  "America/Nome": "+1",
  "America/Adak": "+1",
  "America/Menominee": "+1",
  "Pacific/Honolulu": "+1",
  // Canada
  "America/Toronto": "+1",
  "America/Vancouver": "+1",
  "America/Winnipeg": "+1",
  "America/Edmonton": "+1",
  "America/Halifax": "+1",
  "America/St_Johns": "+1",
  "America/Regina": "+1",
  "America/Moncton": "+1",
  "America/Thunder_Bay": "+1",
  "America/Iqaluit": "+1",
  "America/Whitehorse": "+1",
  "America/Yellowknife": "+1",
  "America/Dawson": "+1",
  "America/Dawson_Creek": "+1",
  "America/Rankin_Inlet": "+1",
  "America/Resolute": "+1",
  "America/Glace_Bay": "+1",
  "America/Goose_Bay": "+1",
  // Australia
  "Australia/Sydney": "+61",
  "Australia/Melbourne": "+61",
  "Australia/Brisbane": "+61",
  "Australia/Perth": "+61",
  "Australia/Adelaide": "+61",
  "Australia/Hobart": "+61",
  "Australia/Darwin": "+61",
  "Australia/Canberra": "+61",
  "Australia/Lord_Howe": "+61",
  "Australia/Lindeman": "+61",
  "Australia/Currie": "+61",
  "Australia/Broken_Hill": "+61",
  "Australia/Eucla": "+61",
  // Europe
  "Europe/Vienna": "+43",
  "Europe/Brussels": "+32",
  "Europe/Prague": "+420",
  "Europe/Copenhagen": "+45",
  "Europe/Tallinn": "+372",
  "Europe/Helsinki": "+358",
  "Europe/Paris": "+33",
  "Europe/Berlin": "+49",
  "Europe/Busingen": "+49",
  "Europe/Dublin": "+353",
  "Europe/Rome": "+39",
  "Europe/Amsterdam": "+31",
  "Pacific/Auckland": "+64",
  "Pacific/Chatham": "+64",
  "Europe/Warsaw": "+48",
  "Europe/Lisbon": "+351",
  "Atlantic/Madeira": "+351",
  "Atlantic/Azores": "+351",
  "Europe/Madrid": "+34",
  "Africa/Ceuta": "+34",
  "Atlantic/Canary": "+34",
  "Europe/Stockholm": "+46",
  "Europe/Zurich": "+41",
  "Europe/London": "+44",
  "Europe/Jersey": "+44",
  "Europe/Guernsey": "+44",
  "Europe/Isle_of_Man": "+44",
};

/**
 * Detects the user's phone country code based on their browser timezone.
 * Uses Intl.DateTimeFormat to get the IANA timezone identifier and maps it
 * to the corresponding phone country code from supportedPhoneCountryCodes.
 *
 * @returns The phone country code string (e.g., "+44" for UK) or "+1" as fallback
 */
export function getDefaultPhoneCountryCode(): string {
  try {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const phoneCode = timezoneToPhoneCountryCode[detectedTimezone];

    if (phoneCode) {
      // Verify the detected code is in our supported list
      const isSupported = supportedPhoneCountryCodes.some(
        (entry) => entry.phoneCountryCode === phoneCode
      );
      if (isSupported) {
        return phoneCode;
      }
    }
  } catch {
    // Intl API not available, fall through to default
  }

  return supportedPhoneCountryCodes[0].phoneCountryCode; // "+1" fallback
}

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

// IANA timezone identifiers for user timezone selection
// Note: Offsets are for standard time (winter). DST adjustments are handled automatically by JavaScript Date
export const timezoneOptions = [
  // Europe
  { value: "Europe/Warsaw", label: "Warsaw (CET/CEST)", region: "Europe", offset: "+01:00" },
  { value: "Europe/London", label: "London (GMT/BST)", region: "Europe", offset: "+00:00" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)", region: "Europe", offset: "+01:00" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)", region: "Europe", offset: "+01:00" },
  { value: "Europe/Madrid", label: "Madrid (CET/CEST)", region: "Europe", offset: "+01:00" },
  { value: "Europe/Rome", label: "Rome (CET/CEST)", region: "Europe", offset: "+01:00" },
  { value: "Europe/Amsterdam", label: "Amsterdam (CET/CEST)", region: "Europe", offset: "+01:00" },
  { value: "Europe/Brussels", label: "Brussels (CET/CEST)", region: "Europe", offset: "+01:00" },
  { value: "Europe/Vienna", label: "Vienna (CET/CEST)", region: "Europe", offset: "+01:00" },
  { value: "Europe/Prague", label: "Prague (CET/CEST)", region: "Europe", offset: "+01:00" },
  { value: "Europe/Stockholm", label: "Stockholm (CET/CEST)", region: "Europe", offset: "+01:00" },
  { value: "Europe/Copenhagen", label: "Copenhagen (CET/CEST)", region: "Europe", offset: "+01:00" },
  { value: "Europe/Helsinki", label: "Helsinki (EET/EEST)", region: "Europe", offset: "+02:00" },
  { value: "Europe/Lisbon", label: "Lisbon (WET/WEST)", region: "Europe", offset: "+00:00" },
  { value: "Europe/Dublin", label: "Dublin (GMT/IST)", region: "Europe", offset: "+00:00" },
  { value: "Europe/Zurich", label: "Zurich (CET/CEST)", region: "Europe", offset: "+01:00" },
  // Americas
  { value: "America/New_York", label: "New York (EST/EDT)", region: "Americas", offset: "-05:00" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)", region: "Americas", offset: "-06:00" },
  { value: "America/Denver", label: "Denver (MST/MDT)", region: "Americas", offset: "-07:00" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)", region: "Americas", offset: "-08:00" },
  { value: "America/Toronto", label: "Toronto (EST/EDT)", region: "Americas", offset: "-05:00" },
  { value: "America/Vancouver", label: "Vancouver (PST/PDT)", region: "Americas", offset: "-08:00" },
  // Oceania
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)", region: "Oceania", offset: "+10:00" },
  { value: "Australia/Melbourne", label: "Melbourne (AEST/AEDT)", region: "Oceania", offset: "+10:00" },
  { value: "Australia/Perth", label: "Perth (AWST)", region: "Oceania", offset: "+08:00" },
  { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)", region: "Oceania", offset: "+12:00" },
] as const;

// Group timezones by region for better UX
export const groupedTimezones = timezoneOptions.reduce((acc, tz) => {
  if (!acc[tz.region]) {
    acc[tz.region] = [];
  }
  acc[tz.region].push(tz);
  return acc;
}, {} as Record<string, (typeof timezoneOptions)[number][]>);

export type TimezoneOption = (typeof timezoneOptions)[number]["value"];

// Delivery hour options (0-23)
export const deliveryHourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, "0")}:59`,
}));

// Default timezone
export const DEFAULT_TIMEZONE: TimezoneOption = "Europe/Warsaw";
export const DEFAULT_DELIVERY_HOUR = 20;

// Get timezone offset for a given timezone
export function getTimezoneOffset(timezone: TimezoneOption): string {
  const tzOption = timezoneOptions.find((opt) => opt.value === timezone);
  if (!tzOption) {
    return "+00:00"; // Default to UTC if timezone not found
  }
  // Get the actual current offset (handles DST automatically)
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  });
  const parts = formatter.formatToParts(now);
  const offsetPart = parts.find((p) => p.type === "timeZoneName");

  if (offsetPart?.value) {
    // Parse formats like "GMT+1", "GMT-5", "GMT+5:30"
    const match = offsetPart.value.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (match) {
      const sign = match[1];
      const hours = match[2].padStart(2, "0");
      const minutes = (match[3] || "00").padStart(2, "0");
      return `${sign}${hours}:${minutes}`;
    }
  }

  // Fallback to standard offset if we can't determine current offset
  return tzOption.offset;
}

// Validate timezone against known list
export function isValidTimezone(tz: TimezoneOption): boolean {
  return timezoneOptions.some((option) => option.value === tz);
}

// Validate delivery hour (0-23)
export function isValidDeliveryHour(hour: number): boolean {
  return Number.isInteger(hour) && hour >= 0 && hour <= 23;
}

/**
 * Converts a local hour (0-23) in a given timezone to UTC hour (0-23)
 * Handles DST automatically by using the current date/time
 * 
 * @param localHour - Hour in user's local timezone (0-23)
 * @param timezone - IANA timezone identifier (e.g., "Europe/Warsaw")
 * @returns UTC hour (0-23)
 */
export function convertLocalHourToUTC(
  localHour: number,
  timezone: TimezoneOption
): number {
  const now = new Date();

  // Get the current date in the user's timezone (YYYY-MM-DD)
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const localDateStr = dateFormatter.format(now);

  // Get the timezone offset (handles DST automatically)
  const offset = getTimezoneOffset(timezone);

  // Build ISO-8601 date-time string: "YYYY-MM-DDTHH:00:00±hh:mm"
  const iso8601String = `${localDateStr}T${localHour.toString().padStart(2, "0")}:00:00${offset}`;

  // Convert to UTC Date object
  const utcDate = new Date(iso8601String);

  // Extract UTC hour
  return utcDate.getUTCHours();
}

/**
 * Converts a UTC hour (0-23) to local hour (0-23) in a given timezone
 * Handles DST automatically by using the current date/time
 * 
 * @param utcHour - Hour in UTC (0-23)
 * @param timezone - IANA timezone identifier (e.g., "Europe/Warsaw")
 * @returns Local hour (0-23)
 */
export function convertUTCHourToLocal(
  utcHour: number,
  timezone: TimezoneOption
): number {
  const now = new Date();

  // Create a UTC date with the specified hour
  const utcDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    utcHour,
    0,
    0
  ));

  // Get the hour in the user's timezone
  const localHour = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).format(utcDate)
  );

  return localHour;
}
