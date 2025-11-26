// src/routes/api/trips/+server.js
import { json } from '@sveltejs/kit';
import { getTrips, createTrip } from '$lib/server/db';
import { validateTripPayload } from '$lib/server/validators';

const FALLBACK_PARTICIPANTS = Object.freeze([{ id: 'me', name: 'Du' }]);

function ensureParticipants(participants) {
  if (Array.isArray(participants) && participants.length > 0) {
    return participants;
  }
  return FALLBACK_PARTICIPANTS.map((item) => ({ ...item }));
}

export async function GET({ locals }) {
  const userId = locals.userId;

  if (!userId) {
    return json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  try {
    const trips = await getTrips(userId);
    const normalized = trips.map((trip) => ({
      ...trip,
      participants: ensureParticipants(trip.participants)
    }));
    return json(normalized);
  } catch (err) {
    console.error('Fehler in GET /api/trips', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST({ request, locals }) {
  try {
    const userId = locals.userId;
    if (!userId) {
      return json({ error: 'Nicht eingeloggt' }, { status: 401 });
    }

    const body = await request.json();
    const { valid, errors } = validateTripPayload(body);

    if (!valid) {
      return json({ errors }, { status: 400 });
    }

    const trip = await createTrip(body, userId);
    return json({
      ...trip,
      participants: ensureParticipants(trip.participants)
    }, { status: 201 });
  } catch (err) {
    console.error('Fehler in POST /api/trips', err);
    return json(
      {
        error: 'Internal server error',
        details: String(err && err.message ? err.message : err)
      },
      { status: 500 }
    );
  }
}
