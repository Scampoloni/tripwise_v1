import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
  cookies.delete('tw_user', { path: '/' });
  return json({ success: true });
}
