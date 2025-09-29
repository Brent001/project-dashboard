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

// POST: Create a new academic term
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    await requireAuth(cookies);

    const data = await request.json();
    const { name, startDate, endDate, isActive } = data;

    // Validation
    if (!name || !startDate || !endDate) {
      return json({ error: 'Missing required fields: name, startDate, endDate' }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return json({ error: 'Invalid date format' }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (start >= end) {
      return json({ error: 'Start date must be before end date' }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If this term is being set as active, deactivate all other terms
    if (isActive) {
      await db
        .update(academicTerm)
        .set({ isActive: false })
        .where(eq(academicTerm.isActive, true));
    }

    // Generate unique ID
    const termId = `term_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert new academic term
    await db.insert(academicTerm).values({
      id: termId,
      name,
      startDate,
      endDate,
      isActive: isActive || false
    });

    // Fetch the created term
    const newTerm = await db
      .select()
      .from(academicTerm)
      .where(eq(academicTerm.id, termId))
      .get();

    return json({ 
      success: true, 
      message: 'Academic term created successfully',
      term: newTerm
    }, {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('POST /api/academic-terms error:', err);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT: Update an academic term
export const PUT: RequestHandler = async ({ request, cookies }) => {
  try {
    await requireAuth(cookies);

    const data = await request.json();
    const { id, name, startDate, endDate, isActive } = data;

    if (!id) {
      return json({ error: 'Missing term ID' }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if term exists
    const existingTerm = await db
      .select()
      .from(academicTerm)
      .where(eq(academicTerm.id, id))
      .get();

    if (!existingTerm) {
      return json({ error: 'Academic term not found' }, { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If setting as active, deactivate all others first
    if (isActive && !existingTerm.isActive) {
      await db
        .update(academicTerm)
        .set({ isActive: false })
        .where(eq(academicTerm.isActive, true));
    }

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Validate dates if provided
    if (startDate || endDate) {
      const start = new Date(startDate || existingTerm.startDate);
      const end = new Date(endDate || existingTerm.endDate);
      
      if (start >= end) {
        return json({ error: 'Start date must be before end date' }, { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Update term
    await db
      .update(academicTerm)
      .set(updateData)
      .where(eq(academicTerm.id, id));

    // Fetch updated term
    const updatedTerm = await db
      .select()
      .from(academicTerm)
      .where(eq(academicTerm.id, id))
      .get();

    return json({ 
      success: true, 
      message: 'Academic term updated successfully',
      term: updatedTerm
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('PUT /api/academic-terms error:', err);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE: Delete an academic term
export const DELETE: RequestHandler = async ({ request, cookies }) => {
  try {
    await requireAuth(cookies);

    const { id } = await request.json();

    if (!id) {
      return json({ error: 'Missing term ID' }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if term exists
    const existingTerm = await db
      .select()
      .from(academicTerm)
      .where(eq(academicTerm.id, id))
      .get();

    if (!existingTerm) {
      return json({ error: 'Academic term not found' }, { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete the term
    await db
      .delete(academicTerm)
      .where(eq(academicTerm.id, id));

    return json({ 
      success: true, 
      message: 'Academic term deleted successfully'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('DELETE /api/academic-terms error:', err);
    return json({ error: 'Internal server error' }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};