"use server";

import {
  getLatestSubscriptionFromUserId,
  getUserFromSessionId,
} from "@/lib/prisma";
import { SubscriptionType } from "@prisma/client";
import { cookies } from "next/headers";

export async function shouldShowTrial() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId");

  if (!sessionId) {
    return true;
  }

  const user = await getUserFromSessionId(sessionId.value);

  if (!user) {
    return true;
  }

  if (user.trialEnds) {
    return false;
  }

  const subscription = await getLatestSubscriptionFromUserId(user.id);

  if (!subscription || subscription.length === 0) {
    return true;
  }

  if (subscription[0].type === SubscriptionType.TRIAL) {
    return false;
  }

  return false;
}
