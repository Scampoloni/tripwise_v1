import { json } from "@sveltejs/kit";
async function POST({ cookies }) {
  cookies.delete("tw_user", { path: "/" });
  return json({ success: true });
}
export {
  POST
};
