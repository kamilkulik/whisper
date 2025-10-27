import { useTranslations } from "next-intl";

export const useLegalContentRenderer = (translationKey: string) => {
  const t = useTranslations(translationKey);

  const renderSubItems = (subitems: string[]) => {
    return (
      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
        {subitems.map((item, index) => (
          <li key={index} className="text-white/80 text-sm">
            {item}
          </li>
        ))}
      </ul>
    );
  };

  const renderTerm = (termKey: string, termValue: any) => {
    if (typeof termValue === "string") {
      return (
        <p className="text-white/80 text-sm leading-relaxed mb-3">
          {termKey}. {termValue}
        </p>
      );
    } else if (
      typeof termValue === "object" &&
      termValue.text &&
      termValue.subitems
    ) {
      return (
        <div className="mb-3">
          <p className="text-white/80 text-sm leading-relaxed">
            {termKey}. {termValue.text}
          </p>
          {renderSubItems(termValue.subitems)}
        </div>
      );
    }
    return null;
  };

  const renderSection = (sectionKey: string) => {
    const sectionTitle = t(`sections.${sectionKey}.title`);
    const terms = t.raw(`sections.${sectionKey}.terms`);

    return (
      <div key={sectionKey} className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 elegant-text">
          {sectionKey}. {sectionTitle}
        </h2>
        <div className="space-y-3">
          {Object.entries(terms).map(([termNumber, termValue]) => (
            <div key={termNumber}>
              <div className="flex-1">{renderTerm(termNumber, termValue)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return {
    renderSection,
    renderTerm,
    renderSubItems,
    t,
  };
};
