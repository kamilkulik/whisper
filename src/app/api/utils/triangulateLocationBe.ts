export function triangulateLocationBe(
  stripeData: string | null,
  ipCountry?: string | null,
  host?: string | null
): string | null {
  console.log(
    "[ triangulateLocationBe ]",
    "stripeData: ",
    stripeData,
    "x-vercel-ip-country: ",
    ipCountry,
    "host: ",
    host
  );
  if (stripeData) {
    return stripeData;
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
      return "PL";
    }
    return host;
  }

  return null;
}
