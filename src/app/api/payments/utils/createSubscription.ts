import { prisma } from "@/lib/prisma";
import {
  subscriptionFactory,
  SubscriptionFactoryInput,
} from "./subscriptionFactory";
import { Subscription } from "@prisma/client";

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
}: SubscriptionFactoryInput): Promise<Subscription> {
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
    const subscription = await prisma.subscription.create({
      data: subscriptionData,
    });

    return subscription;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create subscription");
  }
}
