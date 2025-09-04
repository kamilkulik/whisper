import { prisma } from "@/lib/prisma";
import { subscriptionFactory } from "./subscriptionFactory";
import Stripe from "stripe";
import { SubscriptionType } from "@prisma/client";
import { sendEmail } from "@/lib/emailapi";

export async function handlePaymentIntentSucceeded(
  eventData: Stripe.PaymentIntent
) {
  const { receipt_email, created } = eventData;

  if (!receipt_email) {
    throw new Error("Customer is required");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: receipt_email,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // see if the uesr had a trial subscription
  const trialSubscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      type: SubscriptionType.TRIAL,
    },
  });

  // if there is a trial - just remove the subscription - premium is created instead
  if (trialSubscription) {
    await prisma.subscription.delete({
      where: {
        id: trialSubscription.id,
      },
    });
  }

  const productType = eventData.metadata.productType;

  if (!productType) {
    throw new Error("No product type found");
  }

  // create premium subscription
  const subscriptionData = subscriptionFactory({
    created: created * 1000,
    productType,
    subscriptionId: eventData.id,
    user,
  });

  try {
    const subscription = await prisma.subscription.create({
      data: subscriptionData,
    });
    console.log(JSON.stringify(subscription, null, 2));
  } catch (error) {
    console.error("Error creating subscription", error);
    throw new Error("Error creating subscription");
  }

  try {
    await sendEmail({
      to: user.email,
      subject: "Witamy w serwisie Wieczorny Szept",
      template: "welcome",
      subscriptionType: SubscriptionType.ONE_TIME,
    });
  } catch (error) {
    console.error("Error sending email", error);
    throw new Error("Error sending email");
  }
}
