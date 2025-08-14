import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { staff } from '$lib/server/db/schema/schema.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ cookies }) => {
    const session = cookies.get('session');
    if (!session) {
        throw redirect(302, '/');
    }

    try {
        // Fetch the current user from the database
        const user = await db
            .select()
            .from(staff)
            .where(eq(staff.username, session))
            .get();

        if (!user) {
            cookies.delete('session', { path: '/' });
            throw redirect(302, '/');
        }

        return {
            staffId: user.id,
            staffName: user.username,
            role: user.role,
            pictureUrl: user.pictureUrl ?? ''
        };
    } catch {
        cookies.delete('session', { path: '/' });
        throw redirect(302, '/');
    }
};