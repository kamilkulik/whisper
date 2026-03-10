import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/whisper/webhook
 *
 * Twilio delivery status callback.
 * Updates the `delivered` flag in the deliveries table when Twilio
 * confirms the message was delivered to the handset.
 *
 * Twilio sends the following status values:
 * queued, failed, sent, delivered, undelivered
 *
 * We only set delivered=true on "delivered" status.
 */
export async function POST(request: NextRequest) {
    try {
        // Twilio sends form-encoded data
        const formData = await request.formData();
        const messageStatus = formData.get("MessageStatus")?.toString();
        const to = formData.get("To")?.toString();

        console.log(
            `[ whisper/webhook ] Received status="${messageStatus}" for to="${to}"`
        );

        if (!to || !messageStatus) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Only update on "delivered" status
        if (messageStatus === "delivered") {
            // Find the most recent undelivered delivery for this phone number
            const delivery = await prisma.delivery.findFirst({
                where: {
                    phoneNumber: to,
                    delivered: false,
                },
                orderBy: { createdAt: "desc" },
            });

            if (delivery) {
                await prisma.delivery.update({
                    where: { id: delivery.id },
                    data: { delivered: true },
                });

                console.log(
                    `[ whisper/webhook ] Marked delivery id=${delivery.id} as delivered for ${to}`
                );
            } else {
                console.warn(
                    `[ whisper/webhook ] No undelivered delivery found for ${to}`
                );
            }
        }

        // Twilio expects a 200 response (or TwiML, but we don't need it here)
        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error("[ whisper/webhook ] Error:", error);
        return new NextResponse(null, { status: 500 });
    }
}
