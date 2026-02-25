-- Create error groups table
CREATE TABLE IF NOT EXISTS public.error_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint TEXT UNIQUE NOT NULL,
    message TEXT NOT NULL,
    name TEXT NOT NULL,
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    count INTEGER DEFAULT 1,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create errors table
CREATE TABLE IF NOT EXISTS public.errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.error_groups(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    stack TEXT,
    context JSONB DEFAULT '{}'::jsonb,
    severity TEXT DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'info', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    url TEXT,
    user_id TEXT
);

-- Create alert rules table
CREATE TABLE IF NOT EXISTS public.alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    condition_type TEXT NOT NULL CHECK (condition_type IN ('threshold', 'new_error', 'critical')),
    threshold_count INTEGER,
    time_window_minutes INTEGER,
    channel TEXT NOT NULL CHECK (channel IN ('slack', 'email', 'webhook')),
    channel_webhook_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create alerts log table
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES public.alert_rules(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.error_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notified BOOLEAN DEFAULT FALSE,
    error_message TEXT
);

-- Enable RLS
ALTER TABLE public.error_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view errors (admin role check can be added if exists)
CREATE POLICY "Enable read access for authenticated users" ON public.error_groups
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON public.errors
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for anyone" ON public.errors
    FOR INSERT WITH CHECK (true);

-- Create function to handle error ingestion and grouping
CREATE OR REPLACE FUNCTION public.ingest_error()
RETURNS TRIGGER AS $$
DECLARE
    v_group_id UUID;
BEGIN
    -- Try to find an existing group based on fingerprint
    -- Fingerprint should be generated on the client or by the capture utility
    -- If no fingerprint is provided, we use the message hash as a fallback
    IF NEW.context->>'fingerprint' IS NOT NULL THEN
        INSERT INTO public.error_groups (fingerprint, message, name, last_seen_at, count)
        VALUES (NEW.context->>'fingerprint', NEW.message, COALESCE(NEW.context->>'name', 'Error'), NOW(), 1)
        ON CONFLICT (fingerprint) DO UPDATE SET
            last_seen_at = NOW(),
            count = error_groups.count + 1,
            status = CASE WHEN error_groups.status = 'resolved' THEN 'open' ELSE error_groups.status END
        RETURNING id INTO v_group_id;
    ELSE
        -- Fallback: use message as fingerprint if none provided
        INSERT INTO public.error_groups (fingerprint, message, name, last_seen_at, count)
        VALUES (md5(NEW.message), NEW.message, COALESCE(NEW.context->>'name', 'Error'), NOW(), 1)
        ON CONFLICT (fingerprint) DO UPDATE SET
            last_seen_at = NOW(),
            count = error_groups.count + 1
        RETURNING id INTO v_group_id;
    END IF;

    NEW.group_id := v_group_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to group errors before insertion
CREATE TRIGGER trigger_ingest_error
BEFORE INSERT ON public.errors
FOR EACH ROW EXECUTE FUNCTION public.ingest_error();

-- Rule Evaluation View (Helper for the alert engine)
CREATE OR REPLACE VIEW public.active_rule_violations AS
SELECT 
    ar.id AS rule_id,
    eg.id AS group_id,
    eg.message,
    eg.count AS total_count,
    COUNT(e.id) AS window_count
FROM 
    public.alert_rules ar
JOIN 
    public.error_groups eg ON eg.status = 'open'
LEFT JOIN 
    public.errors e ON e.group_id = eg.id AND e.created_at > (NOW() - (ar.time_window_minutes || ' minutes')::interval)
WHERE 
    ar.active = TRUE
    AND ar.condition_type = 'threshold'
GROUP BY 
    ar.id, eg.id, eg.message, eg.count
HAVING 
    COUNT(e.id) >= ar.threshold_count;
