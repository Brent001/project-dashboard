import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { staff } from '$lib/server/db/schema/schema.js';

export const load: PageServerLoad = async ({ cookies }) => {
    // Check if any staff exists
    const user = await db.select().from(staff).limit(1).get();
    if (!user) throw redirect(302, '/setup');

    // Check if session cookie exists, redirect to dashboard if logged in
    const session = cookies.get('session');
    if (session) throw redirect(302, '/dashboard');

    // ...existing code...
    return {};
};