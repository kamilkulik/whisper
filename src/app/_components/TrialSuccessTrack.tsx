"use client";

import { useEffect } from "react";
import { trackEvent, Event } from "@/lib/fbq";

export function TrialSuccessTrack() {
  useEffect(() => {
    trackEvent(Event.StartTrial, {
      value: 0,
      currency: "USD",
      prediction_ltv: 9,
    });
  }, []);
  return null;
}
