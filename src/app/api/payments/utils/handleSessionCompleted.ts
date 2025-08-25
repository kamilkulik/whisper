import "server-only";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { subscriptionFactory } from "./subscriptionFactory";

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

  const subscriptionData = subscriptionFactory({
    amountTotal: amountTotal || 0,
    created,
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
