import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { staff } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
    const session = cookies.get('session');
    if (!session) {
        throw redirect(302, '/');
    }

    // Fetch the current staff user by username
    const user = await db.select().from(staff).where(eq(staff.username, session)).get();

    if (!user) {
        cookies.delete('session', { path: '/' });
        throw redirect(302, '/');
    }

    let pictureUrl: string | null = null;
    if (user.pictureId) {
        // Call the API to get the Cloudinary image URL
        const res = await fetch(`/api/pic_api?public_id=${encodeURIComponent(user.pictureId)}`);
        if (res.ok) {
            const data = await res.json();
            pictureUrl = data.url ?? null;
        }
    }

    return {
        staffName: user.username,
        role: user.role,
        pictureUrl
    };
};