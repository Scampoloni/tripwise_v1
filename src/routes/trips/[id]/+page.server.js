// src/routes/trips/[id]/+page.server.js
import { error } from '@sveltejs/kit';
import { getTripById, getExpensesForTrip } from '$lib/server/db';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
  const userId = locals.userId;
  const tripId = params.id;

  if (!userId) {
    throw error(401, 'Nicht eingeloggt');
  }

  if (!tripId) {
    throw error(400, 'Trip ID fehlt');
  }

  const trip = await getTripById(tripId, userId);

  if (!trip) {
    throw error(404, 'Trip nicht gefunden');
  }

  // Immer ein expenses-Array bereitstellen und serverseitig befuellen.
  // getExpensesForTrip liefert bereits Objekte im ApiExpense/StoreExpense-Format.
  const expenses = await getExpensesForTrip(tripId);
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  return {
    trip: {
      ...trip,
      expenses: safeExpenses
    }
  };
}
