import "server-only";
import { prisma } from "@/lib/prisma";
import {
    MessageTranslation,
    SupportedLanguagesEnum,
} from "@prisma/client";

export type MessageWithTranslation = {
    id: number;
    text: string;
};

class MessageService {
    /**
     * Get the next message for a user based on their lastUsedMessageId.
     * Returns the message text in the user's language.
     */
    async getNextMessage(
        lastUsedMessageId: number | null,
        language: SupportedLanguagesEnum
    ): Promise<MessageWithTranslation | null> {
        const nextMessageId = (lastUsedMessageId ?? 0) + 1;

        const message = await prisma.message.findUnique({
            where: { id: nextMessageId },
            select: {
                id: true,
                translations: {
                    where: { language },
                    select: { text: true },
                },
            },
        });

        if (!message || message.translations.length === 0) {
            console.error(
                `[ MessageService ] No message found for id=${nextMessageId} lang=${language}`
            );
            return null;
        }

        return {
            id: message.id,
            text: message.translations[0].text,
        };
    }

    /**
     * Build a translation map from an array of translations.
     * Used by the cron distribute route.
     */
    toTranslationMap(
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
}

export const messageService = new MessageService();
