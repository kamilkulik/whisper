import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/whisper/feedback
 *
 * Saves user feedback when they decline the trial offer.
 * Requires a valid sessionId (via cookie) to prevent spam.
 */
export async function POST(request: NextRequest) {
    try {
        const sessionId = request.cookies.get("sessionId")?.value;

        if (!sessionId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { feedback } = body;

        if (!feedback || typeof feedback !== "string" || feedback.trim().length === 0) {
            return NextResponse.json(
                { error: "Feedback is required" },
                { status: 400 }
            );
        }

        // Get the user's phone number from the sessionId
        const user = await prisma.user.findUnique({
            where: { sessionId },
            select: { phoneNumber: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found for this session" },
                { status: 404 }
            );
        }

        await prisma.feedback.create({
            data: {
                phoneNumber: user.phoneNumber,
                sessionId,
                feedback: feedback.trim(),
            },
        });

        console.log(`[ whisper/feedback ] Saved feedback from ${user.phoneNumber}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[ whisper/feedback ] Error:", error);
        return NextResponse.json(
            { error: "Failed to save feedback" },
            { status: 500 }
        );
    }
}
