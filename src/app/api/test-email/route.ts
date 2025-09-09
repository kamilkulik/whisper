import { EmailTemplate, sendEmail } from "@/lib/emailapi";
import { NextRequest, NextResponse } from "next/server";
import { generateOneTimeUrl } from "../utils/oneTimeJwt";
import { SubscriptionType } from "@prisma/client";
import { getSubscriptionType } from "@/lib/consts";

export const POST = async (request: NextRequest) => {
  const requestBody: {
    locale: string;
    template: EmailTemplate;
    to: string;
    subject: string;
    userName?: string;
    verificationLink?: string;
    verificationCode?: string;
    paymentLinkUrl?: string;
    subscriptionType?: string;
    userId?: string;
    userEmail?: string;
  } = await request.json();
  const {
    locale,
    template,
    to,
    subject,
    userName,
    verificationLink,
    verificationCode,
    paymentLinkUrl,
    subscriptionType,
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

    finalVerificationLink = await generateOneTimeUrl(userId, userEmail);
  }

  await sendEmail({
    locale,
    to: to ?? "kulikkamil@icloud.com",
    subject: subject ?? "Test Email",
    template,
    userName: userName ?? "Kamil Kulik",
    verificationLink:
      finalVerificationLink ?? "https://wieczornyszept.pl/verify-email",
    verificationCode: verificationCode ?? "123456",
    paymentLinkUrl: paymentLinkUrl ?? "https://wieczornyszept.pl/payment-link",
    subscriptionType: subscriptionType
      ? getSubscriptionType(subscriptionType)
      : SubscriptionType.ONE_TIME,
  });
  return NextResponse.json({ message: "Email sent" });
};
