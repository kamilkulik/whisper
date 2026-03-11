import { prisma } from "@/lib/prisma";
import { subscriptionFactory } from "./subscriptionFactory";
import Stripe from "stripe";
import { SubscriptionType } from "@prisma/client";
import { stripe } from "@/lib/stripe";
import { getSubscriptionTypeByPriceId } from "@/lib/consts";

const LOG_PREFIX = "[ handleSubscriptionCreated ]";

export async function handleSubscriptionCreated(
  eventData: Stripe.Subscription
) {
  const { customer, created, trial_start, trial_end } = eventData;

  console.log(
    `${LOG_PREFIX} Processing subscription ${eventData.id}`,
    `| customer: ${customer}`,
    `| status: ${eventData.status}`,
    `| trial_start: ${trial_start}`,
    `| trial_end: ${trial_end}`
  );

  if (!customer) {
    throw new Error("Customer is required");
  }

  const customerData = await stripe.customers.retrieve(customer.toString());

  if (!customerData || customerData.deleted || !customerData.email) {
    console.error(
      `${LOG_PREFIX} Customer lookup failed`,
      `| customerId: ${customer}`,
      `| deleted: ${customerData && "deleted" in customerData ? customerData.deleted : "N/A"}`,
      `| email: ${customerData && "email" in customerData ? customerData.email : "missing"}`
    );
    throw new Error("No customer data found");
  }

  console.log(
    `${LOG_PREFIX} Customer resolved`,
    `| email: ${customerData.email}`
  );

  const user = await prisma.user.findUnique({
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
    console.error(
      `${LOG_PREFIX} No user found for email: ${customerData.email}`
    );
    throw new Error("User not found");
  }

  console.log(`${LOG_PREFIX} User found | id: ${user.id}`);

  const isTrial = trial_start !== null && trial_end !== null;

  console.log(
    `${LOG_PREFIX} Subscription type determined: ${isTrial ? "TRIAL" : "PAID"}`
  );

  if (isTrial) {
    await handleTrialSubscription(eventData, user, trial_end!, created);
  } else {
    console.log(
      `${LOG_PREFIX} [PAID] No trial subscription`,
      `deferring to handleSessionCompleted`
    );
    // await handlePaidSubscription(eventData, user, created);
  }
}

// ─── Trial Subscription ─────────────────────────────────────────────────────

async function handleTrialSubscription(
  eventData: Stripe.Subscription,
  user: { id: number },
  trialEnd: number,
  created: number
) {
  const trialEndsDate = new Date(trialEnd * 1000);

  console.log(
    `${LOG_PREFIX} [TRIAL] Setting trialEnds on user`,
    `| userId: ${user.id}`,
    `| trialEnds: ${trialEndsDate.toISOString()}`
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { trialEnds: trialEndsDate },
  });

  console.log(`${LOG_PREFIX} [TRIAL] User trialEnds updated`);

  const subscriptionData = subscriptionFactory({
    expiryAdjustmentInMilis: 0,
    created: created * 1000,
    productType: SubscriptionType.TRIAL,
    subscriptionId: eventData.id,
    user,
    trialEnd,
  });

  console.log(
    `${LOG_PREFIX} [TRIAL] Creating subscription record`,
    `| dateStarted: ${subscriptionData.dateStarted.toISOString()}`,
    `| dateExpires: ${subscriptionData.dateExpires?.toISOString()}`,
    `| stripeSubId: ${eventData.id}`
  );

  const subscription = await prisma.subscription.create({
    data: subscriptionData,
  });

  console.log(
    `${LOG_PREFIX} [TRIAL] Subscription created | dbId: ${subscription.id}`
  );
}

// ─── Paid Subscription ──────────────────────────────────────────────────────

async function handlePaidSubscription(
  eventData: Stripe.Subscription,
  user: { id: number },
  created: number
) {
  const trialSubscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      type: SubscriptionType.TRIAL,
    },
    select: { id: true },
  });

  if (trialSubscription) {
    console.log(
      `${LOG_PREFIX} [PAID] Removing existing trial subscription`,
      `| trialSubId: ${trialSubscription.id}`
    );
    await prisma.subscription.delete({
      where: { id: trialSubscription.id },
    });
    console.log(`${LOG_PREFIX} [PAID] Trial subscription removed`);
  } else {
    console.log(`${LOG_PREFIX} [PAID] No existing trial subscription found`);
  }

  const subscriptionItem = eventData.items.data.find(
    (item) => item.object === "subscription_item"
  );

  if (!subscriptionItem) {
    console.error(
      `${LOG_PREFIX} [PAID] No subscription_item found in event items`,
      `| items count: ${eventData.items.data.length}`
    );
    throw new Error("Subscription item not found");
  }

  const productPriceId = subscriptionItem.price.id;

  if (!productPriceId) {
    console.error(`${LOG_PREFIX} [PAID] subscription_item has no price id`);
    throw new Error("No product type found");
  }

  const productType = getSubscriptionTypeByPriceId(productPriceId);

  if (!productType) {
    console.error(
      `${LOG_PREFIX} [PAID] Unknown priceId — cannot map to product type`,
      `| priceId: ${productPriceId}`
    );
    throw new Error("No product type found");
  }

  console.log(
    `${LOG_PREFIX} [PAID] Product resolved`,
    `| priceId: ${productPriceId}`,
    `| productType: ${productType}`
  );

  const subscriptionData = subscriptionFactory({
    expiryAdjustmentInMilis: 0,
    created: created * 1000,
    productType,
    subscriptionId: eventData.id,
    user,
  });

  console.log(
    `${LOG_PREFIX} [PAID] Creating subscription record`,
    `| dateStarted: ${subscriptionData.dateStarted.toISOString()}`,
    `| dateExpires: ${subscriptionData.dateExpires?.toISOString()}`,
    `| stripeSubId: ${eventData.id}`
  );

  const subscription = await prisma.subscription.create({
    data: subscriptionData,
  });

  console.log(
    `${LOG_PREFIX} [PAID] Subscription created | dbId: ${subscription.id}`
  );
}
