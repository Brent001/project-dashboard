import type { PageServerLoad } from './$types.js';
import { db } from '$lib/server/db/index.js';
import { staff } from '$lib/server/db/schema/schema.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');
  if (!session) {
    throw new Response('Unauthorized', { status: 401 });
  }

  // Get current user info
  const user = await db.select().from(staff).where(eq(staff.username, session)).get();
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  return {
    staffId: user.id,
    staffName: user.username,
    role: user.role,
    pictureUrl: user.pictureUrl ?? ''
  };
};