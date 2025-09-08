import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Components.Footer");
  return (
    <>
      {/* Footer Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 mb-12 px-12">
            {/* Middle Column - Links */}
            <div className="col-span-2">
              <h3 className="text-2xl font-bold mb-8 elegant-text">
                {t("title")}
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {t("link-1")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {t("link-2")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {t("link-3")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Right Column - Newsletter */}
            <div className="col-span-3">
              <h3 className="text-2xl font-bold mb-8 elegant-text">
                {t("newsletter-title")}
              </h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                {t("newsletter-subtitle")}
              </p>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder={t("newsletter-placeholder")}
                  className="w-full px-4 py-3 bg-transparent border-b-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors"
                />

                <button className="bg-[#F5F5DC] text-[#2A031E] px-6 py-2 rounded-lg font-medium hover:bg-white transition-colors">
                  {t("newsletter-button")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="relative border-t border-white/20 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-white/60 text-sm">{t("copyright")}</div>
          </div>
        </div>
      </div>
    </>
  );
}
