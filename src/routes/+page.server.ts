import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { staff } from '$lib/server/db/schema/schema.js';

export const load: PageServerLoad = async () => {
    // Check if any staff exists
    const user = await db.select().from(staff).limit(1).get();
    if (!user) throw redirect(302, '/setup');
    // ...existing code...
    return {};
};