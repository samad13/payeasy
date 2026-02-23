/**
 * Security scanning types and interfaces
 */

export interface ScanConfig {
  enabled: boolean;
  schedule: string; // Cron expression
  severity: 'critical' | 'high' | 'medium' | 'low' | 'all';
  autoCreatePR: boolean;
  autoMerge: boolean;
  notifyOnDeploy: boolean;
}

export interface ScannerConfig {
  name: string;
  enabled: boolean;
  priority: number;
  timeout: number; // Milliseconds
}

export interface AlertConfig {
  email: boolean;
  slack: boolean;
  github: boolean;
  webhook?: string;
  criticalOnly?: boolean;
}

export interface SLAConfig {
  critical: number; // Hours to patch
  high: number;
  medium: number;
  low: number;
}

export interface SecurityScanConfig {
  scans: Record<string, ScanConfig>;
  scanners: Record<string, ScannerConfig>;
  alerts: AlertConfig;
  sla: SLAConfig;
  excludePatterns?: string[];
  includePatterns?: string[];
}

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface VulnerabilityReport {
  timestamp: Date;
  scanDuration: number; // Milliseconds
  totalFindings: number;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  errorCount: number;
  falsePositives: number;
}

export interface ComplianceStatus {
  cveFixed: number;
  cvePending: number;
  slaCompliant: boolean;
  lastAudit: Date;
}

export type ScanSource =
  | 'dependabot'
  | 'snyk'
  | 'codeql'
  | 'semgrep'
  | 'trivy'
  | 'owasp-zap'
  | 'nuclei'
  | 'license-scanner'
  | 'secrets-scanner';

export interface ScanExecution {
  id: string;
  source: ScanSource;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  findingsCount: number;
  errorMessage?: string;
}

export interface PatchStatus {
  available: boolean;
  version?: string;
  released?: Date;
  tested: boolean;
  releaseNotes?: string;
}

export interface VulnerabilityFix {
  vulnerability: {
    id: string;
    severity: SeverityLevel;
  };
  patch: PatchStatus;
  deployed?: boolean;
  deployedAt?: Date;
}

export type NotificationChannel = 'email' | 'slack' | 'github' | 'webhook';

export interface NotificationConfig {
  channel: NotificationChannel;
  enabled: boolean;
  recipients?: string[];
  webhookUrl?: string;
  template?: string;
}

export interface ScanResult {
  id: string;
  timestamp: Date;
  source: ScanSource;
  vulnerabilities: Array<{
    id: string;
    severity: SeverityLevel;
    description: string;
    component: string;
    cveId?: string;
  }>;
  passed: boolean;
}
