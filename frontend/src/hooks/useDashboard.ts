import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getBalanceEvolution,
  getCashFlow,
  getDashboardMetrics,
  getDistribution,
  getFilterOptions,
  getSavingsGoal,
  updateSavingsGoal
} from "../api/dashboard";
import type {
  AccountOption,
  DashboardFilters,
  FilterOptionsResponse,
  NormalizedBalancePoint,
  NormalizedCashFlowPoint,
  NormalizedDistributionPoint,
  NormalizedMetrics,
  NormalizedSavingsGoal,
  ResourceState,
  SavingsGoalUpdate
} from "../types/dashboard";
import {
  applyDateDefaultsIfUnchanged,
  constrainAccountToBank,
  defaultFilters,
  getAccountsForBank,
  getDefaultFilters
} from "../utils/filters";
import {
  normalizeBalancePoints,
  normalizeCashFlowPoints,
  normalizeDistributionPoints,
  normalizeMetrics,
  normalizeSavingsGoal
} from "../utils/normalize";

function loadingResource<T>(data: T | null = null): ResourceState<T> {
  return { status: "loading", data, error: null };
}

function successResource<T>(data: T): ResourceState<T> {
  return { status: "success", data, error: null };
}

function errorResource<T>(error: unknown, data: T | null = null): ResourceState<T> {
  return {
    status: "error",
    data,
    error: error instanceof Error ? error.message : "Request failed"
  };
}

async function settleResource<T>(request: Promise<T>): Promise<ResourceState<T>> {
  try {
    return successResource(await request);
  } catch (error) {
    return errorResource<T>(error);
  }
}

export function useDashboard() {
  const [filters, setFiltersState] = useState<DashboardFilters>(defaultFilters);
  const [refreshKey, setRefreshKey] = useState(0);
  const [options, setOptions] = useState<ResourceState<FilterOptionsResponse>>({
    status: "idle",
    data: null,
    error: null
  });
  const [metrics, setMetrics] = useState<ResourceState<NormalizedMetrics>>({
    status: "idle",
    data: null,
    error: null
  });
  const [balanceEvolution, setBalanceEvolution] = useState<
    ResourceState<NormalizedBalancePoint[]>
  >({ status: "idle", data: null, error: null });
  const [cashFlow, setCashFlow] = useState<ResourceState<NormalizedCashFlowPoint[]>>({
    status: "idle",
    data: null,
    error: null
  });
  const [incomeDistribution, setIncomeDistribution] = useState<
    ResourceState<NormalizedDistributionPoint[]>
  >({ status: "idle", data: null, error: null });
  const [expenseDistribution, setExpenseDistribution] = useState<
    ResourceState<NormalizedDistributionPoint[]>
  >({ status: "idle", data: null, error: null });
  const [savingsGoal, setSavingsGoal] = useState<ResourceState<NormalizedSavingsGoal | null>>({
    status: "idle",
    data: null,
    error: null
  });

  useEffect(() => {
    const controller = new AbortController();
    setOptions((current) => loadingResource(current.data));

    getFilterOptions(controller.signal)
      .then((data) => {
        setOptions(successResource(data));
        setFiltersState((current) =>
          constrainAccountToBank(applyDateDefaultsIfUnchanged(current, data), data.accounts)
        );
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setOptions(errorResource<FilterOptionsResponse>(error));
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const optionData = options.data;
    if (optionData === null) {
      return;
    }

    setFiltersState((current) => constrainAccountToBank(current, optionData.accounts));
  }, [filters.bankId, filters.accountId, options.data]);

  useEffect(() => {
    const controller = new AbortController();

    setMetrics((current) => loadingResource(current.data));
    setBalanceEvolution((current) => loadingResource(current.data));
    setCashFlow((current) => loadingResource(current.data));
    setIncomeDistribution((current) => loadingResource(current.data));
    setExpenseDistribution((current) => loadingResource(current.data));

    void Promise.all([
      settleResource(getDashboardMetrics(filters, controller.signal).then(normalizeMetrics)),
      settleResource(
        getBalanceEvolution(filters, controller.signal).then(normalizeBalancePoints)
      ),
      settleResource(getCashFlow(filters, controller.signal).then(normalizeCashFlowPoints)),
      settleResource(
        getDistribution(filters, "INCOME", controller.signal).then(normalizeDistributionPoints)
      ),
      settleResource(
        getDistribution(filters, "EXPENSE", controller.signal).then(normalizeDistributionPoints)
      )
    ]).then(([metricsResult, balanceResult, cashFlowResult, incomeResult, expenseResult]) => {
      if (!controller.signal.aborted) {
        setMetrics(metricsResult);
        setBalanceEvolution(balanceResult);
        setCashFlow(cashFlowResult);
        setIncomeDistribution(incomeResult);
        setExpenseDistribution(expenseResult);
      }
    });

    return () => controller.abort();
  }, [filters, refreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    setSavingsGoal((current) => loadingResource(current.data));

    getSavingsGoal(controller.signal)
      .then((goal) => {
        setSavingsGoal(successResource(goal === null ? null : normalizeSavingsGoal(goal)));
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setSavingsGoal(errorResource<NormalizedSavingsGoal | null>(error));
        }
      });

    return () => controller.abort();
  }, [refreshKey]);

  const availableAccounts = useMemo<AccountOption[]>(() => {
    return getAccountsForBank(options.data?.accounts ?? [], filters.bankId);
  }, [filters.bankId, options.data?.accounts]);

  const setFilters = useCallback(
    (next: Partial<DashboardFilters>) => {
      setFiltersState((current) => {
        const merged = constrainAccountToBank({ ...current, ...next }, options.data?.accounts ?? []);
        return merged;
      });
    },
    [options.data?.accounts]
  );

  const resetFilters = useCallback(() => {
    setFiltersState(getDefaultFilters(options.data));
  }, [options.data]);

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  const saveSavingsGoal = useCallback(async (payload: SavingsGoalUpdate) => {
    setSavingsGoal((current) => loadingResource(current.data));
    try {
      const goal = await updateSavingsGoal(payload);
      setSavingsGoal(successResource(normalizeSavingsGoal(goal)));
    } catch (error) {
      setSavingsGoal((current) => errorResource<NormalizedSavingsGoal | null>(error, current.data));
      throw error;
    }
  }, []);

  return {
    filters,
    setFilters,
    resetFilters,
    refresh,
    options,
    availableAccounts,
    metrics,
    balanceEvolution,
    cashFlow,
    incomeDistribution,
    expenseDistribution,
    savingsGoal,
    saveSavingsGoal
  };
}
