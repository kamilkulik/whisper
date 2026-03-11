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

        console.log(`[ api/whisper/feedback ] POST started. sessionId present: ${!!sessionId}`);

        if (!sessionId) {
            console.warn("[ api/whisper/feedback ] Unauthorized attempt: missing sessionId cookie");
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { feedback } = body;

        console.log(`[ api/whisper/feedback ] Received feedback string of length ${feedback?.length || 0}`);

        if (!feedback || typeof feedback !== "string" || feedback.trim().length === 0) {
            console.warn("[ api/whisper/feedback ] Invalid or missing feedback payload");
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
            console.warn(`[ api/whisper/feedback ] User not found for session: ${sessionId}`);
            return NextResponse.json(
                { error: "User not found for this session" },
                { status: 404 }
            );
        }

        console.log(`[ api/whisper/feedback ] Found user (${user.phoneNumber}) for session, saving feedback...`);

        await prisma.feedback.create({
            data: {
                phoneNumber: user.phoneNumber,
                sessionId,
                feedback: feedback.trim(),
            },
        });

        console.log(`[ api/whisper/feedback ] Saved feedback from ${user.phoneNumber}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[ api/whisper/feedback ] Error:", error);
        return NextResponse.json(
            { error: "Failed to save feedback" },
            { status: 500 }
        );
    }
}
