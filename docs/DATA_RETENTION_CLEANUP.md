# Data Retention & Cleanup Policies

Comprehensive data lifecycle management for PayEasy. This document outlines retention policies, cleanup operations, archival strategies, and compliance procedures.

## Overview

The data retention and cleanup system automatically manages data lifecycle to:
- **Maintain compliance** with GDPR and privacy regulations
- **Optimize storage** by archiving and deleting old data
- **Protect user privacy** through anonymization
- **Preserve audit trails** for security and compliance
- **Ensure data integrity** with transactional cleanup

## Architecture

### Core Components

1. **Cleanup Engine** (`lib/jobs/cleanup.ts`)
   - Execution of retention policies
   - Data archival and deletion logic
   - User anonymization procedures
   - Backup management

2. **Job Scheduler** (`lib/jobs/scheduler.ts`)
   - Cron-based job execution
   - Retry logic with exponential backoff
   - Failure alerts and notifications
   - Execution history tracking

3. **Configuration** (`lib/jobs/config.ts`)
   - Policy definitions
   - Retention periods
   - Feature flags
   - Performance tuning

4. **API Endpoints** (`app/api/admin/cleanup/route.ts`)
   - Manual cleanup trigger
   - Status monitoring
   - Policy management

## Retention Policies

### 1. Audit Logs (365 days)
**Purpose**: Maintain compliance trail while managing storage

- **Retention**: 1 year
- **Action**: Delete records older than 1 year
- **Batch Size**: 1,000 records
- **Impact**: Reduces storage while preserving recent compliance history
- **Immutability**: Logs are immutable; no updates allowed

**Compliance**: GDPR Article 5, SOC 2 Type II

```typescript
// Archive audit logs for long-term storage if needed
// Or delete permanently after retention period
const result = await cleanupAuditLogs(365);
```

### 2. Soft-Deleted Records (90 days)
**Purpose**: Permanent deletion of soft-deleted data after recovery window

- **Retention**: 90 days recovery period
- **Action**: Permanently delete soft-deleted records
- **Affected Tables**: `messages`, `conversations`
- **Recovery**: Allows users to request recovery within 90 days
- **Batch Size**: 1,000 records

**Implementation**:
```typescript
// Automatic cleanup of soft-deleted data
const result = await cleanupSoftDeletedRecords(90);
```

### 3. Expired Sessions (7 days)
**Purpose**: Remove stale session tokens and data

- **Retention**: 7 days
- **Action**: Delete expired session records
- **Source**: Redis/Supabase sessions
- **Batch Size**: 5,000 records
- **Security**: Prevents session replay attacks

### 4. Old Conversations (180 days)
**Purpose**: Archive inactive conversations for storage optimization

- **Retention**: 6 months inactivity
- **Action**: Mark as archived or delete
- **Threshold**: Last message or activity > 180 days
- **Batch Size**: 1,000 records
- **Reversibility**: Can be restored from archives

### 5. User Anonymization (30 days)
**Purpose**: Anonymize personal data of deleted user accounts

- **Retention**: 30-day grace period after deletion
- **Action**: Hash email, username, remove bio
- **Preserves**: User ID, transaction history (GDPR compliance)
- **Audit Trail**: Kept intact for compliance
- **Batch Size**: 500 records

**Configuration**:
```typescript
const anonymizationConfig = {
  preserveAuditTrail: true,
  hashEmail: true,
  anonymizeUsername: true,
  anonymizeBio: true,
};

const result = await anonymizeDeletedUsers(30, anonymizationConfig);
```

### 6. Backup Cleanup (30 days)
**Purpose**: Remove old backup files after retention period

- **Retention**: 30 days
- **Action**: Delete backup files
- **Storage**: Supabase Storage bucket
- **Compression**: Enabled to reduce size
- **Encryption**: Enabled for backups
- **Batch Size**: 100 files

## Scheduled Jobs

### Daily Cleanup (2 AM UTC)
**Frequency**: Every day at 2:00 AM UTC  
**Duration**: ~5-30 minutes depending on data volume  
**Operations**:
- Soft-delete cleanup
- Session cleanup
- Audit log cleanup

