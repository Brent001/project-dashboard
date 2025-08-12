import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { staff } from '$lib/server/db/schema/schema.js';
import { eq, or } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';

// Require authentication for adding staff (optional, uncomment if needed)
// function requireAuth(cookies: import('@sveltejs/kit').Cookies) {
//   const session = cookies.get('session');
//   if (!session) {
//     throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
//   }
//   return session;
// }

export const POST: RequestHandler = async ({ request /*, cookies*/ }) => {
  try {
    // requireAuth(cookies); // Uncomment if only admins can add staff

    const data = await request.json();

    // Validate required fields
    if (!data.username || !data.email || !data.password || !data.role) {
      return new Response(JSON.stringify({ error: 'Missing required fields.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for duplicate username or email
    const existing = await db.select().from(staff)
      .where(or(
        eq(staff.username, data.username),
        eq(staff.email, data.email)
      ))
      .get();
    if (existing) {
      return new Response(JSON.stringify({ error: 'Username or email already exists.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hash the password
    const hashedPassword = await new Argon2id().hash(data.password);

    // Prepare data for insertion
    const staffData = {
      id: crypto.randomUUID(),
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      pictureId: data.pictureId || null,
      pictureUrl: data.pictureUrl || null
    };

    // Insert new staff
    const [newStaff] = await db.insert(staff).values(staffData).returning();

    return new Response(JSON.stringify({
      success: true,
      staff: newStaff,
      message: 'Staff added successfully!'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Add staff error:', err);
    return new Response(JSON.stringify({
      error: 'Failed to add staff.',
      details: err instanceof Error ? err.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};