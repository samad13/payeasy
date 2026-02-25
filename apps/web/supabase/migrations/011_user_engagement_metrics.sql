-- 011_user_engagement_metrics.sql
-- Optimized SQL functions for user engagement metrics

-- 1. DAU/MAU and Stickiness
CREATE OR REPLACE FUNCTION public.get_engagement_metrics(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS JSONB AS $$
DECLARE
  dau FLOAT;
  mau FLOAT;
  avg_duration FLOAT;
BEGIN
  -- DAU (Average Daily Active Users in range)
  SELECT AVG(daily_count) INTO dau
  FROM (
    SELECT COUNT(DISTINCT user_id) as daily_count
    FROM (
      SELECT user_id, date_trunc('day', viewed_at) as day FROM public.user_view_history
      UNION
      SELECT actor_id, date_trunc('day', created_at) FROM public.audit_logs
    ) activities
    WHERE day >= start_date AND day <= end_date
    GROUP BY day
  ) daily_stats;

  -- MAU (Unique Active Users in range - simplified as unique users in the period)
  SELECT COUNT(DISTINCT user_id) INTO mau
  FROM (
    SELECT user_id FROM public.user_view_history WHERE viewed_at >= start_date AND viewed_at <= end_date
    UNION
    SELECT actor_id FROM public.audit_logs WHERE created_at >= start_date AND created_at <= end_date
  ) m_activities;

  -- Avg Session Duration (events within 30m gaps)
  SELECT AVG(session_duration) INTO avg_duration
  FROM (
    SELECT 
      user_id,
      SUM(duration_sec) as session_duration
    FROM (
      SELECT 
        user_id,
        EXTRACT(EPOCH FROM (viewed_at - LAG(viewed_at) OVER (PARTITION BY user_id ORDER BY viewed_at))) as gap_sec,
        EXTRACT(EPOCH FROM (viewed_at - LAG(viewed_at) OVER (PARTITION BY user_id ORDER BY viewed_at))) as duration_sec
      FROM public.user_view_history
      WHERE viewed_at >= start_date AND viewed_at <= end_date
    ) t
    WHERE gap_sec < 1800 -- 30 minutes
    GROUP BY user_id, date_trunc('day', viewed_at)
  ) sessions;

  RETURN jsonb_build_object(
    'dau', COALESCE(dau, 0),
    'mau', COALESCE(mau, 0),
    'stickiness', CASE WHEN mau > 0 THEN (dau / mau) ELSE 0 END,
    'avg_session_duration', COALESCE(avg_duration, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Cohort Retention
CREATE OR REPLACE FUNCTION public.get_cohort_retention(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    WITH user_activities AS (
      SELECT user_id, date_trunc('week', viewed_at) AS activity_week FROM public.user_view_history
      UNION
      SELECT actor_id AS user_id, date_trunc('week', created_at) AS activity_week FROM public.audit_logs
    ),
    user_cohorts AS (
      SELECT id AS user_id, date_trunc('week', created_at) AS cohort_week 
      FROM public.users 
      WHERE created_at >= start_date AND created_at <= end_date
    ),
    cohort_sizes AS (
      SELECT cohort_week, COUNT(DISTINCT user_id) as total_users
      FROM user_cohorts
      GROUP BY 1
    ),
    retention_counts AS (
      SELECT 
        c.cohort_week,
        EXTRACT(DAY FROM (activity_week - cohort_week)) / 7 AS week_index,
        COUNT(DISTINCT c.user_id) AS active_users
      FROM user_cohorts c
      JOIN user_activities a ON c.user_id = a.user_id
      WHERE activity_week >= cohort_week
      GROUP BY 1, 2
    )
    SELECT jsonb_agg(row_to_json(t))
    FROM (
      SELECT 
        r.cohort_week,
        s.total_users,
        r.week_index,
        r.active_users,
        (r.active_users::FLOAT / s.total_users) as retention_rate
      FROM retention_counts r
      JOIN cohort_sizes s ON r.cohort_week = s.cohort_week
      ORDER BY r.cohort_week, r.week_index
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Feature Adoption
CREATE OR REPLACE FUNCTION public.get_feature_adoption(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_object_agg(action, usage_count)
    FROM (
      SELECT action, COUNT(*) as usage_count
      FROM public.audit_logs
      WHERE created_at >= start_date AND created_at <= end_date
      GROUP BY action
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
