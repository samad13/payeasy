/**
 * Jobs module - Data retention and cleanup policies
 * Exports all cleanup, scheduling, and utility functions
 */

export { default as cleanup } from './cleanup';
export { default as scheduler } from './scheduler';

// Cleanup functions
export {
  cleanupAuditLogs,
  cleanupSoftDeletedRecords,
  anonymizeDeletedUsers,
  cleanupOldConversations,
  cleanupExpiredSessions,
  cleanupBackups,
  executeCleanupPolicy,
  executeAllCleanupPolicies,
  RETENTION_POLICIES,
  BATCH_SIZE,
} from './cleanup';

// Scheduler functions
export {
  runDailyCleanup,
  runWeeklyArchive,
  runMonthlyAnonymize,
  forceRunCleanup,
  getJobExecutionHistory,
  getCleanupStats,
  DEFAULT_SCHEDULES,
} from './scheduler';

// Type exports
export type {
  RetentionPolicy,
  RetentionConfig,
  CleanupResult,
  JobExecution,
  ScheduleConfig,
  AnonymizationConfig,
  BackupConfig,
} from './types';
