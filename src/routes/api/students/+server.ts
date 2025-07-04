import { db } from '$lib/server/db';
import { student } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

// Get all students
export const GET: RequestHandler = async () => {
  const students = await db.select().from(student);
  return new Response(JSON.stringify(students), { status: 200 });
};

// Update a student
export const PATCH: RequestHandler = async ({ request }) => {
  const data = await request.json();
  if (!data.studNo) {
    return new Response(JSON.stringify({ error: 'Missing student number' }), { status: 400 });
  }
  const [updated] = await db.update(student).set(data).where(eq(student.studNo, data.studNo)).returning();
  if (!updated) {
    return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
  }
  return new Response(JSON.stringify(updated), { status: 200 });
};

// Delete a student
export const DELETE: RequestHandler = async ({ request }) => {
  const { studNo } = await request.json();
  if (!studNo) {
    return new Response(JSON.stringify({ error: 'Missing student number' }), { status: 400 });
  }
  const [deleted] = await db.delete(student).where(eq(student.studNo, studNo)).returning();
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};