// src/routes/api/db-test/+server.js
import { json } from '@sveltejs/kit';
import { getTrips } from '$lib/server/db';

export async function GET() {
  try {
    const trips = await getTrips();
    return json({
      ok: true,
      count: trips.length,
      sample: trips[0] || null,
    });
  } catch (error) {
    console.error('DB Test Fehler', error);
    return json(
      { ok: false, error: 'DB Verbindung fehlgeschlagen' },
      { status: 500 }
    );
  }
}
