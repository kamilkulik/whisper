"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionType } from "@prisma/client";
import { getMetaCookies } from "@/lib/metaCookies";
import { generateEventId } from "@/lib/eventId";
import { Event } from "@/lib/fbq";

interface InitiateCheckoutProps {
    phoneNumber: string;
    onFeedbackSubmitted: () => void;
}

const feedbackOptions = [
    "Too expensive",
    "Didn't like the poem",
    "Just browsing",
    "Not the right time",
    "Other",
];

/**
 * InitiateCheckout — Shows the "keep this feeling?" question with YES/NO flow.
 * YES → navigates to Stripe checkout via the existing flow
 * NO → shows a single feedback question
 */
export default function InitiateCheckout({
    phoneNumber,
    onFeedbackSubmitted,
}: InitiateCheckoutProps) {
    const [showFeedback, setShowFeedback] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
    const [customFeedback, setCustomFeedback] = useState("");
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
    const router = useRouter();

    const handleYes = async () => {
        setIsLoadingCheckout(true);
        try {
            // Navigate to modal to complete profile before checkout
            // The existing flow uses PUT /api/users then checkout-sessions
            router.push("/?modal=contact&newSignUp=true", { scroll: false });
        } catch (error) {
            console.error("[ InitiateCheckout ] Error:", error);
            setIsLoadingCheckout(false);
        }
    };

    const handleNo = () => {
        setShowFeedback(true);
    };

    const handleFeedbackSubmit = async () => {
        const feedback =
            selectedFeedback === "Other" ? customFeedback : selectedFeedback;
        if (!feedback || feedback.trim().length === 0) return;

        setIsLoadingFeedback(true);
        try {
            const response = await fetch("/api/whisper/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedback }),
            });

            if (response.ok) {
                setFeedbackSent(true);
                setTimeout(() => {
                    onFeedbackSubmitted();
                }, 2000);
            }
        } catch (error) {
            console.error("[ InitiateCheckout ] Feedback error:", error);
        } finally {
            setIsLoadingFeedback(false);
        }
    };

    // Feedback submitted state
    if (feedbackSent) {
        return (
            <div className="flex flex-col items-center justify-center text-center px-4">
                <p className="text-white text-xl font-semibold mb-2">
                    Thank you for your feedback 💙
                </p>
                <p className="text-blue-200 text-sm">Your whisper will still be waiting for you.</p>
            </div>
        );
    }

    // Feedback form
    if (showFeedback) {
        return (
            <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
                <h3 className="text-3xl md:text-3xl font-bold text-white text-center mb-6">
                    What made you quit?
                </h3>

                <div className="w-full space-y-3 mb-6">
                    {feedbackOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => setSelectedFeedback(option)}
                            className={`
                w-full px-4 py-3 rounded-lg text-left transition-all duration-200
                ${selectedFeedback === option
                                    ? "bg-purple-600/60 border border-purple-400 text-white"
                                    : "bg-gray-700/50 border border-gray-600/50 text-gray-200 hover:bg-gray-600/50"
                                }
              `}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                {selectedFeedback === "Other" && (
                    <textarea
                        value={customFeedback}
                        onChange={(e) => setCustomFeedback(e.target.value)}
                        className="w-full px-4 py-3 mb-4 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                        placeholder="Tell us more..."
                        rows={3}
                    />
                )}

                <button
                    onClick={handleFeedbackSubmit}
                    disabled={
                        isLoadingFeedback ||
                        !selectedFeedback ||
                        (selectedFeedback === "Other" && !customFeedback.trim())
                    }
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isLoadingFeedback ? "Sending..." : "Send feedback"}
                </button>
            </div>
        );
    }

    // Main question
    return (
        <div className="flex flex-col items-center justify-center text-center px-4">
            <p className="text-4xl md:text-3xl font-bold text-white mb-2 leading-tight">
                Your whisper was just delivered
            </p>
            <p className="text-2xl md:text-2xl text-blue-200 mb-8">
                While you read it, would you like to keep this feeling every evening for the next 7
                days for <span className="text-yellow-400 font-bold">$0</span>?
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <button
                    onClick={handleYes}
                    disabled={isLoadingCheckout}
                    className="flex-1 py-4 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold text-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-60 cursor-pointer"
                >
                    {isLoadingCheckout ? "Loading..." : "Yes, I want this ✨"}
                </button>
                <button
                    onClick={handleNo}
                    className="flex-1 py-4 rounded-lg bg-gray-700/50 border border-gray-600/50 text-gray-300 text-xl hover:bg-gray-600/50 transition-all duration-200 cursor-pointer"
                >
                    No, not right now
                </button>
            </div>
        </div>
    );
}
