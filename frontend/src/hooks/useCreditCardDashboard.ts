import { useCallback, useEffect, useState } from "react";

import {
  getCreditCardCategoryDistribution,
  getCreditCardMetrics,
  getCreditCardMonthlyActivity,
  getCreditCardStatementItems
} from "../api/creditCards";
import type {
  CreditCardCategoryDistributionPoint,
  CreditCardMetrics,
  CreditCardMonthlyActivityPoint,
  CreditCardStatementItem,
  NormalizedCreditCardCategoryDistributionPoint,
  NormalizedCreditCardMetrics,
  NormalizedCreditCardMonthlyActivityPoint,
  NormalizedCreditCardStatementItem
} from "../types/creditCard";
import type { ResourceState } from "../types/dashboard";
import { toNumber } from "../utils/normalize";

function idle<T>(): ResourceState<T> {
  return { status: "idle", data: null, error: null };
}

function normalizeMetrics(metrics: CreditCardMetrics): NormalizedCreditCardMetrics {
  return {
    currentStatementBalance: toNumber(metrics.current_statement_balance),
    creditUtilization: toNumber(metrics.credit_utilization),
    availableCredit: toNumber(metrics.available_credit),
    weightedApr: toNumber(metrics.weighted_apr),
    activePlans: metrics.active_plans
  };
}

function normalizeActivity(
  points: CreditCardMonthlyActivityPoint[]
): NormalizedCreditCardMonthlyActivityPoint[] {
  return points.map((point) => ({
    month: point.month,
    spending: toNumber(point.spending),
    payments: toNumber(point.payments),
    interest: toNumber(point.interest)
  }));
}

function normalizeDistribution(
  points: CreditCardCategoryDistributionPoint[]
): NormalizedCreditCardCategoryDistributionPoint[] {
  return points.map((point) => ({
    category: point.category,
    amount: toNumber(point.amount),
    percentage: toNumber(point.percentage)
  }));
}

function normalizeItems(items: CreditCardStatementItem[]): NormalizedCreditCardStatementItem[] {
  return items.map((item) => ({
    id: item.id,
    transactionDate: item.transaction_date,
    description: item.description,
    category: item.category,
    kind: item.kind,
    amount: toNumber(item.amount),
    installmentNumber: item.installment_number,
    installmentTotal: item.installment_total,
    remainingAmount: item.remaining_amount === null ? null : toNumber(item.remaining_amount)
  }));
}

export function useCreditCardDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [metrics, setMetrics] = useState<ResourceState<NormalizedCreditCardMetrics>>(idle());
  const [activity, setActivity] = useState<
    ResourceState<NormalizedCreditCardMonthlyActivityPoint[]>
  >(idle());
  const [distribution, setDistribution] = useState<
    ResourceState<NormalizedCreditCardCategoryDistributionPoint[]>
  >(idle());
  const [items, setItems] = useState<ResourceState<NormalizedCreditCardStatementItem[]>>(idle());

  useEffect(() => {
    const controller = new AbortController();
    setMetrics((current) => ({ ...current, status: "loading", error: null }));
    setActivity((current) => ({ ...current, status: "loading", error: null }));
    setDistribution((current) => ({ ...current, status: "loading", error: null }));
    setItems((current) => ({ ...current, status: "loading", error: null }));

    void Promise.allSettled([
      getCreditCardMetrics(controller.signal).then(normalizeMetrics),
      getCreditCardMonthlyActivity(controller.signal).then(normalizeActivity),
      getCreditCardCategoryDistribution(controller.signal).then(normalizeDistribution),
      getCreditCardStatementItems(controller.signal).then(normalizeItems)
    ]).then(([metricsResult, activityResult, distributionResult, itemsResult]) => {
      if (controller.signal.aborted) {
        return;
      }
      const asResource = <T,>(result: PromiseSettledResult<T>): ResourceState<T> =>
        result.status === "fulfilled"
          ? { status: "success", data: result.value, error: null }
          : {
              status: "error",
              data: null,
              error: result.reason instanceof Error ? result.reason.message : "Request failed"
            };
      setMetrics(asResource(metricsResult));
      setActivity(asResource(activityResult));
      setDistribution(asResource(distributionResult));
      setItems(asResource(itemsResult));
    });
    return () => controller.abort();
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey((current) => current + 1), []);
  return { metrics, activity, distribution, items, refresh };
}
