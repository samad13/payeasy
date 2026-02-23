/**
 * Web Vitals Monitoring Dashboard
 * Central orchestrator for all web vitals monitoring
 */

import { getVitalsTracker } from './vitals';
import { getAnalytics, setupMetricsRecording } from './analytics';
import { BudgetManager } from './budgets';
import { AlertManager } from './alerts';
import { TrendAnalyzer } from './trends';
import { ReportGenerator } from './reports';
import {
  VitalConfig,
  CoreWebVitals,
  DashboardMetrics,
  PerformanceAlert,
  PerformanceReport,
  MetricTrend,
} from './types';

class PerformanceMonitor {
  private tracker = getVitalsTracker();
  private analytics = getAnalytics();
  private budgetManager: BudgetManager;
  private alertManager: AlertManager;
  private trendAnalyzer = new TrendAnalyzer();
  private reportGenerator = new ReportGenerator();
  private initialized = false;
  private updateCallbacks: ((metrics: DashboardMetrics) => void)[] = [];
  private alertCallbacks: ((alert: PerformanceAlert) => void)[] = [];

  constructor(config?: Partial<VitalConfig>) {
    this.budgetManager = new BudgetManager(config?.budgets, config?.thresholds);
    this.alertManager = new AlertManager({
      enableCritical: true,
      enableWarnings: true,
      enableInfo: config?.enableDashboard !== false,
    });
  }

  /**
   * Initialize monitoring system
   */
  init(config?: Partial<VitalConfig>): void {
    if (this.initialized) return;
    this.initialized = true;

    // Update configuration
    if (config) {
      this.tracker.updateConfig(config);
      this.budgetManager.setBudgets(config.budgets || []);
      if (config.thresholds) {
        this.budgetManager.setThresholds(config.thresholds);
      }
    }

    // Setup metrics recording
    setupMetricsRecording(config);

    // Setup tracker subscription
    this.tracker.subscribe(metrics => {
      this.handleMetricsUpdate(metrics);
    });

    // Setup analytics recording
    this.tracker.subscribe(metrics => {
      this.analytics.record(metrics, this.tracker.getSessionId());
    });

    // Setup alert monitoring
    this.tracker.subscribe(metrics => {
      const thresholds = this.budgetManager.getThresholds();
      const alerts = this.alertManager.checkMetrics(metrics, thresholds);
      alerts.forEach(alert => this.notifyAlertCallbacks(alert));
    });

    // Setup budget monitoring
    this.tracker.subscribe(metrics => {
      const budgetStatuses = this.budgetManager.checkBudgets(metrics);
      budgetStatuses.forEach(status => {
        if (!status.pass && status.violation) {
          console.warn(`Budget violation: ${status.metric}`, status.violation);
        }
      });
    });
  }

  /**
   * Handle metrics update
   */
  private handleMetricsUpdate(metrics: CoreWebVitals): void {
    // Record for trend analysis
    Object.entries(metrics).forEach(([key, metric]) => {
      if (metric) {
        this.trendAnalyzer.recordMetric(key, metric.value);
      }
    });

    // Notify dashboard subscribers
    this.notifyUpdateCallbacks(this.getDashboardMetrics());
  }

  /**
   * Get current dashboard metrics
   */
  getDashboardMetrics(): DashboardMetrics {
    const metrics = this.tracker.getMetrics();
    const budgetStatuses = this.budgetManager.checkBudgets(metrics);

    return {
      currentMetrics: metrics,
      avgMetrics: this.calculateAverages(metrics),
      trends: this.getTrends(),
      alerts: this.alertManager.getAlerts(),
      budgetStatus: Object.fromEntries(budgetStatuses.map(s => [s.metric, s.pass])),
      lastUpdated: Date.now(),
    };
  }

  /**
   * Calculate metric averages
   */
  private calculateAverages(metrics: CoreWebVitals): { [key: string]: number } {
    const avgs: { [key: string]: number } = {};

    Object.entries(metrics).forEach(([key, metric]) => {
      if (metric) {
        avgs[key] = metric.value;
      }
    });

    return avgs;
  }

  /**
   * Get current trends
   */
  private getTrends(): MetricTrend[] {
    const trends: MetricTrend[] = [];
    ['lcp', 'fid', 'cls', 'fcp', 'ttfb'].forEach(metric => {
      const trend = this.trendAnalyzer.analyzeTrend(metric);
      if (trend) {
        trends.push(trend);
        this.trendAnalyzer.addTrendSnapshot(metric, trend);
      }
    });
    return trends;
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const metrics = this.tracker.getMetrics();
    const budgetStatuses = this.budgetManager.checkBudgets(metrics);
    const budgetMap = Object.fromEntries(budgetStatuses.map(s => [s.metric, s.pass]));
    const alerts = this.alertManager.getAlerts();
    const trends = this.getTrends();

    return this.reportGenerator.generate(metrics, budgetMap, alerts, trends, undefined, {
      includeAlerts: true,
      includeTrends: true,
      includeRecommendations: true,
    });
  }

  /**
   * Subscribe to dashboard updates
   */
  onUpdate(callback: (metrics: DashboardMetrics) => void): () => void {
    this.updateCallbacks.push(callback);
    return () => {
      this.updateCallbacks = this.updateCallbacks.filter(c => c !== callback);
    };
  }

  /**
   * Subscribe to alerts
   */
  onAlert(callback: (alert: PerformanceAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      this.alertCallbacks = this.alertCallbacks.filter(c => c !== callback);
    };
  }

  /**
   * Notify update callbacks
   */
  private notifyUpdateCallbacks(metrics: DashboardMetrics): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('Dashboard update error:', error);
      }
    });
  }

  /**
   * Notify alert callbacks
   */
  private notifyAlertCallbacks(alert: PerformanceAlert): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Alert callback error:', error);
      }
    });
  }

  /**
   * Get budget manager
   */
  getBudgetManager(): BudgetManager {
    return this.budgetManager;
  }

  /**
   * Get alert manager
   */
  getAlertManager(): AlertManager {
    return this.alertManager;
  }

  /**
   * Get trend analyzer
   */
  getTrendAnalyzer(): TrendAnalyzer {
    return this.trendAnalyzer;
  }

  /**
   * Get report generator
   */
  getReportGenerator(): ReportGenerator {
    return this.reportGenerator;
  }

  /**
   * Destroy monitor and cleanup
   */
  destroy(): void {
    this.analytics.destroy();
    this.updateCallbacks = [];
    this.alertCallbacks = [];
  }
}

let monitorInstance: PerformanceMonitor | null = null;

/**
 * Initialize or get performance monitor
 */
export function initPerformanceMonitor(config?: Partial<VitalConfig>): PerformanceMonitor {
  if (!monitorInstance) {
    monitorInstance = new PerformanceMonitor(config);
    monitorInstance.init(config);
  }
  return monitorInstance;
}

/**
 * Get performance monitor instance
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!monitorInstance) {
    monitorInstance = new PerformanceMonitor();
    monitorInstance.init();
  }
  return monitorInstance;
}

export { PerformanceMonitor };
