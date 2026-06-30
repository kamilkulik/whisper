# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"Wieczorny Szept" / "Evening Whisper" — a Next.js 15 (App Router, Turbopack, React 19) SaaS that delivers a personalised SMS ("whisper") to subscribers every evening. Multi-region: served from `wieczornyszept.pl` (PL), `eveningwhisper.co.uk` (GB), `eveningwhisper.app` (default), each tied to its own Stripe products and locale. The package name in `package.json` is `wieczorny_szept`.

Package manager is **pnpm** (lockfile `pnpm-lock.yaml`; `bun.lock` is also present but pnpm is canonical — `build` script invokes `pnpm prisma:*`).

## Common commands

```bash
pnpm dev                    # Next dev with Turbopack on :3000
pnpm dev:local              # same, but bound to 0.0.0.0 so a phone on LAN can hit it
pnpm build                  # prisma generate + prisma migrate deploy + next build
pnpm lint                   # next lint
pnpm stripe:webhook         # `stripe listen --forward-to localhost:3000/api/payments/webhook`
pnpm prisma:migrate         # prisma migrate dev --name init  (dev DB)
pnpm prisma:deploy          # prisma migrate deploy           (prod DB)
pnpm shepts:transform       # tsx scripts/transformShepts.ts        — parses messages/raw.txt
pnpm shepts:upload          # tsx scripts/uploadMessageTranslations.ts — pushes translations to DB
docker-compose up -d        # local Postgres 17 on :5432 (db: wieczorny_szept, user/pass: postgres)
```

There is **no test runner configured** — do not invent `pnpm test`. Verify changes by running the app and exercising the flow.

## Architecture

### Runtime split

- **Edge**: `src/middleware.ts` handles dashboard-route gating (presence of `sessionId` cookie) and first-visit `locale` cookie negotiation (host → domain default; otherwise `Accept-Language` → fallback `pl`). Domain → locale map lives in `src/app/_consts/index.ts` and `src/_consts` constants (`PL_DOMAIN`, `GB_DOMAIN`, `DEFAULT_COUNTRY_DOMAIN`).
- **Node/serverful**: route handlers under `src/app/api/*` and server actions under `src/app/_actions/*`. Database access is server-only — `src/lib/prisma.ts` imports `"server-only"` and selects Prisma adapter based on env: `VERCEL_ENV=production` uses `@prisma/adapter-neon` over WebSockets/fetch; otherwise plain `PrismaClient`.

### Session model (read `SESSION_ID.md` for the full diagram)

Two-stage session:
1. **Temporary session** — UUID stored in `SessionIdCache` table alongside an OTP `confirmationCode`. Created on `GET /api/confirm/otp`, deleted on successful verification.
2. **Authenticated session** — a *second* UUID set as `HttpOnly` cookie `sessionId` (14 days) **and** persisted on `User.sessionId` (`@unique`) **and** mirrored in the `KeyValue` table (key = phone/email → value = sessionId) as a third validation source.

`POST /api/users` cross-checks the cookie sessionId against the `KeyValue` mirror before creating/updating the user. Logout nulls `User.sessionId` and clears the cookie. When changing auth, all three places must stay consistent.

### Subscriptions & Stripe

- Three `SubscriptionType`s: `TRIAL`, `ONE_TIME`, `MONTHLY`. Trial is the only one without a `subscriptionId`.
- Per-country Stripe products are hardcoded in `src/lib/consts.ts` (`productConfigs[env][country]`). Country resolution drives which `priceId` is sent to Checkout. Reverse-lookup from price id → `SubscriptionType` is `getSubscriptionTypeByPriceId()`.
- Webhook handlers:
  - `POST /api/payments/webhook` — `checkout.session.completed` creates the Subscription row, flips `User.premium`, sends welcome email; `customer.subscription.updated` patches status/`dateCancelled`; `refund.created` patches `dateRefunded`/status.
  - `WebhookEventLog` table is the idempotency ledger (unique `eventId`). Stripe retries for ~3 days — handlers must return 200 only after persistence succeeds. See `STRIPE.md` for the drift cases.

### Cron

`vercel.json` registers `/api/cron/distribute` at `30 * * * *` (hourly at :30). Cron routes live under `src/app/api/cron/` and gate on `Authorization: Bearer ${CRON_SECRET}`. Distribution picks users whose `timezone` + `deliveryHour` matches and sends via Twilio/SMSAPI (see `src/services/TwilioService.ts`, `src/lib/smsapi.ts`). `Delivery` rows record each send.

### i18n

`next-intl` with messages under `messages/{en,pl}.json`. Server config (`src/i18n/request.ts`) reads the `locale` cookie set by middleware. `messages/raw.txt` is the source for whisper content — `scripts/transformShepts.ts` parses it into `.shepts/` artifacts (gitignored) that `uploadMessageTranslations.ts` pushes into `Message` + `MessageTranslation`. New translations should go through this pipeline rather than direct DB inserts.

### App Router conventions

`src/app/` follows Next App Router. Folders prefixed with `_` (`_actions`, `_components`, `_consts`, `_contexts`, `_hooks`, `_types`) are colocated private modules — not routable. `(legal)` is a route group. Server actions live in `_actions/`; reading the session cookie from a server action is done via `userFromCookie.ts` / `userEmailFromCookie.ts`.

### Tracking

Both Meta Pixel (client) and Meta CAPI (server) are wired in parallel. Event id is generated once per logical event and shared between client + server calls for dedup — see `src/lib/eventId.ts`, `fbq.ts`, `fbCapi.ts`. Important events are documented in `FB_EVENTS_AUDIT.md` and `NEW-SIGNUP.md` (some events listed there reflect a *proposed* signup redesign, not current code — verify against `src/app/_components/` before assuming).

## Environment & deployment notes

- Local DB: `docker-compose up -d` then point `DATABASE_URL` at `postgresql://postgres:postgres@localhost:5432/wieczorny_szept`.
- Production DB: Neon (Postgres) via `@prisma/adapter-neon` — the adapter only kicks in when `VERCEL_ENV=production`.
- Required env in any environment: `DATABASE_URL`, `CRON_SECRET`, Stripe keys, Twilio / SMSAPI keys, Resend (email), Meta pixel/CAPI tokens.
- Deploy target is Vercel. The `build` script runs `prisma migrate deploy` — migrations apply on every deploy, so verify migration safety before pushing.

## Conventions worth knowing

- Prisma models use camelCase fields with `@map` to snake_case columns; preserve that style on any schema edit.
- Files importing `"server-only"` (e.g. `src/lib/prisma.ts`) must never be pulled into client bundles — keep DB access behind route handlers, server actions, or `src/services/*`.
- The codebase ships per-domain pricing/locale/contact-email constants — adding a new country means touching `_consts/index.ts`, `productConfigs` in `lib/consts.ts`, middleware's `inferDefaultFromHost`, and `messages/*.json`.
- Pricing/region strategy and phone-number country-code restrictions are described in `README.md` (PRICING STRATEGY section) — only `+48` and `+44` are supported until `.com` rollout.
