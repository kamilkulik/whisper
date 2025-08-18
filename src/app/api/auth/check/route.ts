import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("sessionId");

  if (sessionId) {
    // TODO: Validate session against your session store
    // For now, we'll just check if the cookie exists
    // In production, you'd validate against a database or Redis store
    return NextResponse.json({ authenticated: true });
  } else {
    return NextResponse.json({ authenticated: false });
  }
}
