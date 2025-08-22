"use server";

export async function isTestingModeEnabled(): Promise<boolean> {
  const smsProvider = process.env.SMS_API_PROVIDER;
  const emailProvider = process.env.EMAIL_API_PROVIDER;

  return smsProvider === "local" && emailProvider === "local";
}
