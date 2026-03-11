import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/whisper/status?sessionId=uuid-1234...
 *
 * Returns the delivery status of the latest whisper for the given sessionId.
 * Frontend polls this endpoint every 2 seconds until delivered or timeout.
 */
export async function GET(request: NextRequest) {
    try {
        const sessionId = request.nextUrl.searchParams.get("sessionId");

        console.log(`[ api/whisper/status ] GET started for sessionId=${sessionId}`);

        if (!sessionId) {
            console.warn("[ api/whisper/status ] Missing sessionId query parameter in request");
            return NextResponse.json(
                { error: "sessionId parameter is required" },
                { status: 400 }
            );
        }

        // Find the most recent delivery for this sessionId
        const delivery = await prisma.delivery.findFirst({
            where: { sessionId },
            orderBy: { createdAt: "desc" },
            select: { delivered: true },
        });

        if (!delivery) {
            console.warn(`[ api/whisper/status ] No delivery record found for sessionId=${sessionId}`);
            return NextResponse.json(
                { error: "No delivery found for this session" },
                { status: 404 }
            );
        }

        console.log(`[ api/whisper/status ] Found delivery record (delivered=${delivery.delivered}) for sessionId=${sessionId}`);
        return NextResponse.json({ delivered: delivery.delivered });
    } catch (error) {
        console.error("[ api/whisper/status ] Error:", error);
        return NextResponse.json(
            { error: "Failed to check delivery status" },
            { status: 500 }
        );
    }
}
