import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { staff } from '$lib/server/db/schema/schema.js';
import { eq, or } from 'drizzle-orm';
import { decrypt } from '$lib/crypto/crypto.js';
import crypto from 'crypto';
import { Argon2id } from 'oslo/password';

interface StaffData {
  username: string;
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  pictureId?: string;
  pictureUrl?: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { encryptedData } = body;
    
    if (!encryptedData) {
      return new Response(JSON.stringify({ error: 'Missing encrypted data.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Decrypt and parse data
    let data: StaffData;
    try {
      const decryptedString = decrypt(encryptedData);
      data = JSON.parse(decryptedString);
    } catch (decryptError) {
      console.error('Decryption/parsing error:', decryptError);
      return new Response(JSON.stringify({ error: 'Invalid encrypted data format.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields
    if (!data.username || !data.email || !data.password || !data.role) {
      return new Response(JSON.stringify({ error: 'Missing required fields: username, email, password, and role are required.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Additional validation
    if (data.email && !isValidEmail(data.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (data.password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters long.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for existing user - Fixed query method
    const existing = await db.select().from(staff)
      .where(or(
        eq(staff.username, data.username),
        eq(staff.email, data.email)
      ))
      .limit(1);

    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: 'Username or email already exists.' }), { 
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hash password
    const argon2 = new Argon2id();
    const hashedPassword = await argon2.hash(data.password);

    // Create new staff record
    const newStaffData = {
      id: crypto.randomUUID(),
      username: data.username.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      role: data.role,
      firstName: data.firstName?.trim() || null,
      lastName: data.lastName?.trim() || null,
      isActive: true,
      pictureId: data.pictureId || null,
      pictureUrl: data.pictureUrl || null,
      createdAt: new Date().toISOString(), // <-- fix here
      updatedAt: new Date().toISOString()  // <-- and here
    };

    const [newStaff] = await db.insert(staff)
      .values(newStaffData)
      .returning();

    // Remove password from response
    const { password, ...safeStaffData } = newStaff;

    return new Response(JSON.stringify({
      success: true,
      staff: safeStaffData,
      message: 'Staff added successfully!'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Add staff error:', err);
    
    // Handle specific database errors
    if (err && typeof err === 'object' && 'code' in err) {
      switch (err.code) {
        case 'SQLITE_CONSTRAINT_UNIQUE':
        case '23505': // PostgreSQL unique violation
          return new Response(JSON.stringify({
            error: 'Username or email already exists.'
          }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          });
        default:
          break;
      }
    }

    return new Response(JSON.stringify({
      error: 'Failed to add staff.',
      details: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Helper function for email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}