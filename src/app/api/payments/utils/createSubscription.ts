import { prisma } from "@/lib/prisma";
import {
  subscriptionFactory,
  SubscriptionFactoryInput,
} from "./subscriptionFactory";

// used primarily for TRIAL subscription
export async function createSubscription({
  amountTotal,
  currency,
  created,
  paymentIntent,
  paymentStatus,
  productType,
  sessionStatus,
  user,
}: SubscriptionFactoryInput): Promise<void> {
  console.log(
    "createSubscription",
    JSON.stringify(
      {
        amountTotal,
        currency,
        created,
        paymentIntent,
        paymentStatus,
        productType,
        sessionStatus,
        user,
      },
      null,
      2
    )
  );
  const subscriptionData = subscriptionFactory({
    amountTotal,
    currency,
    created,
    paymentIntent,
    paymentStatus,
    productType,
    sessionStatus,
    user,
  });

  console.log("subscriptionData", JSON.stringify(subscriptionData, null, 2));

  try {
    await prisma.subscription.create({
      data: subscriptionData,
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create subscription");
  }
}
