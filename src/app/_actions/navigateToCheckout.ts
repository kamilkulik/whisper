import { SubscriptionType } from "@prisma/client";
import { CheckoutSessionsPayload } from "../api/checkout-sessions/route";
import { handleTrialSubscription } from "./handleTrialSubscription";

export async function navigateToCheckout(
  productType: SubscriptionType,
  email: string
) {
  if (!email) {
    console.error("User email not found");
    return;
  }

  console.log("user email", email);
  console.log("productType", productType);

  if (productType === SubscriptionType.TRIAL) {
    return handleTrialSubscription(email);
  }

  try {
    const checkoutSessionsPayload: CheckoutSessionsPayload = {
      productType,
      email,
    };

    const checkoutResponse = await fetch("/api/checkout-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutSessionsPayload),
    });

    if (checkoutResponse.ok) {
      const { url } = await checkoutResponse.json();
      if (url) {
        window.location.href = url;
      }
    } else {
      console.error(
        "Wystąpił błąd podczas tworzenia sesji płatności: ",
        checkoutResponse
      );
    }
  } catch (error) {
    console.error("Wystąpił błąd podczas tworzenia sesji płatności.", error);
  }
}
