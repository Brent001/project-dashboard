import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { staff } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const session = cookies.get('session');
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { pictureId, pictureUrl } = body;

    if (!pictureId || !pictureUrl) {
      return json({ error: 'Missing pictureId or pictureUrl' }, { status: 400 });
    }

    const existingUser = await db.select({ id: staff.id, username: staff.username })
      .from(staff)
      .where(eq(staff.username, session))
      .get();

    if (!existingUser) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    const result = await db.update(staff)
      .set({ pictureId, pictureUrl })
      .where(eq(staff.username, session))
      .returning({ id: staff.id, username: staff.username });

    if (!result.length) {
      return json({ error: 'Failed to update profile picture' }, { status: 500 });
    }

    return json({
      success: true,
      message: 'Profile picture updated successfully',
      pictureId,
      pictureUrl
    });

  } catch (error: any) {
    console.error('Database update error:', error);
    return json({
      error: 'Failed to update profile picture'
    }, { status: 500 });
  }
};

// GET endpoint to retrieve current profile picture
export const GET: RequestHandler = async ({ cookies }) => {
  const session = cookies.get('session');
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await db.select({
      pictureId: staff.pictureId,
      pictureUrl: staff.pictureUrl
    })
      .from(staff)
      .where(eq(staff.username, session))
      .get();

    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    return json({
      success: true,
      pictureId: user.pictureId,
      pictureUrl: user.pictureUrl,
      hasProfilePicture: !!user.pictureId
    });

  } catch (error: any) {
    console.error('Database query error:', error);
    return json({
      error: 'Failed to retrieve profile picture'
    }, { status: 500 });
  }
};