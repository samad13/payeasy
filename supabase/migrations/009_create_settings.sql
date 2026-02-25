-- Create the core system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id SERIAL PRIMARY KEY,
    fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
    verification_required BOOLEAN NOT NULL DEFAULT true,
    suspension_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    email_templates JSONB NOT NULL DEFAULT '{}'::jsonb,
    feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- Seed an initial default row so we always have ID=1 to update
INSERT INTO public.system_settings (id, fee_percentage, verification_required)
VALUES (1, 5.00, true)
ON CONFLICT DO NOTHING;

-- Create the audit history table
CREATE TABLE IF NOT EXISTS public.settings_history (
    id SERIAL PRIMARY KEY,
    settings_id INTEGER REFERENCES public.system_settings(id) ON DELETE CASCADE,
    previous_state JSONB NOT NULL,
    new_state JSONB NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the trigger function to log changes automatically
CREATE OR REPLACE FUNCTION public.log_settings_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.settings_history (
        settings_id,
        previous_state,
        new_state,
        changed_by,
        changed_at
    ) VALUES (
        NEW.id,
        row_to_json(OLD)::jsonb,
        row_to_json(NEW)::jsonb,
        NEW.updated_by,
        now()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to the system_settings table for UPDATE operations
DROP TRIGGER IF EXISTS settings_audit_trigger ON public.system_settings;
CREATE TRIGGER settings_audit_trigger
    AFTER UPDATE ON public.system_settings
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION public.log_settings_change();

-- Security/RLS policies
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
CREATE POLICY "Enable read access for all users" ON public.system_settings FOR SELECT USING (true);

-- Allow Admins to manage settings
CREATE POLICY "Enable all access for admins" ON public.system_settings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Enable read access for admins on history" ON public.settings_history FOR SELECT USING (auth.role() = 'service_role');
