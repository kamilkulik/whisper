"use server";

import { KeyValueCache } from "../../lib/fetchWithCache";

export type ApiNinjaReverseGeocodeResponse = Array<{
  country: string;
  name: string; // city name
  state: string; // state / region name
}>;

// need to cache that geolocation
function coordinatesToKey(latitude: number, longitude: number): string {
  // use one decimal place to round location to 10k
  return `${latitude.toFixed(1)},${longitude.toFixed(1)}`;
}

function isApiNinjaReverseGeocodeResponse(
  data: any
): data is ApiNinjaReverseGeocodeResponse {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item.country === "string" &&
        typeof item.name === "string" &&
        typeof item.state === "string"
    )
  );
}

export async function reverseGeocodeApiNinja(
  latitude: number,
  longitude: number
): Promise<string | null> {
  console.log("X-Api-Key", process.env.API_NINJA_API_KEY);
  try {
    const apiNinjaURL = `https://api.api-ninjas.com/v1/reversegeocoding?lat=${latitude}&lon=${longitude}`;
    const response = await fetch(apiNinjaURL, {
      headers: {
        "X-Api-Key": process.env.API_NINJA_API_KEY || "",
      },
    });
    const data = await response.json();

    console.log("data", data);

    if (!isApiNinjaReverseGeocodeResponse(data)) {
      throw new Error("Invalid response from API Ninja");
    }

    return data[0].country;
  } catch (error) {
    console.error("Error reverse geocoding API Ninja", error);
    return null;
  }
}

export async function reverseGeoCode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const cacheKey = coordinatesToKey(latitude, longitude);

  return KeyValueCache.getInstance().fetchWithCache(cacheKey, () =>
    reverseGeocodeApiNinja(latitude, longitude)
  );
}
