"use server";

import { getUserFromSessionId } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function isTestingModeEnabled(): Promise<{
  isTestingModeEnabled: boolean;
  smsProvider: string;
  emailProvider: string;
}> {
  const smsProvider = process.env.SMS_API_PROVIDER || "local";
  const emailProvider = process.env.EMAIL_API_PROVIDER || "local";

  return {
    isTestingModeEnabled:
      (smsProvider === "local" && emailProvider === "local") ||
      (smsProvider === "local" && emailProvider === "resend"),
    smsProvider,
    emailProvider,
  };
}

export async function getUserDataFromSession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId");

    if (!sessionId?.value) {
      return { error: "No session ID found" };
    }

    const user = await getUserFromSessionId(sessionId.value);

    if (!user) {
      return { error: "User not found" };
    }

    return {
      sessionId: sessionId.value,
      user: {
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneNumberVerified,
      },
    };
  } catch (error) {
    console.error("Error getting user data:", error);
    return { error: "Failed to get user data" };
  }
}
