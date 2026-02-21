import { SubscriptionType, SupportedLanguagesEnum } from "@prisma/client";
import { UserData } from "@/app/api/users/route";
import {
  DEFAULT_TIMEZONE,
  timezoneOptions,
} from "@/app/_consts";

export interface GatheredUserData {
  deliveryHour: number;
  email?: string;
  emailVerified?: boolean;
  messageLanguage: SupportedLanguagesEnum;
  name?: string;
  phoneNumber: string;
  product: SubscriptionType | null;
}

function isPremium(product: SubscriptionType | null | undefined): boolean {
  switch (product) {
    case null:
      return false;
    case undefined:
      return false;
    case SubscriptionType.MONTHLY:
      return true;
    case SubscriptionType.ONE_TIME:
      return true;
    case SubscriptionType.TRIAL:
      return false;
    default:
      return false;
  }
}

/**
 * Detects the user's IANA timezone from the browser.
 * Falls back to DEFAULT_TIMEZONE if detection fails or the timezone is not in our supported list.
 */
function detectBrowserTimezone(): string {
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Only use the detected timezone if it's in our supported list
    const isSupported = timezoneOptions.some((tz) => tz.value === detected);
    return isSupported ? detected : DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

export function prepSaveUserBody({
  deliveryHour,
  email,
  emailVerified,
  messageLanguage,
  name,
  phoneNumber,
  product,
}: GatheredUserData): UserData {
  const premium = isPremium(product);

  return {
    email: email || null,
    emailVerified: emailVerified ?? false,
    messageLanguage,
    name: name || null,
    phoneNumber,
    phoneNumberVerified: true,
    premium,
    timezone: detectBrowserTimezone(),
    deliveryHour,
  };
}
