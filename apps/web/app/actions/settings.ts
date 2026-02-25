'use server';

import { revalidateTag } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const SettingsSchema = z.object({
    fee_percentage: z.coerce.number().min(0).max(100),
    verification_required: z.coerce.boolean(),
    suspension_rules: z.string().transform((str) => {
        try { return JSON.parse(str); } catch { return {}; }
    }),
    email_templates: z.string().transform((str) => {
        try { return JSON.parse(str); } catch { return {}; }
    }),
    feature_flags: z.string().transform((str) => {
        try { return JSON.parse(str); } catch { return {}; }
    })
});

export async function updateSystemSettings(formData: FormData) {
    if (!supabaseUrl || !supabaseKey) throw new Error('Database not connected');

    const parsed = SettingsSchema.safeParse({
        fee_percentage: formData.get('fee_percentage'),
        verification_required: formData.get('verification_required') === 'on',
        suspension_rules: formData.get('suspension_rules') || '{}',
        email_templates: formData.get('email_templates') || '{}',
        feature_flags: formData.get('feature_flags') || '{}'
    });

    if (!parsed.success) {
        throw new Error('Invalid settings format provided.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase
        .from('system_settings')
        .update({ ...parsed.data, updated_by: null }) // In a real app, populate from auth context
        .eq('id', 1);

    if (error) {
        console.error('Update Failed:', error);
        throw new Error('Failed to save settings.');
    }

    // Globally bust the cache ensuring zero downtime updates propagate instantly
    revalidateTag('system-settings');
}
