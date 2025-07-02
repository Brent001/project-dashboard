import { db } from '$lib/server/db';
import { staff } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
  const session = cookies.get('session');
  if (!session) {
    return new Response(JSON.stringify({ error: 'No session' }), { status: 401 });
  }

  // Find the staff by username (or use id if that's what you store in the cookie)
  const user = await db.select().from(staff).where(eq(staff.username, session)).get();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
  }

  return new Response(
    JSON.stringify({
      username: user.username,
      role: user.role
    }),
    { status: 200 }
  );
};