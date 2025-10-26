import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

export async function handleRefundCreated(refund: Stripe.Refund) {
  console.log(
    `[ /api/payments/utils/handleRefundCreated ] ✅ Received refund ${refund.id}. Finding subscription...`
  );

  const subscriptionId = await prisma.subscription.findFirst({
    where: {
      subscriptionId: String(refund.payment_intent),
    },
    select: {
      id: true,
    },
  });

  if (!subscriptionId) {
    throw new Error(
      "[ /api/payments/utils/handleRefundCreated ] Subscription not found"
    );
  } else {
    console.log(
      `[ /api/payments/utils/handleRefundCreated ] Subscription ${subscriptionId.id} found`
    );
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

  console.log(
    `[ /api/payments/utils/handleRefundCreated ] Subscription ${subscriptionId.id} updated with refund information`
  );

  // Log the webhook event
  await prisma.webhookEventLog.create({
    data: {
      eventId: refund.id.toString(),
      eventData: JSON.stringify(refund),
      eventType: "refund.created",
    },
  });

  console.log(
    `[ /api/payments/utils/handleRefundCreated ] Webhook event logged: ${refund.id}`
  );
}
