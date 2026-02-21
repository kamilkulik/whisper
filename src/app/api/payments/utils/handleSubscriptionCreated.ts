import { prisma } from "@/lib/prisma";
import { subscriptionFactory } from "./subscriptionFactory";
import Stripe from "stripe";
import { SubscriptionType, User } from "@prisma/client";
import { stripe } from "@/lib/stripe";
import { getSubscriptionTypeByPriceId } from "@/lib/consts";
import { sendEmail } from "@/lib/emailapi";
import { getTranslations } from "next-intl/server";

export async function handleSubscriptionCreated(
  eventData: Stripe.Subscription
) {
  const { customer, created } = eventData;

  if (!customer) {
    throw new Error("Customer is required");
  }

  const customerData = await stripe.customers.retrieve(customer.toString());

  // Check if customer is deleted
  if (!customerData || customerData.deleted || !customerData.email) {
    console.error("No customer data found");
    throw new Error("No customer data found");
  }

  const user: Pick<User, "id" | "email" | "messageLanguage"> | null =
    await prisma.user.findUnique({
      where: {
        email: customerData.email,
      },
      select: {
        id: true,
        email: true,
        messageLanguage: true,
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
    select: {
      id: true,
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

  const subscriptionItem = eventData.items.data.find(
    (item) => item.object === "subscription_item"
  );

  if (!subscriptionItem) {
    throw new Error("Subscription item not found");
  }

  const productPriceId = subscriptionItem.price.id;

  if (!productPriceId) {
    throw new Error("No product type found");
  }

  const productType = getSubscriptionTypeByPriceId(productPriceId);

  if (!productType) {
    throw new Error("No product type found");
  }

  // create premium subscription
  const subscriptionData = subscriptionFactory({
    expiryAdjustmentInMilis: 0,
    created: created * 1000,
    productType,
    subscriptionId: eventData.id,
    user,
  });

  try {
    const subscription = await prisma.subscription.create({
      data: subscriptionData,
    });
    console.log(
      "[ /api/payments/utils/handleSubscriptionCreated ]",
      JSON.stringify(subscription, null, 2)
    );
  } catch (error) {
    console.error("Error creating subscription", error);
    throw new Error("Error creating subscription");
  }
}
