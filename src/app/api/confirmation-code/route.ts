import { sendEmail } from "@/lib/emailapi";
import { sendSms } from "@/lib/smsapi";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

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
    // TODO: send confirmation code to user via email
    console.log(
      `Sending confirmation code to email: ${email} - Code: ${confirmationCode}`
    );
    // For now, just log the email sending (you can implement email sending later)
    await sendEmail(
      email,
      "Wieczorny szept - kod potwierdzający",
      confirmationCode.toString()
    );
  } else if (phoneNumber) {
    // TODO: send confirmation code to user via sms
    console.log(
      `Sending confirmation code to phone: ${phoneNumber} - Code: ${confirmationCode}`
    );
    await sendSms(phoneNumber, confirmationCode.toString());
  }

  return NextResponse.json({ sessionId, confirmationCodeExpires });
};

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const confirmationCode = body["confirmationCode"];
  const sessionId = body["sessionId"];

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

    // Create response with success
    const response = NextResponse.json({ success: true });

    // Set secure session cookie
    response.cookies.set({
      name: "sessionId",
      value: authenticatedSessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
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
