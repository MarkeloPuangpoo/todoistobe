'use server';

import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

// In-memory fallback for local development without Redis/KV credentials
const devStorage = new Map<string, any>();

export async function shareBoardData(data: any) {
    const code = nanoid(6).toUpperCase();
    const EXPIRE_SECONDS = 1800; // 30 minutes

    try {
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            await kv.set(`share:${code}`, data, { ex: EXPIRE_SECONDS });
        } else {
            console.warn('KV credentials not found. Using in-memory storage (Dev Mode).');
            devStorage.set(code, { data, expires: Date.now() + EXPIRE_SECONDS * 1000 });
        }
        return { success: true, code };
    } catch (error) {
        console.error('Share Error:', error);
        return { success: false, message: 'Failed to generate share code.' };
    }
}

export async function getSharedData(code: string) {
    const normalizedCode = code.toUpperCase().trim();

    try {
        let data;

        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            data = await kv.get(`share:${normalizedCode}`);
        } else {
            console.warn('KV credentials not found. Checking in-memory storage (Dev Mode).');
            const record = devStorage.get(normalizedCode);
            if (record && record.expires > Date.now()) {
                data = record.data;
            } else {
                devStorage.delete(normalizedCode); // Clean up expired
                data = null;
            }
        }

        if (!data) {
            return { success: false, message: 'Invalid or expired code.' };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Import Error:', error);
        return { success: false, message: 'Failed to retrieve data.' };
    }
}
