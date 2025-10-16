import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/smsapi";
import {
  Message,
  MessageTranslation,
  SubscriptionStatus,
  SupportedLanguagesEnum,
  User,
} from "@prisma/client";
import { checkCronSecret } from "../../utils/checkCronSecret";

export type UserRawType = {
  id: number;
  phone_number: string;
  message_language: SupportedLanguagesEnum;
  last_used_message: number;
};

export const GET = async (request: NextRequest) => {
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

    // 1. get all users who should receive a message
    const users: UserRawType[] = await prisma.$queryRaw`
      SELECT u.id, u.last_used_message, u.message_language, u.phone_number
      FROM users u 
      LEFT JOIN subscriptions s ON s.user_id = u.id 
      AND s.status = ${SubscriptionStatus.ACTIVE}::"SubscriptionStatus"
      AND s.date_expires > NOW() 
      WHERE ( 
        u.trial_ends > NOW() OR
        s.id IS NOT NULL
      );
    `;

    console.log(`Found ${users.length} users to send messages to`);

    // 2. create a unique set of message ids which should be sent next to each user
    const usersWithNextMessage = users.map((user) => ({
      ...user,
      next_message: (user.last_used_message || 0) + 1,
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
      select: {
        id: true,
        translations: {
          select: {
            text: true,
            language: true,
          },
        },
      },
    });

    function toTranslationMap(
      translations: Pick<MessageTranslation, "text" | "language">[]
    ): Record<string, string> {
      return translations.reduce<Record<string, string>>(
        (acc, { text, language }) => {
          acc[language] = text;
          return acc;
        },
        {}
      );
    }

    const messagesHash = messages.reduce(
      (
        acc,
        message: Pick<Message, "id"> & {
          translations: Pick<MessageTranslation, "text" | "language">[];
        }
      ) => {
        const translationsMap = toTranslationMap(message.translations);
        acc.set(message.id, translationsMap);

        return acc;
      },
      new Map<number, Record<string, string>>()
    );

    // 4. Send message for each user
    for (const user of usersWithNextMessage) {
      try {
        const message = messagesHash.get(user.next_message);
        if (!message) {
          console.error(`Message not found for user ${user.id}`);
          continue;
        }
        const messageText = message[user.message_language];

        if (messageText) {
          console.log(`Sending message to user ${user.id}: ${messageText}`);
          await sendSms(user.phone_number, messageText);

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
        success: true,
        message: "Daily cron job completed successfully",
        timestamp: now.toISOString(),
        cetTime: now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Cron job failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
