import ConfirmationCodeForm from "../components/ConfirmationCodeForm";

export default function PhonePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-[#2A031E]">
      {/* Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/40 rounded-full blur-2xl heartbeat"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-[200] bg-black/20 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <div className="text-white font-bold text-xl">
              ▲ WIECZORNY SZEPT
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="/"
              className="text-white hover:text-blue-200 transition-colors"
            >
              Powrót do strony głównej
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-12 pt-32">
          <ConfirmationCodeForm />
        </div>
      </div>
    </div>
  );
}
