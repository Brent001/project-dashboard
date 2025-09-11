import { db } from '$lib/server/db/index.js';
import { student } from '$lib/server/db/schema/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

// GET /api/students/view/[id]
export const GET: RequestHandler = async ({ params, cookies }) => {
  try {
    // Optional: requireAuth(cookies); // Uncomment if you want auth
    const studNo = params.id;
    if (!studNo) {
      return new Response(JSON.stringify({ error: 'Missing student ID' }), { status: 400 });
    }
    const result = await db.select().from(student).where(eq(student.studNo, studNo));
    if (result.length === 0) {
      return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ student: result[0] }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};