import type { PageServerLoad } from './$types.js';
import { db } from '$lib/server/db/index.js';
import { staff } from '$lib/server/db/schema/schema.js';
import { eq } from 'drizzle-orm';
import { encrypt } from '$lib/crypto/crypto.js';

export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');
  if (!session) {
    throw new Response('Unauthorized', { status: 401 });
  }

  // Get current user info
  const user = await db.select().from(staff).where(eq(staff.username, session)).get();
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  // Get all staff directly from database (non-sensitive fields only)
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
    firstName: null, // Default since not in current schema
    lastName: null,  // Default since not in current schema
    createdAt: new Date().toISOString(), // Default date as ISO string
    updatedAt: new Date().toISOString()  // Default date as ISO string
  }));

  // Encrypt the staff list
  const encryptedData = encrypt(JSON.stringify(staffList));

  return {
    staffId: user.id,
    staffName: user.username,
    role: user.role,
    pictureUrl: user.pictureUrl,
    encryptedData
  };
};