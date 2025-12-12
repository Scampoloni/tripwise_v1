import { json } from "@sveltejs/kit";
import { n as getTripById, l as updateTrip, o as deleteTrip } from "../../../../../chunks/db.js";
import { f as fetchHeroImageForDestination } from "../../../../../chunks/heroImage.js";
async function GET({ params, locals }) {
  const userId = locals.userId;
  if (!userId) {
    return json({ error: "Nicht eingeloggt" }, { status: 401 });
  }
  const trip = await getTripById(params.id, userId);
  if (!trip) {
    return json({ error: "Trip nicht gefunden oder nicht erlaubt" }, { status: 404 });
  }
  return json(trip);
}
async function PATCH({ params, request, locals }) {
  const userId = locals.userId;
  if (!userId) {
    return json({ error: "Nicht eingeloggt" }, { status: 401 });
  }
  const data = await request.json();
  if (data.destinationName || data.latitude !== void 0 || data.longitude !== void 0 || data.destinationLat !== void 0 || data.destinationLon !== void 0) {
    const heroMeta = await fetchHeroImageForDestination({
      destinationName: data.destinationName,
      latitude: data.latitude ?? data.destinationLat,
      longitude: data.longitude ?? data.destinationLon,
      cityName: data.cityName,
      countryName: data.countryName
    });
    data.heroImageUrl = heroMeta.heroImageUrl ?? null;
    if (heroMeta.cityName && data.cityName === void 0) data.cityName = heroMeta.cityName;
    if (heroMeta.countryName && data.countryName === void 0) data.countryName = heroMeta.countryName;
  }
  const trip = await updateTrip(params.id, data, userId);
  if (!trip) {
    return json({ error: "Trip nicht gefunden oder nicht erlaubt" }, { status: 404 });
  }
  return json(trip);
}
async function DELETE({ params, locals }) {
  const userId = locals.userId;
  if (!userId) {
    return json({ error: "Nicht eingeloggt" }, { status: 401 });
  }
  const ok = await deleteTrip(params.id, userId);
  if (!ok) {
    return json({ error: "Trip nicht gefunden oder nicht erlaubt" }, { status: 404 });
  }
  return json({ success: true });
}
export {
  DELETE,
  GET,
  PATCH
};
