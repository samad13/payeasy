-- migration: 020_data_retention_cleanup.sql
-- Create tables for job execution tracking and data retention policies

-- 1. Job Executions Table
-- Tracks all cleanup job runs for monitoring and auditing
CREATE TABLE IF NOT EXISTS public.job_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    result JSONB,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_job_executions_job_name 
    ON public.job_executions(job_name);

CREATE INDEX IF NOT EXISTS idx_job_executions_status 
    ON public.job_executions(status);

CREATE INDEX IF NOT EXISTS idx_job_executions_created_at 
    ON public.job_executions(created_at DESC);

-- 2. Retention Policies Table
-- Defines retention rules for different data types
CREATE TABLE IF NOT EXISTS public.retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name VARCHAR(255) UNIQUE NOT NULL,
    retention_days INTEGER NOT NULL CHECK (retention_days > 0),
    batch_size INTEGER NOT NULL DEFAULT 1000 CHECK (batch_size > 0),
    enabled BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default retention policies
INSERT INTO public.retention_policies (policy_name, retention_days, batch_size, enabled, description)
VALUES 
    ('audit_logs', 365, 1000, true, 'Archive audit logs older than 1 year'),
    ('soft_deleted', 90, 1000, true, 'Permanently delete soft-deleted records after 90 days'),
    ('expired_sessions', 7, 1000, true, 'Remove expired session records'),
    ('old_conversations', 180, 1000, true, 'Archive inactive conversations after 6 months'),
    ('anonymize_deleted_users', 30, 1000, true, 'Anonymize deleted user data after 30 days'),
    ('backup_cleanup', 30, 1000, true, 'Remove backup files older than 30 days')
ON CONFLICT (policy_name) DO NOTHING;

-- 3. Archived Data Table
-- Reference table for archived records
CREATE TABLE IF NOT EXISTS public.archived_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_table VARCHAR(255) NOT NULL,
    record_id UUID NOT NULL,
    data JSONB NOT NULL,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient archival queries
CREATE INDEX IF NOT EXISTS idx_archived_data_source_table 
    ON public.archived_data(source_table);

CREATE INDEX IF NOT EXISTS idx_archived_data_archived_at 
    ON public.archived_data(archived_at DESC);

-- 4. Enable RLS for sensitive tables
ALTER TABLE public.job_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_data ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies - Only admin/service role can access
CREATE POLICY "Only service role can view job executions"
    ON public.job_executions FOR SELECT
    USING ((auth.jwt() ->> 'role') = 'service_role' OR (auth.jwt() ->> 'email' IN (SELECT email FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true')));

CREATE POLICY "Only service role can insert job executions"
    ON public.job_executions FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Only service role can view policies"
    ON public.retention_policies FOR SELECT
    USING ((auth.jwt() ->> 'role') = 'service_role');

CREATE POLICY "Only service role can manage archived data"
    ON public.archived_data FOR ALL
    USING ((auth.jwt() ->> 'role') = 'service_role');

-- 6. Helper function to clean up old job execution records
-- Purpose: Keep job_executions table from growing unbounded
CREATE OR REPLACE FUNCTION cleanup_old_job_executions(retention_days INTEGER DEFAULT 90)
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.job_executions
    WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Helper function to update conversation archived_at timestamp
-- Purpose: Track archive status for conversations
CREATE OR REPLACE FUNCTION mark_conversation_archived(conv_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.conversations
    SET archived_at = NOW()
    WHERE id = conv_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Helper function to verify retention policy compliance
-- Purpose: Check if data is within retention limits
CREATE OR REPLACE FUNCTION check_retention_compliance()
RETURNS TABLE(policy_name VARCHAR, status VARCHAR, records_affected INTEGER) AS $$
DECLARE
    v_policy RECORD;
    v_count INTEGER;
    v_cutoff_date TIMESTAMPTZ;
BEGIN
    FOR v_policy IN SELECT * FROM public.retention_policies WHERE enabled = true LOOP
        v_cutoff_date := NOW() - (v_policy.retention_days || ' days')::INTERVAL;
        
        CASE v_policy.policy_name
            WHEN 'audit_logs' THEN
                SELECT COUNT(*) INTO v_count FROM public.audit_logs 
                WHERE created_at < v_cutoff_date;
            WHEN 'soft_deleted' THEN
                SELECT COUNT(*) INTO v_count FROM public.messages 
                WHERE deleted_at IS NOT NULL AND deleted_at < v_cutoff_date;
            WHEN 'old_conversations' THEN
                SELECT COUNT(*) INTO v_count FROM public.conversations 
                WHERE updated_at < v_cutoff_date;
        END CASE;
        
        RETURN QUERY SELECT 
            v_policy.policy_name,
            CASE WHEN v_count > 0 THEN 'needs-cleanup' ELSE 'compliant' END,
            COALESCE(v_count, 0);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to prevent manual updates to job_executions
CREATE OR REPLACE FUNCTION prevent_job_execution_updates()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'Job executions records are immutable. Create a new record instead.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_job_executions_updates
    BEFORE UPDATE ON public.job_executions
    FOR EACH ROW
    EXECUTE FUNCTION prevent_job_execution_updates();

-- Verification queries (optional, for manual testing)
-- SELECT * FROM retention_policies;
-- SELECT COUNT(*) FROM job_executions;
-- SELECT * FROM check_retention_compliance();
