import { getRequestConfig } from "next-intl/server";

/**
 * used to provide configuration for server-only code, i.e. Server Components, Server Actions & friends
 */

export default getRequestConfig(async () => {
  // Static for now, we'll change this later
  const locale = "en";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
