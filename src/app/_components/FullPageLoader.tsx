"use client";

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-blue-900 via-indigo-900 to-[#2A031E] flex items-center justify-center">
      {/* Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/40 rounded-full blur-2xl heartbeat"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-3xl"></div>
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center">
        {/* Progress Bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full loading-progress-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
