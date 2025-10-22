import { useState, useEffect, useContext } from "react";
import { triangulateLocationOnFe } from "../_components/utils/triangulateLocation";
import { GeoLocationContext } from "../contexts/GeoLocationContext";
import { getPricingContext, PricingContextData } from "../_consts";

export const useTriangulatedLocation = (): {
  isLoaded: boolean;
  triangulatedCountry: string | null;
  pricingData: PricingContextData | null;
} => {
  const { isLoaded, ipCountry, host, browserGeo } =
    useContext(GeoLocationContext);
  const [triangulatedCountry, setTriangulatedCountry] = useState<string | null>(
    null
  );
  const [pricingData, setPricingData] = useState<PricingContextData | null>(
    null
  );

  useEffect(() => {
    if (isLoaded) {
      const triangulateLocationCallback = async () => {
        const triangulatedCountry = await triangulateLocationOnFe(
          ipCountry,
          host,
          {
            latitude: browserGeo?.latitude,
            longitude: browserGeo?.longitude,
          }
        );

        setTriangulatedCountry(triangulatedCountry);
        setPricingData(getPricingContext(triangulatedCountry || "DEFAULT"));
      };
      triangulateLocationCallback();
    }
  }, [isLoaded, ipCountry, host, browserGeo]);

  return { isLoaded, triangulatedCountry, pricingData };
};
