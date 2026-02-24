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
  // Snap to end of expiry day:
  const rawTrialExpiry = createRawExpiryDate(created, 7, expiryAdjustmentInMilis);
  const expiresIn7DaysAt = snapToEndOfDay(rawTrialExpiry);

  const rawExpiry = createRawExpiryDate(created, 30, expiryAdjustmentInMilis);
  const expiresIn30DaysAt = snapToEndOfDay(rawExpiry);

  const subscriptionType = getSubscriptionType(productType);

  const dateExpires =
    subscriptionType === SubscriptionType.TRIAL
      ? expiresIn7DaysAt
      : expiresIn30DaysAt;

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
