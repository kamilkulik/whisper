import "server-only";

import { getUserFromSessionId } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await getUserFromSessionId(sessionId.value);

    if (user && user.sessionId === sessionId.value) {
      return NextResponse.json({ authenticated: true });
    } else {
      return NextResponse.json({ authenticated: false });
    }
  } catch (error) {
    console.error("Error checking authentication:", error);
    return NextResponse.json({ authenticated: false });
  }
}
