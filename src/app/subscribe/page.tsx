// server component
import { getUserFromSessionId } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PricingSection from "../_components/PricingSection";

export default async function SubscribePage() {
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
    <div className="flex flex-col items-center mb-3">
      <a
        href="/dashboard"
        className="z-10 flex items-center text-white/80 hover:text-white transition-colors duration-200 mr-6 absolute left-10 top-20"
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
        <span>Powrót</span>
      </a>
      <PricingSection />
    </div>
  );
}
