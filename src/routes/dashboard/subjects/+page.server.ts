import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { staff, subject, student, schedule, academicTerm, yearLevel, course } from '$lib/server/db/schema/schema.js';
import { eq, count } from 'drizzle-orm';

export const load: PageServerLoad = async ({ cookies }) => {
    try {
        const session = cookies.get('session');
        if (!session) {
            throw redirect(302, '/');
        }

        const user = await db.select().from(staff).where(eq(staff.username, session)).get();
        if (!user) {
            cookies.delete('session', { path: '/' });
            throw redirect(302, '/');
        }

        // Get subjects
        const subjects = await db.select().from(subject);

        // Get academic terms, year levels, courses from DB
        const academicTerms = await db.select().from(academicTerm);
        const yearLevels = await db.select().from(yearLevel);
        const courses = await db.select().from(course);

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
            staffCount,
            subjects,
            academicTerms,
            yearLevels,
            courses
        };
    } catch (error) {
        cookies.delete('session', { path: '/' });
        throw redirect(302, '/');
    }
};