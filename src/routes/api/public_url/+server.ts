import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { staff } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET = async ({ url }) => {
  const id = url.searchParams.get('id');
  if (!id) {
    return json({ error: 'Missing staff id' }, { status: 400 });
  }

  try {
    const user = await db.select({
      pictureUrl: staff.pictureUrl
    }).from(staff).where(eq(staff.id, id)).get();

    if (!user || !user.pictureUrl) {
      return json({ error: 'Not found' }, { status: 404 });
    }

    return json({ pictureUrl: user.pictureUrl });
  } catch (error) {
    return json({ error: 'Failed to fetch profile picture' }, { status: 500 });
  }
};