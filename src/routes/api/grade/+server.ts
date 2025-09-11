import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { grade } from '$lib/server/db/schema/schema.js';

// GET: Return all grades for viewing
export const GET: RequestHandler = async () => {
  try {
    const grades = await db.select().from(grade);
    return new Response(JSON.stringify({ grades }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch grades' }), { status: 500 });
  }
};