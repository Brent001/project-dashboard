import { db } from '$lib/server/db/index.js';
import { settings } from '$lib/server/db/schema/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

// Use Node.js crypto for UUID generation
import { randomUUID } from 'crypto';

// GET /api/settings?staffId=xxx
export const GET: RequestHandler = async ({ url }) => {
    const staffId = url.searchParams.get('staffId');
    if (!staffId) {
        return new Response(JSON.stringify({ error: 'Missing staffId' }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        const result = await db.select().from(settings).where(eq(settings.staffId, staffId)).limit(1);
        return new Response(JSON.stringify(result[0] ?? null), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch settings' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// POST /api/settings - Create new settings
export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        if (!body.staffId) {
            return new Response(JSON.stringify({ error: 'Missing staffId' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if settings already exist for this staff member
        const existing = await db.select().from(settings).where(eq(settings.staffId, body.staffId)).limit(1);
        
        if (existing.length > 0) {
            // Settings exist, update instead
            const updated = await db.update(settings)
                .set({
                    theme: body.theme ?? 'system',
                    language: body.language ?? 'en',
                    notifications: body.notifications ?? true,
                    updatedAt: new Date().toISOString()
                })
                .where(eq(settings.staffId, body.staffId))
                .returning();

            return new Response(JSON.stringify(updated[0]), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create new settings
        const [inserted] = await db.insert(settings).values({
            id: randomUUID(),
            staffId: body.staffId,
            theme: body.theme ?? 'system',
            language: body.language ?? 'en',
            notifications: body.notifications ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }).returning();

        return new Response(JSON.stringify(inserted), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error creating settings:', error);
        return new Response(JSON.stringify({ error: 'Failed to create settings' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// PUT /api/settings - Update existing settings
export const PUT: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        if (!body.staffId) {
            return new Response(JSON.stringify({ error: 'Missing staffId' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const updated = await db.update(settings)
            .set({
                theme: body.theme ?? 'system',
                language: body.language ?? 'en',
                notifications: body.notifications ?? true,
                updatedAt: new Date().toISOString()
            })
            .where(eq(settings.staffId, body.staffId))
            .returning();

        if (updated.length === 0) {
            // No existing settings found, create new one
            const [inserted] = await db.insert(settings).values({
                id: randomUUID(),
                staffId: body.staffId,
                theme: body.theme ?? 'system',
                language: body.language ?? 'en',
                notifications: body.notifications ?? true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }).returning();

            return new Response(JSON.stringify(inserted), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(updated[0]), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return new Response(JSON.stringify({ error: 'Failed to update settings' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};