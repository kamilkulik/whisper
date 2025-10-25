import { GEO_CONTEXT, PL_COUNTRY_CODE } from "@/app/_consts";
import { reverseGeoCode } from "../../_actions/reverseGeoCode";

export async function triangulateLocationOnFe(
  ipCountry?: string | null,
  host?: string | null,
  browserGeo?: {
    latitude: number | undefined;
    longitude: number | undefined;
  } | null
): Promise<string | null> {
  if (ipCountry) {
    return ipCountry;
  }

  if (browserGeo?.latitude && browserGeo?.longitude) {
    return reverseGeoCode(browserGeo.latitude, browserGeo.longitude);
  }

  // LOCAL DEVELOPMENT
  if (
    !!host &&
    (host.includes("localhost:3000") ||
      host.includes("127.0.0.1") ||
      host.includes("192.168.0"))
  ) {
    return PL_COUNTRY_CODE;
  }

  // MATCH AGAINST KNOWN DOMAINS
  const domain = GEO_CONTEXT.find((domain) => host?.endsWith(domain.domain));
  if (domain) {
    return domain?.country ?? null;
  }

  // WOW, SOMETHING WENT HORRIBLY WRONG
  return null;
}
