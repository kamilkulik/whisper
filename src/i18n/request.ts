import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

/**
 * used to provide configuration for server-only code, i.e. Server Components, Server Actions & friends
 */

export default getRequestConfig(async () => {
  // local is set on the "locale" cookie by the server middleware
  const locale = (await cookies()).get("locale")?.value || "pl";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
