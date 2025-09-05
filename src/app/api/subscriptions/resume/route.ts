import {
  getLatestSubscriptionFromUserId,
  getUserFromSessionId,
} from "@/lib/prisma";
import { csfrProtection } from "../../utils/csfrProtection";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  csfrProtection(request);

  const sessionIdFromCookie = request.cookies.get("sessionId")?.value;

  if (!sessionIdFromCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userFromSessionId = await getUserFromSessionId(sessionIdFromCookie);

  if (!userFromSessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await getLatestSubscriptionFromUserId(
    userFromSessionId.id
  );

  if (!subscription[0].subscriptionId) {
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 }
    );
  }

  try {
    await stripe.subscriptions.update(subscription[0].subscriptionId, {
      cancel_at_period_end: false,
    });
  } catch (error) {
    console.error("Error resuming subscription:", error);
    return NextResponse.json(
      { error: "Error resuming subscription" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Subscription resumed" },
    { status: 200 }
  );
}
