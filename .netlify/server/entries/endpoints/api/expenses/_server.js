import { json } from "@sveltejs/kit";
import { b as createExpense } from "../../../../chunks/db.js";
import { v as validateExpensePayload } from "../../../../chunks/validators.js";
async function POST({ request, params }) {
  try {
    const body = await request.json();
    const tripId = body.tripId || params?.id;
    if (!tripId) {
      return json({ error: "tripId ist Pflicht" }, { status: 400 });
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
    console.error("Fehler in POST /api/expenses", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
export {
  POST
};
