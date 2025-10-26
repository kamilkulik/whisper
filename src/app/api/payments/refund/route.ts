import { NextRequest, NextResponse } from "next/server";
import { csfrProtection } from "../../utils/csfrProtection";
import {
  getLatestSubscriptionFromUserId,
  getUserFromSessionId,
  prisma,
} from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

// Using Payment Intent ID
const createRefund = async (paymentIntentId: string) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    console.log("[ /api/payments/refund ]", "Refund created:", refund.id);
    return refund;
  } catch (error) {
    console.error("Error creating refund:", error);
    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      error.code === "charge_already_refunded"
    ) {
      console.log(
        "[ /api/payments/refund ] Charge already refunded. Reconciling subscription status and charge..."
      );
      // TODO reconcile subscription status and charge
      return NextResponse.json(
        { message: "Charge already refunded" },
        { status: 200 }
      );
    }
    throw error;
  }
};

export async function DELETE(request: NextRequest) {
  csfrProtection(request);

  const sessionIdFromCookie = request.cookies.get("sessionId")?.value;

  if (!sessionIdFromCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userFromSessionId = await getUserFromSessionId<"id">(
    sessionIdFromCookie,
    {
      id: true,
    }
  );

  if (!userFromSessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeOneTimeSubscription = await getLatestSubscriptionFromUserId(
    userFromSessionId.id
  );

  if (!activeOneTimeSubscription[0].subscriptionId) {
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 }
    );
  }

  await createRefund(activeOneTimeSubscription[0].subscriptionId);

  return NextResponse.json(
    { message: "Subscription refunded" },
    { status: 200 }
  );
}
