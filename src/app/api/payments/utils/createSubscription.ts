import { prisma } from "@/lib/prisma";
import {
  subscriptionFactory,
  SubscriptionFactoryInput,
} from "./subscriptionFactory";
import { Subscription } from "@prisma/client";

export async function createSubscription({
  created,
  productType,
  subscriptionId,
  user,
}: SubscriptionFactoryInput): Promise<Subscription> {
  console.log(
    "createSubscription",
    JSON.stringify(
      {
        created,
        productType,
        user,
      },
      null,
      2
    )
  );
  const subscriptionData = subscriptionFactory({
    created,
    productType,
    subscriptionId,
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
