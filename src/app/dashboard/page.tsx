// server component
import { getUserFromSessionId, prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId");

  if (!sessionId) {
    redirect("/?modal=login");
  }

  const userFromSession = await getUserFromSessionId(sessionId.value);

  if (!userFromSession) {
    redirect("/?modal=login");
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl p-8 backdrop-blur-sm relative z-50">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Panel Użytkownika
          </h1>
          <p className="text-white/80">
            Witaj, {userFromSession.name}! Zarządzaj swoimi ustawieniami i
            subskrypcją
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-3">
              Następny Szept
            </h2>
            <p className="text-white/90 mb-4">
              {`Otrzymasz swój następny szept ${
                new Date() > new Date("20:59") ? "jutro" : "dzisiaj"
              } o`}
            </p>
            <div className="text-2xl font-bold text-yellow-400">20:59</div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-3">
              Status Subskrypcji
            </h2>
            <p className="text-white/90 mb-4">Twoja subskrypcja jest aktywna</p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30">
              <span className="text-green-400 font-medium text-sm">
                {userFromSession.premium ? "Premium" : "Trial"}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Ustawienia</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
              <span className="font-medium text-white">Email</span>
              <span className="text-white/80">{userFromSession.email}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
              <span className="font-medium text-white">Telefon</span>
              <span className="text-white/80">
                {userFromSession.phoneNumber}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
              <span className="font-medium text-white">Język wiadomości</span>
              <span className="text-white/80">
                {userFromSession.messageLanguage}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
              <span className="font-medium text-white">
                Godzina dostarczania
              </span>
              <span className="text-white/80">20:59</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
              <span className="font-medium text-white">Status subskrypcji</span>
              <span className="text-green-400 font-medium">
                {userFromSession.premium ? "Premium" : "Trial"}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/20">
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-red-400/30 hover:border-red-400/50 backdrop-blur-sm"
            >
              Wyloguj się
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
