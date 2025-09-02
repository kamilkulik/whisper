"use client";

import { useSearchParams } from "next/navigation";
import NavigationBar from "../_components/NavigationBar";

export default function EmailConfirmation() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const customerEmail = searchParams.get("email") || "test@test.pl";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-[#2A031E]">
      {/* Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/40 rounded-full blur-2xl heartbeat"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-3xl"></div>
      </div>

      <NavigationBar />

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 py-12 pt-32 text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-8">
            {status === "success" && (
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
            {status === "already-verified" && (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            )}
            {status === "error" && (
              <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
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
            )}
          </div>

          {/* Status Message */}
          <div className="space-y-6">
            {status === "success" && (
              <>
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Email{" "}
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    potwierdzony!
                  </span>
                </h1>

                <p className="text-xl text-blue-200 leading-relaxed">
                  Twój adres email został pomyślnie potwierdzony. Możesz teraz
                  korzystać z pełnej funkcjonalności serwisu Wieczorny Szept.
                </p>
              </>
            )}

            {status === "already-verified" && (
              <>
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Email{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    już potwierdzony
                  </span>
                </h1>

                <p className="text-xl text-blue-200 leading-relaxed">
                  Twój adres email był już wcześniej potwierdzony. Nie musisz
                  nic więcej robić.
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                    Błąd potwierdzenia
                  </span>
                </h1>

                <p className="text-xl text-blue-200 leading-relaxed">
                  Wystąpił problem z potwierdzeniem Twojego adresu email. Link
                  może być nieprawidłowy lub wygasł.
                </p>
              </>
            )}

            {!status && (
              <>
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  <span className="bg-gradient-to-r from-gray-400 to-slate-400 bg-clip-text text-transparent">
                    Nieznany status
                  </span>
                </h1>

                <p className="text-xl text-blue-200 leading-relaxed">
                  Nie udało się określić statusu potwierdzenia emaila.
                </p>
              </>
            )}

            {status === "success" && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-white text-lg">
                  Twój adres email{" "}
                  <span className="font-semibold text-blue-200">
                    {customerEmail}
                  </span>{" "}
                  został pomyślnie potwierdzony.
                </p>
              </div>
            )}

            {status === "already-verified" && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-white text-lg">
                  Adres email{" "}
                  <span className="font-semibold text-blue-200">
                    {customerEmail}
                  </span>{" "}
                  był już wcześniej potwierdzony.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-white text-lg">
                  Jeśli potrzebujesz nowego linku potwierdzającego, skontaktuj
                  się z nami.
                </p>
              </div>
            )}

            <p className="text-white/80 text-sm">
              Jeśli masz pytania lub problemy z potwierdzeniem, skontaktuj się z
              nami:{" "}
              <a
                href="mailto:kontakt@wieczornyszept.pl"
                className="text-blue-300 hover:text-blue-200 underline transition-colors"
              >
                kontakt@wieczornyszept.pl
              </a>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 space-y-4">
            <a
              href="/"
              className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Powrót do strony głównej
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
