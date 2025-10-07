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
  const [browserGeo, setBrowserGeo] = useState<GeoLocationContextType>({
    browserGeo: null,
    ipCountry,
    host,
    isLoaded: false,
  });

  useEffect(() => {
    let watchId: number | null = null;

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position: GeolocationPosition) => {
          setBrowserGeo({
            browserGeo: position.coords,
            ipCountry,
            host,
            isLoaded: true,
          });
        },
        (error) => {
          console.error(error);
          setBrowserGeo({
            browserGeo: null,
            ipCountry,
            host,
            isLoaded: true,
          });
        },
        options
      );
    } else {
      setBrowserGeo({
        browserGeo: null,
        ipCountry,
        host,
        isLoaded: true,
      });
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return (
    <GeoLocationContext.Provider value={browserGeo}>
      {children}
    </GeoLocationContext.Provider>
  );
}
