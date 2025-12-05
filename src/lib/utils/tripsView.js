// src/lib/utils/tripsView.js

/**
 * Berechnet den effektiven Status eines Trips basierend auf Datum
 * @param {Object} trip
 * @returns {'planned' | 'active' | 'completed'}
 */
function computeTripStatus(trip) {
  // Wenn explizit cancelled, behalte das
  const rawStatus = trip?.status?.toLowerCase?.() ?? '';
  if (rawStatus === 'cancelled' || rawStatus === 'canceled') {
    return 'completed'; // Zeige cancelled als completed (grau/orange)
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Nur Datum vergleichen
  
  const startDate = trip?.startDate ? new Date(trip.startDate) : null;
  const endDate = trip?.endDate ? new Date(trip.endDate) : null;
  
  if (startDate) startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(0, 0, 0, 0);

  // Trip ist beendet wenn endDate in der Vergangenheit liegt
  if (endDate && endDate < now) {
    return 'completed';
  }
  
  // Trip ist aktiv wenn startDate <= heute und endDate >= heute (oder kein endDate)
  if (startDate && startDate <= now) {
    return 'active';
  }
  
  // Ansonsten ist er geplant
  return 'planned';
}

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
        status: computeTripStatus(trip),
        destinationName: trip.destinationName ?? trip.destination ?? '',
        lat: latNum,
        lon: lonNum
      };
    })
    .filter(Boolean);
}
