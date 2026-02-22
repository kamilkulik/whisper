"use server";

import { getUserFromEmail, getUserFromPhoneNumber, prisma } from "@/lib/prisma";
import { Subscription, SubscriptionType, User } from "@prisma/client";
import { subscriptionFactory } from "../api/payments/utils/subscriptionFactory";

export async function handleTrialSubscription(
  userEmail?: string,
  phoneNumber?: string,
  userId?: number
): Promise<{
  success: boolean;
  savedSubscription?: Subscription;
  savedUser?: User;
}> {
  try {
    let existingUserId: number | undefined;

    if (!userId) {
      if (userEmail) {
        existingUserId = (await getUserFromEmail(userEmail))?.id;
      } else if (phoneNumber) {
        existingUserId = (await getUserFromPhoneNumber(phoneNumber))?.id;
      }
    } else {
      existingUserId = userId;
    }

    if (!existingUserId) {
      console.error("User not found");
      return { success: false };
    }

    const user = { id: existingUserId } as Pick<User, "id">;

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