```bash
cron: 0 2 * * *
```

### Weekly Archive (3 AM Sunday UTC)
**Frequency**: Every Sunday at 3:00 AM UTC  
**Duration**: ~10-60 minutes  
**Operations**:
- Old conversation archival
- Audit log archival

```bash
cron: 0 3 * * 0
```

### Monthly Anonymization (4 AM 1st of month UTC)
**Frequency**: 1st of every month at 4:00 AM UTC  
**Duration**: ~5-20 minutes  
**Operations**:
- User data anonymization
- Deletion record cleanup

```bash
cron: 0 4 1 * *
```

## Setting Up Scheduled Jobs

### Option 1: pg_cron (PostgreSQL Native)

```sql
-- Install pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily cleanup at 2 AM UTC
SELECT cron.schedule('daily-cleanup', '0 2 * * *', 'SELECT cleanup_all_policies()');

-- Weekly archive at 3 AM Sunday UTC
SELECT cron.schedule('weekly-archive', '0 3 * * 0', 'SELECT archive_old_data()');

-- Monthly anonymize at 4 AM 1st UTC
SELECT cron.schedule('monthly-anonymize', '0 4 1 * *', 'SELECT anonymize_deleted_users()');
```

### Option 2: Vercel Cron (Serverless)

Create `app/api/cron/cleanup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { runDailyCleanup, runWeeklyArchive, runMonthlyAnonymize } from '@/lib/jobs';

export async function GET(request: NextRequest) {
  // Verify Vercel cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const job = request.nextUrl.searchParams.get('job');

  switch (job) {
    case 'daily':
      await runDailyCleanup();
      break;
    case 'weekly':
      await runWeeklyArchive();
      break;
    case 'monthly':
      await runMonthlyAnonymize();
      break;
  }

  return NextResponse.json({ success: true });
}
```

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup?job=daily",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/cleanup?job=weekly",
      "schedule": "0 3 * * 0"
    },
    {
      "path": "/api/cron/cleanup?job=monthly",
      "schedule": "0 4 1 * *"
    }
  ]
}
```

### Option 3: External Scheduler (node-cron)

```typescript
import cron from 'node-cron';
import { runDailyCleanup, runWeeklyArchive, runMonthlyAnonymize } from '@/lib/jobs';

// Daily cleanup at 2 AM UTC
cron.schedule('0 2 * * *', runDailyCleanup);

// Weekly archive at 3 AM Sunday UTC
cron.schedule('0 3 * * 0', runWeeklyArchive);

// Monthly anonymize at 4 AM 1st of month UTC
cron.schedule('0 4 1 * *', runMonthlyAnonymize);
```

## Usage

### Manual Cleanup Trigger

```typescript
import { forceRunCleanup, executeCleanupPolicy } from '@/lib/jobs';

// Run all policies
const results = await forceRunCleanup();

// Run specific policy
const result = await executeCleanupPolicy('audit_logs');
```

### API Endpoint

```bash
# Trigger all cleanup policies
curl -X POST http://localhost:3000/api/admin/cleanup \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'

# Get cleanup history
curl http://localhost:3000/api/admin/cleanup?endpoint=history \
  -H "Authorization: Bearer <admin-token>"

# Get cleanup statistics
curl http://localhost:3000/api/admin/cleanup?endpoint=stats \
  -H "Authorization: Bearer <admin-token>"

# Get retention policies
curl http://localhost:3000/api/admin/cleanup?endpoint=policies \
  -H "Authorization: Bearer <admin-token>"
```

### Monitoring & Alerts

```typescript
import { getCleanupStats, getJobExecutionHistory } from '@/lib/jobs';

// Get statistics
const stats = await getCleanupStats();
console.log(`Total jobs: ${stats.totalJobsRun}`);
console.log(`Successful: ${stats.successfulJobs}`);
console.log(`Failed: ${stats.failedJobs}`);
console.log(`Records deleted: ${stats.totalRecordsDeleted}`);
console.log(`Records anonymized: ${stats.totalRecordsAnonymized}`);

