import { after, NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";

import { stripe } from "@/lib/stripe";
import { SubscriptionType } from "@prisma/client";
import { productConfigs } from "@/lib/consts";
import { getBaseUrl } from "../utils/baseUrl";
import { sendCapiEvent, buildCapiUserData } from "@/lib/fbCapi";
import { generateEventId } from "@/lib/eventId";
import { Event } from "@/lib/fbq";

export interface CheckoutSessionsPayload {
  clientReferenceId?: string;
  productType: SubscriptionType;
  email?: string;
  /** For CAPI dedup: from client when available (e.g. from getMetaCookies + generateEventId). */
  fbp?: string;
  fbc?: string;
  eventId?: string;
  eventSourceUrl?: string;
  newSignUp?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutSessionsPayload = await request.json();
    const {
      clientReferenceId,
      productType,
      fbp: bodyFbp,
      fbc: bodyFbc,
      eventId: bodyEventId,
      eventSourceUrl,
      newSignUp,
    } = body;

    const headersList = await headers();
    const fbp = bodyFbp ?? request.cookies.get("_fbp")?.value;
    const fbc = bodyFbc ?? request.cookies.get("_fbc")?.value;
    const userAgent = headersList.get("user-agent") ?? "";
    const purchaseEventId = bodyEventId ?? generateEventId("Purchase");
    const baseUrl = await getBaseUrl();

    console.log("[ /api/checkout-sessions ]", "body: ", JSON.stringify(body, null, 2));

    if (!clientReferenceId) {
      throw new Error("[ /api/checkout-sessions ] Client reference ID is required");
    }

    if (!productType) {
      throw new Error("[ /api/checkout-sessions ] Product type is required");
    }

    const nodeEnv = process.env.NODE_ENV;
    const environment =
      nodeEnv === "test" || nodeEnv === "development" || !nodeEnv
        ? "development"
        : "production";

    const config =
      productConfigs[environment]["DEFAULT"]?.[productType];

    if (!config) {
      throw new Error(
        `[ /api/checkout-sessions ] No product config found for type: ${productType}`,
      );
    }

    const isDevelopment = environment === "development";
    const newSignUpPriceId = isDevelopment ? "price_1T8nne1u5HYgja2NiBiEtQFA" : "price_1T8nop1u5HYgja2N9UNjO4Dk";

    console.log(
      "[ /api/checkout-sessions ]",
      "--- IMPORTANT --- config",
      newSignUp ? newSignUpPriceId : config,
    );


    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      allow_promotion_codes: true,
      client_reference_id: clientReferenceId,
      ...(body.email ? { customer_email: body.email } : {}),
      metadata: {
        productType: productType.toString(),
        productId: config.prod,
        priceId: config.price,
        fbp: fbp ?? "",
        fbc: fbc ?? "",
        purchase_event_id: purchaseEventId,
        ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
      },
      line_items: [
        {
          price: newSignUp ? newSignUpPriceId : config.price,
          quantity: config.quantity,
        },
      ],
      ...(config.mode === "subscription" && newSignUp ? { subscription_data: { trial_period_days: 7 } } : {}),
      mode: config.mode,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }

    // InitiateCheckout CAPI (fire-and-forget)
    after(
      sendCapiEvent({
        eventName: Event.InitiateCheckout,
        eventTime: Math.floor(Date.now() / 1000),
        actionSource: "website",
        userData: buildCapiUserData({ fbp, fbc, email: body.email }),
        clientUserAgent: userAgent,
        eventSourceUrl: eventSourceUrl ?? undefined,
        eventId: purchaseEventId,
      }).catch(() => { })
    );

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Error creating checkout session", err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 },
    );
  }
}
