// server component
import { getUserFromSessionId, prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MessageSettingsForm from "./MessageSettingsForm";
import { ReturnButton } from "@/app/_components/ReturnButton";
import { getTranslations } from "next-intl/server";

export default async function MessageSettingsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId");
  const t = await getTranslations("MessageSettingsPage");

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
            <ReturnButton href="/dashboard" absolutePositioning={false} />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">{t("title")}</h1>
        </div>

        <MessageSettingsForm user={userFromSession} />
      </div>
    </div>
  );
}
