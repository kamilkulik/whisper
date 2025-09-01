import { sendEmail } from "@/lib/emailapi";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const queryParams = request.nextUrl.searchParams;
  const template = queryParams.get("template");

  await sendEmail(
    "kulikkamil@icloud.com",
    "Test Email",
    "This is a test email",
    template
  );
  return NextResponse.json({ message: "Email sent" });
};
