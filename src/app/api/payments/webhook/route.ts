import { NextRequest, NextResponse } from "next/server";
import { stripe, stripeWebhookSecret } from "@/lib/stripe";
import { Buffer } from "node:buffer";
import {
  handleRefundCreated,
  handleSessionCompleted,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
} from "../utils";
import { prisma } from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Define allowed event types for additional security
// https://docs.stripe.com/api/events/types
const ALLOWED_EVENT_TYPES = [
  /**
   * A Checkout Session represents your customer’s session as they pay for
   * one-time purchases or subscriptions through Checkout or Payment Links.
   * We recommend creating a new Session each time your customer attempts to pay.
   * Once payment is successful, the Checkout Session will contain a reference to the Customer,
   * and either the successful PaymentIntent or an active Subscription.
   * You can create a Checkout Session on your server and redirect to its URL to begin Checkout.
   */
  // https://docs.stripe.com/api/checkout/sessions/object
  "checkout.session.completed", // Occurs when a customer completes a checkout session.
  /**
   * This object represents a customer of your business. Use it to create recurring charges, save payment and contact information, and track payments that belong to the same customer.
   */
  "customer.subscription.created", // Occurs whenever a customer is signed up for a new plan.
  "customer.subscription.updated", // Occurs when a subscription is cancelled at the period end
  "customer.subscription.deleted", //Occurs whenever a customer’s subscription ends.
  /**
   * The Charge object represents a single attempt to move money into your Stripe account.
   * PaymentIntent confirmation is the most common way to create Charges,
   * but transferring money to a different Stripe account through Connect also creates Charges.
   * Some legacy payment flows create Charges directly, which is not recommended for new integrations.
   */
  "charge.succeeded", // Occurs whenever a charge is successful.
  "charge.updated", // Occurs whenever a charge description or metadata is updated, or upon an asynchronous capture.
  /**
   * Invoices are statements of amounts owed by a customer, and are either generated one-off, or generated periodically from a subscription.
   */
  "invoice.payment_succeeded", // Occurs whenever an invoice payment attempt succeeds.
  "invoice.payment_failed", // Occurs whenever an invoice payment attempt fails, due to either a declined payment, including soft decline, or to the lack of a stored payment method.
  // https://docs.stripe.com/api/payment_intents/object
  // https://docs.stripe.com/payments/paymentintents/lifecycle#intent-statuses
  /**
   * A PaymentIntent guides you through the process of collecting a payment from your customer.
   * We recommend that you create exactly one PaymentIntent for each order or customer session in your system.
   * You can reference the PaymentIntent later to see the history of payment attempts for a particular session.
   * A PaymentIntent transitions through multiple statuses throughout its lifetime as it interfaces with Stripe.js,
   * to perform authentication flows and ultimately creates at most one successful charge.
   */
  "payment_intent.succeeded", // Occurs when a payment is successful
  "payment_intent.created", // Occurs when a payment intent is created
  "payment_intent.payment_failed", // Occurs when a payment attempt fails
  "payment_method.attached", // Occurs when a payment method is attached
  "refund.created", // Occurs when a refund is created
];

/**
 * payment_intent -> charge ->
 */

export async function POST(request: NextRequest) {
  try {
    let event;
    console.log("[ /api/payments/webhook ]", "Webhook received");

    if (stripeWebhookSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers.get("stripe-signature");
      if (!signature) {
        console.error("⚠️  No signature found in webhook request");
        return NextResponse.json(
          { error: "No signature found" },
          { status: 400 }
        );
      }

      try {
        const rawBody = Buffer.from(await request.arrayBuffer());
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          stripeWebhookSecret
        );
        console.log(
          `[ /api/payments/webhook ] ✅ Webhook signature verified for event: ${event.type}`
        );
      } catch (err: any) {
        console.error(
          `⚠️  Webhook signature verification failed.`,
          err.message
        );
        return NextResponse.json(
          { error: "Webhook signature verification failed" },
          { status: 400 }
        );
      }

      // Validate event type for additional security`
      if (!ALLOWED_EVENT_TYPES.includes(event.type)) {
        console.log(
          `[ /api/payments/webhook ] ⚠️  Unexpected event type: ${event.type}, SKIPPING`
        );
        return NextResponse.json(
          { error: "Unexpected event type" },
          { status: 400 }
        );
      }

      // Check if this event was already processed
      const existingEvent = await prisma.webhookEventLog.findFirst({
        where: {
          eventId: event.id,
        },
        select: {
          id: true,
        },
      });

      if (existingEvent) {
        console.log(
          `[ /api/payments/webhook ] ⚠️  Event ${event.id} already processed, skipping`
        );
        return NextResponse.json(
          { message: "Event already processed" },
          { status: 200 }
        );
      }

      try {
        // Handle the event
        switch (event.type) {
          // for NOW, let's focus on handling on checkout session completed
          case "checkout.session.completed":
            const checkoutSession = event.data.object;
            console.log(
              `[ /api/payments/webhook ] ✅ CheckoutSession for ${
                checkoutSession.amount_total
                  ? checkoutSession.amount_total / 100
                  : 0
              } was successful!`
            );
            await handleSessionCompleted(checkoutSession);
            break;
          case "customer.subscription.updated":
            const subscription = event.data.object;
            console.log(
              `[ /api/payments/webhook ] ✅ Subscription ${subscription.id} was updated`
            );
            await handleSubscriptionUpdated(subscription);
            break;
          case "refund.created":
            const refund = event.data.object;
            console.log(
              `[ /api/payments/webhook ] ✅ Refund ${refund.id} was created`
            );
            await handleRefundCreated(refund);
            break;
          case "customer.subscription.created":
            const subscriptionCreated = event.data.object;
            console.log(`✅ Subscription ${subscriptionCreated.id} was created!`);
            await handleSubscriptionCreated(subscriptionCreated);
            break;
          // case "payment_intent.succeeded":
          //   const paymentIntent = event.data.object;
          //   console.log(
          //     `✅ PaymentIntent for ${paymentIntent.amount / 100} was successful!`
          //   );
          //   // handlePaymentIntentSucceeded(paymentIntent);
          //   break;
          // case "payment_method.attached":
          //   const paymentMethod = event.data.object;
          //   console.log(`PaymentMethod ${paymentMethod.id} was attached`);
          //   // Then define and call a method to handle the successful attachment of a PaymentMethod.
          //   // handlePaymentMethodAttached(paymentMethod);
          //   break;
          default:
            // Unexpected event type (shouldn't reach here due to validation above)
            console.log(
              `[ /api/payments/webhook ] Unhandled event type ${event.type}.`
            );
        }
      } catch (error) {
        console.error(
          "[ /api/payments/webhook ] Error processing event:",
          error
        );
        return NextResponse.json(
          { error: "[ /api/payments/webhook ] Failed to process webhook" },
          { status: 500 }
        );
      }
    } else {
      console.log(
        "[ /api/payments/webhook ] ⚠️  No webhook secret configured - running in development mode"
      );
    }

    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
