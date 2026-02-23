/**
 * Web Vitals Analytics Integration
 * Sends metrics to analytics endpoints for aggregation and reporting
 */

import { CoreWebVitals, WebVitalMetric, VitalConfig } from './types';
import { getVitalsTracker } from './vitals';

interface AnalyticsPayload {
  sessionId: string;
  metrics: CoreWebVitals;
  pageUrl: string;
  userAgent: string;
  timestamp: number;
  environment: 'development' | 'staging' | 'production';
}

class AnalyticsService {
  private endpoint: string;
  private enabled: boolean;
  private queue: AnalyticsPayload[] = [];
  private flushInterval: number;
  private flushTimer: NodeJS.Timeout | null = null;
  private batchSize = 10;

  constructor(endpoint?: string, flushInterval: number = 30000) {
    this.endpoint = endpoint || '/api/analytics/vitals';
    this.enabled = typeof window !== 'undefined';
    this.flushInterval = flushInterval;

    if (this.enabled) {
      this.startFlushTimer();
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  /**
   * Record metrics to analytics
   */
  record(metrics: CoreWebVitals, sessionId: string): void {
    if (!this.enabled) return;

    const payload: AnalyticsPayload = {
      sessionId,
      metrics,
      pageUrl: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      environment: this.getEnvironment(),
    };

    this.queue.push(payload);

    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush queued metrics to server
   */
  async flush(): Promise<void> {
    if (!this.enabled || this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch }),
        keepalive: true,
      });
    } catch (error) {
      // Re-queue on failure
      this.queue.unshift(...batch);
      console.error('Analytics flush failed:', error);
    }
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
  }

  /**
   * Stop flush timer
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Get current environment
   */
  private getEnvironment(): 'development' | 'staging' | 'production' {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      return 'production';
    }
    return window?.location?.hostname?.includes('staging') ? 'staging' : 'development';
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled && typeof window !== 'undefined';
    if (enabled && !this.flushTimer) {
      this.startFlushTimer();
    } else if (!enabled) {
      this.stopFlushTimer();
    }
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Destroy service and flush remaining data
   */
  destroy(): void {
    this.stopFlushTimer();
    this.flush();
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }
}

let analyticsService: AnalyticsService | null = null;

/**
 * Initialize analytics service
 */
export function initAnalytics(endpoint?: string, flushInterval?: number): AnalyticsService {
  if (!analyticsService) {
    analyticsService = new AnalyticsService(endpoint, flushInterval);
  }
  return analyticsService;
}

/**
 * Get analytics service instance
 */
export function getAnalytics(): AnalyticsService {
  if (!analyticsService) {
    analyticsService = new AnalyticsService();
  }
  return analyticsService;
}

/**
 * Setup automatic metrics recording
 */
export function setupMetricsRecording(config?: Partial<VitalConfig>): void {
  if (typeof window === 'undefined') return;

  const tracker = getVitalsTracker(config);
  const analytics = getAnalytics();

  tracker.init();
  tracker.subscribe(metrics => {
    analytics.record(metrics, tracker.getSessionId());
  });
}

export { AnalyticsService };
