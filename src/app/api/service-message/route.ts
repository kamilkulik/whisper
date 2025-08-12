import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface UserData {
  phoneNumber: string;
  email: string;
  name: string;
  messageLanguage: string;
}

export const POST = async (request: NextRequest) => {
  let body: UserData;

  try {
    body = await request.json();

    // Validate required fields
    if (
      !body.phoneNumber ||
      !body.email ||
      !body.name ||
      !body.messageLanguage
    ) {
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
    const cleanPhone = body.phoneNumber.replace(/\s+/g, "");
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
          phoneNumber: body.phoneNumber,
          name: body.name,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          phoneNumber: body.phoneNumber,
          email: body.email,
          name: body.name,
          premium: true,
        },
      });
    }

    console.log("User data saved to database:", {
      timestamp: new Date().toISOString(),
      data: body,
    });

    return NextResponse.json(
      { message: "User data saved to database" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing user data:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas przetwarzania wiadomości" },
      { status: 500 }
    );
  }
};
