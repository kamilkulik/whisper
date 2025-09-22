"use client";

import ErrorPageLayout from "./_components/ErrorPageLayout";
import Link from "next/link";

export default function Error() {
  return (
    <ErrorPageLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
          <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Wystąpił błąd
          </span>
        </h1>

        <p className="text-xl text-blue-200 leading-relaxed mb-8">
          Przepraszamy, wystąpił nieoczekiwany błąd. Nasz zespół został
          powiadomiony o problemie.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Powrót do strony głównej
          </Link>
        </div>
      </div>
    </ErrorPageLayout>
  );
}
