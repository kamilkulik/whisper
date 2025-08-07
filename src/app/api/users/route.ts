import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface UserData {
  numerTelefonu: string;
  email: string;
  imie: string;
}

export const POST = async (request: NextRequest) => {
  try {
    const body: UserData = await request.json();
    
    // Validate required fields
    if (!body.numerTelefonu || !body.email || !body.imie) {
      return NextResponse.json(
        { error: 'Wszystkie pola są wymagane' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Nieprawidłowy format email' },
        { status: 400 }
      );
    }

    // Validate phone number (basic validation for Polish numbers)
    const phoneRegex = /^(\+48|48)?[0-9]{9}$/;
    const cleanPhone = body.numerTelefonu.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Nieprawidłowy format numeru telefonu' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { email: body.email },
        data: {
          phoneNumber: body.numerTelefonu,
          name: body.imie,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          phoneNumber: body.numerTelefonu,
          email: body.email,
          name: body.imie,
          premium: true,
        }
      });
    }

    console.log('User data saved to database:', {
      timestamp: new Date().toISOString(),
      data: body
    });

    return NextResponse.json(
      { message: 'Wiadomość została pomyślnie zapisana' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing user data:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas przetwarzania wiadomości' },
      { status: 500 }
    );
  }
}; 