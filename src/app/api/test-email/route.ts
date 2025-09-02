import { EmailTemplate, sendEmail } from "@/lib/emailapi";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const requestBody: {
    template: EmailTemplate;
    to: string;
    userName?: string;
    verificationLink?: string;
    verificationCode?: string;
    paymentLinkUrl?: string;
  } = await request.json();
  const {
    template,
    to,
    userName,
    verificationLink,
    verificationCode,
    paymentLinkUrl,
  } = requestBody;

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
    to: to ?? "kulikkamil@icloud.com",
    subject: "Test Email",
    message: "This is a test email",
    template,
    userName: userName ?? "Kamil Kulik",
    verificationLink:
      verificationLink ?? "https://wieczornyszept.pl/verify-email",
    verificationCode: verificationCode ?? "123456",
    paymentLinkUrl: paymentLinkUrl ?? "https://wieczornyszept.pl/payment-link",
  });
  return NextResponse.json({ message: "Email sent" });
};