// Get recent execution history
const history = await getJobExecutionHistory('daily_cleanup', 10);
history.forEach(execution => {
  console.log(`${execution.jobName}: ${execution.status}`);
  if (execution.result) {
    console.log(`  Duration: ${execution.result.duration}ms`);
    console.log(`  Deleted: ${execution.result.deletedCount}`);
  }
});
```

## Database Schema

### job_executions Table

Tracks all cleanup job executions for monitoring and audit.

```sql
CREATE TABLE job_executions (
  id UUID PRIMARY KEY,
  job_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ
);
```

### retention_policies Table

Stores configurable retention policies.

```sql
CREATE TABLE retention_policies (
  id UUID PRIMARY KEY,
  policy_name VARCHAR(255) UNIQUE,
  retention_days INTEGER,
  batch_size INTEGER,
  enabled BOOLEAN,
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### archived_data Table

Stores archived records for long-term retention.

```sql
CREATE TABLE archived_data (
  id UUID PRIMARY KEY,
  source_table VARCHAR(255),
  record_id UUID,
  data JSONB,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

## Performance Considerations

### Batch Processing
- Default batch size: 1,000 records per operation
- Larger batches for sessions (5,000)
- Smaller batches for anonymization (500)
- Adjustable via configuration

### Rate Limiting
- 100ms delay between batch operations
- Prevents database overload
- Configurable in `config.ts`

### Indexing
All cleanup operations use indexed fields:
- `created_at` for time-based filtering
- `deleted_at` for soft-delete filtering
- `updated_at` for activity tracking

### Timeouts
- Default job timeout: 5 minutes
- Handled gracefully with partial cleanup
- Results logged for recovery

## Security & Compliance

### GDPR Compliance
- **Right to be Forgotten**: Data deleted after retention period
- **Data Minimization**: Old data archived and removed
- **Audit Trails**: Preserved for compliance (1 year)
- **User Consent**: Anonymization respects deletion requests

### Data Protection
- **Encryption**: Backups encrypted at rest
- **Access Control**: Admin-only access via RLS
- **Immutability**: Audit logs cannot be modified
- **Audit Trail**: All cleanup operations logged

### Failure Handling
- **Retry Logic**: Up to 3 retries with exponential backoff
- **Alerts**: Failure notifications sent to admins
- **Logging**: All operations logged for audit
- **Partial Success**: Partial deletions allowed with error reporting

## Troubleshooting

### Job Execution Failed

```typescript
// Check recent job executions
const history = await getJobExecutionHistory('daily_cleanup', 5);
const failed = history.filter(h => h.status === 'failed');

failed.forEach(job => {
  console.error(`Job failed: ${job.error}`);
});
```

### High Cleanup Duration

**Causes**: Large batch size, database load, slow network

**Solutions**:
1. Reduce batch size in `config.ts`
2. Increase cleanup delay between batches
3. Run during off-peak hours
4. Add database indexes

### Storage Still High After Cleanup

**Causes**: Other data growing faster, incomplete archival

**Solutions**:
1. Check cleanup stats: `getCleanupStats()`
2. Verify policies are enabled
3. Check for manual data creation
4. Adjust retention periods if appropriate

## Future Enhancements

- [ ] Data warehouse integration for long-term archival
- [ ] Automated backup to cold storage (S3 Glacier)
- [ ] Machine learning-based retention optimization
- [ ] Real-time cleanup progress monitoring
- [ ] Advanced compliance reporting
- [ ] Custom retention rules per user/org
- [ ] SFTP export for external archival

## References

- [GDPR Article 5 - Data Protection](https://gdpr-info.eu/art-5-gdpr/)
- [SOC 2 Audit Logging Requirements](https://www.aicpa.org/soc2)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [Supabase Storage Lifecycle](https://supabase.com/docs/guides/storage/managing-uploads)

## Support

For issues or questions:
1. Check this documentation
2. Review job execution history
3. Check application logs
4. Open an issue on GitHub with cleanup logs

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Status**: Production Ready
