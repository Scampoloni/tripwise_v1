// src/routes/api/tripsplit/+server.js
import { json } from '@sveltejs/kit';
import { getTripSplitGroups, createTripSplitGroup } from '$lib/server/db';

/**
 * GET /api/tripsplit - Alle Gruppen des Users holen
 */
export async function GET({ locals }) {
  const userId = locals.userId;

  if (!userId) {
    return json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  try {
    const groups = await getTripSplitGroups(userId);
    return json(groups);
  } catch (err) {
    console.error('Fehler in GET /api/tripsplit', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/tripsplit - Neue Gruppe erstellen
 */
export async function POST({ request, locals }) {
  const userId = locals.userId;

  if (!userId) {
    return json({ error: 'Nicht eingeloggt' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return json({ error: 'Gruppenname ist erforderlich' }, { status: 400 });
    }

    const group = await createTripSplitGroup(
      {
        name: body.name.trim(),
        participants: body.participants || [],
        expenses: body.expenses || []
      },
      userId
    );

    if (!group) {
      return json({ error: 'Gruppe konnte nicht erstellt werden' }, { status: 500 });
    }

    return json(group, { status: 201 });
  } catch (err) {
    console.error('Fehler in POST /api/tripsplit', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
