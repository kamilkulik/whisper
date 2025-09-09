import { getRequestConfig, GetRequestConfigParams } from "next-intl/server";
import { cookies } from "next/headers";
import { Locale } from "next-intl";

/**
 * used to provide configuration for server-only code, i.e. Server Components, Server Actions & friends
 */

export default getRequestConfig(async (params: GetRequestConfigParams) => {
  // local is set on the "locale" cookie by the server middleware
  let locale: Locale;

  const hasLocaleCookie = (await cookies()).has("locale");
  if (hasLocaleCookie) {
    locale = (await cookies()).get("locale")?.value || "pl";
  } else {
    const paramsLocale = params.locale;
    locale = paramsLocale || "pl";
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
