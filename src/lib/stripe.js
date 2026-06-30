import "server-only";

import Stripe from "stripe";

// Shell-deploy guard: Stripe's constructor throws when the key is empty,
// and Next executes this module at build time via any route handler that imports it.
// Fall back to a placeholder so `next build` doesn't crash without env vars.
// Original:
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_for_shell_deploy");
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function createPaymentLink(priceId, redirectUrl) {
    const paymentLink = await stripe.paymentLinks.create({
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        // Optional: create a new customer for each payment
        customer_creation: 'always',
        // Optional: redirect after payment
        after_completion: {
            type: 'redirect',
            redirect: { url: redirectUrl },
        },
    });

    console.log('[ stripe ] Created payment Link URL:', paymentLink.url);
}