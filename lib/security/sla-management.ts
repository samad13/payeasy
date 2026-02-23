/**
 * SLA (Service Level Agreement) Management for Security Vulnerability Patches
 * Tracks patch application timelines and enforces response requirements
 */

export interface Vulnerability {
  id: string;
  cveId?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedPackage: string;
  affectedVersion: string;
  description: string;
  discoveredAt: Date;
  patchAvailableAt: Date;
  patchedAt?: Date;
  publishedAt?: Date;
}

export interface SLAConfig {
  critical: number; // hours
  high: number; // hours
  medium: number; // hours
  low: number; // hours
}

export const DEFAULT_SLA: SLAConfig = {
  critical: 24,
  high: 48,
  medium: 168, // 7 days
  low: 720, // 30 days
};

/**
 * Calculate SLA deadline for a vulnerability
 */
export function calculateSLADeadline(
  vulnerability: Vulnerability,
  slaConfig: SLAConfig = DEFAULT_SLA
): Date {
  const slaHours = slaConfig[vulnerability.severity];
  const deadline = new Date(vulnerability.discoveredAt);
  deadline.setHours(deadline.getHours() + slaHours);
  return deadline;
}

/**
 * Check if vulnerability is within SLA
 */
export function isWithinSLA(
  vulnerability: Vulnerability,
  slaConfig: SLAConfig = DEFAULT_SLA
): boolean {
  if (!vulnerability.patchedAt) {
    // Not yet patched, check against current time
    const deadline = calculateSLADeadline(vulnerability, slaConfig);
    return new Date() <= deadline;
  }

  // Check if patched within SLA
  const deadline = calculateSLADeadline(vulnerability, slaConfig);
  return vulnerability.patchedAt <= deadline;
}

/**
 * Calculate time remaining in SLA
 */
export function getTimeRemaining(
  vulnerability: Vulnerability,
  slaConfig: SLAConfig = DEFAULT_SLA
): { hoursRemaining: number; isOverdue: boolean } {
  const deadline = calculateSLADeadline(vulnerability, slaConfig);
  const now = new Date();
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  return {
    hoursRemaining: Math.max(0, hoursRemaining),
    isOverdue: hoursRemaining < 0,
  };
}

/**
 * Get SLA status for display
 */
export function getSLAStatus(
  vulnerability: Vulnerability,
  slaConfig: SLAConfig = DEFAULT_SLA
): 'met' | 'at-risk' | 'overdue' | 'patched' {
  if (vulnerability.patchedAt) {
    return isWithinSLA(vulnerability, slaConfig) ? 'patched' : 'overdue';
  }

  const { hoursRemaining, isOverdue } = getTimeRemaining(vulnerability, slaConfig);

  if (isOverdue) return 'overdue';
  if (hoursRemaining < 24) return 'at-risk'; // Less than 1 day remaining
  return 'met';
}

/**
 * Calculate SLA compliance metrics
 */
export function calculateSLACompliance(
  vulnerabilities: Vulnerability[],
  slaConfig: SLAConfig = DEFAULT_SLA
): {
  totalVulnerabilities: number;
  metSLA: number;
  overdueSLA: number;
  atRisk: number;
  complianceRate: number;
} {
  const metrics = {
    totalVulnerabilities: vulnerabilities.length,
    metSLA: 0,
    overdueSLA: 0,
    atRisk: 0,
    complianceRate: 0,
  };

  vulnerabilities.forEach(vuln => {
    const status = getSLAStatus(vuln, slaConfig);
    switch (status) {
      case 'patched':
      case 'met':
        metrics.metSLA++;
        break;
      case 'overdue':
        metrics.overdueSLA++;
        break;
      case 'at-risk':
        metrics.atRisk++;
        break;
    }
  });

  metrics.complianceRate =
    metrics.totalVulnerabilities > 0
      ? (metrics.metSLA / (metrics.metSLA + metrics.overdueSLA)) * 100
      : 100;

  return metrics;
}

/**
 * Get priority level based on SLA status
 */
