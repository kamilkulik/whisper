"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
    supportedPhoneCountryCodes,
    getDefaultPhoneCountryCode,
} from "../_consts";
import { normalizeE164, toE164Format } from "@/lib/consts";

interface PhoneNumberFormProps {
    onSubmit: (phoneNumber: string) => void;
    isSending: boolean;
}

/**
 * PhoneNumberForm — collects user's phone number with a "Hold to Confirm" button.
 * Title: "your whisper is ready for you. Your phone number is how it finds you now"
 *
 * The hold-to-confirm pattern:
 * - Must handle touchstart/touchend AND mousedown/mouseup
 * - Cancel on touchmove / touchcancel
 * - preventDefault() on touch events to avoid Safari long-press context menu
 * - contextmenu event returning false for Safari
 */
export default function PhoneNumberForm({
    onSubmit,
    isSending,
}: PhoneNumberFormProps) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState(
        getDefaultPhoneCountryCode()
    );
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const holdStartRef = useRef<number>(0);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const HOLD_DURATION_MS = 2000;
    const PROGRESS_INTERVAL = 50; // update every 50ms

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsCountryDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Prevent context menu on the hold button (Safari)
    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const preventContextMenu = (e: Event) => {
            e.preventDefault();
            return false;
        };
        button.addEventListener("contextmenu", preventContextMenu);
        return () =>
            button.removeEventListener("contextmenu", preventContextMenu);
    }, []);

    const clearTimers = useCallback(() => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    }, []);

    const handleHoldStart = useCallback(() => {
        if (isSending || !phoneNumber.trim()) return;

        const fullNumber = toE164Format(countryCode, phoneNumber);
        const normalized = normalizeE164(fullNumber);

        // Basic validation
        if (normalized.length < 8) {
            setError("Please enter a valid phone number");
            return;
        }

        setError(null);
        setIsHolding(true);
        setHoldProgress(0);
        holdStartRef.current = Date.now();

        // Progress animation
        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - holdStartRef.current;
            const progress = Math.min(elapsed / HOLD_DURATION_MS, 1);
            setHoldProgress(progress);
        }, PROGRESS_INTERVAL);

        // Fire after 2 seconds
        holdTimerRef.current = setTimeout(() => {
            clearTimers();
            setIsHolding(false);
            setHoldProgress(1);

            const fullNumber = toE164Format(countryCode, phoneNumber);
            const normalized = normalizeE164(fullNumber);
            onSubmit(normalized);
        }, HOLD_DURATION_MS);
    }, [phoneNumber, countryCode, isSending, onSubmit, clearTimers]);

    const handleHoldEnd = useCallback(() => {
        if (!isHolding) return;
        clearTimers();
        setIsHolding(false);
        setHoldProgress(0);
    }, [isHolding, clearTimers]);

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            e.preventDefault(); // Prevent Safari long-press context menu
            handleHoldStart();
        },
        [handleHoldStart]
    );

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            e.preventDefault();
            handleHoldEnd();
        },
        [handleHoldEnd]
    );

    const handleTouchMove = useCallback(() => {
        // Cancel on drag
        handleHoldEnd();
    }, [handleHoldEnd]);

    const handleTouchCancel = useCallback(() => {
        handleHoldEnd();
    }, [handleHoldEnd]);

    const isButtonDisabled = isSending || !phoneNumber.trim();

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
            {/* Title */}
            <h2 className="text-4xl md:text-4xl font-bold text-white text-center mb-2 leading-tight">
                Your whisper is ready for you...
            </h2>
            <p className="text-blue-200 text-center mb-8 text-2xl">
                ...Your phone number is how it finds you now
            </p>

            {/* Phone Input */}
            <div className="w-full mb-6">
                <div className="flex items-stretch">
                    {/* Country Code Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                            className="h-full px-3 py-3 bg-gray-700/50 border border-r-0 border-gray-600/50 rounded-l-lg text-white hover:bg-gray-600/50 transition-colors text-3xl"
                        >
                            {countryCode}
                        </button>
                        {isCountryDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-gray-800 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto min-w-[270px]">
                                {supportedPhoneCountryCodes.map((entry) => (
                                    <button
                                        key={entry.phoneCountryCode}
                                        onClick={() => {
                                            setCountryCode(entry.phoneCountryCode);
                                            setIsCountryDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors text-2xl"
                                    >
                                        {entry.country} ({entry.phoneCountryCode})
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Phone Number Input */}
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            setError(null);
                        }}
                        className="flex-1 text-3xl max-w-[230px] px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="Phone number"
                        autoComplete="tel-national"
                    />
                </div>
                {error && (
                    <p className="text-red-400 text-lg mt-2">{error}</p>
                )}
            </div>

            {/* Hold to Confirm Button */}
            {isSending ? (
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 shadow-[0_0_60px_rgba(251,191,36,0.4)] flex items-center justify-center heartbeat">
                    <span className="text-gray-900 text-xl md:text-2xl font-bold text-center whitespace-nowrap">
                        sending your whisper...
                    </span>
                </div>
            ) : (
                <div className="relative mt-4">
                    <button
                        ref={buttonRef}
                        onMouseDown={handleHoldStart}
                        onMouseUp={handleHoldEnd}
                        onMouseLeave={handleHoldEnd}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onTouchMove={handleTouchMove}
                        onTouchCancel={handleTouchCancel}
                        disabled={isButtonDisabled}
                        className={`
              relative w-64 h-64 md:w-80 md:h-80 rounded-full
              bg-gradient-to-r from-yellow-400 to-orange-400
              shadow-[0_0_40px_rgba(251,191,36,0.3)]
              transition-all duration-200 select-none
              ${isButtonDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:shadow-[0_0_60px_rgba(251,191,36,0.5)]"}
              ${isHolding ? "scale-95" : ""}
            `}
                        style={{ touchAction: "none" }}
                    >
                        {/* Progress circle overlay */}
                        {isHolding && (
                            <svg
                                className="absolute inset-0 w-full h-full -rotate-90"
                                viewBox="0 0 100 100"
                            >
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="48"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.3)"
                                    strokeWidth="3"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="48"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="3"
                                    strokeDasharray={`${holdProgress * 301.6} 301.6`}
                                    strokeLinecap="round"
                                    className="transition-all duration-75"
                                />
                            </svg>
                        )}

                        <span className="text-gray-900 text-2xl md:text-3xl font-bold text-center whitespace-nowrap relative z-10">
                            {isHolding ? "Keep holding..." : "Hold to confirm"}
                        </span>
                    </button>
                    <p className="text-gray-400 text-xl text-center mt-3">
                        Hold the button for 2 seconds
                    </p>
                </div>
            )}
        </div>
    );
}
