import {
  GB_COUNTRY_CODE,
  GB_DOMAIN,
  PL_COUNTRY_CODE,
  PL_DOMAIN,
} from "@/app/_consts";

/**
 * @param stripeData
 * @param ipCountry - be very careful using this parameter - it will reflect the location of vercel function location
 * @param host
 * @param triangulatedCountry - comes from frontend header x-triangulated-country which relies on user accepting sharing location
 * @returns
 */
export function triangulateLocationBe(
  stripeData: string | null,
  ipCountry?: string | null,
  host?: string | null,
  triangulatedCountry?: string | null
): string | null {
  console.log(
    "[ triangulateLocationBe ]",
    "stripeData: ",
    stripeData,
    "x-triangulated-country: ",
    triangulatedCountry,
    "x-vercel-ip-country: ",
    ipCountry,
    "host: ",
    host
  );
  if (stripeData) {
    return stripeData;
  }

  // if host is present, use it to determine the country
  if (host) {
    if (host.includes(PL_DOMAIN)) {
      return PL_COUNTRY_CODE;
    }
    if (host.includes(GB_DOMAIN)) {
      return GB_COUNTRY_CODE;
    }
  }

  // comes from x-triangulated-country header
  // which relies on user accepting location sharing
  // which is unreliable
  if (triangulatedCountry) {
    return triangulatedCountry;
  }

  if (ipCountry) {
    return ipCountry;
  }

  if (host) {
    if (
      host.includes("localhost:3000") ||
      host.includes("127.0.0.1") ||
      host.includes("0.0.0.0:3000") ||
      host.includes("192.168.0")
    ) {
      return PL_COUNTRY_CODE;
    }
    return host;
  }

  return null;
}
