import { db } from '$lib/server/db/index.js';
import { subject, staff, course, yearLevel, academicTerm } from '$lib/server/db/schema/schema.js';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

// Helper to check session - Fixed authentication logic
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

// Get all subjects, with optional filters
export const GET: RequestHandler = async ({ cookies, url }) => {
  try {
    await requireAuth(cookies);

    // Get query params
    const yearLevelId = url.searchParams.get('yearLevelId');

    // Build where clause
    const filters = [];
    if (yearLevelId) filters.push(eq(subject.yearLevelId, yearLevelId));

    let subjects;
    if (filters.length > 0) {
      subjects = await db.select().from(subject).where(and(...filters));
    } else {
      subjects = await db.select().from(subject);
    }

    return new Response(JSON.stringify(subjects), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('GET /api/subjects error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Add a new subject
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    await requireAuth(cookies);

    let data;
    try {
      data = await request.json();
    } catch (parseError) {
      return new Response(JSON.stringify({ error: 'Invalid JSON data' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields
    if (!data.code || !data.name || !data.yearLevelId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: code, name, yearLevelId',
        received: data
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate ID if not provided
    const subjectData = {
      id: data.id || crypto.randomUUID(),
      code: data.code,
      name: data.name,
      units: data.units || 3,
      yearLevelId: data.yearLevelId
    };

    try {
      const [inserted] = await db.insert(subject).values(subjectData).returning();
      return new Response(JSON.stringify(inserted), { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (dbError: any) {
      console.error('Database insert error:', dbError);
      if (dbError.message && dbError.message.includes('UNIQUE constraint failed')) {
        return new Response(JSON.stringify({ 
          error: 'Subject code already exists. Please use a different code.' 
        }), { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ 
        error: 'Failed to create subject',
        details: dbError.message
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('POST /api/subjects error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Update a subject
export const PATCH: RequestHandler = async ({ request, cookies }) => {
  try {
    await requireAuth(cookies);
    
    const data = await request.json();
    if (!data.id) {
      return new Response(JSON.stringify({ error: 'Missing subject id' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    try {
      const [updated] = await db.update(subject).set(data).where(eq(subject.id, data.id)).returning();
      if (!updated) {
        return new Response(JSON.stringify({ error: 'Subject not found' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify(updated), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to update subject' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('PATCH /api/subjects error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Delete a subject
export const DELETE: RequestHandler = async ({ request, cookies }) => {
  try {
    await requireAuth(cookies);
    
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing subject id' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    try {
      const [deleted] = await db.delete(subject).where(eq(subject.id, id)).returning();
      if (!deleted) {
        return new Response(JSON.stringify({ error: 'Subject not found' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (dbError) {
      console.error('Database delete error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to delete subject' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('DELETE /api/subjects error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};