import { prisma } from "@/lib/prisma";
import {
  subscriptionFactory,
  SubscriptionFactoryInput,
} from "./subscriptionFactory";
import { Prisma, Subscription } from "@prisma/client";

export async function createSubscription({
  created,
  expiryAdjustmentInMilis,
  productType,
  subscriptionId,
  user,
  tx,
}: SubscriptionFactoryInput & {
  tx?: Prisma.TransactionClient;
}): Promise<Subscription> {
  console.log(
    "[ /api/payments/utils/createSubscription ] createSubscription",
    JSON.stringify(
      {
        created,
        expiryAdjustmentInMilis,
        productType,
        user,
      },
      null,
      2
    )
  );
  const subscriptionData = subscriptionFactory({
    created,
    expiryAdjustmentInMilis,
    productType,
    subscriptionId,
    user,
  });

  console.log(
    "[ /api/payments/utils/createSubscription ] subscriptionData",
    JSON.stringify(subscriptionData, null, 2)
  );

  try {
    const client = tx ?? prisma;
    const subscription = await client.subscription.create({
      data: subscriptionData,
    });

    return subscription;
  } catch (error) {
    console.error(error);
    throw new Error(
      "[ /api/payments/utils/createSubscription ] Failed to create subscription"
    );
  }
}
