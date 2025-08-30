import "server-only";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { subscriptionFactory } from "./subscriptionFactory";
import { SubscriptionType } from "@prisma/client";

// used primarily for PREMIUM subscription
// in response to a webhook event from payment provider
export async function handleSessionCompleted(
  eventData: Stripe.Checkout.Session
) {
  console.log("handleSessionCompleted", JSON.stringify(eventData, null, 2));
}
