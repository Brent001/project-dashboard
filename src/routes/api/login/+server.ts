import { db } from '$lib/server/db';
import { staff } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { username, password } = await request.json();

    // Find user by username
    const user = await db.select().from(staff).where(eq(staff.username, username)).get();
    if (!user) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    let valid = false;
    try {
        valid = await new Argon2id().verify(user.password, password);
    } catch (err: any) {
        // If the hash is invalid (probably plain text), check plain password
        if (
            err?.message?.includes('missing field') &&
            user.password === password
        ) {
            // Hash the plain password and update in DB
            const hashedPassword = await new Argon2id().hash(password);
            await db.update(staff)
                .set({ password: hashedPassword })
                .where(eq(staff.username, username));
            valid = true;
        } else {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }
    }

    if (!valid && user.password !== password) {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    // Set session cookie to username (secure, httpOnly, strict)
    cookies.set('session', user.username, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: true, // Only send cookie over HTTPS
        maxAge: 60 * 60 * 24 // 1 day
    });

    return new Response(JSON.stringify({
        success: true,
        username: user.username,
        role: user.role
    }));
};