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
    const normalized = trips.map((trip) => {
      const rawBudget = Number(trip?.budget ?? trip?.totalBudget ?? 0);
      const budget = Number.isFinite(rawBudget) ? rawBudget : 0;
      const normalizedTrip = {
        ...trip,
        budget,
        totalBudget: typeof trip?.totalBudget === 'number' ? trip.totalBudget : undefined,
        participants: ensureParticipants(trip.participants)
      };
      console.log('DEBUG Phase3 api/trips trip', normalizedTrip);
      return normalizedTrip;
    });
    console.log('=== RAW API /api/trips OUTPUT ===');
    console.log(JSON.stringify(normalized, null, 2));
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

    const payload = {
      name: body.name?.trim(),
      title: body.title?.trim(),
      destinationName: body.destinationName?.trim(),
      destinationLat: body.destinationLat,
      destinationLon: body.destinationLon,
      destinationCountry: body.destinationCountry ?? null,
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status,
      budget: body.budget,
      totalBudget: body.totalBudget,
      currency: body.currency,
      participants: body.participants
    };

    const trip = await createTrip(payload, userId);
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
