// server component
import { getUserFromSessionId } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PricingSection from "../_components/PricingSection";

export default async function SubscribePage({ searchParams }: { searchParams: Promise<{ userId?: number }> }) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId");
  const { userId } = await searchParams;

  if (!userId) {
    if (!sessionId) {
      redirect("/?modal=ritual");
    }

    const userFromSession = await getUserFromSessionId<"id">(sessionId.value, {
      id: true,
    });

    if (!userFromSession) {
      redirect("/?modal=ritual");
    }
  }

  return (
    <PricingSection userId={userId} isContinuation={true} />
  );
}
