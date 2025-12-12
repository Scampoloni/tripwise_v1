import { json } from "@sveltejs/kit";
import { a as getTrips } from "../../../../chunks/db.js";
async function GET() {
  try {
    const trips = await getTrips();
    return json({
      ok: true,
      count: trips.length,
      sample: trips[0] || null
    });
  } catch (error) {
    console.error("DB Test Fehler", error);
    return json(
      { ok: false, error: "DB Verbindung fehlgeschlagen" },
      { status: 500 }
    );
  }
}
export {
  GET
};
