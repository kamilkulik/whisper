"use server";

import { getSubscriptionFromUserId, getUserFromSessionId } from "@/lib/prisma";
import { SubscriptionType } from "@prisma/client";
import { cookies } from "next/headers";

export async function shouldShowTrial() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId");

  if (!sessionId) {
    return false;
  }

  const user = await getUserFromSessionId(sessionId.value);

  if (!user) {
    return false;
  }

  if (user.trialEnds) {
    return false;
  }

  const subscription = await getSubscriptionFromUserId(user.id);

  if (!subscription) {
    return true;
  }

  if (subscription?.type === SubscriptionType.TRIAL) {
    return false;
  }

  return false;
}
