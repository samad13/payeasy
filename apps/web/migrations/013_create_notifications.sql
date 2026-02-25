-- ============================================================
-- Migration: 012_create_notifications.sql
-- Description: Notification system tables, indexes, RLS & triggers
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- ENUM: notification type
-- ──────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'message',
      'payment',
      'listing',
      'system',
      'favorite',
      'agreement'
    );
  END IF;
END$$;

-- ──────────────────────────────────────────────────────────────
-- TABLE: notifications
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type          notification_type NOT NULL DEFAULT 'system',
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  action_url    TEXT,
  action_label  TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at       TIMESTAMPTZ
);

-- ──────────────────────────────────────────────────────────────
-- TABLE: notification_preferences
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_preferences (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  message_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  payment_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  listing_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  system_enabled          BOOLEAN NOT NULL DEFAULT TRUE,
  favorite_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  agreement_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  sound_enabled           BOOLEAN NOT NULL DEFAULT FALSE,
  email_enabled           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read)
  WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON notifications(created_at DESC);

-- ──────────────────────────────────────────────────────────────
-- TRIGGER: auto-update updated_at on notification_preferences
-- ──────────────────────────────────────────────────────────────
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications: users can read their own
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Notifications: service role / backend creates them
CREATE POLICY "notifications_insert_own"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Notifications: users can update (mark read) their own
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications: users can delete their own
CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Preferences: full self-management
CREATE POLICY "notification_preferences_manage_own"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- REALTIME: enable for live notification delivery
-- ──────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
