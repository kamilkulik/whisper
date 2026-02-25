import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/smsapi";
import {
  Message,
  MessageTranslation,
  SubscriptionStatus,
  SupportedLanguagesEnum,
} from "@prisma/client";
import { isCronSecretValid } from "../../utils/checkCronSecret";
import { convertUTCHourToLocal, TimezoneOption } from "@/app/_consts";
import { getTranslations } from "next-intl/server";
import { markSubsExpired } from "./markSubsExpired";

export type UserRawType = {
  id: number;
  phone_number: string;
  message_language: SupportedLanguagesEnum;
  last_used_message: number;
  timezone: string;
  delivery_hour: number;
  premium: boolean;
};

/**
 * Function that returns a flag that confirms
 * a user is ending their trial
 */

function isTrialEnding(messageNumber: number) {
  return messageNumber == 7;
}

/**
 * Function that creates the message depending on whether
 * the user is no their last trial message or not
 */
async function createMessage(
  message: string,
  messageNumber: number,
  userId: number,
  premium: boolean,
  language: string = "en"
): Promise<string> {
  let messageText = message;

  if (isTrialEnding(messageNumber) && !premium) {
    console.log("[ api/cron/distribute ] [ createMessage ] Adding trial ending message to user " + userId);
    const t = await getTranslations({ locale: language, namespace: "TextTemplates.trial-ending" })
    messageText += "\n---\n" + t("psMethod");
    messageText += " https://www.eveningwhisper.app/ritual/"
    messageText += userId.toString()
  }

  return messageText;
}

export const GET = async (request: NextRequest) => {
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
      "[ /api/cron/distribute ] CET time:",
      now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" })
    );

    await markSubsExpired();

    // 1. get all users who should receive a message
    const users: UserRawType[] = await prisma.$queryRaw`
      SELECT u.id, u.last_used_message, u.message_language, u.phone_number, u.timezone, u.delivery_hour, u.premium
      FROM users u 
      LEFT JOIN subscriptions s ON s.user_id = u.id 
      AND s.status = ${SubscriptionStatus.ACTIVE}::"SubscriptionStatus"
      AND s.date_expires > NOW() 
      WHERE ( 
        (
          u.trial_ends > NOW() 
          AND COALESCE(u.last_used_message, 0) < 7
        )
        OR s.id IS NOT NULL
      );
    `;

    console.log(
      `[ /api/cron/distribute ] Found ${users.length} users to send messages to`
    );

    // 2. Filter users to only those whose delivery hour matches the current UTC hour
    // Note: delivery_hour is stored in UTC in the database
    const nowUtc = new Date();
    const currentUTCHour = nowUtc.getUTCHours();
    const usersInDeliveryHour = users.filter((user) => {
      // Compare current UTC hour with the UTC delivery hour stored in the database
      const shouldProcess = currentUTCHour === user.delivery_hour;

      if (!shouldProcess) {
        console.log(
          `[ /api/cron/distribute ] Skipping user ${user.id} - current UTC hour: ${currentUTCHour}, delivery hour (UTC): ${user.delivery_hour}`
        );
      }

      return shouldProcess;
    });

    console.log(
      `[ /api/cron/distribute ] ${usersInDeliveryHour.length} users are in their delivery hour`
    );

    // 3. create a unique set of message ids which should be sent next to each user
    const usersWithNextMessage = usersInDeliveryHour.map((user) => ({
      ...user,
      next_message: (user.last_used_message || 0) + 1,
    }));

    const nextMessages = new Set(
      usersWithNextMessage.map((user) => user.next_message)
    );
    console.log(
      `[ /api/cron/distribute ] Found ${nextMessages.size} unique messages to send`
    );

    // 4. get all the messages which should be sent next to each user - convert to a hash table
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
      function (
        acc,
        message: Pick<Message, "id"> & {
          translations: Pick<MessageTranslation, "text" | "language">[];
        }
      ) {
        const translationsMap = toTranslationMap(message.translations);
        acc.set(message.id, translationsMap);

        return acc;
      },
      new Map<number, Record<string, string>>()
    );

    // 5. Send message for each user
    for (const user of usersWithNextMessage) {
      // at this point we have people how are either in active trial or are premium users
      try {
        const message = messagesHash.get(user.next_message);
        if (!message) {
          console.error(
            `[ /api/cron/distribute ] Message not found for user ${user.id}`
          );
          continue;
        }
        const rawMessageText = message[user.message_language];
        const messageText = await createMessage(rawMessageText, user.next_message, user.id, user.premium, user.message_language.toLowerCase());

        if (messageText) {
          // Convert UTC delivery hour back to user's local timezone for SMS scheduling
          // (smsapi expects local time, but we store UTC in the database)
          const localDeliveryHour = convertUTCHourToLocal(
            user.delivery_hour,
            user.timezone as TimezoneOption
          );
          console.log(
            `[ /api/cron/distribute ] Sending message to user ${user.id} with message #${user.next_message} (timezone: ${user.timezone}, hour: ${localDeliveryHour}:59 local / ${user.delivery_hour}:59 UTC)`
          );
          await sendSms(user.phone_number, messageText, true, {
            timezone: user.timezone,
            deliveryHour: localDeliveryHour,
          });

          // update what message got sent
          await prisma.user.update({
            where: { id: user.id },
            data: { lastUsedMessageId: user.next_message },
          });
        }
      } catch (error) {
        // in case of message service failure log the error
        console.error(
          `[ /api/cron/distribute ] Failed to send message to user ${user.id}:`,
          error
        );
      }
    }

    console.log(
      "[ /api/cron/distribute ] Daily cron job completed successfully"
    );

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
    console.error("[ /api/cron/distribute ] Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "[ /api/cron/distribute ] Cron job failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
