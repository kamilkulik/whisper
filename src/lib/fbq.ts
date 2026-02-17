export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID!;

export const fbq = (...args: Parameters<typeof window.fbq>) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
};

// --- Event names (Meta standard events) ---
export const Event = {
  AddPaymentInfo: "AddPaymentInfo",
  AddToCart: "AddToCart",
  AddToWishlist: "AddToWishlist",
  CompleteRegistration: "CompleteRegistration",
  Contact: "Contact",
  CustomizeProduct: "CustomizeProduct",
  Donate: "Donate",
  FindLocation: "FindLocation",
  InitiateCheckout: "InitiateCheckout",
  Lead: "Lead",
  Purchase: "Purchase",
  Schedule: "Schedule",
  Search: "Search",
  StartTrial: "StartTrial",
  SubmitApplication: "SubmitApplication",
  Subscribe: "Subscribe",
  ViewContent: "ViewContent",
} as const;

export type EventName = keyof typeof Event;

// --- Shared parameter shapes (Meta spec) ---
export interface ContentItem {
  id?: string;
  quantity?: number;
  item_price?: number;
  [key: string]: unknown;
}

export interface FbqEventParamsBase {
  content_ids?: string[];
  content_type?: string;
  contents?: ContentItem[];
  currency?: string;
  value?: number;
  num_items?: number;
  search_string?: string;
  predicted_ltv?: number;
  [key: string]: unknown;
}

// Event-specific parameter types per Meta spec (required vs optional)
export interface AddPaymentInfoParams extends FbqEventParamsBase {
  content_ids?: string[];
  contents?: ContentItem[];
  currency?: string;
  value?: number;
}

export interface AddToCartParams extends FbqEventParamsBase {
  content_ids?: string[];
  content_type?: string;
  contents?: ContentItem[];
  currency?: string;
  value?: number;
}

export interface AddToWishlistParams extends FbqEventParamsBase {
  content_ids?: string[];
  contents?: ContentItem[];
  currency?: string;
  value?: number;
}

export interface CompleteRegistrationParams extends FbqEventParamsBase {
  currency?: string;
  value?: number;
}

export interface ContactParams extends FbqEventParamsBase {}

export interface CustomizeProductParams extends FbqEventParamsBase {}

export interface DonateParams extends FbqEventParamsBase {}

export interface FindLocationParams extends FbqEventParamsBase {}

export interface InitiateCheckoutParams extends FbqEventParamsBase {
  content_ids?: string[];
  contents?: ContentItem[];
  currency?: string;
  num_items?: number;
  value?: number;
}

export interface LeadParams extends FbqEventParamsBase {
  currency?: string;
  value?: number;
}

export interface PurchaseParams extends FbqEventParamsBase {
  content_ids?: string[];
  content_type?: string;
  contents?: ContentItem[];
  currency: string;
  num_items?: number;
  value: number;
}

export interface ScheduleParams extends FbqEventParamsBase {}

export interface SearchParams extends FbqEventParamsBase {
  content_ids?: string[];
  content_type?: string;
  contents?: ContentItem[];
  currency?: string;
  search_string?: string;
  value?: number;
}

export interface StartTrialParams extends FbqEventParamsBase {
  currency?: string;
  predicted_ltv?: number;
  value?: number;
}

export interface SubmitApplicationParams extends FbqEventParamsBase {}

export interface SubscribeParams extends FbqEventParamsBase {
  currency?: string;
  predicted_ltv?: number;
  value?: number;
}

export interface ViewContentParams extends FbqEventParamsBase {
  content_ids?: string[];
  content_type?: string;
  contents?: ContentItem[];
  currency?: string;
  value?: number;
}

// Conditional type: data (3rd argument) depends on event name
export type EventParams<E extends EventName> = E extends "Purchase"
  ? PurchaseParams
  : E extends "AddPaymentInfo"
    ? AddPaymentInfoParams
    : E extends "AddToCart"
      ? AddToCartParams
      : E extends "AddToWishlist"
        ? AddToWishlistParams
        : E extends "CompleteRegistration"
          ? CompleteRegistrationParams
          : E extends "Contact"
            ? ContactParams
            : E extends "CustomizeProduct"
              ? CustomizeProductParams
              : E extends "Donate"
                ? DonateParams
                : E extends "FindLocation"
                  ? FindLocationParams
                  : E extends "InitiateCheckout"
                    ? InitiateCheckoutParams
                    : E extends "Lead"
                      ? LeadParams
                      : E extends "Schedule"
                        ? ScheduleParams
                        : E extends "Search"
                          ? SearchParams
                          : E extends "StartTrial"
                            ? StartTrialParams
                            : E extends "SubmitApplication"
                              ? SubmitApplicationParams
                              : E extends "Subscribe"
                                ? SubscribeParams
                                : E extends "ViewContent"
                                  ? ViewContentParams
                                  : FbqEventParamsBase;

// EventIDOptions: optional 4th argument for deduplication
export interface FbqEventIDOptions {
  eventID?: string;
}

export const pageview = () =>
  (fbq as (...args: unknown[]) => void)("track", "PageView");

export function trackEvent<E extends EventName>(
  event: E,
  data?: EventParams<E>,
  options?: FbqEventIDOptions,
): void {
  const payload = data ?? ({} as EventParams<E>);
  (
    fbq as (
      cmd: string,
      name: string,
      params?: EventParams<E>,
      opts?: FbqEventIDOptions,
    ) => void
  )("track", event, payload, options);
}

export function trackCustom<E extends EventName>(
  event: E,
  data?: EventParams<E>,
  options?: FbqEventIDOptions,
): void {
  const payload = data ?? ({} as EventParams<E>);
  (
    fbq as (
      cmd: string,
      name: string,
      params?: EventParams<E>,
      opts?: FbqEventIDOptions,
    ) => void
  )("trackCustom", event, payload, options);
}
