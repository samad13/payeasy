/**
 * Security Vulnerability Metrics & Analytics
 * Tracks vulnerability scanning results and patch effectiveness
 */

export interface VulnerabilityMetrics {
  totalDetected: number;
  byDate: Record<string, number>;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  bySource: {
    dependabot: number;
    snyk: number;
    codeql: number;
    semgrep: number;
    trivy: number;
    other: number;
  };
  byType: Record<string, number>;
}

export interface PatchMetrics {
  totalPatches: number;
  appliedPatches: number;
  pendingPatches: number;
  failedPatches: number;
  averageTimeToPatches: number; // hours
  slaComplianceRate: number; // percentage
}

export interface ScannerMetrics {
  name: string;
  lastScan: Date;
  findingsCount: number;
  scanDuration: number; // milliseconds
  falsePositiveRate: number; // percentage
  coverage: number; // percentage
}

export interface SecurityMetrics {
  vulnerabilities: VulnerabilityMetrics;
  patches: PatchMetrics;
  scanners: ScannerMetrics[];
  timestamp: Date;
}

/**
 * Initialize empty metrics object
 */
export function initializeMetrics(): SecurityMetrics {
  return {
    vulnerabilities: {
      totalDetected: 0,
      byDate: {},
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      bySource: {
        dependabot: 0,
        snyk: 0,
        codeql: 0,
        semgrep: 0,
        trivy: 0,
        other: 0,
      },
      byType: {},
    },
    patches: {
      totalPatches: 0,
      appliedPatches: 0,
      pendingPatches: 0,
      failedPatches: 0,
      averageTimeToPatches: 0,
      slaComplianceRate: 0,
    },
    scanners: [],
    timestamp: new Date(),
  };
}

/**
 * Record vulnerability detection
 */
export function recordVulnerability(
  metrics: SecurityMetrics,
  severity: 'critical' | 'high' | 'medium' | 'low',
  source: string,
  type: string,
  date: Date = new Date()
): void {
  metrics.vulnerabilities.totalDetected++;
  metrics.vulnerabilities.bySeverity[severity]++;

  // Record by date
  const dateKey = date.toISOString().split('T')[0];
  metrics.vulnerabilities.byDate[dateKey] =
    (metrics.vulnerabilities.byDate[dateKey] || 0) + 1;

  // Record by source
  const sourceKey = source.toLowerCase();
  if (sourceKey in metrics.vulnerabilities.bySource) {
    (metrics.vulnerabilities.bySource as any)[sourceKey]++;
  } else {
    metrics.vulnerabilities.bySource.other++;
  }

  // Record by type
  metrics.vulnerabilities.byType[type] =
    (metrics.vulnerabilities.byType[type] || 0) + 1;
}

/**
 * Update patch metrics
 */
export function updatePatchMetrics(
  metrics: SecurityMetrics,
  totalPatches: number,
  appliedPatches: number,
  averageTimeHours: number,
  slaComplianceRate: number
): void {
  metrics.patches.totalPatches = totalPatches;
  metrics.patches.appliedPatches = appliedPatches;
  metrics.patches.pendingPatches = totalPatches - appliedPatches;
  metrics.patches.averageTimeToPatches = averageTimeHours;
  metrics.patches.slaComplianceRate = slaComplianceRate;
}

/**
 * Record scanner result
 */
export function recordScannerResult(
  metrics: SecurityMetrics,
  scannerName: string,
  findingsCount: number,
  durationMs: number,
  falsePositiveRate: number = 0,
  coverage: number = 100
): void {
  const existingScanner = metrics.scanners.find(s => s.name === scannerName);

  if (existingScanner) {
    existingScanner.lastScan = new Date();
    existingScanner.findingsCount = findingsCount;
    existingScanner.scanDuration = durationMs;
    existingScanner.falsePositiveRate = falsePositiveRate;
    existingScanner.coverage = coverage;
  } else {
    metrics.scanners.push({
      name: scannerName,
      lastScan: new Date(),
      findingsCount,
      scanDuration: durationMs,
      falsePositiveRate,
      coverage,
    });
  }
}

/**
 * Calculate trend (month-over-month change)
 */
