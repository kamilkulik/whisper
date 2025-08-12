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
    confirmationCodeExpires: new Date(Date.now() + 1000 * 60 * 5),
    sessionId: uuidv4(),
  };
}

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const phoneNumber = request.nextUrl.searchParams.get("phoneNumber");
  if (!phoneNumber) {
    return NextResponse.json(
      { error: "Phone number is required" },
      { status: 400 }
    );
  }

  const { confirmationCode, confirmationCodeExpires, sessionId } =
    generateConfiramtionCodeDetails();
  temporarySessionIdCache.set(sessionId, {
    confirmationCode,
    confirmationCodeExpires,
  });

  // TODO: send confirmation code to user via sms
  console.log(`Sending confirmation code to user: ${confirmationCode}`);
  await sendSms(phoneNumber, confirmationCode.toString());

  return NextResponse.json(sessionId);
};

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const confirmationCode = body.get("confirmationCode");
  const sessionId = body.get("sessionId");

  if (confirmationCode && sessionId) {
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

    let success = false;
    if (
      cachedSessionDetails.confirmationCode === confirmationCode &&
      cachedSessionDetails.confirmationCodeExpires > new Date()
    ) {
      success = true;
    }

    return NextResponse.json({ success });
  }
};
