/**
 * Performance Budget Management
 * Enforces performance limits and tracks compliance
 */

import {
  PerformanceBudget,
  CoreWebVitals,
  WebVitalMetric,
  VitalThresholds,
} from './types';

interface BudgetViolation {
  metric: string;
  value: number;
  limit: number;
  exceeded: boolean;
  percentOver: number;
}

interface BudgetStatus {
  metric: string;
  pass: boolean;
  value?: number;
  limit: number;
  violation?: BudgetViolation;
}

class BudgetManager {
  private budgets: PerformanceBudget[];
  private thresholds: VitalThresholds[];
  private violations: BudgetViolation[] = [];

  constructor(budgets: PerformanceBudget[] = [], thresholds: VitalThresholds[] = []) {
    this.budgets = budgets;
    this.thresholds = thresholds;
  }

  /**
   * Check if metrics violate budgets
   */
  checkBudgets(metrics: CoreWebVitals): BudgetStatus[] {
    const status: BudgetStatus[] = [];

    this.budgets.forEach(budget => {
      const metric = metrics[budget.metric as keyof CoreWebVitals];
      const value = metric?.value ?? 0;
      const pass = value <= budget.limit;

      status.push({
        metric: budget.metric,
        pass,
        value,
        limit: budget.limit,
      });

      if (!pass) {
        const violation: BudgetViolation = {
          metric: budget.metric,
          value,
          limit: budget.limit,
          exceeded: true,
          percentOver: ((value - budget.limit) / budget.limit) * 100,
        };
        status[status.length - 1].violation = violation;
        this.violations.push(violation);
      }
    });

    return status;
  }

  /**
   * Get violation history
   */
  getViolations(): BudgetViolation[] {
    return [...this.violations];
  }

  /**
   * Clear violation history
   */
  clearViolations(): void {
    this.violations = [];
  }

  /**
   * Get violation count
   */
  getViolationCount(): number {
    return this.violations.length;
  }

  /**
   * Update budgets
   */
  setBudgets(budgets: PerformanceBudget[]): void {
    this.budgets = budgets;
  }

  /**
   * Get current budgets
   */
  getBudgets(): PerformanceBudget[] {
    return [...this.budgets];
  }

  /**
   * Add single budget
   */
  addBudget(budget: PerformanceBudget): void {
    this.budgets.push(budget);
  }

  /**
   * Remove budget by metric
   */
  removeBudget(metric: string): void {
    this.budgets = this.budgets.filter(b => b.metric !== metric);
  }

  /**
   * Check if all budgets are met
   */
  allBudgetsMet(metrics: CoreWebVitals): boolean {
    return this.checkBudgets(metrics).every(status => status.pass);
  }

  /**
   * Get budget compliance percentage
   */
  getCompliancePercentage(metrics: CoreWebVitals): number {
    const statuses = this.checkBudgets(metrics);
    if (statuses.length === 0) return 100;
    const passed = statuses.filter(s => s.pass).length;
    return (passed / statuses.length) * 100;
  }

  /**
   * Generate budget report
   */
  generateReport(metrics: CoreWebVitals): {
    totalBudgets: number;
    passed: number;
    failed: number;
    compliancePercentage: number;
    violations: BudgetViolation[];
  } {
    const statuses = this.checkBudgets(metrics);
    const passed = statuses.filter(s => s.pass).length;
    const failed = statuses.filter(s => !s.pass).length;

    return {
      totalBudgets: statuses.length,
      passed,
      failed,
      compliancePercentage: this.getCompliancePercentage(metrics),
      violations: this.violations,
    };
  }

  /**
   * Update thresholds
   */
  setThresholds(thresholds: VitalThresholds[]): void {
    this.thresholds = thresholds;
  }

  /**
   * Get thresholds
   */
  getThresholds(): VitalThresholds[] {
    return [...this.thresholds];
  }
}

export { BudgetManager };
