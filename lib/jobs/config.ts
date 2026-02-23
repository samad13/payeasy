/**
 * Data retention and cleanup policies configuration
 * Centralized configuration for retention rules and cleanup behavior
 */

import type { RetentionConfig, AnonymizationConfig, BackupConfig } from './types';

/**
 * Retention policies configuration
 * Define how long different types of data are retained before cleanup
 */
export const RETENTION_CONFIG: Record<string, RetentionConfig> = {
  audit_logs: {
    policyName: 'audit_logs',
    retentionDays: 365, // 1 year retention for compliance
    batchSize: 1000,
    enabled: true,
    description: 'Archive audit logs older than 1 year while maintaining immutability',
  },
  soft_deleted: {
    policyName: 'soft_deleted',
    retentionDays: 90, // 90 day recovery window
    batchSize: 1000,
    enabled: true,
    description: 'Permanently delete soft-deleted records after 90 days. Allows user recovery requests.',
  },
  expired_sessions: {
    policyName: 'expired_sessions',
    retentionDays: 7, // Sessions older than 1 week
    batchSize: 5000,
    enabled: true,
    description: 'Remove expired session tokens and records',
  },
  old_conversations: {
    policyName: 'old_conversations',
    retentionDays: 180, // 6 month inactivity threshold
    batchSize: 1000,
    enabled: true,
    description: 'Archive inactive conversations after 6 months of no activity',
  },
  anonymize_deleted_users: {
    policyName: 'anonymize_deleted_users',
    retentionDays: 30, // 30 day grace period before anonymization
    batchSize: 500,
    enabled: true,
    description: 'Anonymize personal data of deleted users after 30 days',
  },
  backup_cleanup: {
    policyName: 'backup_cleanup',
    retentionDays: 30, // Keep recent backups for recovery
    batchSize: 100,
    enabled: true,
    description: 'Remove old backup files beyond 30 day retention period',
  },
};

/**
 * Anonymization configuration
 * Controls how user data is anonymized during cleanup
 */
export const ANONYMIZATION_CONFIG: AnonymizationConfig = {
  preserveAuditTrail: true, // Keep audit logs for compliance
  hashEmail: true, // Hash emails with SHA-256
  anonymizeUsername: true, // Replace with hashed values
  anonymizeBio: true, // Remove bio text
};

/**
 * Backup configuration
 * Controls backup retention and management
 */
export const BACKUP_CONFIG: BackupConfig = {
  retentionDays: 30,
  storageLocation: 'backups',
  compressionEnabled: true,
  encryptionEnabled: true,
};

/**
 * Cron schedule expressions (require external scheduler like pg_cron, node-cron, etc.)
 * Format: "minute hour day-of-month month day-of-week" (cron format)
 */
export const CLEANUP_SCHEDULES = {
  daily: '0 2 * * *', // 2 AM daily UTC
  weekly: '0 3 * * 0', // 3 AM Sunday UTC
  monthly: '0 4 1 * *', // 4 AM on 1st of month UTC
} as const;

/**
 * Feature flags for cleanup operations
 */
export const CLEANUP_FEATURES = {
  enableAuditLogCleanup: true,
  enableSoftDeleteCleanup: true,
  enableSessionCleanup: true,
  enableConversationArchival: true,
  enableUserAnonymization: true,
  enableBackupCleanup: true,
  enableFailureAlerts: true,
  enableDetailedLogging: process.env.NODE_ENV === 'development',
} as const;

/**
 * Error handling configuration
 */
export const ERROR_CONFIG = {
  maxRetries: 3,
  retryBackoffMs: 1000, // Initial backoff in milliseconds
  retryBackoffMultiplier: 2, // Exponential backoff
  timeoutMs: 300000, // 5 minutes timeout per job
} as const;

/**
 * Performance tuning
 */
export const PERFORMANCE_CONFIG = {
  batchDelayMs: 100, // Delay between batch operations to avoid overwhelming DB
  maxConcurrentJobs: 1, // Single job at a time for serverless
  enableParallelBatches: false, // Set to true only for dedicated servers
} as const;

/**
 * Get retention days for a specific policy
 */
export function getRetentionDays(policy: string): number {
  const config = RETENTION_CONFIG[policy as keyof typeof RETENTION_CONFIG];
  return config?.retentionDays || 90;
}

/**
 * Check if a policy is enabled
 */
export function isPolicyEnabled(policy: string): boolean {
  const config = RETENTION_CONFIG[policy as keyof typeof RETENTION_CONFIG];
  return config?.enabled ?? false;
}

/**
 * Get all enabled policies
 */
export function getEnabledPolicies(): string[] {
  return Object.keys(RETENTION_CONFIG).filter(key =>
    isPolicyEnabled(key)
  );
}
