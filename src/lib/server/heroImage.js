import { env } from '$env/dynamic/private';
import { reverseGeocode } from './reverseGeocoding';

/**
 * Hero-Bild fuer einen Trip holen. Nutzt (lat, lon) fuer Reverse Geocoding,
 * um City/Country in die Unsplash Query zu legen. Fallback: destinationName oder generischer String.
 * Erwartet UNSPLASH_ACCESS_KEY in den Private Env Vars.
 * @param {{ destinationName?: string | null; latitude?: number | null; longitude?: number | null; cityName?: string | null; countryName?: string | null }} input
 * @returns {Promise<{ heroImageUrl: string | null; cityName?: string; countryName?: string }>}
 */
export async function fetchHeroImageForDestination(input) {
  const UNSPLASH_KEY = env.UNSPLASH_ACCESS_KEY;
  const { destinationName, latitude, longitude, cityName, countryName } = input || {};

  let resolvedCity = cityName || undefined;
  let resolvedCountry = countryName || undefined;

  if ((latitude != null || longitude != null) && (resolvedCity == null || resolvedCountry == null)) {
    const geo = await reverseGeocode(latitude, longitude);
    if (geo) {
      resolvedCity = geo.city ?? resolvedCity;
      resolvedCountry = geo.country ?? resolvedCountry;
    }
  }

  if (!UNSPLASH_KEY) {
    return { heroImageUrl: null, cityName: resolvedCity, countryName: resolvedCountry };
  }

  const query = resolvedCity && resolvedCountry
    ? `${resolvedCity} ${resolvedCountry} city skyline`
    : destinationName?.trim()
      ? `${destinationName} skyline`
      : 'travel landscape';

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
      console.warn('Unsplash API Antwort', res.status);
      return { heroImageUrl: null, cityName: resolvedCity, countryName: resolvedCountry };
    }

    const data = await res.json();
    const first = data?.results?.[0];
    const url = first?.urls?.regular || first?.urls?.full || null;
    return { heroImageUrl: url, cityName: resolvedCity, countryName: resolvedCountry };
  } catch (err) {
    console.warn('Unsplash API fehlgeschlagen', err);
    return { heroImageUrl: null, cityName: resolvedCity, countryName: resolvedCountry };
  }
}
