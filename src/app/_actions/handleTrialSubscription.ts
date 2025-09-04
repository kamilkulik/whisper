"use server";

import { getUserFromEmail, prisma } from "@/lib/prisma";
import { SubscriptionType } from "@prisma/client";
import { subscriptionFactory } from "../api/payments/utils/subscriptionFactory";
import { sendEmail } from "@/lib/emailapi";

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
      try {
        await sendEmail({
          to: savedUser.email,
          subject: "Witamy w serwisie Wieczorny Szept",
          template: "welcome",
          subscriptionType: SubscriptionType.TRIAL,
        });
      } catch (error) {
        console.error(
          "Wystąpił błąd podczas wysyłania emaila z powitalnym szeptem.",
          error
        );
      }

      return {
        success: true,
        savedSubscription,
        savedUser,
      };
    } else {
      return {
        success: false,
      };
    }
  } catch (error) {
    console.error(
      "Wystąpił błąd podczas tworzenia subskrypcji na okres próbny.",
      error
    );
  }
}
