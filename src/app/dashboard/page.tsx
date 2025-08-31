// server component
import { getUserFromSessionId, prisma } from "@/lib/prisma";
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionType,
} from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CancelSubscriptionButton from "../_components/CancelSubscriptionButton";

function subscriptionTypeToText(subscription: Subscription | null) {
  if (!subscription) {
    return "Brak subskrypcji";
  }

  const { type, status } = subscription;

  switch (status) {
    case SubscriptionStatus.CANCELLED:
      return "Anulowana";
    case SubscriptionStatus.EXPIRED:
      return "Wygasła";
  }

  switch (type) {
    case SubscriptionType.ONE_TIME:
      return "30 dni";
    case SubscriptionType.MONTHLY:
      return "Miesięczna";
    case SubscriptionType.TRIAL:
      return "Okres próbny 7 dni";
    default:
      return "Brak subskrypcji";
  }
}

function nextMessageTime(subscription: Subscription): {
  isSubscribed: boolean;
  message: string;
} {
  let isSubscribed = false;
  let message = "";
  if (
    subscription?.status === SubscriptionStatus.ACTIVE &&
    subscription?.dateExpires &&
    subscription?.dateExpires > new Date()
  ) {
    isSubscribed = true;
    message = `Otrzymasz swój następny szept ${
      new Date() > new Date("20:59") ? "jutro" : "dzisiaj"
    } o`;
  } else if (
    subscription?.status === SubscriptionStatus.CANCELLED &&
    subscription?.dateExpires
  ) {
    message = "Subskrypcja została anulowana";
    const lastSheptDate = subscription?.dateExpires;

    if (lastSheptDate > new Date()) {
      message += " ostatni szept:";
      message += ` ${lastSheptDate.toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  } else {
    message = "Nie masz aktywnej subskrypcji";
  }

  return { isSubscribed, message };
}

function subscriptionStatusToText(subscription: Subscription) {
  if (subscription.status === SubscriptionStatus.ACTIVE) {
    return "Aktywna";
  } else {
    return "Nieaktywna";
  }
}

function findLatestSubscription(subscriptions: Subscription[]): Subscription {
  return subscriptions.reduce((latest, current) =>
    latest.createdAt && current.createdAt
      ? latest.createdAt > current.createdAt
        ? latest
        : current
      : latest
  );
}

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

  const allSubscriptions = await prisma.subscription.findMany({
    where: {
      userId: userFromSession.id,
    },
  });
  let subscription = null;
  if (allSubscriptions.length > 0) {
    subscription = findLatestSubscription(allSubscriptions);
  }

  return (
    <>
      <a
        href="/"
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl p-8 backdrop-blur-sm relative z-50">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Panel Użytkownika
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              {nextMessageTime(subscription!).isSubscribed ? (
                <>
                  <p className="text-white/90 mb-4">
                    {nextMessageTime(subscription!).message}
                  </p>
                  <div className="text-2xl font-bold text-yellow-400">
                    20:59
                  </div>
                </>
              ) : (
                <p className="text-white/90 mb-4">
                  {nextMessageTime(subscription!).message}
                </p>
              )}
            </div>

            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <p className="text-white/90 mb-4">Twoja subskrypcja:</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30">
                <span className="text-green-400 font-medium text-2xl">
                  {subscriptionTypeToText(subscription)}
                </span>
              </div>
              {subscription?.dateExpires &&
                subscription.status === SubscriptionStatus.ACTIVE && (
                  <p className="text-white/80 mt-3 text-2xl">
                    {subscription?.type === SubscriptionType.MONTHLY
                      ? "Odnawia się"
                      : "Wygasa"}{" "}
                    {subscription?.dateExpires.toLocaleDateString("pl-PL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              {subscription?.type === SubscriptionType.MONTHLY &&
              subscription?.status === SubscriptionStatus.ACTIVE &&
              subscription?.dateCancelled === null ? (
                <CancelSubscriptionButton />
              ) : (
                // TODO encapsulate button into its own component
                <div className="mt-6">
                  <a
                    href="/subscribe"
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                  >
                    {subscription?.status === SubscriptionStatus.ACTIVE
                      ? "Przedłuż teraz"
                      : "Kup teraz"}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Ustawienia
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
                <a
                  href="/dashboard/user-settings"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Zmień email i telefon →
                </a>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
                <a
                  href="/dashboard/message-settings"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Zmień język wiadomości →
                </a>
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
    </>
  );
}
