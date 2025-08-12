import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { staff, student, schedule } from '$lib/server/db/schema/schema.js';
import { eq, count } from 'drizzle-orm';

export const load: PageServerLoad = async ({ cookies }) => {
    try {
        const session = cookies.get('session');
        if (!session) {
            throw redirect(302, '/');
        }

        // Find user by username from session cookie
        const user = await db.select().from(staff).where(eq(staff.username, session)).get();
        if (!user) {
            cookies.delete('session', { path: '/' });
            throw redirect(302, '/');
        }

        // Get dashboard stats
        const [studentCountResult, scheduleCountResult, staffCountResult] = await Promise.all([
            db.select({ count: count() }).from(student),
            db.select({ count: count() }).from(schedule),
            db.select({ count: count() }).from(staff)
        ]);

        const studentCount = studentCountResult[0]?.count ?? 0;
        const scheduleCount = scheduleCountResult[0]?.count ?? 0;
        const staffCount = staffCountResult[0]?.count ?? 0;

        return {
            staffId: user.id,
            staffName: user.username,
            role: user.role,
            pictureUrl: user.pictureUrl ?? '',
            studentCount,
            scheduleCount,
            staffCount
        };
    } catch (error) {
        if (error instanceof Response) {
            throw error;
        }
        console.error('Dashboard load error:', error);
        cookies.delete('session', { path: '/' });
        throw redirect(302, '/');
    }
};