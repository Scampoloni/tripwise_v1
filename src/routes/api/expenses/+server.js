// src/routes/api/expenses/+server.js
import { json } from '@sveltejs/kit';
import { createExpense } from '$lib/server/db';
import { validateExpensePayload } from '$lib/server/validators';

export async function POST({ request, params }) {
  try {
    const body = await request.json();
    const tripId = body.tripId || params?.id;

    if (!tripId) {
      return json({ error: 'tripId ist Pflicht' }, { status: 400 });
    }

    const { valid, errors } = validateExpensePayload(body);
    if (!valid) {
      return json({ errors }, { status: 400 });
    }

    const expense = await createExpense(tripId, {
      amount: body.amount,
      currency: body.currency,
      category: body.category,
      date: body.date,
      description: body.description,
      paidByParticipantId: body.paidByParticipantId,
      splitBetweenAll: body.splitBetweenAll
    });

    return json(expense, { status: 201 });
  } catch (err) {
    console.error('Fehler in POST /api/expenses', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
