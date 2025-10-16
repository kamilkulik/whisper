## POSSIBLE SUBSCRIPTION DATA DRIFT

Important facts about STRIPE webhooks mechanics
https://docs.stripe.com/webhooks#automatic-retries

- webhook endpoint needs to return 200 to webhook call for event to be marked as delivered
- Stripe attempts to deliver events to your destination for up to three days with an exponential backoff in live mode.

#### checkout.session.completed

_creates a new subscription in DB_
_updates the user to have premium subscription DB_
_sends a welcome email_

Drift would mean the subscription didn't get created.
what happens in case of subscription creation failure?

- the user doesn't get welcome email
- the user doesn't get updated to reflect subscription premium
- **full subscription object missing**

#### customer.subscription.updated

_only updates subscription with received webhook data_

- dateCancelled
- status

#### refund.created

_only updates subscription to reflect refund was issued_

- dateRefunded
- status
