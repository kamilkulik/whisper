import { after, NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/smsapi";
import { isValidE164, normalizeE164 } from "@/lib/consts";
import { userService } from "@/services/UserService";
import { messageService } from "@/services/MessageService";
import { SupportedLanguagesEnum } from "@prisma/client";
import { sendCapiEvent, buildCapiUserData } from "@/lib/fbCapi";
import { generateEventId } from "@/lib/eventId";
import { Event } from "@/lib/fbq";
import { generateCsrfToken } from "../../utils/csfrProtection";

/**
 * POST /api/whisper/send
 *
 * Sends a tryout whisper to a phone number.
 * - Creates or finds user by phone number
 * - Rate-limits to 3 tryout messages per phone number
 * - Sends the next message via Twilio
 * - Creates a Delivery record for webhook tracking
 * - Returns sessionId cookie for subsequent polling
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phoneNumber: rawPhone, language } = body;

        if (!rawPhone) {
            console.warn("[ api/whisper/send ] Missing raw phone number in request body");
            return NextResponse.json(
                { error: "Phone number is required" },
                { status: 400 }
            );
        }

        const phoneNumber = normalizeE164(rawPhone);
        if (!isValidE164(phoneNumber)) {
            console.warn(`[ api/whisper/send ] Invalid phone number format: ${rawPhone}`);
            return NextResponse.json(
                { error: "Invalid phone number format" },
                { status: 400 }
            );
        }

        // Determine message language — default EN
        const msgLanguage: SupportedLanguagesEnum =
            language && Object.values(SupportedLanguagesEnum).includes(language)
                ? language
                : SupportedLanguagesEnum.EN;

        console.log(`[ api/whisper/send ] POST started for phone: ${phoneNumber}, language: ${msgLanguage}`);

        // 1. Find or create the user
        let user = await userService.findByPhoneNumber(phoneNumber);
        let sessionId: string;
        let userId: number;

        if (!user) {
            // New user — create a minimal record
            const result = await userService.createForTryout({
                phoneNumber,
                messageLanguage: msgLanguage,
            });
            sessionId = result.sessionId;
            userId = result.userId;

            console.log(`[ api/whisper/send ] Created new user (userId=${userId}) with sessionId=${sessionId}`);

            // Re-fetch to get the full tryout info
            user = await userService.findByPhoneNumber(phoneNumber);
            if (!user) {
                console.warn(`[ api/whisper/send ] Failed to successfully create/retrieve user for phone: ${phoneNumber}`);
                return NextResponse.json(
                    { error: "Failed to create user" },
                    { status: 500 }
                );
            }
        } else {
            // Existing user — get their current sessionId or generate a new one
            const existingUser = await prisma.user.findUnique({
                where: { phoneNumber },
                select: { id: true, sessionId: true },
            });

            console.log(`[ api/whisper/send ] Found existing user (userId=${existingUser?.id}), existing session=${!!existingUser?.sessionId}`);

            if (!existingUser) {
                console.warn(`[ api/whisper/send ] Existing user unexpectedly not found after initial check for phone: ${phoneNumber}`);
                return NextResponse.json(
                    { error: "User not found" },
                    { status: 500 }
                );
            }

            userId = existingUser.id;

            if (existingUser.sessionId) {
                sessionId = existingUser.sessionId;
            } else {
                // User exists but has no session — generate one
                const { v4: uuidv4 } = await import("uuid");
                sessionId = uuidv4();
                await prisma.user.update({
                    where: { id: userId },
                    data: { sessionId },
                });
                const { sessionIdCache } = await import("@/lib/sessionIdCache");
                await sessionIdCache.set(phoneNumber, sessionId);
                console.log(`[ api/whisper/send ] Generated new sessionId=${sessionId} for existing user`);
            }
        }

        // 2. Rate-limit check
        if (userService.isRateLimited(user)) {
            console.warn(
                `[ api/whisper/send ] Rate limited: phone=${phoneNumber} tryoutCount=${user.tryoutCount}`
            );
            return NextResponse.json(
                { error: "Maximum tryout messages reached" },
                { status: 429 }
            );
        }

        // 3. Get the next message
        console.log(`[ api/whisper/send ] Rate limit check passed (tryoutCount=${user.tryoutCount}). Fetching next message...`);
        const nextMessage = await messageService.getNextMessage(
            user.lastUsedMessageId,
            msgLanguage
        );

        if (!nextMessage) {
            console.warn(`[ api/whisper/send ] No message available for user ${userId} and language ${msgLanguage}`);
            return NextResponse.json(
                { error: "No message available" },
                { status: 500 }
            );
        }

        console.log(`[ api/whisper/send ] Retrieved next message (id=${nextMessage.id}). Sending via SMS...`);

        // 4. Send SMS immediately (not scheduled) via Twilio
        await sendSms(phoneNumber, nextMessage.text, false);

        // 5. Create delivery record for webhook tracking
        const delivery = await prisma.delivery.create({
            data: {
                phoneNumber,
                sessionId,
                messageNumber: nextMessage.id,
                delivered: false,
            },
        });

        console.log(
            `[ api/whisper/send ] Successfully sent message #${nextMessage.id} to ${phoneNumber}, created delivery id=${delivery.id}`
        );

        // 6. Update user: increment tryout, update lastUsedMessage
        await userService.incrementTryout(userId);
        await userService.updateLastUsedMessage(userId, nextMessage.id);

        // 7. Fire Contact CAPI event (fire-and-forget)
        const fbp = request.cookies.get("_fbp")?.value;
        const fbc = request.cookies.get("_fbc")?.value;
        const userAgent = request.headers.get("user-agent") ?? "";
        const contactEventId = generateEventId(Event.Contact);

        after(
            sendCapiEvent({
                eventName: Event.Contact,
                eventTime: Math.floor(Date.now() / 1000),
                actionSource: "website",
                userData: buildCapiUserData({ fbp, fbc }),
                clientUserAgent: userAgent,
                eventId: contactEventId,
            })
                .then(() => console.log(`[ api/whisper/send ] Dispatched Contact CAPI event (eventId=${contactEventId})`))
                .catch(() => { })
        );

        // 8. Return response with sessionId cookie
        const response = NextResponse.json({
            success: true,
            eventId: contactEventId,
            sessionId,
        });

        response.cookies.set({
            name: "sessionId",
            value: sessionId,
            httpOnly: process.env.VERCEL_ENV === "production",
            secure: process.env.VERCEL_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 14, // 14 days
            path: "/",
        });

        response.cookies.set({
            name: "x-csrf-token",
            value: generateCsrfToken(sessionId),
            httpOnly: false,
            secure: process.env.VERCEL_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 14,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("[ whisper/send ] Error:", error);
        return NextResponse.json(
            { error: "Failed to send whisper" },
            { status: 500 }
        );
    }
}
