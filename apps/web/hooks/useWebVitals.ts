/**
 * React Hook for Web Vitals Monitoring
 * Provides easy integration of performance monitoring in components
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { initPerformanceMonitor, getPerformanceMonitor } from '@/lib/performance/monitor';
import { DashboardMetrics, PerformanceAlert, VitalConfig } from '@/lib/performance/types';

/**
 * Hook to use performance monitoring
 */
export function useWebVitals(config?: Partial<VitalConfig>) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const monitor = initPerformanceMonitor(config);
    setLoading(false);

    // Subscribe to updates
    const unsubscribeUpdate = monitor.onUpdate(setMetrics);
    const unsubscribeAlert = monitor.onAlert(alert => {
      setAlerts(prev => [...prev, alert]);
    });

    // Get initial metrics
    setMetrics(monitor.getDashboardMetrics());

    return () => {
      unsubscribeUpdate();
      unsubscribeAlert();
    };
  }, [config]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const generateReport = useCallback(() => {
    return getPerformanceMonitor().generateReport();
  }, []);

  return {
    metrics,
    alerts,
    loading,
    clearAlerts,
    generateReport,
  };
}

/**
 * Hook to monitor specific metrics
 */
export function useMetricMonitoring(metricNames: string[] = ['lcp', 'fid', 'cls', 'fcp']) {
  const [metricValues, setMetricValues] = useState<{
    [key: string]: number;
  }>({});

  const monitor = getPerformanceMonitor();

  useEffect(() => {
    const unsubscribe = monitor.onUpdate(dashboardMetrics => {
      const values: { [key: string]: number } = {};

      metricNames.forEach(name => {
        const metric = dashboardMetrics.currentMetrics[name as keyof typeof dashboardMetrics.currentMetrics];
        if (metric) {
          values[name] = metric.value;
        }
      });

      setMetricValues(values);
    });

    return unsubscribe;
  }, [monitor, metricNames]);

  return metricValues;
}

/**
 * Hook to monitor alerts
 */
export function usePerformanceAlerts() {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  const monitor = getPerformanceMonitor();

  useEffect(() => {
    const unsubscribe = monitor.onAlert(alert => {
      setAlerts(prev => {
        // Avoid duplicate alerts
        if (prev.some(a => a.id === alert.id)) return prev;
        return [...prev, alert];
      });
    });

    return unsubscribe;
  }, [monitor]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  return {
    alerts,
    clearAlerts,
    dismissAlert,
    criticalAlerts: alerts.filter(a => a.severity === 'critical'),
    warningAlerts: alerts.filter(a => a.severity === 'warning'),
  };
}

/**
 * Hook to monitor budget compliance
 */
export function useBudgetCompliance() {
  const [compliance, setCompliance] = useState<number>(100);

  const monitor = getPerformanceMonitor();

  useEffect(() => {
    const unsubscribe = monitor.onUpdate(dashboardMetrics => {
      const budgetStatuses = Object.values(dashboardMetrics.budgetStatus);
      if (budgetStatuses.length === 0) {
        setCompliance(100);
        return;
      }

      const passed = budgetStatuses.filter(Boolean).length;
      setCompliance((passed / budgetStatuses.length) * 100);
    });

    return unsubscribe;
  }, [monitor]);

  return {
    compliance,
    isBudgetMet: compliance === 100,
    budgetStatus: getPerformanceMonitor().getBudgetManager(),
  };
}

/**
 * Hook to get performance trends
 */
export function usePerformanceTrends() {
  const [trends, setTrends] = useState<any[]>([]);

  const monitor = getPerformanceMonitor();

  useEffect(() => {
    const unsubscribe = monitor.onUpdate(dashboardMetrics => {
      setTrends(dashboardMetrics.trends);
    });

    return unsubscribe;
  }, [monitor]);

  return {
    trends,
    trendAnalyzer: monitor.getTrendAnalyzer(),
  };
}
