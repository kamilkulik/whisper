export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID!

export const fbq = (...args: Parameters<typeof window.fbq>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args)
  }
}

export const Event = {
  Contact: 'Contact',
  InitiateCheckout: 'InitiateCheckout',
  Lead: 'Lead',
  Purchase: 'Purchase',
  StartTrial: 'StartTrial'
} as const

/** Optional payload for Meta standard events (value in major currency units, e.g. 9.00 for £9) */
export type EventParams = {
  value?: number
  currency?: string
  content_name?: string
  prediction_ltv?: number
  [key: string]: unknown
}

type FbqTrack = (cmd: string, name: string, params?: Record<string, unknown>) => void
export const pageview = () => (fbq as (...args: unknown[]) => void)('track', 'PageView')
export const trackEvent = (event: keyof typeof Event, data?: EventParams) =>
  (fbq as unknown as FbqTrack)('track', event, data ?? {})
export const trackCustom = (event: keyof typeof Event, data?: EventParams) =>
  (fbq as unknown as FbqTrack)('trackCustom', event, data ?? {})