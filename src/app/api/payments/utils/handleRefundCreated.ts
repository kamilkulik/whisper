import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

export async function handleRefundCreated(refund: Stripe.Refund) {
  console.log(`✅ Refund ${refund.id} was created`);

  const subscriptionId = await prisma.subscription.findFirst({
    where: {
      subscriptionId: String(refund.payment_intent),
    },
  });

  if (!subscriptionId) {
    throw new Error("Subscription not found");
  }

  await prisma.subscription.update({
    where: {
      id: subscriptionId?.id,
    },
    data: {
      dateRefunded: new Date(),
      status: SubscriptionStatus.REFUNDED,
    },
  });

  // Log the webhook event
  await prisma.webhookEventLog.create({
    data: {
      eventId: refund.id.toString(),
      eventData: JSON.stringify(refund),
    },
  });
}
