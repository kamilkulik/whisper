import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";

import { stripe } from "@/lib/stripe";
import { SubscriptionType } from "@prisma/client";
import { productConfigs } from "@/lib/consts";
import { triangulateLocationBe } from "../utils/triangulateLocationBe";
import { getBaseUrl } from "../utils/baseUrl";

export interface CheckoutSessionsPayload {
  productType: SubscriptionType;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutSessionsPayload = await request.json();
    const { productType } = body;

    const headersList = await headers();
    const baseUrl = await getBaseUrl();

    const ipCountry = headersList.get("x-vercel-ip-country"); // Vercel IP country header will be set to location of function that called this API
    const triangulatedCountryHeader = headersList.get("x-triangulated-country");

    const triangulatedCountry = triangulateLocationBe(
      null,
      ipCountry,
      baseUrl,
      triangulatedCountryHeader
    );

    if (!triangulatedCountry) {
      throw new Error(
        "[ /api/checkout-sessions ] Failed to triangulate country"
      );
    }

    if (!productType) {
      throw new Error("[ /api/checkout-sessions ] Product type is required");
    }

    console.log(
      "[ /api/checkout-sessions ]",
      `Attempting to get config for product type: ${productType} in country: ${triangulatedCountry}`
    );

    const nodeEnv = process.env.NODE_ENV;
    const environment =
      nodeEnv === "test" || nodeEnv === "development" || !nodeEnv
        ? "development"
        : "production";

    const config =
      productConfigs[environment][triangulatedCountry]?.[productType];

    if (!config) {
      throw new Error(
        "[ /api/checkout-sessions ] Service is not available in your country"
      );
    }

    console.log(
      "[ /api/checkout-sessions ]",
      "--- IMPORTANT --- config",
      config
    );

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
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Error creating checkout session", err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
