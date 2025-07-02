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
    const { url, public_id } = body;

    // Validate that at least one of url or public_id is provided
    if (!url && !public_id) {
      return json({ error: 'No URL or public_id provided' }, { status: 400 });
    }

    // Store the public_id if provided, otherwise fall back to URL
    const pictureId = public_id || url;

    // Update the staff record
    const result = await db.update(staff)
      .set({ 
        pictureId,
        updatedAt: new Date() // Assuming you have an updatedAt field
      })
      .where(eq(staff.username, session));

    // Check if the update affected any rows
    if (result.changes === 0) {
      return json({ error: 'User not found or no changes made' }, { status: 404 });
    }

    return json({ 
      success: true, 
      message: 'Profile picture updated successfully',
      pictureId 
    });

  } catch (error: any) {
    console.error('Database update error:', error);
    return json({ 
      error: 'Failed to update profile picture' 
    }, { status: 500 });
  }
};

// Optional: GET endpoint to retrieve current profile picture
export const GET: RequestHandler = async ({ cookies }) => {
  const session = cookies.get('session');
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await db.select({ pictureId: staff.pictureId })
      .from(staff)
      .where(eq(staff.username, session))
      .get();

    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    return json({ 
      pictureId: user.pictureId,
      hasProfilePicture: !!user.pictureId
    });

  } catch (error: any) {
    console.error('Database query error:', error);
    return json({ 
      error: 'Failed to retrieve profile picture' 
    }, { status: 500 });
  }
};