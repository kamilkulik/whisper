import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";

import { stripe } from "@/lib/stripe";
import { SubscriptionType } from "@prisma/client";
import { productConfigs } from "@/lib/consts";
import { triangulateLocationBe } from "../utils/triangulateLocationBe";

export interface CheckoutSessionsPayload {
  productType: SubscriptionType;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutSessionsPayload = await request.json();
    const { productType } = body;

    const headersList = await headers();
    let host = headersList.get("host");

    // Ensure we have a valid host with proper scheme
    if (!host) {
      host =
        process.env.NODE_ENV === "production"
          ? "https://wieczornyszept.pl" // Replace with your actual domain
          : "http://localhost:3000";
    }

    // Ensure host has proper scheme
    if (!host.startsWith("http://") && !host.startsWith("https://")) {
      host = `https://${host}`;
    }

    const ipCountry = headersList.get("x-vercel-ip-country");
    const triangulatedCountry = triangulateLocationBe(null, ipCountry, host);

    if (!triangulatedCountry) {
      throw new Error("Failed to triangulate country");
    }

    const config = productConfigs[triangulatedCountry]?.[productType];

    if (!config) {
      throw new Error("Service is not available in your country");
    }

    console.log("--- IMPORTANT --- config", config);

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      client_reference_id: body.email,
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
      success_url: `${host}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${host}/?canceled=true`,
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
