import { deleteSession } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "../utils/baseUrl";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId");

  const baseUrl = await getBaseUrl();

  if (!sessionId) {
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  // delete cookie from db
  await deleteSession(sessionId.value);
  // Clear the session cookie
  cookieStore.delete("sessionId");

  // Clear the x-csrf-token cookie
  cookieStore.delete("x-csrf-token");

  // Redirect to home page
  return NextResponse.redirect(new URL("/", baseUrl));
}
