import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { getTranslations } from "next-intl/server";
import NavigationBar from "../_components/NavigationBar";
import { SuccessPageTrack } from "../_components/SuccessPageTrack";
import { GB_CONTACT_EMAIL, GB_DOMAIN, PL_CONTACT_EMAIL } from "../_consts";

export const dynamic = "force-dynamic";

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ session_id: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id)
    throw new Error("Please provide a valid session_id (`cs_test_...`)");

  const t = await getTranslations("SuccessPage");

  // Set contact email based on hostname
  const contactEmail =
    process.env.CURRENT_HOST === GB_DOMAIN
      ? GB_CONTACT_EMAIL
      : PL_CONTACT_EMAIL;

  // TODO is this safe?
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });
  const { status, customer_details, amount_total, currency } = session;

  if (status === "open") {
    return redirect("/");
  }

  const customerEmail = customer_details?.email;

  if (status === "complete") {
    const value = amount_total != null ? amount_total / 100 : 9;
    const currencyCode = currency?.toUpperCase() ?? "USD";
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-[#2A031E] overflow-hidden">
        <SuccessPageTrack value={value} currency={currencyCode} />
        {/* Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/40 rounded-full blur-2xl heartbeat"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/40 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-3xl"></div>
        </div>

        <NavigationBar />

        {/* Main Content */}
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-6 py-12 pt-32 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                {t("title-1")}{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {t("title-2")}
                </span>
              </h1>

              <p className="text-xl text-blue-200 leading-relaxed">
                {t("copy-1")}{" "}
                {`${
                  new Date() > new Date(new Date().setHours(20, 59, 0, 0))
                    ? t("tomorrow")
                    : t("today")
                } ${t("evening")}.`}
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-white text-lg">
                  {t("email-confirmation")}{" "}
                  <span className="font-semibold text-blue-200">
                    {customerEmail}
                  </span>
                </p>
              </div>

              <p className="text-white/80 text-sm">
                {t("contact-us")}{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-blue-300 hover:text-blue-200 underline transition-colors"
                >
                  {contactEmail}
                </a>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 space-y-4">
              <a
                href="/"
                className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-semibold px-8 py-4 rounded-lg text-xl transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {t("return-to-home")}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
