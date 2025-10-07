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
    console.log("setting ipCountry", ipCountry);
    return ipCountry;
  }

  if (browserGeo?.latitude && browserGeo?.longitude) {
    console.log("setting browserGeo", browserGeo);
    return reverseGeoCode(browserGeo.latitude, browserGeo.longitude);
  }

  console.log("received host", host);
  const domain = GEO_CONTEXT.find((domain) => host?.endsWith(domain.domain));
  if (domain) {
    console.log("setting by domain", domain);

    return domain?.country ?? null;
  }

  return null;
}
