import "server-only";
import Stripe from "stripe";
import { createSubscription } from "./createSubscription";
import { prisma } from "@/lib/prisma";
import { getSubscriptionType } from "@/lib/consts";
import { sendEmail } from "@/lib/emailapi";
import { SubscriptionStatus, SubscriptionType, User } from "@prisma/client";

export async function handleSessionCompleted(
  eventData: Stripe.Checkout.Session
) {
  if (!eventData.metadata) {
    throw new Error("Metadata not found");
  }

  const { productType } = eventData.metadata;

  console.log(
    "[ /api/payments/utils/handleSessionCompleted ] metadata present, proceeding..."
  );

  let user: Pick<User, "id" | "email" | "messageLanguage" | "premium"> | null =
    null;
  try {
    user = await prisma.user.findUnique({
      where: {
        email: eventData.customer_email!,
      },
      select: {
        id: true,
        email: true,
        messageLanguage: true,
        premium: true,
      },
    });
  } catch (error) {
    console.error("Error finding user", error);
  }

  if (!user) {
    throw new Error("User not found");
  }

  // latest active user subscription
  const latestActiveSubscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: SubscriptionStatus.ACTIVE,
      type: SubscriptionType.ONE_TIME,
      dateExpires: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let expiryAdjustmentInMilis = 0;
  // if latestActiveSubscription exists, see how many days are left until expiration
  // but only for ONE_TIME subs - stack them.
  // MONTHLY subscription always overwrites existing subs
  if (
    latestActiveSubscription &&
    latestActiveSubscription.dateExpires &&
    productType === SubscriptionType.ONE_TIME
  ) {
    expiryAdjustmentInMilis = Math.floor(
      latestActiveSubscription.dateExpires.getTime() - new Date().getTime()
    );
  }

  const subscription = await createSubscription({
    created: eventData.created * 1000,
    expiryAdjustmentInMilis,
    productType: getSubscriptionType(productType),
    subscriptionId: eventData?.subscription
      ? eventData.subscription.toString()
      : eventData.payment_intent!.toString(),
    user,
  });

  if (!subscription) {
    throw new Error(
      "Subscription couldn't be created. Aborting notifying user"
    );
  }

  // TODO below could be performed async so the user doesn't have to wait

  // mark user as premium
  if (!user.premium) {
    await prisma.user.update({
      where: { id: user.id },
      data: { premium: true },
    });
  }

  // notify them
  try {
    await sendEmail({
      locale: user.messageLanguage.toLowerCase(),
      subject: "Witamy w serwisie Wieczorny Szept",
      subscriptionType: subscription.type,
      to: user.email,
      template: "welcome",
    });
  } catch (error) {
    console.error("Error sending email", error);
    throw new Error("Error sending email");
  }

  // Log the webhook event
  await prisma.webhookEventLog.create({
    data: {
      eventId: eventData.id.toString(),
      eventData: JSON.stringify(eventData),
      eventType: "checkout.session.completed",
    },
  });
}
