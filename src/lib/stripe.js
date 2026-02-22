import "server-only";

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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