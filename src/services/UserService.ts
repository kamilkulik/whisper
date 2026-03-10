import "server-only";
import { prisma } from "@/lib/prisma";
import { User, SupportedLanguagesEnum } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { sessionIdCache } from "@/lib/sessionIdCache";

const MAX_TRYOUT_COUNT = 3;

export type UserTryoutInfo = Pick<
    User,
    "id" | "phoneNumber" | "tryoutCount" | "tryoutLastSentAt" | "lastUsedMessageId"
>;

export type UserForCreation = {
    phoneNumber: string;
    messageLanguage: SupportedLanguagesEnum;
};

class UserService {
    /**
     * Find user by phone number, returning tryout-relevant fields.
     */
    async findByPhoneNumber(phoneNumber: string): Promise<UserTryoutInfo | null> {
        return prisma.user.findUnique({
            where: { phoneNumber },
            select: {
                id: true,
                phoneNumber: true,
                tryoutCount: true,
                tryoutLastSentAt: true,
                lastUsedMessageId: true,
            },
        });
    }

    /**
     * Find user by sessionId (for authenticated routes).
     */
    async findBySessionId(
        sessionId: string
    ): Promise<Pick<User, "id" | "phoneNumber" | "timezone"> | null> {
        return prisma.user.findUnique({
            where: { sessionId },
            select: {
                id: true,
                phoneNumber: true,
                timezone: true,
            },
        });
    }

    /**
     * Creates a minimal user record for the tryout flow.
     * Assigns a sessionId and stores it in the session cache.
     * Returns the sessionId so the caller can set it as a cookie.
     */
    async createForTryout(data: UserForCreation): Promise<{ sessionId: string; userId: number }> {
        const sessionId = uuidv4();

        const user = await prisma.user.create({
            data: {
                phoneNumber: data.phoneNumber,
                messageLanguage: data.messageLanguage,
                sessionId,
                tryoutCount: 0,
            },
        });

        // Store in session cache for verification
        await sessionIdCache.set(data.phoneNumber, sessionId);

        console.log(
            `[ UserService ] created tryout user id=${user.id} phone=${data.phoneNumber}`
        );

        return { sessionId, userId: user.id };
    }

    /**
     * Checks whether the user has exceeded the tryout rate limit.
     */
    isRateLimited(user: UserTryoutInfo): boolean {
        return user.tryoutCount >= MAX_TRYOUT_COUNT;
    }

    /**
     * Increments tryout count and updates tryoutLastSentAt.
     */
    async incrementTryout(userId: number): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: {
                tryoutCount: { increment: 1 },
                tryoutLastSentAt: new Date(),
            },
        });
    }

    /**
     * Updates the user's lastUsedMessageId after sending a message.
     */
    async updateLastUsedMessage(userId: number, messageId: number): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: { lastUsedMessageId: messageId },
        });
    }
}

export const userService = new UserService();
