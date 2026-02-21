import { after, NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionType, User } from "@prisma/client";
import { sessionIdCache } from "@/lib/sessionIdCache";
import { csfrProtection } from "../utils/csfrProtection";
import { createSubscription } from "../payments/utils/createSubscription";

import { getTranslations } from "next-intl/server";
import { isValidE164, normalizeE164 } from "@/lib/consts";
import {
  isValidTimezone,
  isValidDeliveryHour,
  DEFAULT_TIMEZONE,
  DEFAULT_DELIVERY_HOUR,
  convertLocalHourToUTC,
  TimezoneOption,
} from "@/app/_consts";
import { sendCapiEvent, buildCapiUserData } from "@/lib/fbCapi";
import { generateEventId } from "@/lib/eventId";
import { Event } from "@/lib/fbq";

export type UserData = Omit<
  User,
  | "email"
  | "name"
  | "id"
  | "confirmationCode"
  | "confirmationCodeExpires"
  | "lastUsedMessageId"
  | "sessionId"
  | "createdAt"
  | "updatedAt"
  | "trialEnds"
> & { fbEventId?: string; deliveryHour?: number, email?: string | null, name?: string | null };

export const PUT = async (request: NextRequest) => {
  const tShared = await getTranslations("API.SHARED");

  try {
    const sessionId = request.cookies.get("sessionId")?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: tShared("unauthorized") },
        { status: 401 },
      );
    }

    // Get user from session (include timezone for delivery hour conversion)
    const user: Pick<User, "id" | "timezone"> | null = await prisma.user.findUnique({
      where: { sessionId },
      select: {
        id: true,
        timezone: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: tShared("unauthorized") },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { email, phoneNumber, messageLanguage, timezone, deliveryHour } =
      body;

    // Validate that at least one field is provided
    if (
      !email &&
      !phoneNumber &&
      !messageLanguage &&
      !timezone &&
      deliveryHour === undefined
    ) {
      return NextResponse.json(
        { error: tShared("form-validation-errors.missing-fields") },
        { status: 400 },
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
          { error: tShared("form-validation-errors.invalid-email") },
          { status: 400 },
        );
      }

      // Check if email is already taken by another user
      const existingEmailUser: Pick<User, "id"> | null =
        await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
          },
        });

      if (existingEmailUser && existingEmailUser.id !== user.id) {
        return NextResponse.json(
          { error: tShared("form-validation-errors.email-already-taken") },
          { status: 400 },
        );
      }

      updateData.email = email;
    }

    // Validate and add phone number if provided (must be in E.164 format)
    if (phoneNumber) {
      // Normalize the phone number first
      const normalizedPhone = normalizeE164(phoneNumber);

      // Validate E.164 format
      if (!isValidE164(normalizedPhone)) {
        return NextResponse.json(
          { error: tShared("form-validation-errors.invalid-phone-number") },
          { status: 400 },
        );
      }

      // Check if phone number is already taken by another user
      const existingPhoneUser: Pick<User, "id"> | null =
        await prisma.user.findUnique({
          where: { phoneNumber: normalizedPhone },
          select: {
            id: true,
          },
        });

      if (existingPhoneUser && existingPhoneUser.id !== user.id) {
        return NextResponse.json(
          {
            error: tShared("form-validation-errors.phone-number-already-taken"),
          },
          { status: 400 },
        );
      }

      updateData.phoneNumber = normalizedPhone;
    }

    // Add message language if provided
    if (messageLanguage) {
      updateData.messageLanguage = messageLanguage;
    }

    // Validate and add timezone if provided
    if (timezone) {
      if (!isValidTimezone(timezone)) {
        return NextResponse.json(
          { error: tShared("form-validation-errors.invalid-timezone") },
          { status: 400 },
        );
      }
      updateData.timezone = timezone;
    }

    // Validate and add delivery hour if provided
    if (deliveryHour !== undefined) {
      if (!isValidDeliveryHour(deliveryHour)) {
        return NextResponse.json(
          { error: tShared("form-validation-errors.invalid-delivery-hour") },
          { status: 400 },
        );
      }

      // Convert delivery hour from user's timezone to UTC before saving
      // Use the timezone from the request body if provided, otherwise use the user's current timezone
      const userTimezone = (timezone || user.timezone) as TimezoneOption;
      const utcDeliveryHour = convertLocalHourToUTC(deliveryHour, userTimezone);
      updateData.deliveryHour = utcDeliveryHour;
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json(
      { message: tShared("PUT.success") },
      { status: 200 },
    );
  } catch (error) {
    console.error("[ users PUT ] Error updating user data:", error);
    return NextResponse.json({ error: tShared("PUT.error") }, { status: 500 });
  }
};

