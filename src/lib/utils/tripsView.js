// src/lib/utils/tripsView.js

/**
 * Nimmt alle Trips aus dem Store und gibt nur diejenigen zurueck,
 * die gueltige Koordinaten haben, im Format:
 * { id, title, status, destinationName, lat, lon }
 */
export function getTripsWithCoordinates(allTrips) {
  if (!Array.isArray(allTrips)) return [];

  return allTrips
    .map((trip) => {
      // Koordinaten koennen als destinationLat/destinationLon
      // oder als lat/lon vorliegen, und oft als Strings
      const rawLat = trip?.destinationLat ?? trip?.lat;
      const rawLon = trip?.destinationLon ?? trip?.lon;

      const latNum = typeof rawLat === 'string' ? parseFloat(rawLat) : rawLat;
      const lonNum = typeof rawLon === 'string' ? parseFloat(rawLon) : rawLon;

      if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return null;
      if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) return null;

      return {
        id: trip.id,
        title: trip.name ?? trip.title ?? '',
        status: trip.status ?? 'planned',
        destinationName: trip.destinationName ?? trip.destination ?? '',
        lat: latNum,
        lon: lonNum
      };
    })
    .filter(Boolean);
}
