// src/routes/api/trips/[id]/+server.js
import { json } from '@sveltejs/kit';
import {
  getTripById,
  updateTrip,
  deleteTrip
} from '$lib/server/db';
import { fetchHeroImageForDestination } from '$lib/server/heroImage';

export async function GET({ params, locals }) {
  const userId = locals.userId;

  if (!userId) {
    return json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  const trip = await getTripById(params.id, userId);
  if (!trip) {
    // Trip existiert nicht oder gehoert nicht diesem User
    return json({ error: 'Trip nicht gefunden oder nicht erlaubt' }, { status: 404 });
  }

  return json(trip);
}

export async function PATCH({ params, request, locals }) {
  const userId = locals.userId;

  if (!userId) {
    return json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  const data = await request.json();

  if (data.destinationName || data.latitude !== undefined || data.longitude !== undefined || data.destinationLat !== undefined || data.destinationLon !== undefined) {
    const heroMeta = await fetchHeroImageForDestination({
      destinationName: data.destinationName,
      latitude: data.latitude ?? data.destinationLat,
      longitude: data.longitude ?? data.destinationLon,
      cityName: data.cityName,
      countryName: data.countryName
    });

    data.heroImageUrl = heroMeta.heroImageUrl ?? null;
    if (heroMeta.cityName && data.cityName === undefined) data.cityName = heroMeta.cityName;
    if (heroMeta.countryName && data.countryName === undefined) data.countryName = heroMeta.countryName;
  }

  const trip = await updateTrip(params.id, data, userId);

  if (!trip) {
    // Trip existiert nicht oder gehoert nicht diesem User
    return json({ error: 'Trip nicht gefunden oder nicht erlaubt' }, { status: 404 });
  }

  return json(trip);
}

export async function DELETE({ params, locals }) {
  const userId = locals.userId;

  if (!userId) {
    return json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  const ok = await deleteTrip(params.id, userId);
  if (!ok) {
    // Trip existiert nicht oder gehoert nicht diesem User
    return json({ error: 'Trip nicht gefunden oder nicht erlaubt' }, { status: 404 });
  }

  return json({ success: true });
}
