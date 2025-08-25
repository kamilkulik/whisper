import "server-only";
// import { CheckoutSessionCompletedEvent } from "./subscriptionFactory";
import { prisma } from "@/lib/prisma";
import {
  PaymentProvider,
  SubscriptionStatus,
  SubscriptionType,
} from "@prisma/client";
import Stripe from "stripe";

export async function handleSessionCompleted(
  eventData: Stripe.Checkout.Session
) {
  const {
    id,
    amount_total,
    currency,
    customer_email,
    created,
    payment_status,
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

  const productType = eventData.metadata?.productType || "";
  const subscriptionType =
    productType === SubscriptionType.MONTHLY
      ? SubscriptionType.MONTHLY
      : SubscriptionType.ONE_TIME;
  const expiresIn30DaysAt = new Date(created * 1000 + 30 * 24 * 60 * 60 * 1000);
  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      paymentProvider: PaymentProvider.STRIPE,
      type: subscriptionType,
      status: SubscriptionStatus.ACTIVE,
      dateStarted: new Date(created * 1000),
      dateExpires: expiresIn30DaysAt,
    },
  });

  // TODO: Send email to user with subscription details
  console.log(JSON.stringify(subscription, null, 2));
}
