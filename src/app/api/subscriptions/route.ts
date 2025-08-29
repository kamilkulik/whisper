import {
  getSubscriptionFromUserId,
  getUserFromSessionId,
  prisma,
} from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  const sessionIdFromCookie = request.cookies.get("sessionId")?.value;

  if (!sessionIdFromCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userFromSessionId = await getUserFromSessionId(sessionIdFromCookie);

  if (!userFromSessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await getSubscriptionFromUserId(userFromSessionId.id);

  if (!subscription) {
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 }
    );
  }

  await prisma.subscription.delete({
    where: { id: subscription.id },
  });

  return NextResponse.json(
    { message: "Subscription deleted" },
    { status: 200 }
  );
}
