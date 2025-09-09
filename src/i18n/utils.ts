import { Locale } from "next-intl";
import { createTranslator } from "use-intl/core";

export async function createTranslatorFromLocale(
  locale: Locale,
  namespace: string
) {
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return createTranslator({ locale, messages, namespace });
}
