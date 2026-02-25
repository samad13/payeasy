/**
 * Job scheduler for data retention and cleanup operations.
 * Handles cron scheduling, execution tracking, and failure notifications.
 * Optimized for serverless environments with proper error handling.
 */

import { createClient } from '@supabase/supabase-js';
import { JobExecution, ScheduleConfig, CleanupResult, RetentionPolicy } from './types';
import { executeAllCleanupPolicies, executeCleanupPolicy } from './cleanup';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Default schedule configurations for cleanup jobs
 */
const DEFAULT_SCHEDULES: Record<string, ScheduleConfig> = {
  daily_cleanup: {
    jobName: 'daily_cleanup',
    cronExpression: '0 2 * * *', // 2 AM daily
    enabled: true,
    timezone: 'UTC',
    maxConcurrent: 1,
    retryOnFailure: true,
    retryCount: 3,
  },
  weekly_archive: {
    jobName: 'weekly_archive',
    cronExpression: '0 3 * * 0', // 3 AM Sunday
    enabled: true,
    timezone: 'UTC',
    maxConcurrent: 1,
    retryOnFailure: true,
    retryCount: 2,
  },
  monthly_anonymize: {
    jobName: 'monthly_anonymize',
    cronExpression: '0 4 1 * *', // 4 AM on the 1st
    enabled: true,
    timezone: 'UTC',
    maxConcurrent: 1,
    retryOnFailure: true,
    retryCount: 2,
  },
};

/**
 * Record job execution for audit and monitoring
 */
async function recordJobExecution(
  jobName: string,
  status: 'pending' | 'running' | 'completed' | 'failed',
  result?: CleanupResult,
  error?: string
): Promise<void> {
  try {
    const execution: JobExecution = {
      id: `${jobName}-${Date.now()}`,
      jobName,
      status,
      startedAt: new Date(),
      completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined,
      result,
      error,
    };

    // Store in job_executions table for tracking and alerting
    const { error: insertError } = await supabase.from('job_executions').insert({
      job_name: jobName,
      status,
      started_at: execution.startedAt,
      completed_at: execution.completedAt,
      result: result ? JSON.stringify(result) : null,
      error,
    });

    if (insertError) {
      console.error('Failed to record job execution:', insertError);
    }
  } catch (err) {
    console.error('Error recording job execution:', err);
  }
}

/**
 * Send alert notification for failed jobs
 */
async function sendFailureAlert(
  jobName: string,
  error: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const alertMessage = `
      Cleanup Job Failed: ${jobName}
      Error: ${error}
      Time: ${new Date().toISOString()}
      ${details ? `Details: ${JSON.stringify(details)}` : ''}
    `.trim();

    console.error(alertMessage);

    // Could integrate with email, Slack, or monitoring service here
    if (process.env.ALERT_WEBHOOK_URL) {
      await fetch(process.env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cleanup_failure',
          jobName,
          error,
          details,
          timestamp: new Date().toISOString(),
        }),
      }).catch(err => console.error('Failed to send alert:', err));
    }
  } catch (err) {
    console.error('Error sending failure alert:', err);
  }
}

/**
 * Execute a scheduled job with retry logic
 */
