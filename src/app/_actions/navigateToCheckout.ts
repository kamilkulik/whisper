"use server";

import { Subscription, SubscriptionType, User } from "@prisma/client";
import { CheckoutSessionsPayload } from "../api/checkout-sessions/route";
import { handleTrialSubscription } from "./handleTrialSubscription";
import { getLatestActiveSubscriptionForUserEmail } from "@/lib/prisma";
import { getBaseUrl } from "../api/utils/baseUrl";

export async function navigateToCheckout(
  productType: SubscriptionType,
  email: string,
  triangulatedCountry?: string
): Promise<{
  success: boolean;
  savedSubscription?: Subscription;
  savedUser?: User;
  hasCurrentActiveSubscription?: boolean;
  checkoutUrl?: string;
}> {
  if (!email) {
    console.error("User email not found");
    return { success: false };
  }

  console.log("[ navigateToCheckout ]", "user email", email);
  console.log("[ navigateToCheckout ]", "productType", productType);

  // does the user already have an ACTIVE subscription?
  const subscription = await getLatestActiveSubscriptionForUserEmail(email);
  console.log(
    "[ navigateToCheckout ]",
    "latest active subscription: ",
    subscription
  );
  if (subscription && subscription.type !== SubscriptionType.TRIAL) {
    return { success: true, hasCurrentActiveSubscription: true };
  }

  if (productType === SubscriptionType.TRIAL) {
    return handleTrialSubscription(email);
  }

  try {
    const checkoutSessionsPayload: CheckoutSessionsPayload = {
      productType,
      email,
    };

    const baseUrl = await getBaseUrl();
    const checkoutUrl = `${baseUrl}/api/checkout-sessions`;
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
