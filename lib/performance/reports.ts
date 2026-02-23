/**
 * Performance Reporting System
 * Generates comprehensive performance reports
 */

import { PerformanceReport, CoreWebVitals, PerformanceAlert, MetricTrend } from './types';

interface ReportOptions {
  includeAlerts?: boolean;
  includeTrends?: boolean;
  includeRecommendations?: boolean;
  comparePeriod?: 'previous' | 'weekAgo' | 'monthAgo';
}

class ReportGenerator {
  private reports: PerformanceReport[] = [];
  private maxReports = 100;

  /**
   * Generate comprehensive performance report
   */
  generate(
    metrics: CoreWebVitals,
    budgetStatus: { [key: string]: boolean },
    alerts: PerformanceAlert[] = [],
    trends: MetricTrend[] = [],
    previousMetrics?: CoreWebVitals,
    options: ReportOptions = {},
  ): PerformanceReport {
    const report: PerformanceReport = {
      generatedAt: Date.now(),
      period: 'daily',
      metrics: this.calculateMetricsComparison(metrics, previousMetrics),
      budgetStatus: this.calculateBudgetStatus(metrics, budgetStatus),
      alerts: options.includeAlerts !== false ? alerts : [],
      trends: options.includeTrends !== false ? trends : [],
      recommendations: options.includeRecommendations !== false ? this.generateRecommendations(metrics, alerts) : [],
    };

    this.reports.push(report);
    if (this.reports.length > this.maxReports) {
      this.reports.shift();
    }

    return report;
  }

  /**
   * Calculate metrics comparison
   */
  private calculateMetricsComparison(
    current: CoreWebVitals,
    previous?: CoreWebVitals,
  ): {
    [key: string]: {
      current: number;
      previous: number;
      change: number;
      percentChange: number;
    };
  } {
    const comparison: {
      [key: string]: {
        current: number;
        previous: number;
        change: number;
        percentChange: number;
      };
    } = {};

    Object.entries(current).forEach(([key, metric]) => {
      if (!metric) return;
      const prevValue = previous?.[key as keyof CoreWebVitals]?.value ?? metric.value;
      const change = metric.value - prevValue;
      const percentChange = (change / prevValue) * 100;

      comparison[key] = {
        current: metric.value,
        previous: prevValue,
        change,
        percentChange,
      };
    });

    return comparison;
  }

  /**
   * Calculate budget status
   */
  private calculateBudgetStatus(
    metrics: CoreWebVitals,
    budgetStatus: { [key: string]: boolean },
  ): {
    metric: string;
    status: 'pass' | 'fail';
    value: number;
    limit: number;
  }[] {
    return Object.entries(budgetStatus).map(([metric, pass]) => ({
      metric,
      status: pass ? 'pass' : 'fail',
      value: metrics[metric as keyof CoreWebVitals]?.value ?? 0,
      limit: 0, // Would come from budget config
    }));
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(metrics: CoreWebVitals, alerts: PerformanceAlert[]): string[] {
    const recommendations: string[] = [];

    // LCP recommendations
    const lcp = metrics.lcp;
    if (lcp && lcp.value > 2500) {
      recommendations.push(
        '📊 Improve LCP: Reduce server response time, optimize images, and defer non-critical CSS/JS',
      );
    }

    // FID recommendations
    const fid = metrics.fid;
    if (fid && fid.value > 100) {
      recommendations.push('⚡ Improve FID: Break up long tasks and optimize JavaScript execution');
    }

    // CLS recommendations
    const cls = metrics.cls;
    if (cls && cls.value > 0.1) {
      recommendations.push(
        '🎯 Improve CLS: Add size attributes to media, avoid inserting content above existing content',
      );
    }

    // TTFB recommendations
    const ttfb = metrics.ttfb;
    if (ttfb && ttfb.value > 600) {
      recommendations.push(
        '🌐 Improve TTFB: Upgrade hosting, enable caching, use CDN, or optimize backend',
      );
    }

    // Alert-based recommendations
    if (alerts.length > 0) {
      const criticalCount = alerts.filter(a => a.severity === 'critical').length;
      if (criticalCount > 0) {
        recommendations.push(`⚠️ ${criticalCount} critical performance issues detected - prioritize fixes`);
      }
    }

    return recommendations;
  }

  /**
   * Get report history
   */
  getHistory(): PerformanceReport[] {
    return [...this.reports];
  }

  /**
   * Get latest report
   */
  getLatest(): PerformanceReport | null {
    return this.reports[this.reports.length - 1] || null;
  }

  /**
   * Get report by date
   */
  getByDate(date: number): PerformanceReport | null {
    return this.reports.find(r => {
      const reportDate = new Date(r.generatedAt).toDateString();
      const queryDate = new Date(date).toDateString();
      return reportDate === queryDate;
    }) || null;
  }

  /**
   * Export report as JSON
   */
  exportJSON(report: PerformanceReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export report as CSV
   */
  exportCSV(report: PerformanceReport): string {
    const lines: string[] = ['Metric,Current,Previous,Change,Change %'];

    Object.entries(report.metrics).forEach(([metric, data]) => {
      lines.push(
        `${metric},${data.current.toFixed(2)},${data.previous.toFixed(2)},${data.change.toFixed(2)},${data.percentChange.toFixed(2)}%`,
      );
    });

    return lines.join('\n');
  }

  /**
   * Clear report history
   */
  clear(): void {
    this.reports = [];
  }

  /**
   * Get report count
   */
  getReportCount(): number {
    return this.reports.length;
  }
}

export { ReportGenerator };
