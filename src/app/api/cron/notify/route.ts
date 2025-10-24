import { NextRequest, NextResponse } from "next/server";
import { checkCronSecret } from "../../utils/checkCronSecret";
import { prisma } from "@/lib/prisma";
import { SubscriptionType } from "@prisma/client";
import { sendSms } from "@/lib/smsapi";
import { sendEmail } from "@/lib/emailapi";

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
    checkCronSecret(request);

    const now = new Date();
    console.log(
      `[ /api/cron/notify ] Cron job executed at: ${now.toISOString()}`
    );
    console.log(
      "[ /api/cron/notify ] CET time:",
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
      `[ /api/cron/notify ] Found ${subscriptions.length} subscriptions to notify`
    );

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
        console.error(`User not found for subscription ${subscription.id}`);
      }

      console.log(`[ /api/cron/notify ] Notifying user ${user?.email}`);
      try {
        console.log(
          `[ /api/cron/notify ] Sending message to user ${user?.email}`
        );

        if (user?.phoneNumber) {
          await sendSms(
            user?.phoneNumber,
            "TODO write a good message - needs to be translated"
          );
        } else {
          console.error(`User ${user?.email} has no phone number`);
        }

        if (user?.email) {
          await sendEmail({
            locale: user?.messageLanguage.toLowerCase(),
            to: user?.email,
            subject: "TODO write a good message - needs to be translated",
            template: "trial-expiration-notification",
          });
        } else {
          console.error(`User ${user?.email} has no email`);
        }
      } catch (error) {
        // in case of message service failure log the error
        console.error(`Failed to send message to user ${user?.id}:`, error);
      }
    }

    console.log("[ /api/cron/notify ] Cron job completed successfully");

    return NextResponse.json(
      { message: "Cron job completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 500 });
  }
};
