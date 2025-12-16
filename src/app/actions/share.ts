'use server';

import { nanoid } from 'nanoid';
import { createClient } from '@/utils/supabase/server'; // เรียกใช้ supabase client ที่มีอยู่

export async function shareBoardData(data: any) {
    const code = nanoid(6).toUpperCase();
    const EXPIRE_SECONDS = 1800; // 30 นาที

    try {
        const supabase = await createClient();

        // คำนวณเวลาหมดอายุ
        const expiresAt = new Date(Date.now() + EXPIRE_SECONDS * 1000).toISOString();

        // บันทึกลง Supabase
        const { error } = await supabase
            .from('shared_boards')
            .insert({
                code: code,
                data: data,
                expires_at: expiresAt
            });

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error('Database insert failed');
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
        const supabase = await createClient();

        // ดึงข้อมูล โดยเช็คว่ารหัสตรงกัน และเวลายังไม่หมดอายุ (expires_at > now())
        const { data: record, error } = await supabase
            .from('shared_boards')
            .select('data')
            .eq('code', normalizedCode)
            .gt('expires_at', new Date().toISOString()) // เช็คว่ายังไม่หมดอายุ
            .single();

        if (error || !record) {
            // ถ้าไม่เจอ หรือ error (แปลว่าโค้ดผิด หรือหมดอายุไปแล้ว)
            return { success: false, message: 'Invalid or expired code.' };
        }

        return { success: true, data: record.data };
    } catch (error) {
        console.error('Import Error:', error);
        return { success: false, message: 'Failed to retrieve data.' };
    }
}
