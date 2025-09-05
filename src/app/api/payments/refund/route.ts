import { NextRequest, NextResponse } from "next/server";
import { csfrProtection } from "../../utils/csfrProtection";
import {
  getLatestSubscriptionFromUserId,
  getUserFromSessionId,
} from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// Using Payment Intent ID
const createRefund = async (paymentIntentId: string) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      // For partial refunds, specify amount in smallest currency unit (e.g., cents)
      // amount: 1000, // $10.00
    });

    console.log("Refund created:", refund.id);
    return refund;
  } catch (error) {
    console.error("Error creating refund:", error);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  csfrProtection(request);

  const sessionIdFromCookie = request.cookies.get("sessionId")?.value;

  if (!sessionIdFromCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userFromSessionId = await getUserFromSessionId(sessionIdFromCookie);

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
