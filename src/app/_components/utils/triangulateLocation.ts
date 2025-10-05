import { GEO_CONTEXT } from "@/app/_consts";
import { reverseGeoCode } from "../../_actions/reverseGeoCode";

export async function triangulateLocation(
  ipCountry?: string | null,
  host?: string | null,
  browserGeo?: { latitude: number; longitude: number } | null,
  stripeData?: { country: string } | null
): Promise<string | null> {
  if (stripeData) {
    return stripeData.country;
  }

  if (ipCountry) {
    return ipCountry;
  }

  if (browserGeo) {
    return reverseGeoCode(browserGeo.latitude, browserGeo.longitude);
  }

  if (host) {
    const domain = GEO_CONTEXT.find((domain) => host.endsWith(domain.domain));

    return domain?.country ?? null;
  }

  return null;
}
