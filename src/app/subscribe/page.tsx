// server component
import { getUserFromSessionId } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PricingSection from "../_components/PricingSection";
import { ReturnButton } from "../_components/ReturnButton";

export default async function SubscribePage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId");

  if (!sessionId) {
    redirect("/?modal=login");
  }

  const userFromSession = await getUserFromSessionId<"id">(sessionId.value, {
    id: true,
  });

  if (!userFromSession) {
    redirect("/?modal=login");
  }

  return (
    <div className="flex flex-col items-center mb-3">
      <ReturnButton href="/dashboard" />
      <PricingSection />
    </div>
  );
}
