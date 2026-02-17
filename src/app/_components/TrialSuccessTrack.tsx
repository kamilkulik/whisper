"use client";

import { useEffect } from "react";
import { trackEvent, Event } from "@/lib/fbq";
import { generateEventId } from "@/lib/eventId";

export function TrialSuccessTrack() {
  useEffect(() => {
    trackEvent<typeof Event.StartTrial>(Event.StartTrial, {
      value: 0,
      currency: "USD",
      predicted_ltv: 9,
    }, { eventID: generateEventId("StartTrial") });
  }, []);
  return null;
}
