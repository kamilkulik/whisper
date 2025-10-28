import { SubscriptionType } from "@prisma/client";
import Stripe from "stripe";

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
