import { getSubscriptionType } from "@/lib/consts";
import {
  PaymentProvider,
  Subscription,
  SubscriptionStatus,
  SubscriptionType,
  User,
} from "@prisma/client";

export interface SubscriptionFactoryInput {
  created: number;
  expiryAdjustmentInMilis: number;
  productType: string;
  subscriptionId: string;
  user: Pick<User, "id">;
  /** Stripe trial_end timestamp in seconds. When set, overrides the computed trial expiry. */
  trialEnd?: number;
}

function createRawExpiryDate(created: number, days: number, expiryAdjustmentInMilis: number) {
  return new Date(created + days * 24 * 60 * 60 * 1000 + expiryAdjustmentInMilis);
}

function snapToEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setUTCHours(23, 59, 59, 999);
  return result;
}

export function subscriptionFactory({
  created,
  expiryAdjustmentInMilis,
  productType,
  subscriptionId,
  user,
  trialEnd,
}: SubscriptionFactoryInput): Pick<
  Subscription,
  | "dateExpires"
  | "dateStarted"
  | "paymentProvider"
  | "subscriptionId"
  | "status"
  | "type"
  | "userId"
> {
  const subscriptionType = getSubscriptionType(productType);

  let dateExpires: Date;

  if (subscriptionType === SubscriptionType.TRIAL && trialEnd) {
    // Use Stripe's authoritative trial_end timestamp
    dateExpires = snapToEndOfDay(new Date(trialEnd * 1000));
  } else if (subscriptionType === SubscriptionType.TRIAL) {
    // Fallback: compute 7-day trial expiry
    const rawTrialExpiry = createRawExpiryDate(created, 7, expiryAdjustmentInMilis);
    dateExpires = snapToEndOfDay(rawTrialExpiry);
  } else {
    // Paid subscription: 30-day expiry
    const rawExpiry = createRawExpiryDate(created, 30, expiryAdjustmentInMilis);
    dateExpires = snapToEndOfDay(rawExpiry);
  }

  return {
    dateExpires,
    dateStarted: new Date(created),
    paymentProvider: PaymentProvider.STRIPE,
    status: SubscriptionStatus.ACTIVE,
    subscriptionId,
    type: subscriptionType,
    userId: user.id,
  };
}
