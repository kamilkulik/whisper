export const UK_DOMAIN = "eveningwhisper.co.uk";
export const PL_DOMAIN = "wieczornyszept.pl";

export const GEO_CONTEXT = [
  {
    domain: UK_DOMAIN,
    country: "UK",
    countryCode: "+44",
  },
  {
    domain: PL_DOMAIN,
    country: "PL",
    countryCode: "+48",
  },
];

export interface PricingContextData {
  country: string;
  oneTime: string;
  subscription: string;
  currency: string;
  currencySign: string;
}

export const PRICING_CONTEXT: PricingContextData[] = [
  {
    country: "UK",
    oneTime: "9.99",
    subscription: "7.99",
    currency: "GBP",
    currencySign: "£",
  },
  {
    country: "PL",
    oneTime: "24,99",
    subscription: "19",
    currency: "PLN",
    currencySign: "zł",
  },
  {
    country: "DEFAULT",
    oneTime: "10.99",
    subscription: "8.99",
    currency: "USD",
    currencySign: "$",
  },
];

export function getPricingContext(country: string) {
  return (
    PRICING_CONTEXT.find((context) => context.country === country) ||
    PRICING_CONTEXT[2]
  );
}
