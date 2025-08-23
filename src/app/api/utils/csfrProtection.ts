import "server-only";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

const SECRET = process.env.CSRF_SECRET; // strong, private secret

export function csfrProtection(request: NextRequest): NextResponse | void {
  // CSRF protection
  // Does NOT depend on request method - all HTTP methods are checked
  // Missing token causes an error
  // Token is tied to the user session - every session has it's own CSRF token for each user
  // Token is unique, different to sessionId token and stored on the backend

  if (request.method !== "OPTIONS") {
    try {
      const token = request.cookies.get("x-csrf-token");
      const sessionId = request.cookies.get("sessionId")?.value;

      if (!token || !sessionId) {
        return NextResponse.json(
          { error: "CSRF token is required" },
          { status: 403 }
        );
      }

      const decoded = Buffer.from(token.value, "base64url").toString("utf8");
      const [decodedSessionId, nonce, timestamp, signature] =
        decoded.split(":");

      if (decodedSessionId !== sessionId)
        return NextResponse.json(
          { error: "CSRF token is invalid" },
          { status: 403 }
        );

      const payload = `${decodedSessionId}:${nonce}:${timestamp}`;
      const expectedHmac = crypto
        .createHmac("sha256", SECRET!)
        .update(payload)
        .digest("hex");

      // Constant-time comparison to prevent timing attacks
      const tokensMatch = crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expectedHmac, "hex")
      );

      console.log("tokensMatch", tokensMatch);
      if (!tokensMatch) {
        return NextResponse.json(
          { error: "CSRF token is invalid" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "CSRF token is invalid" },
        { status: 403 }
      );
    }
  }
}

export function generateCsrfToken(sessionId: string): string {
  if (!SECRET) {
    throw new Error("CSRF_SECRET is not set");
  }

  const nonce = crypto.randomBytes(16).toString("hex"); // unique per token
  const timestamp = Date.now().toString();

  const payload = `${sessionId}:${nonce}:${timestamp}`;
  const hmac = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");

  // Token = payload + signature
  return Buffer.from(`${payload}:${hmac}`).toString("base64url");
}
