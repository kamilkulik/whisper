import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionType, User } from "@prisma/client";
import { sendEmail } from "@/lib/emailapi";
import { sessionIdCache } from "@/lib/sessionIdCache";
import { csfrProtection } from "../utils/csfrProtection";
import { createSubscription } from "../payments/utils/createSubscription";

export type UserData = Omit<
  User,
  | "id"
  | "confirmationCode"
  | "confirmationCodeExpires"
  | "lastUsedMessageId"
  | "sessionId"
  | "createdAt"
  | "updatedAt"
  | "trialEnds"
>;

export const POST = async (request: NextRequest) => {
  try {
    const sessionId = request.cookies.get("sessionId")?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    csfrProtection(request);

    const body: UserData = await request.json();
    const cachedSessionId = await sessionIdCache.get(body.phoneNumber);

    if (cachedSessionId !== sessionId) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!body.phoneNumber || !body.email || !body.name) {
      return NextResponse.json(
        { error: "Wszystkie pola są wymagane" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Nieprawidłowy format email" },
        { status: 400 }
      );
    }

    // Validate phone number (accepts international country codes)
    const phoneRegex = /^(\+[1-9]\d{0,3})?[0-9\s\-]{6,15}$/;
    const cleanPhone = body.phoneNumber.replace(/[\s\-]/g, "");
    if (
      !phoneRegex.test(body.phoneNumber) ||
      cleanPhone.length < 6 ||
      cleanPhone.length > 18
    ) {
      return NextResponse.json(
        { error: "Nieprawidłowy format numeru telefonu" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingEmailUser = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    const existingPhoneNumberUser = await prisma.user.findUnique({
      where: {
        phoneNumber: body.phoneNumber,
      },
    });

    if (existingEmailUser || existingPhoneNumberUser) {
      // check if they already used trial
      const triesToUseTrialAgain =
        (!!existingEmailUser?.trialEnds ||
          !!existingPhoneNumberUser?.trialEnds) &&
        !body.premium;

      if (triesToUseTrialAgain) {
        return NextResponse.json(
          { error: "Bład. Z okresu próbnego można skorzystać tylko raz" },
          { status: 400 }
        );
      }

      // Update existing user
      await prisma.user.update({
        where: { email: body.phoneNumber },
        data: {
          phoneNumber: body.email,
          name: body.name,
          updatedAt: new Date(),
          premium: body.premium,
        },
      });
    } else {
      // Create new user
      console.log(JSON.stringify(body, null, 2));
      const savedUser = await prisma.user.create({
        data: {
          email: body.email,
          emailVerified: body.emailVerified,
          messageLanguage: body.messageLanguage,
          name: body.name,
          phoneNumber: body.phoneNumber,
          phoneNumberVerified: body.phoneNumberVerified,
          premium: body.premium,
          sessionId,
          trialEnds: !body.premium
            ? new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
            : null,
        },
      });

      if (!savedUser.premium && savedUser.trialEnds) {
        await createSubscription({
          amountTotal: 0,
          currency: "",
          created: new Date().getTime(),
          paymentIntent: "",
          paymentStatus: "paid",
          productType: SubscriptionType.TRIAL,
          sessionStatus: "complete",
          user: savedUser,
        });
      }
    }

    console.log("User data saved to database:", {
      timestamp: new Date().toISOString(),
      data: body,
    });

    // send email to user
    const email = body.email;
    const name = body.name;
    const message = `Witaj ${name}, dziękujemy za rejestrację w naszej aplikacji. Kliknij w link aby zweryfikować swój email: ${process.env.NEXT_PUBLIC_APP_URL}/verify-email?email=${email}`;
    await sendEmail(email, message, "Zweryfikuje swój email");

    return NextResponse.json(
      { message: "Wiadomość została pomyślnie zapisana" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing user data:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas przetwarzania wiadomości" },
      { status: 500 }
    );
  }
};
