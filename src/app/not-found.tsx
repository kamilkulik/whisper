import ErrorPageLayout from "./_components/ErrorPageLayout";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("NotFoundPage");
  return (
    <ErrorPageLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
          <span className="bg-gradient-to-r from-gray-400 to-slate-400 bg-clip-text text-transparent">
            {t("title")}
          </span>
        </h1>

        <p className="text-xl text-blue-200 leading-relaxed mb-8">
          {t("description")}
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {t("CTA-button")}
          </Link>
        </div>
      </div>
    </ErrorPageLayout>
  );
}
