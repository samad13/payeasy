/**
 * Core Web Vitals Tracking System
 * Monitors LCP, FID, CLS, FCP, and TTFB metrics
 */

import { onCLS, onFCP, onFID, onLCP, onTTFB, Metric } from 'web-vitals';
import {
  CoreWebVitals,
  WebVitalMetric,
  VitalConfig,
  MetricRating,
  VitalThresholds,
} from './types';

// Standard Web Vitals thresholds (Google CrUX)
const STANDARD_THRESHOLDS: VitalThresholds[] = [
  { metric: 'lcp', good: 2500, needsImprovement: 4000, poor: 4000 },
  { metric: 'fid', good: 100, needsImprovement: 300, poor: 300 },
  { metric: 'cls', good: 0.1, needsImprovement: 0.25, poor: 0.25 },
  { metric: 'fcp', good: 1800, needsImprovement: 3000, poor: 3000 },
  { metric: 'ttfb', good: 600, needsImprovement: 1800, poor: 1800 },
];

class VitalsTracker {
  private metrics: CoreWebVitals = {};
  private listeners: ((vitals: CoreWebVitals) => void)[] = [];
  private config: VitalConfig;
  private initialized = false;
  private sessionId: string;

  constructor(config: Partial<VitalConfig> = {}) {
    this.sessionId = this.generateSessionId();
    this.config = {
      enableTracking: true,
      enableAnalytics: true,
      enableAlerting: true,
      enableDashboard: true,
      sampleRate: 1,
      thresholds: STANDARD_THRESHOLDS,
      budgets: [],
      ...config,
    };
  }

  /**
   * Initialize Web Vitals tracking
   */
  init(): void {
    if (this.initialized || typeof window === 'undefined') return;

    this.initialized = true;

    // Only track based on sample rate
    if (Math.random() > this.config.sampleRate) return;

    this.attachMetricListeners();
  }

  /**
   * Attach listeners to web-vitals library
   */
  private attachMetricListeners(): void {
    onLCP((metric: Metric) => this.handleMetric('lcp', metric));
    onFID((metric: Metric) => this.handleMetric('fid', metric));
    onCLS((metric: Metric) => this.handleMetric('cls', metric));
    onFCP((metric: Metric) => this.handleMetric('fcp', metric));
    onTTFB((metric: Metric) => this.handleMetric('ttfb', metric));
  }

  /**
   * Handle individual metric updates
   */
  private handleMetric(name: string, metric: Metric): void {
    const vital: WebVitalMetric = {
      name,
      value: metric.value,
      unit: name === 'cls' ? 'score' : 'ms',
      timestamp: Date.now(),
      pageUrl: typeof window !== 'undefined' ? window.location.pathname : '',
      sessionId: this.sessionId,
    };

    this.metrics[name as keyof CoreWebVitals] = vital;
    this.notifyListeners();
  }

  /**
   * Get current metrics
   */
  getMetrics(): CoreWebVitals {
    return { ...this.metrics };
  }

  /**
   * Rate metric against thresholds
   */
  rateMetric(metricName: string, value: number): MetricRating {
    const threshold = this.config.thresholds.find(t => t.metric === metricName);
    if (!threshold) {
      return {
        metric: metricName,
        value,
        rating: 'poor',
        threshold: 0,
      };
    }

    const rating: 'good' | 'needsimprovement' | 'poor' =
      value <= threshold.good
        ? 'good'
        : value <= threshold.needsImprovement
          ? 'needsimprovement'
          : 'poor';

    return {
      metric: metricName,
      value,
      rating,
      threshold: threshold.good,
    };
  }

  /**
   * Subscribe to metric updates
   */
  subscribe(callback: (vitals: CoreWebVitals) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all subscribers of metric updates
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getMetrics()));
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    [key: string]: { value: number; rating: string };
  } {
    const summary: { [key: string]: { value: number; rating: string } } = {};

    Object.entries(this.metrics).forEach(([key, metric]) => {
      if (metric) {
        const rating = this.rateMetric(key, metric.value);
        summary[key] = {
          value: metric.value,
          rating: rating.rating,
        };
      }
    });

    return summary;
  }

  /**
   * Clear collected metrics
   */
  clear(): void {
    this.metrics = {};
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VitalConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): VitalConfig {
    return { ...this.config };
  }
}

// Singleton instance
let trackerInstance: VitalsTracker | null = null;

/**
 * Get or create singleton tracker instance
 */
export function getVitalsTracker(config?: Partial<VitalConfig>): VitalsTracker {
  if (!trackerInstance) {
    trackerInstance = new VitalsTracker(config);
  }
  return trackerInstance;
}

export { VitalsTracker };
