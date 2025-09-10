import { NextRequest, NextResponse } from "next/server";

const DEFAULT_LOCALE = "en";
const POSSIBLE_LOCALES = ["pl", "en"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const res = NextResponse.next();

  // Authentication check for protected routes
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

  // Locale detection and cookie setting
  // If cookie already exists, keep it
  if (request.cookies.has("locale")) return res;

  // Otherwise, detect from Accept-Language header
  const acceptLang = request.headers.get("accept-language") || "";
  // en-GB,en;q=0.9,en-US;q=0.8,pl;q=0.7
  const browserLocale = acceptLang.split(",")[0].split("-")[0]; // crude parse
  const locale = POSSIBLE_LOCALES.includes(browserLocale)
    ? browserLocale
    : DEFAULT_LOCALE;

  console.log("🇵🇱 setting locale", locale);
  res.cookies.set("locale", locale, {
    path: "/",
    httpOnly: false, // client should read it too
    sameSite: "lax",
  });

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
