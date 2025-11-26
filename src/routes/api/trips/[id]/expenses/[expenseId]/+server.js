// src/routes/api/trips/[id]/expenses/[expenseId]/+server.js
import { json } from '@sveltejs/kit';
import { deleteExpenseForTrip } from '$lib/server/db';

export async function DELETE({ params }) {
  const tripId = params.id;
  const expenseId = params.expenseId;

  try {
    const ok = await deleteExpenseForTrip(tripId, expenseId);

    if (!ok) {
      return json({ error: 'Expense nicht gefunden' }, { status: 404 });
    }

    return json({ success: true });
  } catch (err) {
    console.error('Fehler in DELETE /api/trips/[id]/expenses/[expenseId]', err);
    return json(
      {
        error: 'Internal server error',
        details: String(err && err.message ? err.message : err)
      },
      { status: 500 }
    );
  }
}
