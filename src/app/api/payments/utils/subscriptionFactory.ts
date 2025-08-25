import {
  PaymentProvider,
  Subscription,
  SubscriptionStatus,
  SubscriptionType,
  User,
} from "@prisma/client";

export interface SubscriptionFactoryInput {
  amountTotal: number;
  currency: string;
  created: number;
  paymentIntent: string;
  paymentStatus: string;
  productType: string;
  sessionStatus: string;
  user: User;
}

function getSubscriptionType(productType: string): SubscriptionType {
  switch (productType) {
    case SubscriptionType.MONTHLY.toString():
      return SubscriptionType.MONTHLY;
    case SubscriptionType.ONE_TIME.toString():
      return SubscriptionType.ONE_TIME;
    default:
      return SubscriptionType.TRIAL;
  }
}

function getSubscriptionStatus(
  paymentStatus: string,
  sessionStatus: string
): SubscriptionStatus {
  if (paymentStatus === "paid" && sessionStatus === "complete") {
    return SubscriptionStatus.ACTIVE;
  }
  return SubscriptionStatus.FAILED;
}

export function subscriptionFactory({
  amountTotal,
  currency,
  created,
  paymentIntent,
  paymentStatus,
  productType,
  sessionStatus,
  user,
}: SubscriptionFactoryInput): Pick<
  Subscription,
  | "amountTotal"
  | "currency"
  | "dateExpires"
  | "dateStarted"
  | "paymentId"
  | "paymentProvider"
  | "status"
  | "type"
  | "userId"
> {
  const expiresIn7DaysAt = new Date(created * 1000 + 7 * 24 * 60 * 60 * 1000);
  const expiresIn30DaysAt = new Date(created * 1000 + 30 * 24 * 60 * 60 * 1000);
  const subscriptionType = getSubscriptionType(productType);
  const subscriptionStatus = getSubscriptionStatus(
    paymentStatus,
    sessionStatus
  );

  const dateExpires =
    subscriptionType === SubscriptionType.TRIAL
      ? expiresIn7DaysAt
      : expiresIn30DaysAt;

  return {
    amountTotal: amountTotal || 0,
    currency: currency || "",
    dateExpires,
    dateStarted: new Date(created * 1000),
    paymentId: paymentIntent?.toString() || "",
    paymentProvider: PaymentProvider.STRIPE,
    status: subscriptionStatus,
    type: subscriptionType,
    userId: user.id,
  };
}
