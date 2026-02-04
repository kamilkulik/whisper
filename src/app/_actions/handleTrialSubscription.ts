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

    if (savedSubscription && savedUser) {
      try {
        const t = await getTranslations("EmailTemplates.Welcome");
        await sendEmail({
          locale: savedUser.messageLanguage.toLowerCase(),
          subject: t("subject"),
          subscriptionType: SubscriptionType.TRIAL,
          template: "welcome",
          to: savedUser.email,
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
    return { success: false };
  }
}
