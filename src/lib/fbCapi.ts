import "server-only";
import { createHash } from "node:crypto";

/** Meta Graph API version for CAPI. Update when upgrading. */
export const FB_API_VERSION = process.env.FB_CAPI_VERSION;

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const FB_CAPI_AUTH_TOKEN = process.env.FB_CAPI_AUTH_TOKEN;

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * Hash email for CAPI user_data (lowercase, trimmed, SHA256).
 * Returns undefined if email is empty.
 */
export function hashEmail(
  email: string | null | undefined,
): string | undefined {
  if (email == null || email.trim() === "") return undefined;
  return sha256(email.trim().toLowerCase());
}

/**
 * Hash phone for CAPI user_data (digits only, SHA256).
 * Returns undefined if phone is empty.
 */
export function hashPhone(
  phone: string | null | undefined,
): string | undefined {
  if (phone == null) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (digits === "") return undefined;
  return sha256(digits);
}

export interface CapiUserData {
  /** Hashed email (SHA256, lowercase). */
  em?: string[];
  /** Hashed phone (SHA256, digits only). Use [null] when no phone. */
  ph?: (string | null)[];
  /** _fbp cookie value (do not hash). */
  fbp?: string;
  /** _fbc cookie value (do not hash). */
  fbc?: string;
}

export interface CapiCustomData {
  currency?: string;
  value?: string | number;
  [key: string]: string | number | undefined;
}

export interface SendCapiEventOptions {
  eventName: string;
  eventTime: number;
  actionSource?: "website";
  userData: CapiUserData;
  clientUserAgent: string;
  eventSourceUrl?: string;
  eventId?: string;
  customData?: CapiCustomData;
  attributionData?: { attribution_share?: string };
}

function buildUserData(userData: CapiUserData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (userData.em?.length) out.em = userData.em;
  if (userData.ph !== undefined) out.ph = userData.ph;
  if (userData.fbp) out.fbp = userData.fbp;
  if (userData.fbc) out.fbc = userData.fbc;
  return out;
}

/**
 * Sends a single event to Facebook Conversions API.
 * Does not throw; logs errors. Safe to call from webhooks and route handlers.
 */
export async function sendCapiEvent(
  options: SendCapiEventOptions,
): Promise<void> {
  if (!PIXEL_ID || !FB_CAPI_AUTH_TOKEN) {
    console.warn(
      "[ fbCapi ] Missing NEXT_PUBLIC_FB_PIXEL_ID or FB_CAPI_AUTH_TOKEN, skipping CAPI send",
    );
    return;
  }

  const {
    eventName,
    eventTime,
    actionSource = "website",
    userData,
    clientUserAgent,
    eventSourceUrl,
    eventId,
    customData,
    attributionData,
  } = options;

  const eventPayload: Record<string, unknown> = {
    event_name: eventName,
    event_time: eventTime,
    action_source: actionSource,
    user_data: {
      ...buildUserData(userData),
      client_user_agent: clientUserAgent,
    },
    original_event_data: {
      event_name: eventName,
      event_time: eventTime,
    },
  };

  if (eventSourceUrl) eventPayload.event_source_url = eventSourceUrl;
  if (eventId) eventPayload.event_id = eventId;
  if (customData && Object.keys(customData).length > 0)
    eventPayload.custom_data = customData;
  if (attributionData && Object.keys(attributionData).length > 0)
    eventPayload.attribution_data = attributionData;

  const url = `https://graph.facebook.com/${FB_API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(FB_CAPI_AUTH_TOKEN)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [eventPayload] }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[ fbCapi ] CAPI request failed:", res.status, text);
      return;
    }
  } catch (err) {
    console.error("[ fbCapi ] CAPI request error:", err);
  }
}

/**
 * Build CAPI user_data from cookies and optional hashed email/phone.
 */
export function buildCapiUserData(params: {
  fbp?: string | null;
  fbc?: string | null;
  email?: string | null;
  phone?: string | null;
}): CapiUserData {
  const { fbp, fbc, email, phone } = params;
  const em = hashEmail(email ?? undefined);
  const ph = hashPhone(phone ?? undefined);

  const userData: CapiUserData = {};
  if (em) userData.em = [em];
  userData.ph = ph ? [ph] : [null];
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  return userData;
}
