import "server-only";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { subscriptionFactory } from "./subscriptionFactory";
import { SubscriptionType } from "@prisma/client";

// used primarily for PREMIUM subscription
// in response to a webhook event from payment provider
export async function handleSessionCompleted(
  eventData: Stripe.Checkout.Session
) {
  const {
    amount_total: amountTotal,
    currency,
    customer_email,
    created,
    payment_status,
    payment_intent,
    status: sessionStatus,
  } = eventData;

  if (!customer_email) {
    throw new Error("Customer email is required");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: customer_email,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // see if the uesr had a trial subscription
  const trialSubscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      type: SubscriptionType.TRIAL,
    },
  });

  // if there is a trial - just remove the subscription - premium is created instead
  if (trialSubscription) {
    await prisma.subscription.delete({
      where: {
        id: trialSubscription.id,
      },
    });
  }

  // create premium subscription
  const subscriptionData = subscriptionFactory({
    amountTotal: amountTotal || 0,
    created: created * 1000,
    currency: currency || "",
    paymentIntent: payment_intent?.toString() || "",
    paymentStatus: payment_status || "",
    productType: eventData.metadata?.productType || "",
    sessionStatus: sessionStatus || "",
    user,
  });

  const subscription = await prisma.subscription.create({
    data: subscriptionData,
  });

  // TODO: Send email to user with subscription details
  console.log(JSON.stringify(subscription, null, 2));
}
