import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionType, User } from "@prisma/client";
import { sendEmail } from "@/lib/emailapi";
import { sessionIdCache } from "@/lib/sessionIdCache";
import { csfrProtection } from "../utils/csfrProtection";
import { createSubscription } from "../payments/utils/createSubscription";
import { generateOneTimeUrl } from "../utils/oneTimeJwt";

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

export const PUT = async (request: NextRequest) => {
  try {
    const sessionId = request.cookies.get("sessionId")?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    // Get user from session
    const user = await prisma.user.findUnique({
      where: { sessionId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - No valid session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, phoneNumber, messageLanguage } = body;

    // Validate that at least one field is provided
    if (!email && !phoneNumber && !messageLanguage) {
      return NextResponse.json(
        { error: "Przynajmniej jedno pole musi być wypełnione" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Validate and add email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Nieprawidłowy format email" },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      const existingEmailUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmailUser && existingEmailUser.id !== user.id) {
        return NextResponse.json(
          { error: "Nie mozesz uzyc tego emaila" },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    // Validate and add phone number if provided
    if (phoneNumber) {
      const phoneRegex = /^(\+[1-9]\d{0,3})?[0-9\s\-]{6,15}$/;
      const cleanPhone = phoneNumber.replace(/[\s\-]/g, "");
      if (
        !phoneRegex.test(phoneNumber) ||
        cleanPhone.length < 6 ||
        cleanPhone.length > 18
      ) {
        return NextResponse.json(
          { error: "Nieprawidłowy format numeru telefonu" },
          { status: 400 }
        );
      }

      // Check if phone number is already taken by another user
      const existingPhoneUser = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (existingPhoneUser && existingPhoneUser.id !== user.id) {
        return NextResponse.json(
          {
            error: "Nie mozesz uzyc tego numeru telefonu",
          },
          { status: 400 }
        );
      }

      updateData.phoneNumber = phoneNumber;
    }

    // Add message language if provided
    if (messageLanguage) {
      updateData.messageLanguage = messageLanguage;
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Dane zostały zaktualizowane pomyślnie" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ users PUT ] Error updating user data:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aktualizacji danych" },
      { status: 500 }
    );
  }
};

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
        where: { phoneNumber: body.phoneNumber },
        data: {
          phoneNumber: body.email,
          name: body.name,
          updatedAt: new Date(),
          premium: body.premium,
        },
      });
    } else {
      /**
       *
       * CREATE NEW USER FLOW START
       *
       * */
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

      // if the new user is not premium and has a trial ends, create a trial subscription
      if (!savedUser.premium && savedUser.trialEnds) {
        try {
          const trialSubscription = await createSubscription({
            created: new Date().getTime(),
            expiryAdjustmentInMilis: 0,
            productType: SubscriptionType.TRIAL,
            subscriptionId: "",
            user: savedUser,
          });

          try {
            await sendEmail({
              to: savedUser.email,
              subject: "Witamy w serwisie Wieczorny Szept",
              template: "welcome",
              subscriptionType: trialSubscription.type,
            });
          } catch (error) {
            console.error(
              "[ users POST ] Error sending welcome email to new user",
              error
            );
          }
        } catch (error) {
          console.error(
            "[ users POST ] Error creating trial subscription for new user",
            error
          );
        }
      }

      // send email to new user for them to verify their email
      await sendEmail({
        to: savedUser.email,
        subject: "Zweryfikuj swój email",
        verificationLink: await generateOneTimeUrl(
          savedUser.id.toString(),
          savedUser.email
        ),
        template: "confirm-email",
      });
    }
    /** CREATE NEW USER FLOW END */

    console.log("[ users POST ] User data saved to database:", {
      timestamp: new Date().toISOString(),
      data: body,
    });

    return NextResponse.json(
      { message: "Wiadomość została pomyślnie zapisana" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ users POST ] Error processing user data:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas przetwarzania wiadomości" },
      { status: 500 }
    );
  }
};