export function calculateTrend(
  currentMetrics: SecurityMetrics,
  previousMetrics: SecurityMetrics
): {
  vulnerabilityTrend: number; // percentage change
  slaComplianceTrend: number; // percentage change
  patchRateTrend: number; // percentage change
} {
  const vulnDiff =
    currentMetrics.vulnerabilities.totalDetected -
    previousMetrics.vulnerabilities.totalDetected;
  const vulnTrend =
    previousMetrics.vulnerabilities.totalDetected > 0
      ? (vulnDiff / previousMetrics.vulnerabilities.totalDetected) * 100
      : 0;

  const slaDiff =
    currentMetrics.patches.slaComplianceRate -
    previousMetrics.patches.slaComplianceRate;

  const patchRateCurrent =
    currentMetrics.patches.totalPatches > 0
      ? (currentMetrics.patches.appliedPatches / currentMetrics.patches.totalPatches) * 100
      : 0;

  const patchRatePrevious =
    previousMetrics.patches.totalPatches > 0
      ? (previousMetrics.patches.appliedPatches / previousMetrics.patches.totalPatches) * 100
      : 0;

  return {
    vulnerabilityTrend: vulnTrend,
    slaComplianceTrend: slaDiff,
    patchRateTrend: patchRateCurrent - patchRatePrevious,
  };
}

/**
 * Get vulnerability summary
 */
export function getVulnerabilitySummary(metrics: SecurityMetrics): string {
  const { critical, high, medium, low } = metrics.vulnerabilities.bySeverity;
  const total = metrics.vulnerabilities.totalDetected;

  return (
    `Critical: ${critical} | High: ${high} | Medium: ${medium} | Low: ${low} | ` +
    `Total: ${total}`
  );
}

/**
 * Check if metrics indicate healthy security posture
 */
export function isHealthySecurityPosture(metrics: SecurityMetrics): boolean {
  return (
    metrics.vulnerabilities.bySeverity.critical === 0 &&
    metrics.vulnerabilities.bySeverity.high <= 3 &&
    metrics.patches.slaComplianceRate >= 95 &&
    metrics.patches.appliedPatches === metrics.patches.totalPatches
  );
}

/**
 * Get metrics snapshot for reporting
 */
export function getMetricsSnapshot(metrics: SecurityMetrics): object {
  return {
    totalVulnerabilities: metrics.vulnerabilities.totalDetected,
    criticalVulnerabilities: metrics.vulnerabilities.bySeverity.critical,
    highVulnerabilities: metrics.vulnerabilities.bySeverity.high,
    mediumVulnerabilities: metrics.vulnerabilities.bySeverity.medium,
    lowVulnerabilities: metrics.vulnerabilities.bySeverity.low,
    appliedPatches: metrics.patches.appliedPatches,
    pendingPatches: metrics.patches.pendingPatches,
    slaComplianceRate: `${metrics.patches.slaComplianceRate.toFixed(2)}%`,
    averageTimeToPatches: `${metrics.patches.averageTimeToPatches.toFixed(1)}h`,
    activeScanners: metrics.scanners.length,
    lastUpdated: metrics.timestamp.toISOString(),
  };
}

/**
 * Export metrics as JSON
 */
export function exportMetricsAsJSON(metrics: SecurityMetrics): string {
  return JSON.stringify(metrics, null, 2);
}

/**
 * Export metrics as CSV
 */
export function exportMetricsAsCSV(metrics: SecurityMetrics): string {
  const lines: string[] = [];

  // Vulnerability summary
  lines.push('Vulnerability Metrics');
  lines.push('Severity,Count');
  lines.push(`Critical,${metrics.vulnerabilities.bySeverity.critical}`);
  lines.push(`High,${metrics.vulnerabilities.bySeverity.high}`);
  lines.push(`Medium,${metrics.vulnerabilities.bySeverity.medium}`);
  lines.push(`Low,${metrics.vulnerabilities.bySeverity.low}`);
  lines.push('');

  // Patch metrics
  lines.push('Patch Metrics');
  lines.push('Metric,Value');
  lines.push(`Total Patches,${metrics.patches.totalPatches}`);
  lines.push(`Applied Patches,${metrics.patches.appliedPatches}`);
  lines.push(`Pending Patches,${metrics.patches.pendingPatches}`);
  lines.push(`SLA Compliance Rate,${metrics.patches.slaComplianceRate.toFixed(2)}%`);
  lines.push('');

  // Scanner metrics
  lines.push('Scanner Metrics');
  lines.push('Scanner,Findings,Duration (ms),False Positive Rate,Coverage');
  metrics.scanners.forEach(scanner => {
    lines.push(
      `${scanner.name},${scanner.findingsCount},${scanner.scanDuration},${scanner.falsePositiveRate.toFixed(2)}%,${scanner.coverage.toFixed(2)}%`
    );
  });

  return lines.join('\n');
}

/**
 * Generate metrics report for dashboard
 */
export function generateMetricsReport(metrics: SecurityMetrics): {
  summary: string;
  healthy: boolean;
  snapshot: object;
  timestamp: string;
} {
  return {
    summary: getVulnerabilitySummary(metrics),
    healthy: isHealthySecurityPosture(metrics),
    snapshot: getMetricsSnapshot(metrics),
    timestamp: metrics.timestamp.toISOString(),
  };
}
