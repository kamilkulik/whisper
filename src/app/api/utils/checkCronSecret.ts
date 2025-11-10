import { NextRequest } from "next/server";

export function isCronSecretValid(request: NextRequest): boolean {
  const smsProvider = process.env.SMS_API_PROVIDER;
  const emailProvider = process.env.EMAIL_API_PROVIDER;
  const isLocalMode = smsProvider === "local" && emailProvider === "local";

  if (!isLocalMode) {
    // Verify that this is a legitimate Vercel cron request
    const authHeader = request.headers.get("Authorization");
    console.log("🔍 [ isCronSecretValid ] authHeader:", authHeader);
    console.log(
      "🔍 [ isCronSecretValid ] process.env.CRON_SECRET:",
      process.env.CRON_SECRET
    );
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return false;
    }
  }

  return true;
}
