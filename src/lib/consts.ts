import { SubscriptionType } from "@prisma/client";

// Define product configurations based on product type
export const productConfigs = {
  [SubscriptionType.ONE_TIME]: {
    mode: "payment" as const,
    price: "price_1RtLzh0JWfkzhBgp0ZDaEYyO", // One-time payment price
    prod: "prod_SozzARWuQNWE3X",
    quantity: 1,
  },
  [SubscriptionType.MONTHLY]: {
    mode: "subscription" as const,
    price: "price_1RwGZm0JWfkzhBgpFj7IcYev", // Subscription price
    prod: "prod_Ss0akCgGVEcXaR",
    quantity: 1,
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
  const productType = Object.keys(productConfigs).find(
    (key) =>
      productConfigs[key as keyof typeof productConfigs].price === priceId
  );

  if (!productType) {
    return undefined;
  }

  return getSubscriptionType(productType);
}