async function executeScheduledJob(
  jobName: string,
  config: ScheduleConfig,
  handler: () => Promise<CleanupResult[]>
): Promise<void> {
  let lastError: Error | null = null;
  let attempt = 0;
  const maxAttempts = (config.retryOnFailure ? config.retryCount : 1) || 1;

  await recordJobExecution(jobName, 'running');

  while (attempt < maxAttempts) {
    try {
      attempt++;
      const results = await handler();

      // Check if any policy failed
      const failedPolicies = results.filter(r => r.status === 'failed');
      if (failedPolicies.length > 0) {
        const errorMsg = failedPolicies.map(f => `${f.policy}: ${f.error}`).join('; ');
        throw new Error(`Some policies failed: ${errorMsg}`);
      }

      // Record successful execution
      await recordJobExecution(jobName, 'completed');
      console.log(`Job ${jobName} completed successfully`, { results });
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Job ${jobName} attempt ${attempt}/${maxAttempts} failed:`, lastError.message);

      // Wait before retry
      if (attempt < maxAttempts) {
        const backoffMs = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  // All retries exhausted
  if (lastError) {
    await recordJobExecution(jobName, 'failed', undefined, lastError.message);
    await sendFailureAlert(jobName, lastError.message, {
      attempts: maxAttempts,
      config,
    });
  }
}

/**
 * Daily cleanup job - runs all cleanup policies
 */
export async function runDailyCleanup(): Promise<void> {
  await executeScheduledJob(
    'daily_cleanup',
    DEFAULT_SCHEDULES.daily_cleanup,
    executeAllCleanupPolicies
  );
}

/**
 * Weekly archive job - focuses on conversation and log archival
 */
export async function runWeeklyArchive(): Promise<void> {
  const handler = async (): Promise<CleanupResult[]> => {
    const policies: RetentionPolicy[] = ['old_conversations', 'audit_logs'];
    const results: CleanupResult[] = [];

    for (const policy of policies) {
      results.push(await executeCleanupPolicy(policy));
    }

    return results;
  };

  await executeScheduledJob('weekly_archive', DEFAULT_SCHEDULES.weekly_archive, handler);
}

/**
 * Monthly anonymization job - anonymizes deleted user data
 */
export async function runMonthlyAnonymize(): Promise<void> {
  const handler = async (): Promise<CleanupResult[]> => {
    const result = await executeCleanupPolicy('anonymize_deleted_users', {
      preserveAuditTrail: true,
      hashEmail: true,
      anonymizeUsername: true,
      anonymizeBio: true,
    });
    return [result];
  };

  await executeScheduledJob('monthly_anonymize', DEFAULT_SCHEDULES.monthly_anonymize, handler);
}

/**
 * Force run a cleanup job immediately (admin function)
 */
export async function forceRunCleanup(policy?: RetentionPolicy): Promise<CleanupResult | CleanupResult[]> {
  try {
    if (policy) {
      return await executeCleanupPolicy(policy);
    }
    return await executeAllCleanupPolicies();
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    await sendFailureAlert('manual-cleanup', error);
    throw err;
  }
}

/**
 * Get job execution history
 */
export async function getJobExecutionHistory(
  jobName?: string,
  limit: number = 50
): Promise<JobExecution[]> {
  try {
    let query = supabase
      .from('job_executions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (jobName) {
      query = query.eq('job_name', jobName);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id || `${row.job_name}-${Date.parse(row.started_at)}`,
      jobName: row.job_name,
      status: row.status,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      result: row.result ? JSON.parse(row.result) : undefined,
      error: row.error,
    }));
  } catch (err) {
    console.error('Error fetching job execution history:', err);
    return [];
  }
}

/**
 * Get cleanup statistics
 */
export async function getCleanupStats(): Promise<{
  totalJobsRun: number;
  successfulJobs: number;
  failedJobs: number;
  totalRecordsDeleted: number;
  totalRecordsAnonymized: number;
  lastRunAt?: Date;
}> {
  try {
    const { data, error } = await supabase
      .from('job_executions')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) throw error;

    const rows = data || [];
    const stats = {
      totalJobsRun: rows.length,
      successfulJobs: rows.filter((r: any) => r.status === 'completed').length,
      failedJobs: rows.filter((r: any) => r.status === 'failed').length,
      totalRecordsDeleted: 0,
      totalRecordsAnonymized: 0,
      lastRunAt: rows.length > 0 ? new Date(rows[0].started_at) : undefined,
    };

    rows.forEach((row: any) => {
      if (row.result) {
        const result = JSON.parse(row.result);
        stats.totalRecordsDeleted += result.deletedCount || 0;
        stats.totalRecordsAnonymized += result.anonymizedCount || 0;
      }
    });

    return stats;
  } catch (err) {
    console.error('Error fetching cleanup stats:', err);
    return {
      totalJobsRun: 0,
      successfulJobs: 0,
      failedJobs: 0,
      totalRecordsDeleted: 0,
      totalRecordsAnonymized: 0,
    };
  }
}

export { DEFAULT_SCHEDULES };
