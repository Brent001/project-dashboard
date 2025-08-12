import { db } from '$lib/server/db/index.js';
import { staff } from '$lib/server/db/schema/schema.js';
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
    // Always return a generic error to avoid leaking info
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
  }

  // Only return non-sensitive info
  return new Response(
    JSON.stringify({
      username: user.username,
      role: user.role
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  );
};