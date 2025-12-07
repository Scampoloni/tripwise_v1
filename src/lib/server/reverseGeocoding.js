/**
 * Einfaches Reverse Geocoding via OpenStreetMap Nominatim.
 * Nur serverseitig nutzen. Gibt bei Fehlern null zurück.
 * @param {number | null | undefined} lat
 * @param {number | null | undefined} lon
 * @returns {Promise<{ city?: string; country?: string } | null>}
 */
export async function reverseGeocode(lat, lon) {
  if (lat == null || lon == null || Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'TripWise/1.0 (reverse geocoding)',
        'Accept-Language': 'en'
      }
    });
    if (!res.ok) {
      console.warn('Reverse geocoding failed with status', res.status);
      return null;
    }
    const data = await res.json();
    const address = data?.address;
    return {
      city: address?.city || address?.town || address?.village || address?.municipality,
      country: address?.country
    };
  } catch (err) {
    console.warn('Reverse geocoding failed', err);
    return null;
  }
}
