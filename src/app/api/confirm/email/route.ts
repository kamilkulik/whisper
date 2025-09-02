import { NextRequest, NextResponse } from "next/server";
import { verifyOneTimeToken } from "../../utils/oneTimeJwt";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get the token from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      console.error("Email confirmation failed: Missing token");
      return NextResponse.redirect(
        new URL("/email-confirmation?status=error", request.url)
      );
    }

    // Verify the JWT token
    let claims;
    try {
      claims = await verifyOneTimeToken(token);
    } catch (error) {
      console.error("Email confirmation failed: Token verification error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.redirect(
        new URL("/email-confirmation?status=error", request.url)
      );
    }

    // Find the user by ID and verify the email matches
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(claims.userId, 10),
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      console.error("Email confirmation failed: User not found", {
        userId: claims.userId,
        email: claims.userEmail,
      });
      return NextResponse.redirect(
        new URL("/email-confirmation?status=error", request.url)
      );
    }

    // Verify that the email in the token matches the user's email
    if (user.email !== claims.userEmail) {
      console.error("Email confirmation failed: Email mismatch", {
        tokenEmail: claims.userEmail,
        userEmail: user.email,
        userId: claims.userId,
      });
      return NextResponse.redirect(
        new URL("/email-confirmation?status=error", request.url)
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      console.log("Email confirmation: Email already verified", {
        userId: claims.userId,
        email: claims.userEmail,
      });
      return NextResponse.redirect(
        new URL("/email-confirmation?status=already-verified", request.url)
      );
    }

    // Update the user's email verification status
    await prisma.user.update({
      where: {
        id: parseInt(claims.userId, 10),
      },
      data: {
        emailVerified: true,
      },
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL(
        "/email-confirmation?status=success&email=" + claims.userEmail,
        request.url
      )
    );
  } catch (error) {
    console.error("Email confirmation error:", error);
    return NextResponse.redirect(
      new URL("/email-confirmation?status=error", request.url)
    );
  }
}
