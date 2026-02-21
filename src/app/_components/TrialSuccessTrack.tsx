"use client";

import { useEffect } from "react";
import { trackEvent, Event } from "@/lib/fbq";

export function TrialSuccessTrack({ eventId }: { eventId?: string }) {
  useEffect(() => {
    if (!eventId) return;
    trackEvent<typeof Event.StartTrial>(Event.StartTrial, {
      value: 0,
      currency: "USD",
      predicted_ltv: 9,
    }, { eventID: eventId });
  }, [eventId]);
  return null;
}
