import { prisma } from "@/lib/prisma";
import {
  subscriptionFactory,
  SubscriptionFactoryInput,
} from "./subscriptionFactory";

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

  try {
    await prisma.subscription.create({
      data: subscriptionData,
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create subscription");
  }
}
