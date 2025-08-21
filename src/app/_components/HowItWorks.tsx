"use client";

interface HowItWorksProps {
  onGetStarted: () => void;
}

export default function HowItWorks({ onGetStarted }: HowItWorksProps) {
  return (
    <div className="relative py-20" data-oid="-i:6r4a">
      <div className="max-w-7xl mx-auto px-6" data-oid="qpvhgcn">
        {/* Main Headline */}
        <div className="text-center mb-16" data-oid="-zj3z04">
          <h2
            className="text-4xl lg:text-5xl font-bold text-white mb-4"
            data-oid="c3bt..l"
          >
            Proste jak dwa westchnienia
          </h2>
        </div>

        {/* Steps Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12" data-oid="m29183j">
          {/* Step 1 */}
          <div
            className="flex flex-col justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:bg-white/15 border border-white/20"
            data-oid="cx_uel0"
          >
            {/* Photo */}
            <div
              className="w-full h-48 rounded-xl mb-6 overflow-hidden border border-white/20"
              data-oid="2k9yuv8"
            >
              <img
                src="/process_1.png"
                alt="Ciesz się chwilą"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <h3
              className="text-3xl lg:text-2xl font-bold text-white mb-4 text-center"
              data-oid="f751mx4"
            >
              Zapisz się w 30 sekund
            </h3>
            <p
              className="text-blue-200 ms:max-md:text-2xl md:max-lg:text-xl lg:text-xl text-center leading-relaxed"
              data-oid="x8z2y01"
            >
              Podaj numer telefonu i gotowe. Prosty formularz, który wypełnisz w
              mniej niż minutę.
            </p>
          </div>

          {/* Step 2 */}
          <div
            className="flex flex-col justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:bg-white/15 border border-white/20"
            data-oid="q5qffge"
          >
            {/* Photo */}
            <div
              className="w-full h-48 rounded-xl mb-6 overflow-hidden border border-white/20"
              data-oid="2k9yuv8"
            >
              <img
                src="/process_2.png"
                alt="Ciesz się chwilą"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <h3
              className="text-3xl lg:text-2xl font-bold text-white mb-4 text-center"
              data-oid="04_897m"
            >
              Codziennie wieczorem o 20:59
            </h3>
            <p
              className="text-blue-200 ms:max-md:text-2xl md:max-lg:text-xl lg:text-xl text-center leading-relaxed"
              data-oid="w6hltyq"
            >
              Dostajesz wiadomość tylko dla Ciebie. Każdego dnia, punktualnie o
              tej samej porze.
            </p>
          </div>

          {/* Step 3 */}
          <div
            className="flex flex-col justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:bg-white/15 border border-white/20"
            data-oid="ctl:6vg"
          >
            {/* Photo */}
            <div
              className="w-full h-48 rounded-xl mb-6 overflow-hidden border border-white/20"
              data-oid="2k9yuv8"
            >
              <img
                src="/process_3.jpg"
                alt="Ciesz się chwilą"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <h3
              className="text-3xl lg:text-2xl font-bold text-white mb-4 text-center"
              data-oid="_od5h0g"
            >
              Ciesz się chwilą
            </h3>
            <p
              className="text-blue-200 ms:max-md:text-2xl md:max-lg:text-xl lg:text-xl text-center leading-relaxed"
              data-oid="njb5q2h"
            >
              Czytaj, uśmiechnij się, zachowaj dla siebie lub wyślij dalej. To
              Twoja chwila spokoju.
            </p>
          </div>
        </div>

        {/* Mini CTA */}
        <div className="text-center mb-8" data-oid="my9c93g">
          <p className="text-xl text-white mb-6" data-oid="k8wphqe">
            Tak proste, że pierwszą wiadomość możesz mieć już dziś
          </p>
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-semibold px-8 py-4 rounded-lg text-2xl lg:text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
            data-oid="-w0zi67"
          >
            Wyślij mi pierwszy szept
          </button>
        </div>

        {/* Reassurance Box */}
        <div className="max-w-2xl mx-auto" data-oid="ted41ad">
          <div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            data-oid="6hdlz9."
          >
            <div className="text-center mb-4" data-oid="aqr874e">
              <p className="text-white font-medium" data-oid="knbzos_">
                Darmowy dostęp przez 7 dni. Możesz anulować w każdej chwili.
              </p>
            </div>
            <div
              className="flex items-center justify-center space-x-2"
              data-oid="np9b2_."
            >
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-oid="udzej5o"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  data-oid="cz1-zvc"
                />
              </svg>
              <span
                className="text-green-400 text-lg font-medium"
                data-oid="lvp06st"
              >
                Twój numer telefonu jest bezpieczny
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
