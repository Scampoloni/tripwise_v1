import { json } from "@sveltejs/kit";
import { p as getExpensesForTrip, b as createExpense } from "../../../../../../chunks/db.js";
import { v as validateExpensePayload } from "../../../../../../chunks/validators.js";
async function GET({ params }) {
  const tripId = params.id;
  const expenses = await getExpensesForTrip(tripId);
  return json(expenses);
}
async function POST({ params, request }) {
  const tripId = params.id;
  const body = await request.json();
  const { valid, errors } = validateExpensePayload(body);
  if (!valid) {
    return json({ errors }, { status: 400 });
  }
  const expense = await createExpense(tripId, body);
  return json(expense, { status: 201 });
}
export {
  GET,
  POST
};
