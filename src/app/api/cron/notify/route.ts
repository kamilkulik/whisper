import { NextRequest, NextResponse } from "next/server";
import { checkCronSecret } from "../../utils/checkCronSecret";
import { prisma } from "@/lib/prisma";
import { SubscriptionType } from "@prisma/client";

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
    console.log(`Cron job executed at: ${now.toISOString()}`);
    console.log(
      "CET time:",
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

    console.log(`Found ${subscriptions.length} subscriptions to notify`);

    for (const subscription of subscriptions) {
      const user = await prisma.user.findUnique({
        where: {
          id: subscription.userId,
        },
      });

      if (!user) {
        console.error(`User not found for subscription ${subscription.id}`);
      }

      console.log(`Notifying user ${user?.email}`);
      // TODO send actual email and text
    }

    console.log("Cron job completed successfully");

    return NextResponse.json(
      { message: "Cron job completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 500 });
  }
};
