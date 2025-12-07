import { redirect } from '@sveltejs/kit';
import { getUserById } from '$lib/server/db';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, url }) {
  const userId = locals.userId;
  const isAuthPage = url.pathname.startsWith('/login');

  if (!userId && !isAuthPage) {
    throw redirect(302, '/login');
  }

  if (userId && isAuthPage) {
    throw redirect(302, '/');
  }

  let user = null;
  if (userId) {
    try {
      user = await getUserById(userId);
    } catch (err) {
      console.warn('Unable to load user profile', err);
    }
  }

  return {
    userId,
    user
  };
}
