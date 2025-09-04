import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";

import { stripe } from "@/lib/stripe";
import { SubscriptionType } from "@prisma/client";
import { productConfigs } from "@/lib/consts";

export interface CheckoutSessionsPayload {
  productType: SubscriptionType;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutSessionsPayload = await request.json();
    const { productType } = body;

    const headersList = await headers();
    let origin = headersList.get("origin");

    // Ensure we have a valid origin with proper scheme
    if (!origin) {
      origin =
        process.env.NODE_ENV === "production"
          ? "https://wieczornyszept.pl" // Replace with your actual domain
          : "http://localhost:3000";
    }

    // Ensure origin has proper scheme
    if (!origin.startsWith("http://") && !origin.startsWith("https://")) {
      origin = `https://${origin}`;
    }

    const config = productConfigs[productType as keyof typeof productConfigs];

    console.log("--- IMPORTANT --- config", config);

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      client_reference_id: "id_uzytkownika",
      customer_email: body.email,
      metadata: {
        productType: productType.toString(),
        productId: config.prod,
        priceId: config.price,
      },
      line_items: [
        {
          price: config.price,
          quantity: config.quantity,
        },
      ],
      mode: config.mode,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
