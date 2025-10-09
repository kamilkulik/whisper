import { NextRequest, NextResponse } from "next/server";
import { PL_DOMAIN, GB_DOMAIN } from "./app/_consts";
import { getBaseUrl } from "./app/api/utils/baseUrl";

const DEFAULT_LOCALE = "en";
const POSSIBLE_LOCALES = ["pl", "en"] as const;

type Locale = (typeof POSSIBLE_LOCALES)[number];

function inferDefaultFromHost(host?: string): Locale {
  if (!host) return DEFAULT_LOCALE;
  if (host.endsWith(PL_DOMAIN)) return "pl";
  if (host.endsWith(GB_DOMAIN)) return DEFAULT_LOCALE;
  return DEFAULT_LOCALE;
}

export async function middleware(request: NextRequest) {
  /**
   * Authentication check for protected routes
   */

  const baseUrl = await getBaseUrl();
  const { pathname } = request.nextUrl;
  const res = NextResponse.next();

  // Authentication check for protected routes
  if (pathname.startsWith("/dashboard")) {
    const sessionId = request.cookies.get("sessionId");

    // If no session cookie, redirect to login
    if (!sessionId) {
      return NextResponse.redirect(new URL("/?modal=login", baseUrl));
    }

    // TODO: Validate session against your session store
    // For now, we'll just check if the cookie exists
    // In production, you'd validate against a database or Redis store
  }

  /**
   * Locale detection and cookie setting
   *
   * Recommnded order
   * User-selected locale (cookie) → always wins
   * Domain default (.pl → pl, .co.uk → en)
   * Use browser language detection as a fallback in case domain is not recognised (for some reason)
   */

  // User-selected locale (cookie) → always wins
  if (request.cookies.has("locale")) return res;

  // Domain default (.pl → pl, .co.uk or any other → en)
  const currentDomainLocale: Locale = inferDefaultFromHost(baseUrl);

  // Otherwise, likely first visit, detect from Accept-Language header
  const acceptLang = request.headers.get("accept-language") || "";
  // en-GB,en;q=0.9,en-US;q=0.8,pl;q=0.7
  const browserLocale = acceptLang.split(",")[0].split("-")[0] as Locale; // crude parse

  // decide on the preferred locale now
  let preferredLocale: Locale;
  // domain locale and browser locale match, can safely set preferred locale
  if (currentDomainLocale === browserLocale) {
    preferredLocale = currentDomainLocale;
  } else {
    // user came from domain which suggests different locale to browser's
    if (POSSIBLE_LOCALES.includes(browserLocale)) {
      preferredLocale = browserLocale;
    } else {
      // browser locale is not supported, set default
      preferredLocale = DEFAULT_LOCALE;
    }
  }

  const locale = preferredLocale;

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
