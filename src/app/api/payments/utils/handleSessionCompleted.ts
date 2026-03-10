import "server-only";
import Stripe from "stripe";
import { createSubscription } from "./createSubscription";
import { prisma } from "@/lib/prisma";
import { getSubscriptionType } from "@/lib/consts";
import { sendEmail } from "@/lib/emailapi";
import { SubscriptionStatus, SubscriptionType, User } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { sendCapiEvent, buildCapiUserData } from "@/lib/fbCapi";
import { Event } from "@/lib/fbq";
import { after } from "next/server";

export async function handleSessionCompleted(
  eventData: Stripe.Checkout.Session,
) {
  if (!eventData.metadata) {
    throw new Error("Metadata not found");
  }

  const { productType } = eventData.metadata;

  console.log(
    "[ /api/payments/utils/handleSessionCompleted ] metadata present, proceeding...",
  );

  let user: Pick<User, "id" | "email" | "phoneNumber" | "messageLanguage" | "premium"> | null =
    null;
  try {
    const clientRef = eventData.client_reference_id!;
    const clientRefAsNum = Number(clientRef);

    const selectFields = {
      id: true,
      email: true,
      phoneNumber: true,
      messageLanguage: true,
      premium: true,
    };

    // A user ID will be entirely numeric. A phone number will start with '+' and/or contain spaces
    const isUserId = /^\d+$/.test(clientRef);

    // If it's purely digits, look up by ID; otherwise treat as phone number
    if (isUserId) {
      const clientRefAsNum = parseInt(clientRef, 10);
      console.log(
        `[ /api/payments/utils/handleSessionCompleted ] User ID is integer: ${clientRefAsNum}`,
      );
      user = await prisma.user.findFirst({
        where: { id: clientRefAsNum },
        select: selectFields,
      });
    }

    // Fallback: look up by phone number (covers both phone-string refs and ID miss)
    if (!user) {
      console.log(
        `[ /api/payments/utils/handleSessionCompleted ] User ID is not an integer. Looking up user by phone number: ${clientRef}`,
      );
      user = await prisma.user.findFirst({
        where: { phoneNumber: clientRef },
        select: selectFields,
      });
    }
  } catch (error) {
    console.error(
      `[ /api/payments/utils/handleSessionCompleted ] Error finding user #${eventData.client_reference_id}`,
      error,
    );
  }

  if (!user) {
    throw new Error(
      `[ /api/payments/utils/handleSessionCompleted ] User #${eventData.client_reference_id} not found`,
    );
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
      latestActiveSubscription.dateExpires.getTime() - new Date().getTime(),
    );
    console.log(
      `[ /api/payments/utils/handleSessionCompleted ] Expiry adjustment in milis: ${expiryAdjustmentInMilis}`,
    );
  }

  console.log(
    "[ /api/payments/utils/handleSessionCompleted ] Starting transaction to create subscription, update user and log webhook event",
  );

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
      "[ /api/payments/utils/handleSessionCompleted ] Subscription couldn't be created. Aborting notifying user",
    );
  } else {
    console.log(
      `[ /api/payments/utils/handleSessionCompleted ] Subscription ${subscription.id} created successfully`,
    );
  }

  // TODO below could be performed async so the user doesn't have to wait
  console.log()

  // mark user as premium
  if (!user.premium) {
    await prisma.user.update({
      where: { id: user.id },
      data: { premium: true },
    });
    console.log(
      `[ /api/payments/utils/handleSessionCompleted ] User ${user.email} marked as premium`,
    );
  }

  const userEmailFromEvent = eventData.customer_details?.email;
  if (!user.email && userEmailFromEvent) {
    await prisma.user.update({
      where: { id: user.id },
      data: { email: userEmailFromEvent },
    });
    console.log(
      `[ /api/payments/utils/handleSessionCompleted ] User ${user.id} email updated to ${userEmailFromEvent}`,
    );
  }

  // Log the webhook event
  await prisma.webhookEventLog.create({
    data: {
      eventId: eventData.id.toString(),
      eventData: JSON.stringify(eventData),
      eventType: "checkout.session.completed",
    },
  });

  // notify them

  if (userEmailFromEvent) {
    try {
      const locale = user.messageLanguage.toLowerCase()
      const t = await getTranslations({ locale, namespace: "EmailTemplates.Welcome" })
      await sendEmail({
        locale,
        subject: t("subject"),
        subscriptionType: getSubscriptionType(productType),
        to: userEmailFromEvent,
        template: "welcome",
      });
    } catch (error) {
      console.error(
        "[ /api/payments/utils/handleSessionCompleted ] Error sending email",
        error,
      );
      throw new Error(
        "[ /api/payments/utils/handleSessionCompleted ] Error sending email",
      );
    }
  }


  console.log(
    `[ /api/payments/utils/handleSessionCompleted ] Webhook event logged: ${eventData.id}`,
  );

  // Purchase CAPI (fire-and-forget); fbp/fbc/eventId from session metadata
  const fbp = eventData.metadata?.fbp;
  const fbc = eventData.metadata?.fbc;
  const purchaseEventId = eventData.metadata?.purchase_event_id;
  const amountTotal = eventData.amount_total ?? 0;
  const value = (amountTotal / 100).toFixed(2);
  const currency = (eventData.currency ?? "usd").toUpperCase();

  after(
    sendCapiEvent({
      eventName: Event.Purchase,
      eventTime: eventData.created,
      actionSource: "website",
      userData: buildCapiUserData({ fbp, fbc, email: user.email }),
      clientUserAgent: "",
      eventId: purchaseEventId ?? undefined,
      customData: { currency, value },
    }).catch(() => { })
  );

  return {
    success: true,
  };
}
