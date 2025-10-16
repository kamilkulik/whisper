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

    const subscriptions = await prisma.subscription.findMany({
      where: {
        type: SubscriptionType.TRIAL,
        dateExpires: {
          equals: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    console.log(`Found ${subscriptions.length} subscriptions to notify`);

    for (const subscription of subscriptions) {
      console.log(`Notifying user ${subscription.userId}`);
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
