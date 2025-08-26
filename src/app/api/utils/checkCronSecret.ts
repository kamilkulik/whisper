import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function checkCronSecret(
  request: NextRequest
): NextResponse | undefined {
  const smsProvider = process.env.SMS_API_PROVIDER;
  const emailProvider = process.env.EMAIL_API_PROVIDER;
  const isLocalMode = smsProvider === "local" && emailProvider === "local";

  if (!isLocalMode) {
    // Verify that this is a legitimate Vercel cron request
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
}
