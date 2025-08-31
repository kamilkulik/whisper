import {
  getLatestSubscriptionFromUserId,
  getUserFromSessionId,
} from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { csfrProtection } from "../utils/csfrProtection";
import { stripe } from "@/lib/stripe";

const cancelAtPeriodEnd = async (
  stripeSubscriptionId: string,
  subscriptionId: number
) => {
  try {
    const subscription = await stripe.subscriptions.update(
      stripeSubscriptionId,
      {
        cancel_at_period_end: true,
        metadata: {
          subscriptionId: subscriptionId.toString(),
        },
      }
    );
    return subscription;
  } catch (error) {
    console.error("Error scheduling subscription cancellation:", error);
    throw error;
  }
};

export async function DELETE(request: NextRequest) {
  try {
    csfrProtection(request);

    const sessionIdFromCookie = request.cookies.get("sessionId")?.value;

    if (!sessionIdFromCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userFromSessionId = await getUserFromSessionId(sessionIdFromCookie);

    if (!userFromSessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await getLatestSubscriptionFromUserId(
      userFromSessionId.id
    );

    if (subscriptions.length === 0 || !subscriptions[0].subscriptionId) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    await cancelAtPeriodEnd(
      subscriptions[0].subscriptionId,
      subscriptions[0].id
    );

    return NextResponse.json(
      { message: "Subscription cancelled" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Error canceling subscription" },
      { status: 500 }
    );
  }
}
