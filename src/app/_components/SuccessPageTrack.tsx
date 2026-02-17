"use client";

import { useEffect } from "react";
import { trackEvent, Event } from "@/lib/fbq";

interface SuccessPageTrackProps {
  value: number;
  currency: string;
}

export function SuccessPageTrack({ value, currency }: SuccessPageTrackProps) {
  useEffect(() => {
    trackEvent(Event.Purchase, { value, currency });
  }, [value, currency]);
  return null;
}
