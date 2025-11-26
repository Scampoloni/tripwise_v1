import { json } from '@sveltejs/kit';
import { getUserByEmail, createUser } from '$lib/server/db';

export async function POST({ request, cookies }) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email und Passwort erforderlich' }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return json({ error: 'User existiert bereits' }, { status: 400 });
    }

    const user = await createUser({ email, password });

    // simples Cookie mit userId setzen
    cookies.set('tw_user', user.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 Tage
    });

    return json({ id: user.id, email: user.email });
  } catch (err) {
    console.error('Register Fehler', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
