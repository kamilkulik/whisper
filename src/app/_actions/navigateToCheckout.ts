"use server";

import { Subscription, SubscriptionType, User } from "@prisma/client";
import { CheckoutSessionsPayload } from "../api/checkout-sessions/route";
import { handleTrialSubscription } from "./handleTrialSubscription";
import { getUsersLatestActiveSubscription } from "@/lib/prisma";
import { getBaseUrl } from "../api/utils/baseUrl";

export interface CheckoutMeta {
  fbp?: string;
  fbc?: string;
  eventId?: string;
  eventSourceUrl?: string;
}

export async function navigateToCheckout(
  productType: SubscriptionType,
  email?: string,
  triangulatedCountry?: string,
  meta?: CheckoutMeta,
  phoneNumber?: string,
  userId?: number,
): Promise<{
  success: boolean;
  savedSubscription?: Subscription;
  savedUser?: User;
  hasCurrentActiveSubscription?: boolean;
  checkoutUrl?: string;
}> {
  if (!email && !phoneNumber && !userId) {
    console.error("User email or phone number or user id not provided");
    return { success: false };
  }

  console.log("[ navigateToCheckout ]", "user: ", email ?? phoneNumber ?? userId);
  console.log("[ navigateToCheckout ]", "productType", productType);

  // does the user already have an ACTIVE subscription?
  const subscription = await getUsersLatestActiveSubscription(email, phoneNumber, userId);
  console.log(
    "[ navigateToCheckout ]",
    "latest active subscription: ",
    subscription
  );
  if (subscription && subscription.type !== SubscriptionType.TRIAL) {
    return { success: true, hasCurrentActiveSubscription: true };
  }

  if (productType === SubscriptionType.TRIAL) {
    return handleTrialSubscription(email, phoneNumber, userId);
  }

  try {
    const checkoutSessionsPayload: CheckoutSessionsPayload = {
      productType,
      clientReferenceId: email ?? phoneNumber ?? userId?.toString(),
      ...(email ? { email } : {}),
      ...(meta && {
        fbp: meta.fbp,
        fbc: meta.fbc,
        eventId: meta.eventId,
        eventSourceUrl: meta.eventSourceUrl,
      }),
    };

    const baseUrl = await getBaseUrl();
    const checkoutUrl = `${baseUrl}/api/checkout-sessions`;

    console.log("[ navigateToCheckout ] checkoutSessionsPayload: ", checkoutSessionsPayload);

    const checkoutResponse = await fetch(checkoutUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(triangulatedCountry
          ? { "x-triangulated-country": triangulatedCountry }
          : {}),
      },
      body: JSON.stringify(checkoutSessionsPayload),
    });

    if (checkoutResponse.ok) {
      const { url } = await checkoutResponse.json();
      if (url) {
        return { success: true, checkoutUrl: url };
      }
      return { success: true };
    } else {
      console.error(
        "[ navigateToCheckout ]",
        "Error calling checkout session API: ",
        checkoutResponse
      );
      return { success: false };
    }
  } catch (error) {
    console.error(
      "[ navigateToCheckout ]",
      "Error creating checkout session.",
      error
    );
    return { success: false };
  }
}
