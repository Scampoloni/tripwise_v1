const TOTAL_COUNTRIES = 195;

const COMPLETED_STATUSES = new Set(['completed', 'complete', 'finished', 'done', 'active']);
const CANCELLED_STATUSES = new Set(['cancelled', 'canceled']);

function normalizeCountryCode(trip) {
  const code = trip?.countryCode ?? trip?.country ?? trip?.destinationCountry;
  if (typeof code !== 'string') return null;
  const trimmed = code.trim();
  if (!trimmed) return null;
  return trimmed.toUpperCase();
}

function parseDate(value) {
  if (typeof value !== 'string') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function hasTripStarted(trip) {
  const start = parseDate(trip?.startDate);
  if (!start) return false;
  return start.valueOf() <= Date.now();
}

function shouldCountTrip(trip) {
  if (!trip) return false;
  const status = typeof trip.status === 'string' ? trip.status.trim().toLowerCase() : '';
  if (COMPLETED_STATUSES.has(status)) return true;
  if (CANCELLED_STATUSES.has(status)) return false;
  // Count if trip has started (even if no explicit status)
  return hasTripStarted(trip);
}

export function getWorldTravelStats(allTrips) {
  if (!Array.isArray(allTrips) || allTrips.length === 0) {
    return {
      totalCountries: TOTAL_COUNTRIES,
      visitedCount: 0,
      visitedPercent: 0,
      countries: []
    };
  }

  const visited = new Set();

  for (const trip of allTrips) {
    if (!shouldCountTrip(trip)) continue;
    const code = normalizeCountryCode(trip);
    if (code) {
      visited.add(code);
    }
  }

  const visitedCount = visited.size;
  const visitedPercent = visitedCount > 0 ? Math.round((visitedCount / TOTAL_COUNTRIES) * 100) : 0;

  return {
    totalCountries: TOTAL_COUNTRIES,
    visitedCount,
    visitedPercent,
    countries: Array.from(visited).sort()
  };
}
