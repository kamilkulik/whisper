import "server-only";
import Stripe from "stripe";
import { createSubscription } from "./createSubscription";
import { prisma } from "@/lib/prisma";
import { getSubscriptionType } from "@/lib/consts";
import { sendEmail } from "@/lib/emailapi";
import { User } from "@prisma/client";

export async function handleSessionCompleted(
  eventData: Stripe.Checkout.Session
) {
  if (!eventData.metadata) {
    throw new Error("Metadata not found");
  }

  const { productType } = eventData.metadata;

  console.log("handleSessionCompleted: metadata present, proceeding...");

  let user: User | null = null;
  try {
    user = await prisma.user.findUnique({
      where: {
        email: eventData.customer_email!,
      },
    });
  } catch (error) {
    console.error("Error finding user", error);
  }

  if (!user) {
    throw new Error("User not found");
  }

  const subscription = await createSubscription({
    created: eventData.created * 1000,
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

  try {
    await sendEmail({
      to: user.email,
      subject: "Witamy w serwisie Wieczorny Szept",
      message: "Witamy w serwisie Wieczorny Szept",
      template: "welcome",
    });
  } catch (error) {
    console.error("Error sending email", error);
    throw new Error("Error sending email");
  }
}
