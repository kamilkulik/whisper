import { Locale } from "next-intl";
import { createTranslator } from "use-intl/core";

export async function createTranslatorFromLocale(
  locale: Locale,
  namespace: string
) {
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return createTranslator({ locale, messages, namespace });
}

/**
 * const t: {
    <TargetKey extends string>(key: TargetKey, ...args: TranslateArgs<NestedValueOf<Record<string, any>, `EmailTemplates.Welcome.${TargetKey}`>, never>): string;
    rich<TargetKey extends string>(key: TargetKey, ...args: TranslateArgs<...>): ReactNode;
    markup<TargetKey extends string>(key: TargetKey, ...args: TranslateArgs<...>): string;
    raw<TargetKey extends string>(key: TargetKey): any;
    has<TargetKey extends string>(key: TargetKey): boolean;
}
 */
