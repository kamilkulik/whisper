import { SubscriptionType } from "@prisma/client";
import Stripe from "stripe";

/**
 * E.164 Phone Number Utilities
 * E.164 format: [+][country code][subscriber number including area code]
 * Example: +48791321431
 */

/**
 * Combines country code and phone number into E.164 format
 * @param countryCode - The country code with + prefix (e.g., "+48", "+44")
 * @param phoneNumber - The subscriber number (e.g., "791321431")
 * @returns Phone number in E.164 format (e.g., "+48791321431")
 */
export function toE164Format(countryCode: string, phoneNumber: string): string {
  // Remove any spaces, dashes, or other formatting from phone number
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");
  // Ensure country code starts with +
  const cleanCountryCode = countryCode.startsWith("+")
    ? countryCode
    : `+${countryCode}`;

  return `${cleanCountryCode}${cleanPhone}`;
}

/**
 * Validates if a phone number is in E.164 format
 * @param phoneNumber - The phone number to validate
 * @returns true if the phone number is in valid E.164 format
 */
export function isValidE164(phoneNumber: string): boolean {
  // E.164 format: + followed by 1-3 digit country code, then 1-14 digits
  // Total length should be 8-15 characters including +
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  return e164Regex.test(phoneNumber);
}

/**
 * Normalizes a phone number to E.164 format
 * Removes spaces, dashes, parentheses
 * @param phoneNumber - The phone number (should already have country code)
 * @returns Normalized E.164 phone number
 */
export function normalizeE164(phoneNumber: string): string {
  // Remove all non-digit characters except the leading +
  const hasPlus = phoneNumber.startsWith("+");
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  return hasPlus ? `+${digitsOnly}` : `+${digitsOnly}`;
}

// Define the config structure for a product
type ProductConfig = {
  mode: Stripe.Checkout.Session.Mode;
  price: string;
  prod: string;
  quantity: number;
};

// Define product configurations based on product type
export const productConfigs: Record<
  "development" | "production",
  Record<string, Partial<Record<SubscriptionType, ProductConfig>>>
> = {
  development: {
    PL: {
      [SubscriptionType.ONE_TIME]: {
        mode: "payment",
        price: "price_1RtLzh0JWfkzhBgp0ZDaEYyO", // One-time payment price
        prod: "prod_SozzARWuQNWE3X",
        quantity: 1,
      },
      [SubscriptionType.MONTHLY]: {
        mode: "subscription",
        price: "price_1RwGZm0JWfkzhBgpFj7IcYev", // Subscription price
        prod: "prod_Ss0akCgGVEcXaR",
        quantity: 1,
      },
    },
  },
  production: {
    PL: {
      [SubscriptionType.ONE_TIME]: {
        mode: "payment",
        price: "price_1SN5Pz1u5HYgja2NztyuS4Xw", // One-time payment price
        prod: "prod_TJirKIoPUxYjPa",
        quantity: 1,
      },
      [SubscriptionType.MONTHLY]: {
        mode: "subscription",
        price: "price_1SN5NZ1u5HYgja2NoR4Bqg92", // Subscription price
        prod: "prod_TJipCSEiFsUJFa",
        quantity: 1,
      },
    },
    GB: {
      [SubscriptionType.ONE_TIME]: {
        mode: "payment",
        price: "price_1SN5VV1u5HYgja2NvD9bP6tp", // One-time payment price
        prod: "prod_TJixa3q4H6P3dh",
        quantity: 1,
      },
      [SubscriptionType.MONTHLY]: {
        mode: "subscription",
        price: "price_1SN5UK1u5HYgja2N8q7uz7yF", // Subscription price
        prod: "prod_TJiwvyHCXP7fQy",
        quantity: 1,
      },
    },
    DEFAULT: {
      [SubscriptionType.ONE_TIME]: {
        mode: "payment",
        price: "price_1SN5Wy1u5HYgja2Nf8yJJt24", // One-time payment price
        prod: "prod_TJiyoDCyYWNOoT",
        quantity: 1,
      },
      [SubscriptionType.MONTHLY]: {
        mode: "subscription",
        price: "price_1SN5WM1u5HYgja2NOfBRxxRD", // Subscription price
        prod: "prod_TJiyBBZhYHg7DE",
        quantity: 1,
      },
    },
  },
};

export function getSubscriptionType(productType: string): SubscriptionType {
  switch (productType) {
    case SubscriptionType.MONTHLY.toString():
      return SubscriptionType.MONTHLY;
    case SubscriptionType.ONE_TIME.toString():
      return SubscriptionType.ONE_TIME;
    default:
      return SubscriptionType.TRIAL;
  }
}

export function getSubscriptionTypeByPriceId(
  priceId: string
): SubscriptionType | undefined {
  // Search through all product configs and their nested subscription types
  for (const [environment, environmentConfig] of Object.entries(
    productConfigs
  )) {
    for (const [country, countryConfig] of Object.entries(environmentConfig)) {
      for (const [subscriptionType, config] of Object.entries(countryConfig)) {
        if (config.price === priceId) {
          return getSubscriptionType(subscriptionType);
        }
      }
    }
  }

  return undefined;
}
