/**
 * Web Vitals Performance Monitoring Types
 * Defines metrics, budgets, alerts, and reporting structures
 */

export interface WebVitalMetric {
  name: string;
  value: number;
  unit: 'ms' | 'score';
  timestamp: number;
  pageUrl?: string;
  sessionId?: string;
}

export interface CoreWebVitals {
  lcp?: WebVitalMetric;  // Largest Contentful Paint
  fid?: WebVitalMetric;  // First Input Delay
  cls?: WebVitalMetric;  // Cumulative Layout Shift
  fcp?: WebVitalMetric;  // First Contentful Paint
  ttfb?: WebVitalMetric; // Time to First Byte
}

export interface VitalThresholds {
  metric: 'lcp' | 'fid' | 'cls' | 'fcp' | 'ttfb';
  good: number;
  needsImprovement: number;
  poor: number;
}

export interface PerformanceBudget {
  metric: string;
  limit: number;
  unit: 'ms' | 'score';
  severity: 'warning' | 'error';
}

export interface MetricRating {
  metric: string;
  value: number;
  rating: 'good' | 'needsimprovement' | 'poor';
  threshold: number;
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  triggeredAt: number;
  pageUrl: string;
}

export interface MetricTrend {
  date: string;
  metric: string;
  average: number;
  p50: number;
  p75: number;
  p95: number;
  p99: number;
  sampleSize: number;
}

export interface PerformanceReport {
  generatedAt: number;
  period: 'daily' | 'weekly' | 'monthly';
  metrics: {
    [key: string]: {
      current: number;
      previous: number;
      change: number;
      percentChange: number;
    };
  };
  budgetStatus: {
    metric: string;
    status: 'pass' | 'fail';
    value: number;
    limit: number;
  }[];
  alerts: PerformanceAlert[];
  trends: MetricTrend[];
  recommendations: string[];
}

export interface VitalConfig {
  enableTracking: boolean;
  enableAnalytics: boolean;
  enableAlerting: boolean;
  enableDashboard: boolean;
  sampleRate: number; // 0-1
  reportingUrl?: string;
  budgets: PerformanceBudget[];
  thresholds: VitalThresholds[];
}

export interface DashboardMetrics {
  currentMetrics: CoreWebVitals;
  avgMetrics: {
    [key: string]: number;
  };
  trends: MetricTrend[];
  alerts: PerformanceAlert[];
  budgetStatus: {
    [key: string]: boolean;
  };
  lastUpdated: number;
}
