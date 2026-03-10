"use client";

import { useEffect, useRef, useState } from "react";

interface SeeHowItFeelsProps {
    onPress: () => void;
}

/**
 * SeeHowItFeels — a large pulsating button with heartbeat animation.
 * The text "see how it feels" fades out when pressed, then parent transitions to PhoneNumberForm.
 */
export default function SeeHowItFeels({ onPress }: SeeHowItFeelsProps) {
    const [pressed, setPressed] = useState(false);

    const handleClick = () => {
        setPressed(true);
        // Small delay for fade-out animation before triggering parent transition
        setTimeout(() => {
            onPress();
        }, 400);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] relative">
            <button
                id="see-how-it-feels-button"
                onClick={handleClick}
                className={`
          relative w-64 h-64 md:w-80 md:h-80 rounded-full
          bg-gradient-to-r from-yellow-400 to-orange-400
          shadow-[0_0_60px_rgba(251,191,36,0.4)]
          transition-all duration-500 cursor-pointer
          ${pressed ? "scale-95 opacity-0" : "heartbeat hover:shadow-[0_0_80px_rgba(251,191,36,0.6)]"}
        `}
                disabled={pressed}
            >
                <span
                    className={`
            text-gray-900 text-2xl md:text-3xl font-bold whitespace-nowrap
            transition-opacity duration-300
            ${pressed ? "opacity-0" : "opacity-100"}
          `}
                >
                    see how it feels
                </span>
            </button>
        </div>
    );
}
