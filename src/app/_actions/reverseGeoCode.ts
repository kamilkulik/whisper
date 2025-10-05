"use server";

export type ApiNinjaReverseGeocodeResponse = Array<{
  country: string;
  name: string; // city name
  state: string; // state / region name
}>;

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
  try {
    const apiNinjaURL = `https://api.api-ninjas.com/v1/reversegeocode?lat=${latitude}&lon=${longitude}`;
    const response = await fetch(apiNinjaURL, {
      headers: {
        "X-Api-Key": process.env.API_NINJA_API_KEY || "",
      },
    });
    const data = await response.json();

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
  return reverseGeocodeApiNinja(latitude, longitude);
}