export function getPriorityLevel(
  vulnerability: Vulnerability,
  slaConfig: SLAConfig = DEFAULT_SLA
): 'urgent' | 'high' | 'normal' | 'low' {
  const { hoursRemaining, isOverdue } = getTimeRemaining(vulnerability, slaConfig);

  if (isOverdue) return 'urgent';
  if (vulnerability.severity === 'critical' && hoursRemaining < 6) return 'urgent';
  if (vulnerability.severity === 'high' && hoursRemaining < 12) return 'high';
  if (vulnerability.severity === 'critical' || vulnerability.severity === 'high')
    return 'high';
  if (vulnerability.severity === 'medium') return 'normal';

  return 'low';
}

/**
 * Generate SLA violation alerts
 */
export function generateSLAAlerts(
  vulnerabilities: Vulnerability[],
  slaConfig: SLAConfig = DEFAULT_SLA
): Array<{ vulnerability: Vulnerability; alert: string; priority: string }> {
  return vulnerabilities
    .filter(vuln => !vuln.patchedAt)
    .map(vuln => {
      const status = getSLAStatus(vuln, slaConfig);
      const { hoursRemaining } = getTimeRemaining(vuln, slaConfig);
      const priority = getPriorityLevel(vuln, slaConfig);

      let alert = '';
      if (status === 'overdue') {
        alert = `❌ OVERDUE: ${vuln.affectedPackage} vulnerability is past SLA deadline`;
      } else if (status === 'at-risk') {
        alert = `⚠️ AT RISK: ${vuln.affectedPackage} will breach SLA in ${Math.round(hoursRemaining)} hours`;
      }

      return { vulnerability: vuln, alert, priority };
    })
    .filter(item => item.alert !== '');
}

/**
 * Format SLA deadline for display
 */
export function formatSLADeadline(
  vulnerability: Vulnerability,
  slaConfig: SLAConfig = DEFAULT_SLA
): string {
  const deadline = calculateSLADeadline(vulnerability, slaConfig);
  return deadline.toLocaleString();
}

/**
 * Get next due vulnerabilities (sorted by deadline)
 */
export function getNextDueVulnerabilities(
  vulnerabilities: Vulnerability[],
  slaConfig: SLAConfig = DEFAULT_SLA,
  limit: number = 10
): Vulnerability[] {
  return vulnerabilities
    .filter(v => !v.patchedAt)
    .sort((a, b) => {
      const deadlineA = calculateSLADeadline(a, slaConfig);
      const deadlineB = calculateSLADeadline(b, slaConfig);
      return deadlineA.getTime() - deadlineB.getTime();
    })
    .slice(0, limit);
}

/**
 * Check if SLA response time was met
 */
export function wasSLAResponseMet(
  vulnerability: Vulnerability,
  slaConfig: SLAConfig = DEFAULT_SLA
): boolean {
  if (!vulnerability.patchedAt) {
    return false;
  }

  const timeToPatch =
    vulnerability.patchedAt.getTime() - vulnerability.discoveredAt.getTime();
  const slaHours = slaConfig[vulnerability.severity];
  const slaMilliseconds = slaHours * 60 * 60 * 1000;

  return timeToPatch <= slaMilliseconds;
}

/**
 * Generate SLA report for dashboard
 */
export function generateSLAReport(
  vulnerabilities: Vulnerability[],
  slaConfig: SLAConfig = DEFAULT_SLA
) {
  const compliance = calculateSLACompliance(vulnerabilities, slaConfig);
  const alerts = generateSLAAlerts(vulnerabilities, slaConfig);
  const nextDue = getNextDueVulnerabilities(vulnerabilities, slaConfig, 5);

  const bySeverity = {
    critical: vulnerabilities.filter(v => v.severity === 'critical'),
    high: vulnerabilities.filter(v => v.severity === 'high'),
    medium: vulnerabilities.filter(v => v.severity === 'medium'),
    low: vulnerabilities.filter(v => v.severity === 'low'),
  };

  return {
    compliance,
    alerts,
    nextDue,
    bySeverity,
    generatedAt: new Date(),
  };
}
