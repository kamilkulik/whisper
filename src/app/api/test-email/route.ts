import { EmailTemplate, sendEmail } from "@/lib/emailapi";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const queryParams = request.nextUrl.searchParams;
  const template = queryParams.get("template");

  if (!template) {
    return NextResponse.json(
      { message: "Template is required" },
      { status: 400 }
    );
  }

  if (
    template !== "welcome" &&
    template !== "confirm-email" &&
    template !== "confirmation-code-via-email" &&
    template !== "payment-link"
  ) {
    return NextResponse.json({ message: "Invalid template" }, { status: 400 });
  }

  await sendEmail({
    to: "kulikkamil@icloud.com",
    subject: "Test Email",
    message: "This is a test email",
    template: template as EmailTemplate,
    userName: "Kamil Kulik",
    verificationLink: "https://wieczornyszept.pl/verify-email",
    verificationCode: "123456",
    paymentLinkUrl: "https://wieczornyszept.pl/payment-link",
  });
  return NextResponse.json({ message: "Email sent" });
};
