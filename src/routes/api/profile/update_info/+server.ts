import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { staff } from '$lib/server/db/schema/schema.js';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const session = cookies.get('session');
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email && !password) {
      return json({ error: 'At least one field (email or password) must be provided' }, { status: 400 });
    }

    const existingUser = await db.select({ id: staff.id, username: staff.username })
      .from(staff)
      .where(eq(staff.username, session))
      .get();

    if (!existingUser) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password; // Note: In production, hash the password

    const result = await db.update(staff)
      .set(updateData)
      .where(eq(staff.username, session))
      .returning({ id: staff.id, username: staff.username });

    if (!result.length) {
      return json({ error: 'Failed to update profile info' }, { status: 500 });
    }

    return json({
      success: true,
      message: 'Profile info updated successfully'
    });

  } catch (error: any) {
    console.error('Database update error:', error);
    return json({
      error: 'Failed to update profile info'
    }, { status: 500 });
  }
};
