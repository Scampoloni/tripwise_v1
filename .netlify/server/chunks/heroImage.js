import { b as private_env } from "./shared-server.js";
async function reverseGeocode(lat, lon) {
  if (lat == null || lon == null || Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "TripWise/1.0 (reverse geocoding)",
        "Accept-Language": "en"
      }
    });
    if (!res.ok) {
      console.warn("Reverse geocoding failed with status", res.status);
      return null;
    }
    const data = await res.json();
    const address = data?.address;
    return {
      city: address?.city || address?.town || address?.village || address?.municipality,
      country: address?.country
    };
  } catch (err) {
    console.warn("Reverse geocoding failed", err);
    return null;
  }
}
async function fetchHeroImageForDestination(input) {
  const UNSPLASH_KEY = private_env.UNSPLASH_ACCESS_KEY;
  const { destinationName, latitude, longitude, cityName, countryName } = input || {};
  let resolvedCity = cityName || void 0;
  let resolvedCountry = countryName || void 0;
  if ((latitude != null || longitude != null) && (resolvedCity == null || resolvedCountry == null)) {
    const geo = await reverseGeocode(latitude, longitude);
    if (geo) {
      resolvedCity = geo.city ?? resolvedCity;
      resolvedCountry = geo.country ?? resolvedCountry;
    }
  }
  const query = resolvedCity && resolvedCountry ? `${resolvedCity} ${resolvedCountry} city skyline` : destinationName?.trim() ? `${destinationName} skyline` : "travel landscape";
  if (!UNSPLASH_KEY) {
    const sourceUrl = `https://source.unsplash.com/1600x900/?${encodeURIComponent(query)}`;
    try {
      const res = await fetch(sourceUrl, { method: "HEAD", redirect: "follow" });
      if (res && res.ok && typeof res.url === "string" && res.url.trim()) {
        return { heroImageUrl: res.url, cityName: resolvedCity, countryName: resolvedCountry };
      }
    } catch (err) {
      console.warn("Unsplash source fallback fehlgeschlagen", err);
    }
    return { heroImageUrl: sourceUrl, cityName: resolvedCity, countryName: resolvedCountry };
  }
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_KEY}`
        }
      }
    );
    if (!res.ok) {
      console.warn("Unsplash API Antwort", res.status);
      return { heroImageUrl: null, cityName: resolvedCity, countryName: resolvedCountry };
    }
    const data = await res.json();
    const first = data?.results?.[0];
    const url = first?.urls?.regular || first?.urls?.full || null;
    return { heroImageUrl: url, cityName: resolvedCity, countryName: resolvedCountry };
  } catch (err) {
    console.warn("Unsplash API fehlgeschlagen", err);
    return { heroImageUrl: null, cityName: resolvedCity, countryName: resolvedCountry };
  }
}
export {
  fetchHeroImageForDestination as f
};
