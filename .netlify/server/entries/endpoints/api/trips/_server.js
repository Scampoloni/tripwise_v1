import { json } from "@sveltejs/kit";
import { a as getTrips, l as updateTrip, m as createTrip } from "../../../../chunks/db.js";
import { f as fetchHeroImageForDestination } from "../../../../chunks/heroImage.js";
import { a as validateTripPayload } from "../../../../chunks/validators.js";
const FALLBACK_PARTICIPANTS = Object.freeze([{ id: "me", name: "Du" }]);
const MS_PER_DAY = 864e5;
const WEATHER_STALE_MS = 6 * 60 * 60 * 1e3;
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function daysUntilTrip(startDate) {
  if (!startDate) return Number.POSITIVE_INFINITY;
  const parsed = new Date(startDate);
  if (Number.isNaN(parsed.getTime())) return Number.POSITIVE_INFINITY;
  const today = startOfDay(/* @__PURE__ */ new Date());
  const target = startOfDay(parsed);
  return Math.floor((target.getTime() - today.getTime()) / MS_PER_DAY);
}
function weatherCodeToText(code) {
  const map = {
    0: "klar",
    1: "leicht bewölkt",
    2: "bewölkt",
    3: "stark bewölkt",
    45: "Nebel",
    48: "Nebel",
    51: "Nieselregen",
    61: "Regen",
    71: "Schnee",
    80: "Schauer",
    95: "Gewitter"
  };
  return map?.[code] || "Wetter";
}
async function fetchWeatherPreview(lat, lon, startDate) {
  if (lat == null || lon == null || !startDate) return null;
  try {
    const target = new Date(startDate);
    if (Number.isNaN(target.getTime())) return null;
    const dateStr = target.toISOString().slice(0, 10);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_min,temperature_2m_max,weathercode&timezone=auto&forecast_days=16`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const idx = Array.isArray(data?.daily?.time) ? data.daily.time.findIndex((d) => d === dateStr) : -1;
    if (idx === -1) return null;
    const min = data.daily.temperature_2m_min?.[idx];
    const max = data.daily.temperature_2m_max?.[idx];
    const code = data.daily.weathercode?.[idx];
    return {
      minTemp: typeof min === "number" ? Math.round(min) : void 0,
      maxTemp: typeof max === "number" ? Math.round(max) : void 0,
      description: weatherCodeToText(code),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (err) {
    console.warn("Wetter-API fehlgeschlagen", err);
    return null;
  }
}
function ensureParticipants(participants) {
  if (Array.isArray(participants) && participants.length > 0) {
    return participants;
  }
  return FALLBACK_PARTICIPANTS.map((item) => ({ ...item }));
}
async function GET({ locals }) {
  const userId = locals.userId;
  if (!userId) {
    return json({ error: "Nicht eingeloggt" }, { status: 401 });
  }
  try {
    const trips = await getTrips(userId);
    const normalized = await Promise.all(trips.map(async (trip) => {
      const rawBudget = Number(trip?.budget ?? trip?.totalBudget ?? 0);
      const budget = Number.isFinite(rawBudget) ? rawBudget : 0;
      const normalizedTrip = {
        ...trip,
        budget,
        totalBudget: typeof trip?.totalBudget === "number" ? trip.totalBudget : void 0,
        participants: ensureParticipants(trip.participants),
        weatherPreview: trip.weatherPreview ?? null
      };
      const days = daysUntilTrip(trip?.startDate);
      const within14Days = days >= 0 && days <= 14;
      const weatherUpdatedAt = trip?.weatherPreview?.updatedAt ? new Date(trip.weatherPreview.updatedAt).getTime() : 0;
      const isWeatherStale = Date.now() - weatherUpdatedAt > WEATHER_STALE_MS;
      if (within14Days && (!trip.weatherPreview || isWeatherStale)) {
        const fresh = await fetchWeatherPreview(
          trip?.destinationLat ?? trip?.latitude,
          trip?.destinationLon ?? trip?.longitude,
          trip?.startDate
        );
        if (fresh) {
          await updateTrip(trip.id, { weatherPreview: fresh }, userId);
          normalizedTrip.weatherPreview = fresh;
        } else if (!trip.weatherPreview) {
          normalizedTrip.weatherPreview = {
            description: "Keine Wetterdaten verfuegbar",
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
      }
      if (!normalizedTrip.heroImageUrl) {
        const heroMeta = await fetchHeroImageForDestination({
          destinationName: normalizedTrip.destinationName,
          latitude: normalizedTrip.latitude ?? normalizedTrip.destinationLat,
          longitude: normalizedTrip.longitude ?? normalizedTrip.destinationLon,
          cityName: normalizedTrip.cityName,
          countryName: normalizedTrip.countryName
        });
        if (heroMeta?.heroImageUrl) {
          normalizedTrip.heroImageUrl = heroMeta.heroImageUrl;
          await updateTrip(trip.id, { heroImageUrl: heroMeta.heroImageUrl }, userId);
        }
      }
      return normalizedTrip;
    }));
    return json(normalized);
  } catch (err) {
    console.error("Fehler in GET /api/trips", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
async function POST({ request, locals }) {
  try {
    const userId = locals.userId;
    if (!userId) {
      return json({ error: "Nicht eingeloggt" }, { status: 401 });
    }
    const body = await request.json();
    const { valid, errors } = validateTripPayload(body);
    if (!valid) {
      return json({ errors }, { status: 400 });
    }
    const payload = {
      name: body.name?.trim(),
      title: body.title?.trim(),
      destinationName: body.destinationName?.trim(),
      destinationLat: body.destinationLat,
      destinationLon: body.destinationLon,
      destinationCountry: body.destinationCountry ?? null,
      latitude: body.latitude,
      longitude: body.longitude,
      cityName: body.cityName ?? null,
      countryName: body.countryName ?? null,
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status,
      budget: body.budget,
      totalBudget: body.totalBudget,
      currency: body.currency,
      participants: body.participants,
      weatherPreview: null,
      heroImageUrl: null
    };
    const heroMeta = await fetchHeroImageForDestination({
      destinationName: payload.destinationName,
      latitude: payload.latitude ?? payload.destinationLat,
      longitude: payload.longitude ?? payload.destinationLon,
      cityName: payload.cityName,
      countryName: payload.countryName
    });
    payload.heroImageUrl = heroMeta.heroImageUrl ?? null;
    payload.cityName = payload.cityName ?? heroMeta.cityName ?? null;
    payload.countryName = payload.countryName ?? heroMeta.countryName ?? null;
    const trip = await createTrip(payload, userId);
    return json({
      ...trip,
      participants: ensureParticipants(trip.participants)
    }, { status: 201 });
  } catch (err) {
    console.error("Fehler in POST /api/trips", err);
    return json(
      {
        error: "Internal server error",
        details: String(err && err.message ? err.message : err)
      },
      { status: 500 }
    );
  }
}
export {
  GET,
  POST
};
