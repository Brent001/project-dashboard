import type { RequestHandler } from '@sveltejs/kit';

function requireAuth(cookies: import('@sveltejs/kit').Cookies) {
  const session = cookies.get('session');
  if (!session) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  return session;
}

export const POST: RequestHandler = async ({ cookies }) => {
  try {
    requireAuth(cookies);
    cookies.delete('session', { path: '/' });
    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    if (err instanceof Response) return err;
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
};