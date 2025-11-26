import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals, url }) {
  const userId = locals.userId;
  const isAuthPage = url.pathname.startsWith('/login');

  if (!userId && !isAuthPage) {
    throw redirect(302, '/login');
  }

  if (userId && isAuthPage) {
    throw redirect(302, '/');
  }

  return {
    userId
  };
}
