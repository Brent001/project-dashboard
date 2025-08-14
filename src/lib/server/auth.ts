import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db/index.js';
import * as table from '$lib/server/db/schema/schema.js';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    const token = encodeBase64url(bytes);
    return token;
}

export async function createSession(token: string, userId: string) {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const expiresAt = new Date(Date.now() + DAY_IN_MS * 30).toISOString();
    const createdAt = new Date().toISOString();
    const session = {
        id: sessionId,
        userId,
        expiresAt,
        createdAt
    };
    await db.insert(table.session).values(session);
    return session;
}

export async function validateSessionToken(token: string) {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const [result] = await db
        .select({
            user: { id: table.staff.id, username: table.staff.username },
            session: table.session
        })
        .from(table.session)
        .innerJoin(table.staff, eq(table.session.userId, table.staff.id))
        .where(eq(table.session.id, sessionId));

    if (!result) {
        return { session: null, user: null };
    }
    const { session, user } = result;

    const sessionExpired = Date.now() >= new Date(session.expiresAt).getTime();
    if (sessionExpired) {
        if (typeof session.id === 'string') {
            await db.delete(table.session).where(eq(table.session.id, session.id));
        }
        return { session: null, user: null };
    }

    const renewSession = Date.now() >= new Date(session.expiresAt).getTime() - DAY_IN_MS * 15;
    if (renewSession) {
        session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30).toISOString();
        if (typeof session.id === 'string') {
            await db
                .update(table.session)
                .set({ expiresAt: session.expiresAt })
                .where(eq(table.session.id, session.id));
        }
    }

    return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string | null) {
    if (!sessionId) return;
    await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: string) {
    event.cookies.set(sessionCookieName, token, {
        expires: new Date(expiresAt),
        path: '/'
    });
}

export function deleteSessionTokenCookie(event: RequestEvent) {
    event.cookies.delete(sessionCookieName, {
        path: '/'
    });
}
