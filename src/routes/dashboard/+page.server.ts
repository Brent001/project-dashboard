import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { staff, student, schedule } from '$lib/server/db/schema/schema.js';
import { eq, count } from 'drizzle-orm';

export const load: PageServerLoad = async ({ cookies }) => {
    try {
        const session = cookies.get('session');
        if (!session) {
            console.log('No session cookie');
            throw redirect(302, '/');
        }

        // Find user by username from session cookie
        const user = await db.select().from(staff).where(eq(staff.username, session)).get();
        if (!user) {
            console.log('No user found for session:', session);
            cookies.delete('session', { path: '/' });
            throw redirect(302, '/');
        }

        // Get dashboard stats
        console.log('User found:', user.username);
        const [studentCountResult, scheduleCountResult, staffCountResult] = await Promise.all([
            db.select({ count: count() }).from(student),
            db.select({ count: count() }).from(schedule),
            db.select({ count: count() }).from(staff)
        ]);
        console.log('Counts:', studentCountResult, scheduleCountResult, staffCountResult);

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
        console.error('Dashboard load error:', error);
        cookies.delete('session', { path: '/' });
        throw redirect(302, '/');
    }
};