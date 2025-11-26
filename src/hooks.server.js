/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const userId = event.cookies.get('tw_user') || null;
  event.locals.userId = userId;

  return resolve(event);
}
