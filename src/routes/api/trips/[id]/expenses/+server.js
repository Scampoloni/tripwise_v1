// src/routes/api/trips/[id]/expenses/+server.js
import { json } from '@sveltejs/kit';
import {
  getExpensesForTrip,
  createExpense
} from '$lib/server/db';
import { validateExpensePayload } from '$lib/server/validators';

// Alle Expenses fuer einen Trip holen
export async function GET({ params }) {
  const tripId = params.id;
  const expenses = await getExpensesForTrip(tripId);
  return json(expenses);
}

// Neue Expense fuer einen Trip anlegen
export async function POST({ params, request }) {
  const tripId = params.id;
  const body = await request.json();

  const { valid, errors } = validateExpensePayload(body);
  if (!valid) {
    return json({ errors }, { status: 400 });
  }

  const expense = await createExpense(tripId, body);
  return json(expense, { status: 201 });
}
