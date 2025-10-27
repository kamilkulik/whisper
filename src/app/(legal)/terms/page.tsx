import { ReturnButton } from "../../_components/ReturnButton";
import { useLegalContentRenderer } from "../utils/renderLegalContent";

export default function TermsAndConditionsPage() {
  const { renderSection, t } = useLegalContentRenderer(
    "LEGAL.terms-and-conditions"
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <ReturnButton href="/" />

      <div className="mt-16">
        <h1 className="text-3xl font-bold text-white mb-8 elegant-text text-center">
          {t("title")}
        </h1>

        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10 text-justify">
          {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"].map(
            renderSection
          )}
        </div>
      </div>
    </div>
  );
}
