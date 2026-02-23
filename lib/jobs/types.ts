/**
 * Job configuration and types for data retention and cleanup operations.
 * Defines policies, execution results, and job scheduling parameters.
 */

export type RetentionPolicy = 'audit_logs' | 'soft_deleted' | 'expired_sessions' | 'old_conversations' | 'anonymize_deleted_users' | 'backup_cleanup';

export interface RetentionConfig {
  policyName: RetentionPolicy;
  retentionDays: number;
  batchSize: number;
  enabled: boolean;
  description: string;
}

export interface CleanupResult {
  policy: RetentionPolicy;
  deletedCount: number;
  archivedCount: number;
  anonymizedCount: number;
  duration: number; // milliseconds
  status: 'success' | 'failed' | 'partial';
  error?: string;
  timestamp: Date;
}

export interface JobExecution {
  id: string;
  jobName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  result?: CleanupResult;
  error?: string;
}

export interface ScheduleConfig {
  jobName: string;
  cronExpression: string;
  enabled: boolean;
  timezone?: string;
  maxConcurrent?: number;
  retryOnFailure?: boolean;
  retryCount?: number;
}

export interface AnonymizationConfig {
  preserveAuditTrail: boolean;
  hashEmail: boolean;
  anonymizeUsername: boolean;
  anonymizeBio: boolean;
}

export interface BackupConfig {
  retentionDays: number;
  storageLocation: string;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}