export const POST = async (request: NextRequest) => {
  const t = await getTranslations("API.users.POST");
  const tShared = await getTranslations("API.SHARED");

  try {
    const sessionId = request.cookies.get("sessionId")?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: tShared("unauthorized") },
        { status: 401 },
      );
    }

    csfrProtection(request);

    const body: UserData = await request.json();
    const cachedSessionId = await sessionIdCache.get(
      body.phoneNumber,
    );

    if (cachedSessionId !== sessionId) {
      return NextResponse.json(
        { error: tShared("unauthorized") },
        { status: 401 },
      );
    }

    // Validate required fields
    if (!body.phoneNumber) {
      return NextResponse.json(
        { error: tShared("form-validation-errors.all-fields-required") },
        { status: 400 },
      );
    }

    // Validate email format if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: tShared("form-validation-errors.invalid-email") },
          { status: 400 },
        );
      }
    }

    // Normalize and validate phone number (must be in E.164 format: +[country code][number])
    const normalizedPhone = normalizeE164(body.phoneNumber);
    if (!isValidE164(normalizedPhone)) {
      return NextResponse.json(
        { error: tShared("form-validation-errors.invalid-phone-number") },
        { status: 400 },
      );
    }
    // Update body with normalized phone number
    body.phoneNumber = normalizedPhone;

    // Check if user already exists
    const existingEmailUser: Pick<User, "id" | "trialEnds"> | null =
      body.email
        ? await prisma.user.findUnique({
          where: {
            email: body.email,
          },
          select: {
            id: true,
            trialEnds: true,
          },
        })
        : null;

    const existingPhoneNumberUser: Pick<User, "id" | "trialEnds"> | null =
      await prisma.user.findUnique({
        where: {
          phoneNumber: body.phoneNumber,
        },
        select: {
          id: true,
          trialEnds: true,
        },
      });

    if (existingEmailUser || existingPhoneNumberUser) {
      // check if they already used trial
      const triesToUseTrialAgain =
        (!!existingEmailUser?.trialEnds ||
          !!existingPhoneNumberUser?.trialEnds) &&
        !body.premium;

      if (triesToUseTrialAgain) {
        return NextResponse.json({ error: t("trial-used") }, { status: 400 });
      }

      // Determine which user ID to update (prefer phone number user if both exist)
      const userIdToUpdate =
        existingPhoneNumberUser?.id || existingEmailUser?.id;
      if (!userIdToUpdate) {
        return NextResponse.json(
          { error: tShared("PUT.error") },
          { status: 500 },
        );
      }

      // Update existing user
      // Type assertion needed because UserData type may not include new fields yet
      const bodyWithDefaults = body as UserData & {
        timezone?: string;
        deliveryHour?: number;
      };

      const updateData: Record<string, unknown> = {
        phoneNumber: body.phoneNumber,
        messageLanguage: body.messageLanguage,
        phoneNumberVerified: body.phoneNumberVerified ?? false,
        premium: body.premium,
        timezone: bodyWithDefaults.timezone ?? DEFAULT_TIMEZONE,
        deliveryHour: bodyWithDefaults.deliveryHour !== undefined
          ? convertLocalHourToUTC(
            bodyWithDefaults.deliveryHour,
            (bodyWithDefaults.timezone ?? DEFAULT_TIMEZONE) as TimezoneOption
          )
          : convertLocalHourToUTC(DEFAULT_DELIVERY_HOUR, DEFAULT_TIMEZONE),
        updatedAt: new Date(),
      };

      // Only update optional fields if provided
      if (body.email) {
        updateData.email = body.email;
        updateData.emailVerified = body.emailVerified ?? false;
      }
      if (body.name) {
        updateData.name = body.name;
      }

      await prisma.user.update({
        where: { id: userIdToUpdate },
        data: updateData,
      });
    } else {
      /**
       *
       * CREATE NEW USER FLOW START
       *
       * */
      // Type assertion needed because UserData type may not include new fields yet
      const bodyWithDefaults = body as UserData & {
        timezone?: string;
        deliveryHour?: number;
      };

      const createData: Record<string, unknown> = {
        messageLanguage: body.messageLanguage,
        phoneNumber: body.phoneNumber,
        phoneNumberVerified: body.phoneNumberVerified,
        premium: body.premium,
        sessionId,
        timezone: bodyWithDefaults.timezone ?? DEFAULT_TIMEZONE,
        deliveryHour: bodyWithDefaults.deliveryHour !== undefined
          ? convertLocalHourToUTC(
            bodyWithDefaults.deliveryHour,
            (bodyWithDefaults.timezone ?? DEFAULT_TIMEZONE) as TimezoneOption
          )
          : convertLocalHourToUTC(DEFAULT_DELIVERY_HOUR, DEFAULT_TIMEZONE),
        trialEnds:
          !body.premium
            ? new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
            : null,
      };

      // Only set optional fields if provided
      if (body.email) {
        createData.email = body.email;
        createData.emailVerified = body.emailVerified;
      }
      if (body.name) {
        createData.name = body.name;
      }

      const savedUser = await prisma.user.create({
        data: createData as any,
      });

      // if the new user is not premium and has a trial ends, create a trial subscription
      if (!savedUser.premium && savedUser.trialEnds) {
        try {
          await createSubscription({
            created: new Date().getTime(),
            expiryAdjustmentInMilis: 0,
            productType: SubscriptionType.TRIAL,
            subscriptionId: "",
            user: savedUser,
          });

          // StartTrial CAPI (fire-and-forget)
          const fbp = request.cookies.get("_fbp")?.value;
          const fbc = request.cookies.get("_fbc")?.value;
          const userAgent = request.headers.get("user-agent") ?? "";
          const fbEventId = generateEventId(Event.StartTrial);

          body.fbEventId = fbEventId;

          after(
            sendCapiEvent({
              eventName: Event.StartTrial,
              eventTime: Math.floor(Date.now() / 1000),
              actionSource: "website",
              userData: buildCapiUserData({
                fbp,
                fbc,
                email: savedUser.email ?? undefined,
                phone: savedUser.phoneNumber,
              }),
              clientUserAgent: userAgent,
              eventId: fbEventId,
              customData: { value: 0, currency: "USD" },
            }).catch(() => { })
          );
        } catch (error) {
          console.error(
            "[ users POST ] Error creating trial subscription for new user",
            error,
          );
        }
      }
    }
    /** CREATE NEW USER FLOW END */

    console.log("[ /api/users ] User data saved to database:", {
      timestamp: new Date().toISOString(),
      data: body,
    });

    return NextResponse.json(
      { message: tShared("POST.success"), fbEventId: body.fbEventId },
      { status: 200 },
    );
  } catch (error) {
    console.error("[ users POST ] Error processing user data:", error);
    return NextResponse.json({ error: tShared("POST.error") }, { status: 500 });
  }
};
