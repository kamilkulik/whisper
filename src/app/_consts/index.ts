export const GB_DOMAIN = "eveningwhisper.co.uk";
export const PL_DOMAIN = "wieczornyszept.pl";
export const PL_COUNTRY_CODE = "PL";
export const GB_COUNTRY_CODE = "GB";

export const GEO_CONTEXT = [
  {
    domain: GB_DOMAIN,
    country: GB_COUNTRY_CODE,
    countryCode: "+44",
  },
  {
    domain: PL_DOMAIN,
    country: PL_COUNTRY_CODE,
    countryCode: "+48",
  },
];

export interface PricingContextData {
  country: string;
  oneTimePrice: string;
  subscriptionPrice: string;
  currency: string;
  currencySign: string;
}

export const PRICING_CONTEXT: PricingContextData[] = [
  {
    country: GB_COUNTRY_CODE,
    oneTimePrice: "10",
    subscriptionPrice: "8",
    currency: "GBP",
    currencySign: "£",
  },
  {
    country: PL_COUNTRY_CODE,
    oneTimePrice: "25",
    subscriptionPrice: "20",
    currency: "PLN",
    currencySign: "zł",
  },
  {
    country: "DEFAULT",
    oneTimePrice: "11",
    subscriptionPrice: "9",
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
