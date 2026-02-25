import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

export interface SystemSettings {
    id: number;
    fee_percentage: number;
    verification_required: boolean;
    suspension_rules: Record<string, any>;
    email_templates: Record<string, string>;
    feature_flags: Record<string, boolean>;
    updated_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const getSupabase = () => createClient(supabaseUrl, supabaseKey);

/**
 * Fetches the global system configuration from the database.
 * Aggressively cached at the Next.js Edge level avoiding active DB connections on reads.
 */
export const getSystemSettings = unstable_cache(
    async (): Promise<SystemSettings | null> => {
        if (!supabaseUrl || !supabaseKey) return null;

        // Always fetch ID=1 as it's our seeded singleton row
        const { data, error } = await getSupabase()
            .from('system_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error || !data) {
            console.error('Failed to load system settings:', error?.message);
            return null;
        }
        return data as SystemSettings;
    },
    ['system-settings'],
    { tags: ['system-settings'], revalidate: 3600 } // Keep cache hot for an hour minimum, will be manually busted on edits
);
