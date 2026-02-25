import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Engagement Metrics Service
 * Provides highly optimized database aggregations for user interaction analytics.
 * Uses stored procedures for maximum performance.
 */
export const EngagementService = {
    /**
     * Fetch core engagement metrics: DAU, MAU, Stickiness, and Avg Session Duration.
     */
    async getCoreMetrics(startDate: string, endDate: string) {
        const supabase = createAdminClient();
        const { data, error } = await supabase.rpc('get_engagement_metrics', {
            start_date: startDate,
            end_date: endDate,
        });

        if (error) throw new Error(`Failed to fetch core metrics: ${error.message}`);
        return data;
    },

    /**
     * Fetch cohort retention matrix.
     */
    async getCohortRetention(startDate: string, endDate: string) {
        const supabase = createAdminClient();
        const { data, error } = await supabase.rpc('get_cohort_retention', {
            start_date: startDate,
            end_date: endDate,
        });

        if (error) throw new Error(`Failed to fetch cohort retention: ${error.message}`);
        return data;
    },

    /**
     * Fetch feature adoption metrics based on audit logs.
     */
    async getFeatureAdoption(startDate: string, endDate: string) {
        const supabase = createAdminClient();
        const { data, error } = await supabase.rpc('get_feature_adoption', {
            start_date: startDate,
            end_date: endDate,
        });

        if (error) throw new Error(`Failed to fetch feature adoption: ${error.message}`);
        return data;
    },

    /**
     * Aggregated engagement report.
     */
    async getEngagementReport(startDate: string, endDate: string) {
        const [core, retention, adoption] = await Promise.all([
            this.getCoreMetrics(startDate, endDate),
            this.getCohortRetention(startDate, endDate),
            this.getFeatureAdoption(startDate, endDate),
        ]);

        return {
            period: { startDate, endDate },
            core,
            retention,
            adoption,
        };
    },
};
