export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID!;

export const fbq = (...args: Parameters<typeof window.fbq>) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
};

export const Event = {
  Contact: "Contact",
  InitiateCheckout: "InitiateCheckout",
  Lead: "Lead",
  Purchase: "Purchase",
  StartTrial: "StartTrial",
} as const;

export const pageview = () =>
  (fbq as (...args: unknown[]) => void)("track", "PageView");

export const trackEvent = (
  event: keyof typeof Event,
  data?: facebook.Pixel.DPA.ViewContentParameters,
  options?: facebook.Pixel.EventIDOptions,
) => fbq("track", event, data!, options);

export const trackCustom = (
  event: keyof typeof Event,
  data?: facebook.Pixel.DPA.ViewContentParameters,
  options?: facebook.Pixel.EventIDOptions,
) => fbq("trackCustom", event, data!, options);
