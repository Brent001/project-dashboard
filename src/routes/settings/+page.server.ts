import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { staff } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ cookies }) => {
    const session = cookies.get('session');
    if (!session) throw redirect(302, '/');

    const user = await db.select({
        id: staff.id,
        username: staff.username,
        role: staff.role,
        pictureId: staff.pictureId,
        pictureUrl: staff.pictureUrl
    }).from(staff).where(eq(staff.username, session)).get();

    if (!user) {
        cookies.delete('session', { path: '/' });
        throw redirect(302, '/');
    }

    return {
        staffId: user.id,
        staffName: user.username,
        role: user.role,
        pictureId: user.pictureId,
        pictureUrl: user.pictureUrl
    };
};