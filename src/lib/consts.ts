import { SubscriptionType } from "@prisma/client";
import Stripe from "stripe";

// Define product configurations based on product type
export const productConfigs: {
  [key: string]: {
    [key: string]: {
      mode: Stripe.Checkout.Session.Mode;
      price: string;
      prod: string;
      quantity: number;
    };
  };
} = {
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
  for (const [productKey, productConfig] of Object.entries(productConfigs)) {
    for (const [subscriptionType, config] of Object.entries(productConfig)) {
      if (config.price === priceId) {
        return getSubscriptionType(subscriptionType);
      }
    }
  }

  return undefined;
}
