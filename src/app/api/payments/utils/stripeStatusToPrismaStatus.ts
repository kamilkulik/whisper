import { SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

export function stripeStatusToPrismaStatus(
  status: Stripe.Subscription.Status
): SubscriptionStatus {
  switch (status) {
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "canceled":
      return SubscriptionStatus.CANCEL_AT_PERIOD_END;
    case "past_due":
      return SubscriptionStatus.PENDING;
    case "incomplete":
      return SubscriptionStatus.PENDING;
    case "incomplete_expired":
      return SubscriptionStatus.EXPIRED;
    case "paused":
      return SubscriptionStatus.PAUSED;
    case "unpaid":
      return SubscriptionStatus.FAILED;
    default:
      throw new Error(`Invalid subscription status: ${status}`);
  }
}
