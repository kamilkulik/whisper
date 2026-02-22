"use server";

import { getUserFromSessionId } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function userIdFromCookie(): Promise<number | null> {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("sessionId");

        if (!sessionId) {
            return null;
        }

        const user = await getUserFromSessionId<"id">(sessionId.value, {
            id: true,
        });

        if (!user) {
            return null;
        }

        return user.id;
    } catch (error) {
        console.error("Error getting user id from cookie", error);
        return null;
    }
}
