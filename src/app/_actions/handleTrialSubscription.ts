"use server";

import { getUserFromEmail, prisma } from "@/lib/prisma";
import { Subscription, SubscriptionType, User } from "@prisma/client";
import { subscriptionFactory } from "../api/payments/utils/subscriptionFactory";
import { sendEmail } from "@/lib/emailapi";
import { getTranslations } from "next-intl/server";

export async function handleTrialSubscription(userEmail: string): Promise<{
  success: boolean;
  savedSubscription?: Subscription;
  savedUser?: User;
}> {
  try {
    const user = await getUserFromEmail(userEmail);
    if (!user) {
      console.error("User not found");
      return { success: false };
    }

    // in a single transaction create trial sub and update user
    // use nested writes
    const subscriptionData = subscriptionFactory({
      expiryAdjustmentInMilis: 0,
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

    return {
      success: true,
      savedSubscription,
      savedUser,
    };
  } catch (error) {
    console.error(
      "Error creating trial subscription",
      error
    );
    return { success: false };
  }
}
