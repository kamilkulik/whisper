// server component
import { getUserFromSessionId, prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UserSettingsForm from "./UserSettingsForm";

export default async function UserSettingsPage() {
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
          <div className="flex items-center mb-6">
            <a
              href="/dashboard"
              className="flex items-center text-white/80 hover:text-white transition-colors duration-200 mr-6"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Powrót do panelu
            </a>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Ustawienia Użytkownika
          </h1>
          <p className="text-white/80">
            Zmień swoje dane kontaktowe i ustawienia konta
          </p>
        </div>

        <UserSettingsForm user={userFromSession} />
      </div>
    </div>
  );
}
