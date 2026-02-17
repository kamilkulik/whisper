"use client";

import { useEffect } from "react";
import { trackEvent, Event } from "@/lib/fbq";
import { generateEventId } from "@/lib/eventId";

interface SuccessPageTrackProps {
  value: number;
  currency: string;
}

export function SuccessPageTrack({ value, currency }: SuccessPageTrackProps) {
  useEffect(() => {
    trackEvent(Event.Purchase, { value, currency }, { eventID: generateEventId("Purchase") });
  }, [value, currency]);
  return null;
}
