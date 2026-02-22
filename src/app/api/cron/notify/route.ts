import { NextRequest, NextResponse } from "next/server";
import { isCronSecretValid } from "../../utils/checkCronSecret";
import { prisma } from "@/lib/prisma";
import { SubscriptionType } from "@prisma/client";
import { sendSms } from "@/lib/smsapi";
import { sendEmail } from "@/lib/emailapi";
import { getTranslations } from "next-intl/server";


export const GET = async (request: NextRequest) => {
  /**
    select *
    from subscriptions s 
    where s."type" = 'TRIAL'
    and s.date_expires::date = (now() + interval '1 day')::date	
   */

  const isCronProcessingEnabled = process.env.ENABLE_CRON === "true";

  if (!isCronProcessingEnabled) {
    return NextResponse.json(
      { message: "Cron processing is disabled" },
      { status: 200 }
    );
  }

  try {
    if (!isCronSecretValid(request)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    console.log(
      `[ GET /api/cron/notify ] Cron job executed at: ${now.toISOString()}`
    );
    console.log(
      "[ GET /api/cron/notify ] CET time:",
      now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" })
    );

    const startOfTomorrow = new Date();
    startOfTomorrow.setHours(0, 0, 0, 0);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const endOfTomorrow = new Date(startOfTomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        type: SubscriptionType.TRIAL,
        dateExpires: {
          gte: startOfTomorrow,
          lte: endOfTomorrow,
        },
      },
    });

    console.log(
      `[ GET /api/cron/notify ] Found ${subscriptions.length} subscriptions to notify`
    );

    if (!subscriptions.length) {
      console.log(
        "[ GET /api/cron/notify ] No subscriptions to notify about trial expiration"
      );
      return NextResponse.json(
        {
          message:
            "[ GET /api/cron/notify ] No subscriptions to notify about trial expiration",
        },
        { status: 200 }
      );
    }

    const t = await getTranslations("API.cron.notify");

    for (const subscription of subscriptions) {
      const user = await prisma.user.findUnique({
        where: {
          id: subscription.userId,
        },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          messageLanguage: true,
        },
      });

      if (!user) {
        console.error(
          `[ GET /api/cron/notify ] User not found for subscription ${subscription.id}`
        );
      }

      console.log(`[ GET /api/cron/notify ] Notifying user ${user?.email}`);
      try {
        console.log(
          `[ GET /api/cron/notify ] Sending message to user ${user?.email}`
        );

        if (user?.phoneNumber) {
          await sendSms(user?.phoneNumber, t("message"), false);
        } else {
          console.error(
            `[ GET /api/cron/notify ] User ${user?.email} has no phone number`
          );
        }

        if (user?.email) {
          await sendEmail({
            locale: user?.messageLanguage.toLowerCase(),
            to: user?.email,
            subject: t("sendEmail.subject"),
            template: "trial-expiration-notification",
          });
        } else {
          console.error(
            `[ GET /api/cron/notify ] User ${user?.email} has no email`
          );
        }
      } catch (error) {
        // in case of message service failure log the error
        console.error(
          `[ GET /api/cron/notify ] Failed to send message to user ${user?.id}:`,
          error
        );
      }
    }

    console.log("[ GET /api/cron/notify ] Cron job completed successfully");

    return NextResponse.json(
      { message: "[ GET /api/cron/notify ] Cron job completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ GET /api/cron/notify ] Cron job error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 500 });
  }
};
