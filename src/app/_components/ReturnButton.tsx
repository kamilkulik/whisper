import { useTranslations } from "next-intl";

interface ReturnButtonProps {
  absolutePositioning?: boolean;
  href: string;
}

export const ReturnButton = ({
  absolutePositioning = true,
  href,
}: ReturnButtonProps) => {
  const t = useTranslations("Components.ReturnButton");
  return (
    <a
      href={href}
      className={`z-10 flex items-center text-white/80 hover:text-white transition-colors duration-200 mr-6 ${absolutePositioning ? "absolute left-10 top-20" : ""}`}
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
      <span>{t("return")}</span>
    </a>
  );
};
