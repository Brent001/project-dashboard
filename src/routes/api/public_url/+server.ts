import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { staff } from '$lib/server/db/schema';
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

    if (!user || !user.pictureUrl) {
      return json({ error: 'Not found' }, { status: 404 });
    }

    return json({ pictureUrl: user.pictureUrl });
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: 'Failed to fetch profile picture' }, { status: 500 });
  }
};