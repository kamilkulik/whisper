import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  await prisma.subscription.update({
    where: {
      id: parseInt(subscription.metadata?.subscriptionId),
    },
    data: {
      status: SubscriptionStatus.CANCELLED,
      dateCancelled: new Date(),
    },
  });
}
