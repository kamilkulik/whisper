import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface OneTimeJwtPayload {
  sub: string; // userId
  email: string; // userEmail
  exp: number; // expiration timestamp
}

export interface OneTimeJwtClaims {
  userId: string;
  userEmail: string;
}

/**
 * Generates a one-time JWT token with claims for userId and userEmail
 * Token expires in 24 hours from now
 */
export async function generateOneTimeToken(
  userId: string,
  userEmail: string
): Promise<string> {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  const token = await new SignJWT({
    sub: userId,
    email: userEmail,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secret);

  return token;
}

/**
 * Verifies and decodes a one-time JWT token
 * Returns the decoded claims if verification passes
 * Throws an error if verification fails
 */
export async function verifyOneTimeToken(
  token: string
): Promise<OneTimeJwtClaims> {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    // Type guard to ensure payload has required fields
    if (
      !payload.sub ||
      !payload.email ||
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    ) {
      throw new Error("Invalid token payload structure");
    }

    return {
      userId: payload.sub,
      userEmail: payload.email,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
    throw new Error("Token verification failed");
  }
}
