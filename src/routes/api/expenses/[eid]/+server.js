// src/routes/api/expenses/[eid]/+server.js
import { json } from '@sveltejs/kit';
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
} from '$lib/server/db';

export async function GET({ params }) {
  const expense = await getExpenseById(params.eid);
  if (!expense) {
    return json({ error: 'Expense nicht gefunden' }, { status: 404 });
  }
  return json(expense);
}

export async function PATCH({ params, request }) {
  const body = await request.json();
  const expense = await updateExpense(params.eid, body);
  if (!expense) {
    return json({ error: 'Expense nicht gefunden' }, { status: 404 });
  }
  return json(expense);
}

export async function DELETE({ params }) {
  const ok = await deleteExpense(params.eid);
  if (!ok) {
    return json({ error: 'Expense nicht gefunden' }, { status: 404 });
  }
  return json({ success: true });
}
