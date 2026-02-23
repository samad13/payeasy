/**
 * Web Vitals Trend Analysis
 * Tracks metrics over time and identifies patterns
 */

import { MetricTrend, CoreWebVitals } from './types';

interface Percentiles {
  p50: number;
  p75: number;
  p95: number;
  p99: number;
}

class TrendAnalyzer {
  private trends: Map<string, MetricTrend[]> = new Map();
  private rawMetrics: Map<string, number[]> = new Map();
  private maxDataPoints = 1000;

  /**
   * Record metric value for trend analysis
   */
  recordMetric(metric: string, value: number): void {
    if (!this.rawMetrics.has(metric)) {
      this.rawMetrics.set(metric, []);
    }

    const values = this.rawMetrics.get(metric)!;
    values.push(value);

    // Keep only recent data
    if (values.length > this.maxDataPoints) {
      values.shift();
    }
  }

  /**
   * Analyze trends for a metric
   */
  analyzeTrend(metric: string, period: 'hourly' | 'daily' | 'weekly' = 'daily'): MetricTrend | null {
    const values = this.rawMetrics.get(metric);
    if (!values || values.length === 0) return null;

    const average = this.calculateAverage(values);
    const percentiles = this.calculatePercentiles(values);

    return {
      date: new Date().toISOString().split('T')[0],
      metric,
      average,
      p50: percentiles.p50,
      p75: percentiles.p75,
      p95: percentiles.p95,
      p99: percentiles.p99,
      sampleSize: values.length,
    };
  }

  /**
   * Calculate average of values
   */
  private calculateAverage(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Calculate percentiles
   */
  private calculatePercentiles(values: number[]): Percentiles {
    const sorted = [...values].sort((a, b) => a - b);
    return {
      p50: this.getPercentile(sorted, 50),
      p75: this.getPercentile(sorted, 75),
      p95: this.getPercentile(sorted, 95),
      p99: this.getPercentile(sorted, 99),
    };
  }

  /**
   * Get percentile value
   */
  private getPercentile(sorted: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get trend history for metric
   */
  getTrendHistory(metric: string): MetricTrend[] {
    return this.trends.get(metric) || [];
  }

  /**
   * Add trend snapshot
   */
  addTrendSnapshot(metric: string, trend: MetricTrend): void {
    if (!this.trends.has(metric)) {
      this.trends.set(metric, []);
    }

    const trends = this.trends.get(metric)!;
    trends.push(trend);

    // Keep only recent snapshots
    if (trends.length > 100) {
      trends.shift();
    }
  }

  /**
   * Calculate trend direction
   */
  calculateTrendDirection(metric: string): 'improving' | 'degrading' | 'stable' {
    const trends = this.getTrendHistory(metric);
    if (trends.length < 2) return 'stable';

    const recent = trends[trends.length - 1].average;
    const previous = trends[trends.length - 2].average;
    const change = recent - previous;
    const percentChange = (change / previous) * 100;

    // Consider 5% change as threshold
    if (percentChange > 5) return 'degrading';
    if (percentChange < -5) return 'improving';
    return 'stable';
  }

  /**
   * Get trend summary
   */
  getSummary(metrics: string[]): {
    [key: string]: {
      current: number;
      trend: 'improving' | 'degrading' | 'stable';
      percentChange: number;
    };
  } {
    const summary: {
      [key: string]: {
        current: number;
        trend: 'improving' | 'degrading' | 'stable';
        percentChange: number;
      };
    } = {};

    metrics.forEach(metric => {
      const values = this.rawMetrics.get(metric);
      if (!values || values.length < 2) return;

      const current = values[values.length - 1];
      const previous = values[values.length - 2];
      const percentChange = ((current - previous) / previous) * 100;

      summary[metric] = {
        current,
        trend: this.calculateTrendDirection(metric),
        percentChange,
      };
    });

    return summary;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.trends.clear();
    this.rawMetrics.clear();
  }

  /**
   * Get data points count for metric
   */
  getDataPointCount(metric: string): number {
    return this.rawMetrics.get(metric)?.length || 0;
  }

  /**
   * Export trends as JSON
   */
  export(): {
    trends: { [key: string]: MetricTrend[] };
    rawMetrics: { [key: string]: number[] };
  } {
    const trends: { [key: string]: MetricTrend[] } = {};
    const rawMetrics: { [key: string]: number[] } = {};

    this.trends.forEach((value, key) => {
      trends[key] = [...value];
    });

    this.rawMetrics.forEach((value, key) => {
      rawMetrics[key] = [...value];
    });

    return { trends, rawMetrics };
  }
}

export { TrendAnalyzer };
