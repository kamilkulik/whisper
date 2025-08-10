'use client';

interface HowItWorksProps {
  onGetStarted: () => void;
}

export default function HowItWorks({ onGetStarted }: HowItWorksProps) {
  return (
    <div className="relative py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Headline */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Proste jak dwa westchnienia.
          </h2>
        </div>

        {/* Steps Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Step 1 */}
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">1</span>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Zapisz się w 30 sekund
            </h3>
            <p className="text-blue-200 text-sm">
              Podaj numer telefonu i gotowe.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">2</span>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Codziennie wieczorem o 21:00
            </h3>
            <p className="text-blue-200 text-sm">
              Dostajesz wiadomość tylko dla Ciebie.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">3</span>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Ciesz się chwilą
            </h3>
            <p className="text-blue-200 text-sm">
              Czytaj, uśmiechnij się, zachowaj dla siebie lub wyślij dalej.
            </p>
          </div>
        </div>

        {/* Mini CTA */}
        <div className="text-center mb-8">
          <p className="text-lg text-white mb-6">
            Tak proste, że pierwszą wiadomość możesz mieć już dziś
          </p>
          <button 
            onClick={onGetStarted}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
          >
            Wyślij mi pierwszy szept &gt;
          </button>
        </div>

        {/* Reassurance Box */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-center mb-4">
              <p className="text-white font-medium">
                Darmowy dostęp przez 7 dni. Możesz anulować w każdej chwili.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-green-400 text-sm font-medium">
                Twój numer telefonu jest bezpieczny
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
