import type {
  BalanceEvolutionPoint,
  CashFlowPoint,
  DashboardMetrics,
  DistributionPoint,
  MetricWithVariation,
  NormalizedBalancePoint,
  NormalizedCashFlowPoint,
  NormalizedDistributionPoint,
  NormalizedMetric,
  NormalizedMetrics
} from "../types/dashboard";

export function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeMetric(metric: MetricWithVariation): NormalizedMetric {
  return {
    value: toNumber(metric.value),
    previousValue: toNumber(metric.previous_value),
    changePercent: metric.change_percent === null ? null : toNumber(metric.change_percent)
  };
}

export function normalizeMetrics(metrics: DashboardMetrics): NormalizedMetrics {
  return {
    balance: normalizeMetric(metrics.balance),
    income: normalizeMetric(metrics.income),
    expenses: normalizeMetric(metrics.expenses),
    netSavings: normalizeMetric(metrics.net_savings),
    savingsPercentage: normalizeMetric(metrics.savings_percentage)
  };
}

export function normalizeBalancePoints(
  points: BalanceEvolutionPoint[]
): NormalizedBalancePoint[] {
  return points.map((point) => ({
    month: point.month,
    balance: toNumber(point.balance)
  }));
}

export function normalizeCashFlowPoints(points: CashFlowPoint[]): NormalizedCashFlowPoint[] {
  return points.map((point) => ({
    month: point.month,
    income: toNumber(point.income),
    expenses: toNumber(point.expenses),
    netSavings: toNumber(point.net_savings)
  }));
}

export function normalizeDistributionPoints(
  points: DistributionPoint[]
): NormalizedDistributionPoint[] {
  return points.map((point) => ({
    categoryId: point.category_id,
    categoryName: point.category_name,
    type: point.type,
    amount: toNumber(point.amount),
    percentage: toNumber(point.percentage)
  }));
}
