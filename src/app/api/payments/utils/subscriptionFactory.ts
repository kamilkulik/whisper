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
  productType: string;
  subscriptionId: string;
  user: User;
}

export function subscriptionFactory({
  created,
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
  const expiresIn7DaysAt = new Date(created + 7 * 24 * 60 * 60 * 1000);
  const expiresIn30DaysAt = new Date(created + 30 * 24 * 60 * 60 * 1000);
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
