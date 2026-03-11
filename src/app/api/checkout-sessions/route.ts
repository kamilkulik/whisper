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

    console.log(`[ api/checkout-sessions ] POST started. clientReferenceId=${clientReferenceId}, productType=${productType}, newSignUp=${newSignUp}`);

    if (!clientReferenceId) {
      console.warn("[ api/checkout-sessions ] Client reference ID is required");
      throw new Error("[ api/checkout-sessions ] Client reference ID is required");
    }

    if (!productType) {
      console.warn("[ api/checkout-sessions ] Product type is required");
      throw new Error("[ api/checkout-sessions ] Product type is required");
    }

    const nodeEnv = process.env.NODE_ENV;
    const environment =
      nodeEnv === "test" || nodeEnv === "development" || !nodeEnv
        ? "development"
        : "production";

    const config =
      productConfigs[environment]["DEFAULT"]?.[productType];

    if (!config) {
      console.warn(`[ api/checkout-sessions ] No product config found for type: ${productType}`);
      throw new Error(
        `[ api/checkout-sessions ] No product config found for type: ${productType}`,
      );
    }

    const isDevelopment = environment === "development";
    const newSignUpPriceId = isDevelopment ? "price_1T9WNY1u5HYgja2NByvNX4RO" : "price_1T9WJs1u5HYgja2NTRffhuaF";

    console.log(`[ api/checkout-sessions ] Resolved config for environment=${environment}, isDevelopment=${isDevelopment}`);
    console.log(
      "[ api/checkout-sessions ]",
      "--- IMPORTANT --- config: ",
      newSignUp ? `newSignUpPriceId=${newSignUpPriceId}` : config,
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
      console.warn("[ api/checkout-sessions ] Failed to create checkout session URL");
      throw new Error("Failed to create checkout session URL");
    }

    console.log(`[ api/checkout-sessions ] Stripe checkout session created successfully (session.id=${session.id})`);

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
      })
        .then(() => console.log(`[ api/checkout-sessions ] Dispatched InitiateCheckout CAPI event`))
        .catch(() => { })
    );

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[ api/checkout-sessions ] Error creating checkout session", err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 },
    );
  }
}
