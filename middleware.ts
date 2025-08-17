import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected (dashboard)
  if (pathname.startsWith("/dashboard")) {
    const sessionId = request.cookies.get("sessionId");

    // If no session cookie, redirect to login
    if (!sessionId) {
      return NextResponse.redirect(new URL("/?modal=login", request.url));
    }

    // TODO: Validate session against your session store
    // For now, we'll just check if the cookie exists
    // In production, you'd validate against a database or Redis store
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
