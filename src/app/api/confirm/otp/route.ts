import { sendEmail } from "@/lib/emailapi";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/smsapi";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sessionIdCache } from "@/lib/sessionIdCache";
import { generateCsrfToken } from "../../utils/csfrProtection";
import { getLocale } from "next-intl/server";

const temporarySessionIdCache = new Map<
  string,
  {
    confirmationCode: number;
    confirmationCodeExpires: Date;
  }
>();

function generateConfiramtionCodeDetails() {
  return {
    confirmationCode: Math.floor(100000 + Math.random() * 900000),
    confirmationCodeExpires: new Date(Date.now() + 1000 * 60 * 1), // 1 minute
    sessionId: uuidv4(),
  };
}

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const phoneNumber = request.nextUrl.searchParams.get("phoneNumber");
  const email = request.nextUrl.searchParams.get("email");
  const locale = await getLocale();

  if (!phoneNumber && !email) {
    return NextResponse.json(
      { error: "Phone number or email is required" },
      { status: 400 }
    );
  }

  const { confirmationCode, confirmationCodeExpires, sessionId } =
    generateConfiramtionCodeDetails();

  temporarySessionIdCache.set(sessionId, {
    confirmationCode,
    confirmationCodeExpires,
  });

  if (email) {
    await sendEmail({
      locale,
      subject: "Wieczorny szept - kod potwierdzający",
      template: "confirmation-code-via-email",
      to: email,
      verificationCode: confirmationCode.toString(),
    });
  } else if (phoneNumber) {
    await sendSms(phoneNumber, confirmationCode.toString());
  }

  // For local development, include the verification code in the response
  const response: any = { sessionId, confirmationCodeExpires };
  if (process.env.NODE_ENV === "development") {
    response.confirmationCode = confirmationCode;
  }

  return NextResponse.json(response);
};

/**
 * POST /api/confirm/otp
 * Will check whether the confirmation code matches that saved in
 * temporarySessionIdCache
 * If yes, will return to the user http only cookie which will expire in 7 days
 * If no, will return 400
 * With that cookies in the users browser, they will be able to navigate into the dashboard
 * without having to go through the login process again
 */
export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const confirmationCode = body["confirmationCode"];
  const sessionId = body["sessionId"];
  const email = body["email"];
  const phoneNumber = body?.phoneNumber?.toString();
  const isLoginMode = body["isLoginMode"];

  console.log(JSON.stringify(body, null, 2));

  if (!confirmationCode || !sessionId) {
    return NextResponse.json(
      { error: "confirmationCode and sessionId are required" },
      { status: 400 }
    );
  }

  const cachedSessionDetails = temporarySessionIdCache.get(sessionId);

  if (
    !cachedSessionDetails ||
    !cachedSessionDetails.confirmationCode ||
    !cachedSessionDetails.confirmationCodeExpires
  ) {
    return NextResponse.json(
      { error: "Invalid sessionId or confirmationCode" },
      { status: 400 }
    );
  }

  // Check if code is valid and not expired
  if (
    cachedSessionDetails.confirmationCode === confirmationCode &&
    cachedSessionDetails.confirmationCodeExpires > new Date()
  ) {
    // Create a new session ID for the authenticated session
    const authenticatedSessionId = uuidv4();

    if (isLoginMode) {
      if (email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          console.log("existing user", email);
          try {
            await prisma.user.update({
              where: { email },
              data: {
                sessionId: authenticatedSessionId,
              },
            });
          } catch (err) {
            console.error("Error saving to the db", err);
          }
        } else {
          console.log("no existing user", email, " - redirecting to signup");
          // return raw 307 redirect with desition /?modal=phone
          return NextResponse.json({
            redirectUrl: "/?modal=phone",
            status: 307,
            isEmailVerified: true,
          });
        }
      } else if (phoneNumber) {
        const existingUser = await prisma.user.findUnique({
          where: { phoneNumber },
        });

        if (existingUser) {
          console.log("existing user", phoneNumber);
          try {
            await prisma.user.update({
              where: { phoneNumber },
              data: { sessionId: authenticatedSessionId },
            });
          } catch (err) {
            console.error("Error saving to the db", err);
          }
        } else {
          // need to redirect to the signup form
          console.log(
            "no existing user",
            phoneNumber,
            " - redirecting to signup"
          );
          return NextResponse.json({
            redirectUrl: "/?modal=phone",
            status: 307,
          });
        }
      }
    }

    // Create response with success
    const response = NextResponse.json({ success: true });
    sessionIdCache.set(phoneNumber, authenticatedSessionId);

    // Set secure session cookie
    response.cookies.set({
      name: "sessionId",
      value: authenticatedSessionId,
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    response.cookies.set({
      name: "x-csrf-token",
      value: generateCsrfToken(authenticatedSessionId),
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Clean up the temporary session
    temporarySessionIdCache.delete(sessionId);

    return response;
  } else {
    return NextResponse.json(
      { error: "Invalid or expired confirmation code" },
      { status: 400 }
    );
  }
};
