import { json } from "@sveltejs/kit";
import { g as getUserByEmail, c as createUser } from "../../../../../chunks/db.js";
async function POST({ request, cookies }) {
  try {
    const { email, password, displayName } = await request.json();
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!cleanEmail || !password) {
      return json({ error: "Email und Passwort erforderlich" }, { status: 400 });
    }
    const cleanDisplayName = typeof displayName === "string" && displayName.trim() ? displayName.trim().slice(0, 60) : null;
    const existing = await getUserByEmail(cleanEmail);
    if (existing) {
      return json({ error: "User existiert bereits" }, { status: 400 });
    }
    const user = await createUser({ email: cleanEmail, password, displayName: cleanDisplayName });
    cookies.set("tw_user", user.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7
      // 7 Tage
    });
    return json({ id: user.id, email: user.email, displayName: user.displayName });
  } catch (err) {
    console.error("Register Fehler", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
export {
  POST
};
