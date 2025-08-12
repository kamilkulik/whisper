import { smsapi } from "@/lib/smsapi";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const confirmationCode = searchParams.get("confirmationCode");
  const userId = searchParams.get("userId");

  if (confirmationCode && userId) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    let success = false;
    if (
      user?.confirmationCode === parseInt(confirmationCode) &&
      user?.confirmationCodeExpires &&
      user.confirmationCodeExpires > new Date()
    ) {
      success = true;
    }

    return NextResponse.json({ success });
  }
};

interface UserData {
  numerTelefonu: string;
  email: string;
  imie: string;
}

export const POST = async (request: NextRequest) => {
  let body: UserData;

  try {
    body = await request.json();

    // Validate required fields
    if (!body.numerTelefonu || !body.email || !body.imie) {
      return NextResponse.json(
        { error: "Wszystkie pola są wymagane" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Nieprawidłowy format email" },
        { status: 400 }
      );
    }

    // Validate phone number (basic validation for Polish numbers)
    const phoneRegex = /^(\+48|48)?[0-9]{9}$/;
    const cleanPhone = body.numerTelefonu.replace(/\s+/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Nieprawidłowy format numeru telefonu" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { email: body.email },
        data: {
          phoneNumber: body.numerTelefonu,
          name: body.imie,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          phoneNumber: body.numerTelefonu,
          email: body.email,
          name: body.imie,
          premium: true,
        },
      });
    }

    console.log("User data saved to database:", {
      timestamp: new Date().toISOString(),
      data: body,
    });

    return NextResponse.json(
      { message: "Wiadomość została pomyślnie zapisana" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing user data:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas przetwarzania wiadomości" },
      { status: 500 }
    );
  }

  try {
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });

      const phoneNumber = user?.phoneNumber;

      if (!phoneNumber) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // 6-digit code
      const message = Math.floor(100000 + Math.random() * 900000);
      console.log(`Sending SMS to ${user.phoneNumber}: ${message}`);
      // const result = await smsapi.sms.sendSms(
      //   `${user.phoneNumber}`,
      //   message.message
      // );
      // console.log(result);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          confirmationCode: message,
          confirmationCodeExpires: new Date(Date.now() + 1000 * 60 * 5),
        },
      });
    }
  } catch (error) {
    // in case of message service failure log the error
    console.error(`Failed to send message to user ${userId}:`, error);
  }
};
