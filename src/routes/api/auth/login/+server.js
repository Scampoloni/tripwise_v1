import { json } from '@sveltejs/kit';
import { getUserByEmail } from '$lib/server/db';

export async function POST({ request, cookies }) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = typeof email === 'string' ? email.trim() : '';

    if (!cleanEmail || !password) {
      return json({ error: 'Email und Passwort erforderlich' }, { status: 400 });
    }

    const user = await getUserByEmail(cleanEmail);
    if (!user || user.password !== password) {
      return json({ error: 'Ungueltige Login Daten' }, { status: 401 });
    }

    cookies.set('tw_user', user.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return json({ id: user.id, email: user.email, displayName: user.displayName });
  } catch (err) {
    console.error('Login Fehler', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
