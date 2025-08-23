import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/smsapi";

export const GET = async (request: NextRequest) => {
  try {
    // Skip authorization check if in local mode
    const smsProvider = process.env.SMS_API_PROVIDER;
    const emailProvider = process.env.EMAIL_API_PROVIDER;
    const isLocalMode = smsProvider === "local" && emailProvider === "local";

    if (!isLocalMode) {
      // Verify that this is a legitimate Vercel cron request
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const now = new Date();
    console.log(`Cron job executed at: ${now.toISOString()}`);
    console.log(
      "CET time:",
      now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" })
    );

    // 1. get all users who should receive a message
    const users = await prisma.user.findMany({
      where: {
        OR: [{ premium: true }, { trialEnds: { lt: now } }],
      },
    });
    console.log(`Found ${users.length} users to send messages to`);

    // 2. create a unique set of message ids which should be sent next to each user
    const usersWithNextMessage = users.map((user) => ({
      ...user,
      next_message: (user.lastUsedMessageId || 0) + 1,
    }));
    const nextMessages = new Set(
      usersWithNextMessage.map((user) => user.next_message)
    );
    console.log(`Found ${nextMessages.size} unique messages to send`);

    // 3. get all the messages which should be sent next to each user - convert to a hash table
    const messages = await prisma.message.findMany({
      where: {
        id: { in: Array.from(nextMessages) },
      },
    });
    const messagesHash = messages.reduce((acc: any, message: any) => {
      acc[message.id] = message;
      return acc;
    }, {} as Record<number, any>);

    // 4. Send message for each user
    for (const user of usersWithNextMessage) {
      try {
        const message = messagesHash[user.next_message];
        if (message) {
          console.log(`Sending message to user ${user.id}: ${message.message}`);
          await sendSms(user.phoneNumber, message.message);

          // update what message got sent
          await prisma.user.update({
            where: { id: user.id },
            data: { lastUsedMessageId: user.next_message },
          });
        }
      } catch (error) {
        // in case of message service failure log the error
        console.error(`Failed to send message to user ${user.id}:`, error);
      }
    }

    console.log("Daily cron job completed successfully");

    return NextResponse.json(
      {
        message: "Daily cron job completed successfully",
        timestamp: now.toISOString(),
        cetTime: now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
};
