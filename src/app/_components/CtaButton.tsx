"use client";

export const CtaButton = (ctaCallback: () => void) => {
  return (
    <button
      onClick={ctaCallback}
      className="hidden sm:inline-block bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-medium px-6 py-2 rounded-lg transition-colors cursor-pointer"
    >
      Zacznij teraz
    </button>
  );
};
