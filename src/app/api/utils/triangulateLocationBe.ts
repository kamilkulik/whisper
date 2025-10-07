export function triangulateLocationBe(
  stripeData: string | null,
  ipCountry?: string | null,
  host?: string | null
): string | null {
  if (stripeData) {
    return stripeData;
  }

  if (ipCountry) {
    return ipCountry;
  }

  if (host) {
    if (host.includes("localhost:3000") || host.includes("127.0.0.1")) {
      return "PL";
    }
    return host;
  }

  return null;
}
