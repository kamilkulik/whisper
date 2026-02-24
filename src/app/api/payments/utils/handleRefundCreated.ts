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
      userId: true,
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

  await prisma.user.update({
    where: {
      id: subscriptionId.userId
    },
    data: {
      premium: false
    }
  })

  console.log(
    `[ /api/payments/utils/handleRefundCreated ] Premium flag for user ${subscriptionId.userId} set to false`
  )

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
