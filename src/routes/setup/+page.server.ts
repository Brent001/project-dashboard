import type { PageServerLoad, Actions } from './$types.js';
import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { staff } from '$lib/server/db/schema/schema.js';

export const load: PageServerLoad = async () => {
    const user = await db.select().from(staff).limit(1).get();
    if (user) throw redirect(302, '/');
    return {};
};

export const actions: Actions = {
    default: async (event) => {
        const data = await event.request.formData();
        const username = data.get('username')?.toString().trim();
        const email = data.get('email')?.toString().trim();
        const password = data.get('password')?.toString();
        const profilePicture = data.get('profile_picture');

        if (!username || !email || !password) {
            return fail(400, { error: 'All fields required.' });
        }

        const exists = await db.select().from(staff).limit(1).get();
        if (exists) throw redirect(302, '/');

        // Upload profile picture if provided
        let pictureUrl = null;
        let pictureId = null;
        if (profilePicture && typeof profilePicture !== 'string') {
            // Use event.fetch for relative URLs
            const uploadRes = await event.fetch('/api/pic_api', {
                method: 'POST',
                body: (() => {
                    const fd = new FormData();
                    fd.append('file', profilePicture);
                    fd.append('username', username);
                    return fd;
                })()
            });
            const uploadJson = await uploadRes.json();
            if (uploadJson.success) {
                pictureUrl = uploadJson.data.url;
                pictureId = uploadJson.data.public_id;
            }
        }

        const { Argon2id } = await import('oslo/password');
        const hashedPassword = await new Argon2id().hash(password);

        await db.insert(staff).values({
            id: crypto.randomUUID(),
            username,
            email,
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            pictureId,
            pictureUrl
        });

        throw redirect(302, '/');
    }
};