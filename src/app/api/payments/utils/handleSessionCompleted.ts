import "server-only";
import Stripe from "stripe";

export async function handleSessionCompleted(
  eventData: Stripe.Checkout.Session
) {
  console.log("handleSessionCompleted", JSON.stringify(eventData, null, 2));
}
