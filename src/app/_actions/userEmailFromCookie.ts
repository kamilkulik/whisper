"use server";

import { getUserFromSessionId } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function userEmailFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId");

    if (!sessionId) {
      return null;
    }

    const user = await getUserFromSessionId<"email">(sessionId.value, {
      email: true,
    });

    if (!user) {
      return null;
    }

    return user.email;
  } catch (error) {
    console.error("Error getting user email from cookie", error);
    return null;
  }
}
