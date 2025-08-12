import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { staff } from '$lib/server/db/schema/schema.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
    try {
        const session = cookies.get('session');
        if (!session) {
            throw redirect(302, '/');
        }

        // Fetch the current user from the database
        const user = await db.select().from(staff).where(eq(staff.username, session)).get();
        if (!user) {
            cookies.delete('session', { path: '/' });
            throw redirect(302, '/');
        }

        // Fetch students from the API
        const res = await fetch('/api/students');
        if (!res.ok) {
            throw new Error('Failed to fetch students');
        }
        const students = await res.json();

        return {
            staffId: user.id,
            staffName: user.username,
            role: user.role,
            pictureUrl: user.pictureUrl ?? '',
            students
        };
    } catch (error) {
        if (error instanceof Response) {
            throw error;
        }
        cookies.delete('session', { path: '/' });
        throw redirect(302, '/');
    }
};