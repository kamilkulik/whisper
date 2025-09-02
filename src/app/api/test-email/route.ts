import { EmailTemplate, sendEmail } from "@/lib/emailapi";
import { NextRequest, NextResponse } from "next/server";
import { generateOneTimeToken } from "../utils/oneTimeJwt";

export const POST = async (request: NextRequest) => {
  const requestBody: {
    template: EmailTemplate;
    to: string;
    userName?: string;
    verificationLink?: string;
    verificationCode?: string;
    paymentLinkUrl?: string;
    userId?: string;
    userEmail?: string;
  } = await request.json();
  const {
    template,
    to,
    userName,
    verificationLink,
    verificationCode,
    paymentLinkUrl,
    userId,
    userEmail,
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

  // For confirm-email template, generate JWT token and verification link
  let finalVerificationLink = verificationLink;
  if (template === "confirm-email") {
    if (!userId || !userEmail) {
      return NextResponse.json(
        {
          message:
            "userId and userEmail are required for confirm-email template",
        },
        { status: 400 }
      );
    }

    try {
      const token = await generateOneTimeToken(userId, userEmail);
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
      finalVerificationLink = `${baseUrl}/api/confirm/email?token=${token}`;
    } catch (error) {
      console.error("Failed to generate JWT token:", error);
      return NextResponse.json(
        { message: "Failed to generate verification token" },
        { status: 500 }
      );
    }
  }

  await sendEmail({
    to: to ?? "kulikkamil@icloud.com",
    subject: "Test Email",
    message: "This is a test email",
    template,
    userName: userName ?? "Kamil Kulik",
    verificationLink:
      finalVerificationLink ?? "https://wieczornyszept.pl/verify-email",
    verificationCode: verificationCode ?? "123456",
    paymentLinkUrl: paymentLinkUrl ?? "https://wieczornyszept.pl/payment-link",
  });
  return NextResponse.json({ message: "Email sent" });
};
