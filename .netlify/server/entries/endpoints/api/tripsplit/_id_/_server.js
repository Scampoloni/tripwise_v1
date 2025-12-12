import { json } from "@sveltejs/kit";
import { i as getTripSplitGroupById, j as updateTripSplitGroup, k as deleteTripSplitGroup } from "../../../../../chunks/db.js";
async function GET({ params, locals }) {
  const userId = locals.userId;
  if (!userId) {
    return json({ error: "Nicht eingeloggt" }, { status: 401 });
  }
  try {
    const group = await getTripSplitGroupById(params.id, userId);
    if (!group) {
      return json({ error: "Gruppe nicht gefunden" }, { status: 404 });
    }
    return json(group);
  } catch (err) {
    console.error("Fehler in GET /api/tripsplit/[id]", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
async function PUT({ params, request, locals }) {
  const userId = locals.userId;
  if (!userId) {
    return json({ error: "Nicht eingeloggt" }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return json({ error: "Gruppenname ist erforderlich" }, { status: 400 });
    }
    const group = await updateTripSplitGroup(
      params.id,
      {
        name: body.name.trim(),
        participants: body.participants || [],
        expenses: body.expenses || []
      },
      userId
    );
    if (!group) {
      return json({ error: "Gruppe nicht gefunden oder keine Berechtigung" }, { status: 404 });
    }
    return json(group);
  } catch (err) {
    console.error("Fehler in PUT /api/tripsplit/[id]", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
async function DELETE({ params, locals }) {
  const userId = locals.userId;
  if (!userId) {
    return json({ error: "Nicht eingeloggt" }, { status: 401 });
  }
  try {
    const deleted = await deleteTripSplitGroup(params.id, userId);
    if (!deleted) {
      return json({ error: "Gruppe nicht gefunden oder keine Berechtigung" }, { status: 404 });
    }
    return json({ success: true });
  } catch (err) {
    console.error("Fehler in DELETE /api/tripsplit/[id]", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
export {
  DELETE,
  GET,
  PUT
};
