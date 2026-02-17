export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID!

export const fbq = (...args: Parameters<typeof window.fbq>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args)
  }
}

export const pageview = () => (fbq as (...args: unknown[]) => void)('track', 'PageView')
export const trackEvent = (event: string, data?:  facebook.Pixel.DPA.ViewContentParameters) => fbq('track', event, data!)
export const trackCustom = (event: string, data?: facebook.Pixel.DPA.ViewContentParameters) => fbq('trackCustom', event, data!)