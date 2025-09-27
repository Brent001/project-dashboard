import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { staff } from '$lib/server/db/schema/schema.js';
import { eq } from 'drizzle-orm';

// Require authentication for this endpoint
function requireAuth(cookies: import('@sveltejs/kit').Cookies) {
  const session = cookies.get('session');
  if (!session) {
    throw json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

export const GET = async ({ url, cookies }) => {
  try {
    requireAuth(cookies);

    const id = url.searchParams.get('id');
    if (!id) {
      return json({ error: 'Missing staff id' }, { status: 400 });
    }

    const user = await db.select({
      pictureUrl: staff.pictureUrl
    }).from(staff).where(eq(staff.id, id)).get();

    // Always return a valid pictureUrl, fallback to default if missing
    return json({
      pictureUrl: user?.pictureUrl || '/default-avatar.jpg'
    }, { status: 200 });

  } catch (error) {
    if (error instanceof Response) return error;
    return json({ pictureUrl: '/default-avatar.jpg' }, { status: 200 });
  }
};