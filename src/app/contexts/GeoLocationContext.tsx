"use client";

import { createContext, useState, ReactNode, useEffect } from "react";

export interface GeoLocationContextType {
  browserGeo: GeolocationCoordinates | null;
  ipCountry: string | null;
  host: string | null;
  isLoaded: boolean;
}

export const GeoLocationContext = createContext<GeoLocationContextType>({
  browserGeo: null,
  ipCountry: null,
  host: null,
  isLoaded: false,
});

const options: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 30000,
  timeout: 27000,
};

export function GeoLocationProvider({
  children,
  ipCountry,
  host,
}: {
  children: ReactNode;
  ipCountry: string | null;
  host: string | null;
}) {
  const [browserGeo, setBrowserGeo] = useState<GeolocationCoordinates | null>(
    null
  );

  useEffect(() => {
    let watchId: number | null = null;

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position: GeolocationPosition) => {
          setBrowserGeo(position.coords);
        },
        (error) => {
          console.error(error);
        },
        options
      );
    } else {
      setBrowserGeo(null);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const value: GeoLocationContextType = {
    browserGeo,
    ipCountry,
    host,
    isLoaded: true,
  };

  return (
    <GeoLocationContext.Provider value={value}>
      {children}
    </GeoLocationContext.Provider>
  );
}
