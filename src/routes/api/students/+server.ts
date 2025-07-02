import { db } from '$lib/server/db';
import { student } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

// Get all students
export const GET: RequestHandler = async () => {
  const students = await db.select().from(student);
  return new Response(JSON.stringify(students), { status: 200 });
};

// Add a new student
export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  // You may want to validate data here
  const [newStudent] = await db.insert(student).values(data).returning();
  return new Response(JSON.stringify(newStudent), { status: 201 });
};

// Update a student
export const PATCH: RequestHandler = async ({ request }) => {
  const data = await request.json();
  if (!data.id) {
    return new Response(JSON.stringify({ error: 'Missing student id' }), { status: 400 });
  }
  const [updated] = await db.update(student).set(data).where(eq(student.id, data.id)).returning();
  if (!updated) {
    return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
  }
  return new Response(JSON.stringify(updated), { status: 200 });
};

// Delete a student
export const DELETE: RequestHandler = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing student id' }), { status: 400 });
  }
  const [deleted] = await db.delete(student).where(eq(student.id, id)).returning();
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};