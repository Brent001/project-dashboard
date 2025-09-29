import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db/index.js';
import { academicTerm, staff } from '$lib/server/db/schema/schema.js';
import { eq } from 'drizzle-orm';

// Helper to check session
async function requireAuth(cookies: import('@sveltejs/kit').Cookies) {
  const session = cookies.get('session');
  if (!session) {
    throw new Response(JSON.stringify({ error: 'No session found' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const user = await db.select().from(staff).where(eq(staff.username, session)).get();
    if (!user) {
      throw new Response(JSON.stringify({ error: 'Invalid session' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return user;
  } catch (dbError) {
    console.error('Database error during authentication:', dbError);
    throw new Response(JSON.stringify({ error: 'Authentication failed' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// GET: Fetch all academic terms
export const GET: RequestHandler = async ({ cookies }) => {
  try {
    await requireAuth(cookies);

    const terms = await db
      .select()
      .from(academicTerm)
      .all();

    // Sort by start date (newest first) and active status
    const sortedTerms = terms.sort((a, b) => {
      // Active terms first
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      // Then by date
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    return json(sortedTerms, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('GET /api/academic-terms error:', err);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};