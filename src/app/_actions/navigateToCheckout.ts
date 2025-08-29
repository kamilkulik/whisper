import { SubscriptionType } from "@prisma/client";
import { CheckoutSessionsPayload } from "../api/checkout-sessions/route";

export async function navigateToCheckout(
  productType: SubscriptionType,
  userEmail: string
) {
  if (!userEmail) {
    console.error("User email not found");
    return;
  }

  console.log("userEmail", userEmail);
  console.log("productType", productType);

  try {
    const checkoutSessionsPayload: CheckoutSessionsPayload = {
      productType: productType || SubscriptionType.TRIAL,
      email: userEmail,
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
      console.error("Wystąpił błąd podczas tworzenia sesji płatności.");
    }
  } catch (error) {
    console.error("Wystąpił błąd podczas tworzenia sesji płatności.");
  }
}
