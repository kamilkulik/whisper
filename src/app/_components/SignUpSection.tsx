"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import SeeHowItFeels from "./SeeHowItFeels";
import PhoneNumberForm from "./PhoneNumberForm";
import InitiateCheckout from "./InitiateCheckout";

/**
 * SignUpSection Flow States:
 * 1. BUTTON  → Shows the pulsating "see how it feels" button
 * 2. PHONE   → Shows the phone number form with hold-to-confirm
 * 3. SENDING → Sending whisper & polling for delivery confirmation
 * 4. OFFER   → "Keep this feeling for $1?" YES/NO
 * 5. ERROR   → Timeout or failure — retry option
 */
type FlowState = "BUTTON" | "PHONE" | "SENDING" | "OFFER" | "ERROR";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60000;

export default function SignUpSection() {
    const [flowState, setFlowState] = useState<FlowState>("BUTTON");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSending, setIsSending] = useState(false);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const startPolling = useCallback(
        (sessionId: string) => {
            setFlowState("SENDING");

            // Set 60-second timeout
            timeoutRef.current = setTimeout(() => {
                stopPolling();
                setFlowState("ERROR");
            }, POLL_TIMEOUT_MS);

            // Poll every 2 seconds
            pollingRef.current = setInterval(async () => {
                try {
                    const response = await fetch(
                        `/api/whisper/status?sessionId=${encodeURIComponent(sessionId)}`
                    );

                    if (!response.ok) return;

                    const data = await response.json();
                    if (data.delivered) {
                        stopPolling();
                        setFlowState("OFFER");
                    }
                } catch (error) {
                    console.error("[ SignUpSection ] Polling error:", error);
                }
            }, POLL_INTERVAL_MS);
        },
        [stopPolling]
    );

    const handleSeeHowItFeelsPress = useCallback(() => {
        setFlowState("PHONE");
    }, []);

    const handlePhoneSubmit = useCallback(
        async (phone: string) => {
            setPhoneNumber(phone);
            setIsSending(true);

            try {
                const response = await fetch("/api/whisper/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phoneNumber: phone }),
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error("[ SignUpSection ] Send error:", data.error);
                    setIsSending(false);

                    if (response.status === 429) {
                        // Rate limited
                        setFlowState("ERROR");
                        return;
                    }

                    setFlowState("ERROR");
                    return;
                }

                // Start polling for delivery
                // Get sessionId from the cookie (it's set by the API response)
                // We need to read it from cookies after the response
                const sessionId = getCookie("sessionId");
                if (sessionId) {
                    startPolling(sessionId);
                } else {
                    // Fallback: poll using phone number from delivery record
                    console.error(
                        "[ SignUpSection ] No sessionId cookie found after send"
                    );
                    setFlowState("ERROR");
                }
            } catch (error) {
                console.error("[ SignUpSection ] Send error:", error);
                setIsSending(false);
                setFlowState("ERROR");
            }
        },
        [startPolling]
    );

    const handleRetry = useCallback(() => {
        stopPolling();
        setIsSending(false);
        setFlowState("BUTTON");
    }, [stopPolling]);

    const handleFeedbackSubmitted = useCallback(() => {
        // Reset to initial state after feedback
        setFlowState("BUTTON");
        setIsSending(false);
    }, []);

    return (
        <div className="relative py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    {/* BUTTON state — the pulsating button */}
                    {flowState === "BUTTON" && (
                        <div className="animate-fadeIn">
                            <SeeHowItFeels onPress={handleSeeHowItFeelsPress} />
                        </div>
                    )}

                    {/* PHONE state — phone number entry with hold-to-confirm */}
                    {flowState === "PHONE" && (
                        <div className="animate-fadeIn w-full">
                            <PhoneNumberForm
                                onSubmit={handlePhoneSubmit}
                                isSending={isSending}
                            />
                        </div>
                    )}

                    {/* SENDING state — waiting for delivery */}
                    {flowState === "SENDING" && (
                        <div className="animate-fadeIn flex flex-col items-center justify-center text-center">
                            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 shadow-[0_0_60px_rgba(251,191,36,0.4)] flex items-center justify-center heartbeat mb-6">
                                <span className="text-gray-900 text-2xl md:text-2xl font-bold text-center px-4">
                                    sending your whisper...
                                </span>
                            </div>
                            <p className="text-blue-200 text-2xl">
                                Your whisper is on its way. This usually takes just a moment.
                            </p>
                        </div>
                    )}

                    {/* OFFER state — delivered, show the trial offer */}
                    {flowState === "OFFER" && (
                        <div className="animate-fadeIn w-full">
                            <InitiateCheckout
                                phoneNumber={phoneNumber}
                                onFeedbackSubmitted={handleFeedbackSubmitted}
                            />
                        </div>
                    )}

                    {/* ERROR state — timeout or failure */}
                    {flowState === "ERROR" && (
                        <div className="animate-fadeIn flex flex-col items-center justify-center text-center px-4">
                            <p className="text-white text-xl md:text-2xl font-semibold mb-4">
                                We&apos;re having trouble delivering your whisper.
                            </p>
                            <p className="text-blue-200 mb-8">
                                We politely ask you to retry in a moment.
                            </p>
                            <button
                                onClick={handleRetry}
                                className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                            >
                                Try again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Helper to read a cookie value by name from document.cookie
 */
function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(
        new RegExp("(^|;\\s*)" + name + "=([^;]*)")
    );
    return match ? decodeURIComponent(match[2]) : null;
}
