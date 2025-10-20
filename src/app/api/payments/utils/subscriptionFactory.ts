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
  const expiresIn7DaysAt = new Date(
    created + 7 * 24 * 60 * 60 * 1000 + expiryAdjustmentInMilis
  );
  const expiresIn30DaysAt = new Date(
    created + 30 * 24 * 60 * 60 * 1000 + expiryAdjustmentInMilis
  );
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
