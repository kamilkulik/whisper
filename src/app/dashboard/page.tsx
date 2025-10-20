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
import ResumeSubscriptionButton from "../_components/ResumeSubscriptionButton";
import { ReturnButton } from "../_components/ReturnButton";
import { getFormatter, getTranslations } from "next-intl/server";

function subscriptionTypeToText(
  subscription: Pick<
    Subscription,
    "id" | "createdAt" | "status" | "type" | "dateCancelled" | "dateExpires"
  > | null,
  t: Awaited<ReturnType<typeof getTranslations>>
) {
  if (!subscription) {
    return t("subscription-card.subscription-type-to-text.not-subscribed");
  }

  const { type, status } = subscription;

  switch (status) {
    case SubscriptionStatus.CANCEL_AT_PERIOD_END:
      return t("subscription-card.subscription-type-to-text.canceled");
    case SubscriptionStatus.EXPIRED:
      return t("subscription-card.subscription-type-to-text.expired");
    case SubscriptionStatus.REFUNDED:
      return t("subscription-card.subscription-type-to-text.refunded");
  }

  switch (type) {
    case SubscriptionType.ONE_TIME:
      return t("subscription-card.subscription-type-to-text.one-time");
    case SubscriptionType.MONTHLY:
      return t("subscription-card.subscription-type-to-text.monthly");
    case SubscriptionType.TRIAL:
      return t("subscription-card.subscription-type-to-text.trial");
    default:
      return t("subscription-card.subscription-type-to-text.not-subscribed");
  }
}

function nextMessageTime(
  subscription: Pick<
    Subscription,
    "id" | "createdAt" | "status" | "dateExpires" | "dateCancelled"
  >,
  t: Awaited<ReturnType<typeof getTranslations>>,
  format: Awaited<ReturnType<typeof getFormatter>>
): {
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
    message = `${new Date() > new Date("20:59") ? t("next-message.tomorrow") : t("next-message.today")} ${t("next-message.at")}`;
  } else if (
    subscription?.status === SubscriptionStatus.CANCEL_AT_PERIOD_END &&
    subscription?.dateExpires
  ) {
    message = t("next-message.canceled-subscription");
    const lastSheptDate = subscription?.dateExpires;

    if (lastSheptDate > new Date()) {
      message += ` ${t("next-message.last-whisper")}`;
      message += ` ${format.dateTime(lastSheptDate, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  } else {
    message = t("next-message.no-active-subscription");
  }

  return { isSubscribed, message };
}

function findLatestSubscription(
  subscriptions: Pick<
    Subscription,
    "id" | "createdAt" | "status" | "dateExpires" | "dateCancelled" | "type"
  >[]
): Pick<
  Subscription,
  "id" | "createdAt" | "status" | "dateExpires" | "dateCancelled" | "type"
> {
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
  const t = await getTranslations("DashboardPage");
  const format = await getFormatter();

  if (!sessionId) {
    redirect("/?modal=login");
  }

  const userFromSession = await getUserFromSessionId<"id">(sessionId.value, {
    id: true,
  });

  if (!userFromSession) {
    redirect("/?modal=login");
  }

  const allSubscriptions: Pick<
    Subscription,
    "id" | "createdAt" | "status" | "dateExpires" | "dateCancelled" | "type"
  >[] = await prisma.subscription.findMany({
    where: {
      userId: userFromSession.id,
    },
    select: {
      id: true,
      createdAt: true,
      status: true,
      dateExpires: true,
      dateCancelled: true,
      type: true,
    },
  });
  let subscription = null;
  if (allSubscriptions.length > 0) {
    subscription = findLatestSubscription(allSubscriptions);
  }

  return (
    <>
      <ReturnButton href="/" />
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-800/60 rounded-2xl shadow-xl p-8 backdrop-blur-sm relative z-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col justify-center bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <p className="text-white/90 mb-4">{t("next-message.title")}</p>
              <div className="mx-8 mb-8 border-t border-white/20"></div>
              {nextMessageTime(subscription!, t, format).isSubscribed ? (
                <>
                  <p className="text-white/90 mb-4">
                    {nextMessageTime(subscription!, t, format).message}
                  </p>
                  <div className="text-3xl font-bold text-green-400">20:59</div>
                </>
              ) : (
                <p className="text-white/90 mb-4">
                  {nextMessageTime(subscription!, t, format).message}
                </p>
              )}
            </div>

            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <p className="text-white/90 mb-4">
                {t("subscription-card.title")}
              </p>
              <div className="mx-8 mb-8 border-t border-white/20"></div>
              <div
                className={`inline-flex items-center mb-4 px-3 py-1 rounded-full ${
                  subscription?.status === SubscriptionStatus.ACTIVE
                    ? subscription?.dateCancelled
                      ? "bg-orange-500/20 border border-orange-400/30"
                      : "bg-green-500/20 border border-green-400/30"
                    : "bg-red-500/20 border border-red-400/30"
                }`}
              >
                <span
                  className={`font-medium text-2xl ${
                    subscription?.status === SubscriptionStatus.ACTIVE
                      ? subscription?.dateCancelled
                        ? "text-orange-400"
                        : "text-green-400"
                      : "text-red-300"
                  }`}
                >
                  {subscriptionTypeToText(subscription, t)}
                </span>
              </div>
              {subscription?.dateExpires &&
                subscription.status === SubscriptionStatus.ACTIVE && (
                  <p className="text-white/80 mt-3 mb-8 text-2xl md:text-xl">
                    {subscription?.type === SubscriptionType.MONTHLY ? (
                      subscription.dateCancelled ? (
                        <>
                          <span className="font-bold">
                            {t("subscription-card.renewal-status.canceled")}
                          </span>
                          . {t("subscription-card.renewal-status.expires")}
                        </>
                      ) : (
                        t("subscription-card.renewal-status.renewes")
                      )
                    ) : (
                      t("subscription-card.renewal-status.expires")
                    )}
                    {<br />}
                    {format.dateTime(subscription?.dateExpires, {
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
                <CancelSubscriptionButton subscription={subscription} />
              ) : subscription?.status === SubscriptionStatus.ACTIVE &&
                subscription?.dateCancelled &&
                subscription?.dateExpires &&
                subscription?.dateExpires > new Date() ? (
                <ResumeSubscriptionButton subscription={subscription} />
              ) : (
                // TODO encapsulate button into its own component
                <div className="my-6 space-y-4">
                  <a
                    href="/subscribe"
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-semibold px-8 py-4 rounded-lg text-2xl transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                  >
                    {subscription?.status === SubscriptionStatus.ACTIVE
                      ? t("subscription-card.CTA-button-extend")
                      : t("subscription-card.CTA-button-buynow")}
                  </a>
                  <div className="mx-8 border-t border-white/20"></div>
                  {subscription?.type === SubscriptionType.ONE_TIME &&
                    subscription?.status === SubscriptionStatus.ACTIVE && (
                      <div>
                        <CancelSubscriptionButton subscription={subscription} />
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              {t("settings.title")}
            </h2>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 text-xl">
              <div className="flex items-center justify-between p-4">
                <a
                  href="/dashboard/user-settings"
                  className="text-white hover:text-blue-300 font-normal transition-colors duration-200"
                >
                  {t("settings.change-email-and-phone")}
                </a>
              </div>
              <div className="border-t border-white/20"></div>
              <div className="flex items-center justify-between p-4">
                <a
                  href="/dashboard/message-settings"
                  className="text-white hover:text-blue-300 font-normal transition-colors duration-200"
                >
                  {t("settings.change-message-language")}
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
                {t("logout")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
