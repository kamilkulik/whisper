import { GEO_CONTEXT } from "@/app/_consts";
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

  if (host) {
    const domain = GEO_CONTEXT.find((domain) => host.endsWith(domain.domain));

    return domain?.country ?? null;
  }

  return null;
}
