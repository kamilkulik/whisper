import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { stripeStatusToPrismaStatus } from "./stripeStatusToPrismaStatus";

// function to check for cancellation information:
/**
 *   "cancel_at": 1759228434,
 *   "cancel_at_period_end": true,
 *   "canceled_at": 1756620793,
 *   "cancellation_details": {
 *      "comment": null,
 *      "feedback": null,
 *      "reason": "cancellation_requested"
 *   }
 */

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  console.log(
    `[ /api/payments/utils/handleSubscriptionUpdated ] 💰💰💰 Subscription ${subscription.id} was updated`
  );

  try {
    await prisma.subscription.update({
      where: {
        id: parseInt(subscription.metadata?.subscriptionId),
      },
      data: {
        status: stripeStatusToPrismaStatus(subscription.status),
        dateCancelled: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      },
    });
  } catch (error) {
    console.error("Error updating subscription", error);
    throw new Error("Error updating subscription");
  }

  // Log the webhook event
  await prisma.webhookEventLog.create({
    data: {
      eventId: subscription.id.toString(),
      eventData: JSON.stringify(subscription),
      eventType: "customer.subscription.updated",
    },
  });
}
