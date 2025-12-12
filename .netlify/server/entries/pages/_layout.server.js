import { redirect } from "@sveltejs/kit";
import { r as getUserById } from "../../chunks/db.js";
async function load({ locals, url }) {
  const userId = locals.userId;
  const isAuthPage = url.pathname.startsWith("/login");
  if (!userId && !isAuthPage) {
    throw redirect(302, "/login");
  }
  if (userId && isAuthPage) {
    throw redirect(302, "/");
  }
  let user = null;
  if (userId) {
    try {
      user = await getUserById(userId);
    } catch (err) {
      console.warn("Unable to load user profile", err);
    }
  }
  return {
    userId,
    user
  };
}
export {
  load
};
