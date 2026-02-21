import { after, NextRequest, NextResponse } from "next/server";
import { verifyOneTimeToken } from "../../utils/oneTimeJwt";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "../../utils/baseUrl";
import { sendCapiEvent, buildCapiUserData } from "@/lib/fbCapi";
import { generateEventId } from "@/lib/eventId";
import { Event } from "@/lib/fbq";

export async function GET(request: NextRequest) {
  try {
    // Get the token from query parameters
    const baseUrl = await getBaseUrl();
    const { searchParams } = new URL(request.nextUrl);
    const token = searchParams.get("token");

    if (!token) {
      console.error("Email confirmation failed: Missing token");
      return NextResponse.redirect(
        new URL("/email-confirmation?status=error", baseUrl),
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
        new URL("/email-confirmation?status=error", baseUrl),
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
        new URL("/email-confirmation?status=error", baseUrl),
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
        new URL("/email-confirmation?status=error", baseUrl),
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      console.log(
        "[ /api/confirm/email ] Email confirmation: Email already verified",
        {
          userId: claims.userId,
          email: claims.userEmail,
        },
      );
      return NextResponse.redirect(
        new URL(
          "/email-confirmation?status=already-verified&email=" +
          claims.userEmail,
          baseUrl,
        ),
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

    // Lead CAPI (fire-and-forget)
    const fbp = request.cookies.get("_fbp")?.value;
    const fbc = request.cookies.get("_fbc")?.value;
    const userAgent = request.headers.get("user-agent") ?? "";

    after(
      sendCapiEvent({
        eventName: Event.Lead,
        eventTime: Math.floor(Date.now() / 1000),
        actionSource: "website",
        userData: buildCapiUserData({ fbp, fbc, email: user.email }),
        clientUserAgent: userAgent,
        eventId: generateEventId(Event.Lead),
      }).catch(() => { })
    );

    // Redirect to success page
    return NextResponse.redirect(
      new URL(
        "/email-confirmation?status=success&email=" + claims.userEmail,
        baseUrl,
      ),
    );
  } catch (error) {
    console.error("Email confirmation error:", error);
    const baseUrl = await getBaseUrl();
    return NextResponse.redirect(
      new URL("/email-confirmation?status=error", baseUrl),
    );
  }
}
