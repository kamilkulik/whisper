// server component
import { getUserFromSessionId } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PricingSection from "../../_components/PricingSection";

export default async function SubscribePage({ params }: { params: Promise<{ id?: string }> }) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId");
  const { id } = await params;

  if (!id) {
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
    <PricingSection userId={Number(id)} isContinuation={true} />
  );
}
