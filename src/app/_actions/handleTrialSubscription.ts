"use server";

import { getUserFromEmail, prisma } from "@/lib/prisma";
import { SubscriptionType } from "@prisma/client";
import { subscriptionFactory } from "../api/payments/utils/subscriptionFactory";

export async function handleTrialSubscription(userEmail: string) {
  try {
    const user = await getUserFromEmail(userEmail);
    if (!user) {
      console.error("User not found");
      return;
    }

    // in a single transaction create trial sub and update user
    // use nested writes
    const subscriptionData = subscriptionFactory({
      created: new Date().getTime(),
      productType: SubscriptionType.TRIAL,
      subscriptionId: "",
      user,
    });

    const subscription = prisma.subscription.create({
      data: subscriptionData,
    });
    const userUpdate = prisma.user.update({
      where: { id: user.id },
      data: {
        trialEnds: subscriptionData.dateExpires,
      },
    });

    const [savedSubscription, savedUser] = await prisma.$transaction([
      subscription,
      userUpdate,
    ]);

    if (savedSubscription && savedUser) {
      return {
        success: true,
        savedSubscription,
        savedUser,
      };
    }
  } catch (error) {
    console.error(
      "Wystąpił błąd podczas tworzenia subskrypcji na okres próbny.",
      error
    );
  }
}
