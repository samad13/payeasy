/**
 * Web Vitals Configuration
 * Default budgets, thresholds, and alerts configuration
 */

import { VitalConfig, PerformanceBudget, VitalThresholds } from './performance/types';

// Default performance budgets for PayEasy
export const DEFAULT_BUDGETS: PerformanceBudget[] = [
  { metric: 'lcp', limit: 2500, unit: 'ms', severity: 'warning' },
  { metric: 'fid', limit: 100, unit: 'ms', severity: 'warning' },
  { metric: 'cls', limit: 0.1, unit: 'score', severity: 'warning' },
  { metric: 'fcp', limit: 1800, unit: 'ms', severity: 'warning' },
  { metric: 'ttfb', limit: 600, unit: 'ms', severity: 'warning' },
];

// Standard Web Vitals thresholds for core metrics
export const DEFAULT_THRESHOLDS: VitalThresholds[] = [
  { metric: 'lcp', good: 2500, needsImprovement: 4000, poor: 4000 },
  { metric: 'fid', good: 100, needsImprovement: 300, poor: 300 },
  { metric: 'cls', good: 0.1, needsImprovement: 0.25, poor: 0.25 },
  { metric: 'fcp', good: 1800, needsImprovement: 3000, poor: 3000 },
  { metric: 'ttfb', good: 600, needsImprovement: 1800, poor: 1800 },
];

// Web Vitals configuration for production
export const PRODUCTION_CONFIG: VitalConfig = {
  enableTracking: true,
  enableAnalytics: true,
  enableAlerting: true,
  enableDashboard: true,
  sampleRate: 0.1, // Sample 10% of users in production
  reportingUrl: '/api/analytics/vitals',
  budgets: DEFAULT_BUDGETS,
  thresholds: DEFAULT_THRESHOLDS,
};

// Web Vitals configuration for development
export const DEVELOPMENT_CONFIG: VitalConfig = {
  enableTracking: true,
  enableAnalytics: false,
  enableAlerting: true,
  enableDashboard: true,
  sampleRate: 1, // Track all in development
  budgets: DEFAULT_BUDGETS,
  thresholds: DEFAULT_THRESHOLDS,
};

// Web Vitals configuration for staging
export const STAGING_CONFIG: VitalConfig = {
  enableTracking: true,
  enableAnalytics: true,
  enableAlerting: true,
  enableDashboard: true,
  sampleRate: 0.5, // Sample 50% in staging
  reportingUrl: '/api/analytics/vitals',
  budgets: DEFAULT_BUDGETS,
  thresholds: DEFAULT_THRESHOLDS,
};

/**
 * Get appropriate config based on environment
 */
export function getVitalsConfig(): VitalConfig {
  if (typeof process === 'undefined') {
    return PRODUCTION_CONFIG;
  }

  const env = process.env.NODE_ENV;
  if (env === 'development') {
    return DEVELOPMENT_CONFIG;
  }
  if (process.env.VERCEL_ENV === 'preview') {
    return STAGING_CONFIG;
  }
  return PRODUCTION_CONFIG;
}
