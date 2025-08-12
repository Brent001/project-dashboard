import { db } from '$lib/server/db/index.js';
import { staff } from '$lib/server/db/schema/schema.js';
import type { RequestHandler } from '@sveltejs/kit';
import { encrypt, decrypt } from '$lib/crypto/crypto.js';
import bcrypt from 'bcrypt';
import { eq, or } from 'drizzle-orm';

// Helper to check session
function requireAuth(cookies: import('@sveltejs/kit').Cookies) {
  const session = cookies.get('session');
  if (!session) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  return session;
}

// Get all staff (excluding sensitive info)
export const GET: RequestHandler = async ({ cookies }) => {
  try {
    requireAuth(cookies);
    
    // Select available fields and add default values for missing ones
    const rawStaffList = await db
      .select({
        id: staff.id,
        username: staff.username,
        email: staff.email,
        role: staff.role,
        pictureId: staff.pictureId,
        pictureUrl: staff.pictureUrl,
        isActive: staff.isActive
      })
      .from(staff);

    // Transform the data to match expected client structure
    const staffList = rawStaffList.map(s => ({
      ...s,
      firstName: null, // Default since not in schema
      lastName: null,  // Default since not in schema
      createdAt: new Date(), // Default date
      updatedAt: new Date()  // Default date
    }));

    // Encrypt the entire payload
    const encryptedPayload = encrypt(JSON.stringify(staffList));

    return new Response(JSON.stringify({ encryptedData: encryptedPayload }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('GET /api/staff Error:', err);
    return new Response(JSON.stringify({ error: 'An internal error occurred' }), { status: 500 });
  }
};

// Add new staff
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    requireAuth(cookies);
    const body = await request.json();
    
    if (!body.encryptedData) {
      return new Response(JSON.stringify({ message: 'Encrypted payload is missing.' }), { status: 400 });
    }

    const decryptedPayload = decrypt(body.encryptedData);
    const { username, email, role, password } = JSON.parse(decryptedPayload);

    if (!username || !email || !role || !password) {
      return new Response(JSON.stringify({ message: 'Missing required fields.' }), { status: 400 });
    }

    const existingUser = await db.select({ id: staff.id }).from(staff)
      .where(or(eq(staff.username, username), eq(staff.email, email)))
      .get();

    if (existingUser) {
      return new Response(JSON.stringify({ message: 'Username or email already exists.' }), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(staff).values({
      username,
      email,
      role,
      password: hashedPassword,
      isActive: true
    });

    return new Response(JSON.stringify({ message: 'Staff created successfully' }), { status: 201 });

  } catch (err) {
    if (err instanceof Error && err.message.includes('decrypt')) {
      return new Response(JSON.stringify({ message: 'Invalid payload.' }), { status: 400 });
    }
    if (err instanceof Response) return err;
    console.error('POST /api/staff Error:', err);
    return new Response(JSON.stringify({ message: 'Failed to create staff.' }), { status: 500 });
  }
};