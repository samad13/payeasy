/**
 * Performance Alerts System
 * Monitors metrics and triggers alerts based on thresholds
 */

import { PerformanceAlert, CoreWebVitals, VitalThresholds } from './types';

type AlertHandler = (alert: PerformanceAlert) => void;

interface AlertConfig {
  enableCritical: boolean;
  enableWarnings: boolean;
  enableInfo: boolean;
  throttleMs?: number;
}

class AlertManager {
  private alerts: PerformanceAlert[] = [];
  private handlers: AlertHandler[] = [];
  private config: AlertConfig;
  private lastAlertTime: { [key: string]: number } = {};
  private alertThrottleMs = 5000; // Don't repeat same alert within 5s

  constructor(config: Partial<AlertConfig> = {}) {
    this.config = {
      enableCritical: true,
      enableWarnings: true,
      enableInfo: false,
      throttleMs: 5000,
      ...config,
    };
    this.alertThrottleMs = config.throttleMs || 5000;
  }

  /**
   * Check metrics against thresholds and trigger alerts
   */
  checkMetrics(metrics: CoreWebVitals, thresholds: VitalThresholds[]): PerformanceAlert[] {
    const triggeredAlerts: PerformanceAlert[] = [];

    thresholds.forEach(threshold => {
      const metric = metrics[threshold.metric as keyof CoreWebVitals];
      if (!metric) return;

      const value = metric.value;
      const isIssue = value > threshold.needsImprovement;
      const isCritical = value > threshold.poor;

      if (isIssue) {
        const severity = isCritical ? 'critical' : 'warning';
        const alert = this.createAlert(
          threshold.metric,
          value,
          threshold.poor,
          severity,
          metric.pageUrl || '',
        );

        if (this.shouldEmitAlert(alert)) {
          triggeredAlerts.push(alert);
          this.alerts.push(alert);
          this.lastAlertTime[alert.id] = Date.now();
          this.notifyHandlers(alert);
        }
      }
    });

    return triggeredAlerts;
  }

  /**
   * Create alert object
   */
  private createAlert(
    metric: string,
    value: number,
    threshold: number,
    severity: 'critical' | 'warning' | 'info',
    pageUrl: string,
  ): PerformanceAlert {
    const id = `${metric}-${Date.now()}`;
    const message = this.generateAlertMessage(metric, value, threshold, severity);

    return {
      id,
      metric,
      value,
      threshold,
      severity,
      message,
      triggeredAt: Date.now(),
      pageUrl,
    };
  }

  /**
   * Generate human-readable alert message
   */
  private generateAlertMessage(
    metric: string,
    value: number,
    threshold: number,
    severity: string,
  ): string {
    const exceeded = ((value - threshold) / threshold * 100).toFixed(1);
    const unit = metric === 'cls' ? '' : 'ms';
    return `${severity.toUpperCase()}: ${metric.toUpperCase()} is ${exceeded}% above threshold (${value.toFixed(2)}${unit} vs ${threshold}${unit})`;
  }

  /**
   * Check if alert should be emitted (respects throttling)
   */
  private shouldEmitAlert(alert: PerformanceAlert): boolean {
    const lastTime = this.lastAlertTime[alert.metric];
    if (!lastTime) return true;

    return Date.now() - lastTime > this.alertThrottleMs;
  }

  /**
   * Subscribe to alerts
   */
  subscribe(handler: AlertHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  /**
   * Notify all subscribers
   */
  private notifyHandlers(alert: PerformanceAlert): void {
    this.handlers.forEach(handler => {
      try {
        handler(alert);
      } catch (error) {
        console.error('Alert handler error:', error);
      }
    });
  }

  /**
   * Get all alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: 'critical' | 'warning' | 'info'): PerformanceAlert[] {
    return this.alerts.filter(a => a.severity === severity);
  }

  /**
   * Clear alerts
   */
  clearAlerts(): void {
    this.alerts = [];
    this.lastAlertTime = {};
  }

  /**
   * Get alert count
   */
  getAlertCount(): number {
    return this.alerts.length;
  }

  /**
   * Get critical alert count
   */
  getCriticalAlertCount(): number {
    return this.getAlertsBySeverity('critical').length;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.throttleMs) {
      this.alertThrottleMs = config.throttleMs;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AlertConfig {
    return { ...this.config };
  }
}

export { AlertManager };
